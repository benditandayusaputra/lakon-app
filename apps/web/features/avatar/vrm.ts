import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM, type VRMHumanBoneName } from '@pixiv/three-vrm'
import { FINGER_NAMES, initHandRig, type HandBoneMap, type HandRig, type Side } from './solver'

export const AVATAR_URL = '/models/seed-san.vrm'

export type AvatarRig = {
  vrm: VRM
  left: HandRig
  right: HandRig
}

const FINGER_BONE_SUFFIXES: Record<(typeof FINGER_NAMES)[number], [string, string, string]> = {
  thumb: ['ThumbMetacarpal', 'ThumbProximal', 'ThumbDistal'],
  index: ['IndexProximal', 'IndexIntermediate', 'IndexDistal'],
  middle: ['MiddleProximal', 'MiddleIntermediate', 'MiddleDistal'],
  ring: ['RingProximal', 'RingIntermediate', 'RingDistal'],
  little: ['LittleProximal', 'LittleIntermediate', 'LittleDistal'],
}

const collectHandBones = (vrm: VRM, side: Side, missing: string[]): HandBoneMap | null => {
  const prefix = side
  const get = (suffix: string) => {
    const name = `${prefix}${suffix}` as VRMHumanBoneName
    const node = vrm.humanoid.getNormalizedBoneNode(name)
    if (!node) missing.push(name)
    return node
  }

  const hand = get('Hand')
  const upperArm = get('UpperArm')
  const lowerArm = get('LowerArm')

  const fingers = {} as HandBoneMap['fingers']
  for (const finger of FINGER_NAMES) {
    const [a, b, c] = FINGER_BONE_SUFFIXES[finger].map((suffix) => get(suffix))
    if (!a || !b || !c) return null
    fingers[finger] = [a, b, c]
  }

  if (!hand) return null
  return { hand, upperArm, lowerArm, fingers }
}

export const rigFromVrm = (vrm: VRM): AvatarRig => {
  VRMUtils.removeUnnecessaryVertices(vrm.scene)
  VRMUtils.combineSkeletons(vrm.scene)
  VRMUtils.combineMorphs(vrm)

  vrm.scene.traverse((object) => {
    object.frustumCulled = false
  })
  // Lengan robot di ransel Seed-san terbaca sebagai tangan ketiga saat peragaan.
  vrm.scene.getObjectByName('robo_arm')?.removeFromParent()

  const missing: string[] = []
  const leftBones = collectHandBones(vrm, 'left', missing)
  const rightBones = collectHandBones(vrm, 'right', missing)
  if (!leftBones || !rightBones) {
    throw new Error(`Berkas VRM tidak punya tulang humanoid wajib: ${missing.join(', ')}`)
  }

  vrm.scene.updateMatrixWorld(true)
  vrm.humanoid.normalizedHumanBonesRoot.updateWorldMatrix(true, true)

  const left = initHandRig('left', leftBones)
  const right = initHandRig('right', rightBones)

  return { vrm, left, right }
}

export const loadAvatar = async (url: string = AVATAR_URL): Promise<AvatarRig> => {
  const loader = new GLTFLoader()
  loader.register((parser) => new VRMLoaderPlugin(parser))
  const gltf = await loader.loadAsync(url)
  return rigFromVrm(gltf.userData.vrm as VRM)
}

export const disposeAvatar = (rig: AvatarRig) => {
  VRMUtils.deepDispose(rig.vrm.scene)
}
