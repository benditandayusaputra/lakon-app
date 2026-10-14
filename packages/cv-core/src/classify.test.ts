import { describe, expect, it } from 'vitest'
import { createPredictionStabilizer, fuseDecision } from './classify'

describe('createPredictionStabilizer', () => {
  it('menerima jawaban hanya setelah cukup suara dengan keyakinan tinggi', () => {
    const stabilizer = createPredictionStabilizer()
    for (let i = 0; i < 5; i++) {
      expect(stabilizer.push({ label: 'kopi', confidence: 0.95 }).label).toBeNull()
    }
    expect(stabilizer.push({ label: 'kopi', confidence: 0.95 }).label).toBe('kopi')
  })

  it('menolak bila keyakinan rata-rata rendah', () => {
    const stabilizer = createPredictionStabilizer()
    let result = stabilizer.current()
    for (let i = 0; i < 10; i++) {
      result = stabilizer.push({ label: 'kopi', confidence: 0.5 })
    }
    expect(result.label).toBeNull()
    expect(result.votes).toBe(10)
  })

  it('keluaran tidak berkedip saat kelas bersaing', () => {
    const stabilizer = createPredictionStabilizer()
    for (let i = 0; i < 10; i++) {
      stabilizer.push({ label: i % 2 === 0 ? 'kopi' : 'teh', confidence: 0.95 })
    }
    expect(stabilizer.current().label).toBeNull()
  })

  it('shouldInfer mengikuti inferEvery', () => {
    const stabilizer = createPredictionStabilizer({ inferEvery: 3 })
    const decisions = Array.from({ length: 9 }, () => stabilizer.shouldInfer())
    expect(decisions).toEqual([false, false, true, false, false, true, false, false, true])
  })

  it('parameter bisa disetel ulang', () => {
    const stabilizer = createPredictionStabilizer({ minVotes: 2, minConfidence: 0.5 })
    stabilizer.push({ label: 'teh', confidence: 0.6 })
    expect(stabilizer.push({ label: 'teh', confidence: 0.6 }).label).toBe('teh')
    stabilizer.setParams({ minVotes: 8 })
    expect(stabilizer.current().label).toBeNull()
  })
})

describe('fuseDecision', () => {
  const base = { expectedSign: 'kopi', dtwThreshold: 5 }

  it('klasifikasi benar dan DTW baik: lulus', () => {
    expect(fuseDecision({ ...base, stableLabel: 'kopi', dtwScore: 3 })).toEqual({
      kind: 'lulus',
      reason: 'klasifikasi-dan-dtw',
    })
  })

  it('klasifikasi benar tapi DTW rendah: lulus dengan catatan', () => {
    expect(fuseDecision({ ...base, stableLabel: 'kopi', dtwScore: 9 }).kind).toBe(
      'lulus-dengan-catatan',
    )
  })

  it('klasifikasi salah: belum tepat', () => {
    expect(fuseDecision({ ...base, stableLabel: 'teh', dtwScore: 1 }).kind).toBe('belum-tepat')
  })

  it('tanpa klasifikasi sistem tetap berfungsi dengan DTW saja', () => {
    expect(fuseDecision({ ...base, stableLabel: null, dtwScore: 3 })).toEqual({
      kind: 'lulus',
      reason: 'dtw-saja',
    })
    expect(fuseDecision({ ...base, stableLabel: null, dtwScore: 9 }).kind).toBe('belum-tepat')
  })
})
