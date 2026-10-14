import type { Verdict } from '@lakon/cv-core'
import { similarity, type SignCalibration } from './calibration'

export const PERAGA_SETELAH_GAGAL = 3

export type AttemptInput = {
  expectedSign: string
  handsVisible: boolean
  score: number
  passScore: number
  model: { label: string | null; confidence: number } | null
  calibration?: SignCalibration
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

// Null bila tidak ada kalibrasi untuk isyarat itu, jadi persen tidak dikarang.
export const attemptPercent = (input: AttemptInput): number | null => {
  if (!input.handsVisible) return 0
  if (input.model) {
    return input.model.label === input.expectedSign ? Math.round(input.model.confidence * 100) : 0
  }
  return input.calibration ? Math.round(similarity(input.score, input.calibration) * 100) : null
}

export const pesanBelumSesuai = (failures: number): string =>
  failures >= PERAGA_SETELAH_GAGAL
    ? 'Belum sesuai. Perhatikan peragaan lagi, lalu coba lagi.'
    : 'Belum sesuai. Coba lagi.'
