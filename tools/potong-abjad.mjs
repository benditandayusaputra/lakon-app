import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const sumber = process.argv[2] ?? join(root, 'content', 'BISINDO', 'Abjad_Bisindo.mp4')
const tujuan = join(root, 'apps', 'web', 'public', 'peraga')

// Detik kartu huruf A–Z berganti di video HaiDokter, ditambah akhir Z.
const MULAI = [
  1.07, 2.3, 3.47, 6.53, 7.87, 8.93, 10.6, 12.37, 13.93, 16.07, 17.4, 18.97, 20.77, 22.37, 24.2,
  26.13, 28.43, 29.87, 32.07, 33.63, 34.93, 37.67, 38.87, 40.3, 41.87, 44.1, 46.0,
]
// Tangan penanda baru membentuk huruf sekitar 0,3 detik setelah kartunya muncul.
const JEDA_TANGAN = 0.3
const POTONG_DEKAT = 'crop=656:556:80:137,format=yuv420p'

mkdirSync(tujuan, { recursive: true })

for (let i = 0; i < 26; i++) {
  const huruf = String.fromCharCode(97 + i)
  const awal = MULAI[i] + JEDA_TANGAN
  const akhir = MULAI[i + 1]
  execFileSync('ffmpeg', [
    ...['-v', 'error', '-y', '-ss', awal.toFixed(2), '-to', akhir.toFixed(2), '-i', sumber],
    ...['-vf', POTONG_DEKAT, '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23'],
    ...['-profile:v', 'high', '-movflags', '+faststart'],
    join(tujuan, `huruf-${huruf}.mp4`),
  ])
  console.log(`huruf ${huruf.toUpperCase()}: ${awal.toFixed(2)}–${akhir.toFixed(2)} dtk`)
}
