'use client'

import {
  CheckCircle2,
  ClipboardList,
  Coffee,
  FileText,
  Flame,
  Hand,
  HeartHandshake,
  Pointer,
  Sparkles,
  Users,
} from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { ScenarioNode } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { useJawab } from '@/components/umpan-jawab'
import type { ScenarioEngine } from '@/features/scenario/engine'
import { PanggungPewawancara } from './pewawancara'
import { PilihanMenu, SerahkanBerkas } from './scene-tugas'
import { prettify, simpulUtama, type MenuTes, type PosePewawancara } from './types'

const LANGKAH = [
  { id: 'sapa', label: 'Sapa', Icon: Hand },
  { id: 'berkas', label: 'Berkas', Icon: FileText },
  { id: 'kopi', label: 'Kopi', Icon: Coffee },
  { id: 'menu', label: 'Tes menu', Icon: ClipboardList },
  { id: 'pelanggan', label: 'Pelanggan', Icon: Users },
  { id: 'panas', label: 'Panas', Icon: Flame },
  { id: 'maaf', label: 'Maaf', Icon: HeartHandshake },
  { id: 'tutup', label: 'Selesai', Icon: Sparkles },
]

export const POSE_SIMPUL: Record<string, PosePewawancara> = {
  sapa: 'lambai',
  berkas: 'catat',
  kopi: 'netral',
  menu: 'tunjuk',
  pelanggan: 'tunjuk',
  panas: 'netral',
  maaf: 'catat',
  tutup: 'sajikan',
}

function LangkahWawancara({ aktifIndex }: { aktifIndex: number }) {
  return (
    <nav
      aria-label="Langkah wawancara"
      className="wk-kertas mx-auto w-full max-w-3xl rounded-full px-4 py-2 shadow-lg"
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
                    ? 'border-[#6b4226] bg-[#6b4226] text-[#f8efdf]'
                    : status === 'aktif'
                      ? 'border-[#8a6a45] bg-[#f4ede2] text-[#453419] shadow-[0_0_0_4px_rgba(138,106,69,0.3)]'
                      : 'text-border-tegas border-[#c9b695] bg-white/60'
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
                    index < aktifIndex ? 'bg-[#6b4226]' : 'bg-[#c9b695]/70'
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

function GelembungPewawancara({ node }: { node: ScenarioNode }) {
  return (
    <div key={node.id} className="wk-muncul relative">
      <div className="wk-kertas rounded-kartu relative rounded-tl-sm p-4 shadow-xl sm:p-5">
        <div
          aria-hidden
          className="absolute -left-2.5 top-5 hidden h-5 w-5 rotate-45 bg-[#fdf9f0] lg:block"
        />
        <p className="text-teks-sekunder flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
          <Coffee aria-hidden className="h-3.5 w-3.5" />
          Kepala barista · Kopi Lakon
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

function TugasWawancara({
  node,
  task,
  engine,
  getCompiled,
  onMaju,
  jawab,
  onPilihMenu,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  jawab: (benar: boolean, jawaban: string) => void
  onPilihMenu: (entri: MenuTes) => void
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

    if (idUtama === 'berkas') {
      return <SerahkanBerkas prompt={task.prompt} options={task.options} onPilih={pilih} />
    }

    if (idUtama === 'menu') {
      return (
        <PilihanMenu
          prompt={task.prompt}
          options={task.options}
          onPilih={(index, entri) => {
            if (index === task.correct && entri) onPilihMenu(entri)
            pilih(index)
          }}
        />
      )
    }

    return (
      <div className="wk-muncul wk-kertas rounded-kartu p-4 shadow-xl">
        <p className="mb-3 font-bold">{task.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {task.options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => pilih(index)}
              className="wk-kartu tombol-sekunder bg-white/80 text-left"
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
        <div className="wk-muncul wk-kertas rounded-kartu p-4 shadow-xl">
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
      <div className="wk-muncul wk-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
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
    <div className="wk-muncul wk-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
      <p className="mb-3 font-bold">Pelamar berisyarat. Apa maknanya?</p>
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
            className="wk-kartu tombol-sekunder bg-white/80 text-left capitalize"
          >
            {prettify(option)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SceneWawancara({
  node,
  task,
  engine,
  getCompiled,
  onMaju,
  onPilihMenu,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  onPilihMenu: (entri: MenuTes) => void
}) {
  const { jawab, umpan } = useJawab(engine, onMaju)
  const idUtama = simpulUtama(node.id)
  const pose = POSE_SIMPUL[idUtama] ?? 'netral'
  const langkahIndex = LANGKAH.findIndex((langkah) => langkah.id === idUtama)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-12 pt-1 sm:px-6">
      {umpan}
      <LangkahWawancara aktifIndex={langkahIndex} />

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-stretch">
        <PanggungPewawancara
          pose={pose}
          cangkir={pose === 'sajikan' || idUtama === 'panas'}
          className="rounded-kartu-besar h-64 border-4 border-[#6b4226]/35 shadow-[0_24px_50px_-20px_rgba(69,52,25,0.5)] sm:h-80 lg:h-auto lg:min-h-[27rem]"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <GelembungPewawancara node={node} />
          <TugasWawancara
            key={`${node.id}-tugas`}
            node={node}
            task={task}
            engine={engine}
            getCompiled={getCompiled}
            onMaju={onMaju}
            onPilihMenu={onPilihMenu}
            jawab={jawab}
          />
        </div>
      </div>
    </div>
  )
}
