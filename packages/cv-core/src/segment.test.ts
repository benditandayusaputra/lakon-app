import { expect, test } from 'vitest'
import { FLAGS_OFFSET, FRAME_FEATURE_DIM } from './features'
import { trimToHands } from './segment'

const frame = (hand: boolean) => {
  const f = new Float32Array(FRAME_FEATURE_DIM)
  f[FLAGS_OFFSET + 1] = hand ? 1 : 0
  return f
}

test('trimToHands membuang frame tanpa tangan di luar jarak 3 frame', () => {
  const frames = [...Array(10).fill(false), true, false, true, ...Array(10).fill(false)].map(frame)
  const trimmed = trimToHands(frames)
  expect(trimmed).toHaveLength(3 + 3 + 3)
  expect(trimmed[3]).toBe(frames[10])
  expect(trimmed.at(-4)).toBe(frames[12])
})

test('trimToHands tidak mengubah rekaman yang sudah terpangkas', () => {
  const frames = [false, false, false, true, true, false, false, false].map(frame)
  expect(trimToHands(frames)).toEqual(frames)
})

test('trimToHands mengosongkan rekaman tanpa tangan sama sekali', () => {
  expect(trimToHands([false, false].map(frame))).toEqual([])
})
