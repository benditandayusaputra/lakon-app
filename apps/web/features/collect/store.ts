import type { Point3 } from '../practice/protocol'

export type CollectFrame = {
  timestamp: number
  hands: { handedness: 'Left' | 'Right'; world: Point3[] }[]
  pose: Point3[] | null
}

export type CollectSample = {
  timestamp: number
  frames: CollectFrame[]
}

export type CollectSession = {
  id: string
  label: string
  mode: 'statis' | 'dinamis'
  contributor: string
  lighting: string
  device: string
  createdAt: string
  samples: CollectSample[]
}

const DB_NAME = 'lakon-collect'
const STORE = 'sessions'

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB gagal dibuka'))
  })

const withStore = async <T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = work(tx.objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB gagal'))
    tx.oncomplete = () => db.close()
  })
}

export const saveSession = (session: CollectSession) =>
  withStore('readwrite', (store) => store.put(session))

export const listSessions = () =>
  withStore<CollectSession[]>('readonly', (store) => store.getAll() as IDBRequest<CollectSession[]>)

export const deleteSession = (id: string) => withStore('readwrite', (store) => store.delete(id))

export const clearSessions = () => withStore('readwrite', (store) => store.clear())

export type CollectCounts = {
  byLabel: Record<string, number>
  byContributor: Record<string, number>
  totalSamples: number
  totalSessions: number
}

export const countSamples = (sessions: CollectSession[]): CollectCounts => {
  const byLabel: Record<string, number> = {}
  const byContributor: Record<string, number> = {}
  let totalSamples = 0
  for (const session of sessions) {
    byLabel[session.label] = (byLabel[session.label] ?? 0) + session.samples.length
    byContributor[session.contributor] =
      (byContributor[session.contributor] ?? 0) + session.samples.length
    totalSamples += session.samples.length
  }
  return { byLabel, byContributor, totalSamples, totalSessions: sessions.length }
}

export const exportJson = (sessions: CollectSession[]): Blob =>
  new Blob([JSON.stringify({ version: 1, sessions }, null, 2)], { type: 'application/json' })

export const exportBinary = (sessions: CollectSession[]): Blob => {
  const manifest: unknown[] = []
  const floats: number[] = []
  for (const session of sessions) {
    for (const sample of session.samples) {
      const start = floats.length
      const frameMeta = sample.frames.map((frame) => {
        for (const hand of frame.hands) {
          for (const point of hand.world) floats.push(point.x, point.y, point.z)
        }
        if (frame.pose) {
          for (const point of frame.pose) floats.push(point.x, point.y, point.z)
        }
        return {
          timestamp: frame.timestamp,
          hands: frame.hands.map((hand) => ({
            handedness: hand.handedness,
            points: hand.world.length,
          })),
          posePoints: frame.pose?.length ?? 0,
        }
      })
      manifest.push({
        session: session.id,
        label: session.label,
        mode: session.mode,
        contributor: session.contributor,
        timestamp: sample.timestamp,
        frames: frameMeta,
        floatOffset: start,
        floatCount: floats.length - start,
      })
    }
  }
  const header = new TextEncoder().encode(JSON.stringify({ version: 1, manifest }))
  const paddedHeader = Math.ceil(header.byteLength / 4) * 4
  const buffer = new ArrayBuffer(8 + paddedHeader + floats.length * 4)
  const view = new DataView(buffer)
  view.setUint32(0, 0x4c414b4e)
  view.setUint32(4, header.byteLength)
  new Uint8Array(buffer, 8, header.byteLength).set(header)
  new Float32Array(buffer, 8 + paddedHeader).set(floats)
  return new Blob([buffer], { type: 'application/octet-stream' })
}
