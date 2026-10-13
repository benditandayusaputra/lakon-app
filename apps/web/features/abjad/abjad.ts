import { acak } from '../scenario/engine'

export const HURUF = 'abcdefghijklmnopqrstuvwxyz'.split('')

export type ArahAbjad = 'deaf' | 'service'

export const idHuruf = (huruf: string) => `huruf-${huruf}`

export const geserHuruf = (huruf: string, langkah: number) =>
  HURUF[(HURUF.indexOf(huruf) + langkah + HURUF.length) % HURUF.length]!

export const hurufDariParam = (nilai: string | undefined) => {
  const huruf = nilai?.toLowerCase()
  return huruf && HURUF.includes(huruf) ? huruf : 'a'
}

export const arahDariParam = (nilai: string | undefined): ArahAbjad =>
  nilai === 'service' ? 'service' : 'deaf'

// Urutan soal tetap agar nomor soal di grid tidak berubah antarkunjungan.
export const URUTAN_BACA = acak(HURUF, 26)

export const SUMBER_URL = 'https://www.youtube.com/watch?v=AZ8pT075NFI'

// Detik tiap huruf mulai ditahan di video sumber, dipetakan dari storyboard YouTube.
const DETIK_SUMBER: Record<string, number> = {
  a: 304,
  b: 306,
  c: 307,
  d: 309,
  e: 311,
  f: 313,
  g: 314,
  h: 316,
  i: 318,
  j: 320,
  k: 321,
  l: 323,
  m: 324,
  n: 326,
  o: 328,
  p: 329,
  q: 331,
  r: 333,
  s: 335,
  t: 337,
  u: 338,
  v: 340,
  w: 342,
  x: 343,
  y: 345,
  z: 347,
}

export const detikSumber = (huruf: string) => DETIK_SUMBER[huruf] ?? DETIK_SUMBER.a!

export const tautanSumber = (huruf: string) => `${SUMBER_URL}&t=${detikSumber(huruf)}s`

export const formatWaktu = (detik: number) =>
  `${Math.floor(detik / 60)}:${String(detik % 60).padStart(2, '0')}`

export const labelHuruf = (signId: string) => `Huruf ${signId.replace(/^huruf-/, '').toUpperCase()}`
