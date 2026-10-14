'use client'

import { ArrowRight, Briefcase, Check, Lightbulb, Pencil } from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { LatihanBaca } from '@/components/latihan-baca'
import { PracticeBlock } from '@/components/practice-block'
import type { Direction } from '@/features/scenario/engine'
import type { LearningPhase } from '@/features/scenario/learning'
import { MapBerkas, PapanMenuKapur, Uap } from './props'
import { prettify } from './types'

const CATATAN = [
  'Kontak mata dulu, baru berisyarat.',
  'Belum ada isyaratnya? Tunjuk berkas atau menu.',
  'Pelan dan jelas lebih baik daripada cepat.',
]

function MejaWawancara() {
  return (
    <div aria-hidden className="pointer-events-none relative mt-1 h-10 overflow-visible sm:h-12">
      <div className="wk-kayu rounded-b-kartu absolute inset-x-0 inset-y-0 rounded-t-sm shadow-[0_14px_28px_-12px_rgba(69,52,25,0.5)]" />
      <div className="absolute bottom-1 right-[6%] w-9 sm:w-11">
        <Uap warna="#b89b74" className="absolute -top-7 left-0 h-7 w-7" />
        <svg viewBox="0 0 60 34" aria-hidden>
          <ellipse cx="28" cy="29" rx="24" ry="4" fill="rgba(69,52,25,0.22)" />
          <path d="M8 4 H48 L44 24 Q28 29 12 24 Z" fill="#fdfbf3" />
          <path d="M48 8 Q58 10 55 18 Q53 24 44 22" fill="none" stroke="#fdfbf3" strokeWidth="4" />
          <path d="M12 12 H44" stroke="#b4632c" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <MapBerkas className="absolute bottom-1.5 left-[5%] w-20 sm:w-24" />
    </div>
  )
}

function ProgressCangkir({ order, aktifIndex }: { order: readonly string[]; aktifIndex: number }) {
  return (
    <div aria-hidden className="flex items-center gap-1.5">
      {order.map((id, index) => (
        <svg key={id} viewBox="0 0 24 22" className="h-5 w-5">
          <path
            d="M3 4 H17 L15 16 Q10 19 5 16 Z"
            fill={index < aktifIndex ? '#6b4226' : index === aktifIndex ? '#c9b695' : 'transparent'}
            stroke="#6b4226"
            strokeWidth="1.6"
          />
          <path d="M17 7 q5 1 4 5 q-1 3 -5 3" fill="none" stroke="#6b4226" strokeWidth="1.6" />
          <path
            d="M6 20 H16"
            stroke={index <= aktifIndex ? '#6b4226' : '#b0a591'}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  )
}

function CatatanPewawancara() {
  return (
    <div className="relative w-full" aria-hidden>
      <span className="absolute left-1/2 top-0 z-10 h-3 w-12 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#8a8378]" />
      <div className="rounded-xl bg-[#b47a45] p-2 pt-3 shadow-lg">
        <div className="wk-kertas rounded-md px-3 py-3">
          <p className="text-peringatan flex items-center gap-1.5 text-[0.59rem] font-bold uppercase tracking-[0.2em]">
            <Lightbulb className="h-3.5 w-3.5" />
            Catatan pewawancara
          </p>
          <ul className="wk-font-kapur mt-1.5 space-y-1 text-base leading-snug text-[#453419]">
            {CATATAN.map((tip) => (
              <li key={tip}>
                <Pencil
                  aria-hidden
                  className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function SceneBelajar({
  learning,
  currentSignId,
  sign,
  compiled,
  learnView,
  direction,
  directionLabel,
  onGantiView,
  onLulus,
  onGagal,
  onNilaiSendiri,
  onLewati,
  onMulaiUjian,
}: {
  learning: LearningPhase
  currentSignId: string | null
  sign: Sign | undefined
  compiled: CompiledSign | null
  learnView: 'demo' | 'praktik'
  direction: Direction
  directionLabel: string
  onGantiView: (view: 'demo' | 'praktik') => void
  onLulus: () => void
  onGagal: () => void
  onNilaiSendiri: () => void
  onLewati: () => void
  onMulaiUjian: () => void
}) {
  if (currentSignId === null) {
    return (
      <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
        <div className="wk-muncul wk-kertas rounded-kartu-besar flex flex-col items-start gap-4 p-6 shadow-xl sm:p-8">
          <p className="text-teks-sekunder font-mono text-xs font-bold uppercase tracking-[0.2em]">
            Persiapan selesai
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Kamu siap diwawancara</h1>
          <p className="max-w-prose text-lg">
            Kepala barista sudah menunggu di meja bar dengan papan catatannya. Kamu berperan sebagai{' '}
            {directionLabel}.
          </p>
          <div className="flex flex-wrap gap-2" aria-hidden>
            {learning.order().map((id) => (
              <span
                key={id}
                className="rounded-full border border-[#c9b695] bg-white/70 px-3 py-1 text-sm font-bold capitalize"
              >
                <Check
                  aria-hidden
                  className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
                />
                {prettify(id)}
              </span>
            ))}
          </div>
          <button type="button" onClick={onMulaiUjian} className="tombol-cta">
            <Briefcase aria-hidden className="h-5 w-5" />
            Menuju meja wawancara
          </button>
        </div>
        <div className="hidden flex-col gap-5 lg:flex">
          <PapanMenuKapur className="w-60 rotate-1" />
          <CatatanPewawancara />
        </div>
      </div>
    )
  }

  const progress = learning.progressFor(currentSignId)!
  const orderIndex = learning.order().indexOf(currentSignId)

  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_13.65rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="wk-kertas rounded-kartu flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 shadow-lg">
          <div>
            <p className="text-teks-sekunder font-mono text-xs font-bold uppercase tracking-[0.2em]">
              Persiapan sebelum wawancara
            </p>
            <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">
              {direction === 'service' ? `Isyarat ${orderIndex + 1}` : prettify(currentSignId)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-teks-sekunder font-mono text-sm">
              {orderIndex + 1} / {learning.order().length}
            </p>
            <ProgressCangkir order={learning.order()} aktifIndex={orderIndex} />
          </div>
        </div>

        {compiled && sign ? (
          learnView === 'demo' && direction === 'deaf' ? (
            <div className="wk-muncul flex flex-col gap-4">
              <div>
                <AvatarStage
                  compiled={compiled}
                  sign={sign}
                  showControls
                  signLabel={sign.gloss.id}
                  stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border-4 border-[#6b4226]/30 shadow-[0_24px_50px_-20px_rgba(69,52,25,0.5)]"
                  className="sm:h-[58vh]"
                />
                <MejaWawancara />
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                <div className="wk-kertas rounded-kartu p-4 shadow-lg">
                  <p className="text-teks-sekunder font-mono text-xs font-bold uppercase tracking-[0.2em]">
                    Isyarat ini
                  </p>
                  <p className="font-display mt-1 text-xl font-bold">{sign.gloss.id}</p>
                  <p className="text-teks-sekunder">{sign.gloss.en}</p>
                  <p className="text-teks-sekunder mt-2 text-sm">
                    {sign.review.status === 'approved' ? (
                      <>
                        <Check
                          aria-hidden
                          className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
                        />
                        tervalidasi penanda Tuli
                      </>
                    ) : (
                      `${sign.gloss.id} · BISINDO`
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onGantiView('praktik')}
                  className="tombol-cta w-full text-lg md:w-auto md:self-end md:px-10"
                >
                  Lanjut ke praktik{' '}
                  <ArrowRight
                    aria-hidden
                    className="inline-block h-[1em] w-[1em] align-text-bottom"
                  />
                </button>
              </div>
            </div>
          ) : (
            <div className="wk-muncul wk-kertas rounded-kartu-besar flex flex-col gap-4 p-4 shadow-xl sm:p-5">
              {direction === 'service' ? (
                <LatihanBaca
                  compiled={compiled}
                  sign={sign}
                  signId={currentSignId}
                  kandidat={learning.order()}
                  onLulus={onLulus}
                  onGagal={onGagal}
                  onLewati={onNilaiSendiri}
                />
              ) : (
                <PracticeBlock
                  compiled={compiled}
                  sign={sign}
                  signLabel={sign.gloss.id}
                  onPassed={onLulus}
                  onFailedAttempt={onGagal}
                  onSelfAssessed={onNilaiSendiri}
                />
              )}
              <div className="flex flex-wrap items-center gap-3">
                {progress.attempts > 0 ? (
                  <p className="text-teks-samar text-sm">
                    percobaan: {progress.attempts}, gagal beruntun: {progress.consecutiveFailures}
                  </p>
                ) : null}
              </div>
            </div>
          )
        ) : (
          <div className="wk-kertas rounded-kartu flex flex-col gap-3 p-5 shadow-lg">
            <p>
              Isyarat <span className="font-bold">{prettify(currentSignId)}</span> belum punya
              peragaan karena bentuknya belum divalidasi penanda Tuli.
            </p>
            <button
              type="button"
              onClick={onLewati}
              className="tombol-sekunder self-start bg-white/70"
            >
              Lewati dulu
            </button>
          </div>
        )}
      </div>

      <div className="relative hidden flex-col items-center gap-6 pt-24 lg:flex">
        <PapanMenuKapur className="w-full rotate-1" />
        <CatatanPewawancara />
      </div>
    </div>
  )
}
