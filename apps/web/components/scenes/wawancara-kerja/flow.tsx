'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BadgeCheck } from 'lucide-react'
import { compileSign, type CompiledSign } from '@lakon/sign-compiler'
import type { Scenario } from '@lakon/sign-schema'
import { IzinKamera } from '@/components/scenes/izin-kamera'
import { KeluarAdegan } from '@/components/scenes/keluar-adegan'
import { TiraiSelesai } from '@/components/scenes/tirai-selesai'
import { SyncBadge } from '@/components/sync-badge'
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
import { LampuGantung, TanamanGantung } from './props'
import { SceneBelajar } from './scene-belajar'
import { SceneHasil } from './scene-hasil'
import { SceneLuar } from './scene-luar'
import { SceneWawancara } from './scene-wawancara'
import { type MenuTes, type TahapWawancara } from './types'
import './wawancara-kerja.css'

function HiasanAtas() {
  return (
    <div aria-hidden className="pointer-events-none relative h-12 w-full overflow-hidden sm:h-14">
      <div className="wk-kayu absolute inset-x-0 top-0 h-2 shadow-md" />
      <LampuGantung className="absolute left-[8%] top-1 w-9 sm:w-11" />
      <LampuGantung className="absolute left-[50%] top-1 w-8 -translate-x-1/2 sm:w-10" />
      <TanamanGantung className="absolute right-[6%] top-1 w-8 sm:w-10" />
    </div>
  )
}

export function WawancaraKerjaFlow() {
  const scenarioId = 'wawancara-kerja'
  const searchParams = useSearchParams()
  const direction: Direction = searchParams.get('arah') === 'service' ? 'service' : 'deaf'

  const { content, error: contentError } = useContent()
  const scenario: Scenario | undefined = content?.scenarios[scenarioId]

  const [tahap, setTahap] = useState<TahapWawancara>('luar')
  const [membuka, setMembuka] = useState(false)
  const [tirai, setTirai] = useState(false)
  const [learnView, setLearnView] = useState<'demo' | 'praktik'>('demo')
  const [pilihanMenu, setPilihanMenu] = useState<MenuTes | null>(null)
  const [namaPelamar, setNamaPelamar] = useState('Pelamar Lakon')
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

  type EkstraCp = { pilihanMenu: MenuTes | null; namaPelamar: string }

  useEffect(() => {
    if (!learning || !engine || cpDicek) return
    let batal = false
    void bacaCheckpoint<Checkpoint<EkstraCp>>(scenarioId, direction).then((cp) => {
      if (batal) return
      if (cp && (cp.state.tahap === 'belajar' || cp.state.tahap === 'ujian')) {
        terapkanCheckpoint(cp.state, learning, engine)
        setLearnView(cp.state.learnView)
        setPilihanMenu(cp.state.ekstra.pilihanMenu ?? null)
        setNamaPelamar(cp.state.ekstra.namaPelamar ?? 'Pelamar Lakon')
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
        { pilihanMenu, namaPelamar },
        Date.now() - startedAtRef.current,
      ),
    )
  }, [cpDicek, tahap, learnView, tick, learning, engine, direction, pilihanMenu, namaPelamar])

  useEffect(() => {
    let aktif = true
    void fetch('/api/auth/saya')
      .then((response) => response.json())
      .then((data: { user: { displayName: string } | null }) => {
        if (aktif && data.user?.displayName) setNamaPelamar(data.user.displayName)
      })
      .catch(() => {})
    return () => {
      aktif = false
    }
  }, [])

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
      <main className="wk-langit flex min-h-dvh items-center justify-center px-6">
        <p aria-live="polite" className="text-lg font-bold text-[#3b2a1a]">
          {content && !scenario ? 'Skenario tidak ditemukan.' : 'Menyiapkan kedai…'}
        </p>
      </main>
    )
  }

  const currentSignId = learning.next()
  const directionLabel = direction === 'deaf' ? 'sisi Tuli' : 'sisi pekerja layanan'

  const masukKedai = () => {
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

    setTahap('hasil')
  }

  const majuSetelah = (moved: string) => {
    if (moved === 'selesai') finishExam()
    forceUpdate()
  }

  const node = engine.current()
  const task = engine.currentTask()

  const kepala = (
    <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-[#3b2a1a] sm:px-6">
      <KeluarAdegan tanya={tahap === 'belajar' || tahap === 'ujian'} />
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
        <p className="text-sm font-bold sm:text-base">
          <span className="font-display">Wawancara Kerja</span>
          <span className="text-[#8a6a45]"> · {directionLabel}</span>
        </p>
        <SyncBadge />
      </div>
    </header>
  )

  if (tahap === 'kamera') {
    return (
      <main className="wk-interior flex min-h-dvh flex-col">
        {kepala}
        <IzinKamera
          tanpaKamera={direction === 'service'}
          aksen="#d9a521"
          lanjutan={lanjutan?.keterangan}
          onLanjut={() => setTahap(lanjutan?.tahap ?? 'belajar')}
          onMulaiUlang={
            lanjutan
              ? () => {
                  engine.reset()
                  learning.restore(createLearningPhase(scenario).snapshot())
                  setPilihanMenu(null)
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
      <main className="wk-langit flex min-h-dvh flex-col">
        {kepala}
        <SceneLuar membuka={membuka} onMasuk={masukKedai} papanInfo={null} tombol={null} />
      </main>
    )
  }

  if (tahap === 'hasil') {
    const summary = summarizeRun(engine, startedAtRef.current, endedAtRef.current)
    const selfAssessed = learning
      .progress()
      .filter((item) => item.status === 'dinilai-sendiri')
      .map((item) => item.sign)
    const perluUlang = [...new Set([...summary.needsRepeat, ...selfAssessed])]
    const dikuasai = summary.mastered.filter((sign) => !perluUlang.includes(sign))
    return (
      <main className="wk-interior flex min-h-dvh flex-col">
        {kepala}
        {tirai ? (
          <TiraiSelesai
            judul="Wawancaramu selesai!"
            pesan="Kamu menjalani satu wawancara kerja penuh tanpa juru bahasa."
            dikuasai={dikuasai.length}
            menit={Math.max(1, Math.round(summary.durationMs / 60000))}
            onSelesai={() => setTirai(false)}
            aksen="#e0b98a"
          />
        ) : null}
        <HiasanAtas />
        <SceneHasil
          nama={namaPelamar}
          pilihanMenu={pilihanMenu}
          dikuasai={dikuasai}
          perluUlang={perluUlang}
          menit={Math.max(1, Math.round(summary.durationMs / 60000))}
          jumlahLangkah={summary.path.length}
          onUlangi={() => {
            engine.reset()
            learning.restore(createLearningPhase(scenario).snapshot())
            void hapusCheckpoint(scenarioId, direction)
            setLanjutan(null)
            startedAtRef.current = Date.now()
            setPilihanMenu(null)
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
    <main className="wk-interior flex min-h-dvh flex-col">
      {kepala}
      <HiasanAtas />

      {tahap === 'belajar' ? (
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pb-12 pt-2 sm:px-6">
          <SceneBelajar
            learning={learning}
            currentSignId={currentSignId}
            sign={currentSignId ? content.signs[currentSignId] : undefined}
            compiled={currentSignId ? getCompiled(currentSignId) : null}
            learnView={learnView}
            direction={direction}
            directionLabel={directionLabel}
            onGantiView={setLearnView}
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
        </div>
      ) : null}

      {tahap === 'ujian' && node ? (
        <SceneWawancara
          node={node}
          task={task}
          engine={engine}
          getCompiled={getCompiled}
          onMaju={majuSetelah}
          onPilihMenu={setPilihanMenu}
        />
      ) : null}

      {tahap === 'ujian' && !node ? (
        <div className="mx-auto max-w-2xl px-6 py-10">
          <button type="button" onClick={finishExam} className="tombol-cta">
            <BadgeCheck aria-hidden className="h-5 w-5" />
            Lihat hasil wawancara
          </button>
        </div>
      ) : null}
    </main>
  )
}
