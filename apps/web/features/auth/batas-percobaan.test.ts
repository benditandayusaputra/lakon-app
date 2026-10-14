import { describe, expect, it, vi } from 'vitest'
import { asalPermintaan, bolehCoba } from './batas-percobaan'

describe('bolehCoba', () => {
  it('menolak setelah jatah percobaan habis', () => {
    const kunci = `uji-${Math.random()}`
    for (let i = 0; i < 3; i += 1) expect(bolehCoba(kunci, 3)).toBe(true)
    expect(bolehCoba(kunci, 3)).toBe(false)
  })

  it('memberi jatah baru setelah jendela lewat', () => {
    const kunci = `uji-${Math.random()}`
    const sekarang = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(sekarang)
    expect(bolehCoba(kunci, 1, 1000)).toBe(true)
    expect(bolehCoba(kunci, 1, 1000)).toBe(false)
    vi.spyOn(Date, 'now').mockReturnValue(sekarang + 1001)
    expect(bolehCoba(kunci, 1, 1000)).toBe(true)
    vi.restoreAllMocks()
  })

  it('memisahkan jatah per kunci', () => {
    const satu = `uji-${Math.random()}`
    const dua = `uji-${Math.random()}`
    expect(bolehCoba(satu, 1)).toBe(true)
    expect(bolehCoba(satu, 1)).toBe(false)
    expect(bolehCoba(dua, 1)).toBe(true)
  })
})

describe('asalPermintaan', () => {
  it('mengambil alamat pertama dari x-forwarded-for', () => {
    const request = new Request('https://lakon.id', {
      headers: { 'x-forwarded-for': '203.0.113.7, 70.41.3.18' },
    })
    expect(asalPermintaan(request)).toBe('203.0.113.7')
  })

  it('punya nilai cadangan saat header kosong', () => {
    expect(asalPermintaan(new Request('https://lakon.id'))).toBe('tanpa-ip')
  })
})
