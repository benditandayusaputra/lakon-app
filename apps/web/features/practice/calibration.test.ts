import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FLAGS_OFFSET, FRAME_FEATURE_DIM, SIDE_OFFSET, mirrorFeatures } from '@lakon/cv-core'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import { handshapeSchema, signSchema } from '@lakon/sign-schema'
import { SEED_SAN_RIG } from '../avatar/seed-san-rig'
import {
  PASS_SIMILARITY,
  calibrate,
  passScore,
  recordingFeatures,
  similarity,
  type PeragaRecording,
} from './calibration'
import { scoreAgainstReference } from './verify'

const content = new URL('../../../../content/', import.meta.url)
const readJsonDir = (dir: string) =>
  readdirSync(new URL(dir, content))
    .filter((name) => name.endsWith('.json'))
    .map((name) => JSON.parse(readFileSync(new URL(`${dir}${name}`, content), 'utf8')))

const frame = (value: number) => {
  const f = new Float32Array(FRAME_FEATURE_DIM)
  f[SIDE_OFFSET.Right] = value
  f[FLAGS_OFFSET + 1] = 1
  return f
}

const fakeSign = (id: string, value: number) =>
  ({ id, reference: [frame(value), frame(value)], phaseByFrame: [0, 0] }) as unknown as CompiledSign

describe('similarity', () => {
  const calibration = { example: 2, others: 4 }

  it('100% saat semirip contoh dan 0% saat sejauh isyarat lain', () => {
    expect(similarity(2, calibration)).toBe(1)
    expect(similarity(4, calibration)).toBe(0)
    expect(similarity(3, calibration)).toBeCloseTo(0.5)
    expect(similarity(1, calibration)).toBe(1)
    expect(similarity(9, calibration)).toBe(0)
  })

  it('skor lulus tepat di batas kemiripan minimal', () => {
    expect(similarity(passScore(calibration), calibration)).toBeCloseTo(PASS_SIMILARITY)
  })

  it('lulus mulai kemiripan 40%', () => {
    expect(PASS_SIMILARITY).toBe(0.4)
    expect(passScore(calibration)).toBeCloseTo(3.2)
  })
})

describe('calibrate', () => {
  it('skor contoh dari videonya sendiri dan pembanding dari median video lain', () => {
    const references = { a: fakeSign('a', 0), b: fakeSign('b', 1), c: fakeSign('c', 3) }
    const examples = { a: [frame(0)], b: [frame(1)], c: [frame(3)] }
    const result = calibrate(references, examples)
    expect(result.a!.example).toBe(0)
    expect(result.a!.others).toBeGreaterThan(result.a!.example)
    expect(Object.keys(result)).toEqual(['a', 'b', 'c'])
  })
})

describe('kalibrasi isyarat', () => {
  it('sesuai dengan spesifikasi isyarat dan rekaman peraga saat ini', async () => {
    const handshapes = readJsonDir('handshapes/').map((raw) => handshapeSchema.parse(raw))
    const references = Object.fromEntries(
      readJsonDir('signs/')
        .map((raw) => signSchema.parse(raw))
        .map((sign) => [sign.id, compileSign(sign, handshapes, SEED_SAN_RIG)]),
    )
    const examples = Object.fromEntries(
      (readJsonDir('peraga-landmarks/') as PeragaRecording[]).map((recording) => [
        recording.id,
        recordingFeatures(recording),
      ]),
    )
    const calibration = calibrate(references, examples)
    await expect(JSON.stringify(calibration, null, 2) + '\n').toMatchFileSnapshot(
      './calibration.json',
    )
  })
})

describe('rekaman kamera', () => {
  it('frame tanpa tangan sebelum dan sesudah isyarat tidak mengubah skor', () => {
    const handshapes = readJsonDir('handshapes/').map((raw) => handshapeSchema.parse(raw))
    const sign = signSchema.parse(readJsonDir('signs/').find((raw) => raw.id === 'halo'))
    const reference = compileSign(sign, handshapes, SEED_SAN_RIG)
    const recording = (readJsonDir('peraga-landmarks/') as PeragaRecording[]).find(
      (r) => r.id === 'halo',
    )!
    const frames = recordingFeatures(recording)
    const kosong = new Float32Array(FRAME_FEATURE_DIM)
    const denganJeda = [...Array(30).fill(kosong), ...frames, ...Array(15).fill(kosong)]
    expect(scoreAgainstReference(denganJeda, reference).score).toBeCloseTo(
      scoreAgainstReference(frames, reference).score,
      6,
    )
  })
})

describe('tangan dominan kiri', () => {
  it('peragaan cermin dinilai sama dengan peragaan tangan kanan', () => {
    const handshapes = readJsonDir('handshapes/').map((raw) => handshapeSchema.parse(raw))
    const sign = signSchema.parse(readJsonDir('signs/').find((raw) => raw.id === 'halo'))
    const reference = compileSign(sign, handshapes, SEED_SAN_RIG)
    const recording = (readJsonDir('peraga-landmarks/') as PeragaRecording[]).find(
      (r) => r.id === 'halo',
    )!
    const frames = recordingFeatures(recording)
    expect(scoreAgainstReference(frames.map(mirrorFeatures), reference).score).toBeCloseTo(
      scoreAgainstReference(frames, reference).score,
      6,
    )
  })
})
