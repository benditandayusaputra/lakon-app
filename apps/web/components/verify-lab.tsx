'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DEFAULT_FEEDBACK_THRESHOLDS,
  confidence,
  createAutoSegmenter,
  createExplicitSegmenter,
  fuseDecision,
  HAND_LABEL_TO_USER_SIDE,
  type FeedbackThresholds,
  type StablePrediction,
  type Verdict,
} from '@lakon/cv-core'
import { compileSign, type CompiledSign, type CompilerRig } from '@lakon/sign-compiler'
import { parseHandshape, parseSign, type Handshape, type Sign } from '@lakon/sign-schema'
import { extractCompilerRig } from '@/features/avatar/compiler-rig'
import { disposeAvatar, loadAvatar } from '@/features/avatar/vrm'
import { createPipeline, type Pipeline, type PipelineState } from '@/features/practice/pipeline'
import {
  createVerifyRun,
  scoreAgainstReference,
  type VerifyResult,
  type VerifyRun,
} from '@/features/practice/verify'

const STATUS_TEXT: Record<PipelineState['status'], string> = {
  idle: 'Kamera mati.',
  starting: 'Menyiapkan kamera.',
  running: 'Kamera berjalan.',
  denied: 'Izin kamera ditolak. Beri izin lewat pengaturan situs.',
  'no-camera': 'Kamera tidak ditemukan.',
  unsupported: 'Peramban tidak mendukung.',
  error: 'Terjadi galat.',
}

export function VerifyLab() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipelineRef = useRef<Pipeline | null>(null)
  const rigRef = useRef<CompilerRig | null>(null)
  const compiledRef = useRef<CompiledSign | null>(null)
  const runRef = useRef<VerifyRun | null>(null)
  const framesRef = useRef<Float32Array[] | null>(null)
  const progressEl = useRef<HTMLParagraphElement | null>(null)

  const [state, setState] = useState<PipelineState>({ status: 'idle' })
  const [signs, setSigns] = useState<Record<string, Sign>>({})
  const [handshapes, setHandshapes] = useState<Handshape[]>([])
  const [selected, setSelected] = useState('')
  const [mode, setMode] = useState<'eksplisit' | 'otomatis'>('eksplisit')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rigReady, setRigReady] = useState(false)
  const [tolerance, setTolerance] = useState(6)
  const [thresholds, setThresholds] = useState<FeedbackThresholds>(DEFAULT_FEEDBACK_THRESHOLDS)
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const stableRef = useRef<StablePrediction | null>(null)

  useEffect(() => {
    fetch('/api/dev/content')
      .then((response) => response.json())
      .then((content: { signs: Record<string, unknown>; handshapes: Record<string, unknown> }) => {
        const parsedSigns: Record<string, Sign> = {}
        for (const [id, raw] of Object.entries(content.signs)) {
          try {
            parsedSigns[id] = parseSign(raw)
          } catch {
            setError(`isyarat ${id} tidak valid`)
          }
        }
        const shapes: Handshape[] = []
        for (const raw of Object.values(content.handshapes)) {
          try {
            shapes.push(parseHandshape(raw))
          } catch {
            setError('ada handshape tidak valid')
          }
        }
        setSigns(parsedSigns)
        setHandshapes(shapes)
        const first = Object.keys(parsedSigns)[0]
        if (first) setSelected(first)
      })
      .catch(() => setError('gagal memuat konten'))

    let disposed = false
    loadAvatar()
      .then((avatar) => {
        if (disposed) {
          disposeAvatar(avatar)
          return
        }
        rigRef.current = extractCompilerRig(avatar)
        disposeAvatar(avatar)
        setRigReady(true)
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
    return () => {
      disposed = true
    }
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
        runRef.current?.onLandmarks(hands, pose, timestamp)
      },
      onPrediction: (_raw, stable) => {
        stableRef.current = stable
      },
    })
    pipelineRef.current = pipeline
    return () => {
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [])

  const compileSelected = (): CompiledSign | null => {
    const rig = rigRef.current
    const sign = signs[selected]
    if (!rig || !sign) return null
    try {
      const compiled = compileSign(sign, handshapes, rig)
      compiledRef.current = compiled
      return compiled
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return null
    }
  }

  const startRun = () => {
    const compiled = compileSelected()
    if (!compiled) return
    setResult(null)
    setError(null)
    setRunning(true)

    const segmenter =
      mode === 'eksplisit'
        ? createExplicitSegmenter({
            countdownMs: 3000,
            windowMs: Math.max(2000, compiled.duration + 800),
          })
        : createAutoSegmenter({ maxDurationMs: compiled.duration * 3 + 2000 })

    runRef.current = createVerifyRun(
      segmenter,
      (update) => {
        const el = progressEl.current
        if (!el) return
        if (update.phase === 'countdown') {
          el.textContent = `bersiap... ${Math.ceil(update.remainingMs / 1000)}`
        } else if (update.phase === 'recording') {
          el.textContent =
            update.remainingMs !== undefined
              ? `praktikkan sekarang (${(update.remainingMs / 1000).toFixed(1)} dtk)`
              : 'merekam gerakan...'
        } else if (update.phase === 'idle') {
          el.textContent = `menunggu gerakan dimulai (energi ${update.energy.toFixed(2)})`
        }
      },
      (frames) => {
        framesRef.current = frames
        setRunning(false)
        if (frames.length < 5) {
          setError('gerakan terlalu singkat atau tangan tidak terlihat')
          return
        }
        const scored = scoreAgainstReference(frames, compiled, thresholds)
        setResult(scored)
        setVerdict(
          fuseDecision({
            expectedSign: compiled.id,
            stableLabel: stableRef.current?.label ?? null,
            dtwScore: scored.score,
            dtwThreshold: tolerance,
          }),
        )
        if (progressEl.current) progressEl.current.textContent = 'selesai'
      },
    )
  }

  const cancelRun = () => {
    runRef.current?.stop()
    runRef.current = null
    setRunning(false)
    if (progressEl.current) progressEl.current.textContent = 'dibatalkan'
  }

  const rescore = (nextThresholds: FeedbackThresholds) => {
    setThresholds(nextThresholds)
    const frames = framesRef.current
    const compiled = compiledRef.current
    if (frames && compiled) {
      setResult(scoreAgainstReference(frames, compiled, nextThresholds))
    }
  }

  const running_camera = state.status === 'running'
  const signIds = Object.keys(signs)
  const sign = signs[selected]
  const worstPhaseName =
    result && result.analysis.worstPhase !== null && sign
      ? (sign.phases[result.analysis.worstPhase]?.name ?? '-')
      : '-'
  const topJoints = result
    ? [...result.analysis.joints].sort((a, b) => b.distance - a.distance).slice(0, 8)
    : []

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Uji verifikasi gerakan</h1>
        <p className="max-w-prose text-sm">
          Pilih isyarat, praktikkan di depan kamera, lihat skor DTW, jarak per sendi, dan kalimat
          umpan balik yang dihasilkan.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span>Isyarat</span>
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="border-border-tegas rounded-md border px-2 py-1"
          >
            {signIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span>Segmentasi</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as 'eksplisit' | 'otomatis')}
            className="border-border-tegas rounded-md border px-2 py-1"
          >
            <option value="eksplisit">eksplisit (hitung mundur)</option>
            <option value="otomatis">otomatis (deteksi energi)</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void pipelineRef.current?.start()}
          disabled={running_camera}
          className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-white disabled:opacity-50"
        >
          Nyalakan kamera
        </button>
        <button
          type="button"
          onClick={running ? cancelRun : startRun}
          disabled={!running_camera || !rigReady || !selected}
          className="bg-primary hover:bg-primary-hover rounded-md px-4 py-2 text-white disabled:opacity-50"
        >
          {running ? 'Batalkan' : 'Mulai praktik'}
        </button>
        <p role="status" aria-live="polite">
          {error ?? (rigReady ? STATUS_TEXT[state.status] : 'memuat rig avatar...')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="aspect-4/3 bg-teks relative w-full overflow-hidden rounded-lg">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
          </div>
          <p
            ref={progressEl}
            aria-live="assertive"
            className="min-h-6 text-center text-lg font-medium"
          >
            -
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm">
          {result ? (
            <>
              <section>
                <h2 className="text-lg font-semibold">Hasil</h2>
                <p>
                  Keputusan gabungan:{' '}
                  <span className="font-medium">
                    {verdict ? `${verdict.kind} (${verdict.reason})` : '-'}
                  </span>
                </p>
                <p>
                  Skor DTW:{' '}
                  <span className="font-mono tabular-nums">{result.score.toFixed(2)}</span> ·
                  keyakinan:{' '}
                  <span className="font-mono tabular-nums">
                    {(confidence(result.score, tolerance) * 100).toFixed(0)}%
                  </span>{' '}
                  · {result.frameCount} frame · fase paling menyimpang: {worstPhaseName}
                </p>
                <label className="flex items-center gap-2">
                  <span>toleransi skor</span>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={tolerance}
                    onChange={(event) => setTolerance(Number(event.target.value))}
                  />
                  <span className="font-mono tabular-nums">{tolerance.toFixed(1)}</span>
                </label>
              </section>

              <section>
                <h2 className="text-lg font-semibold">Umpan balik</h2>
                <ul className="list-inside list-disc">
                  {result.feedback.messages.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold">Jarak per sendi (terbesar)</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-border-halus border-b text-left">
                      <th className="py-1">tangan</th>
                      <th>landmark</th>
                      <th className="text-right">jarak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topJoints.map((joint) => (
                      <tr
                        key={`${joint.side}-${joint.landmark}`}
                        className="border-border-halus border-b"
                      >
                        <td className="py-1">{HAND_LABEL_TO_USER_SIDE[joint.side]}</td>
                        <td>{joint.landmark}</td>
                        <td className="text-right font-mono tabular-nums">
                          {joint.distance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          ) : (
            <p>Belum ada hasil. Nyalakan kamera lalu mulai praktik.</p>
          )}

          <section>
            <h2 className="text-lg font-semibold">Ambang umpan balik</h2>
            {(
              [
                ['finger', 'jari', 0.1, 3],
                ['wristAxis', 'posisi pergelangan', 0.05, 1],
                ['knuckle', 'arah telapak', 0.1, 3],
                ['curlDirection', 'arah tekukan', 0.1, 2],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className="flex items-center gap-2">
                <span className="w-40">{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={0.05}
                  value={thresholds[key]}
                  onChange={(event) =>
                    rescore({ ...thresholds, [key]: Number(event.target.value) })
                  }
                />
                <span className="font-mono tabular-nums">{thresholds[key].toFixed(2)}</span>
              </label>
            ))}
          </section>
        </div>
      </div>
    </main>
  )
}
