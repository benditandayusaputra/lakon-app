/* global window, document */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { chromium } from '../apps/web/node_modules/@playwright/test/index.mjs'
import { loadContent } from './validate-content.mjs'

const root = join(import.meta.dirname, '..')
const publicDir = join(root, 'apps/web/public')
const bundle = join(root, 'apps/web/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs')
const outDir = join(root, 'content/peraga-landmarks')
const ORIGIN = 'http://peraga.local'
const POSE_POINTS = [11, 12, 15, 16]

const TYPES = {
  '.mjs': 'text/javascript',
  '.js': 'text/javascript',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
}

const trim = (frames) => {
  const first = frames.findIndex((f) => f.hands.length > 0)
  if (first < 0) return []
  const last = frames.length - 1 - [...frames].reverse().findIndex((f) => f.hands.length > 0)
  return frames.slice(Math.max(0, first - 3), last + 4)
}

const content = await loadContent()
const signs = Object.values(content.signs).filter((sign) => sign.media?.video?.depan)

// Chromium bawaan Playwright tidak memutar H.264, jadi pakai Chrome yang terpasang.
const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.route(`${ORIGIN}/**`, async (route) => {
  const path = new URL(route.request().url()).pathname
  if (path === '/') {
    return route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><video id="v" muted playsinline></video>',
    })
  }
  const file = path === '/vision.mjs' ? bundle : join(publicDir, path)
  return route.fulfill({
    body: await readFile(file),
    contentType: TYPES[extname(file)] ?? 'application/octet-stream',
  })
})
await page.goto(`${ORIGIN}/`)
await page.evaluate(async () => {
  const { FilesetResolver, HandLandmarker, PoseLandmarker } = await import('/vision.mjs')
  const fileset = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
  const base = (model) => ({ modelAssetPath: model, delegate: 'GPU' })
  window.hand = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: base('/models/mediapipe/hand_landmarker.task'),
    numHands: 4,
    runningMode: 'VIDEO',
  })
  window.pose = await PoseLandmarker.createFromOptions(fileset, {
    baseOptions: base('/models/mediapipe/pose_landmarker_lite.task'),
    numPoses: 2,
    runningMode: 'VIDEO',
  })
  window.clock = 0
})

await mkdir(outDir, { recursive: true })
for (const sign of signs) {
  const { aspect, frames } = await page.evaluate(
    async ({ src, posePoints }) => {
      const video = document.getElementById('v')
      // Respons rute tidak mendukung Range, jadi video dimuat sebagai blob agar bisa di-seek.
      video.src = URL.createObjectURL(await (await fetch(src)).blob())
      await new Promise((resolve) => (video.onloadeddata = resolve))
      const r = (n) => Math.round(n * 10000) / 10000
      const frames = []
      for (let t = 0; t < video.duration; t += 1 / 30) {
        video.currentTime = t
        await new Promise((resolve) => (video.onseeked = resolve))
        window.clock += 34
        const h = window.hand.detectForVideo(video, window.clock)
        const p = window.pose.detectForVideo(video, window.clock)
        frames.push({
          hands: h.landmarks.map((lm, i) => ({
            handedness: h.handedness[i]?.[0]?.categoryName === 'Left' ? 'Left' : 'Right',
            wrist: [r(lm[0].x), r(lm[0].y)],
            world: h.worldLandmarks[i].map((q) => [r(q.x), r(q.y), r(q.z)]),
          })),
          poses: p.landmarks.map((lm, i) => ({
            image: posePoints.map((k) => [r(lm[k].x), r(lm[k].y)]),
            world: posePoints.map((k) => [
              r(p.worldLandmarks[i][k].x),
              r(p.worldLandmarks[i][k].y),
              r(p.worldLandmarks[i][k].z),
            ]),
          })),
        })
      }
      return { aspect: video.videoWidth / video.videoHeight, frames }
    },
    { src: sign.media.video.depan, posePoints: POSE_POINTS },
  )
  const kept = trim(frames)
  const data = { id: sign.id, aspect, frames: kept }
  await writeFile(join(outDir, `${sign.id}.json`), JSON.stringify(data) + '\n')
  console.log(`${sign.id}: ${kept.length} frame`)
}
await browser.close()
