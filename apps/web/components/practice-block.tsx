'use client'

import { TriangleAlert, VideoOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createExplicitSegmenter, type StablePrediction, type Verdict } from '@lakon/cv-core'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { UmpanJawab } from '@/components/umpan-jawab'
import calibrationData from '@/features/practice/calibration.json'
import {
  PASS_SIMILARITY,
  passScore,
  similarity,
  type SignCalibration,
} from '@/features/practice/calibration'
import { kameraHidup } from '@/features/practice/capture'
import { decideAttempt } from '@/features/practice/decision'
import { PAKAI_MODEL } from '@/features/practice/model-config'
import { createPipeline, type Pipeline, type PipelineState } from '@/features/practice/pipeline'
import {
  createVerifyRun,
  scoreAgainstReference,
  type VerifyResult,
  type VerifyRun,
} from '@/features/practice/verify'

export type PracticePhase =
  | 'kamera-mati'
  | 'menunggu-izin'
  | 'ditolak'
  | 'siap'
  | 'hitung-mundur'
  | 'merekam'
  | 'memeriksa'
  | 'berhasil'
  | 'belum-tepat'
  | 'jalan-keluar'

const DTW_THRESHOLD = 7
const CALIBRATION: Record<string, SignCalibration> = calibrationData

export const PERAGA_SETELAH_GAGAL = 3

export function PracticeBlock({
  compiled,
  sign,
  signLabel,
  onPassed,
  onFailedAttempt,
  onSelfAssessed,
  compact = false,
  peragaAwal = false,
  sejajar = false,
  kontrolPutar = true,
}: {
  compiled: CompiledSign
  sign?: Sign
  signLabel: string
  onPassed?: (verdict: Verdict, result: VerifyResult) => void
  onFailedAttempt?: (result: VerifyResult) => void
  onSelfAssessed?: () => void
  compact?: boolean
  peragaAwal?: boolean
  sejajar?: boolean
  kontrolPutar?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pipelineRef = useRef<Pipeline | null>(null)
  const runRef = useRef<VerifyRun | null>(null)
  const stableRef = useRef<StablePrediction | null>(null)
  const progressEl = useRef<HTMLParagraphElement | null>(null)
  const meterEl = useRef<HTMLDivElement | null>(null)

  const [phase, setPhase] = useState<PracticePhase>('kamera-mati')
  const [pipelineState, setPipelineState] = useState<PipelineState>({ status: 'idle' })
  const [result, setResult] = useState<VerifyResult | null>(null)
  const calibration = CALIBRATION[compiled.id]
  const [verdict, setVerdict] = useState<Verdict | null>(null)
  const [failures, setFailures] = useState(0)
  const [peragaTampil, setPeragaTampil] = useState(peragaAwal)

  useEffect(() => {
    setPhase((current) => {
      if (current === 'jalan-keluar' || current === 'ditolak') return current
      const status = pipelineRef.current?.state().status
      if (status === 'running') return 'siap'
      if (status === 'starting') return 'menunggu-izin'
      return 'kamera-mati'
    })
    setFailures(0)
    setResult(null)
    setVerdict(null)
    setPeragaTampil(peragaAwal)
  }, [compiled.id, peragaAwal])

  useEffect(() => {
    if (failures >= PERAGA_SETELAH_GAGAL) setPeragaTampil(true)
  }, [failures])

  useEffect(() => {
    if (phase === 'jalan-keluar') setPeragaTampil(true)
  }, [phase])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const pipeline = createPipeline({
      video,
      canvas,
      classifier: PAKAI_MODEL,
      onState: (state) => {
        setPipelineState(state)
        setPhase((current) => {
          if (state.status === 'starting') return 'menunggu-izin'
          if (state.status === 'denied') return 'ditolak'
          if (
            state.status === 'running' &&
            (current === 'menunggu-izin' || current === 'kamera-mati')
          )
            return 'siap'
          if (
            (state.status === 'no-camera' ||
              state.status === 'unsupported' ||
              state.status === 'error') &&
            current !== 'jalan-keluar'
          )
            return 'ditolak'
          return current
        })
      },
      onLandmarks: (hands, pose, timestamp) => {
        runRef.current?.onLandmarks(hands, pose, timestamp)
        if (meterEl.current) {
          const seen = hands.length > 0
          meterEl.current.style.width = seen ? '100%' : '12%'
          meterEl.current.dataset.state = seen ? 'terlihat' : 'mencari'
        }
      },
      onPrediction: (_raw, stable) => {
        stableRef.current = stable
      },
    })
    pipelineRef.current = pipeline
    if (kameraHidup()) {
      setPhase('menunggu-izin')
      void pipeline.start()
    }
    return () => {
      pipeline.stop()
      pipelineRef.current = null
    }
  }, [])

  const startCamera = () => {
    setPhase('menunggu-izin')
    void pipelineRef.current?.start()
  }

  const startAttempt = useCallback(() => {
    setResult(null)
    setVerdict(null)
    setPhase('hitung-mundur')

    const segmenter = createExplicitSegmenter({
      countdownMs: 3000,
      windowMs: Math.max(2000, compiled.duration + 600),
    })
    runRef.current = createVerifyRun(
      segmenter,
      (update) => {
        const el = progressEl.current
        if (!el) return
        if (update.phase === 'countdown') {
          setPhase((current) => (current === 'hitung-mundur' ? current : 'hitung-mundur'))
          el.textContent = String(Math.ceil(update.remainingMs / 1000))
        } else if (update.phase === 'recording') {
          setPhase((current) => (current === 'merekam' ? current : 'merekam'))
          el.textContent = 'peragakan sekarang'
        }
      },
      (frames) => {
        setPhase('memeriksa')
        const scored = scoreAgainstReference(frames, compiled)
        const backend = pipelineRef.current?.stats.classifierBackend
        const modelSiap = PAKAI_MODEL && backend !== 'tanpa model' && backend != null
        const decision = decideAttempt({
          expectedSign: compiled.id,
          handsVisible: scored.analysis.hands.every((hand) => hand.present),
          score: scored.score,
          passScore: calibration ? passScore(calibration) : DTW_THRESHOLD,
          model: modelSiap ? { label: stableRef.current?.label ?? null } : null,
        })
        setResult(scored)
        setVerdict(decision)
        if (frames.length < 5) {
          setFailures((count) => count + 1)
          setPhase('belum-tepat')
          return
        }
        if (decision.kind === 'belum-tepat') {
          setFailures((count) => count + 1)
          onFailedAttempt?.(scored)
          setPhase('belum-tepat')
        } else {
          setFailures(0)
          setPhase('berhasil')
        }
      },
    )
  }, [calibration, compiled, onFailedAttempt])

  const cameraRunning = pipelineState.status === 'running'
  const modelGagal = pipelineState.status === 'error' && pipelineState.sumber === 'model'
  const kembaliSiap = () => setPhase(cameraRunning ? 'siap' : 'kamera-mati')

  const selfAssess = () => {
    setFailures(0)
    kembaliSiap()
    onSelfAssessed?.()
  }

  const lanjutBerhasil = () => {
    kembaliSiap()
    if (verdict && result) onPassed?.(verdict, result)
  }

  const peragaWajib = failures >= PERAGA_SETELAH_GAGAL
  const tanganTerlihat = result?.analysis.hands.every((hand) => hand.present) ?? false
  const pesanBelumTepat =
    verdict?.reason === 'klasifikasi-salah'
      ? `Pengenal belum yakin minimal ${PASS_SIMILARITY * 100}% bahwa ini isyarat ${signLabel}. Perhatikan peragaan, lalu coba lagi.`
      : calibration && result && tanganTerlihat
        ? `Kemiripan ${Math.round(similarity(result.score, calibration) * 100)}%, perlu minimal ${PASS_SIMILARITY * 100}%. Perhatikan peragaan, lalu coba lagi.`
        : 'Masih belum sesuai. Perhatikan peragaan, lalu coba lagi.'

  return (
    <div className="flex flex-col gap-4">
      <div className={peragaAwal ? 'hidden' : 'flex flex-wrap items-center gap-3'}>
        <button
          type="button"
          onClick={() => setPeragaTampil((value) => !value)}
          aria-pressed={peragaTampil}
          className="tombol-sekunder"
        >
          {peragaTampil ? 'Sembunyikan peragaan' : 'Tampilkan peragaan'}
        </button>
        <p className="text-teks-sekunder text-sm">
          {peragaWajib
            ? `Sudah ${failures}× gagal, peragaan dibuka supaya bisa kamu tiru.`
            : peragaTampil
              ? 'Peragaan terbuka. Sembunyikan lagi kalau mau menguji ingatanmu.'
              : 'Peragaan disembunyikan supaya kamu mengingat sendiri dulu.'}
        </p>
      </div>

      <div className={sejajar ? 'grid gap-3 md:grid-cols-2 md:items-start' : 'flex flex-col gap-3'}>
        {peragaTampil ? (
          <div className="bg-zona-tenang zona-tenang-gradasi rounded-kartu w-full overflow-hidden">
            <AvatarStage
              compiled={compiled}
              sign={sign}
              showControls={kontrolPutar}
              sudutKontrol
              signLabel={signLabel}
              className={sejajar ? 'sm:aspect-4/3 w-full' : 'sm:h-[54vh]'}
            />
          </div>
        ) : null}
        <div
          className={`bg-zona-tenang rounded-kartu relative w-full overflow-hidden ${
            sejajar
              ? 'sm:aspect-4/3 aspect-[4/5]'
              : peragaTampil || compact
                ? 'aspect-4/3'
                : 'aspect-video'
          }`}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />
          {phase === 'hitung-mundur' || phase === 'merekam' ? (
            <p
              ref={progressEl}
              aria-live="assertive"
              className="absolute inset-x-0 top-3 text-center text-3xl font-bold text-white drop-shadow"
            />
          ) : null}
          <p className="text-halaman absolute bottom-14 left-3 rounded-lg bg-black/60 px-2.5 py-1 font-mono text-xs">
            {cameraRunning ? 'kamu' : 'kamera belum menyala'}
          </p>
          <div className="absolute inset-x-4 bottom-3">
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div
                ref={meterEl}
                data-state="mencari"
                className="bg-berhasil h-full w-[12%] rounded-full transition-[width] duration-500"
              />
            </div>
            <p className="mt-1 text-center text-xs text-white/90">
              penuh berarti tanganmu terlihat sistem
            </p>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="flex min-h-14 flex-col gap-3">
        {phase === 'kamera-mati' ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={startCamera} className="tombol-utama">
                Nyalakan kamera
              </button>
              <button
                type="button"
                onClick={() => setPhase('jalan-keluar')}
                className="tombol-sekunder"
              >
                Tanpa kamera
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'menunggu-izin' ? (
          <p>{pipelineState.message ?? 'Menunggu izin kamera dari peramban…'}</p>
        ) : null}

        {phase === 'ditolak' ? (
          <div className="flex flex-col gap-2">
            {modelGagal ? (
              <p>
                <TriangleAlert
                  aria-hidden
                  className="text-galat mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
                />
                Pengenal gerakan gagal dimuat. Kamu tetap bisa berlatih dengan membandingkan
                sendiri.
              </p>
            ) : (
              <p>
                <VideoOff
                  aria-hidden
                  className={`mr-1 inline-block h-[1em] w-[1em] align-text-bottom ${
                    pipelineState.status === 'denied' ? 'text-primary' : 'text-galat'
                  }`}
                />
                Kamera tidak tersedia
                {pipelineState.status === 'denied' ? ' karena izin ditolak' : ''}. Kamu tetap bisa
                berlatih dengan membandingkan sendiri.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setPhase('jalan-keluar')}
                className="tombol-utama"
              >
                Latihan tanpa kamera
              </button>
              <button type="button" onClick={startCamera} className="tombol-sekunder">
                {modelGagal ? 'Muat ulang pengenal' : 'Coba kamera lagi'}
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'siap' ? (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={startAttempt} className="tombol-utama">
              Mulai peragakan
            </button>
            <p className="text-sm">Hitungan mundur 3 detik, lalu tirukan gerakan peraga.</p>
          </div>
        ) : null}

        {phase === 'memeriksa' ? <p>Memeriksa gerakanmu…</p> : null}

        {phase === 'berhasil' ? (
          <UmpanJawab
            benar
            jawaban={signLabel}
            onLanjut={lanjutBerhasil}
            onCobaLagi={kembaliSiap}
          />
        ) : null}

        {phase === 'belum-tepat' ? (
          <UmpanJawab
            benar={false}
            pesanSalah={pesanBelumTepat}
            onCobaLagi={kembaliSiap}
            onLewati={failures >= PERAGA_SETELAH_GAGAL ? selfAssess : undefined}
          />
        ) : null}

        {phase === 'jalan-keluar' ? (
          <div className="border-border-tegas rounded-kartu flex flex-col gap-2 border-2 p-4">
            <p className="font-bold">Bandingkan sendiri</p>
            <p className="text-sm">
              Perhatikan peraga di atas{cameraRunning ? ' dan pratinjaumu di bawahnya' : ''}. Kamu
              yang menilai. Ini cara belajar yang sah, bukan menyerah.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={selfAssess} className="tombol-utama">
                Sudah cukup mirip, lanjut
              </button>
              {cameraRunning ? (
                <button type="button" onClick={startAttempt} className="tombol-sekunder">
                  Coba verifikasi lagi
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
