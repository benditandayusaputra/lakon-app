import { get, list } from '@vercel/blob'
import { cp, mkdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const publicDir = join(root, 'apps', 'web', 'public')

const exists = async (path) => {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

const envFile = join(root, '.env')
if (await exists(envFile)) process.loadEnvFile(envFile)

const wasmSource = join(
  root,
  'node_modules',
  '.pnpm',
  'node_modules',
  '@mediapipe',
  'tasks-vision',
  'wasm',
)
const wasmFallback = join(root, 'apps', 'web', 'node_modules', '@mediapipe', 'tasks-vision', 'wasm')
const wasmTarget = join(publicDir, 'mediapipe', 'wasm')

const from = (await exists(wasmSource)) ? wasmSource : wasmFallback
if (!(await exists(from))) {
  console.error('@mediapipe/tasks-vision is not installed, run pnpm install')
  process.exit(1)
}
await mkdir(wasmTarget, { recursive: true })
await cp(from, wasmTarget, { recursive: true })
console.log('MediaPipe WASM copied to public/mediapipe/wasm')

const MODELS = [
  [
    'hand_landmarker.task',
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  ],
  [
    'pose_landmarker_lite.task',
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  ],
]

const modelDir = join(publicDir, 'models', 'mediapipe')
await mkdir(modelDir, { recursive: true })
for (const [name, url] of MODELS) {
  const target = join(modelDir, name)
  if (await exists(target)) {
    console.log(`${name} already present, skipping`)
    continue
  }
  const response = await fetch(url)
  if (!response.ok) {
    console.error(`failed to download ${name}: ${response.status}`)
    process.exit(1)
  }
  await writeFile(target, Buffer.from(await response.arrayBuffer()))
  console.log(`${name} downloaded (${((await stat(target)).size / 1e6).toFixed(1)} MB)`)
}

const sizeOf = async (path) => ((await exists(path)) ? (await stat(path)).size : -1)

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn('BLOB_READ_WRITE_TOKEN not set, skipping peraga clips')
} else {
  await mkdir(join(publicDir, 'peraga'), { recursive: true })
  const { blobs } = await list({ prefix: 'peraga/' })
  for (const { pathname, size } of blobs) {
    const target = join(publicDir, pathname)
    if ((await sizeOf(target)) === size) continue
    const blob = await get(pathname, { access: 'private' })
    await writeFile(target, blob.stream)
    console.log(`${pathname} downloaded`)
  }
  console.log(`peraga clips ready (${blobs.length})`)
}
