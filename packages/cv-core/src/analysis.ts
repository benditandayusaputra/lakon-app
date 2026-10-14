import type { DtwPathPair } from './dtw'
import {
  FINGER_LANDMARKS,
  FINGER_TIPS,
  FLAGS_OFFSET,
  HAND_BLOCK_DIMS,
  HAND_LABEL_TO_USER_SIDE,
  HAND_LANDMARK_DIMS,
  HAND_LANDMARKS,
  KNUCKLE_LANDMARKS,
  SIDE_OFFSET,
  type HandLabel,
} from './features'

export type FingerName = keyof typeof FINGER_LANDMARKS

export type JointDistance = {
  side: HandLabel
  landmark: number
  distance: number
}

export type HandAnalysis = {
  side: HandLabel
  present: boolean
  fingerDistance: Record<FingerName, number>
  fingerCurlDelta: Record<FingerName, number>
  knuckleDistance: number
  wristDelta: { x: number; y: number; z: number }
}

export type PathAnalysis = {
  joints: JointDistance[]
  hands: HandAnalysis[]
  worstPhase: number | null
  phaseDistances: number[]
}

const landmarkDistance = (
  user: Float32Array,
  reference: Float32Array,
  offset: number,
  landmark: number,
): number => {
  const base = offset + landmark * 3
  const dx = (user[base] ?? 0) - (reference[base] ?? 0)
  const dy = (user[base + 1] ?? 0) - (reference[base + 1] ?? 0)
  const dz = (user[base + 2] ?? 0) - (reference[base + 2] ?? 0)
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

const tipMagnitude = (frame: Float32Array, offset: number, landmark: number): number => {
  const base = offset + landmark * 3
  const x = frame[base] ?? 0
  const y = frame[base + 1] ?? 0
  const z = frame[base + 2] ?? 0
  return Math.sqrt(x * x + y * y + z * z)
}

export const maskUnusedHands = (
  user: readonly Float32Array[],
  reference: readonly Float32Array[],
): Float32Array[] => {
  const unused = (['Left', 'Right'] as HandLabel[]).filter(
    (side) =>
      !reference.some((frame) => (frame[FLAGS_OFFSET + (side === 'Left' ? 0 : 1)] ?? 0) > 0.5),
  )
  if (unused.length === 0) return [...user]
  return user.map((frame) => {
    const masked = frame.slice()
    for (const side of unused) {
      masked.fill(0, SIDE_OFFSET[side], SIDE_OFFSET[side] + HAND_BLOCK_DIMS)
      masked[FLAGS_OFFSET + (side === 'Left' ? 0 : 1)] = 0
    }
    return masked
  })
}

export const analyzePath = (
  user: readonly Float32Array[],
  reference: readonly Float32Array[],
  path: readonly DtwPathPair[],
  referencePhaseByFrame?: readonly number[],
): PathAnalysis => {
  const joints: JointDistance[] = []
  const hands: HandAnalysis[] = []

  for (const side of ['Left', 'Right'] as HandLabel[]) {
    const offset = SIDE_OFFSET[side]
    const flagIndex = FLAGS_OFFSET + (side === 'Left' ? 0 : 1)

    let presentPairs = 0
    const landmarkSums = new Float64Array(HAND_LANDMARKS)
    const curlSums: Record<FingerName, number> = {
      thumb: 0,
      index: 0,
      middle: 0,
      ring: 0,
      pinky: 0,
    }
    const wristSums = { x: 0, y: 0, z: 0 }

    for (const [ui, rj] of path) {
      const userFrame = user[ui]!
      const refFrame = reference[rj]!
      if ((refFrame[flagIndex] ?? 0) < 0.5 || (userFrame[flagIndex] ?? 0) < 0.5) continue
      presentPairs++
      for (let landmark = 0; landmark < HAND_LANDMARKS; landmark++) {
        landmarkSums[landmark]! += landmarkDistance(userFrame, refFrame, offset, landmark)
      }
      for (const finger of Object.keys(FINGER_TIPS) as FingerName[]) {
        curlSums[finger] +=
          tipMagnitude(userFrame, offset, FINGER_TIPS[finger]) -
          tipMagnitude(refFrame, offset, FINGER_TIPS[finger])
      }
      const wristBase = offset + HAND_LANDMARK_DIMS
      wristSums.x += (userFrame[wristBase] ?? 0) - (refFrame[wristBase] ?? 0)
      wristSums.y += (userFrame[wristBase + 1] ?? 0) - (refFrame[wristBase + 1] ?? 0)
      wristSums.z += (userFrame[wristBase + 2] ?? 0) - (refFrame[wristBase + 2] ?? 0)
    }

    const refNeedsHand = reference.some((frame) => (frame[flagIndex] ?? 0) > 0.5)
    if (!refNeedsHand) continue

    const divide = Math.max(presentPairs, 1)
    const fingerDistance = {} as Record<FingerName, number>
    const fingerCurlDelta = {} as Record<FingerName, number>
    for (const finger of Object.keys(FINGER_LANDMARKS) as FingerName[]) {
      const indices = FINGER_LANDMARKS[finger]
      let sum = 0
      for (const landmark of indices) sum += landmarkSums[landmark]! / divide
      fingerDistance[finger] = sum / indices.length
      fingerCurlDelta[finger] = curlSums[finger] / divide
    }
    let knuckleSum = 0
    for (const landmark of KNUCKLE_LANDMARKS) knuckleSum += landmarkSums[landmark]! / divide
    for (let landmark = 0; landmark < HAND_LANDMARKS; landmark++) {
      joints.push({ side, landmark, distance: landmarkSums[landmark]! / divide })
    }

    hands.push({
      side,
      present: presentPairs > 0,
      fingerDistance,
      fingerCurlDelta,
      knuckleDistance: knuckleSum / KNUCKLE_LANDMARKS.length,
      wristDelta: {
        x: wristSums.x / divide,
        y: wristSums.y / divide,
        z: wristSums.z / divide,
      },
    })
  }

  let worstPhase: number | null = null
  const phaseDistances: number[] = []
  if (referencePhaseByFrame && referencePhaseByFrame.length > 0) {
    const sums = new Map<number, { total: number; count: number }>()
    for (const [ui, rj] of path) {
      const phase = referencePhaseByFrame[rj]
      if (phase === undefined) continue
      const entry = sums.get(phase) ?? { total: 0, count: 0 }
      let frameDistance = 0
      for (const side of ['Left', 'Right'] as HandLabel[]) {
        for (let landmark = 0; landmark < HAND_LANDMARKS; landmark++) {
          frameDistance += landmarkDistance(user[ui]!, reference[rj]!, SIDE_OFFSET[side], landmark)
        }
      }
      entry.total += frameDistance
      entry.count++
      sums.set(phase, entry)
    }
    let worstValue = -Infinity
    for (const [phase, entry] of [...sums.entries()].sort((a, b) => a[0] - b[0])) {
      const mean = entry.total / Math.max(entry.count, 1)
      phaseDistances[phase] = mean
      if (mean > worstValue) {
        worstValue = mean
        worstPhase = phase
      }
    }
  }

  return { joints, hands, worstPhase, phaseDistances }
}

export type FeedbackThresholds = {
  finger: number
  wristAxis: number
  knuckle: number
  curlDirection: number
}

export const DEFAULT_FEEDBACK_THRESHOLDS: FeedbackThresholds = {
  finger: 0.9,
  wristAxis: 0.28,
  knuckle: 0.8,
  curlDirection: 0.5,
}

export type FeedbackHighlight = {
  side: HandLabel
  part: FingerName | 'pergelangan' | 'telapak'
}

export type Feedback = {
  messages: string[]
  highlights: FeedbackHighlight[]
}

const FINGER_LABEL: Record<FingerName, string> = {
  thumb: 'jempol',
  index: 'telunjuk',
  middle: 'jari tengah',
  ring: 'jari manis',
  pinky: 'kelingking',
}

export const translateFeedback = (
  analysis: PathAnalysis,
  thresholds: FeedbackThresholds = DEFAULT_FEEDBACK_THRESHOLDS,
): Feedback => {
  const messages: string[] = []
  const highlights: FeedbackHighlight[] = []

  for (const hand of analysis.hands) {
    const userSide = HAND_LABEL_TO_USER_SIDE[hand.side]

    if (!hand.present) {
      messages.push(`tangan ${userSide} belum terlihat kamera`)
      highlights.push({ side: hand.side, part: 'pergelangan' })
      continue
    }

    for (const finger of Object.keys(hand.fingerDistance) as FingerName[]) {
      if (hand.fingerDistance[finger] < thresholds.finger) continue
      const curl = hand.fingerCurlDelta[finger]
      if (curl > thresholds.curlDirection) {
        messages.push(`${FINGER_LABEL[finger]} tangan ${userSide} perlu lebih menekuk`)
      } else if (curl < -thresholds.curlDirection) {
        messages.push(`${FINGER_LABEL[finger]} tangan ${userSide} terlalu menekuk`)
      } else {
        messages.push(`bentuk ${FINGER_LABEL[finger]} tangan ${userSide} belum tepat`)
      }
      highlights.push({ side: hand.side, part: finger })
    }

    const { x, y, z } = hand.wristDelta
    if (Math.abs(y) > thresholds.wristAxis) {
      messages.push(
        y > 0
          ? `posisi tangan ${userSide} terlalu rendah`
          : `posisi tangan ${userSide} terlalu tinggi`,
      )
      highlights.push({ side: hand.side, part: 'pergelangan' })
    }
    if (Math.abs(x) > thresholds.wristAxis) {
      messages.push(`posisi tangan ${userSide} terlalu ke samping`)
      highlights.push({ side: hand.side, part: 'pergelangan' })
    }
    if (Math.abs(z) > thresholds.wristAxis) {
      messages.push(
        z < 0
          ? `tangan ${userSide} terlalu jauh ke depan`
          : `tangan ${userSide} terlalu dekat ke badan`,
      )
      highlights.push({ side: hand.side, part: 'pergelangan' })
    }

    if (hand.knuckleDistance > thresholds.knuckle) {
      messages.push(`arah telapak tangan ${userSide} belum tepat`)
      highlights.push({ side: hand.side, part: 'telapak' })
    }
  }

  if (messages.length === 0) messages.push('gerakan sudah sesuai referensi')
  return { messages, highlights }
}
