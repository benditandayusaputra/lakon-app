import type { Quaternion } from 'three'
import type { CompiledFrame, QuatTuple } from '@lakon/sign-compiler'
import type { Finger } from '@lakon/sign-schema'
import { FINGER_NAMES, type FingerName, type Side } from './solver'
import type { AvatarRig } from './vrm'

const FINGER_TO_SCHEMA: Record<FingerName, Finger> = {
  thumb: 'thumb',
  index: 'index',
  middle: 'middle',
  ring: 'ring',
  little: 'pinky',
}

const setQuat = (target: Quaternion, tuple: QuatTuple) => {
  target.set(tuple[0], tuple[1], tuple[2], tuple[3])
}

export const applyCompiledFrame = (avatar: AvatarRig, frame: CompiledFrame) => {
  for (const side of ['left', 'right'] as Side[]) {
    const rig = avatar[side]
    const hand = frame.hands[side]
    if (rig.upperArm) setQuat(rig.upperArm.quaternion, hand.upperArm)
    if (rig.lowerArm) setQuat(rig.lowerArm.quaternion, hand.lowerArm)
    setQuat(rig.hand.quaternion, hand.hand)

    FINGER_NAMES.forEach((name, fingerIndex) => {
      const joints = rig.fingers[fingerIndex]!
      const quats = hand.fingers[FINGER_TO_SCHEMA[name]]
      for (let joint = 0; joint < 3; joint++) {
        setQuat(joints[joint]!.bone.quaternion, quats[joint]!)
      }
    })
  }
}
