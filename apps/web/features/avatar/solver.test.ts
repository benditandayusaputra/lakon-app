import { describe, expect, it } from 'vitest'
import { Object3D, Quaternion, Vector3 } from 'three'
import {
  FINGER_HINGE_AXIS,
  FINGER_NAMES,
  initHandRig,
  palmFrame,
  solveHand,
  twistAbout,
  type HandBoneMap,
  type HandRig,
  type Side,
} from './solver'
import type { Point3 } from '../practice/protocol'

type Vec = [number, number, number]

const REST_POSITIONS: Record<
  Side,
  {
    shoulder: Vec
    lowerArm: Vec
    hand: Vec
    chains: Record<(typeof FINGER_NAMES)[number], [Vec, Vec, Vec, Vec]>
  }
> = {
  right: {
    shoulder: [-0.15, 1.4, 0],
    lowerArm: [-0.4, 1.4, 0],
    hand: [-0.65, 1.4, 0],
    chains: {
      thumb: [
        [-0.68, 1.4, 0.03],
        [-0.71, 1.4, 0.05],
        [-0.735, 1.4, 0.065],
        [-0.755, 1.4, 0.075],
      ],
      index: [
        [-0.74, 1.4, 0.02],
        [-0.78, 1.4, 0.02],
        [-0.81, 1.4, 0.02],
        [-0.835, 1.4, 0.02],
      ],
      middle: [
        [-0.75, 1.4, 0],
        [-0.79, 1.4, 0],
        [-0.82, 1.4, 0],
        [-0.845, 1.4, 0],
      ],
      ring: [
        [-0.74, 1.4, -0.02],
        [-0.78, 1.4, -0.02],
        [-0.81, 1.4, -0.02],
        [-0.835, 1.4, -0.02],
      ],
      little: [
        [-0.73, 1.4, -0.04],
        [-0.76, 1.4, -0.04],
        [-0.785, 1.4, -0.04],
        [-0.805, 1.4, -0.04],
      ],
    },
  },
  left: {
    shoulder: [0.15, 1.4, 0],
    lowerArm: [0.4, 1.4, 0],
    hand: [0.65, 1.4, 0],
    chains: {
      thumb: [
        [0.68, 1.4, 0.03],
        [0.71, 1.4, 0.05],
        [0.735, 1.4, 0.065],
        [0.755, 1.4, 0.075],
      ],
      index: [
        [0.74, 1.4, 0.02],
        [0.78, 1.4, 0.02],
        [0.81, 1.4, 0.02],
        [0.835, 1.4, 0.02],
      ],
      middle: [
        [0.75, 1.4, 0],
        [0.79, 1.4, 0],
        [0.82, 1.4, 0],
        [0.845, 1.4, 0],
      ],
      ring: [
        [0.74, 1.4, -0.02],
        [0.78, 1.4, -0.02],
        [0.81, 1.4, -0.02],
        [0.835, 1.4, -0.02],
      ],
      little: [
        [0.73, 1.4, -0.04],
        [0.76, 1.4, -0.04],
        [0.785, 1.4, -0.04],
        [0.805, 1.4, -0.04],
      ],
    },
  },
}

const attach = (parent: Object3D, worldPos: Vec, parentWorldPos: Vec) => {
  const node = new Object3D()
  node.position.set(
    worldPos[0] - parentWorldPos[0],
    worldPos[1] - parentWorldPos[1],
    worldPos[2] - parentWorldPos[2],
  )
  parent.add(node)
  return node
}

const buildRig = (side: Side): { rig: HandRig; root: Object3D } => {
  const spec = REST_POSITIONS[side]
  const root = new Object3D()
  const upperArm = attach(root, spec.shoulder, [0, 0, 0])
  const lowerArm = attach(upperArm, spec.lowerArm, spec.shoulder)
  const hand = attach(lowerArm, spec.hand, spec.lowerArm)

  const fingers = {} as HandBoneMap['fingers']
  for (const name of FINGER_NAMES) {
    const chain = spec.chains[name]
    const first = attach(hand, chain[0], spec.hand)
    const second = attach(first, chain[1], chain[0])
    const third = attach(second, chain[2], chain[1])
    fingers[name] = [first, second, third]
  }

  root.updateMatrixWorld(true)
  const rig = initHandRig(side, { hand, upperArm, lowerArm, fingers })
  return { rig, root }
}

const toMp = (p: Vec): Point3 => ({ x: -p[0], y: -p[1], z: -p[2] })

const restHandLandmarks = (side: Side): Point3[] => {
  const spec = REST_POSITIONS[side]
  const points: Point3[] = [toMp(spec.hand)]
  for (const name of FINGER_NAMES) {
    for (const joint of spec.chains[name]) points.push(toMp(joint))
  }
  return points
}

const restPoseLandmarks = (side: Side): Point3[] => {
  const spec = REST_POSITIONS[side]
  const points: Point3[] = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0 }))
  const indices =
    side === 'right'
      ? { shoulder: 11, elbow: 13, wrist: 15 }
      : { shoulder: 12, elbow: 14, wrist: 16 }
  points[indices.shoulder] = toMp(spec.shoulder)
  points[indices.elbow] = toMp(spec.lowerArm)
  points[indices.wrist] = toMp(spec.hand)
  return points
}

const expectNearIdentity = (q: Quaternion, epsilon = 1e-4) => {
  expect(Math.abs(q.w)).toBeGreaterThan(1 - epsilon)
}

const rotateLandmarks = (
  points: Point3[],
  pivot: Point3,
  axis: Vector3,
  degrees: number,
): Point3[] => {
  const q = new Quaternion().setFromAxisAngle(axis, (degrees * Math.PI) / 180)
  return points.map((p) => {
    const v = new Vector3(p.x - pivot.x, p.y - pivot.y, p.z - pivot.z).applyQuaternion(q)
    return { x: v.x + pivot.x, y: v.y + pivot.y, z: v.z + pivot.z }
  })
}

describe('initHandRig', () => {
  it('menghasilkan bingkai istirahat yang ternormalisasi', () => {
    for (const side of ['left', 'right'] as Side[]) {
      const { rig } = buildRig(side)
      expect(rig.restFrame.length()).toBeCloseTo(1, 6)
      expect(rig.fingers).toHaveLength(5)
      for (const chain of rig.fingers) {
        for (const joint of chain) expect(joint.restDir.length()).toBeCloseTo(1, 6)
      }
    }
  })
})

describe('solveHand pada pose istirahat', () => {
  it.each(['left', 'right'] as Side[])('%s: seluruh sendi mendekati identitas', (side) => {
    const { rig } = buildRig(side)
    const readout = solveHand(rig, restHandLandmarks(side), restPoseLandmarks(side))
    expect(readout).not.toBeNull()
    expectNearIdentity(rig.hand.quaternion, 1e-3)
    expectNearIdentity(rig.upperArm!.quaternion, 1e-3)
    expectNearIdentity(rig.lowerArm!.quaternion, 1e-3)
    for (const name of FINGER_NAMES) {
      for (const angle of readout!.fingers[name]) {
        expect(Math.abs(angle)).toBeLessThan(2)
      }
    }
  })

  it('tanpa pose landmark tetap menyelesaikan tangan', () => {
    const { rig } = buildRig('right')
    const readout = solveHand(rig, restHandLandmarks('right'), null)
    expect(readout).not.toBeNull()
    expectNearIdentity(rig.hand.quaternion, 1e-3)
  })
})

describe('tekukan jari', () => {
  it('telunjuk menekuk 90 derajat di sendi pangkal sekitar sumbu engsel', () => {
    const { rig } = buildRig('right')
    const spec = REST_POSITIONS.right
    const landmarks = restHandLandmarks('right')
    const proximal = spec.chains.index[0]
    const bent: Vec[] = [
      proximal,
      [proximal[0], proximal[1] - 0.04, proximal[2]],
      [proximal[0], proximal[1] - 0.07, proximal[2]],
      [proximal[0], proximal[1] - 0.095, proximal[2]],
    ]
    for (let i = 0; i < 4; i++) landmarks[5 + i] = toMp(bent[i]!)

    const readout = solveHand(rig, landmarks, restPoseLandmarks('right'))
    expect(readout!.fingers.index[0]).toBeCloseTo(90, 0)
    expect(Math.abs(readout!.fingers.index[1])).toBeLessThan(3)
    expect(Math.abs(readout!.fingers.index[2])).toBeLessThan(3)

    const { deg } = twistAbout(rig.fingers[1]![0]!.bone.quaternion, FINGER_HINGE_AXIS.right)
    expect(deg).toBeCloseTo(90, 0)
  })

  it('hiperekstensi dijepit ke nol saat penjepitan aktif', () => {
    const { rig } = buildRig('right')
    const spec = REST_POSITIONS.right
    const landmarks = restHandLandmarks('right')
    const proximal = spec.chains.index[0]
    const bentBack: Vec[] = [
      proximal,
      [proximal[0], proximal[1] + 0.04, proximal[2]],
      [proximal[0], proximal[1] + 0.07, proximal[2]],
      [proximal[0], proximal[1] + 0.095, proximal[2]],
    ]
    for (let i = 0; i < 4; i++) landmarks[5 + i] = toMp(bentBack[i]!)

    const clamped = solveHand(rig, landmarks, null, { clampEnabled: true })
    expect(clamped!.fingers.index[0]).toBeCloseTo(0, 1)
    expectNearIdentity(rig.fingers[1]![0]!.bone.quaternion, 1e-3)

    const free = solveHand(rig, landmarks, null, { clampEnabled: false })
    expect(free!.fingers.index[0]).toBeLessThan(-45)
  })

  it('arah berlawanan 180 derajat tidak menghasilkan NaN', () => {
    const { rig } = buildRig('right')
    const spec = REST_POSITIONS.right
    const landmarks = restHandLandmarks('right')
    const proximal = spec.chains.index[0]
    const reversed: Vec[] = [
      proximal,
      [proximal[0] + 0.04, proximal[1], proximal[2]],
      [proximal[0] + 0.07, proximal[1], proximal[2]],
      [proximal[0] + 0.095, proximal[1], proximal[2]],
    ]
    for (let i = 0; i < 4; i++) landmarks[5 + i] = toMp(reversed[i]!)

    solveHand(rig, landmarks, null, { clampEnabled: false })
    const q = rig.fingers[1]![0]!.bone.quaternion
    expect(Number.isFinite(q.x)).toBe(true)
    expect(Number.isFinite(q.y)).toBe(true)
    expect(Number.isFinite(q.z)).toBe(true)
    expect(Number.isFinite(q.w)).toBe(true)
    expect(q.length()).toBeCloseTo(1, 4)
  })
})

describe('putaran lengan bawah', () => {
  it('membagi putaran telapak 70 persen ke lengan bawah dan 30 persen ke pergelangan', () => {
    const { rig } = buildRig('right')
    const spec = REST_POSITIONS.right
    const pivot = toMp(spec.hand)
    const rotated = rotateLandmarks(restHandLandmarks('right'), pivot, new Vector3(1, 0, 0), 170)

    solveHand(rig, rotated, restPoseLandmarks('right'))

    const lower = twistAbout(rig.lowerArm!.quaternion, rig.forearmTwistAxis)
    const hand = twistAbout(rig.hand.quaternion, rig.forearmTwistAxis)
    expect(Math.abs(lower.deg)).toBeCloseTo(0.7 * 170, 0)
    expect(Math.abs(hand.deg)).toBeCloseTo(0.3 * 170, 0)
    expect(Math.abs(lower.deg) + Math.abs(hand.deg)).toBeCloseTo(170, 0)
  })
})

describe('palmFrame', () => {
  it('mengembalikan quaternion satuan untuk kedua sisi', () => {
    for (const side of ['left', 'right'] as Side[]) {
      const world = restHandLandmarks(side).map((p) => new Vector3(-p.x, -p.y, -p.z))
      const frame = palmFrame(world, side)
      expect(frame.length()).toBeCloseTo(1, 6)
    }
  })
})
