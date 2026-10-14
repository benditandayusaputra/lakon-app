'use client'

import { useEffect, useRef, useState } from 'react'
import { createPipeline, type Pipeline, type PipelineState } from '@/features/practice/pipeline'
import type { HandObservation, PoseObservation } from '@/features/practice/protocol'
import {
  clearSessions,
  countSamples,
  deleteSession,
  exportBinary,
  exportJson,
  listSessions,
  saveSession,
  type CollectCounts,
  type CollectFrame,
  type CollectSample,
  type CollectSession,
} from '@/features/collect/store'

const SAMPLES_PER_SECOND = 3
const WINDOW_FRAMES = 16

const STATUS_TEXT: Record<PipelineState['status'], string> = {
  idle: 'Berhenti.',
  starting: 'Menyiapkan kamera.',
  running: 'Berjalan.',
  denied: 'Izin kamera ditolak. Beri izin lewat pengaturan situs.',
  'no-camera': 'Kamera tidak ditemukan.',
  unsupported: 'Peramban tidak mendukung.',
  error: 'Terjadi galat.',
}

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function CollectLab() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipelineRef = useRef<Pipeline | null>(null)
  const latestRef = useRef<{ hands: HandObservation[]; pose: PoseObservation | null } | null>(null)
  const historyRef = useRef<CollectFrame[]>([])
  const recordingRef = useRef<{ samples: CollectSample[]; interval: number } | null>(null)

  const [state, setState] = useState<PipelineState>({ status: 'idle' })
  const [labels, setLabels] = useState<string[]>([])
  const [label, setLabel] = useState('')
  const [mode, setMode] = useState<'statis' | 'dinamis'>('dinamis')
  const [contributor, setContributor] = useState('')
  const [lighting, setLighting] = useState('terang')
  const [duration, setDuration] = useState(5)
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [counts, setCounts] = useState<CollectCounts | null>(null)
  const [sessions, setSessions] = useState<CollectSession[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const refreshCounts = () => {
    listSessions()
      .then((all) => {
        setSessions(all)
        setCounts(countSamples(all))
      })
      .catch(() => setMessage('IndexedDB tidak tersedia'))
  }

  useEffect(() => {
    refreshCounts()
    fetch('/api/dev/content')
      .then((response) => response.json())
      .then(
        (content: {
          signs: Record<string, unknown>
          handshapes: Record<string, unknown>
          scenarios: Record<string, { vocab?: string[] }>
        }) => {
          const fromSigns = Object.keys(content.signs)
          const fromShapes = Object.keys(content.handshapes)
          const fromVocab = Object.values(content.scenarios).flatMap((s) => s.vocab ?? [])
          const merged = [...new Set([...fromSigns, ...fromVocab, ...fromShapes])].sort()
          setLabels(merged)
          if (merged[0]) setLabel(merged[0])
        },
      )
      .catch(() => setMessage('gagal memuat daftar label'))
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const pipeline = createPipeline({
      video,
      canvas,
      onState: setState,
      onLandmarks: (hands, pose, timestamp) => {
        latestRef.current = { hands, pose }
        const frame: CollectFrame = {
          timestamp,
          hands: hands.map((hand) => ({ handedness: hand.handedness, world: hand.world })),
          pose: pose?.world ?? null,
        }
        historyRef.current.push(frame)
        if (historyRef.current.length > WINDOW_FRAMES * 4) historyRef.current.shift()
      },
    })
    pipelineRef.current = pipeline
    return () => {
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [])

  const startRecording = () => {
    if (!contributor.trim()) {
      setMessage('isi kode kontributor dulu')
      return
    }
    setMessage(null)
    setCountdown(3)
    let remaining = 3
    const countdownInterval = window.setInterval(() => {
      remaining -= 1
      if (remaining > 0) {
        setCountdown(remaining)
        return
      }
      window.clearInterval(countdownInterval)
      setCountdown(null)
      setRecording(true)

      const samples: CollectSample[] = []
      const interval = window.setInterval(() => {
        const history = historyRef.current
        if (history.length === 0) return
        const frames =
          mode === 'statis' ? [history[history.length - 1]!] : history.slice(-WINDOW_FRAMES)
        if (frames.some((frame) => frame.hands.length === 0)) return
        samples.push({ timestamp: frames[frames.length - 1]!.timestamp, frames })
      }, 1000 / SAMPLES_PER_SECOND)
      recordingRef.current = { samples, interval }

      window.setTimeout(() => stopRecording(), duration * 1000)
    }, 1000)
  }

  const stopRecording = () => {
    const active = recordingRef.current
    if (!active) return
    window.clearInterval(active.interval)
    recordingRef.current = null
    setRecording(false)

    const session: CollectSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      mode,
      contributor: contributor.trim(),
      lighting,
      device: navigator.userAgent,
      createdAt: new Date().toISOString(),
      samples: active.samples,
    }
    if (session.samples.length === 0) {
      setMessage('tidak ada landmark terekam, pastikan tangan terlihat kamera')
      return
    }
    saveSession(session)
      .then(() => {
        setMessage(`sesi tersimpan: ${session.samples.length} sampel untuk "${label}"`)
        refreshCounts()
      })
      .catch(() => setMessage('gagal menyimpan sesi'))
  }

  const running = state.status === 'running'

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Pengumpul data latih</h1>
        <p className="max-w-prose text-sm">
          Merekam landmark, bukan video. Data tersimpan di peramban ini (IndexedDB) sampai diekspor.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <fieldset className="flex flex-col gap-3 text-sm">
          <legend className="text-lg font-semibold">Sesi</legend>
          <label className="flex items-center justify-between gap-2">
            <span>Label isyarat</span>
            <select
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="border-border-tegas rounded-md border px-2 py-1"
            >
              {labels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Mode</span>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as 'statis' | 'dinamis')}
              className="border-border-tegas rounded-md border px-2 py-1"
            >
              <option value="statis">statis (bentuk tangan)</option>
              <option value="dinamis">dinamis (gerakan)</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Kode kontributor</span>
            <input
              value={contributor}
              onChange={(event) => setContributor(event.target.value)}
              placeholder="mis. K01"
              className="border-border-tegas w-32 rounded-md border px-2 py-1"
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Pencahayaan</span>
            <select
              value={lighting}
              onChange={(event) => setLighting(event.target.value)}
              className="border-border-tegas rounded-md border px-2 py-1"
            >
              <option value="terang">terang</option>
              <option value="redup">redup</option>
              <option value="lampu-belakang">cahaya dari belakang</option>
              <option value="campuran">campuran</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Durasi rekam (detik)</span>
            <input
              type="number"
              min={2}
              max={60}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="border-border-tegas w-20 rounded-md border px-2 py-1"
            />
          </label>

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void pipelineRef.current?.start()}
              disabled={running}
              className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-white disabled:opacity-50"
            >
              Nyalakan kamera
            </button>
            <button
              type="button"
              onClick={() => pipelineRef.current?.stop()}
              disabled={!running}
              className="border-border-tegas rounded-md border px-4 py-2 disabled:opacity-50"
            >
              Matikan
            </button>
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={!running || countdown !== null}
              className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-white disabled:opacity-50"
            >
              {recording ? 'Berhenti rekam' : 'Mulai rekam'}
            </button>
          </div>
          <p role="status" aria-live="polite">
            {countdown !== null
              ? `mulai dalam ${countdown}...`
              : recording
                ? 'merekam landmark...'
                : (message ?? STATUS_TEXT[state.status])}
          </p>
        </fieldset>

        <div className="aspect-4/3 bg-teks relative w-full overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Hitungan sampel</h2>
        {counts && counts.totalSessions > 0 ? (
          <div className="grid gap-6 text-sm md:grid-cols-2">
            <div>
              <h3 className="font-medium">Per kelas</h3>
              <ul>
                {Object.entries(counts.byLabel).map(([key, value]) => (
                  <li key={key} className="border-border-halus flex justify-between border-b py-1">
                    <span>{key}</span>
                    <span className="font-mono tabular-nums">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Per kontributor</h3>
              <ul>
                {Object.entries(counts.byContributor).map(([key, value]) => (
                  <li key={key} className="border-border-halus flex justify-between border-b py-1">
                    <span>{key}</span>
                    <span className="font-mono tabular-nums">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm">Belum ada sesi tersimpan.</p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => download(exportJson(sessions), 'lakon-collect.json')}
            disabled={sessions.length === 0}
            className="border-border-tegas rounded-md border px-4 py-2 disabled:opacity-50"
          >
            Ekspor JSON
          </button>
          <button
            type="button"
            onClick={() => download(exportBinary(sessions), 'lakon-collect.bin')}
            disabled={sessions.length === 0}
            className="border-border-tegas rounded-md border px-4 py-2 disabled:opacity-50"
          >
            Ekspor binary
          </button>
          <button
            type="button"
            onClick={() => {
              void clearSessions().then(refreshCounts)
            }}
            disabled={sessions.length === 0}
            className="border-border-tegas rounded-md border px-4 py-2 disabled:opacity-50"
          >
            Hapus semua
          </button>
        </div>

        {sessions.length > 0 ? (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">
              Sesi tersimpan ({sessions.length})
            </summary>
            <ul className="mt-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="border-border-halus flex items-center justify-between border-b py-1"
                >
                  <span>
                    {session.label} · {session.mode} · {session.contributor} ·{' '}
                    {session.samples.length} sampel · {session.lighting}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      void deleteSession(session.id).then(refreshCounts)
                    }}
                    className="border-border-tegas rounded-md border px-2 py-0.5"
                  >
                    hapus
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </main>
  )
}
