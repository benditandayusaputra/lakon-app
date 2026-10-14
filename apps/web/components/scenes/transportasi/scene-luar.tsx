'use client'

import { PetunjukPintu } from '@/components/scenes/petunjuk-pintu'
import { useAsalZoom } from '@/features/ui/use-asal-zoom'

import type { ReactNode } from 'react'
import { Petugas } from './petugas'
import { AwanPutih, BangkuTunggu, BusKota, Matahari, PapanLed, TiangRambu } from './props'

function LangitSiang() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Matahari className="absolute right-[12%] top-[7%] h-16 w-16 sm:h-20 sm:w-20" />
      <AwanPutih className="kk-awan absolute left-[6%] top-[9%] w-36 sm:w-44" />
      <AwanPutih
        className="kk-awan absolute left-[40%] top-[19%] w-28 opacity-80 sm:w-36"
        style={{ animationDelay: '-16s' }}
      />
      <AwanPutih
        className="kk-awan absolute left-[68%] top-[5%] w-24 opacity-70 sm:w-32"
        style={{ animationDelay: '-30s' }}
      />
      <svg viewBox="0 0 60 24" className="absolute left-[22%] top-[13%] w-10 opacity-70">
        <path
          d="M4 14 q8 -10 16 0 M32 10 q8 -10 16 0"
          stroke="#41546b"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function KotaSiang() {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-full left-0 -z-10 h-36 w-full opacity-80 sm:h-48"
      aria-hidden
    >
      <path
        d="M0 160 V90 h58 v-26 h48 v26 h38 v-48 h20 v-12 h14 v12 h20 v48 h42 v-18 h16 v18 V160 Z"
        fill="#a9c3d6"
      />
      <path
        d="M940 160 v-20 h18 v20 h20 v-50 h44 v-12 h12 v-10 h12 v10 h14 v12 h28 v50 h26 v-28 h52 v28 h34 V160 Z"
        fill="#a9c3d6"
      />
      {(
        [
          [76, 104],
          [130, 84],
          [196, 96],
          [1010, 122],
          [1074, 112],
          [1148, 140],
        ] as const
      ).map(([x, y]) => (
        <rect key={x} x={x} y={y} width="8" height="10" fill="#e8f2fa" opacity="0.9" />
      ))}
    </svg>
  )
}

function DindingKacaHalte({ sisi }: { sisi: 'kiri' | 'kanan' }) {
  return (
    <div
      className="tp-kaca-luar relative h-32 overflow-hidden rounded-t-md border-4 border-[#1c3a55] shadow-[inset_0_0_30px_rgba(255,255,255,0.35)] sm:h-44"
      aria-hidden
    >
      {sisi === 'kiri' ? (
        <svg viewBox="0 0 120 90" className="absolute inset-x-0 bottom-0 w-full opacity-70">
          <rect x="14" y="58" width="92" height="7" rx="3" fill="#26496b" />
          <rect x="20" y="65" width="5" height="20" fill="#41546b" />
          <rect x="95" y="65" width="5" height="20" fill="#41546b" />
          <circle cx="44" cy="34" r="10" fill="#26496b" />
          <path d="M34 44 q10 -8 20 0 l3 14 h-26 Z" fill="#26496b" />
          <path
            d="M54 48 q8 -8 10 -18 M64 26 l-2 -6 M68 30 l3 -6"
            stroke="#26496b"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="84" cy="36" r="10" fill="#26496b" />
          <path d="M74 46 q10 -8 20 0 l3 12 h-26 Z" fill="#26496b" />
        </svg>
      ) : (
        <svg viewBox="0 0 120 90" className="absolute inset-x-0 bottom-0 w-full opacity-70">
          <rect x="10" y="14" width="56" height="38" rx="4" fill="#26496b" opacity="0.85" />
          <path
            d="M16 34 H60 M22 34 v-8 m10 8 v-14 m10 14 v-6 m10 6 v-10"
            stroke="#8fd8ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="80" y="30" width="26" height="55" rx="3" fill="#26496b" />
          <rect x="84" y="36" width="18" height="10" rx="2" fill="#8fd8ff" opacity="0.8" />
        </svg>
      )}
      <div className="absolute inset-y-0 left-1/2 w-1 bg-[#1c3a55]/50" />
      <div className="absolute inset-x-0 top-1/2 h-1 bg-[#1c3a55]/40" />
      <span className="absolute inset-y-0 left-[18%] w-2 bg-white/40" aria-hidden />
    </div>
  )
}

function PetugasHalte({ membuka, onTanya }: { membuka: boolean; onTanya: () => void }) {
  return (
    <button
      type="button"
      onClick={onTanya}
      disabled={membuka}
      aria-label="Hampiri petugas halte untuk bertanya"
      data-pintu
      className="group relative z-20 block w-36 cursor-pointer rounded-t-md sm:w-44"
    >
      <span className="relative block h-52 overflow-hidden rounded-t-md border-4 border-[#1c3a55] bg-[linear-gradient(180deg,#eef5fb_0%,#d5e6f2_55%,#b9d2e4_100%)] sm:h-64">
        <Petugas
          pose={membuka ? 'lambai' : 'netral'}
          className="absolute bottom-[20%] left-1/2 w-[115%] -translate-x-1/2 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex h-[24%] items-center justify-center border-t-[6px] border-[#f2b23e] bg-[#1c3a55]"
        >
          <span className="text-[10px] font-black tracking-[0.3em] text-[#ffd28a] sm:text-xs">
            INFO
          </span>
        </span>
      </span>
      <PetunjukPintu
        aktif={!membuka}
        teks={membuka ? 'Halo, ada yang bisa dibantu?' : 'Klik petugas untuk bertanya'}
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
    <div className={`relative flex flex-1 flex-col overflow-hidden ${membuka ? 'tp-membuka' : ''}`}>
      <LangitSiang />

      <div
        ref={zoomRef}
        className="tp-fasad-zoom relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-3 sm:px-6"
      >
        <div className="tp-halte relative z-10 rounded-t-xl px-[4%] pt-5 shadow-[0_-10px_40px_rgba(28,58,85,0.25)] sm:pt-6">
          <div className="mx-auto w-fit rounded-lg border-2 border-[#12283c] bg-[#1c3a55] px-5 py-2.5 shadow-[0_6px_20px_rgba(13,31,46,0.4)] sm:px-8 sm:py-3.5">
            <div className="flex items-center justify-center gap-3">
              <svg viewBox="0 0 46 32" className="h-7 w-9 sm:h-8 sm:w-11" aria-hidden>
                <rect x="2" y="4" width="42" height="22" rx="6" fill="#ffd28a" />
                <rect x="7" y="9" width="10" height="8" rx="2" fill="#1c3a55" />
                <rect x="20" y="9" width="10" height="8" rx="2" fill="#1c3a55" />
                <rect x="33" y="9" width="7" height="8" rx="2" fill="#1c3a55" />
                <circle cx="12" cy="27" r="4" fill="#12283c" />
                <circle cx="34" cy="27" r="4" fill="#12283c" />
              </svg>
              <div>
                <p className="font-display text-xl font-bold tracking-[0.18em] text-[#ffd28a] sm:text-3xl">
                  HALTE LAKON
                </p>
                <p className="text-center text-[9px] uppercase tracking-[0.4em] text-[#8fb4d8] sm:text-[11px]">
                  koridor 1 · ramah isyarat
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-5" aria-hidden>
            <div className="h-8 rounded-t-md bg-[linear-gradient(180deg,#41546b,#26496b)] shadow-md sm:h-10" />
            <div className="h-2 w-full bg-[#f2b23e]" />
            <PapanLed
              teks="SELAMAT DATANG · BUS BERIKUTNYA 5 MENIT"
              className="absolute left-1/2 top-1/2 w-[72%] max-w-md -translate-x-1/2 -translate-y-[60%]"
            />
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-[4%] px-[2%] sm:mt-4">
            <DindingKacaHalte sisi="kiri" />
            <PetugasHalte membuka={membuka} onTanya={onMasuk} />
            <DindingKacaHalte sisi="kanan" />
          </div>

          <div className="mt-0 h-3 bg-[#12283c]" aria-hidden />
        </div>

        <div
          className="tp-jalan relative left-1/2 flex w-screen -translate-x-1/2 flex-col items-center gap-4 px-4 pb-8 pt-6 sm:flex-row sm:items-end sm:justify-center sm:gap-10 sm:pb-10"
          aria-hidden={membuka}
        >
          <KotaSiang />
          <BusKota
            aria-hidden
            className="pointer-events-none absolute -top-16 right-[1%] hidden w-64 xl:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#f2b23e_0_44px,#12283c_44px_88px)] opacity-80"
          />
          <TiangRambu
            aria-hidden
            className="pointer-events-none absolute bottom-8 left-[3%] hidden w-16 lg:block"
          />
          <BangkuTunggu
            aria-hidden
            className="pointer-events-none absolute bottom-6 right-[4%] hidden w-44 lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 gap-3 opacity-50 sm:flex"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className="block h-2.5 w-10 rounded-sm bg-[#e8f2fa]" />
            ))}
          </div>
          {papanInfo}
        </div>
      </div>
    </div>
  )
}
