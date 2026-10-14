import { POSE } from './features'

export type Point2 = { x: number; y: number }
type Pose2 = readonly Point2[]

// Distances are in shoulder widths so the thresholds hold at any camera distance.
const HAND_REACH = 0.7
const SAME_PERSON = 0.5

const HAND_WRIST = 0
const POSE_WRISTS = [POSE.leftWrist, POSE.rightWrist] as const

const toPixels = (p: Point2, aspect: number): Point2 => ({ x: p.x * aspect, y: p.y })

const distance = (a: Point2, b: Point2) => Math.hypot(a.x - b.x, a.y - b.y)

const shoulders = (pose: Pose2, aspect: number) => {
  const l = pose[POSE.leftShoulder]
  const r = pose[POSE.rightShoulder]
  if (!l || !r) return null
  const a = toPixels(l, aspect)
  const b = toPixels(r, aspect)
  return { width: distance(a, b), center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } }
}

export const selectPrimaryPose = (
  poses: readonly Pose2[],
  aspect: number,
  previousCenter: Point2 | null,
): { index: number; center: Point2 } | null => {
  const candidates = poses.flatMap((pose, index) => {
    const s = shoulders(pose, aspect)
    return s && s.width > 0 ? [{ index, ...s }] : []
  })
  const largest = (list: typeof candidates) =>
    list.reduce<(typeof candidates)[number] | null>(
      (best, c) => (!best || c.width > best.width ? c : best),
      null,
    )
  const tracked = previousCenter
    ? largest(candidates.filter((c) => distance(c.center, previousCenter) <= SAME_PERSON * c.width))
    : null
  const chosen = tracked ?? largest(candidates)
  return chosen ? { index: chosen.index, center: chosen.center } : null
}

export const handsOfPose = (
  pose: Pose2,
  hands: readonly (readonly Point2[])[],
  aspect: number,
): number[] => {
  const s = shoulders(pose, aspect)
  if (!s) return []
  const pairs = POSE_WRISTS.flatMap((wristIndex) => {
    const wrist = pose[wristIndex]
    if (!wrist) return []
    return hands.flatMap((hand, handIndex) => {
      const handWrist = hand[HAND_WRIST]
      if (!handWrist) return []
      const d = distance(toPixels(wrist, aspect), toPixels(handWrist, aspect))
      return d <= HAND_REACH * s.width ? [{ wristIndex, handIndex, d }] : []
    })
  }).sort((a, b) => a.d - b.d)

  const usedWrists = new Set<number>()
  const kept = new Set<number>()
  for (const { wristIndex, handIndex } of pairs) {
    if (usedWrists.has(wristIndex) || kept.has(handIndex)) continue
    usedWrists.add(wristIndex)
    kept.add(handIndex)
  }
  return [...kept].sort((a, b) => a - b)
}

export const primaryPerson = (
  poses: readonly Pose2[],
  hands: readonly (readonly Point2[])[],
  aspect: number,
  previousCenter: Point2 | null,
): { pose: number; hands: number[]; center: Point2 } | null => {
  const primary = selectPrimaryPose(poses, aspect, previousCenter)
  if (!primary) return null
  return {
    pose: primary.index,
    hands: handsOfPose(poses[primary.index]!, hands, aspect),
    center: primary.center,
  }
}
