'use client'

import { PetunjukPintu } from '@/components/scenes/petunjuk-pintu'
import { useAsalZoom } from '@/features/ui/use-asal-zoom'

import type { ReactNode } from 'react'
import { AmbulansParkir } from '@/components/scenes/puskesmas/karakter'

function Awan({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden>
      <path
        d="M18 32 q-12 0 -10 -10 q2 -9 12 -8 q3 -10 14 -9 q10 1 12 9 q12 -3 14 7 q2 10 -9 11 Z"
        fill="#ffffff"
        opacity="0.9"
      />
      <path
        d="M70 34 q-8 0 -7 -7 q1 -6 8 -5 q3 -7 11 -5 q7 2 7 8 q8 0 8 6 q0 4 -7 3 Z"
        fill="#ffffff"
        opacity="0.7"
      />
    </svg>
  )
}

function PalangHijau({ ukuran = 40, className = '' }: { ukuran?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={ukuran} height={ukuran} className={className} aria-hidden>
      <rect x="4" y="15" width="32" height="10" rx="3" fill="#2f7d52" />
      <rect x="15" y="4" width="10" height="32" rx="3" fill="#2f7d52" />
    </svg>
  )
}

function DaunPintu({ sisi }: { sisi: 'kiri' | 'kanan' }) {
  return (
    <span
      className={`pk-daun-pintu ${sisi === 'kiri' ? 'pk-daun-kiri' : 'pk-daun-kanan'} relative block h-full w-1/2 border-2 border-[#4f8a68] bg-[linear-gradient(115deg,rgba(210,236,244,0.85)_0%,rgba(168,216,232,0.65)_45%,rgba(210,236,244,0.85)_100%)]`}
    >
      <span
        aria-hidden
        className="absolute left-[12%] top-[6%] block h-[70%] w-[10%] -skew-x-12 bg-white/45"
      />
      <span aria-hidden className="absolute inset-x-[12%] top-[44%] block">
        <span className="mx-auto block w-fit">
          <PalangHijau ukuran={22} />
        </span>
      </span>
      <span className="absolute inset-x-0 top-[32%] block text-center text-[7px] font-bold tracking-[0.3em] text-[#2a6b48] sm:text-[9px]">
        GESER
      </span>
      <span
        aria-hidden
        className={`absolute top-[38%] block h-[24%] w-1.5 rounded-full bg-[#4f8a68] ${sisi === 'kiri' ? 'right-[6%]' : 'left-[6%]'}`}
      />
    </span>
  )
}

export function SceneLuarPuskesmas({
  membuka,
  onMasuk,
  papanInfo,
}: {
  membuka: boolean
  onMasuk: () => void
  papanInfo: ReactNode
}) {
  const zoomRef = useAsalZoom(!membuka)

  return (
    <div className={`relative flex flex-1 flex-col overflow-hidden ${membuka ? 'pk-membuka' : ''}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-[12%] top-[7%] h-14 w-14 rounded-full bg-[#fff3c4] shadow-[0_0_60px_26px_rgba(255,240,180,0.55)] sm:h-20 sm:w-20" />
        <Awan className="absolute right-[8%] top-[6%] w-36 opacity-90 sm:w-48" />
        <Awan className="absolute left-[30%] top-[14%] w-24 opacity-60 sm:w-32" />
        <svg
          viewBox="0 0 44 96"
          className="absolute right-[5%] top-[14%] hidden w-9 lg:block"
          aria-hidden
        >
          <rect x="8" y="6" width="3.5" height="90" rx="1.5" fill="#8a95a0" />
          <circle cx="9.75" cy="4" r="3" fill="#c9a06a" />
          <path d="M11.5 8 h26 v9 h-26 Z" fill="#e0242a" className="kk-goyang" />
          <path
            d="M11.5 17 h26 v9 h-26 Z"
            fill="#ffffff"
            stroke="#dcdcdc"
            strokeWidth="0.5"
            className="kk-goyang"
          />
        </svg>
      </div>

      <div
        ref={zoomRef}
        className="pk-fasad-zoom relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-end px-3 sm:px-6"
      >
        <div className="relative">
          <AmbulansParkir className="absolute -left-2 bottom-0 z-10 hidden w-44 md:block lg:w-52" />

          <div className="pk-gedung relative mx-auto w-[min(620px,100%)] rounded-t-md border-x-4 border-t-4 border-[#c4dcca] shadow-[0_-8px_36px_rgba(47,125,82,0.18)] md:ml-auto md:mr-0 lg:mx-auto">
            <div className="h-6 rounded-t-sm bg-[#35855a] shadow-inner sm:h-8" aria-hidden />
            <div className="h-2 bg-[#2a6b48]" aria-hidden />

            <div className="px-[5%] pt-4 sm:pt-5">
              <div className="pk-papan-nama mx-auto flex w-fit items-center gap-3 rounded-lg px-4 py-2 sm:gap-4 sm:px-7 sm:py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white sm:h-11 sm:w-11">
                  <PalangHijau ukuran={26} />
                </span>
                <span>
                  <span className="font-display block text-lg font-bold tracking-[0.14em] text-white sm:text-2xl">
                    PUSKESMAS
                  </span>
                  <span className="block text-center text-[9px] uppercase tracking-[0.34em] text-[#c9ecd7] sm:text-[11px]">
                    Harapan Sehat
                  </span>
                </span>
              </div>
              <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-[#4f8a68] sm:text-[11px]">
                Senin s.d. Sabtu · 07.30 sampai 14.00 · Ramah Bahasa Isyarat
              </p>
            </div>

            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-[4%] px-[4%] sm:mt-4">
              <div
                className="relative h-28 overflow-hidden rounded-t-sm border-4 border-[#4f8a68] bg-[linear-gradient(115deg,#cfe9f2_0%,#a8d8e8_50%,#cfe9f2_100%)] sm:h-40"
                aria-hidden
              >
                <div className="absolute inset-x-0 top-1/2 h-1 bg-[#4f8a68]/70" />
                <div className="absolute inset-y-0 left-1/2 w-1 bg-[#4f8a68]/70" />
                <div className="absolute bottom-1 left-[10%] w-[45%] opacity-80">
                  <svg viewBox="0 0 60 40">
                    <path d="M8 38 q-5 -14 7 -21 q7 -4 13 0 q12 7 7 21 Z" fill="#5d8a4f" />
                    <rect x="12" y="32" width="26" height="8" rx="2" fill="#a8582f" />
                  </svg>
                </div>
                <div className="absolute right-[8%] top-[12%] w-[36%] rotate-1 rounded-sm bg-white p-1 shadow-sm">
                  <div className="h-1.5 w-full rounded-sm bg-[#2f7d52]" />
                  <div className="mt-1 h-1 w-4/5 rounded-sm bg-[#c4dcca]" />
                  <div className="mt-0.5 h-1 w-3/5 rounded-sm bg-[#c4dcca]" />
                </div>
              </div>

              <button
                type="button"
                onClick={onMasuk}
                disabled={membuka}
                aria-label="Geser pintu kaca dan masuk ke puskesmas"
                data-pintu
                className="pk-jalan-pintu group relative z-20 block w-40 sm:w-52"
              >
                <span className="relative block h-44 overflow-hidden rounded-t-sm border-4 border-[#4f8a68] bg-[#123324] sm:h-56">
                  <span
                    aria-hidden
                    className="pk-ruang-dalam absolute inset-0 block bg-[linear-gradient(180deg,#f2f7f0_0%,#e0ecdf_70%,#cdd8cc_100%)]"
                  >
                    <span className="absolute left-[12%] top-[18%] block h-[26%] w-[30%] rounded-sm bg-[#79b393] opacity-70" />
                    <span className="absolute right-[12%] top-[14%] block h-2 w-[30%] rounded-sm bg-[#2f7d52] opacity-60" />
                    <span className="absolute bottom-0 left-0 right-0 block h-[26%] bg-[#dde6dd]" />
                    <span className="absolute bottom-[24%] left-[16%] block h-[14%] w-[68%] rounded-sm bg-[#aeb8c2] opacity-80" />
                  </span>
                  <span className="absolute inset-0 flex">
                    <DaunPintu sisi="kiri" />
                    <DaunPintu sisi="kanan" />
                  </span>
                  <span aria-hidden className="absolute inset-x-0 top-0 block h-3 bg-[#4f8a68]" />
                </span>
                <PetunjukPintu
                  aktif={!membuka}
                  teks={membuka ? 'Pintu terbuka, masuk…' : 'Klik pintu kaca untuk masuk'}
                />
              </button>

              <div
                className="relative h-28 overflow-hidden rounded-t-sm border-4 border-[#4f8a68] bg-[linear-gradient(115deg,#cfe9f2_0%,#a8d8e8_50%,#cfe9f2_100%)] sm:h-40"
                aria-hidden
              >
                <div className="absolute inset-x-0 top-1/2 h-1 bg-[#4f8a68]/70" />
                <div className="absolute inset-y-0 left-1/2 w-1 bg-[#4f8a68]/70" />
                <div className="absolute left-[10%] top-[14%] w-[52%] -rotate-1 rounded-sm bg-white p-1 shadow-sm">
                  <div className="flex items-center gap-1">
                    <PalangHijau ukuran={10} />
                    <div className="h-1.5 flex-1 rounded-sm bg-[#2f7d52]" />
                  </div>
                  <div className="mt-1 h-1 w-4/5 rounded-sm bg-[#c4dcca]" />
                </div>
                <div className="absolute bottom-1 right-[8%] w-[42%] opacity-80">
                  <svg viewBox="0 0 60 40">
                    <path d="M12 38 q-6 -16 10 -22 q10 -3 16 4 q8 9 2 18 Z" fill="#4f7a44" />
                    <rect x="16" y="32" width="26" height="8" rx="2" fill="#7a3f22" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative h-4 bg-[#c4dcca]" aria-hidden>
              <div className="absolute inset-x-[8%] top-0 h-1 rounded-full bg-[#9dbfa9]" />
            </div>
          </div>

          <div aria-hidden className="relative mx-auto hidden w-[min(760px,100%)] md:block">
            <div className="absolute -top-16 right-[2%] h-2 w-[26%] rounded-full bg-[#8a95a0]" />
            <div className="absolute -top-16 right-[2%] flex w-[26%] justify-between px-2">
              <span className="mt-1 block h-14 w-1.5 bg-[#8a95a0]" />
              <span className="mt-1 block h-14 w-1.5 bg-[#8a95a0]" />
              <span className="mt-1 block h-14 w-1.5 bg-[#8a95a0]" />
            </div>
            <div className="absolute -top-3 right-0 h-3 w-[32%] -skew-y-3 rounded-sm bg-[#b8c4b8]" />
          </div>
        </div>

        <div
          className="pk-halaman-depan relative left-1/2 flex w-screen -translate-x-1/2 flex-col items-center gap-4 px-4 pb-8 pt-6 sm:flex-row sm:items-end sm:justify-center sm:gap-10 sm:pb-10"
          aria-hidden={membuka}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(47,125,82,0.12),transparent)]"
          />
          {papanInfo}
        </div>
      </div>
    </div>
  )
}
