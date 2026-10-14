import { describe, expect, it } from 'vitest'
import { decideAttempt } from './decision'

const base = { expectedSign: 'kopi', handsVisible: true, score: 2, passScore: 3, model: null }

describe('decideAttempt', () => {
  it('tanpa model lulus hanya bila skor di bawah batas kemiripan', () => {
    expect(decideAttempt(base).kind).toBe('lulus')
    expect(decideAttempt({ ...base, score: 4 }).kind).toBe('belum-tepat')
  })

  it('dengan model hanya label model yang menentukan', () => {
    expect(decideAttempt({ ...base, score: 9, model: { label: 'kopi' } }).kind).toBe('lulus')
    expect(decideAttempt({ ...base, model: { label: 'teh' } }).kind).toBe('belum-tepat')
    expect(decideAttempt({ ...base, model: { label: null } }).kind).toBe('belum-tepat')
  })

  it('tangan yang tidak terlihat selalu belum tepat', () => {
    expect(decideAttempt({ ...base, handsVisible: false }).kind).toBe('belum-tepat')
    expect(decideAttempt({ ...base, handsVisible: false, model: { label: 'kopi' } }).kind).toBe(
      'belum-tepat',
    )
  })
})
