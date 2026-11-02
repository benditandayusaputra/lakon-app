import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseSign, type Sign } from '@lakon/sign-schema'
import {
  ATURAN_ALIS,
  ATURAN_MATA,
  ATURAN_MULUT,
  bobotKedip,
  ekspresiIsyarat,
  kekuatanEkspresi,
} from './ekspresi'

const konten = join(import.meta.dirname, '../../../../content/signs')
const isyarat = (id: string): Sign =>
  parseSign(JSON.parse(readFileSync(join(konten, `${id}.json`), 'utf8')))

const ekspresiVrm = () => {
  const berkas = readFileSync(join(import.meta.dirname, '../../public/models/silakon.vrm'))
  const panjang = berkas.readUInt32LE(12)
  const json = JSON.parse(berkas.subarray(20, 20 + panjang).toString('utf8'))
  const daftar = json.extensions.VRMC_vrm.expressions
  return new Set([...Object.keys(daftar.preset), ...Object.keys(daftar.custom)])
}

describe('ekspresi non-manual', () => {
  it('menerjemahkan deskripsi wajah di konten menjadi ekspresi avatar', () => {
    const pahit = ekspresiIsyarat(isyarat('pahit'))
    expect(pahit.bobot.alisKerut).toBeGreaterThan(0.5)
    expect(pahit.bobot.meringis).toBeGreaterThan(0.5)
    expect(ekspresiIsyarat(isyarat('manis')).bobot.senyum).toBeGreaterThan(0.5)
    expect(ekspresiIsyarat(isyarat('dingin')).bobot.bibirRapat).toBeGreaterThan(0.5)
    expect(ekspresiIsyarat(isyarat('maaf')).bobot.alisSedih).toBeCloseTo(0.45)
    expect(ekspresiIsyarat(isyarat('makan')).kunyah).toBe(true)
    expect(ekspresiIsyarat(isyarat('kopi')).tatapan).toBe('tangan')
    expect(ekspresiIsyarat(isyarat('halo')).bobot).toEqual({})
    expect(ekspresiIsyarat(isyarat('halo')).tatapan).toBe('lawan')
  })

  it('ekspresi muncul selama gerak inti dan hilang saat tangan kembali', () => {
    const sign = isyarat('pahit')
    const ekspresi = ekspresiIsyarat(sign)
    const onset = sign.phases[0]!.duration + (sign.phases[0]!.hold ?? 0)
    expect(kekuatanEkspresi(ekspresi, 0)).toBe(0)
    expect(kekuatanEkspresi(ekspresi, onset + 50)).toBe(1)
    expect(kekuatanEkspresi(ekspresi, sign.duration + 400)).toBe(0)
  })

  it('kedip sesekali, bukan terus-menerus', () => {
    const sampel = Array.from({ length: 340 }, (_, i) => bobotKedip(i / 100))
    expect(Math.max(...sampel)).toBeGreaterThan(0.9)
    expect(sampel.filter((nilai) => nilai > 0).length).toBeLessThan(20)
  })

  it('setiap ekspresi yang dipakai aturan tersedia di silakon.vrm', () => {
    const tersedia = ekspresiVrm()
    const dipakai = [...ATURAN_ALIS, ...ATURAN_MATA, ...ATURAN_MULUT].flatMap((aturan) =>
      Object.keys(aturan.bobot),
    )
    for (const nama of [...dipakai, 'aa', 'blink', 'lookLeft', 'lookRight', 'lookUp', 'lookDown']) {
      expect(tersedia.has(nama), nama).toBe(true)
    }
  })

  it('semua isyarat di konten bisa diproses', () => {
    for (const nama of readdirSync(konten).filter((berkas) => berkas.endsWith('.json'))) {
      const ekspresi = ekspresiIsyarat(isyarat(nama.replace(/\.json$/, '')))
      for (const nilai of Object.values(ekspresi.bobot)) {
        expect(nilai).toBeGreaterThan(0)
        expect(nilai).toBeLessThanOrEqual(1)
      }
    }
  })
})
