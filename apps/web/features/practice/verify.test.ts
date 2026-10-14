import { describe, expect, it } from 'vitest'
import { recordingWindowMs } from './verify'

describe('recordingWindowMs', () => {
  it('memberi waktu reaksi dan gerak yang lebih lambat dari peraga', () => {
    expect(recordingWindowMs(2000)).toBe(4000)
  })

  it('tidak lebih pendek dari 3 detik untuk isyarat singkat', () => {
    expect(recordingWindowMs(800)).toBe(3000)
  })
})
