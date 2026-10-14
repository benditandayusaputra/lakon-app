'use client'

import {
  CheckCircle2,
  ClipboardList,
  Hand,
  PersonStanding,
  Pill,
  Sparkles,
  Stethoscope,
  Thermometer,
  Users,
} from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { ScenarioNode } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { PracticeBlock } from '@/components/practice-block'
import { useJawab } from '@/components/umpan-jawab'
import type { ScenarioEngine } from '@/features/scenario/engine'
import {
  JamDinding,
  KarakterMedis,
  KursiTunggu,
  LayarAntrean,
  PosterKesehatan,
  type PeranMedis,
  type PoseMedis,
} from '@/components/scenes/puskesmas/karakter'

const prettify = (id: string) => id.replace(/-/g, ' ')

export const LANGKAH_PUSKESMAS = [
  { id: 'sapa', label: 'Sapa', Icon: Hand },
  { id: 'daftar', label: 'Daftar', Icon: ClipboardList },
  { id: 'antre', label: 'Antre', Icon: Users },
  { id: 'keluhan', label: 'Keluhan', Icon: Stethoscope },
  { id: 'bagian', label: 'Bagian', Icon: PersonStanding },
  { id: 'gejala', label: 'Gejala', Icon: Thermometer },
  { id: 'apotek', label: 'Obat', Icon: Pill },
  { id: 'tutup', label: 'Selesai', Icon: Sparkles },
] as const

export const langkahDariSimpul = (idUtama: string): number =>
  Math.max(
    0,
    LANGKAH_PUSKESMAS.findIndex((langkah) => langkah.id === idUtama),
  )

export const PERAN_SIMPUL: Record<string, PeranMedis> = {
  petugas: 'perawat',
  dokter: 'dokter',
  'petugas-apotek': 'apoteker',
}

export const POSE_SIMPUL: Record<string, PoseMedis> = {
  sapa: 'lambai',
  daftar: 'tunjuk',
  antre: 'tunjuk',
  keluhan: 'netral',
  bagian: 'tunjuk',
  gejala: 'periksa',
  apotek: 'tunjuk',
  tutup: 'lambai',
}

const NAMA_AKTOR: Record<string, string> = {
  petugas: 'Perawat · Loket Pendaftaran',
  dokter: 'Dokter · Poli Umum',
  'petugas-apotek': 'Petugas Apotek',
}

export function PanggungMedis({
  peran,
  pose,
  className = '',
}: {
  peran: PeranMedis
  pose: PoseMedis
  className?: string
}) {
  return (
    <div className={`pk-dinding relative overflow-hidden ${className}`}>
      <div aria-hidden className="absolute inset-x-0 bottom-0 top-auto h-[18%] min-h-14">
        <div className="pk-lantai h-full w-full" />
      </div>
      <JamDinding className="absolute left-[6%] top-[4%] w-9 sm:w-11" aria-hidden />
      {peran === 'perawat' ? (
        <>
          <PosterKesehatan
            varian="cuci-tangan"
            className="absolute right-[7%] top-[6%] w-14 rotate-1 sm:w-16"
          />
          <LayarAntrean
            nomor="A-06"
            poli="Poli Umum"
            className="absolute left-[6%] top-[22%] w-32 sm:w-36"
          />
          <KursiTunggu className="absolute bottom-[16%] right-[2%] w-40 opacity-50" aria-hidden />
        </>
      ) : null}
      {peran === 'dokter' ? (
        <>
          <PosterKesehatan
            varian="mata"
            className="absolute left-[6%] top-[26%] w-14 -rotate-1 sm:w-16"
          />
          <svg
            viewBox="0 0 180 120"
            className="absolute bottom-[14%] right-[-4%] w-[52%] max-w-52"
            aria-hidden
          >
            <rect
              x="10"
              y="46"
              width="150"
              height="16"
              rx="6"
              fill="#f2f7f0"
              stroke="#c4dcca"
              strokeWidth="2"
            />
            <rect
              x="18"
              y="34"
              width="42"
              height="16"
              rx="8"
              fill="#ffffff"
              stroke="#c4dcca"
              strokeWidth="2"
            />
            <rect x="10" y="60" width="150" height="10" rx="4" fill="#79b393" />
            <path
              d="M26 70 L26 112 M144 70 L144 112"
              stroke="#8a95a0"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
          <svg viewBox="0 0 60 160" className="absolute right-[2%] top-[4%] h-[46%]" aria-hidden>
            <path
              d="M6 0 L6 160 M6 6 Q30 10 54 6 L54 152 Q30 156 6 152"
              fill="#a8cbb4"
              opacity="0.55"
            />
            <path d="M6 0 L6 160" stroke="#4f8a68" strokeWidth="4" />
          </svg>
        </>
      ) : null}
      {peran === 'apoteker' ? (
        <>
          <svg
            viewBox="0 0 200 150"
            className="absolute left-[5%] top-[6%] w-[52%] max-w-56"
            aria-hidden
          >
            {[0, 1, 2].map((baris) => (
              <g key={baris} transform={`translate(0 ${baris * 48})`}>
                <rect x="0" y="34" width="200" height="6" rx="3" fill="#8a5a33" />
                {[0, 1, 2, 3, 4].map((kolom) => (
                  <rect
                    key={kolom}
                    x={8 + kolom * 39}
                    y={8 + ((kolom + baris) % 3) * 3}
                    width="30"
                    height={26 - ((kolom + baris) % 3) * 3}
                    rx="3"
                    fill={
                      ['#79b393', '#e8b45a', '#8fa9c0', '#e08a6a', '#f2f7f0'][(kolom + baris) % 5]
                    }
                  />
                ))}
              </g>
            ))}
          </svg>
          <p className="absolute right-[6%] top-[6%] rounded-md bg-[#2f7d52] px-2.5 py-1 text-[10px] font-bold tracking-[0.3em] text-white sm:text-xs">
            APOTEK
          </p>
        </>
      ) : null}

      <KarakterMedis
        peran={peran}
        pose={pose}
        className="absolute bottom-8 left-1/2 w-[min(250px,70%)] -translate-x-1/2 sm:bottom-10 sm:w-[min(290px,74%)]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="h-4 w-full rounded-t-sm bg-[#f2f7f0] shadow-[0_-4px_14px_rgba(29,68,47,0.25)] sm:h-5" />
        <div className="relative h-14 w-full bg-[#79b393] sm:h-[4.5rem]">
          <div className="absolute inset-x-0 top-1.5 flex items-center justify-center gap-2">
            <svg viewBox="0 0 40 40" width="12" height="12" aria-hidden>
              <rect x="4" y="15" width="32" height="10" rx="3" fill="#f2f7f0" />
              <rect x="15" y="4" width="10" height="32" rx="3" fill="#f2f7f0" />
            </svg>
            <p className="font-display text-[10px] font-bold tracking-[0.3em] text-[#f2f7f0] sm:text-xs">
              PUSKESMAS HARAPAN SEHAT
            </p>
          </div>
          <div className="absolute inset-x-[6%] bottom-2 h-1.5 rounded-full bg-[#4f8a68]" />
        </div>
      </div>
    </div>
  )
}

function KartuIdentitas({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border-2 border-[#9dbfa9] bg-white p-3 shadow-lg ${className}`}
      aria-hidden
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#2f7d52]">
          <svg viewBox="0 0 40 40" width="14" height="14">
            <rect x="4" y="15" width="32" height="10" rx="3" fill="#ffffff" />
            <rect x="15" y="4" width="10" height="32" rx="3" fill="#ffffff" />
          </svg>
        </span>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1d442f]">
          Kartu Identitas Pasien
        </p>
      </div>
      <div className="mt-2 flex gap-3">
        <div className="h-14 w-12 rounded-sm bg-[#dde6dd]">
          <svg viewBox="0 0 40 46" className="h-full w-full">
            <circle cx="20" cy="16" r="9" fill="#9dbfa9" />
            <path d="M6 44 q2 -16 14 -16 q12 0 14 16 Z" fill="#9dbfa9" />
          </svg>
        </div>
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-2 w-4/5 rounded-sm bg-[#c4dcca]" />
          <div className="h-2 w-3/5 rounded-sm bg-[#dde6dd]" />
          <div className="h-2 w-2/3 rounded-sm bg-[#dde6dd]" />
          <div className="mt-1 h-3 w-1/2 rounded-sm bg-[#79b393]" />
        </div>
      </div>
    </div>
  )
}

function SiluetTubuh({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 150" className={className} aria-hidden>
      <circle cx="45" cy="20" r="14" fill="#9dbfa9" />
      <path
        d="M31 40 Q45 34 59 40 L64 84 L56 84 L58 140 L48 140 L45 100 L42 140 L32 140 L34 84 L26 84 Z"
        fill="#9dbfa9"
      />
      <path d="M31 42 L18 78 L24 82 L34 56 M59 42 L72 78 L66 82 L56 56" fill="#9dbfa9" />
      <circle
        cx="45"
        cy="20"
        r="17"
        fill="none"
        stroke="#d9a521"
        strokeWidth="3"
        strokeDasharray="4 4"
        className="kk-lampu-nyala"
      />
    </svg>
  )
}

function KemasanObat({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border-2 border-[#9dbfa9] bg-white p-3 shadow-lg ${className}`}
      aria-hidden
    >
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 54 70" className="w-14 shrink-0">
          <rect
            x="6"
            y="8"
            width="42"
            height="56"
            rx="5"
            fill="#f2f7f0"
            stroke="#79b393"
            strokeWidth="2.5"
          />
          <rect x="6" y="8" width="42" height="16" rx="5" fill="#2f7d52" />
          <circle cx="19" cy="42" r="5" fill="#e8b45a" />
          <circle cx="34" cy="42" r="5" fill="#e8b45a" />
          <circle cx="26.5" cy="54" r="5" fill="#e8b45a" />
        </svg>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1d442f]">
            Parasetamol 500 mg
          </p>
          <p className="text-peringatan mt-1 rounded-md bg-[#fff3d6] px-2 py-1 font-mono text-sm font-bold">
            3×1 SESUDAH MAKAN
          </p>
          <p className="text-teks-sekunder mt-1 text-[10px]">Habiskan sesuai anjuran</p>
        </div>
      </div>
    </div>
  )
}

export function TugasPuskesmas({
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
  const idUtama = node.id.replace(/^repair-/, '')

  if (task === null) {
    return (
      <button
        type="button"
        onClick={() => onMaju(engine.continueNode())}
        className="tombol-utama self-start"
      >
        Lanjut
      </button>
    )
  }

  if (task.type === 'point') {
    const alat =
      idUtama === 'daftar' ? (
        <KartuIdentitas className="w-56 -rotate-1" />
      ) : idUtama === 'antre' ? (
        <LayarAntrean nomor="A-06" poli="Poli Umum" milik="A-07" className="w-52" />
      ) : idUtama === 'bagian' ? (
        <SiluetTubuh className="bg-kartu h-40 w-24 rounded-xl border-2 border-[#c4dcca] p-2 shadow-lg" />
      ) : idUtama === 'apotek' ? (
        <KemasanObat className="w-64" />
      ) : null

    return (
      <div className="kk-muncul flex flex-col gap-3">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          {alat ? <div className="shrink-0">{alat}</div> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="font-bold text-[#1d442f]">{task.prompt}</p>
            {task.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => jawab(index === task.correct, task.options[task.correct]!)}
                className="kk-kartu-menu rounded-kontrol border-border-halus bg-kartu shadow-kartu min-h-12 border-2 px-4 py-3 text-left font-bold"
              >
                <Hand aria-hidden className="mr-2 inline h-4 w-4 text-[#2f7d52]" />
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (task.type === 'produce') {
    const compiled = getCompiled(task.sign)
    if (!compiled) {
      return (
        <div className="kk-muncul rounded-kartu bg-kartu border-2 border-[#c4dcca] p-4 shadow-xl">
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
      <div className="kk-muncul rounded-kartu-besar bg-kartu border-2 border-[#c4dcca] p-4 shadow-xl sm:p-5">
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
    <div className="kk-muncul rounded-kartu-besar bg-kartu border-2 border-[#c4dcca] p-4 shadow-xl sm:p-5">
      <p className="mb-3 font-bold">Pasien berisyarat. Apa maknanya?</p>
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

export function SceneUjianPuskesmas({
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
  const idUtama = node.id.replace(/^repair-/, '')
  const peran = PERAN_SIMPUL[node.actor] ?? 'perawat'
  const pose = POSE_SIMPUL[idUtama] ?? 'netral'
  const langkahIndex = langkahDariSimpul(idUtama)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-12 pt-1 sm:px-6">
      {umpan}
      <nav
        aria-label="Langkah kunjungan"
        className="bg-kartu mx-auto w-full max-w-3xl rounded-full border-2 border-[#c4dcca] px-4 py-2 shadow-lg"
      >
        <ol className="flex items-center justify-between gap-1">
          {LANGKAH_PUSKESMAS.map(({ id, label, Icon }, index) => {
            const status =
              index < langkahIndex ? 'lewat' : index === langkahIndex ? 'aktif' : 'nanti'
            return (
              <li key={id} className="flex min-w-0 flex-1 items-center gap-1 last:flex-none">
                <span
                  aria-current={status === 'aktif' ? 'step' : undefined}
                  title={label}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    status === 'lewat'
                      ? 'border-berhasil bg-berhasil text-white'
                      : status === 'aktif'
                        ? 'border-sorot text-aksen bg-[#fff3d6] shadow-[0_0_0_4px_rgba(217,165,33,0.25)]'
                        : 'bg-kartu border-[#c4dcca] text-[#9dbfa9]'
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
                {index < LANGKAH_PUSKESMAS.length - 1 ? (
                  <span
                    aria-hidden
                    className={`hidden h-1 flex-1 rounded-full sm:block ${
                      index < langkahIndex ? 'bg-berhasil' : 'bg-[#dde6dd]'
                    }`}
                  />
                ) : null}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-stretch">
        <PanggungMedis
          peran={peran}
          pose={pose}
          className="rounded-kartu-besar h-64 border-4 border-[#9dbfa9]/60 shadow-[0_24px_50px_-20px_rgba(29,68,47,0.5)] sm:h-80 lg:h-auto lg:min-h-[27rem]"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div key={node.id} className="kk-muncul relative">
            <div className="rounded-kartu bg-kartu relative rounded-tl-sm border-2 border-[#c4dcca] p-4 shadow-xl sm:p-5">
              <div
                aria-hidden
                className="bg-kartu absolute -left-2.5 top-5 hidden h-5 w-5 rotate-45 border-b-2 border-l-2 border-[#c4dcca] lg:block"
              />
              <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2f7d52]">
                <Stethoscope aria-hidden className="h-3.5 w-3.5" />
                {NAMA_AKTOR[node.actor] ?? prettify(node.actor)}
              </p>
              <p
                aria-live="polite"
                className="font-display mt-1.5 text-xl font-bold leading-snug sm:text-2xl"
              >
                “{node.line.id}”
              </p>
            </div>
          </div>

          <TugasPuskesmas
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
