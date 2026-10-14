import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const WIDTH = 320
const HEIGHT = 240
const FRAMES = 30

export const FAKE_VIDEO_PATH = join(import.meta.dirname, 'fixtures', 'gerak.y4m')

export default function globalSetup() {
  const seed = spawnSync(
    'node',
    [join(import.meta.dirname, '..', '..', '..', 'tools', 'seed.mjs')],
    {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
    },
  )
  if (seed.status !== 0) throw new Error('seed akun demo gagal, e2e butuh progres demo')

  mkdirSync(join(import.meta.dirname, 'fixtures'), { recursive: true })

  const header = `YUV4MPEG2 W${WIDTH} H${HEIGHT} F30:1 Ip A1:1 C420\n`
  const chunks: Buffer[] = [Buffer.from(header, 'ascii')]

  for (let frame = 0; frame < FRAMES; frame++) {
    const y = Buffer.alloc(WIDTH * HEIGHT, 110)
    const u = Buffer.alloc((WIDTH / 2) * (HEIGHT / 2), 128)
    const v = Buffer.alloc((WIDTH / 2) * (HEIGHT / 2), 128)

    const blockX = 40 + Math.round((frame / FRAMES) * 180)
    const blockY = 80 + Math.round(Math.sin((frame / FRAMES) * Math.PI * 2) * 40)
    for (let row = blockY; row < blockY + 60 && row < HEIGHT; row++) {
      y.fill(235, row * WIDTH + blockX, row * WIDTH + Math.min(blockX + 60, WIDTH))
    }

    chunks.push(Buffer.from('FRAME\n', 'ascii'), y, u, v)
  }

  writeFileSync(FAKE_VIDEO_PATH, Buffer.concat(chunks))
}
