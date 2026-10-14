import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  recordingObservations,
  type PeragaRecording,
} from '../apps/web/features/practice/calibration'

const WINDOW_FRAMES = 16
const STRIDE = 2
const FRAME_MS = 1000 / 30

const out = process.argv[2]
if (!out) throw new Error('pakai: pnpm exec tsx tools/peraga-to-training.ts <berkas-keluaran.json>')

const dir = join(import.meta.dirname, '..', 'content', 'peraga-landmarks')
const recordings: PeragaRecording[] = readdirSync(dir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(join(dir, name), 'utf8')))

const sessions = recordings.map((recording) => {
  const frames = recordingObservations(recording).map((observation, i) => ({
    timestamp: i * FRAME_MS,
    hands: observation.hands,
    pose: observation.pose,
  }))
  const samples = []
  for (let end = Math.min(WINDOW_FRAMES, frames.length); end <= frames.length; end += STRIDE) {
    samples.push({
      timestamp: end * FRAME_MS,
      frames: frames.slice(Math.max(0, end - WINDOW_FRAMES), end),
    })
  }
  return {
    id: `peraga-${recording.id}`,
    label: recording.id,
    mode: 'dinamis',
    contributor: 'peraga',
    samples,
  }
})

writeFileSync(out, JSON.stringify({ version: 1, sessions }))
console.log(
  `${sessions.length} isyarat, ${sessions.reduce((n, s) => n + s.samples.length, 0)} sampel`,
)
