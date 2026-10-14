import { describe, expect, it } from 'vitest'
import { ruasJalan, titikSeberang } from './peta-jalan'

describe('ruasJalan', () => {
  it('menyambung titik dengan kurva bertarikan tegak', () => {
    expect(
      ruasJalan([
        { x: 0, y: 0 },
        { x: 100, y: 20 },
      ]),
    ).toBe('M 0 0 C 0 11 100 9 100 20')
  })
})

describe('titikSeberang', () => {
  it('berada tepat di tengah ruas', () => {
    const hasil = titikSeberang({ x: 100, y: 0 }, { x: 300, y: 200 })
    expect(hasil.x).toBe(200)
    expect(hasil.y).toBe(100)
  })

  it('sudutnya mengikuti singgung kurva di tengah', () => {
    const q = { x: 0, y: 0 }
    const p = { x: 90, y: 200 }
    const t = 0.5
    const tarik = 110
    const turunan = (a: number, b: number, c: number, d: number) =>
      3 * (1 - t) ** 2 * (b - a) + 6 * (1 - t) * t * (c - b) + 3 * t ** 2 * (d - c)
    const dx = turunan(q.x, q.x, p.x, p.x)
    const dy = turunan(q.y, q.y + tarik, p.y - tarik, p.y)
    expect(titikSeberang(q, p).sudut).toBeCloseTo((Math.atan2(dy, dx) * 180) / Math.PI, 6)
  })
})
