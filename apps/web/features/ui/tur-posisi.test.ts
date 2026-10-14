import { describe, expect, it } from 'vitest'
import { posisiKartu } from './tur-posisi'

const kartu = { width: 300, height: 200 }
const layar = { width: 1200, height: 800 }

describe('posisiKartu', () => {
  it('menaruh kartu di bawah target bila muat', () => {
    const hasil = posisiKartu({ top: 100, left: 450, width: 300, height: 100 }, kartu, layar)
    expect(hasil).toEqual({ top: 216, left: 450 })
  })

  it('menaruh kartu di atas target bila bawah penuh', () => {
    const hasil = posisiKartu({ top: 500, left: 450, width: 300, height: 200 }, kartu, layar)
    expect(hasil.top).toBe(284)
  })

  it('menempelkan kartu ke dasar layar bila target terlalu tinggi', () => {
    const hasil = posisiKartu({ top: 50, left: 0, width: 1200, height: 700 }, kartu, layar)
    expect(hasil.top).toBe(584)
  })

  it('menjaga kartu tetap di dalam layar', () => {
    expect(posisiKartu({ top: 100, left: 0, width: 40, height: 40 }, kartu, layar).left).toBe(16)
    expect(posisiKartu({ top: 100, left: 1180, width: 20, height: 40 }, kartu, layar).left).toBe(
      884,
    )
  })

  it('tetap di tepi kiri pada layar yang lebih sempit dari kartu', () => {
    const hasil = posisiKartu({ top: 0, left: 0, width: 100, height: 40 }, kartu, {
      width: 280,
      height: 800,
    })
    expect(hasil.left).toBe(16)
  })
})
