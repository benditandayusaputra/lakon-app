import { Vector3, type Object3D } from 'three'
import type { VRMHumanBoneName } from '@pixiv/three-vrm'
import type { CompilerHandRig, CompilerRig, QuatTuple, Vec3Tuple } from '@lakon/sign-compiler'
import type { Finger } from '@lakon/sign-schema'
import type { AvatarRig } from './vrm'
import { FINGER_NAMES, type FingerName, type Side } from './solver'

const FINGER_TO_SCHEMA: Record<FingerName, Finger> = {
  thumb: 'thumb',
  index: 'index',
  middle: 'middle',
  ring: 'ring',
  little: 'pinky',
}

const worldPos = (object: Object3D): Vector3 =>
  new Vector3().setFromMatrixPosition(object.matrixWorld)

const tup = (v: Vector3): Vec3Tuple => [v.x, v.y, v.z]

export const extractCompilerRig = (avatar: AvatarRig): CompilerRig => {
  const humanoid = avatar.vrm.humanoid
  const body = (name: VRMHumanBoneName, fallback: VRMHumanBoneName): Vec3Tuple => {
    const node = humanoid.getNormalizedBoneNode(name) ?? humanoid.getNormalizedBoneNode(fallback)
    if (!node) throw new Error(`tulang tubuh tidak ditemukan: ${name}`)
    node.updateWorldMatrix(true, false)
    return tup(worldPos(node))
  }

  const hand = (side: Side): CompilerHandRig => {
    const rig = avatar[side]
    if (!rig.upperArm || !rig.lowerArm) {
      throw new Error(`lengan ${side} tidak lengkap di berkas VRM`)
    }
    rig.upperArm.updateWorldMatrix(true, true)

    const shoulder = worldPos(rig.upperArm)
    const elbow = worldPos(rig.lowerArm)
    const wrist = worldPos(rig.hand)

    const fingers = {} as CompilerHandRig['fingers']
    FINGER_NAMES.forEach((name, fingerIndex) => {
      const joints = rig.fingers[fingerIndex]!
      const first = worldPos(joints[0]!.bone)
      const second = worldPos(joints[1]!.bone)
      const third = worldPos(joints[2]!.bone)
      const tipOffset = third.clone().sub(second).multiplyScalar(0.8)
      fingers[FINGER_TO_SCHEMA[name]] = [
        tup(first.clone().sub(wrist)),
        tup(second.clone().sub(first)),
        tup(third.clone().sub(second)),
        tup(tipOffset),
      ]
    })

    return {
      shoulder: tup(shoulder),
      upperArmLength: elbow.clone().sub(shoulder).length(),
      lowerArmLength: wrist.clone().sub(elbow).length(),
      wristRest: tup(wrist),
      restFrame: rig.restFrame.toArray() as QuatTuple,
      upperArmRestDir: tup(rig.upperArmRestDir),
      lowerArmRestDir: tup(rig.lowerArmRestDir),
      thumbHingeAxis: tup(rig.thumbHingeAxis),
      fingers,
    }
  }

  const leftShoulder = worldPos(avatar.left.upperArm!)
  const rightShoulder = worldPos(avatar.right.upperArm!)

  return {
    shoulderWidth: leftShoulder.distanceTo(rightShoulder),
    body: {
      head: body('head', 'neck'),
      neck: body('neck', 'head'),
      chest: body('chest', 'spine'),
      hips: body('hips', 'spine'),
    },
    hands: { left: hand('left'), right: hand('right') },
  }
}

export type { CompilerRig }
