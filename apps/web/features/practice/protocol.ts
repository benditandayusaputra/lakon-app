export type Point3 = { x: number; y: number; z: number }
export type Point2 = { x: number; y: number }

export type Handedness = 'Left' | 'Right'

export type HandObservation = {
  handedness: Handedness
  score: number
  world: Point3[]
  overlay: Point2[]
}

export type PoseObservation = {
  world: Point3[]
  overlay: Point2[]
}

export type Backend = 'GPU (WebGL)' | 'CPU (WASM SIMD)'

export type WorkerConfig = {
  wasmBase: string
  handModel: string
  poseModel: string
  numHands: number
  delegate: 'GPU' | 'CPU'
}

export const MEDIAPIPE_VERSION = '0.10.35'

export const DEFAULT_WORKER_CONFIG: WorkerConfig = {
  wasmBase: '/mediapipe/wasm',
  handModel: '/models/mediapipe/hand_landmarker.task',
  poseModel: '/models/mediapipe/pose_landmarker_lite.task',
  numHands: 4,
  delegate: 'GPU',
}

export type CaptureFrame = VideoFrame | ImageBitmap

export const ORT_VERSION = '1.29.0'
export const ORT_WASM_BASE = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ORT_VERSION}/dist/`

export type ClassifierManifest = {
  kind: 'static' | 'dynamic'
  labels: string[]
  inputShape: number[]
  url: string
}

export type ClassifierBackend = 'WebGPU' | 'WASM SIMD'

export type RawPredictionMessage = { label: string; confidence: number }
export type StablePredictionMessage = {
  label: string | null
  meanConfidence: number
  votes: number
}

export type StabilizerParamsMessage = {
  inferEvery?: number
  bufferSize?: number
  minVotes?: number
  minConfidence?: number
}

export type ToWorker =
  | { type: 'init'; config: WorkerConfig }
  | { type: 'frame'; frame: CaptureFrame; timestamp: number }
  | { type: 'load-model'; manifest: ClassifierManifest; modelBaseUrl: string }
  | { type: 'stabilizer'; params: StabilizerParamsMessage }
  | { type: 'stop' }

export type FromWorker =
  | { type: 'ready'; backend: Backend }
  | {
      type: 'landmarks'
      hands: HandObservation[]
      pose: PoseObservation | null
      timestamp: number
      inferenceMs: number
    }
  | { type: 'model-ready'; backend: ClassifierBackend }
  | { type: 'model-error'; message: string }
  | {
      type: 'prediction'
      raw: RawPredictionMessage
      stable: StablePredictionMessage
      timestamp: number
    }
  | { type: 'error'; message: string }

export const POSE_LEFT_SHOULDER = 11
export const POSE_RIGHT_SHOULDER = 12
