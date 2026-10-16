import { expect, test } from 'vitest'
import {
  FLAGS_OFFSET,
  FRAME_FEATURE_DIM,
  HAND_LABEL_TO_USER_SIDE,
  HAND_LANDMARK_DIMS,
  SIDE_OFFSET,
  dtw,
  dtwDetailed,
  featureDistance,
  frameFeatures,
  jointAngle,
  mirrorFeatures,
  shoulderWidth,
} from './index'

const hand = (offset = 0) =>
  Array.from({ length: 21 }, (_, i) => ({ x: offset + i * 0.01, y: 0.4, z: 0 }))

const pose = () => {
  const points = Array.from({ length: 33 }, () => ({ x: 0, y: 0, z: 0 }))
  points[11] = { x: 0.2, y: 0, z: 0 }
  points[12] = { x: -0.2, y: 0, z: 0 }
  points[15] = { x: 0.25, y: 0.3, z: 0 }
  points[16] = { x: -0.25, y: 0.3, z: 0 }
  return points
}

test('dtw simetris dan nol untuk urutan identik', () => {
  const a = [new Float32Array([0, 0]), new Float32Array([1, 1])]
  const b = [new Float32Array([0, 0]), new Float32Array([1, 1]), new Float32Array([1, 1])]
  expect(dtw(a, a)).toBe(0)
  expect(dtw(a, b)).toBeCloseTo(dtw(b, a), 9)
  expect(featureDistance(a[0]!, a[1]!)).toBeCloseTo(Math.SQRT2, 6)
})

test('dtwDetailed mengembalikan jalur monoton dan skor nol untuk urutan identik', () => {
  const seq = [new Float32Array([0, 0]), new Float32Array([1, 0]), new Float32Array([2, 0])]
  const result = dtwDetailed(seq, seq)
  expect(result.score).toBe(0)
  expect(result.path[0]).toEqual([0, 0])
  expect(result.path.at(-1)).toEqual([2, 2])
  for (let i = 1; i < result.path.length; i++) {
    expect(result.path[i]![0]).toBeGreaterThanOrEqual(result.path[i - 1]![0])
    expect(result.path[i]![1]).toBeGreaterThanOrEqual(result.path[i - 1]![1])
  }
})

test('frameFeatures berdimensi tetap untuk semua kombinasi tangan', () => {
  const both = frameFeatures({
    hands: [
      { handedness: 'Left', world: hand() },
      { handedness: 'Right', world: hand(0.3) },
    ],
    pose: pose(),
  })
  const leftOnly = frameFeatures({ hands: [{ handedness: 'Left', world: hand() }], pose: pose() })
  const none = frameFeatures({ hands: [], pose: pose() })

  expect(both.length).toBe(FRAME_FEATURE_DIM)
  expect(leftOnly.length).toBe(FRAME_FEATURE_DIM)
  expect(none.length).toBe(FRAME_FEATURE_DIM)
  expect(both[FLAGS_OFFSET]).toBe(1)
  expect(both[FLAGS_OFFSET + 1]).toBe(1)
  expect(leftOnly[FLAGS_OFFSET]).toBe(1)
  expect(leftOnly[FLAGS_OFFSET + 1]).toBe(0)
  expect(none[FLAGS_OFFSET]).toBe(0)
  for (let i = SIDE_OFFSET.Right; i < SIDE_OFFSET.Right + HAND_LANDMARK_DIMS; i++) {
    expect(leftOnly[i]).toBe(0)
  }
})

test('pergelangan dinormalisasi terhadap lebar bahu dan urutan tangan berdasar label', () => {
  const swapped = frameFeatures({
    hands: [
      { handedness: 'Right', world: hand(0.3) },
      { handedness: 'Left', world: hand() },
    ],
    pose: pose(),
  })
  const ordered = frameFeatures({
    hands: [
      { handedness: 'Left', world: hand() },
      { handedness: 'Right', world: hand(0.3) },
    ],
    pose: pose(),
  })
  expect([...swapped]).toEqual([...ordered])

  expect(shoulderWidth(pose())).toBeCloseTo(0.4, 6)
  const wristBase = SIDE_OFFSET.Left + HAND_LANDMARK_DIMS
  expect(ordered[wristBase]).toBeCloseTo(0.25 / 0.4, 5)
  expect(ordered[wristBase + 1]).toBeCloseTo(0.3 / 0.4, 5)

  expect(jointAngle({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })).toBeCloseTo(
    0,
    6,
  )
})

test('label tangan dipasangkan dengan pergelangan pose di sisi yang sama', () => {
  const features = frameFeatures({ hands: [{ handedness: 'Right', world: hand() }], pose: pose() })
  expect(features[SIDE_OFFSET.Right + HAND_LANDMARK_DIMS]).toBeCloseTo(-0.625, 5)
  expect(HAND_LABEL_TO_USER_SIDE.Right).toBe('kanan')
})

test('mirrorFeatures menukar tangan, membalik x, dan kembali utuh bila dicerminkan dua kali', () => {
  const frame = new Float32Array(FRAME_FEATURE_DIM)
  frame.set([0.5, -0.2, 0.1], SIDE_OFFSET.Right)
  frame[FLAGS_OFFSET + 1] = 1
  const mirrored = mirrorFeatures(frame)
  expect(Array.from(mirrored.subarray(SIDE_OFFSET.Left, SIDE_OFFSET.Left + 3))).toEqual([
    -0.5,
    expect.closeTo(-0.2),
    expect.closeTo(0.1),
  ])
  expect(mirrored[FLAGS_OFFSET]).toBe(1)
  expect(mirrored[FLAGS_OFFSET + 1]).toBe(0)
  expect(Array.from(mirrorFeatures(mirrored))).toEqual(Array.from(frame))
})
