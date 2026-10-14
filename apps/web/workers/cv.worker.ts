import {
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type Category,
  type Landmark,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import {
  createPredictionStabilizer,
  frameFeatures,
  primaryPerson,
  type Point2,
} from '@lakon/cv-core'
import type * as OrtNamespace from 'onnxruntime-web'
import type { InferenceSession } from 'onnxruntime-web'
import {
  ORT_WASM_BASE,
  type Backend,
  type ClassifierBackend,
  type ClassifierManifest,
  type FromWorker,
  type HandObservation,
  type Handedness,
  type PoseObservation,
  type ToWorker,
  type WorkerConfig,
} from '../features/practice/protocol'

type Runtime = {
  hand: HandLandmarker
  pose: PoseLandmarker
  backend: Backend
  canvas: OffscreenCanvas
}

type OrtModule = typeof OrtNamespace

type Classifier = {
  session: InferenceSession
  ort: OrtModule
  manifest: ClassifierManifest
  backend: ClassifierBackend
  busy: boolean
}

const WINDOW_FRAMES = 16
const SUBSAMPLED_FRAMES = 8

let runtime: Runtime | null = null
let lastTimestamp = -1
let primaryCenter: Point2 | null = null
let classifier: Classifier | null = null
const stabilizer = createPredictionStabilizer()
const featureWindow: Float32Array[] = []

const post = (message: FromWorker, transfer: Transferable[] = []) => {
  self.postMessage(message, transfer)
}

const toWorld = (points: Landmark[] | undefined) =>
  (points ?? []).map((p) => ({ x: p.x, y: p.y, z: p.z }))

const toOverlay = (points: NormalizedLandmark[] | undefined) =>
  (points ?? []).map((p) => ({ x: p.x, y: p.y }))

const pickHandedness = (categories: Category[] | undefined): Handedness =>
  categories?.[0]?.categoryName === 'Left' ? 'Left' : 'Right'

const build = async (config: WorkerConfig, delegate: 'GPU' | 'CPU'): Promise<Runtime> => {
  const fileset = await FilesetResolver.forVisionTasks(config.wasmBase)
  const canvas = new OffscreenCanvas(1, 1)

  const hand = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: config.handModel, delegate },
    numHands: config.numHands,
    runningMode: 'VIDEO',
    canvas,
  })

  const pose = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: config.poseModel, delegate },
    numPoses: 2,
    runningMode: 'VIDEO',
    canvas,
  })

  return { hand, pose, canvas, backend: delegate === 'GPU' ? 'GPU (WebGL)' : 'CPU (WASM SIMD)' }
}

const frameAspect = (frame: VideoFrame | ImageBitmap) => {
  const [w, h] =
    'displayWidth' in frame
      ? [frame.displayWidth, frame.displayHeight]
      : [frame.width, frame.height]
  return h > 0 ? w / h : 1
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const buildWithFallback = async (config: WorkerConfig): Promise<Runtime> => {
  try {
    return await build(config, config.delegate)
  } catch (primaryError) {
    if (config.delegate !== 'GPU') throw primaryError
    return build(config, 'CPU')
  }
}

const init = async (config: WorkerConfig) => {
  let lastError: unknown = null
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await delay(1000 * attempt)
    try {
      runtime = await buildWithFallback(config)
      lastTimestamp = -1
      post({ type: 'ready', backend: runtime.backend })
      return
    } catch (err) {
      lastError = err
    }
  }
  post({ type: 'error', message: describe(lastError) })
}

const describe = (err: unknown) => (err instanceof Error ? err.message : String(err))

const loadModel = async (manifest: ClassifierManifest, modelBaseUrl: string) => {
  try {
    const ort = await import('onnxruntime-web')
    ort.env.wasm.wasmPaths = ORT_WASM_BASE
    const modelUrl = new URL(manifest.url, modelBaseUrl).href

    let session: InferenceSession
    let backend: ClassifierBackend
    try {
      session = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ['webgpu'],
      })
      backend = 'WebGPU'
    } catch {
      session = await ort.InferenceSession.create(modelUrl, {
        executionProviders: ['wasm'],
      })
      backend = 'WASM SIMD'
    }

    classifier = { session, ort, manifest, backend, busy: false }
    stabilizer.reset()
    featureWindow.length = 0
    post({ type: 'model-ready', backend })
  } catch (err) {
    classifier = null
    post({ type: 'model-error', message: describe(err) })
  }
}

const softmax = (logits: Float32Array): Float32Array => {
  let max = -Infinity
  for (const value of logits) max = Math.max(max, value)
  let sum = 0
  const out = new Float32Array(logits.length)
  for (let i = 0; i < logits.length; i++) {
    out[i] = Math.exp((logits[i] ?? 0) - max)
    sum += out[i]!
  }
  for (let i = 0; i < logits.length; i++) out[i] = out[i]! / sum
  return out
}

const classify = (feature: Float32Array, timestamp: number) => {
  featureWindow.push(feature)
  if (featureWindow.length > WINDOW_FRAMES) featureWindow.shift()

  const active = classifier
  if (!active || active.busy || !stabilizer.shouldInfer()) return
  if (active.manifest.kind === 'dynamic' && featureWindow.length < SUBSAMPLED_FRAMES) return

  const dim = feature.length
  let tensor: InstanceType<OrtModule['Tensor']>
  if (active.manifest.kind === 'static') {
    tensor = new active.ort.Tensor('float32', feature, [1, dim])
  } else {
    const padded = [...featureWindow]
    while (padded.length < WINDOW_FRAMES) padded.unshift(padded[0]!)
    const step = WINDOW_FRAMES / SUBSAMPLED_FRAMES
    const data = new Float32Array(SUBSAMPLED_FRAMES * dim)
    for (let i = 0; i < SUBSAMPLED_FRAMES; i++) {
      data.set(padded[i * step]!, i * dim)
    }
    tensor = new active.ort.Tensor('float32', data, [1, SUBSAMPLED_FRAMES, dim])
  }

  active.busy = true
  active.session
    .run({ features: tensor })
    .then((outputs) => {
      active.busy = false
      const logits = outputs.logits?.data as Float32Array | undefined
      if (!logits) return
      const probabilities = softmax(logits)
      let best = 0
      for (let i = 1; i < probabilities.length; i++) {
        if (probabilities[i]! > probabilities[best]!) best = i
      }
      const raw = {
        label: active.manifest.labels[best] ?? String(best),
        confidence: probabilities[best] ?? 0,
      }
      const stable = stabilizer.push(raw)
      post({ type: 'prediction', raw, stable, timestamp })
    })
    .catch((err: unknown) => {
      active.busy = false
      post({ type: 'model-error', message: describe(err) })
    })
}

const infer = (frame: VideoFrame | ImageBitmap, timestamp: number) => {
  if (!runtime) {
    frame.close()
    return
  }

  const ts = timestamp > lastTimestamp ? timestamp : lastTimestamp + 1
  lastTimestamp = ts
  const started = performance.now()

  try {
    const handResult = runtime.hand.detectForVideo(frame, ts)
    const poseResult = runtime.pose.detectForVideo(frame, ts)

    const aspect = frameAspect(frame)
    // Hands that do not belong to the primary person's wrists come from someone else.
    const person = primaryPerson(poseResult.landmarks, handResult.landmarks, aspect, primaryCenter)
    primaryCenter = person?.center ?? null
    const poseImage = person ? poseResult.landmarks[person.pose] : undefined
    const poseWorld = person ? poseResult.worldLandmarks[person.pose] : undefined
    const pose: PoseObservation | null =
      poseImage && poseWorld ? { world: toWorld(poseWorld), overlay: toOverlay(poseImage) } : null

    const hands: HandObservation[] = (person?.hands ?? []).map((i) => ({
      handedness: pickHandedness(handResult.handedness[i]),
      score: handResult.handedness[i]?.[0]?.score ?? 0,
      world: toWorld(handResult.worldLandmarks[i]),
      overlay: toOverlay(handResult.landmarks[i]),
    }))

    post({
      type: 'landmarks',
      hands,
      pose,
      timestamp: ts,
      inferenceMs: performance.now() - started,
    })

    classify(
      frameFeatures({
        hands: hands.map((hand) => ({ handedness: hand.handedness, world: hand.world })),
        pose: pose?.world ?? null,
      }),
      ts,
    )
  } catch (err) {
    post({ type: 'error', message: describe(err) })
  } finally {
    frame.close()
  }
}

const stop = () => {
  runtime?.hand.close()
  runtime?.pose.close()
  runtime = null
  lastTimestamp = -1
  primaryCenter = null
  classifier = null
  stabilizer.reset()
  featureWindow.length = 0
}

self.onmessage = (event: MessageEvent<ToWorker>) => {
  const message = event.data
  if (message.type === 'init') void init(message.config)
  else if (message.type === 'frame') infer(message.frame, message.timestamp)
  else if (message.type === 'load-model') void loadModel(message.manifest, message.modelBaseUrl)
  else if (message.type === 'stabilizer') stabilizer.setParams(message.params)
  else if (message.type === 'stop') stop()
}
