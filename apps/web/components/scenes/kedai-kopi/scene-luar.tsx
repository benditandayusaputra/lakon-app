'use client'

import { PetunjukPintu } from '@/components/scenes/petunjuk-pintu'
import { useAsalZoom } from '@/features/ui/use-asal-zoom'

import type { ReactNode } from 'react'
import { LampuGantung, LampuTali, LoncengPintu, Sepeda, TanamanPot, Uap } from './props'

function BintangLangit() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {(
        [
          [8, 12],
          [16, 28],
          [26, 8],
          [38, 20],
          [55, 10],
          [64, 24],
          [78, 14],
          [88, 30],
          [94, 9],
          [47, 6],
          [70, 5],
          [22, 18],
        ] as const
      ).map(([x, y]) => (
        <span
          key={`${x}-${y}`}
          className="kk-lampu-nyala absolute h-1 w-1 rounded-full bg-[#ffe0b0]"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(x % 5) * 0.6}s` }}
        />
      ))}
      <span className="absolute right-[10%] top-[8%] h-16 w-16 rounded-full bg-[#f5ddb5] opacity-90 shadow-[0_0_70px_24px_rgba(255,214,150,0.35)] sm:h-20 sm:w-20">
        <span className="absolute left-[22%] top-[30%] h-3 w-3 rounded-full bg-[#e3c493] opacity-70" />
        <span className="absolute left-[55%] top-[55%] h-2 w-2 rounded-full bg-[#e3c493] opacity-60" />
      </span>
      <span className="kk-awan bg-[#e3c493]/12 absolute left-[12%] top-[14%] h-8 w-40 rounded-full blur-md" />
      <span
        className="kk-awan absolute left-[52%] top-[24%] h-6 w-52 rounded-full bg-[#e3c493]/10 blur-md"
        style={{ animationDelay: '-18s' }}
      />
    </div>
  )
}

function AtapKota() {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-full left-0 -z-10 h-40 w-full opacity-70 sm:h-52"
      aria-hidden
    >
      <path
        d="M0 160 V96 h64 v-24 h52 v24 h40 v-44 h18 v-14 h14 v14 h22 v44 h44 v-20 h16 v20 V160 Z"
        fill="#191022"
      />
      <path
        d="M930 160 v-18 h16 v18 h20 v-46 h44 v-14 h12 v-10 h12 v10 h14 v14 h30 v46 h28 v-26 h56 v26 h38 V160 Z"
        fill="#191022"
      />
      {(
        [
          [84, 108],
          [140, 118],
          [206, 92],
          [1004, 122],
          [1068, 108],
          [1150, 118],
        ] as const
      ).map(([x, y]) => (
        <rect key={x} x={x} y={y} width="7" height="9" fill="#ffce8a" opacity="0.5" />
      ))}
    </svg>
  )
}

function JendelaKedai({ sisi }: { sisi: 'kiri' | 'kanan' }) {
  return (
    <div
      className="relative h-32 overflow-hidden rounded-t-md border-4 border-[#2b1a0e] bg-[radial-gradient(ellipse_75%_70%_at_50%_45%,#ffce8a_0%,#e8964f_55%,#a85a2e_100%)] shadow-[0_0_44px_6px_rgba(255,184,92,0.35)] sm:h-44"
      aria-hidden
    >
      {sisi === 'kiri' ? (
        <svg viewBox="0 0 120 90" className="absolute inset-x-0 bottom-0 w-full opacity-80">
          <circle cx="34" cy="38" r="11" fill="#3d2412" />
          <path d="M23 48 q11 -8 22 0 l3 26 h-28 Z" fill="#3d2412" />
          <path
            d="M45 52 q9 -8 12 -18"
            stroke="#3d2412"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M56 32 l-2 -6 M60 34 l1 -7 M63 38 l4 -5"
            stroke="#3d2412"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="88" cy="40" r="11" fill="#3d2412" />
          <path d="M77 50 q11 -8 22 0 l3 24 h-28 Z" fill="#3d2412" />
          <path
            d="M77 54 q-8 -6 -10 -16"
            stroke="#3d2412"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M64 36 l2 -6 M60 40 l-2 -6"
            stroke="#3d2412"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="48" y="70" width="28" height="6" rx="2" fill="#2b1a0e" />
          <path d="M58 62 h8 l-1.5 8 h-5 Z" fill="#2b1a0e" />
        </svg>
      ) : (
        <svg viewBox="0 0 120 90" className="absolute inset-x-0 bottom-0 w-full opacity-80">
          <rect x="12" y="66" width="96" height="7" rx="2" fill="#241811" />
          <path d="M30 44 h30 l-3 22 h-24 Z" fill="#241811" />
          <path d="M70 50 h20 l-2 16 h-16 Z" fill="#241811" />
          <path
            d="M40 36 q4 -8 12 -6"
            stroke="#241811"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
      <div className="absolute inset-x-0 top-1/2 h-1 bg-[#2b1a0e]/70" />
      <div className="absolute inset-y-0 left-1/2 w-1 bg-[#2b1a0e]/70" />
      <LampuGantung
        className={`absolute top-0 w-9 opacity-80 sm:w-11 ${sisi === 'kiri' ? 'left-[16%]' : 'right-[16%]'}`}
      />
    </div>
  )
}

function PintuKedai({ membuka, onMasuk }: { membuka: boolean; onMasuk: () => void }) {
  return (
    <button
      type="button"
      onClick={onMasuk}
      disabled={membuka}
      aria-label="Buka pintu dan masuk ke kedai"
      data-pintu
      className="kk-jalan-pintu group relative z-20 block w-32 cursor-pointer rounded-t-[14px] sm:w-40"
    >
      <LoncengPintu className="absolute -top-1 right-1.5 z-30 w-5 sm:w-6" />
      <span className="relative block h-52 overflow-hidden rounded-t-[14px] border-4 border-[#2b1a0e] bg-[#1d120a] sm:h-64">
        <span
          aria-hidden
          className="kk-ruang-dalam absolute inset-0 block bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,#ffe0b0_0%,#e8964f_60%,#8a4a26_100%)]"
        >
          <span className="absolute bottom-0 left-1/2 block h-[38%] w-[130%] -translate-x-1/2 rounded-t-md bg-[#4a2b18]" />
          <span className="absolute bottom-[34%] left-[20%] block h-[10%] w-[60%] rounded-sm bg-[#26301f]" />
        </span>
        <span aria-hidden className="kk-cahaya-pintu absolute inset-0 block" />
        <span className="kk-pintu absolute inset-0 block">
          <span className="kk-kayu-gelap absolute inset-0 block rounded-t-[10px]">
            <span
              aria-hidden
              className="absolute inset-x-[14%] top-[8%] block h-[30%] rounded-t-full border-[3px] border-[#2b1a0e] bg-[radial-gradient(ellipse_at_50%_60%,#ffce8a_0%,#c9713f_80%)]"
            >
              <span className="kk-goyang absolute left-1/2 top-[26%] block -translate-x-1/2 rounded-sm bg-[#f5e9d7] px-1.5 py-0.5 shadow-sm">
                <span className="kk-font-kapur block text-[10px] font-bold leading-none text-[#2b1a0e] sm:text-xs">
                  BUKA
                </span>
              </span>
            </span>
            <span
              aria-hidden
              className="absolute inset-x-[16%] top-[46%] block h-[20%] rounded-sm border-2 border-[#2b1a0e]/50"
            />
            <span
              aria-hidden
              className="absolute inset-x-[16%] top-[70%] block h-[20%] rounded-sm border-2 border-[#2b1a0e]/50"
            />
            <span
              aria-hidden
              className="bg-sorot absolute right-[10%] top-[52%] block h-3.5 w-3.5 rounded-full shadow-[0_0_8px_rgba(217,165,33,0.8)]"
            />
          </span>
        </span>
      </span>
      <PetunjukPintu
        aktif={!membuka}
        teks={membuka ? 'Kriiing… selamat datang!' : 'Klik pintu untuk masuk'}
      />
    </button>
  )
}

export function SceneLuar({
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
    <div className={`relative flex flex-1 flex-col overflow-hidden ${membuka ? 'kk-membuka' : ''}`}>
      <BintangLangit />

      <div
        ref={zoomRef}
        className="kk-fasad-zoom relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-3 sm:px-6"
      >
        <LampuTali className="relative z-10 -mb-1 h-6 w-full" />
        <div className="kk-bata relative z-10 rounded-t-lg px-[4%] pt-5 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:pt-7">
          <div className="mx-auto w-fit rounded-lg border-2 border-[#2b1a0e] bg-[#241811] px-5 py-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.45)] sm:px-8 sm:py-3.5">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <svg viewBox="0 0 40 34" className="h-7 w-8 sm:h-8 sm:w-9" aria-hidden>
                  <path d="M6 12 H30 L27 30 Q18 34 9 30 Z" fill="#ffce8a" />
                  <path
                    d="M30 15 Q38 17 35 24 Q33 29 27 27"
                    fill="none"
                    stroke="#ffce8a"
                    strokeWidth="3"
                  />
                </svg>
                <Uap warna="#ffce8a" className="absolute -top-6 left-1 h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-[0.18em] text-[#ffce8a] drop-shadow-[0_0_12px_rgba(255,206,138,0.6)] sm:text-3xl">
                  KOPI LAKON
                </p>
                <p className="text-center text-[9px] uppercase tracking-[0.4em] text-[#e0955a] sm:text-[11px]">
                  kedai ramah isyarat
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-5">
            <div className="kk-tenda h-9 rounded-t-md shadow-md sm:h-12" />
            <div className="kk-tenda-gigi h-[17px] w-full" />
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-[4%] px-[2%] sm:mt-4">
            <JendelaKedai sisi="kiri" />
            <PintuKedai membuka={membuka} onMasuk={onMasuk} />
            <JendelaKedai sisi="kanan" />
          </div>

          <div className="mt-0 h-3 bg-[#2b1a0e]" aria-hidden />
        </div>

        <div
          className="kk-aspal relative left-1/2 flex w-screen -translate-x-1/2 flex-col items-center gap-4 px-4 pb-8 pt-5 sm:flex-row sm:items-end sm:justify-center sm:gap-10 sm:pb-10"
          aria-hidden={membuka}
        >
          <AtapKota />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(ellipse_45%_100%_at_50%_0%,rgba(255,206,138,0.28),transparent_70%)]"
          />
          <TanamanPot
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-[4%] hidden w-16 lg:block"
          />
          <Sepeda
            aria-hidden
            className="pointer-events-none absolute bottom-6 right-[3%] hidden w-36 opacity-90 lg:block"
          />
          {papanInfo}
        </div>
      </div>
    </div>
  )
}
