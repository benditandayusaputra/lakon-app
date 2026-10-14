import { describe, expect, it } from 'vitest'
import { tahapSetelahMasuk } from './checkpoint'

describe('tahapSetelahMasuk', () => {
  it('membawa sisi Tuli ke izin kamera', () => {
    expect(tahapSetelahMasuk('deaf', false)).toBe('kamera')
    expect(tahapSetelahMasuk('deaf', true)).toBe('kamera')
  })

  it('membawa sisi pekerja langsung belajar bila tanpa checkpoint', () => {
    expect(tahapSetelahMasuk('service', false)).toBe('belajar')
  })

  it('menampilkan dialog checkpoint sisi pekerja setelah masuk', () => {
    expect(tahapSetelahMasuk('service', true)).toBe('kamera')
  })
})
