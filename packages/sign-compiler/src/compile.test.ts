import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import {
  FLAGS_OFFSET,
  FRAME_FEATURE_DIM,
  HAND_LANDMARK_DIMS,
  SIDE_OFFSET,
  frameFeatures,
} from '@lakon/cv-core'
import type { Handshape, Sign } from '@lakon/sign-schema'
import {
  COMPILE_FPS,
  RELAXED_FINGERS,
  compileSign,
  evalPath,
  handshapeQuats,
  sampleCompiled,
  type CompiledFrame,
} from './compile'
import { frameFromDirections } from './geometry'
import type { CompilerHandRig, CompilerRig, Vec3Tuple } from './rig'

const FINGER_OFFSETS: Record<string, [Vec3Tuple, Vec3Tuple, Vec3Tuple, Vec3Tuple]> = {
  thumb: [
    [-0.03, 0, 0.03],
    [-0.03, 0, 0.02],
    [-0.025, 0, 0.015],
    [-0.02, 0, 0.01],
  ],
  index: [
    [-0.09, 0, 0.02],
    [-0.04, 0, 0],
    [-0.03, 0, 0],
    [-0.025, 0, 0],
  ],
  middle: [
    [-0.1, 0, 0],
    [-0.04, 0, 0],
    [-0.03, 0, 0],
    [-0.025, 0, 0],
  ],
  ring: [
    [-0.09, 0, -0.02],
    [-0.04, 0, -0],
    [-0.03, 0, 0],
    [-0.025, 0, 0],
  ],
  pinky: [
    [-0.08, 0, -0.04],
    [-0.03, 0, 0],
    [-0.025, 0, 0],
    [-0.02, 0, 0],
  ],
}

const mirrorTuple = (t: Vec3Tuple): Vec3Tuple => [-t[0], t[1], t[2]]

const buildHandRig = (side: 'left' | 'right'): CompilerHandRig => {
  const m = side === 'left' ? -1 : 1
  const restFrame = frameFromDirections(new Vector3(-m, 0, 0), new Vector3(0, 0, -1), side)
  const fingers = {} as CompilerHandRig['fingers']
  for (const [name, offsets] of Object.entries(FINGER_OFFSETS)) {
    fingers[name as keyof CompilerHandRig['fingers']] = (
      side === 'right' ? offsets : offsets.map(mirrorTuple)
    ) as [Vec3Tuple, Vec3Tuple, Vec3Tuple, Vec3Tuple]
  }
  const thumbDir = new Vector3(-m * 0.7, 0, 0.7).normalize()
  const thumbHinge = new Vector3().crossVectors(new Vector3(0, -1, 0), thumbDir).normalize()
  return {
    shoulder: [-m * 0.15, 1.4, 0],
    upperArmLength: 0.25,
    lowerArmLength: 0.25,
    wristRest: [-m * 0.65, 1.4, 0],
    restFrame: [restFrame.x, restFrame.y, restFrame.z, restFrame.w],
    upperArmRestDir: [-m, 0, 0],
    lowerArmRestDir: [-m, 0, 0],
    thumbHingeAxis: [thumbHinge.x, thumbHinge.y, thumbHinge.z],
    fingers,
  }
}

const rig: CompilerRig = {
  shoulderWidth: 0.3,
  body: {
    head: [0, 1.6, 0],
    neck: [0, 1.5, 0],
    chest: [0, 1.3, 0],
    hips: [0, 1.0, 0],
  },
  hands: { left: buildHandRig('left'), right: buildHandRig('right') },
}

const handshape = (id: string, closed = false): Handshape => ({
  id,
  label: { id, en: id },
  localName: null,
  dialect: 'bisindo-jakarta',
  fingers: {
    thumb: { flex: closed ? [20, 40, 0] : [10, 5, 0], abduct: 5, oppose: closed ? 40 : 0 },
    index: { flex: closed ? [90, 100, 70] : [0, 0, 0], abduct: 0 },
    middle: { flex: closed ? [90, 100, 70] : [0, 0, 0], abduct: 0 },
    ring: { flex: closed ? [90, 100, 70] : [0, 0, 0], abduct: 0 },
    pinky: { flex: closed ? [90, 100, 70] : [0, 0, 0], abduct: 0 },
  },
  usedIn: [],
  notes: null,
  source: 'candidate',
  review: { status: 'draft', validatedBy: null, role: null, date: null },
})

const shapes = [handshape('b-flat'), handshape('fist', true)]

const baseSign = (overrides: Partial<Sign> = {}): Sign => ({
  id: 'uji',
  gloss: { id: 'uji', en: 'test' },
  dialect: 'bisindo-jakarta',
  structure: 'symmetric',
  dominance: 'right',
  duration: 900,
  recognitionMode: true,
  phases: [
    {
      name: 'onset',
      duration: 300,
      easing: 'ease-out',
      dominant: {
        handshape: 'b-flat',
        location: { anchor: 'dada', offset: [0.1, 0, 0.2] },
        orientation: { palm: 'in', fingers: 'up' },
      },
    },
    {
      name: 'stroke',
      duration: 400,
      hold: 200,
      easing: 'ease-in-out',
      path: { shape: 'busur', curvature: 0.4, plane: 'sagittal' },
      dominant: {
        handshape: 'fist',
        location: { anchor: 'ruang-netral', offset: [0.2, -0.3, 0.3] },
        orientation: { palm: 'down', fingers: 'forward' },
      },
    },
  ],
  contact: null,
  nonManual: { brow: null, mouth: null, head: null, gaze: null },
  review: { status: 'draft', validatedBy: null, role: null, date: null },
  ...overrides,
})

const everyQuat = (frame: CompiledFrame, fn: (q: [number, number, number, number]) => void) => {
  for (const side of ['left', 'right'] as const) {
    const hand = frame.hands[side]
    fn(hand.upperArm)
    fn(hand.lowerArm)
    fn(hand.hand)
    for (const finger of Object.values(hand.fingers)) {
      for (const q of finger) fn(q)
    }
  }
}

describe('compileSign', () => {
  it('isyarat simetris menghasilkan dua tangan yang benar-benar bercermin', () => {
    const compiled = compileSign(baseSign(), shapes, rig)
    for (const frame of compiled.frames) {
      const right = frame.hands.right.wristPos
      const left = frame.hands.left.wristPos
      expect(left[0]).toBeCloseTo(-right[0], 5)
      expect(left[1]).toBeCloseTo(right[1], 5)
      expect(left[2]).toBeCloseTo(right[2], 5)
    }
  })

  it('durasi total keyframe sama dengan jumlah durasi fase', () => {
    const compiled = compileSign(baseSign(), shapes, rig)
    expect(compiled.duration).toBe(900)
    expect(compiled.frames[0]!.t).toBe(0)
    expect(compiled.frames.at(-1)!.t).toBe(900)
    expect(compiled.frames.length).toBe(Math.ceil((900 * COMPILE_FPS) / 1000) + 1)
  })

  it('rotasi hasil interpolasi selalu quaternion ternormalisasi', () => {
    const compiled = compileSign(baseSign(), shapes, rig)
    for (const frame of compiled.frames) {
      everyQuat(frame, (q) => {
        const length = Math.hypot(q[0], q[1], q[2], q[3])
        expect(Number.isFinite(length)).toBe(true)
        expect(length).toBeCloseTo(1, 5)
      })
    }
    const sampled = sampleCompiled(compiled, 450 + 8)
    everyQuat(sampled, (q) => {
      expect(Math.hypot(q[0], q[1], q[2], q[3])).toBeCloseTo(1, 5)
    })
  })

  it('referensi verifikasi berdimensi sama dengan normalisasi fitur landmark asli', () => {
    const compiled = compileSign(baseSign(), shapes, rig)
    const realHand = Array.from({ length: 21 }, (_, i) => ({ x: i * 0.01, y: 0.1, z: 0 }))
    const realPose = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0 }))
    realPose[11] = { x: 0.2, y: 0, z: 0 }
    realPose[12] = { x: -0.2, y: 0, z: 0 }
    const real = frameFeatures({
      hands: [{ handedness: 'Left', world: realHand }],
      pose: realPose,
    })

    expect(real.length).toBe(FRAME_FEATURE_DIM)
    expect(compiled.reference.length).toBe(compiled.frames.length)
    expect(compiled.phaseByFrame.length).toBe(compiled.frames.length)
    for (const frame of compiled.reference) {
      expect(frame.length).toBe(real.length)
      for (const value of frame) expect(Number.isFinite(value)).toBe(true)
    }
    expect(compiled.phaseByFrame[0]).toBe(0)
    expect(compiled.phaseByFrame.at(-1)).toBe(1)
  })

  it('dominant-only membiarkan tangan non-dominan di posisi istirahat', () => {
    const compiled = compileSign(baseSign({ structure: 'dominant-only' }), shapes, rig)
    const first = compiled.frames[0]!.hands.left.wristPos
    for (const frame of compiled.frames) {
      expect(frame.hands.left.wristPos).toEqual(first)
    }
    expect(first[1]).toBeLessThan(1.1)
    for (const frame of compiled.reference) {
      expect(frame[FLAGS_OFFSET]).toBe(0)
      expect(frame[FLAGS_OFFSET + 1]).toBe(1)
    }
  })

  it('kontak menggeser tangan aktif sehingga titik kontak bertemu', () => {
    const compiled = compileSign(
      baseSign({
        structure: 'asymmetric',
        duration: 300,
        phases: [
          {
            name: 'stroke',
            duration: 300,
            easing: 'linear',
            dominant: {
              handshape: 'index',
              location: { anchor: 'ruang-netral', offset: [0, 0, 0] },
              orientation: { palm: 'down', fingers: 'forward' },
            },
            nonDominant: {
              handshape: 'b-flat',
              location: { anchor: 'ruang-netral', offset: [0.3, -0.1, 0] },
              orientation: { palm: 'up', fingers: 'forward' },
            },
          },
        ],
        contact: { activePart: 'index-tip', passivePart: 'nondominant-palm', type: 'touch' },
      }),
      [...shapes, handshape('index')],
      rig,
    )
    const last = compiled.frames.at(-1)!
    expect(Number.isFinite(last.hands.right.wristPos[0])).toBe(true)
    const leftWrist = new Vector3(...last.hands.left.wristPos)
    const rightWrist = new Vector3(...last.hands.right.wristPos)
    expect(rightWrist.distanceTo(leftWrist)).toBeLessThan(0.3)
  })
  it.each([
    ['ujung-telunjuk', 'index-tip'],
    ['ujung-jari', 'middle-tip'],
  ])('bagian tangan %s diperlakukan sama dengan %s', (lokal, standar) => {
    const wristWith = (activePart: string) =>
      compileSign(
        baseSign({
          structure: 'dominant-only',
          duration: 300,
          phases: [
            {
              name: 'stroke',
              duration: 300,
              easing: 'linear',
              dominant: {
                handshape: 'b-flat',
                location: { anchor: 'dagu', offset: [0, -0.4, 0.2] },
                orientation: { palm: 'back', fingers: 'up' },
              },
            },
          ],
          contact: { activePart, passivePart: 'bibir', type: 'touch' },
        }),
        shapes,
        rig,
      ).frames.at(-1)!.hands.right.wristPos
    expect(wristWith(lokal)).toEqual(wristWith(standar))
    expect(wristWith(lokal)).not.toEqual(wristWith('telapak'))
  })
  it('referensi tangan kanan berada di sisi kanan tubuh dalam koordinat MediaPipe', () => {
    const compiled = compileSign(
      baseSign({
        structure: 'dominant-only',
        duration: 300,
        phases: [
          {
            name: 'stroke',
            duration: 300,
            easing: 'linear',
            dominant: {
              handshape: 'b-flat',
              location: { anchor: 'dada', offset: [0.5, 0, 0.3] },
              orientation: { palm: 'forward', fingers: 'up' },
            },
          },
        ],
      }),
      shapes,
      rig,
    )
    const last = compiled.reference.at(-1)!
    expect(last[SIDE_OFFSET.Right + HAND_LANDMARK_DIMS]).toBeLessThan(0)
  })
})

describe('handshapeQuats', () => {
  const thumbSpreadDeg = (side: 'left' | 'right', abduct: number) => {
    const hand = rig.hands[side]
    const fingers = structuredClone(RELAXED_FINGERS)
    fingers.thumb = { flex: [0, 0, 0], abduct, oppose: 0 }
    const quats = handshapeQuats(
      side,
      fingers,
      new Vector3(...hand.thumbHingeAxis),
      new Vector3(...hand.fingers.thumb[0]).normalize(),
    )
    const thumb = new Vector3(...hand.fingers.thumb[1]).applyQuaternion(quats.thumb[0])
    const index = new Vector3(...hand.fingers.index[1])
    return (thumb.angleTo(index) * 180) / Math.PI
  }

  it.each(['left', 'right'] as const)('abduct jempol membuka menjauhi telunjuk (%s)', (side) => {
    expect(thumbSpreadDeg(side, 45)).toBeGreaterThan(thumbSpreadDeg(side, 0) + 30)
  })
})

describe('evalPath', () => {
  it('semua bentuk lintasan mulai di A dan berakhir di B', () => {
    const a = new Vector3(0, 1, 0)
    const b = new Vector3(0.2, 1.2, 0.1)
    for (const shape of ['lurus', 'busur', 'lingkaran', 'zigzag', 'gelombang'] as const) {
      const start = evalPath({ shape, curvature: 0.4 }, a, b, 0, 0.3)
      const end = evalPath({ shape, curvature: 0.4 }, a, b, 1, 0.3)
      expect(start.distanceTo(a)).toBeLessThan(1e-6)
      expect(end.distanceTo(b)).toBeLessThan(1e-6)
    }
  })

  it('busur benar-benar melengkung di tengah', () => {
    const a = new Vector3(0, 1, 0)
    const b = new Vector3(0, 1, 0.4)
    const mid = evalPath({ shape: 'busur', curvature: 0.5, plane: 'sagittal' }, a, b, 0.5, 0.3)
    const straight = a.clone().lerp(b, 0.5)
    expect(mid.distanceTo(straight)).toBeGreaterThan(0.05)
  })
})

describe('sampleCompiled', () => {
  it('interpolasi posisi antara dua frame', () => {
    const compiled = compileSign(baseSign(), shapes, rig)
    const step = 1000 / compiled.fps
    const a = compiled.frames[3]!
    const b = compiled.frames[4]!
    const mid = sampleCompiled(compiled, a.t + step / 2)
    for (let axis = 0; axis < 3; axis++) {
      const expected = (a.hands.right.wristPos[axis]! + b.hands.right.wristPos[axis]!) / 2
      expect(mid.hands.right.wristPos[axis]).toBeCloseTo(expected, 6)
    }
  })
})
