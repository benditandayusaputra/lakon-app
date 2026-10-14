import type { Verdict } from '@lakon/cv-core'

export type AttemptInput = {
  expectedSign: string
  handsVisible: boolean
  score: number
  passScore: number
  model: { label: string | null } | null
}

export const decideAttempt = (input: AttemptInput): Verdict => {
  if (!input.handsVisible) return { kind: 'belum-tepat', reason: 'dtw-saja' }
  if (input.model) {
    return input.model.label === input.expectedSign
      ? { kind: 'lulus', reason: 'klasifikasi-saja' }
      : { kind: 'belum-tepat', reason: 'klasifikasi-salah' }
  }
  return input.score <= input.passScore
    ? { kind: 'lulus', reason: 'dtw-saja' }
    : { kind: 'belum-tepat', reason: 'dtw-saja' }
}
