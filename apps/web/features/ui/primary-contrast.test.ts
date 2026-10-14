import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../../app/globals.css', import.meta.url), 'utf8')

function token(name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) throw new Error(`token --${name} tidak ditemukan`)
  return match[1]!
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (light + 0.05) / (dark + 0.05)
}

const AA = 4.5

describe('kontras warna primary', () => {
  const primary = token('color-primary')
  const hover = token('color-primary-hover')

  it('teks putih terbaca di atas tombol primary dan hover-nya', () => {
    expect(contrast('#ffffff', primary)).toBeGreaterThanOrEqual(AA)
    expect(contrast('#ffffff', hover)).toBeGreaterThanOrEqual(AA)
  })

  it('tautan primary terbaca di atas halaman dan tint', () => {
    expect(contrast(primary, token('color-halaman'))).toBeGreaterThanOrEqual(AA)
    expect(contrast(primary, token('color-primary-tint'))).toBeGreaterThanOrEqual(AA)
  })

  it('hover lebih gelap daripada primary', () => {
    expect(luminance(hover)).toBeLessThan(luminance(primary))
  })
})
