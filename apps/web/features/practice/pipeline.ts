import { startCapture, type CaptureHandle, type CaptureRoute } from './capture'
import { createOverlay, type Overlay, type OverlayHighlight } from './overlay'
import {
  DEFAULT_WORKER_CONFIG,
  type Backend,
  type CaptureFrame,
  type ClassifierBackend,
  type ClassifierManifest,
  type FromWorker,
  type HandObservation,
  type PoseObservation,
  type RawPredictionMessage,
  type StabilizerParamsMessage,
  type StablePredictionMessage,
  type ToWorker,
  type WorkerConfig,
} from './protocol'

export type PipelineStatus =
  'idle' | 'starting' | 'running' | 'denied' | 'no-camera' | 'unsupported' | 'error'

export type PipelineStats = {
  cameraFps: number
  inferenceFps: number
  inferenceMs: number
  hands: number
  droppedFrames: number
  queuedFrames: number
  backend: Backend | null
  classifierBackend: ClassifierBackend | 'tanpa model' | null
  route: CaptureRoute | null
  resolution: string | null
  lastLandmarkAt: number
}

export type PipelineState = {
  status: PipelineStatus
  message?: string
  sumber?: 'kamera' | 'model'
}

export type PipelineOptions = {
  video: HTMLVideoElement
  canvas: HTMLCanvasElement
  config?: Partial<WorkerConfig>
  mirrored?: boolean
  onState?: (state: PipelineState) => void
  onLandmarks?: (hands: HandObservation[], pose: PoseObservation | null, timestamp: number) => void
  onPrediction?: (
    raw: RawPredictionMessage,
    stable: StablePredictionMessage,
    timestamp: number,
  ) => void
  classifierManifestUrl?: string
  classifier?: boolean
}

export type Pipeline = {
  start: (route?: CaptureRoute) => Promise<void>
  stop: () => void
  stats: Readonly<PipelineStats>
  state: () => PipelineState
  setStabilizer: (params: StabilizerParamsMessage) => void
  setHighlights: (highlights: readonly OverlayHighlight[]) => void
}

class Rate {
  private count = 0
  private since = performance.now()
  value = 0

  tick(now: number) {
    this.count++
    const elapsed = now - this.since
    if (elapsed >= 500) {
      this.value = (this.count * 1000) / elapsed
      this.count = 0
      this.since = now
    }
  }

  idle(now: number) {
    if (now - this.since >= 1500) {
      this.value = 0
      this.count = 0
      this.since = now
    }
  }

  reset() {
    this.count = 0
    this.since = performance.now()
    this.value = 0
  }
}

export const createPipeline = (options: PipelineOptions): Pipeline => {
  const { video, canvas, mirrored = true, onState } = options
  const config: WorkerConfig = { ...DEFAULT_WORKER_CONFIG, ...options.config }

  const stats: PipelineStats = {
    cameraFps: 0,
    inferenceFps: 0,
    inferenceMs: 0,
    hands: 0,
    droppedFrames: 0,
    queuedFrames: 0,
    backend: null,
    classifierBackend: null,
    route: null,
    resolution: null,
    lastLandmarkAt: 0,
  }

  const latest: { hands: HandObservation[]; pose: PoseObservation | null } = {
    hands: [],
    pose: null,
  }

  const cameraRate = new Rate()
  const inferenceRate = new Rate()

  let state: PipelineState = { status: 'idle' }
  let worker: Worker | null = null
  let capture: CaptureHandle | null = null
  let overlay: Overlay | null = null
  let raf = 0
  let inFlight = 0
  let ready = false
  let sentAt = 0
  let overlayWidth = 0
  let overlayHeight = 0
  let generasi = 0
  let perluGambar = true

  const setState = (next: PipelineState) => {
    state = next
    onState?.(next)
  }

  const send = (message: ToWorker, transfer: Transferable[] = []) => {
    worker?.postMessage(message, transfer)
  }

  const lewati = () => {
    const now = performance.now()
    cameraRate.tick(now)
    stats.cameraFps = cameraRate.value

    if (!worker || !ready || inFlight > 0 || document.hidden) {
      stats.droppedFrames++
      return true
    }
    return false
  }

  const onFrame = (frame: CaptureFrame, timestamp: number) => {
    inFlight++
    sentAt = performance.now()
    stats.queuedFrames = inFlight
    send({ type: 'frame', frame, timestamp }, [frame as unknown as Transferable])
  }

  const loadClassifier = async () => {
    const manifestUrl = options.classifierManifestUrl ?? '/models/classifier.json'
    try {
      const response = await fetch(manifestUrl)
      if (!response.ok) {
        stats.classifierBackend = 'tanpa model'
        return
      }
      const manifest = (await response.json()) as ClassifierManifest
      send({
        type: 'load-model',
        manifest,
        modelBaseUrl: new URL(manifestUrl, location.href).href,
      })
    } catch {
      stats.classifierBackend = 'tanpa model'
    }
  }

  const onWorkerMessage = (event: MessageEvent<FromWorker>) => {
    const message = event.data
    if (message.type === 'ready') {
      stats.backend = message.backend
      ready = true
      if (capture && state.status === 'starting') setState({ status: 'running' })
      if (options.classifier ?? true) void loadClassifier()
      else stats.classifierBackend = 'tanpa model'
      return
    }
    if (message.type === 'model-ready') {
      stats.classifierBackend = message.backend
      return
    }
    if (message.type === 'model-error') {
      stats.classifierBackend = 'tanpa model'
      console.warn('classification model not loaded:', message.message)
      return
    }
    if (message.type === 'prediction') {
      options.onPrediction?.(message.raw, message.stable, message.timestamp)
      return
    }
    if (message.type === 'error') {
      inFlight = 0
      stats.queuedFrames = 0
      console.warn('CV worker error:', message.message)
      setState({ status: 'error', sumber: 'model', message: message.message })
      return
    }

    inFlight = Math.max(0, inFlight - 1)
    stats.queuedFrames = inFlight
    latest.hands = message.hands
    latest.pose = message.pose
    perluGambar = true
    options.onLandmarks?.(message.hands, message.pose, message.timestamp)
    stats.hands = message.hands.length
    stats.inferenceMs = stats.inferenceMs * 0.8 + message.inferenceMs * 0.2
    stats.lastLandmarkAt = performance.now()
    inferenceRate.tick(stats.lastLandmarkAt)
    stats.inferenceFps = inferenceRate.value
  }

  const syncOverlaySize = () => {
    const width = video.clientWidth
    const height = video.clientHeight
    if (width === 0 || height === 0) return
    if (width !== overlayWidth || height !== overlayHeight) {
      overlayWidth = width
      overlayHeight = height
      overlay?.resize(width, height)
      perluGambar = true
    }
  }

  const loop = () => {
    raf = requestAnimationFrame(loop)
    const now = performance.now()
    cameraRate.idle(now)
    inferenceRate.idle(now)
    if (inFlight > 0 && now - sentAt > 2000) {
      inFlight = 0
      stats.queuedFrames = 0
    }
    stats.cameraFps = cameraRate.value
    stats.inferenceFps = inferenceRate.value
    syncOverlaySize()
    if (perluGambar) {
      overlay?.draw(latest)
      perluGambar = false
    }
  }

  const start = async (route?: CaptureRoute) => {
    if (state.status === 'running' || state.status === 'starting') return
    if (capture || worker) stop()
    setState({ status: 'starting' })
    const gen = ++generasi

    overlay ??= createOverlay(canvas, { mirrored })

    worker ??= new Worker(new URL('../../workers/cv.worker.ts', import.meta.url), {
      type: 'module',
      name: 'lakon-cv',
    })
    worker.onmessage = onWorkerMessage
    worker.onerror = (event) =>
      setState({ status: 'error', sumber: 'model', message: event.message })
    send({ type: 'init', config })

    const result = await startCapture({ video, onFrame, lewati, route })
    if (gen !== generasi) {
      if (result.ok) result.stop()
      return
    }
    if (!result.ok) {
      stop()
      setState(
        result.reason === 'error'
          ? { status: 'error', sumber: 'kamera', message: result.message }
          : { status: result.reason },
      )
      return
    }

    capture = result
    stats.route = result.route
    const { width, height } = result.settings
    stats.resolution = width && height ? `${width}x${height}` : null

    cameraRate.reset()
    inferenceRate.reset()
    inFlight = 0
    if (raf === 0) raf = requestAnimationFrame(loop)
    setState(
      ready
        ? { status: 'running' }
        : { status: 'starting', message: 'Menyiapkan pengenal gerakan…' },
    )
  }

  const stop = () => {
    generasi++
    capture?.stop()
    capture = null
    if (raf !== 0) {
      cancelAnimationFrame(raf)
      raf = 0
    }
    send({ type: 'stop' })
    worker?.terminate()
    worker = null
    overlay?.clear()
    latest.hands = []
    latest.pose = null
    inFlight = 0
    ready = false
    stats.queuedFrames = 0
    stats.hands = 0
    cameraRate.reset()
    inferenceRate.reset()
    stats.cameraFps = 0
    stats.inferenceFps = 0
    if (state.status !== 'error') setState({ status: 'idle' })
  }

  const setStabilizer = (params: StabilizerParamsMessage) => {
    send({ type: 'stabilizer', params })
  }

  const setHighlights = (highlights: readonly OverlayHighlight[]) => {
    overlay?.setHighlights(highlights)
    perluGambar = true
  }

  return { start, stop, stats, state: () => state, setStabilizer, setHighlights }
}
