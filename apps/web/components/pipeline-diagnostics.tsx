'use client'

import { useEffect, useRef, useState } from 'react'
import { DEFAULT_STABILIZER, type StabilizerParams } from '@lakon/cv-core'
import {
  detectRoute,
  hasTrackProcessor,
  hasVideoFrameCallback,
  type CaptureRoute,
} from '@/features/practice/capture'
import {
  createPipeline,
  type Pipeline,
  type PipelineState,
  type PipelineStats,
} from '@/features/practice/pipeline'

const METRICS = [
  {
    key: 'cameraFps',
    label: 'Laju frame kamera',
    format: (s: PipelineStats) => `${s.cameraFps.toFixed(1)} fps`,
  },
  {
    key: 'inferenceFps',
    label: 'Laju frame inferensi',
    format: (s: PipelineStats) => `${s.inferenceFps.toFixed(1)} fps`,
  },
  {
    key: 'inferenceMs',
    label: 'Waktu inferensi rata-rata',
    format: (s: PipelineStats) => `${s.inferenceMs.toFixed(1)} ms`,
  },
  { key: 'hands', label: 'Tangan terdeteksi', format: (s: PipelineStats) => String(s.hands) },
  {
    key: 'backend',
    label: 'Backend aktif',
    format: (s: PipelineStats) => s.backend ?? 'belum siap',
  },
  {
    key: 'classifierBackend',
    label: 'Backend klasifikasi',
    format: (s: PipelineStats) => s.classifierBackend ?? 'memeriksa',
  },
  {
    key: 'route',
    label: 'Jalur pengambilan gambar',
    format: (s: PipelineStats) => s.route ?? 'belum jalan',
  },
  {
    key: 'resolution',
    label: 'Resolusi kamera',
    format: (s: PipelineStats) => s.resolution ?? '-',
  },
  {
    key: 'dropped',
    label: 'Frame dilewati',
    format: (s: PipelineStats) => String(s.droppedFrames),
  },
  {
    key: 'queued',
    label: 'Frame dalam antrean',
    format: (s: PipelineStats) => String(s.queuedFrames),
  },
  {
    key: 'age',
    label: 'Usia data terakhir',
    format: (s: PipelineStats) =>
      s.lastLandmarkAt === 0 ? '-' : `${Math.round(performance.now() - s.lastLandmarkAt)} ms`,
  },
] as const

const STATUS_TEXT: Record<PipelineState['status'], string> = {
  idle: 'Berhenti. Tekan mulai untuk menjalankan pipeline.',
  starting: 'Menyiapkan kamera dan memuat model MediaPipe.',
  running: 'Berjalan.',
  denied: 'Izin kamera ditolak. Beri izin lewat pengaturan situs, lalu tekan mulai lagi.',
  'no-camera': 'Kamera tidak ditemukan. Sambungkan kamera lalu tekan mulai lagi.',
  unsupported: 'Peramban ini tidak mendukung pengambilan frame yang dibutuhkan.',
  error: 'Terjadi galat.',
}

export function PipelineDiagnostics() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipelineRef = useRef<Pipeline | null>(null)
  const valueRefs = useRef(new Map<string, HTMLSpanElement>())
  const predictionRef = useRef<string>('-')
  const predictionEl = useRef<HTMLSpanElement | null>(null)

  const [state, setState] = useState<PipelineState>({ status: 'idle' })
  const [forcedRoute, setForcedRoute] = useState<CaptureRoute | 'auto'>('auto')
  const [stabilizer, setStabilizer] = useState<StabilizerParams>(DEFAULT_STABILIZER)
  const [capabilities, setCapabilities] = useState<{
    trackProcessor: boolean
    videoFrameCallback: boolean
    preferred: string
  } | null>(null)

  useEffect(() => {
    setCapabilities({
      trackProcessor: hasTrackProcessor(),
      videoFrameCallback: hasVideoFrameCallback(),
      preferred: detectRoute() ?? 'tidak ada',
    })
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const pipeline = createPipeline({
      video,
      canvas,
      onState: setState,
      onPrediction: (raw, stable) => {
        predictionRef.current = stable.label
          ? `${stable.label} (${(stable.meanConfidence * 100).toFixed(0)}%, ${stable.votes} suara)`
          : `belum stabil (${raw.label} ${(raw.confidence * 100).toFixed(0)}%)`
      },
    })
    pipelineRef.current = pipeline

    let raf = 0
    let last = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (now - last < 200) return
      last = now
      for (const metric of METRICS) {
        const node = valueRefs.current.get(metric.key)
        if (node) node.textContent = metric.format(pipeline.stats)
      }
      if (predictionEl.current) predictionEl.current.textContent = predictionRef.current
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [])

  const busy = state.status === 'starting'
  const running = state.status === 'running'

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Diagnostik pipeline</h1>
        <p className="max-w-prose text-sm">
          Alat pengukur untuk jalur kamera, worker MediaPipe, dan penggambaran overlay. Halaman ini
          tetap bisa dibaca tanpa menyalakan kamera.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            void pipelineRef.current?.start(forcedRoute === 'auto' ? undefined : forcedRoute)
          }
          disabled={busy || running}
          className="bg-primary hover:bg-primary-hover focus-visible:outline-primary rounded-md px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Mulai
        </button>
        <button
          type="button"
          onClick={() => pipelineRef.current?.stop()}
          disabled={!running && !busy}
          className="border-border-tegas focus-visible:outline-primary rounded-md border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Berhenti
        </button>
        <label className="flex items-center gap-2 text-sm">
          <span>Paksa jalur</span>
          <select
            value={forcedRoute}
            onChange={(event) => setForcedRoute(event.target.value as CaptureRoute | 'auto')}
            disabled={running || busy}
            className="border-border-tegas rounded-md border px-2 py-1 disabled:opacity-50"
          >
            <option value="auto">otomatis</option>
            <option value="track-processor">track-processor</option>
            <option value="video-frame-callback">video-frame-callback</option>
          </select>
        </label>
        <p role="status" aria-live="polite" className="text-sm">
          <span className="font-medium">{state.status}</span>
          <span> — {state.message ?? STATUS_TEXT[state.status]}</span>
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="aspect-4/3 bg-teks relative w-full overflow-hidden rounded-lg">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
        </div>

        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 self-start text-sm">
          {METRICS.map((metric) => (
            <div key={metric.key} className="contents">
              <dt className="border-border-halus border-b py-1">{metric.label}</dt>
              <dd className="border-border-halus border-b py-1 text-right font-mono tabular-nums">
                <span
                  ref={(node) => {
                    if (node) valueRefs.current.set(metric.key, node)
                    else valueRefs.current.delete(metric.key)
                  }}
                >
                  -
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Klasifikasi</h2>
        <p className="text-sm">
          Prediksi stabil:{' '}
          <span ref={predictionEl} className="font-mono">
            -
          </span>
        </p>
        <div className="grid max-w-md gap-2 text-sm">
          {(
            [
              ['inferEvery', 'inferensi tiap n frame', 1, 6, 1],
              ['bufferSize', 'ukuran penyangga', 4, 20, 1],
              ['minVotes', 'suara minimum', 2, 15, 1],
              ['minConfidence', 'keyakinan minimum', 0.5, 1, 0.01],
            ] as const
          ).map(([key, label, min, max, step]) => (
            <label key={key} className="flex items-center gap-2">
              <span className="w-44">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={stabilizer[key]}
                onChange={(event) => {
                  const next = { ...stabilizer, [key]: Number(event.target.value) }
                  setStabilizer(next)
                  pipelineRef.current?.setStabilizer(next)
                }}
              />
              <span className="font-mono tabular-nums">
                {key === 'minConfidence' ? stabilizer[key].toFixed(2) : stabilizer[key]}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Kapabilitas peramban</h2>
        <ul className="text-sm">
          <li>
            MediaStreamTrackProcessor:{' '}
            <strong>{capabilities?.trackProcessor ? 'tersedia' : 'tidak tersedia'}</strong>
          </li>
          <li>
            requestVideoFrameCallback:{' '}
            <strong>{capabilities?.videoFrameCallback ? 'tersedia' : 'tidak tersedia'}</strong>
          </li>
          <li>
            Jalur terpilih: <strong>{capabilities?.preferred ?? 'memeriksa'}</strong>
          </li>
        </ul>
      </section>
    </main>
  )
}
