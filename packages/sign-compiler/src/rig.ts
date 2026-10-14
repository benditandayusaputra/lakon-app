import { type Anchor, ANCHORS, type Finger } from '@lakon/sign-schema'
import type { Side } from './geometry'

export type Vec3Tuple = [number, number, number]
export type QuatTuple = [number, number, number, number]

export type CompilerHandRig = {
  shoulder: Vec3Tuple
  upperArmLength: number
  lowerArmLength: number
  wristRest: Vec3Tuple
  restFrame: QuatTuple
  upperArmRestDir: Vec3Tuple
  lowerArmRestDir: Vec3Tuple
  thumbHingeAxis: Vec3Tuple
  fingers: Record<Finger, [Vec3Tuple, Vec3Tuple, Vec3Tuple, Vec3Tuple]>
}

export type CompilerBodyRef = {
  head: Vec3Tuple
  neck: Vec3Tuple
  chest: Vec3Tuple
  hips: Vec3Tuple
}

export type CompilerRig = {
  shoulderWidth: number
  body: CompilerBodyRef
  hands: Record<Side, CompilerHandRig>
}

export const deriveAnchors = (rig: CompilerRig, dominance: Side): Record<Anchor, Vec3Tuple> => {
  const s = rig.shoulderWidth
  const { head, neck, chest, hips } = rig.body
  const domHand = rig.hands[dominance]
  const nonDomSide: Side = dominance === 'right' ? 'left' : 'right'
  const nonDomHand = rig.hands[nonDomSide]
  const lateral = dominance === 'right' ? -1 : 1

  const at = (base: Vec3Tuple, dx: number, dy: number, dz: number): Vec3Tuple => [
    base[0] + dx * s,
    base[1] + dy * s,
    base[2] + dz * s,
  ]

  const anchors: Record<Anchor, Vec3Tuple> = {
    dahi: at(head, 0, 0.35, 0.4),
    pelipis: at(head, lateral * 0.25, 0.3, 0.28),
    mata: at(head, lateral * 0.1, 0.22, 0.4),
    hidung: at(head, 0, 0.12, 0.42),
    pipi: at(head, lateral * 0.2, 0.08, 0.34),
    dagu: at(head, 0, -0.05, 0.38),
    telinga: at(head, lateral * 0.3, 0.15, 0.1),
    leher: at(neck, 0, 0, 0.3),
    bahu: [domHand.shoulder[0], domHand.shoulder[1] + 0.05 * s, domHand.shoulder[2] + 0.1 * s],
    dada: at(chest, 0, 0.1, 0.45),
    'ulu-hati': at(chest, 0, -0.15, 0.45),
    perut: at(hips, 0, 0.15, 0.45),
    'lengan-atas': [
      (nonDomHand.shoulder[0] * 2) / 3 + (nonDomHand.wristRest[0] * 1) / 3,
      nonDomHand.shoulder[1],
      nonDomHand.shoulder[2] + 0.15 * s,
    ],
    'lengan-bawah': [
      (nonDomHand.shoulder[0] + nonDomHand.wristRest[0]) / 2,
      nonDomHand.shoulder[1] - 0.1 * s,
      nonDomHand.shoulder[2] + 0.2 * s,
    ],
    'telapak-nondominan': at(chest, -lateral * 0.25, -0.35, 0.55),
    'punggung-tangan-nondominan': at(chest, -lateral * 0.25, -0.3, 0.55),
    'ruang-netral': at(chest, 0, -0.2, 0.6),
  }

  for (const anchor of ANCHORS) {
    if (!anchors[anchor]) throw new Error(`anchor not defined: ${anchor}`)
  }
  return anchors
}
