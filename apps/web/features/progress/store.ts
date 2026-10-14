'use client'

export type Arah = 'deaf' | 'service'

export type SignProgressEntry = {
  signId: string
  direction: Arah
  status: 'belum' | 'berlatih' | 'dikuasai' | 'dinilai-sendiri'
  attempts: number
  updatedAt: number
}

export type RunEntry = {
  scenarioId: string
  direction: Arah
  durationMs: number
  mastered: string[]
  needsRepeat: string[]
  completedAt: number
}

export type SyncState = 'menyimpan' | 'tersimpan' | 'gagal' | 'offline' | 'tanpa-akun'

type Permintaan = { url: string; method: string; body: string }

const BATAS_KEEPALIVE = 60_000
const JEDA_ULANG = 5000
const JEDA_CHECKPOINT = 1200

const berjalan = new Set<Promise<void>>()
const gagal = new Map<string, Permintaan>()
const versi = new Map<string, number>()
const cpTertunda = new Map<string, Permintaan>()
const listeners = new Set<(state: SyncState) => void>()
let currentState: SyncState = 'tersimpan'
let timerUlang: number | null = null
let timerCheckpoint: number | null = null

const setState = (state: SyncState) => {
  currentState = state
  for (const listener of listeners) listener(state)
}

export const onSyncState = (listener: (state: SyncState) => void) => {
  listeners.add(listener)
  listener(currentState)
  return () => {
    listeners.delete(listener)
  }
}

const perbaruiState = (akhir: SyncState) => {
  if (akhir === 'tanpa-akun') setState('tanpa-akun')
  else if (berjalan.size > 0) setState('menyimpan')
  else if (gagal.size > 0) setState(navigator.onLine ? 'gagal' : 'offline')
  else setState(akhir)
}

const kirimUlang = () => {
  if (timerUlang !== null) window.clearTimeout(timerUlang)
  timerUlang = null
  for (const [kunci, permintaan] of [...gagal]) void kirim(kunci, permintaan)
}

const kirim = (kunci: string, permintaan: Permintaan): Promise<void> => {
  const nomor = (versi.get(kunci) ?? 0) + 1
  versi.set(kunci, nomor)
  gagal.delete(kunci)
  let akhir: SyncState = 'tersimpan'
  const janji = fetch(permintaan.url, {
    method: permintaan.method,
    headers: { 'content-type': 'application/json' },
    body: permintaan.body,
    keepalive: permintaan.body.length < BATAS_KEEPALIVE,
  })
    .then((response) => {
      if (response.status === 401) {
        akhir = 'tanpa-akun'
        throw new Error('sesi habis')
      }
      if (!response.ok) throw new Error(`server ${response.status}`)
    })
    .catch(() => {
      if (versi.get(kunci) === nomor) gagal.set(kunci, permintaan)
      if (timerUlang === null) timerUlang = window.setTimeout(kirimUlang, JEDA_ULANG)
    })
    .finally(() => {
      berjalan.delete(janji)
      perbaruiState(akhir)
    })
  berjalan.add(janji)
  setState('menyimpan')
  return janji
}

const kirimCheckpoint = () => {
  if (timerCheckpoint !== null) window.clearTimeout(timerCheckpoint)
  timerCheckpoint = null
  for (const [kunci, permintaan] of cpTertunda) void kirim(kunci, permintaan)
  cpTertunda.clear()
}

const tungguTulisan = async () => {
  kirimCheckpoint()
  await Promise.allSettled([...berjalan])
}

export const bacaProgres = async (): Promise<{
  signs: SignProgressEntry[]
  runs: RunEntry[]
}> => {
  await tungguTulisan()
  const response = await fetch('/api/progress', { cache: 'no-store' })
  if (!response.ok) throw new Error(`progres gagal dimuat (${response.status})`)
  const data = (await response.json()) as { signs: SignProgressEntry[]; runs: RunEntry[] }
  return { signs: data.signs, runs: data.runs }
}

export const saveSignProgress = (entry: Omit<SignProgressEntry, 'updatedAt'>) =>
  kirim(`sign:${entry.direction}:${entry.signId}`, {
    url: '/api/progress',
    method: 'POST',
    body: JSON.stringify({ signs: [{ ...entry, updatedAt: Date.now() }] }),
  })

export const saveRun = (run: RunEntry) =>
  kirim(`run:${run.direction}:${run.scenarioId}:${run.completedAt}`, {
    url: '/api/progress',
    method: 'POST',
    body: JSON.stringify({ runs: [run] }),
  })

export const bacaCheckpoint = async <T>(
  scenarioId: string,
  direction: Arah,
): Promise<{ state: T; updatedAt: number } | null> => {
  await tungguTulisan()
  try {
    const response = await fetch(
      `/api/checkpoint?scenarioId=${encodeURIComponent(scenarioId)}&direction=${direction}`,
      { cache: 'no-store' },
    )
    if (!response.ok) return null
    const data = (await response.json()) as {
      checkpoint: { state: string; updatedAt: number } | null
    }
    if (!data.checkpoint) return null
    return { state: JSON.parse(data.checkpoint.state) as T, updatedAt: data.checkpoint.updatedAt }
  } catch {
    return null
  }
}

export const tulisCheckpoint = (scenarioId: string, direction: Arah, state: unknown) => {
  cpTertunda.set(`cp:${direction}:${scenarioId}`, {
    url: '/api/checkpoint',
    method: 'PUT',
    body: JSON.stringify({
      scenarioId,
      direction,
      state: JSON.stringify(state),
      updatedAt: Date.now(),
    }),
  })
  if (timerCheckpoint !== null) window.clearTimeout(timerCheckpoint)
  timerCheckpoint = window.setTimeout(kirimCheckpoint, JEDA_CHECKPOINT)
}

export const hapusCheckpoint = (scenarioId: string, direction: Arah) => {
  const kunci = `cp:${direction}:${scenarioId}`
  cpTertunda.delete(kunci)
  return kirim(kunci, {
    url: '/api/checkpoint',
    method: 'DELETE',
    body: JSON.stringify({ scenarioId, direction }),
  })
}

export const clearAllProgress = async () => {
  cpTertunda.clear()
  await tungguTulisan()
  const response = await fetch('/api/progress', { method: 'DELETE' })
  if (!response.ok) throw new Error(`gagal menghapus (${response.status})`)
  gagal.clear()
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', kirimUlang)
  window.addEventListener('offline', () => perbaruiState(currentState))
  window.addEventListener('pagehide', kirimCheckpoint)
}
