import { put } from '@vercel/blob'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

const root = join(import.meta.dirname, '..')
const sumber = join(root, 'content', 'BISINDO')
const tujuan = join(root, 'apps', 'web', 'public', 'peraga')
const folderSign = join(root, 'content', 'signs')
process.loadEnvFile(join(root, '.env'))

const GESER_CROP = 5 / 12
const TINGGI = 720
const CRF = 23

const polos = (nama) => nama.toLowerCase().replace(/[^a-z0-9]/g, '')
const signs = new Map(
  readdirSync(folderSign)
    .filter((nama) => nama.endsWith('.json'))
    .map((nama) => [polos(basename(nama, '.json')), basename(nama, '.json')]),
)

mkdirSync(tujuan, { recursive: true })
const dilewati = []

for (const berkas of readdirSync(sumber).filter((nama) => /\.(mp4|mov)$/i.test(nama))) {
  const id = signs.get(polos(basename(berkas, extname(berkas))))
  if (!id) {
    dilewati.push(berkas)
    continue
  }
  const lebar = `min(iw\\,ih*4/3)`
  const filter = `crop=${lebar}:ih:(iw-${lebar})*${GESER_CROP}:0,scale=-2:${TINGGI}:flags=lanczos:in_range=full:out_range=limited,format=yuv420p`
  const keluaran = `-v error -y -an -c:v libx264 -preset slow -crf ${CRF} -profile:v high -movflags +faststart`
  const hasil = join(tujuan, `${id}.mp4`)
  execFileSync('ffmpeg', [
    ...['-i', join(sumber, berkas), '-vf', filter],
    ...keluaran.split(' '),
    hasil,
  ])
  await put(`peraga/${id}.mp4`, readFileSync(hasil), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'video/mp4',
  })

  const path = join(folderSign, `${id}.json`)
  const media = `  "media": {\n    "video": {\n      "depan": "/peraga/${id}.mp4"\n    }\n  },\n`
  const teks = readFileSync(path, 'utf8').replace(/ {2}"media": \{[\s\S]*?\n {2}\},\n/, '')
  writeFileSync(path, teks.replace(/\n {2}"review": \{/, `\n${media}  "review": {`))
  console.log(`${berkas} → public/peraga/${id}.mp4 + Blob`)
}

if (dilewati.length > 0) {
  console.log(`skipped (no matching sign file): ${dilewati.join(', ')}`)
}
