import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { compileSign } from '@lakon/sign-compiler'
import { parseHandshape, parseSign } from '@lakon/sign-schema'
import { SEED_SAN_RIG } from '../avatar/seed-san-rig'
import {
  arahDariParam,
  detikSumber,
  formatWaktu,
  geserHuruf,
  HURUF,
  hurufDariParam,
  idHuruf,
  labelHuruf,
  tautanSumber,
  URUTAN_BACA,
} from './abjad'

const konten = join(import.meta.dirname, '../../../../content')
const baca = (folder: string, id: string) =>
  JSON.parse(readFileSync(join(konten, folder, `${id}.json`), 'utf8')) as unknown

describe('abjad', () => {
  it('memuat 26 huruf berurutan', () => {
    expect(HURUF).toHaveLength(26)
    expect(HURUF[0]).toBe('a')
    expect(HURUF[25]).toBe('z')
  })

  it('geser berputar di kedua ujung', () => {
    expect(geserHuruf('a', 1)).toBe('b')
    expect(geserHuruf('z', 1)).toBe('a')
    expect(geserHuruf('a', -1)).toBe('z')
  })

  it('parameter URL yang tidak dikenal jatuh ke huruf A', () => {
    expect(hurufDariParam('Q')).toBe('q')
    expect(hurufDariParam('aa')).toBe('a')
    expect(hurufDariParam(undefined)).toBe('a')
  })

  it('arah selain service jatuh ke sisi Tuli', () => {
    expect(arahDariParam('service')).toBe('service')
    expect(arahDariParam('deaf')).toBe('deaf')
    expect(arahDariParam(undefined)).toBe('deaf')
  })

  it('urutan soal baca memuat tiap huruf tepat sekali dan tidak alfabetis', () => {
    expect([...URUTAN_BACA].sort()).toEqual(HURUF)
    expect(URUTAN_BACA).not.toEqual(HURUF)
  })

  it('detik sumber naik berurutan dari A sampai Z', () => {
    const detik = HURUF.map(detikSumber)
    expect(detik.every((nilai, i) => i === 0 || nilai > detik[i - 1]!)).toBe(true)
    expect(detikSumber('?')).toBe(detikSumber('a'))
  })

  it('tautan sumber melompat ke detik huruf dan waktunya terbaca menit:detik', () => {
    expect(tautanSumber('u')).toBe('https://www.youtube.com/watch?v=AZ8pT075NFI&t=338s')
    expect(formatWaktu(338)).toBe('5:38')
    expect(formatWaktu(304)).toBe('5:04')
  })

  it('label pilihan menulis huruf kapital', () => {
    expect(labelHuruf('huruf-b')).toBe('Huruf B')
  })

  it('setiap huruf punya isyarat yang bisa dikompilasi dan klip videonya', () => {
    const handshapeIds = new Set<string>()
    const signs = HURUF.map((huruf) => {
      const sign = parseSign(baca('signs', idHuruf(huruf)))
      for (const phase of sign.phases) {
        handshapeIds.add(phase.dominant.handshape)
        if (phase.nonDominant) handshapeIds.add(phase.nonDominant.handshape)
      }
      return sign
    })
    const handshapes = [...handshapeIds].map((id) => parseHandshape(baca('handshapes', id)))
    for (const sign of signs) {
      expect(sign.media?.video.depan).toBe(`/peraga/${sign.id}.mp4`)
      expect(compileSign(sign, handshapes, SEED_SAN_RIG).frames.length).toBeGreaterThan(0)
    }
  })
})
