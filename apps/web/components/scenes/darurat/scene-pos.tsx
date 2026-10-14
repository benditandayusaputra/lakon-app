'use client'

import {
  Bandage,
  CheckCircle2,
  ClipboardList,
  Hand,
  HeartPulse,
  MapPinned,
  PhoneCall,
  Pointer,
  Siren,
  Sparkles,
} from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { ScenarioNode } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { useJawab } from '@/components/umpan-jawab'
import type { ScenarioEngine } from '@/features/scenario/engine'
import { KartuPanggilan, PilihKejadian, PilihLokasi, PilihNomor } from './scene-tugas'
import { NOMOR_DARURAT, prettify, simpulUtama, type Laporan, type PoseWarga } from './types'
import { PanggungWarga } from './warga'

const LANGKAH = [
  { id: 'panggil', label: 'Panggil', Icon: Hand },
  { id: 'kejadian', label: 'Kejadian', Icon: ClipboardList },
  { id: 'luka', label: 'Luka', Icon: HeartPulse },
  { id: 'bagian', label: 'Bagian', Icon: Bandage },
  { id: 'lokasi', label: 'Lokasi', Icon: MapPinned },
  { id: 'pihak', label: 'Hubungi', Icon: Siren },
  { id: 'telepon', label: 'Telepon', Icon: PhoneCall },
  { id: 'tutup', label: 'Selesai', Icon: Sparkles },
]

export const POSE_SIMPUL: Record<string, PoseWarga> = {
  panggil: 'lambai',
  kejadian: 'tunjuk',
  luka: 'netral',
  bagian: 'netral',
  lokasi: 'tunjuk',
  pihak: 'tunjuk',
  telepon: 'telepon',
  tutup: 'tenang',
}

function LangkahPercakapan({ aktifIndex }: { aktifIndex: number }) {
  return (
    <nav
      aria-label="Langkah percakapan"
      className="dr-kertas mx-auto w-full max-w-3xl rounded-full px-3 py-2 shadow-lg sm:px-4"
    >
      <ol className="flex items-center justify-between gap-1">
        {LANGKAH.map(({ id, label, Icon }, index) => {
          const status = index < aktifIndex ? 'lewat' : index === aktifIndex ? 'aktif' : 'nanti'
          return (
            <li key={id} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none">
              <span
                aria-current={status === 'aktif' ? 'step' : undefined}
                title={label}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 sm:h-8 sm:w-8 ${
                  status === 'lewat'
                    ? 'border-[#33465a] bg-[#33465a] text-white'
                    : status === 'aktif'
                      ? 'border-[#5b7285] bg-[#e9eef2] text-[#2c3a47] shadow-[0_0_0_4px_rgba(91,114,133,0.3)]'
                      : 'border-[#8fa3b5] bg-white/70 text-[#8fa3b5]'
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
                    index < aktifIndex ? 'bg-[#33465a]' : 'bg-[#8fa3b5]/60'
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

function GelembungWarga({ node }: { node: ScenarioNode }) {
  return (
    <div key={node.id} className="kk-muncul relative">
      <div className="dr-kertas rounded-kartu relative rounded-tl-sm p-4 shadow-xl sm:p-5">
        <div
          aria-hidden
          className="absolute -left-2.5 top-5 hidden h-5 w-5 rotate-45 bg-[#fbfcfd] lg:block"
        />
        <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#33465a]">
          <Siren aria-hidden className="h-3.5 w-3.5" />
          Warga jaga · Pos Siaga RW 05
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

function TugasPos({
  node,
  task,
  engine,
  laporan,
  getCompiled,
  onMaju,
  jawab,
  onCatat,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  laporan: Laporan
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  jawab: (benar: boolean, jawaban: string) => void
  onCatat: (bagian: Partial<Laporan>) => void
}) {
  const idUtama = simpulUtama(node.id)

  if (task === null) {
    if (idUtama === 'telepon') {
      const pihak = laporan.pihak ?? NOMOR_DARURAT[0]!
      return (
        <KartuPanggilan
          nomor={pihak.nomor}
          nama={pihak.nama}
          onLanjut={() => onMaju(engine.continueNode())}
        />
      )
    }
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

    if (idUtama === 'kejadian') {
      return (
        <PilihKejadian
          prompt={task.prompt}
          options={task.options}
          onPilih={(index, entri) => {
            if (index === task.correct && entri) onCatat({ kejadian: entri })
            pilih(index)
          }}
        />
      )
    }

    if (idUtama === 'lokasi') {
      return (
        <PilihLokasi
          prompt={task.prompt}
          options={task.options}
          onPilih={(index, entri) => {
            if (index === task.correct && entri) onCatat({ lokasi: entri })
            pilih(index)
          }}
        />
      )
    }

    if (idUtama === 'pihak') {
      return (
        <PilihNomor
          prompt={task.prompt}
          options={task.options}
          onPilih={(index, entri) => {
            if (index === task.correct) onCatat({ pihak: entri ?? NOMOR_DARURAT[0]! })
            pilih(index)
          }}
        />
      )
    }

    return (
      <div className="kk-muncul dr-kertas rounded-kartu p-4 shadow-xl">
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
        <div className="kk-muncul dr-kertas rounded-kartu p-4 shadow-xl">
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
      <div className="kk-muncul dr-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
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
    <div className="kk-muncul dr-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
      <p className="mb-3 font-bold">Warga Tuli berisyarat. Apa maknanya?</p>
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

export function ScenePos({
  node,
  task,
  engine,
  laporan,
  getCompiled,
  onMaju,
  onCatat,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  laporan: Laporan
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  onCatat: (bagian: Partial<Laporan>) => void
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
        <PanggungWarga
          pose={pose}
          className="rounded-kartu-besar h-64 border-4 border-[#33465a]/40 shadow-[0_24px_50px_-20px_rgba(31,45,58,0.6)] sm:h-80 lg:h-auto lg:min-h-[27rem]"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <GelembungWarga node={node} />
          <TugasPos
            key={`${node.id}-tugas`}
            node={node}
            task={task}
            engine={engine}
            laporan={laporan}
            getCompiled={getCompiled}
            onMaju={onMaju}
            onCatat={onCatat}
            jawab={jawab}
          />
        </div>
      </div>
    </div>
  )
}
