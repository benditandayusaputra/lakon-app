'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FileText } from 'lucide-react'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario } from '@lakon/sign-schema'
import { IzinKamera } from '@/components/scenes/izin-kamera'
import { KeluarAdegan } from '@/components/scenes/keluar-adegan'
import { TiraiSelesai } from '@/components/scenes/tirai-selesai'
import { SyncBadge } from '@/components/sync-badge'
import { SceneLuarPuskesmas } from '@/components/scenes/puskesmas/scene-luar'
import { SceneBelajarPuskesmas } from '@/components/scenes/puskesmas/scene-belajar'
import { SceneUjianPuskesmas } from '@/components/scenes/puskesmas/scene-ujian'
import { SceneResepPuskesmas } from '@/components/scenes/puskesmas/scene-resep'
import { SEED_SAN_RIG } from '@/features/avatar/seed-san-rig'
import { useContent } from '@/features/content/use-content'
import {
  createScenarioEngine,
  summarizeRun,
  type Direction,
  type ScenarioEngine,
} from '@/features/scenario/engine'
import { createLearningPhase, type LearningPhase } from '@/features/scenario/learning'
import {
  bacaCheckpoint,
  hapusCheckpoint,
  saveRun,
  saveSignProgress,
  tulisCheckpoint,
} from '@/features/progress/store'
import {
  buatCheckpoint,
  keteranganCheckpoint,
  tahapSetelahMasuk,
  terapkanCheckpoint,
  type Checkpoint,
} from '@/features/scenario/checkpoint'

type Tahap = 'luar' | 'kamera' | 'belajar' | 'ujian' | 'resep'

export function PuskesmasFlow() {
  const scenarioId = 'puskesmas'
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]

  const [tahap, setTahap] = useState<Tahap>('luar')
  const [membuka, setMembuka] = useState(false)
  const [tirai, setTirai] = useState(false)
  const [learnView, setLearnView] = useState<'demo' | 'praktik'>('demo')
  const [tick, forceUpdate] = useReducer((tick: number) => tick + 1, 0)
  const [cpDicek, setCpDicek] = useState(false)
  const [lanjutan, setLanjutan] = useState<{
    tahap: 'belajar' | 'ujian'
    keterangan: string
    elapsedMs: number
  } | null>(null)
  const startedAtRef = useRef<number>(Date.now())
  const endedAtRef = useRef<number>(Date.now())
  const pintuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const learningRef = useRef<LearningPhase | null>(null)
  const engineRef = useRef<ScenarioEngine | null>(null)
  const compiledCache = useRef(new Map<string, CompiledSign | null>())

  const learning = useMemo(() => {
    if (!scenario) return null
    learningRef.current = createLearningPhase(scenario)
    return learningRef.current
  }, [scenario])

  const engine = useMemo(() => {
    if (!scenario) return null
    engineRef.current = createScenarioEngine(scenario, direction)
    return engineRef.current
  }, [scenario, direction])

  useEffect(
    () => () => {
      if (pintuTimer.current) clearTimeout(pintuTimer.current)
    },
    [],
  )

  type EkstraCp = Record<string, never>

  useEffect(() => {
    if (!learning || !engine || cpDicek) return
    let batal = false
    void bacaCheckpoint<Checkpoint<EkstraCp>>(scenarioId, direction).then((cp) => {
      if (batal) return
      if (cp && (cp.state.tahap === 'belajar' || cp.state.tahap === 'ujian')) {
        terapkanCheckpoint(cp.state, learning, engine)
        setLearnView(cp.state.learnView)
        setLanjutan({
          tahap: cp.state.tahap,
          keterangan: keteranganCheckpoint(cp.state, learning, engine),
          elapsedMs: cp.state.elapsedMs ?? 0,
        })
        forceUpdate()
      }
      setCpDicek(true)
    })
    return () => {
      batal = true
    }
  }, [learning, engine, direction, cpDicek])

  useEffect(() => {
    if (!cpDicek || !learning || !engine) return
    if (tahap !== 'belajar' && tahap !== 'ujian') return
    void tulisCheckpoint(
      scenarioId,
      direction,
      buatCheckpoint<EkstraCp>(
        tahap,
        learnView,
        learning,
        engine,
        {},
        Date.now() - startedAtRef.current,
      ),
    )
  }, [cpDicek, tahap, learnView, tick, learning, engine, direction])

  const getCompiled = useCallback(
    (signId: string): CompiledSign | null => {
      if (!content) return null
      if (compiledCache.current.has(signId)) return compiledCache.current.get(signId) ?? null
      const sign = content.signs[signId]
      let compiled: CompiledSign | null = null
      if (sign) {
        try {
          compiled = compileSign(sign, content.handshapes, SEED_SAN_RIG)
        } catch {
          compiled = null
        }
      }
      compiledCache.current.set(signId, compiled)
      return compiled
    },
    [content],
  )

  if (contentError) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p role="alert">{contentError}</p>
        <p className="mt-4">
          <Link href="/skenario" className="underline underline-offset-4">
            Kembali ke daftar skenario
          </Link>
        </p>
      </main>
    )
  }

  if (!content || !scenario || !learning || !engine || !cpDicek) {
    return (
      <main className="pk-langit-pagi flex min-h-dvh items-center justify-center px-6">
        <p aria-live="polite" className="text-lg font-bold text-[#1d442f]">
          {content && !scenario ? 'Skenario tidak ditemukan.' : 'Menyiapkan puskesmas…'}
        </p>
      </main>
    )
  }

  const currentSignId = learning.next()
  const directionLabel = direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja layanan'

  const masukPuskesmas = () => {
    if (membuka) return
    setMembuka(true)
    startedAtRef.current = Date.now() - (lanjutan?.elapsedMs ?? 0)
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pintuTimer.current = setTimeout(
      () => setTahap(tahapSetelahMasuk(direction, lanjutan !== null)),
      cepat ? 120 : 1250,
    )
  }

  const persistSign = (signId: string) => {
    const progress = learning.progressFor(signId)
    if (!progress) return
    void saveSignProgress({
      signId,
      direction,
      status: progress.status === 'belum' ? 'berlatih' : progress.status,
      attempts: progress.attempts,
    })
  }

  const finishExam = () => {
    void hapusCheckpoint(scenarioId, direction)
    endedAtRef.current = Date.now()
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    void saveRun({
      scenarioId: scenario.id,
      direction,
      durationMs: summary.durationMs,
      mastered: summary.mastered,
      needsRepeat: summary.needsRepeat,
      completedAt: Date.now(),
    })
    setTirai(true)

    setTahap('resep')
  }

  const majuSetelah = (moved: string) => {
    if (moved === 'selesai') finishExam()
    forceUpdate()
  }

  const node = engine.current()
  const task = engine.currentTask()

  const kepala = (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-[#1d442f] sm:px-6">
      <KeluarAdegan tanya={tahap === 'belajar' || tahap === 'ujian'} />
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
        <p className="text-sm font-bold sm:text-base">
          <span className="font-display">Puskesmas</span>
          <span className="text-[#4f8a68]"> · {directionLabel}</span>
        </p>
        <SyncBadge />
      </div>
    </header>
  )

  if (tahap === 'kamera') {
    return (
      <main className="pk-dinding flex min-h-dvh flex-col">
        {kepala}
        <IzinKamera
          tanpaKamera={direction === 'service'}
          aksen="#2f7d52"
          lanjutan={lanjutan?.keterangan}
          onLanjut={() => setTahap(lanjutan?.tahap ?? 'belajar')}
          onMulaiUlang={
            lanjutan
              ? () => {
                  engine.reset()
                  learning.restore(createLearningPhase(scenario).snapshot())

                  startedAtRef.current = Date.now()
                  setLearnView('demo')
                  setLanjutan(null)
                  void hapusCheckpoint(scenarioId, direction)
                  setTahap('belajar')
                  forceUpdate()
                }
              : undefined
          }
        />
      </main>
    )
  }

  if (tahap === 'luar') {
    return (
      <main className="pk-langit-pagi flex min-h-dvh flex-col">
        {kepala}
        <SceneLuarPuskesmas membuka={membuka} onMasuk={masukPuskesmas} papanInfo={null} />
      </main>
    )
  }

  if (tahap === 'resep') {
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    const minutes = Math.max(1, Math.round(summary.durationMs / 60000))
    const selfAssessed = learning
      .progress()
      .filter((item) => item.status === 'dinilai-sendiri')
      .map((item) => item.sign)
    const perluDiulang = [...new Set([...summary.needsRepeat, ...selfAssessed])]
    const dikuasai = summary.mastered.filter((sign) => !perluDiulang.includes(sign))
    return (
      <main className="pk-dinding flex min-h-dvh flex-col">
        {kepala}
        {tirai ? (
          <TiraiSelesai
            judul="Kunjunganmu tuntas!"
            pesan="Kamu menyelesaikan satu kunjungan berobat dari awal sampai resep."
            dikuasai={dikuasai.length}
            menit={Math.max(1, Math.round(summary.durationMs / 60000))}
            onSelesai={() => setTirai(false)}
            aksen="#5fc08a"
          />
        ) : null}
        <SceneResepPuskesmas
          dikuasai={dikuasai}
          perluDiulang={perluDiulang}
          menit={minutes}
          langkah={summary.path.length}
          onUlangi={() => {
            engine.reset()
            learning.restore(createLearningPhase(scenario).snapshot())
            void hapusCheckpoint(scenarioId, direction)
            setLanjutan(null)
            startedAtRef.current = Date.now()
            setMembuka(false)
            setTirai(false)
            setLearnView('demo')
            setTahap('luar')
            forceUpdate()
          }}
        />
      </main>
    )
  }

  return (
    <main className="pk-dinding flex min-h-dvh flex-col">
      {kepala}

      {tahap === 'belajar' ? (
        <SceneBelajarPuskesmas
          isyaratAktif={currentSignId}
          urutan={learning.order()}
          sign={currentSignId ? content.signs[currentSignId] : undefined}
          compiled={currentSignId ? getCompiled(currentSignId) : null}
          tampilan={learnView}
          direction={direction}
          percobaan={currentSignId ? (learning.progressFor(currentSignId)?.attempts ?? 0) : 0}
          gagalBeruntun={
            currentSignId ? (learning.progressFor(currentSignId)?.consecutiveFailures ?? 0) : 0
          }
          arahLabel={directionLabel}
          onTampilan={setLearnView}
          onLulus={() => {
            if (!currentSignId) return
            learning.recordResult(currentSignId, true)
            persistSign(currentSignId)
            setLearnView('demo')
            forceUpdate()
          }}
          onGagal={() => {
            if (!currentSignId) return
            learning.recordResult(currentSignId, false)
            persistSign(currentSignId)
            forceUpdate()
          }}
          onNilaiSendiri={() => {
            if (!currentSignId) return
            learning.selfAssessPass(currentSignId)
            persistSign(currentSignId)
            setLearnView('demo')
            forceUpdate()
          }}
          onLewati={() => {
            if (!currentSignId) return
            learning.selfAssessPass(currentSignId)
            persistSign(currentSignId)
            forceUpdate()
          }}
          onMulaiUjian={() => setTahap('ujian')}
        />
      ) : null}

      {tahap === 'ujian' && node ? (
        <SceneUjianPuskesmas
          node={node}
          task={task}
          engine={engine}
          getCompiled={getCompiled}
          onMaju={majuSetelah}
        />
      ) : null}

      {tahap === 'ujian' && !node ? (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <button type="button" onClick={finishExam} className="tombol-cta">
            <FileText aria-hidden className="mr-2 inline h-5 w-5" />
            Ambil resep
          </button>
        </div>
      ) : null}
    </main>
  )
}
