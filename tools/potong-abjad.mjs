import { put } from '@vercel/blob'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const sumber = process.argv[2] ?? join(root, 'content', 'BISINDO', 'Abjad_Bisindo.mp4')
const tujuan = join(root, 'apps', 'web', 'public', 'peraga')
process.loadEnvFile(join(root, '.env'))

// Detik saat tangan diam membentuk huruf; diukur dari gerak tangan, bukan kartu huruf yang kadang tertinggal.
const TAHAN = {
  a: [1.5, 2.37],
  b: [3.17, 3.73],
  c: [4.5, 5.47],
  d: [6.27, 7.37],
  e: [8.13, 9.1],
  f: [9.8, 10.63],
  g: [11.43, 12.47],
  h: [13.17, 14.07],
  i: [14.83, 15.83],
  j: [16.8, 17.33],
  k: [18.2, 19.07],
  l: [19.77, 20.7],
  m: [21.5, 22.57],
  n: [23.17, 24.13],
  o: [25.0, 25.87],
  p: [26.67, 27.7],
  q: [28.53, 29.47],
  r: [30.27, 31.3],
  s: [32.1, 33.13],
  t: [33.9, 34.87],
  u: [35.57, 36.8],
  v: [37.53, 38.8],
  w: [39.3, 39.73],
  x: [40.4, 41.5],
  y: [42.67, 43.47],
  z: [44.47, 45.53],
}
const POTONG_DEKAT = 'crop=656:556:80:137,format=yuv420p'

mkdirSync(tujuan, { recursive: true })

for (const [huruf, [awal, akhir]] of Object.entries(TAHAN)) {
  const hasil = join(tujuan, `huruf-${huruf}.mp4`)
  execFileSync('ffmpeg', [
    ...['-v', 'error', '-y', '-ss', awal.toFixed(2), '-to', akhir.toFixed(2), '-i', sumber],
    ...['-vf', POTONG_DEKAT, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23'],
    ...['-profile:v', 'high', '-movflags', '+faststart'],
    hasil,
  ])
  await put(`peraga/huruf-${huruf}.mp4`, readFileSync(hasil), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'video/mp4',
  })
  console.log(`huruf ${huruf.toUpperCase()}: ${awal.toFixed(2)}–${akhir.toFixed(2)} dtk + Blob`)
}
