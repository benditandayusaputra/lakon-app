import {
  analyzePath,
  dtwDetailed,
  frameFeatures,
  maskUnusedHands,
  mirrorFeatures,
  translateFeedback,
  trimToHands,
  type Feedback,
  type FeedbackThresholds,
  type PathAnalysis,
  type Segmenter,
  type SegmenterUpdate,
} from '@lakon/cv-core'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { HandObservation, PoseObservation } from './protocol'

export type VerifyResult = {
  score: number
  analysis: PathAnalysis
  feedback: Feedback
  frameCount: number
}

export const featuresFromObservation = (
  hands: HandObservation[],
  pose: PoseObservation | null,
): Float32Array =>
  frameFeatures({
    hands: hands.map((hand) => ({ handedness: hand.handedness, world: hand.world })),
    pose: pose?.world ?? null,
  })

// Pemelajar butuh waktu bereaksi dan biasanya lebih lambat dari peraga; frame tanpa tangan dipangkas saat menilai.
export const recordingWindowMs = (signDurationMs: number): number =>
  Math.max(3000, signDurationMs * 1.5 + 1000)

const scoreFrames = (
  frames: Float32Array[],
  compiled: CompiledSign,
  thresholds?: FeedbackThresholds,
) => {
  const masked = maskUnusedHands(frames, compiled.reference)
  const result = dtwDetailed(masked, compiled.reference)
  const analysis = analyzePath(masked, compiled.reference, result.path, compiled.phaseByFrame)
  return { score: result.score, analysis, feedback: translateFeedback(analysis, thresholds) }
}

export const scoreAgainstReference = (
  frames: Float32Array[],
  compiled: CompiledSign,
  thresholds?: FeedbackThresholds,
): VerifyResult => {
  const trimmed = trimToHands(frames)
  const source = trimmed.length > 0 ? trimmed : frames
  const asIs = scoreFrames(source, compiled, thresholds)
  const mirrored = scoreFrames(source.map(mirrorFeatures), compiled, thresholds)
  return { ...(mirrored.score < asIs.score ? mirrored : asIs), frameCount: frames.length }
}

export type VerifyRun = {
  onLandmarks: (hands: HandObservation[], pose: PoseObservation | null, timestamp: number) => void
  stop: () => void
}

export const createVerifyRun = (
  segmenter: Segmenter,
  onUpdate: (update: SegmenterUpdate) => void,
  onDone: (frames: Float32Array[]) => void,
): VerifyRun => {
  let finished = false
  return {
    onLandmarks(hands, pose, timestamp) {
      if (finished) return
      const update = segmenter.update(featuresFromObservation(hands, pose), timestamp)
      onUpdate(update)
      if (update.phase === 'done') {
        finished = true
        onDone(update.frames)
      }
    },
    stop() {
      finished = true
    },
  }
}
