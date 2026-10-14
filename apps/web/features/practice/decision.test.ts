import { describe, expect, it } from 'vitest'
import { attemptPercent, decideAttempt, pesanBelumSesuai } from './decision'

const base = { expectedSign: 'kopi', handsVisible: true, score: 2, passScore: 3, model: null }
const kopi = { label: 'kopi', confidence: 0.9 }

describe('decideAttempt', () => {
  it('tanpa model lulus hanya bila skor di bawah batas kemiripan', () => {
    expect(decideAttempt(base).kind).toBe('lulus')
    expect(decideAttempt({ ...base, score: 4 }).kind).toBe('belum-tepat')
  })

  it('dengan model hanya label model yang menentukan', () => {
    expect(decideAttempt({ ...base, score: 9, model: kopi }).kind).toBe('lulus')
    expect(decideAttempt({ ...base, model: { label: 'teh', confidence: 0.9 } }).kind).toBe(
      'belum-tepat',
    )
    expect(decideAttempt({ ...base, model: { label: null, confidence: 0 } }).kind).toBe(
      'belum-tepat',
    )
  })

  it('tangan yang tidak terlihat selalu belum tepat', () => {
    expect(decideAttempt({ ...base, handsVisible: false }).kind).toBe('belum-tepat')
    expect(decideAttempt({ ...base, handsVisible: false, model: kopi }).kind).toBe('belum-tepat')
  })
})

describe('attemptPercent', () => {
  const calibration = { example: 1, others: 3 }

  it('memakai kemiripan terhadap kalibrasi bila tanpa model', () => {
    expect(attemptPercent({ ...base, score: 2, calibration })).toBe(50)
    expect(attemptPercent({ ...base, score: 1, calibration })).toBe(100)
    expect(attemptPercent({ ...base, score: 5, calibration })).toBe(0)
  })

  it('kosong bila isyarat belum punya kalibrasi', () => {
    expect(attemptPercent(base)).toBeNull()
  })

  it('memakai keyakinan model hanya bila labelnya benar', () => {
    expect(attemptPercent({ ...base, model: kopi })).toBe(90)
    expect(attemptPercent({ ...base, model: { label: 'teh', confidence: 0.9 } })).toBe(0)
  })

  it('nol bila tangan tidak terlihat', () => {
    expect(attemptPercent({ ...base, handsVisible: false, calibration })).toBe(0)
  })
})

describe('pesanBelumSesuai', () => {
  it('tidak menyebut persen dan baru menyuruh melihat peragaan setelah 3 kali', () => {
    expect(pesanBelumSesuai(1)).toBe('Belum sesuai. Coba lagi.')
    expect(pesanBelumSesuai(2)).not.toMatch(/peragaan/i)
    expect(pesanBelumSesuai(3)).toMatch(/Perhatikan peragaan/)
    expect(pesanBelumSesuai(1)).not.toMatch(/%/)
  })
})
