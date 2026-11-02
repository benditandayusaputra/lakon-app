import { Vector3 } from 'three'
import type { Sign } from '@lakon/sign-schema'
import type { AvatarRig } from './vrm'

export type Tatapan = 'tangan' | 'lawan'

export type EkspresiIsyarat = {
  bobot: Record<string, number>
  tatapan: Tatapan
  kunyah: boolean
  dominan: Sign['dominance']
  naik: [number, number]
  turun: [number, number]
}

type Aturan = { pola: RegExp; bobot: Record<string, number> }

export const ATURAN_ALIS: Aturan[] = [
  { pola: /kerut/, bobot: { alisKerut: 0.85 } },
  { pola: /memohon|sedih|cemas/, bobot: { alisSedih: 0.75 } },
  { pola: /terangkat|naik|heran/, bobot: { alisNaik: 0.8 } },
]

export const ATURAN_MATA: Aturan[] = [
  { pola: /sipit|menyipit/, bobot: { mataSipit: 0.8 } },
  { pola: /melotot|terbelalak|mata lebar/, bobot: { mataLebar: 0.85 } },
]

export const ATURAN_MULUT: Aturan[] = [
  { pola: /meringis/, bobot: { meringis: 0.75 } },
  { pola: /senyum/, bobot: { senyum: 0.9 } },
  { pola: /rapat/, bobot: { bibirRapat: 0.9 } },
  { pola: /mencucu|monyong|maju/, bobot: { bibirMaju: 0.85 } },
  { pola: /gembung/, bobot: { pipiGembung: 0.9 } },
  { pola: /lidah/, bobot: { lidahKeluar: 0.8 } },
  { pola: /meneguk/, bobot: { oh: 0.4 } },
  { pola: /terbuka|menganga/, bobot: { aa: 0.35 } },
]

export const TITIK_LAWAN = new Vector3(0, 1.38, 1.7)

const KEDIP_JEDA = 3.4
const KEDIP_LAMA = 0.16
const RAMPA = 220

const cocokkan = (teks: string | null, aturan: Aturan[]): Record<string, number> => {
  if (!teks) return {}
  const kecil = teks.toLowerCase()
  const kena = aturan.find((item) => item.pola.test(kecil))
  if (!kena) return {}
  const skala = /sedikit|tipis|pelan/.test(kecil) ? 0.6 : 1
  return Object.fromEntries(
    Object.entries(kena.bobot).map(([nama, nilai]) => [nama, nilai * skala]),
  )
}

const halus = (a: number, b: number, t: number) => {
  if (b <= a) return t >= b ? 1 : 0
  const u = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return u * u * (3 - 2 * u)
}

export const ekspresiIsyarat = (sign: Sign): EkspresiIsyarat => {
  const { brow, mouth, gaze } = sign.nonManual
  const bobot = {
    ...cocokkan(brow, ATURAN_ALIS),
    ...cocokkan(`${brow ?? ''} ${gaze ?? ''}`, ATURAN_MATA),
    ...cocokkan(mouth, ATURAN_MULUT),
  }
  let jam = 0
  let akhirOnset = 0
  let awalRetraksi = -1
  let akhirRetraksi = 0
  for (const fase of sign.phases) {
    const mulai = jam
    jam += fase.duration + (fase.hold ?? 0)
    if (fase.name === 'onset') akhirOnset = jam
    if (fase.name === 'retraction' && awalRetraksi < 0) {
      awalRetraksi = mulai
      akhirRetraksi = mulai + Math.min(fase.duration, 320)
    }
  }
  if (awalRetraksi < 0) {
    awalRetraksi = jam
    akhirRetraksi = jam + RAMPA
  }
  return {
    bobot,
    tatapan: gaze && /tangan/.test(gaze.toLowerCase()) ? 'tangan' : 'lawan',
    kunyah: Boolean(mouth && /kunyah|ngunyah/.test(mouth.toLowerCase())),
    dominan: sign.dominance,
    naik: [0, Math.max(akhirOnset, RAMPA)],
    turun: [awalRetraksi, akhirRetraksi],
  }
}

export const kekuatanEkspresi = (ekspresi: EkspresiIsyarat, waktuMs: number) =>
  halus(ekspresi.naik[0], ekspresi.naik[1], waktuMs) *
  (1 - halus(ekspresi.turun[0], ekspresi.turun[1], waktuMs))

export const bobotKedip = (detik: number) => {
  const fase = detik % KEDIP_JEDA
  if (fase > KEDIP_LAMA) return 0
  return 1 - Math.abs(fase / KEDIP_LAMA - 0.5) * 2
}

const posisiTangan = new Vector3()

export const terapkanWajah = (
  avatar: AvatarRig,
  ekspresi: EkspresiIsyarat | null,
  waktuMs: number,
  detik: number,
) => {
  const manajer = avatar.vrm.expressionManager
  const kekuatan = ekspresi ? kekuatanEkspresi(ekspresi, waktuMs) : 0
  if (manajer) {
    for (const nama of Object.keys(avatar.wajah)) avatar.wajah[nama] = 0
    if (ekspresi) {
      for (const [nama, nilai] of Object.entries(ekspresi.bobot)) {
        avatar.wajah[nama] = nilai * kekuatan
      }
      if (ekspresi.kunyah) {
        avatar.wajah.aa = Math.max(0, 0.22 + 0.2 * Math.sin(detik * Math.PI * 4.4)) * kekuatan
      }
    }
    avatar.wajah.blink = bobotKedip(detik)
    for (const [nama, nilai] of Object.entries(avatar.wajah)) manajer.setValue(nama, nilai)
  }
  const tatap = avatar.tatap
  tatap.position.copy(TITIK_LAWAN)
  if (ekspresi?.tatapan === 'tangan') {
    avatar[ekspresi.dominan].hand.getWorldPosition(posisiTangan)
    tatap.position.lerp(posisiTangan, kekuatan)
  }
  tatap.updateMatrixWorld()
}
