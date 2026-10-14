'use client'

import { ArrowRight, Check, Ticket, TicketCheck } from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { LatihanBaca } from '@/components/latihan-baca'
import { PracticeBlock } from '@/components/practice-block'
import type { Direction } from '@/features/scenario/engine'
import type { LearningPhase } from '@/features/scenario/learning'
import { PapanLed, PetaRute, RambuGantung } from './props'
import { prettify } from './types'

function PeronBelajar() {
  return (
    <div aria-hidden className="pointer-events-none relative mt-1 h-10 overflow-visible sm:h-12">
      <div className="rounded-b-kartu absolute inset-x-0 inset-y-0 bg-[#c3ccd4] shadow-[0_14px_28px_-12px_rgba(28,58,85,0.5)]">
        <span className="absolute inset-x-0 top-0 block h-2.5 bg-[repeating-linear-gradient(90deg,#f2b23e_0_36px,#12283c_36px_72px)] opacity-90" />
      </div>
      <svg viewBox="0 0 90 34" className="absolute bottom-1 right-[6%] w-14 sm:w-16" aria-hidden>
        <rect
          x="6"
          y="8"
          width="70"
          height="22"
          rx="4"
          fill="#fdf6e3"
          stroke="#c9b695"
          strokeWidth="2"
        />
        <path d="M16 16 h26 M16 23 h34" stroke="#8fa9c0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="62" cy="19" r="7" fill="none" stroke="#33608c" strokeWidth="2" opacity="0.7" />
      </svg>
      <svg viewBox="0 0 70 30" className="absolute bottom-1.5 left-[6%] w-12 sm:w-14" aria-hidden>
        <rect
          x="4"
          y="6"
          width="44"
          height="28"
          rx="4"
          fill="#f2b23e"
          transform="rotate(-8 26 20)"
        />
        <rect
          x="12"
          y="14"
          width="14"
          height="8"
          rx="2"
          fill="#c98f1e"
          transform="rotate(-8 26 20)"
        />
      </svg>
    </div>
  )
}

function ProgressTiket({ order, aktifIndex }: { order: readonly string[]; aktifIndex: number }) {
  return (
    <div aria-hidden className="flex items-center gap-1.5">
      {order.map((id, index) => (
        <svg key={id} viewBox="0 0 24 18" className="h-4 w-5">
          <path
            d="M2 4 h20 v4 a2.5 2.5 0 0 0 0 5 v4 h-20 v-4 a2.5 2.5 0 0 0 0 -5 Z"
            fill={index < aktifIndex ? '#33608c' : index === aktifIndex ? '#8fa9c0' : 'transparent'}
            stroke="#33608c"
            strokeWidth="1.8"
          />
          <path
            d="M8 5 v10"
            stroke={index <= aktifIndex ? '#eef5fb' : '#8fb4d8'}
            strokeWidth="1.5"
            strokeDasharray="2 2"
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
        <div className="kk-muncul tp-kertas rounded-kartu-besar flex flex-col items-start gap-4 p-6 shadow-xl sm:p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#26496b]">
            Latihan selesai
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Siap beli tiket sungguhan</h1>
          <p className="max-w-prose text-lg">
            Petugas loket sudah menunggu di balik kaca. Tanyakan rutemu, beli tiket, lalu naik bus.
            Kamu berperan sebagai {directionLabel}.
          </p>
          <div className="flex flex-wrap gap-2" aria-hidden>
            {learning.order().map((id) => (
              <span
                key={id}
                className="rounded-full border border-[#8fb4d8] bg-white/80 px-3 py-1 text-sm font-bold capitalize"
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
            <TicketCheck aria-hidden className="h-5 w-5" />
            Menuju loket
          </button>
        </div>
        <div className="hidden justify-center lg:flex">
          <PetaRute className="w-72 rotate-1" />
        </div>
      </div>
    )
  }

  const progress = learning.progressFor(currentSignId)!
  const orderIndex = learning.order().indexOf(currentSignId)

  return (
    <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_14.6rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="tp-kertas rounded-kartu flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 shadow-lg">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#26496b]">
              Latihan di ruang tunggu
            </p>
            <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">
              {direction === 'service' ? `Isyarat ${orderIndex + 1}` : prettify(currentSignId)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-teks-sekunder font-mono text-sm">
              {orderIndex + 1} / {learning.order().length}
            </p>
            <ProgressTiket order={learning.order()} aktifIndex={orderIndex} />
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
                  stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border-4 border-[#1c3a55]/30 shadow-[0_24px_50px_-20px_rgba(28,58,85,0.5)]"
                  className="sm:h-[58vh]"
                />
                <PeronBelajar />
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                <div className="tp-kertas rounded-kartu p-4 shadow-lg">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#26496b]">
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
            <div className="kk-muncul tp-kertas rounded-kartu-besar flex flex-col gap-4 p-4 shadow-xl sm:p-5">
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
          <div className="tp-kertas rounded-kartu flex flex-col gap-3 p-5 shadow-lg">
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

      <div className="relative hidden flex-col items-center gap-5 pt-2 lg:flex">
        <RambuGantung teks="LOKET" arah="kanan" />
        <PetaRute className="w-full rotate-1" />
        <PapanLed teks="BUS · 5 MENIT" className="w-full" />
        <div className="tp-kertas w-full -rotate-1 rounded-xl border-2 border-[#8fb4d8] p-3 text-center shadow-md">
          <p className="text-sm font-bold text-[#26496b]">
            Hafalkan dulu, nanti dipakai saat bicara dengan petugas loket{' '}
            <Ticket aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
          </p>
        </div>
      </div>
    </div>
  )
}
