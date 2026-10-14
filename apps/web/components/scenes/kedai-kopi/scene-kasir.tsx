'use client'

import {
  BellRing,
  Candy,
  CheckCircle2,
  Coffee,
  Flame,
  Hand,
  Pointer,
  QrCode,
  ReceiptText,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { ScenarioNode } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { useJawab } from '@/components/umpan-jawab'
import type { Direction, ScenarioEngine } from '@/features/scenario/engine'
import { PanggungBarista } from './barista'
import { BayarQris, LayarKasir, PilihanMenu } from './scene-menu'
import { MENU_UTAMA, prettify, simpulUtama, type MenuKedai, type PoseBarista } from './types'

const LANGKAH = [
  { id: 'sapa', label: 'Sapa', Icon: Hand },
  { id: 'pesan', label: 'Pesan', Icon: Coffee },
  { id: 'suhu', label: 'Suhu', Icon: Flame },
  { id: 'rasa', label: 'Rasa', Icon: Candy },
  { id: 'harga', label: 'Harga', Icon: ReceiptText },
  { id: 'bayar', label: 'Bayar', Icon: QrCode },
  { id: 'ambil', label: 'Ambil', Icon: BellRing },
  { id: 'tutup', label: 'Selesai', Icon: Sparkles },
]

export const POSE_SIMPUL: Record<string, PoseBarista> = {
  sapa: 'lambai',
  pesan: 'tunjuk',
  suhu: 'netral',
  rasa: 'netral',
  harga: 'tunjuk',
  bayar: 'tunjuk',
  ambil: 'sajikan',
  tutup: 'sajikan',
}

function LangkahPercakapan({ aktifIndex }: { aktifIndex: number }) {
  return (
    <nav
      aria-label="Langkah percakapan"
      className="kk-kertas mx-auto w-full max-w-3xl rounded-full px-4 py-2 shadow-lg"
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
                      ? 'border-sorot text-aksen bg-[#fff3d6] shadow-[0_0_0_4px_rgba(217,165,33,0.25)]'
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

function GelembungBarista({ node }: { node: ScenarioNode }) {
  return (
    <div key={node.id} className="kk-muncul relative">
      <div className="kk-kertas rounded-kartu relative rounded-tl-sm p-4 shadow-xl sm:p-5">
        <div
          aria-hidden
          className="absolute -left-2.5 top-5 hidden h-5 w-5 rotate-45 bg-[#f8efdf] lg:block"
        />
        <p className="text-aksen flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
          <Coffee aria-hidden className="h-3.5 w-3.5" />
          Barista · Kopi Lakon
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

function PesananPelanggan({
  prompt,
  options,
  onSelesai,
}: {
  prompt: string
  options: string[]
  onSelesai: (entri: MenuKedai | undefined) => void
}) {
  const [pilihan] = useState(() => Math.floor(Math.random() * options.length))
  const [ditunjuk, setDitunjuk] = useState<number | undefined>(undefined)
  const entri = MENU_UTAMA.find((menu) => menu.opsi === options[pilihan])

  useEffect(() => {
    const cepat = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tunjuk = setTimeout(() => setDitunjuk(pilihan), cepat ? 200 : 1200)
    return () => clearTimeout(tunjuk)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <PilihanMenu
        prompt={
          ditunjuk === undefined ? prompt : `Pelanggan menunjuk ${entri?.nama ?? options[pilihan]}.`
        }
        options={options}
        ditunjuk={ditunjuk ?? -1}
        onPilih={() => {}}
      />
      {ditunjuk === undefined ? null : (
        <button
          type="button"
          autoFocus
          onClick={() => onSelesai(entri)}
          className="tombol-cta self-start"
        >
          Lanjut
        </button>
      )}
    </div>
  )
}

function TugasKedai({
  node,
  task,
  engine,
  direction,
  pesanan,
  getCompiled,
  onMaju,
  jawab,
  onPesan,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  direction: Direction
  pesanan: MenuKedai | null
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  jawab: (benar: boolean, jawaban: string) => void
  onPesan: (entri: MenuKedai) => void
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
    if (idUtama === 'pesan' && direction === 'service') {
      return (
        <PesananPelanggan
          prompt={task.prompt}
          options={task.options}
          onSelesai={(entri) => {
            if (entri) onPesan(entri)
            onMaju(engine.continueNode())
          }}
        />
      )
    }

    if (idUtama === 'pesan') {
      return (
        <PilihanMenu
          prompt={task.prompt}
          options={task.options}
          catatan={`Pesananmu hari ini: ${
            MENU_UTAMA.find((menu) => menu.opsi === task.options[task.correct])?.nama ??
            task.options[task.correct]
          }`}
          onPilih={(index, entri) => {
            const benar = index === task.correct
            if (benar && entri) onPesan(entri)
            jawab(benar, task.options[task.correct]!)
          }}
        />
      )
    }

    if (idUtama === 'harga') {
      return (
        <LayarKasir
          prompt={task.prompt}
          options={task.options}
          pesanan={pesanan}
          onPilih={(index) => jawab(index === task.correct, task.options[task.correct]!)}
        />
      )
    }

    if (idUtama === 'bayar') {
      return (
        <BayarQris
          prompt={task.prompt}
          options={task.options}
          onPilih={(index) => jawab(index === task.correct, task.options[task.correct]!)}
        />
      )
    }

    return (
      <div className="kk-muncul kk-kertas rounded-kartu p-4 shadow-xl">
        <p className="mb-3 font-bold">{task.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {task.options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => jawab(index === task.correct, task.options[task.correct]!)}
              className="kk-kartu-menu tombol-sekunder bg-kartu text-left"
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
        <div className="kk-muncul kk-kertas rounded-kartu p-4 shadow-xl">
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
      <div className="kk-muncul kk-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
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
    <div className="kk-muncul kk-kertas rounded-kartu-besar p-4 shadow-xl sm:p-5">
      <p className="mb-3 font-bold">Pelanggan berisyarat. Apa maknanya?</p>
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
            className="kk-kartu-menu tombol-sekunder bg-kartu text-left capitalize"
          >
            {prettify(option)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SceneKasir({
  node,
  task,
  engine,
  direction,
  pesanan,
  getCompiled,
  onMaju,
  onPesan,
}: {
  node: ScenarioNode
  task: ReturnType<ScenarioEngine['currentTask']>
  engine: ScenarioEngine
  direction: Direction
  pesanan: MenuKedai | null
  getCompiled: (signId: string) => CompiledSign | null
  onMaju: (moved: string) => void
  onPesan: (entri: MenuKedai) => void
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
        <PanggungBarista
          pose={pose}
          className="rounded-kartu-besar h-64 border-4 border-[#2b1a0e]/40 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] sm:h-80 lg:h-auto lg:min-h-[27rem]"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <GelembungBarista node={node} />
          <TugasKedai
            key={`${node.id}-tugas`}
            node={node}
            task={task}
            engine={engine}
            direction={direction}
            pesanan={pesanan}
            getCompiled={getCompiled}
            onMaju={onMaju}
            onPesan={onPesan}
            jawab={jawab}
          />
        </div>
      </div>
    </div>
  )
}
