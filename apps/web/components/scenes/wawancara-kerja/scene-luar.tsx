'use client'

import { PetunjukPintu } from '@/components/scenes/petunjuk-pintu'
import { useAsalZoom } from '@/features/ui/use-asal-zoom'

import type { ReactNode } from 'react'
import {
  AwanPagi,
  BurungPagi,
  GantunganPintu,
  LampuGantung,
  LoncengPintu,
  Matahari,
  PosterLowongan,
  Sepeda,
  TanamanGantung,
  TanamanPot,
  Uap,
} from './props'

function LangitPagi() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Matahari className="absolute right-[10%] top-[7%] h-16 w-16 sm:h-20 sm:w-20" />
      <AwanPagi className="wk-awan absolute left-[4%] top-[8%] w-36 sm:w-44" />
      <AwanPagi
        className="wk-awan absolute left-[38%] top-[18%] w-28 opacity-80 sm:w-36"
        style={{ animationDelay: '-18s' }}
      />
      <AwanPagi
        className="wk-awan absolute left-[70%] top-[4%] w-24 opacity-70 sm:w-32"
        style={{ animationDelay: '-34s' }}
      />
      <BurungPagi className="wk-burung absolute left-[14%] top-[14%] w-20 opacity-70 sm:w-24" />
      <BurungPagi
        className="wk-burung absolute left-[50%] top-[9%] w-14 opacity-50 sm:w-20"
        style={{ animationDelay: '-14s' }}
      />
    </div>
  )
}

function SiluetKotaPagi() {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-full left-0 -z-10 h-36 w-full opacity-80 sm:h-48"
      aria-hidden
    >
      <path
        d="M0 160 V96 h64 v-24 h52 v24 h40 v-44 h18 v-14 h14 v14 h22 v44 h44 v-20 h16 v20 V160 Z"
        fill="#b9cad8"
      />
      <path
        d="M930 160 v-18 h16 v18 h20 v-46 h44 v-14 h12 v-10 h12 v10 h14 v14 h30 v46 h28 v-26 h56 v26 h38 V160 Z"
        fill="#b9cad8"
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
        <rect key={x} x={x} y={y} width="7" height="9" fill="#eef5fb" opacity="0.9" />
      ))}
    </svg>
  )
}

function JendelaKedai({ sisi }: { sisi: 'kiri' | 'kanan' }) {
  return (
    <div
      className="relative h-32 overflow-hidden rounded-t-md border-4 border-[#6b4226] bg-[linear-gradient(165deg,rgba(255,255,255,0.6)_0%,rgba(214,235,250,0.4)_35%,rgba(255,255,255,0.2)_60%,rgba(214,235,250,0.3)_100%),linear-gradient(180deg,#f9f0df_0%,#ead6b6_100%)] shadow-[inset_0_0_30px_rgba(255,255,255,0.4)] sm:h-44"
      aria-hidden
    >
      {sisi === 'kiri' ? (
        <>
          <svg viewBox="0 0 120 90" className="absolute inset-x-0 bottom-0 w-full opacity-70">
            <rect x="26" y="52" width="68" height="6" rx="2" fill="#8a5a33" />
            <rect x="34" y="58" width="5" height="26" fill="#8a5a33" />
            <rect x="82" y="58" width="5" height="26" fill="#8a5a33" />
            <path
              d="M8 60 h20 v-16 h-20 Z M8 60 v24 M28 60 v24"
              stroke="#8a5a33"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M92 60 h20 v-16 h-20 Z M92 60 v24 M112 60 v24"
              stroke="#8a5a33"
              strokeWidth="4"
              fill="none"
            />
            <path d="M54 52 h12 l-1.5 -8 h-9 Z" fill="#8a5a33" />
            <path d="M66 46 q5 1 4 5" stroke="#8a5a33" strokeWidth="2.5" fill="none" />
          </svg>
          <PosterLowongan className="absolute left-[6%] top-[9%] w-[60%] -rotate-2" />
          <TanamanGantung className="absolute right-[6%] top-0 w-9 opacity-90 sm:w-11" />
        </>
      ) : (
        <>
          <svg viewBox="0 0 120 90" className="absolute inset-x-0 bottom-0 w-full opacity-70">
            <rect x="10" y="66" width="100" height="7" rx="2" fill="#8a5a33" />
            <rect x="18" y="38" width="44" height="28" rx="4" fill="#8a5a33" />
            <rect x="24" y="30" width="32" height="10" rx="3" fill="#8a5a33" />
            <circle cx="40" cy="52" r="3" fill="#f9f0df" />
            <path d="M74 66 h18 l-2 -14 h-14 Z M96 66 h14 l-2 -10 h-10 Z" fill="#8a5a33" />
            <path
              d="M84 50 q4 -8 12 -6"
              stroke="#8a5a33"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <div className="absolute right-[8%] top-[10%] rounded-sm bg-[#26301f] px-1.5 py-1 text-center shadow-md">
            <p className="wk-font-kapur text-[9px] leading-tight text-[#ece7d6] sm:text-[11px]">
              BUKA
              <br />
              10.00 – 21.00
            </p>
          </div>
          <LampuGantung className="absolute left-[12%] top-0 w-9 opacity-90 sm:w-11" />
        </>
      )}
      <div className="absolute inset-x-0 top-1/2 h-1 bg-[#6b4226]/60" />
      <div className="absolute inset-y-0 left-1/2 w-1 bg-[#6b4226]/60" />
    </div>
  )
}

function PintuKedai({ membuka, onMasuk }: { membuka: boolean; onMasuk: () => void }) {
  return (
    <button
      type="button"
      onClick={onMasuk}
      disabled={membuka}
      aria-label="Buka pintu dan masuk ke kedai untuk wawancara"
      data-pintu
      className="wk-jalan-pintu group relative z-20 block w-32 cursor-pointer rounded-t-[10px] sm:w-40"
    >
      <LoncengPintu className="absolute -top-1 right-1.5 z-30 w-5 sm:w-6" />
      <span className="relative block h-52 overflow-hidden rounded-t-[10px] border-4 border-[#6b4226] bg-[#3a2a20] sm:h-64">
        <span
          aria-hidden
          className="wk-ruang-dalam absolute inset-0 block bg-[linear-gradient(180deg,#fbf3e4_0%,#f2e3c9_55%,#d9b98a_100%)]"
        >
          <span className="absolute bottom-0 left-1/2 block h-[36%] w-[130%] -translate-x-1/2 rounded-t-md bg-[#c48f5a]" />
          <span className="absolute bottom-[34%] left-[22%] block h-[10%] w-[56%] rounded-sm bg-[#26301f]" />
          <span className="absolute left-[44%] top-[6%] block h-[16%] w-[12%] rounded-b-full bg-[#c9955c]" />
        </span>
        <span aria-hidden className="wk-cahaya-pintu absolute inset-0 block" />
        <span className="wk-pintu absolute inset-0 block">
          <span className="wk-kayu absolute inset-0 block rounded-t-[8px]">
            <span
              aria-hidden
              className="absolute inset-x-[12%] top-[7%] block h-[46%] overflow-hidden rounded-t-[8px] border-[3px] border-[#6b4226] bg-[linear-gradient(160deg,rgba(255,255,255,0.55)_0%,rgba(214,235,250,0.35)_40%,rgba(255,255,255,0.15)_100%),linear-gradient(180deg,#f7ecd8,#e3c79c)]"
            >
              <span className="absolute inset-x-[10%] bottom-[8%] block h-[30%] rounded-sm bg-[#8a5a33]/60" />
              <span className="absolute left-[40%] top-[6%] block h-[24%] w-[20%] rounded-b-full bg-[#a8784a]/70" />
              <GantunganPintu
                teks="Pelamar barista, silakan masuk"
                className="absolute left-1/2 top-[22%] w-[88%] -translate-x-1/2"
              />
            </span>
            <span
              aria-hidden
              className="absolute inset-x-[14%] top-[60%] block h-[15%] rounded-sm border-2 border-[#6b4226]/40"
            />
            <span
              aria-hidden
              className="absolute inset-x-[14%] top-[79%] block h-[15%] rounded-sm border-2 border-[#6b4226]/40"
            />
            <span
              aria-hidden
              className="bg-sorot absolute right-[10%] top-[64%] block h-3.5 w-3.5 rounded-full shadow-[0_0_8px_rgba(217,165,33,0.8)]"
            />
          </span>
        </span>
      </span>
      <PetunjukPintu
        aktif={!membuka}
        teks={membuka ? 'Kriiing… silakan masuk!' : 'Klik pintu untuk masuk'}
      />
    </button>
  )
}

function PapanA({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 w-60 -rotate-1">
      <div className="wk-papan-kapur rounded-lg p-4 shadow-xl">{children}</div>
      <div aria-hidden className="mx-6 flex justify-between">
        <span className="h-5 w-2.5 rounded-b-sm bg-[#8a5a33]" />
        <span className="h-5 w-2.5 rounded-b-sm bg-[#8a5a33]" />
      </div>
    </div>
  )
}

export function SceneLuar({
  membuka,
  onMasuk,
  papanInfo,
  tombol,
}: {
  membuka: boolean
  onMasuk: () => void
  papanInfo: ReactNode
  tombol: ReactNode
}) {
  const zoomRef = useAsalZoom(!membuka)

  return (
    <div className={`relative flex flex-1 flex-col overflow-hidden ${membuka ? 'wk-membuka' : ''}`}>
      <LangitPagi />

      <div
        ref={zoomRef}
        className="wk-fasad-zoom relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-3 sm:px-6"
      >
        <div className="wk-kayu-tua relative z-10 -mb-1 h-3 rounded-t-md" aria-hidden />
        <div className="wk-dinding-luar relative z-10 rounded-t-lg px-[4%] pt-5 shadow-[0_-10px_40px_rgba(69,52,25,0.18)] sm:pt-7">
          <div className="wk-kayu-tua mx-auto w-fit rounded-lg border-2 border-[#452a18] px-5 py-2.5 shadow-[0_6px_20px_rgba(69,52,25,0.35)] sm:px-8 sm:py-3.5">
            <div className="flex items-center justify-center gap-3">
              <div className="relative">
                <svg viewBox="0 0 40 34" className="h-7 w-8 sm:h-8 sm:w-9" aria-hidden>
                  <path d="M6 12 H30 L27 30 Q18 34 9 30 Z" fill="#f7ecd8" />
                  <path
                    d="M30 15 Q38 17 35 24 Q33 29 27 27"
                    fill="none"
                    stroke="#f7ecd8"
                    strokeWidth="3"
                  />
                </svg>
                <Uap warna="#f7ecd8" className="absolute -top-6 left-1 h-8 w-8" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-[0.18em] text-[#f7ecd8] sm:text-3xl">
                  KOPI LAKON
                </p>
                <p className="text-center text-[9px] uppercase tracking-[0.4em] text-[#e0b98a] sm:text-[11px]">
                  kedai ramah isyarat
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-5" aria-hidden>
            <div className="wk-tenda h-9 rounded-t-md shadow-md sm:h-12" />
            <div className="wk-tenda-gigi h-[17px] w-full" />
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-[4%] px-[2%] sm:mt-4">
            <JendelaKedai sisi="kiri" />
            <PintuKedai membuka={membuka} onMasuk={onMasuk} />
            <JendelaKedai sisi="kanan" />
          </div>

          <div className="mt-0 h-3 bg-[#6b4226]" aria-hidden />
        </div>

        <div
          className="wk-trotoar relative left-1/2 flex w-screen -translate-x-1/2 flex-col items-center gap-4 px-4 pb-6 pt-6 sm:flex-row sm:items-end sm:justify-center sm:gap-10 sm:pb-8"
          aria-hidden={membuka}
        >
          <SiluetKotaPagi />
          <TanamanPot className="pointer-events-none absolute bottom-4 left-[4%] hidden w-16 lg:block" />
          <TanamanPot className="pointer-events-none absolute bottom-4 left-[11%] hidden w-11 xl:block" />
          <Sepeda className="pointer-events-none absolute bottom-4 right-[3%] hidden w-36 opacity-90 lg:block" />
          {papanInfo ? <PapanA>{papanInfo}</PapanA> : null}
          {tombol}
        </div>
        <div
          className="wk-jalan relative left-1/2 h-8 w-screen -translate-x-1/2 sm:h-10"
          aria-hidden
        />
      </div>
    </div>
  )
}
