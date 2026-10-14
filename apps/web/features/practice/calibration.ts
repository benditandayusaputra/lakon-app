import { frameFeatures, primaryPerson, type Point2, type Vec3 } from '@lakon/cv-core'
import type { CompiledSign } from '@lakon/sign-compiler'
import { scoreAgainstReference } from './verify'

type Tuple2 = [number, number]
type Tuple3 = [number, number, number]

export type PeragaRecording = {
  id: string
  aspect: number
  frames: {
    hands: { handedness: 'Left' | 'Right'; wrist: Tuple2; world: Tuple3[] }[]
    poses: { image: Tuple2[]; world: Tuple3[] }[]
  }[]
}

export type SignCalibration = { example: number; others: number }

export const PASS_SIMILARITY = 0.8

// Urutan titik pose yang disimpan tools/extract-peraga.mjs: bahu kiri, bahu kanan, pergelangan kiri, kanan.
const STORED_POSE_POINTS = [11, 12, 15, 16] as const

const toPose = <T>(points: readonly T[], blank: T): T[] => {
  const pose = Array.from({ length: 33 }, () => blank)
  STORED_POSE_POINTS.forEach((index, i) => (pose[index] = points[i]!))
  return pose
}

const vec2 = ([x, y]: Tuple2): Point2 => ({ x, y })
const vec3 = ([x, y, z]: Tuple3): Vec3 => ({ x, y, z })

export type Observation = {
  hands: { handedness: 'Left' | 'Right'; world: Vec3[] }[]
  pose: Vec3[] | null
}

export const recordingObservations = (recording: PeragaRecording): Observation[] => {
  let center: Point2 | null = null
  return recording.frames.map((frame) => {
    const poses = frame.poses.map((pose) => toPose(pose.image.map(vec2), { x: 0, y: 0 }))
    const wrists = frame.hands.map((hand) => [vec2(hand.wrist)])
    const person = primaryPerson(poses, wrists, recording.aspect, center)
    center = person?.center ?? null
    return {
      hands: (person?.hands ?? []).map((i) => ({
        handedness: frame.hands[i]!.handedness,
        world: frame.hands[i]!.world.map(vec3),
      })),
      pose: person ? toPose(frame.poses[person.pose]!.world.map(vec3), { x: 0, y: 0, z: 0 }) : null,
    }
  })
}

export const recordingFeatures = (recording: PeragaRecording): Float32Array[] =>
  recordingObservations(recording).map(frameFeatures)

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]!
}

const round = (n: number) => Math.round(n * 1000) / 1000

export const calibrate = (
  references: Record<string, CompiledSign>,
  examples: Record<string, Float32Array[]>,
): Record<string, SignCalibration> => {
  const ids = Object.keys(references).filter((id) => examples[id])
  const score = (example: string, reference: string) =>
    scoreAgainstReference(examples[example]!, references[reference]!).score
  return Object.fromEntries(
    ids.map((id) => [
      id,
      {
        example: round(score(id, id)),
        others: round(median(ids.filter((other) => other !== id).map((other) => score(other, id)))),
      },
    ]),
  )
}

export const similarity = (score: number, calibration: SignCalibration): number => {
  const span = calibration.others - calibration.example
  if (span <= 0) return score <= calibration.example ? 1 : 0
  return Math.min(1, Math.max(0, (calibration.others - score) / span))
}

export const passScore = (calibration: SignCalibration): number =>
  calibration.example + (1 - PASS_SIMILARITY) * (calibration.others - calibration.example)
