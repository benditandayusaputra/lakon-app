import { featureDistance } from './dtw'
import { FLAGS_OFFSET } from './features'

export type SegmenterUpdate =
  | { phase: 'countdown'; remainingMs: number }
  | { phase: 'idle'; energy: number }
  | { phase: 'recording'; remainingMs?: number; energy?: number }
  | { phase: 'done'; frames: Float32Array[] }

export type Segmenter = {
  update: (feature: Float32Array, timestampMs: number) => SegmenterUpdate
  reset: () => void
}

export type ExplicitSegmenterOptions = {
  countdownMs?: number
  windowMs?: number
}

export const createExplicitSegmenter = (options: ExplicitSegmenterOptions = {}): Segmenter => {
  const countdownMs = options.countdownMs ?? 3000
  const windowMs = options.windowMs ?? 2000
  let startAt: number | null = null
  let frames: Float32Array[] = []
  let done = false

  return {
    update(feature, timestampMs) {
      if (done) return { phase: 'done', frames }
      startAt ??= timestampMs
      const elapsed = timestampMs - startAt
      if (elapsed < countdownMs) {
        return { phase: 'countdown', remainingMs: countdownMs - elapsed }
      }
      if (elapsed < countdownMs + windowMs) {
        frames.push(feature)
        return { phase: 'recording', remainingMs: countdownMs + windowMs - elapsed }
      }
      done = true
      return { phase: 'done', frames }
    },
    reset() {
      startAt = null
      frames = []
      done = false
    },
  }
}

export type AutoSegmenterOptions = {
  startEnergy?: number
  endEnergy?: number
  minDurationMs?: number
  quietMs?: number
  maxDurationMs?: number
}

export const createAutoSegmenter = (options: AutoSegmenterOptions = {}): Segmenter => {
  const startEnergy = options.startEnergy ?? 0.9
  const endEnergy = options.endEnergy ?? 0.35
  const minDurationMs = options.minDurationMs ?? 400
  const quietMs = options.quietMs ?? 400
  const maxDurationMs = options.maxDurationMs ?? 6000

  let previous: Float32Array | null = null
  let previousAt = 0
  let smoothedEnergy = 0
  let recording = false
  let recordingSince = 0
  let quietSince: number | null = null
  let frames: Float32Array[] = []
  let done = false

  return {
    update(feature, timestampMs) {
      if (done) return { phase: 'done', frames }

      const handPresent =
        (feature[FLAGS_OFFSET] ?? 0) > 0.5 || (feature[FLAGS_OFFSET + 1] ?? 0) > 0.5
      let energy = 0
      if (previous && handPresent) {
        const dtSec = Math.max((timestampMs - previousAt) / 1000, 1 / 120)
        energy = featureDistance(feature, previous) / dtSec / 30
      }
      previous = feature
      previousAt = timestampMs
      smoothedEnergy = smoothedEnergy * 0.7 + energy * 0.3

      if (!recording) {
        if (handPresent && smoothedEnergy > startEnergy) {
          recording = true
          recordingSince = timestampMs
          quietSince = null
          frames = [feature]
          return { phase: 'recording', energy: smoothedEnergy }
        }
        return { phase: 'idle', energy: smoothedEnergy }
      }

      frames.push(feature)
      const elapsed = timestampMs - recordingSince

      if (smoothedEnergy < endEnergy || !handPresent) {
        quietSince ??= timestampMs
        if (elapsed >= minDurationMs && timestampMs - quietSince >= quietMs) {
          done = true
          return { phase: 'done', frames }
        }
      } else {
        quietSince = null
      }

      if (elapsed >= maxDurationMs) {
        done = true
        return { phase: 'done', frames }
      }
      return { phase: 'recording', energy: smoothedEnergy }
    },
    reset() {
      previous = null
      previousAt = 0
      smoothedEnergy = 0
      recording = false
      quietSince = null
      frames = []
      done = false
    },
  }
}
