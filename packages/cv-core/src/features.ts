export type Vec3 = { x: number; y: number; z: number }

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z })
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z
const len = (a: Vec3) => Math.sqrt(dot(a, a))
const norm = (a: Vec3): Vec3 => {
  const l = len(a) || 1
  return { x: a.x / l, y: a.y / l, z: a.z / l }
}

export const jointAngle = (a: Vec3, b: Vec3, c: Vec3): number => {
  const u = norm(sub(a, b))
  const v = norm(sub(c, b))
  return Math.PI - Math.acos(Math.min(1, Math.max(-1, dot(u, v))))
}

export const POSE = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftWrist: 15,
  rightWrist: 16,
} as const

export type PoseFrame = readonly Vec3[]
export type HandFrame = readonly Vec3[]

export const shoulderWidth = (pose: PoseFrame): number => {
  const l = pose[POSE.leftShoulder]
  const r = pose[POSE.rightShoulder]
  if (!l || !r) return 0
  return len(sub(l, r))
}

export const shoulderCenter = (pose: PoseFrame): Vec3 => {
  const l = pose[POSE.leftShoulder]
  const r = pose[POSE.rightShoulder]
  if (!l || !r) return { x: 0, y: 0, z: 0 }
  return { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2, z: (l.z + r.z) / 2 }
}

export type HandLabel = 'Left' | 'Right'

export type FrameInput = {
  hands: readonly { handedness: HandLabel; world: readonly Vec3[] }[]
  pose: PoseFrame | null
}

export const HAND_LANDMARKS = 21
export const HAND_LANDMARK_DIMS = HAND_LANDMARKS * 3
export const HAND_BLOCK_DIMS = HAND_LANDMARK_DIMS + 3
export const SIDE_OFFSET: Record<HandLabel, number> = { Left: 0, Right: HAND_BLOCK_DIMS }
export const FLAGS_OFFSET = HAND_BLOCK_DIMS * 2
export const FRAME_FEATURE_DIM = FLAGS_OFFSET + 2

export const HAND_WRIST_POSE_INDEX: Record<HandLabel, number> = {
  Left: POSE.leftWrist,
  Right: POSE.rightWrist,
}

export const HAND_LABEL_TO_USER_SIDE: Record<HandLabel, 'kanan' | 'kiri'> = {
  Left: 'kiri',
  Right: 'kanan',
}

export const FINGER_LANDMARKS = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
} as const

export const FINGER_TIPS = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
} as const

export const KNUCKLE_LANDMARKS = [5, 9, 13, 17] as const

export const frameFeatures = (input: FrameInput): Float32Array => {
  const out = new Float32Array(FRAME_FEATURE_DIM)

  const byLabel = new Map<HandLabel, readonly Vec3[]>()
  for (const hand of input.hands) {
    if (!byLabel.has(hand.handedness) && hand.world.length >= HAND_LANDMARKS) {
      byLabel.set(hand.handedness, hand.world)
    }
  }

  const width = input.pose ? shoulderWidth(input.pose) : 0
  const center = input.pose ? shoulderCenter(input.pose) : { x: 0, y: 0, z: 0 }

  for (const label of ['Left', 'Right'] as HandLabel[]) {
    const world = byLabel.get(label)
    const offset = SIDE_OFFSET[label]
    if (!world) continue

    const wrist = world[0]!
    const middleMcp = world[9]!
    const scale = len(sub(middleMcp, wrist)) || 1

    for (let i = 0; i < HAND_LANDMARKS; i++) {
      const point = world[i]!
      out[offset + i * 3] = (point.x - wrist.x) / scale
      out[offset + i * 3 + 1] = (point.y - wrist.y) / scale
      out[offset + i * 3 + 2] = (point.z - wrist.z) / scale
    }

    if (input.pose && width > 0) {
      const poseWrist = input.pose[HAND_WRIST_POSE_INDEX[label]]
      if (poseWrist) {
        out[offset + HAND_LANDMARK_DIMS] = (poseWrist.x - center.x) / width
        out[offset + HAND_LANDMARK_DIMS + 1] = (poseWrist.y - center.y) / width
        out[offset + HAND_LANDMARK_DIMS + 2] = (poseWrist.z - center.z) / width
      }
    }

    out[FLAGS_OFFSET + (label === 'Left' ? 0 : 1)] = 1
  }

  return out
}
