import { describe, expect, it } from 'vitest'
import { ANCHORS, signSchema, type Anchor, type Handshape } from '@lakon/sign-schema'
import type { JointReadout } from '../avatar/solver'
import {
  angleDistance,
  draftSignFromFrames,
  nearestDirection,
  nearestHandshape,
  segmentBySpeed,
  type ReverseFrame,
} from './reverse'

const shape = (id: string, flexAll: [number, number, number]): Handshape => ({
  id,
  label: { id, en: id },
  localName: null,
  dialect: 'bisindo-jakarta',
  fingers: {
    thumb: { flex: flexAll, abduct: 0, oppose: 0 },
    index: { flex: flexAll, abduct: 0 },
    middle: { flex: flexAll, abduct: 0 },
    ring: { flex: flexAll, abduct: 0 },
    pinky: { flex: flexAll, abduct: 0 },
  },
  usedIn: [],
  notes: null,
  source: 'candidate',
  review: { status: 'draft', validatedBy: null, role: null, date: null },
})

const readout = (deg: number): JointReadout => ({
  wristTwistDeg: 0,
  fingers: {
    thumb: [deg, deg, deg],
    index: [deg, deg, deg],
    middle: [deg, deg, deg],
    ring: [deg, deg, deg],
    little: [deg, deg, deg],
  },
})

const flat = shape('b-flat', [0, 0, 0])
const fist = shape('fist', [90, 90, 90])

describe('nearestHandshape', () => {
  it('memilih kandidat dengan jarak sudut terkecil', () => {
    expect(nearestHandshape(readout(5), [flat, fist]).shape.id).toBe('b-flat')
    expect(nearestHandshape(readout(80), [flat, fist]).shape.id).toBe('fist')
    expect(angleDistance(readout(0), flat)).toBe(0)
  })
})

describe('segmentBySpeed', () => {
  it('memecah gerakan di titik minimum kecepatan', () => {
    const wrists = []
    const timestamps = []
    for (let i = 0; i < 60; i++) {
      timestamps.push(i * 33)
      if (i < 20) wrists.push({ x: i * 0.02, y: 0, z: 0 })
      else if (i < 30) wrists.push({ x: 0.4, y: 0, z: 0 })
      else wrists.push({ x: 0.4, y: (i - 30) * 0.02, z: 0 })
    }
    const segments = segmentBySpeed(wrists, timestamps)
    expect(segments.length).toBeGreaterThanOrEqual(2)
    expect(segments.length).toBeLessThanOrEqual(4)
    expect(segments[0]!.startIndex).toBe(0)
    expect(segments.at(-1)!.endIndex).toBe(59)
  })

  it('rekaman diam menghasilkan satu segmen', () => {
    const wrists = Array.from({ length: 20 }, () => ({ x: 0.1, y: 0.1, z: 0 }))
    const timestamps = wrists.map((_, i) => i * 33)
    expect(segmentBySpeed(wrists, timestamps)).toHaveLength(1)
  })
})

describe('nearestDirection', () => {
  it('memetakan vektor ke kata arah terdekat', () => {
    expect(nearestDirection({ x: 0, y: 0.9, z: 0.1 }, 'right')).toBe('up')
    expect(nearestDirection({ x: 0, y: 0, z: 1 }, 'right')).toBe('forward')
  })
})

describe('draftSignFromFrames', () => {
  it('menghasilkan draf yang lolos skema isyarat', () => {
    const anchors = Object.fromEntries(
      ANCHORS.map((anchor, i) => [anchor, [i * 0.05, 1 + i * 0.02, 0.1]]),
    ) as Record<Anchor, [number, number, number]>

    const frames: ReverseFrame[] = []
    for (let i = 0; i < 40; i++) {
      const moving = i < 20
      frames.push({
        timestamp: i * 33,
        readout: readout(moving ? 5 : 85),
        wrist: moving ? { x: i * 0.01, y: 1.2, z: 0.1 } : { x: 0.2, y: 1.2, z: 0.1 },
        palmNormal: { x: 0, y: 0, z: 1 },
        fingerDir: { x: 0, y: 1, z: 0 },
      })
    }

    const draft = draftSignFromFrames({
      frames,
      side: 'right',
      shapes: [flat, fist],
      anchors,
      shoulderWidth: 0.35,
      signId: 'draf-uji',
    })

    const parsed = signSchema.safeParse(draft)
    expect(parsed.success, JSON.stringify(parsed.success ? '' : parsed.error.issues)).toBe(true)
    if (parsed.success) {
      expect(parsed.data.duration).toBe(
        parsed.data.phases.reduce((sum, phase) => sum + phase.duration + (phase.hold ?? 0), 0),
      )
    }
  })
})
