import { describe, expect, it } from 'vitest'
import { riwayatPerIsyarat, ringkas, type AttemptEntry } from './riwayat'

const a = (signId: string, similarity: number | null, passed: boolean, createdAt: number) =>
  ({ signId, similarity, passed, createdAt }) satisfies AttemptEntry

describe('ringkas', () => {
  it('menghitung persen berhasil dan rata-rata kemiripan', () => {
    const hasil = ringkas([a('x', 40, false, 1), a('x', 90, true, 2), a('y', 80, true, 3)])
    expect(hasil).toEqual({ total: 3, berhasil: 2, persenBerhasil: 67, rataKemiripan: 70 })
  })

  it('mengabaikan percobaan tanpa persen pada rata-rata', () => {
    expect(ringkas([a('x', null, true, 1), a('x', 60, false, 2)]).rataKemiripan).toBe(60)
    expect(ringkas([a('x', null, true, 1)]).rataKemiripan).toBeNull()
  })

  it('riwayat kosong bernilai nol', () => {
    expect(ringkas([])).toEqual({ total: 0, berhasil: 0, persenBerhasil: 0, rataKemiripan: null })
  })
})

describe('riwayatPerIsyarat', () => {
  it('mengelompokkan per isyarat dan menaruh yang terbaru di atas', () => {
    const hasil = riwayatPerIsyarat([
      a('x', 90, true, 5),
      a('y', 30, false, 9),
      a('x', 40, false, 1),
    ])
    expect(hasil.map((item) => item.signId)).toEqual(['y', 'x'])
    expect(hasil[1]!.percobaan.map((item) => item.similarity)).toEqual([40, 90])
    expect(hasil[1]!.persenBerhasil).toBe(50)
  })
})
