import { jointAngle } from '@lakon/cv-core'
import type { CompilerRig } from '@lakon/sign-compiler'
import { FINGERS, type Anchor, type Handshape, type SignPhase } from '@lakon/sign-schema'
import type { JointReadout } from '../avatar/solver'
import type { CollectFrame } from '../collect/store'
import type { Point3 } from '../practice/protocol'

const CHAINS: Record<
  'thumb' | 'index' | 'middle' | 'ring' | 'little',
  [number, number, number, number]
> = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  little: [17, 18, 19, 20],
}

const toDeg = (radians: number) => (radians * 180) / Math.PI

export const readoutFromLandmarks = (world: Point3[]): JointReadout => {
  const fingers = {} as JointReadout['fingers']
  for (const [name, chain] of Object.entries(CHAINS) as [
    keyof typeof CHAINS,
    [number, number, number, number],
  ][]) {
    const wrist = world[0]!
    const mcp = toDeg(jointAngle(wrist, world[chain[0]]!, world[chain[1]]!))
    const pip = toDeg(jointAngle(world[chain[0]]!, world[chain[1]]!, world[chain[2]]!))
    const dip = toDeg(jointAngle(world[chain[1]]!, world[chain[2]]!, world[chain[3]]!))
    fingers[name] = [mcp, pip, dip]
  }
  return { wristTwistDeg: 0, fingers }
}

const normalize = (v: Point3): Point3 => {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1
  return { x: v.x / length, y: v.y / length, z: v.z / length }
}

const POSE_WRIST: Record<'left' | 'right', number> = { left: 15, right: 16 }
const POSE_SHOULDERS = { left: 11, right: 12 }

export const reverseFramesFromRecording = (
  recording: CollectFrame[],
  side: 'left' | 'right',
  rig: CompilerRig,
): ReverseFrame[] => {
  const label = side === 'left' ? 'Left' : 'Right'
  const rigShoulderCenter = {
    x: (rig.hands.left.shoulder[0] + rig.hands.right.shoulder[0]) / 2,
    y: (rig.hands.left.shoulder[1] + rig.hands.right.shoulder[1]) / 2,
    z: (rig.hands.left.shoulder[2] + rig.hands.right.shoulder[2]) / 2,
  }

  const frames: ReverseFrame[] = []
  for (const frame of recording) {
    const hand = frame.hands.find((candidate) => candidate.handedness === label)
    const pose = frame.pose
    if (!hand || !pose || hand.world.length < 21) continue

    const l = pose[POSE_SHOULDERS.left]
    const r = pose[POSE_SHOULDERS.right]
    const wristPose = pose[POSE_WRIST[side]]
    if (!l || !r || !wristPose) continue
    const userShoulderWidth =
      Math.sqrt((l.x - r.x) ** 2 + (l.y - r.y) ** 2 + (l.z - r.z) ** 2) || 0.3
    const userCenter = {
      x: -((l.x + r.x) / 2),
      y: -((l.y + r.y) / 2),
      z: -((l.z + r.z) / 2),
    }
    const scale = rig.shoulderWidth / userShoulderWidth
    const wristAvatar = {
      x: (-wristPose.x - userCenter.x) * scale + rigShoulderCenter.x,
      y: (-wristPose.y - userCenter.y) * scale + rigShoulderCenter.y,
      z: (-wristPose.z - userCenter.z) * scale + rigShoulderCenter.z,
    }

    const avatarWorld = hand.world.map((point) => ({ x: -point.x, y: -point.y, z: -point.z }))
    const forward = normalize({
      x: avatarWorld[9]!.x - avatarWorld[0]!.x,
      y: avatarWorld[9]!.y - avatarWorld[0]!.y,
      z: avatarWorld[9]!.z - avatarWorld[0]!.z,
    })
    const across = normalize({
      x: avatarWorld[17]!.x - avatarWorld[5]!.x,
      y: avatarWorld[17]!.y - avatarWorld[5]!.y,
      z: avatarWorld[17]!.z - avatarWorld[5]!.z,
    })
    let palmNormal = normalize({
      x: forward.y * across.z - forward.z * across.y,
      y: forward.z * across.x - forward.x * across.z,
      z: forward.x * across.y - forward.y * across.x,
    })
    if (side === 'left') palmNormal = { x: -palmNormal.x, y: -palmNormal.y, z: -palmNormal.z }

    frames.push({
      timestamp: frame.timestamp,
      readout: readoutFromLandmarks(hand.world),
      wrist: wristAvatar,
      palmNormal,
      fingerDir: forward,
    })
  }
  return frames
}

export type ReverseFrame = {
  timestamp: number
  readout: JointReadout
  wrist: Point3
  palmNormal: Point3
  fingerDir: Point3
}

export const angleDistance = (readout: JointReadout, shape: Handshape): number => {
  const solverNames = ['thumb', 'index', 'middle', 'ring', 'little'] as const
  let total = 0
  solverNames.forEach((solverName, index) => {
    const schemaName = FINGERS[index]!
    const measured = readout.fingers[solverName]
    const target = shape.fingers[schemaName].flex
    for (let joint = 0; joint < 3; joint++) {
      total += Math.abs(measured[joint]! - target[joint]!)
    }
  })
  return total / 15
}

export const nearestHandshape = (
  readout: JointReadout,
  shapes: readonly Handshape[],
): { shape: Handshape; distance: number } => {
  if (shapes.length === 0) throw new Error('tidak ada kandidat handshape')
  let best = shapes[0]!
  let bestDistance = angleDistance(readout, best)
  for (const shape of shapes.slice(1)) {
    const distance = angleDistance(readout, shape)
    if (distance < bestDistance) {
      best = shape
      bestDistance = distance
    }
  }
  return { shape: best, distance: bestDistance }
}

const smooth = (values: number[], radius: number): number[] =>
  values.map((_, index) => {
    let sum = 0
    let count = 0
    for (let i = index - radius; i <= index + radius; i++) {
      if (i >= 0 && i < values.length) {
        sum += values[i]!
        count++
      }
    }
    return sum / count
  })

export type SpeedSegment = { startIndex: number; endIndex: number }

export const segmentBySpeed = (
  wrists: Point3[],
  timestamps: number[],
  maxSegments = 4,
): SpeedSegment[] => {
  if (wrists.length < 3) return [{ startIndex: 0, endIndex: Math.max(wrists.length - 1, 0) }]

  const speeds: number[] = [0]
  for (let i = 1; i < wrists.length; i++) {
    const dt = Math.max(timestamps[i]! - timestamps[i - 1]!, 1)
    const dx = wrists[i]!.x - wrists[i - 1]!.x
    const dy = wrists[i]!.y - wrists[i - 1]!.y
    const dz = wrists[i]!.z - wrists[i - 1]!.z
    speeds.push((Math.sqrt(dx * dx + dy * dy + dz * dz) / dt) * 1000)
  }
  const smoothed = smooth(speeds, 2)
  const peak = Math.max(...smoothed)
  if (peak <= 1e-6) return [{ startIndex: 0, endIndex: wrists.length - 1 }]
  const threshold = peak * 0.25

  const minima: number[] = []
  for (let i = 2; i < smoothed.length - 2; i++) {
    const value = smoothed[i]!
    if (
      value < threshold &&
      value <= smoothed[i - 1]! &&
      value <= smoothed[i + 1]! &&
      (minima.length === 0 || i - minima[minima.length - 1]! > 4)
    ) {
      minima.push(i)
    }
  }

  const boundaries = [0, ...minima, wrists.length - 1]
  const segments: SpeedSegment[] = []
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i]!
    const end = boundaries[i + 1]!
    if (end - start >= 2) segments.push({ startIndex: start, endIndex: end })
  }
  if (segments.length === 0) segments.push({ startIndex: 0, endIndex: wrists.length - 1 })

  while (segments.length > maxSegments) {
    let shortest = 0
    let shortestSpan = Infinity
    segments.forEach((segment, index) => {
      const span = segment.endIndex - segment.startIndex
      if (span < shortestSpan) {
        shortest = index
        shortestSpan = span
      }
    })
    const merged = segments[shortest]!
    if (shortest > 0) {
      segments[shortest - 1]!.endIndex = merged.endIndex
    } else {
      segments[1]!.startIndex = merged.startIndex
    }
    segments.splice(shortest, 1)
  }
  return segments
}

const DIRECTION_VECTORS: Record<string, Point3> = {
  up: { x: 0, y: 1, z: 0 },
  down: { x: 0, y: -1, z: 0 },
  forward: { x: 0, y: 0, z: 1 },
  back: { x: 0, y: 0, z: -1 },
  in: { x: 1, y: 0, z: 0 },
  out: { x: -1, y: 0, z: 0 },
}

export const nearestDirection = (dir: Point3, side: 'left' | 'right'): string => {
  const lateral = side === 'right' ? -1 : 1
  let best = 'forward'
  let bestDot = -Infinity
  for (const [word, vector] of Object.entries(DIRECTION_VECTORS)) {
    const wordVector =
      word === 'in'
        ? { x: -lateral, y: 0, z: 0 }
        : word === 'out'
          ? { x: lateral, y: 0, z: 0 }
          : vector
    const dot = dir.x * wordVector.x + dir.y * wordVector.y + dir.z * wordVector.z
    if (dot > bestDot) {
      bestDot = dot
      best = word
    }
  }
  return best
}

export const nearestAnchor = (
  wrist: Point3,
  anchors: Record<Anchor, [number, number, number]>,
): { anchor: Anchor; offset: [number, number, number] } => {
  let best: Anchor = 'ruang-netral'
  let bestDistance = Infinity
  for (const [anchor, position] of Object.entries(anchors) as [
    Anchor,
    [number, number, number],
  ][]) {
    const dx = wrist.x - position[0]
    const dy = wrist.y - position[1]
    const dz = wrist.z - position[2]
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (distance < bestDistance) {
      bestDistance = distance
      best = anchor
    }
  }
  const position = anchors[best]
  return {
    anchor: best,
    offset: [wrist.x - position[0], wrist.y - position[1], wrist.z - position[2]],
  }
}

const PHASE_NAMES_BY_COUNT: Record<number, SignPhase['name'][]> = {
  1: ['stroke'],
  2: ['onset', 'stroke'],
  3: ['onset', 'stroke', 'retraction'],
  4: ['onset', 'stroke', 'hold', 'retraction'],
}

export type DraftInput = {
  frames: ReverseFrame[]
  side: 'left' | 'right'
  shapes: readonly Handshape[]
  anchors: Record<Anchor, [number, number, number]>
  shoulderWidth: number
  signId: string
}

export const draftSignFromFrames = (input: DraftInput) => {
  const { frames, side, shapes, anchors, shoulderWidth, signId } = input
  if (frames.length < 3) throw new Error('rekaman terlalu pendek untuk dijadikan draf')

  const wrists = frames.map((frame) => frame.wrist)
  const timestamps = frames.map((frame) => frame.timestamp)
  const segments = segmentBySpeed(wrists, timestamps)
  const names = PHASE_NAMES_BY_COUNT[segments.length] ?? PHASE_NAMES_BY_COUNT[4]!

  const phases = segments.map((segment, index) => {
    const endFrame = frames[segment.endIndex]!
    const { shape } = nearestHandshape(endFrame.readout, shapes)
    const scaledWrist = {
      x: endFrame.wrist.x / shoulderWidth,
      y: endFrame.wrist.y / shoulderWidth,
      z: endFrame.wrist.z / shoulderWidth,
    }
    const scaledAnchors = Object.fromEntries(
      Object.entries(anchors).map(([anchor, position]) => [
        anchor,
        [position[0] / shoulderWidth, position[1] / shoulderWidth, position[2] / shoulderWidth],
      ]),
    ) as Record<Anchor, [number, number, number]>
    const { anchor, offset } = nearestAnchor(scaledWrist, scaledAnchors)
    const duration = Math.max(
      120,
      Math.round(timestamps[segment.endIndex]! - timestamps[segment.startIndex]!),
    )
    return {
      name: names[index] ?? 'stroke',
      duration,
      easing: 'ease-in-out' as const,
      dominant: {
        handshape: shape.id,
        location: {
          anchor,
          offset: [
            Math.round(offset[0] * 100) / 100,
            Math.round(offset[1] * 100) / 100,
            Math.round(offset[2] * 100) / 100,
          ] as [number, number, number],
        },
        orientation: {
          palm: nearestDirection(frames[segment.endIndex]!.palmNormal, side),
          fingers: nearestDirection(frames[segment.endIndex]!.fingerDir, side),
        },
      },
    }
  })

  const duration = phases.reduce((sum, phase) => sum + phase.duration, 0)

  return {
    id: signId,
    gloss: { id: signId.replace(/-/g, ' '), en: signId.replace(/-/g, ' ') },
    dialect: 'bisindo-jakarta',
    structure: 'dominant-only',
    dominance: side,
    duration,
    recognitionMode: true,
    phases,
    contact: null,
    nonManual: { brow: null, mouth: null, head: null, gaze: null },
    review: { status: 'draft', validatedBy: null, role: null, date: null },
  }
}
