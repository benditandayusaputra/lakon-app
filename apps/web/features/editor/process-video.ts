import type { CollectFrame } from '../collect/store'
import { DEFAULT_WORKER_CONFIG, type FromWorker, type ToWorker } from '../practice/protocol'

export const extractLandmarksFromVideo = (
  file: File,
  onProgress?: (seconds: number) => void,
): Promise<CollectFrame[]> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true

    const worker = new Worker(new URL('../../workers/cv.worker.ts', import.meta.url), {
      type: 'module',
      name: 'lakon-cv-video',
    })
    const frames: CollectFrame[] = []
    let inFlight = false
    let ended = false

    const cleanup = () => {
      worker.terminate()
      video.pause()
      URL.revokeObjectURL(url)
    }

    const finish = () => {
      cleanup()
      resolve(frames)
    }

    const send = (message: ToWorker, transfer: Transferable[] = []) =>
      worker.postMessage(message, transfer)

    const tick = () => {
      if (ended) return
      if (!inFlight) {
        inFlight = true
        createImageBitmap(video)
          .then((bitmap) => {
            send({ type: 'frame', frame: bitmap, timestamp: video.currentTime * 1000 }, [bitmap])
          })
          .catch(() => {
            inFlight = false
          })
      }
      video.requestVideoFrameCallback(tick)
    }

    worker.onmessage = (event: MessageEvent<FromWorker>) => {
      const message = event.data
      if (message.type === 'ready') {
        video
          .play()
          .then(() => video.requestVideoFrameCallback(tick))
          .catch((err: unknown) => {
            cleanup()
            reject(err instanceof Error ? err : new Error(String(err)))
          })
        return
      }
      if (message.type === 'error') {
        cleanup()
        reject(new Error(message.message))
        return
      }
      if (message.type !== 'landmarks') return
      inFlight = false
      frames.push({
        timestamp: message.timestamp,
        hands: message.hands.map((hand) => ({ handedness: hand.handedness, world: hand.world })),
        pose: message.pose?.world ?? null,
      })
      onProgress?.(message.timestamp / 1000)
      if (ended) finish()
    }
    worker.onerror = (event) => {
      cleanup()
      reject(new Error(event.message))
    }

    video.onended = () => {
      ended = true
      if (!inFlight) finish()
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('video tidak bisa diputar'))
    }

    send({ type: 'init', config: DEFAULT_WORKER_CONFIG })
  })
