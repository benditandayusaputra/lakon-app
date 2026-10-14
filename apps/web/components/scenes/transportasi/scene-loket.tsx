'use client'

import {
  CheckCircle2,
  CreditCard,
  Hand,
  Map,
  MapPin,
  MessageCircleQuestion,
  Pointer,
  ReceiptText,
  Sparkles,
  Ticket,
} from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { ScenarioNode } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { useJawab } from '@/components/umpan-jawab'
import type { ScenarioEngine } from '@/features/scenario/engine'
import { PanggungLoket } from './petugas'
import { BayarTap, LayarLoketHarga, PilihJumlah, PilihTujuan, PilihTurun } from './scene-tugas'
import { prettify, simpulUtama, type PosePetugas } from './types'

const LANGKAH = [
  { id: 'sapa', label: 'Sapa', Icon: Hand },
  { id: 'rute', label: 'Rute', Icon: Map },
  { id: 'ulang', label: 'Ulang', Icon: MessageCircleQuestion },
  { id: 'tiket', label: 'Tiket', Icon: Ticket },
  { id: 'harga', label: 'Harga', Icon: ReceiptText },
  { id: 'bayar', label: 'Bayar', Icon: CreditCard },
  { id: 'turun', label: 'Turun', Icon: MapPin },
  { id: 'tutup', label: 'Selesai', Icon: Sparkles },
]

export const POSE_SIMPUL: Record<string, PosePetugas> = {
  sapa: 'lambai',
  rute: 'tunjuk',
  ulang: 'netral',
  tiket: 'netral',
  harga: 'tunjuk',
  bayar: 'tunjuk',
  turun: 'tunjuk',
  tutup: 'serahkan',
}

function LangkahPercakapan({ aktifIndex }: { aktifIndex: number }) {
  return (
    <nav
      aria-label="Langkah percakapan"
      className="tp-kertas mx-auto w-full max-w-3xl rounded-full px-4 py-2 shadow-lg"
    >
      <ol className="flex items-center justify-between gap-1">
        {LANGKAH.map(({ id, label, Icon }, index) => {
          const status = index < aktifIndex ? 'lewat' : index === aktifIndex ? 'aktif' : 'nanti'
          return (
            <li key={id} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none">
              <span
                aria-current={status === 'aktif' ? 'step' : undefined}
                title={label}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                  status === 'lewat'
                    ? 'border-[#33608c] bg-[#33608c] text-[#eef5fb]'
                    : status === 'aktif'
                      ? 'border-[#33608c] bg-[#e4edf5] text-[#1c3a55] shadow-[0_0_0_4px_rgba(51,96,140,0.3)]'
                      : 'border-[#8fb4d8] bg-white/70 text-[#8fb4d8]'
                }`}
              >
                {status === 'lewat' ? (
                  <CheckCircle2 aria-hidden className="h-4 w-4" />
                ) : (
                  <Icon aria-hidden className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {label}
                  {status === 'aktif' ? ' (sekarang)' : status === 'lewat' ? ' (selesai)' : ''}
                </span>
              </span>
              {index < LANGKAH.length - 1 ? (
                <span
                  aria-hidden
                  className={`hidden h-1 flex-1 rounded-full sm:block ${
                    index < aktifIndex ? 'bg-[#33608c]' : 'bg-[#8fb4d8]/60'
                  }`}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function GelembungPetugas({ node }: { node: ScenarioNode }) {
  return (
    <div key={node.id} className="kk-muncul relative">
      <div className="tp-kertas rounded-kartu relative rounded-tl-sm p-4 shadow-xl sm:p-5">
        <div
          aria-hidden
          className="absolute -left-2.5 top-5 hidden h-5 w-5 rotate-45 bg-[#fdfefe] lg:block"
        />
        <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#26496b]">
          <Ticket aria-hidden className="h-3.5 w-3.5" />
          Petugas loket · Halte Lakon
        </p>
        <p
          aria-live="polite"
          className="font-display mt-1.5 text-xl font-bold leading-snug sm:text-2xl"
        >
          “{node.line.id}”
        </p>
      </div>
    </div>
  )
}

function TugasLoket({
  node,
  task,
  engine,
  getCompiled,
  onMaju,
  jawab,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  jawab: (benar: boolean, jawaban: string) => void
}) {
  const idUtama = simpulUtama(node.id)

  if (task === null) {
    return (
      <button
        type="button"
        onClick={() => onMaju(engine.continueNode())}
        className="tombol-cta self-start"
      >
        Lanjut
      </button>
    )
  }

  if (task.type === 'point') {
    const pilih = (index: number) => jawab(index === task.correct, task.options[task.correct]!)

    if (idUtama === 'rute') {
      return <PilihTujuan prompt={task.prompt} options={task.options} onPilih={pilih} />
    }
    if (idUtama === 'tiket') {
      return <PilihJumlah prompt={task.prompt} options={task.options} onPilih={pilih} />
    }
    if (idUtama === 'harga') {
      return <LayarLoketHarga prompt={task.prompt} options={task.options} onPilih={pilih} />
    }
    if (idUtama === 'bayar') {
      return <BayarTap prompt={task.prompt} options={task.options} onPilih={pilih} />
    }
    if (idUtama === 'turun') {
      return <PilihTurun prompt={task.prompt} options={task.options} onPilih={pilih} />
    }

    return (
      <div className="kk-muncul tp-kertas rounded-kartu p-4 shadow-xl">
        <p className="mb-3 font-bold">{task.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {task.options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => pilih(index)}
              className="kk-kartu-menu tombol-sekunder bg-white/80 text-left"
            >
              <Pointer
                aria-hidden
                className="mr-2 inline-block h-[1em] w-[1em] align-text-bottom"
              />
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (task.type === 'produce') {
    const compiled = getCompiled(task.sign)
    if (!compiled) {
      return (
        <div className="kk-muncul tp-kertas rounded-kartu p-4 shadow-xl">
          <p>
            Balas dengan isyarat <span className="font-bold">{prettify(task.sign)}</span>. Peragaan
            belum tersedia, nilai sendiri lalu lanjut.
          </p>
          <button
            type="button"
            onClick={() => onMaju(engine.answer('benar'))}
            className="tombol-utama mt-3"
          >
            Sudah kuperagakan, lanjut
          </button>
        </div>
      )
    }
    return (
      <div className="kk-muncul tp-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
        <p className="mb-3 font-bold">
          Balas dengan isyarat: <span className="capitalize">{prettify(task.sign)}</span>
          {engine.attemptsAtCurrent() > 0 ? `, percobaan gagal: ${engine.attemptsAtCurrent()}` : ''}
        </p>
        <PracticeBlock
          compiled={compiled}
          signLabel={prettify(task.sign)}
          onPassed={() => onMaju(engine.answer('benar'))}
          onFailedAttempt={() => onMaju(engine.answer('salah'))}
          onSelfAssessed={() => onMaju(engine.skip())}
        />
      </div>
    )
  }

  const compiled = getCompiled(task.sign)
  return (
    <div className="kk-muncul tp-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
      <p className="mb-3 font-bold">Penumpang berisyarat. Apa maknanya?</p>
      {compiled ? (
        <div className="bg-zona-tenang zona-tenang-gradasi rounded-kartu relative mb-4 aspect-video w-full max-w-xl overflow-hidden">
          <AvatarStage compiled={compiled} className="absolute inset-0" />
        </div>
      ) : (
        <p className="text-teks-sekunder mb-4 text-sm">
          (Peragaan isyarat ini belum tersedia. Pilih makna berdasarkan konteks percakapan.)
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {task.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => jawab(option === task.sign, prettify(task.sign))}
            className="kk-kartu-menu tombol-sekunder bg-white/80 text-left capitalize"
          >
            {prettify(option)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SceneLoket({
  node,
  task,
  engine,
  getCompiled,
  onMaju,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
}) {
  const { jawab, umpan } = useJawab(engine, onMaju)
  const idUtama = simpulUtama(node.id)
  const pose = POSE_SIMPUL[idUtama] ?? 'netral'
  const langkahIndex = LANGKAH.findIndex((langkah) => langkah.id === idUtama)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-12 pt-1 sm:px-6">
      {umpan}
      <LangkahPercakapan aktifIndex={langkahIndex} />

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-stretch">
        <PanggungLoket
          pose={pose}
          className="rounded-kartu-besar h-64 border-4 border-[#1c3a55]/40 shadow-[0_24px_50px_-20px_rgba(28,58,85,0.55)] sm:h-80 lg:h-auto lg:min-h-[27rem]"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <GelembungPetugas node={node} />
          <TugasLoket
            key={`${node.id}-tugas`}
            node={node}
            task={task}
            engine={engine}
            getCompiled={getCompiled}
            onMaju={onMaju}
            jawab={jawab}
          />
        </div>
      </div>
    </div>
  )
}
