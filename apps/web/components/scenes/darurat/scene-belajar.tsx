'use client'

import { ArrowRight, Check, Hand, Siren } from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { LatihanBaca } from '@/components/latihan-baca'
import { PracticeBlock } from '@/components/practice-block'
import type { Direction } from '@/features/scenario/engine'
import type { LearningPhase } from '@/features/scenario/learning'
import { KotakP3K, PapanNomorDarurat, RadioHT } from './props'
import { prettify } from './types'

function MejaLatihan() {
  return (
    <div aria-hidden className="pointer-events-none relative mt-1 h-10 overflow-visible sm:h-12">
      <div className="dr-meja rounded-b-kartu absolute inset-x-0 inset-y-0 rounded-t-sm shadow-[0_14px_28px_-12px_rgba(31,45,58,0.6)]" />
      <KotakP3K className="absolute -top-2 right-[3%] w-9 sm:w-10" />
      <RadioHT className="absolute -top-3 left-[3%] w-4 sm:w-5" />
    </div>
  )
}

function ProgressTanda({ order, aktifIndex }: { order: readonly string[]; aktifIndex: number }) {
  return (
    <div aria-hidden className="flex items-center gap-1.5">
      {order.map((id, index) => (
        <svg key={id} viewBox="0 0 20 24" className="h-5 w-4">
          <path
            d="M10 2 L18 5 V12 C18 17 14 21 10 22 C6 21 2 17 2 12 V5 Z"
            fill={index < aktifIndex ? '#33465a' : index === aktifIndex ? '#a6b4c0' : 'transparent'}
            stroke="#33465a"
            strokeWidth="1.6"
          />
          {index < aktifIndex ? (
            <path
              d="M6 12 l3 3 l5 -6"
              stroke="#ffffff"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          ) : null}
        </svg>
      ))}
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
        <div className="kk-muncul dr-kertas rounded-kartu-besar flex flex-col items-start gap-4 p-6 shadow-xl sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#33465a]">
            Latihan selesai
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Semua isyarat siap dipakai
          </h1>
          <p className="max-w-prose text-lg">
            Sekarang simulasinya sungguhan. Warga jaga sudah ada di dalam pos. Kamu berperan sebagai{' '}
            {directionLabel}.
          </p>
          <div className="flex flex-wrap gap-2" aria-hidden>
            {learning.order().map((id) => (
              <span
                key={id}
                className="rounded-full border border-[#8fa3b5] bg-white/80 px-3 py-1 text-sm font-bold capitalize"
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
            <Siren aria-hidden className="h-5 w-5" />
            Temui warga jaga
          </button>
        </div>
        <div className="hidden justify-center lg:flex">
          <PapanNomorDarurat className="w-60 rotate-1" />
        </div>
      </div>
    )
  }

  const progress = learning.progressFor(currentSignId)!
  const orderIndex = learning.order().indexOf(currentSignId)

  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_13.65rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="dr-kertas rounded-kartu flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 shadow-lg">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#33465a]">
              Latihan sebelum minta tolong
            </p>
            <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">
              {direction === 'service' ? `Isyarat ${orderIndex + 1}` : prettify(currentSignId)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-teks-sekunder font-mono text-sm">
              {orderIndex + 1} / {learning.order().length}
            </p>
            <ProgressTanda order={learning.order()} aktifIndex={orderIndex} />
          </div>
        </div>

        {compiled && sign ? (
          learnView === 'demo' && direction === 'deaf' ? (
            <div className="kk-muncul flex flex-col gap-4">
              <div>
                <AvatarStage
                  compiled={compiled}
                  sign={sign}
                  showControls
                  signLabel={sign.gloss.id}
                  stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border-4 border-[#33465a]/30 shadow-[0_24px_50px_-20px_rgba(31,45,58,0.6)]"
                  className="sm:h-[58vh]"
                />
                <MejaLatihan />
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                <div className="dr-kertas rounded-kartu p-4 shadow-lg">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#33465a]">
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
            <div className="kk-muncul dr-kertas rounded-kartu-besar flex flex-col gap-4 p-4 shadow-xl sm:p-5">
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
          <div className="dr-kertas rounded-kartu flex flex-col gap-3 p-5 shadow-lg">
            <p>
              Isyarat <span className="font-bold">{prettify(currentSignId)}</span> belum punya
              peragaan karena bentuknya belum divalidasi penanda Tuli.
            </p>
            <button
              type="button"
              onClick={onLewati}
              className="tombol-sekunder self-start bg-white/80"
            >
              Lewati dulu
            </button>
          </div>
        )}
      </div>

      <div className="relative hidden flex-col items-center gap-5 pt-6 lg:flex">
        <PapanNomorDarurat className="w-full rotate-1" />
        <div className="dr-papan-tulis w-full -rotate-1 rounded-xl p-3 text-center">
          <p className="kk-font-kapur text-lg text-[#1f2d3a]">
            Hafalkan dulu, nanti dipakai saat minta tolong ke warga jaga{' '}
            <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
          </p>
        </div>
      </div>
    </div>
  )
}
