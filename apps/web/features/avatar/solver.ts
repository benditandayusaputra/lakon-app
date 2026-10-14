import { Quaternion, Vector3, type Object3D } from 'three'
import {
  FINGER_HINGE_AXIS,
  HINGE_FLEX_MAX_DEG,
  MCP_FAN_AXIS,
  MCP_FAN_MAX_DEG,
  MCP_FLEX_MAX_DEG,
  THUMB_FLEX_MAX_DEG,
  frameFromDirections,
  twistAbout,
  type Side,
} from '@lakon/sign-compiler'
import type { Point3 } from '../practice/protocol'

export {
  FINGER_HINGE_AXIS,
  HINGE_FLEX_MAX_DEG,
  MCP_FAN_AXIS,
  MCP_FAN_MAX_DEG,
  MCP_FLEX_MAX_DEG,
  THUMB_FLEX_MAX_DEG,
  twistAbout,
}
export type { Side }

export const HAND_CHAINS = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  little: [17, 18, 19, 20],
} as const

export type FingerName = keyof typeof HAND_CHAINS
export const FINGER_NAMES = Object.keys(HAND_CHAINS) as FingerName[]

export const POSE_ARM_INDICES: Record<Side, { shoulder: number; elbow: number; wrist: number }> = {
  left: { shoulder: 12, elbow: 14, wrist: 16 },
  right: { shoulder: 11, elbow: 13, wrist: 15 },
}

export const mpToAvatar = (p: Point3) => new Vector3(-p.x, -p.y, -p.z)

type JointClamp = 'mcp' | 'hinge' | 'thumbFree' | 'thumbHinge'

type FingerJoint = {
  bone: Object3D
  restDir: Vector3
  clamp: JointClamp
}

export type HandBoneMap = {
  hand: Object3D
  upperArm: Object3D | null
  lowerArm: Object3D | null
  fingers: Record<FingerName, [Object3D, Object3D, Object3D]>
}

export type HandRig = {
  side: Side
  hand: Object3D
  upperArm: Object3D | null
  lowerArm: Object3D | null
  restFrame: Quaternion
  upperArmRestDir: Vector3
  lowerArmRestDir: Vector3
  forearmTwistAxis: Vector3
  thumbHingeAxis: Vector3
  fingers: FingerJoint[][]
}

export type SolveOptions = {
  clampEnabled?: boolean
  forearmTwistShare?: number
  swapSides?: boolean
}

export type JointReadout = {
  wristTwistDeg: number
  fingers: Record<FingerName, [number, number, number]>
}

const worldPosition = (object: Object3D) => new Vector3().setFromMatrixPosition(object.matrixWorld)

const directionBetween = (from: Object3D, to: Object3D) =>
  worldPosition(to).sub(worldPosition(from)).normalize()

export const palmFrame = (world: Vector3[], side: Side): Quaternion => {
  const forward = world[9]!.clone().sub(world[0]!).normalize()
  const across = world[17]!.clone().sub(world[5]!).normalize()
  return frameFromDirections(forward, across, side)
}

const clampedTwist = (q: Quaternion, axis: Vector3, minDeg: number, maxDeg: number) => {
  const { twist, deg } = twistAbout(q, axis)
  const clamped = Math.min(maxDeg, Math.max(minDeg, deg))
  return {
    quaternion: new Quaternion().setFromAxisAngle(axis, (clamped * Math.PI) / 180),
    rawTwist: twist,
    deg: clamped,
    rawDeg: deg,
  }
}

export const initHandRig = (side: Side, bones: HandBoneMap): HandRig => {
  bones.hand.updateWorldMatrix(true, true)

  const middleChain = bones.fingers.middle
  const restForward = directionBetween(bones.hand, middleChain[0])
  const restAcross = directionBetween(bones.fingers.index[0], bones.fingers.little[0])
  const restFrame = frameFromDirections(restForward, restAcross, side)

  const restNormal = new Vector3().crossVectors(restForward, restAcross).normalize()
  if (side === 'left') restNormal.negate()

  const thumbRestDir = directionBetween(bones.hand, bones.fingers.thumb[0])
  const thumbHingeAxis = new Vector3().crossVectors(restNormal, thumbRestDir).normalize()

  const fingers: FingerJoint[][] = FINGER_NAMES.map((name) => {
    const chain = bones.fingers[name]
    const isThumb = name === 'thumb'
    return chain.map((bone, index) => {
      const next = chain[index + 1]
      const restDir = next
        ? directionBetween(bone, next)
        : directionBetween(chain[index - 1]!, bone)
      const clamp: JointClamp = isThumb
        ? index === 0
          ? 'thumbFree'
          : 'thumbHinge'
        : index === 0
          ? 'mcp'
          : 'hinge'
      return { bone, restDir, clamp }
    })
  })

  const upperArmRestDir =
    bones.upperArm && bones.lowerArm
      ? directionBetween(bones.upperArm, bones.lowerArm)
      : new Vector3(side === 'left' ? 1 : -1, 0, 0)
  const lowerArmRestDir = bones.lowerArm
    ? directionBetween(bones.lowerArm, bones.hand)
    : upperArmRestDir.clone()

  return {
    side,
    hand: bones.hand,
    upperArm: bones.upperArm,
    lowerArm: bones.lowerArm,
    restFrame,
    upperArmRestDir,
    lowerArmRestDir,
    forearmTwistAxis: lowerArmRestDir.clone(),
    thumbHingeAxis,
    fingers,
  }
}

const solveDirectionBone = (
  bone: Object3D,
  restDir: Vector3,
  targetWorldDir: Vector3,
  accum: Quaternion,
) => {
  const dirLocal = targetWorldDir.clone().applyQuaternion(accum.clone().invert())
  const q = new Quaternion().setFromUnitVectors(restDir, dirLocal)
  bone.quaternion.copy(q)
  accum.multiply(q)
  return q
}

const applyFingerClamp = (
  joint: FingerJoint,
  q: Quaternion,
  side: Side,
  thumbHingeAxis: Vector3,
  clampEnabled: boolean,
): { quaternion: Quaternion; deg: number } => {
  const hinge = joint.clamp === 'thumbHinge' ? thumbHingeAxis : FINGER_HINGE_AXIS[side]

  if (joint.clamp === 'thumbFree') {
    const { deg } = twistAbout(q, hinge)
    return { quaternion: q, deg }
  }

  if (!clampEnabled) {
    const { deg } = twistAbout(q, hinge)
    return { quaternion: q, deg }
  }

  if (joint.clamp === 'hinge' || joint.clamp === 'thumbHinge') {
    const max = joint.clamp === 'hinge' ? HINGE_FLEX_MAX_DEG : THUMB_FLEX_MAX_DEG
    const flex = clampedTwist(q, hinge, 0, max)
    return { quaternion: flex.quaternion, deg: flex.deg }
  }

  const flex = clampedTwist(q, hinge, 0, MCP_FLEX_MAX_DEG)
  const swing = q.clone().multiply(flex.rawTwist.clone().invert())
  const fan = clampedTwist(swing, MCP_FAN_AXIS, -MCP_FAN_MAX_DEG, MCP_FAN_MAX_DEG)
  return { quaternion: fan.quaternion.multiply(flex.quaternion), deg: flex.deg }
}

export const solveHand = (
  rig: HandRig,
  handWorld: Point3[] | null,
  poseWorld: Point3[] | null,
  options: SolveOptions = {},
): JointReadout | null => {
  const clampEnabled = options.clampEnabled ?? true
  const twistShare = options.forearmTwistShare ?? 0.7

  const armSide = options.swapSides ? (rig.side === 'left' ? 'right' : 'left') : rig.side
  const armIndices = POSE_ARM_INDICES[armSide]
  const shoulder = poseWorld?.[armIndices.shoulder]
  const elbow = poseWorld?.[armIndices.elbow]
  const wrist = poseWorld?.[armIndices.wrist]
  const hasArm = Boolean(rig.upperArm && rig.lowerArm && shoulder && elbow && wrist)

  const hand = handWorld ? handWorld.map(mpToAvatar) : null
  const targetHandWorld = hand
    ? palmFrame(hand, rig.side).multiply(rig.restFrame.clone().invert())
    : null

  let accum: Quaternion

  if (hasArm && rig.upperArm && rig.lowerArm && shoulder && elbow && wrist) {
    accum = rig.upperArm.parent
      ? rig.upperArm.parent.getWorldQuaternion(new Quaternion())
      : new Quaternion()

    const shoulderPoint = mpToAvatar(shoulder)
    const elbowPoint = mpToAvatar(elbow)
    const wristPoint = mpToAvatar(wrist)

    solveDirectionBone(
      rig.upperArm,
      rig.upperArmRestDir,
      elbowPoint.clone().sub(shoulderPoint).normalize(),
      accum,
    )
    const beforeLower = accum.clone()
    solveDirectionBone(
      rig.lowerArm,
      rig.lowerArmRestDir,
      wristPoint.clone().sub(elbowPoint).normalize(),
      accum,
    )

    if (targetHandWorld) {
      const handFull = accum.clone().invert().multiply(targetHandWorld)
      const { twist } = twistAbout(handFull, rig.forearmTwistAxis)
      const forearmTwist = new Quaternion().slerp(twist, twistShare)
      rig.lowerArm.quaternion.multiply(forearmTwist)
      accum = beforeLower.multiply(rig.lowerArm.quaternion)
    }
  } else {
    accum = rig.hand.parent
      ? rig.hand.parent.getWorldQuaternion(new Quaternion())
      : new Quaternion()
  }

  if (!hand || !targetHandWorld) return null

  rig.hand.quaternion.copy(accum.clone().invert().multiply(targetHandWorld))
  const { deg: wristTwistDeg } = twistAbout(rig.hand.quaternion, rig.forearmTwistAxis)

  const readout: JointReadout = {
    wristTwistDeg,
    fingers: {
      thumb: [0, 0, 0],
      index: [0, 0, 0],
      middle: [0, 0, 0],
      ring: [0, 0, 0],
      little: [0, 0, 0],
    },
  }

  FINGER_NAMES.forEach((name, fingerIndex) => {
    const chain = HAND_CHAINS[name]
    const joints = rig.fingers[fingerIndex]!
    const fingerAccum = targetHandWorld.clone()

    joints.forEach((joint, jointIndex) => {
      const from = hand[chain[jointIndex]!]!
      const to = hand[chain[jointIndex + 1]!]!
      const dirWorld = to.clone().sub(from).normalize()
      const dirLocal = dirWorld.applyQuaternion(fingerAccum.clone().invert())
      const raw = new Quaternion().setFromUnitVectors(joint.restDir, dirLocal)
      const { quaternion, deg } = applyFingerClamp(
        joint,
        raw,
        rig.side,
        rig.thumbHingeAxis,
        clampEnabled,
      )
      joint.bone.quaternion.copy(quaternion)
      fingerAccum.multiply(quaternion)
      readout.fingers[name][jointIndex] = deg
    })
  })

  return readout
}

export const resetHandRig = (rig: HandRig) => {
  const identity = new Quaternion()
  rig.hand.quaternion.copy(identity)
  rig.upperArm?.quaternion.copy(identity)
  rig.lowerArm?.quaternion.copy(identity)
  for (const chain of rig.fingers) {
    for (const joint of chain) joint.bone.quaternion.copy(identity)
  }
}
