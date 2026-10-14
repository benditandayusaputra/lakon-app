'use client'

import { ArrowRight, Check, Coffee } from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { LatihanBaca } from '@/components/latihan-baca'
import { PracticeBlock } from '@/components/practice-block'
import type { Direction } from '@/features/scenario/engine'
import type { LearningPhase } from '@/features/scenario/learning'
import { PapanMenuKapur, TanamanGantung, Uap } from './props'
import { prettify } from './types'

function MejaLatihan() {
  return (
    <div aria-hidden className="pointer-events-none relative mt-1 h-10 overflow-visible sm:h-12">
      <div className="kk-kayu rounded-b-kartu absolute inset-x-0 inset-y-0 rounded-t-sm shadow-[0_14px_28px_-12px_rgba(0,0,0,0.6)]" />
      <div className="absolute bottom-1 right-[6%] w-9 sm:w-11">
        <Uap warna="#e0c9a6" className="absolute -top-7 left-0 h-7 w-7" />
        <svg viewBox="0 0 60 34" aria-hidden>
          <ellipse cx="28" cy="29" rx="24" ry="4" fill="rgba(0,0,0,0.25)" />
          <path d="M8 4 H48 L44 24 Q28 29 12 24 Z" fill="#fdfbf3" />
          <path d="M48 8 Q58 10 55 18 Q53 24 44 22" fill="none" stroke="#fdfbf3" strokeWidth="4" />
        </svg>
      </div>
      <svg viewBox="0 0 90 26" className="absolute bottom-1.5 left-[6%] w-14 sm:w-16" aria-hidden>
        <path d="M4 24 Q4 4 24 4 H66 Q86 4 86 24 Z" fill="#f3e5cf" opacity="0.9" />
        <path d="M45 4 V24" stroke="#c9b695" strokeWidth="2" />
        <path d="M16 12 h18 M16 17 h18 M56 12 h18 M56 17 h18" stroke="#b0a591" strokeWidth="1.6" />
      </svg>
    </div>
  )
}

function ProgressBiji({ order, aktifIndex }: { order: readonly string[]; aktifIndex: number }) {
  return (
    <div aria-hidden className="flex items-center gap-1.5">
      {order.map((id, index) => (
        <svg key={id} viewBox="0 0 20 24" className="h-5 w-4">
          <path
            d="M10 2 C17 6 17 18 10 22 C3 18 3 6 10 2 Z"
            fill={index < aktifIndex ? '#6b4226' : index === aktifIndex ? '#d9a521' : 'transparent'}
            stroke="#6b4226"
            strokeWidth="1.6"
          />
          <path
            d="M10 4 C12 10 8 14 10 20"
            fill="none"
            stroke={index <= aktifIndex ? '#f8efdf' : '#b0a591'}
            strokeWidth="1.4"
          />
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
        <div className="kk-muncul kk-kertas rounded-kartu-besar flex flex-col items-start gap-4 p-6 shadow-xl sm:p-8">
          <p className="text-aksen font-mono text-xs font-bold uppercase tracking-[0.2em]">
            Latihan selesai
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Semua isyarat siap dipakai
          </h1>
          <p className="max-w-prose text-lg">
            Sekarang giliranmu memesan sungguhan. Barista sudah menunggu di kasir. Kamu berperan
            sebagai {directionLabel}.
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
            <Coffee aria-hidden className="h-5 w-5" />
            Menuju kasir
          </button>
        </div>
        <div className="hidden justify-center lg:flex">
          <PapanMenuKapur className="w-60 rotate-1" />
        </div>
      </div>
    )
  }

  const progress = learning.progressFor(currentSignId)!
  const orderIndex = learning.order().indexOf(currentSignId)

  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_13.65rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="kk-kertas rounded-kartu flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 shadow-lg">
          <div>
            <p className="text-aksen font-mono text-xs font-bold uppercase tracking-[0.2em]">
              Latihan sebelum memesan
            </p>
            <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">
              {direction === 'service' ? `Isyarat ${orderIndex + 1}` : prettify(currentSignId)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-teks-sekunder font-mono text-sm">
              {orderIndex + 1} / {learning.order().length}
            </p>
            <ProgressBiji order={learning.order()} aktifIndex={orderIndex} />
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
                  stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border-4 border-[#2b1a0e]/30 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]"
                  className="sm:h-[58vh]"
                />
                <MejaLatihan />
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                <div className="kk-kertas rounded-kartu p-4 shadow-lg">
                  <p className="text-aksen font-mono text-xs font-bold uppercase tracking-[0.2em]">
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
            <div className="kk-muncul kk-kertas rounded-kartu-besar flex flex-col gap-4 p-4 shadow-xl sm:p-5">
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
          <div className="kk-kertas rounded-kartu flex flex-col gap-3 p-5 shadow-lg">
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

      <div className="relative hidden flex-col items-center gap-5 pt-24 lg:flex">
        <TanamanGantung aria-hidden className="pointer-events-none absolute -top-8 right-0 w-16" />
        <PapanMenuKapur className="w-full rotate-1" />
        <div className="kk-papan-kapur w-full -rotate-1 rounded-xl p-3 text-center">
          <p className="kk-font-kapur text-lg text-[#d9d3bd]">
            Hafalkan dulu, nanti dipakai saat memesan ke barista{' '}
            <Coffee aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
          </p>
        </div>
      </div>
    </div>
  )
}
