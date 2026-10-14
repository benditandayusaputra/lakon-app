'use client'

import { PetunjukPintu } from '@/components/scenes/petunjuk-pintu'
import { useAsalZoom } from '@/features/ui/use-asal-zoom'

import type { ReactNode } from 'react'
import { Siren } from 'lucide-react'
import {
  AwanPutih,
  Burung,
  GarisSiaga,
  Kentongan,
  KerucutJalan,
  LampuSirene,
  Matahari,
  PapanPengumuman,
  Pohon,
  SepedaJatuh,
  TongSampah,
} from './props'

function LangitSiang() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Matahari className="absolute right-[10%] top-[6%] h-20 w-20 sm:h-24 sm:w-24" />
      <AwanPutih className="kk-awan absolute left-[4%] top-[8%] w-36 sm:w-44" />
      <AwanPutih
        className="kk-awan absolute left-[42%] top-[18%] w-28 opacity-80 sm:w-36"
        style={{ animationDelay: '-16s' }}
      />
      <AwanPutih
        className="kk-awan absolute left-[70%] top-[4%] w-24 opacity-70 sm:w-32"
        style={{ animationDelay: '-30s' }}
      />
      <Burung className="absolute left-[24%] top-[12%] w-10 opacity-70" />
      <Burung className="absolute left-[60%] top-[9%] w-8 opacity-50" />
    </div>
  )
}

function RumahTetangga() {
  return (
    <svg
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-full left-0 -z-10 h-36 w-full opacity-90 sm:h-48"
      aria-hidden
    >
      <path d="M0 160 V100 L60 66 L120 100 V160 Z" fill="#c9d6df" />
      <path d="M120 160 V110 L170 80 L220 110 V160 Z" fill="#bccbd6" />
      <path d="M220 160 V94 L290 58 L360 94 V160 Z" fill="#c9d6df" />
      <path d="M840 160 V98 L905 62 L970 98 V160 Z" fill="#c9d6df" />
      <path d="M970 160 V112 L1020 84 L1070 112 V160 Z" fill="#bccbd6" />
      <path d="M1070 160 V96 L1135 60 L1200 96 V160 Z" fill="#c9d6df" />
      {(
        [
          [46, 112],
          [156, 118],
          [276, 108],
          [318, 108],
          [890, 112],
          [1006, 122],
          [1120, 108],
        ] as const
      ).map(([x, y]) => (
        <rect key={x} x={x} y={y} width="16" height="18" rx="2" fill="#eef4f8" />
      ))}
      <path d="M0 160 H1200" stroke="#9fb1bf" strokeWidth="3" />
    </svg>
  )
}

function JendelaPos() {
  return (
    <div
      className="dr-kaca relative h-32 overflow-hidden rounded-t-md border-4 border-[#33465a] sm:h-44"
      aria-hidden
    >
      <div className="absolute inset-x-[10%] top-[14%] hidden rounded bg-[#1f2d3a] p-1.5 opacity-90 sm:block">
        <p className="text-center text-[7px] font-black tracking-[0.2em] text-[#ffd98a]">
          NOMOR DARURAT
        </p>
        <div className="mt-1 space-y-0.5">
          {['112', '119', '110'].map((n) => (
            <div key={n} className="flex items-center gap-1">
              <span className="rounded-sm bg-[#f2a93b] px-1 text-[7px] font-black text-[#1f2d3a]">
                {n}
              </span>
              <span className="h-px flex-1 bg-[#8fa3b5]/40" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-[8%] bottom-[10%] h-[8%] rounded-sm bg-[#8fa3b5]/60" />
      <div className="absolute inset-x-[14%] top-[18%] h-[10%] rounded-sm bg-[#1f2d3a]/70 sm:hidden" />
      <div className="absolute inset-x-0 top-1/2 h-1 bg-[#33465a]/70" />
      <div className="absolute inset-y-0 left-1/2 w-1 bg-[#33465a]/70" />
    </div>
  )
}

function PintuPos({ membuka, onMasuk }: { membuka: boolean; onMasuk: () => void }) {
  return (
    <button
      type="button"
      onClick={onMasuk}
      disabled={membuka}
      aria-label="Buka pintu dan masuk ke pos siaga"
      data-pintu
      className="dr-jalan-pintu group relative z-20 block w-28 cursor-pointer rounded-t-[10px] sm:w-40"
    >
      <span className="relative block h-52 overflow-hidden rounded-t-[10px] border-4 border-[#33465a] bg-[#1f2d3a] sm:h-64">
        <span
          aria-hidden
          className="dr-ruang-dalam absolute inset-0 block bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,#ffffff_0%,#dfe6ec_55%,#8fa3b5_100%)]"
        >
          <span className="absolute bottom-0 left-1/2 block h-[36%] w-[130%] -translate-x-1/2 rounded-t-md bg-[#33465a]" />
          <span className="absolute bottom-[34%] left-[22%] block h-[10%] w-[56%] rounded-sm bg-[#1f2d3a]" />
          <span className="absolute left-[30%] top-[12%] block h-[22%] w-[40%] rounded-sm bg-[#1f2d3a]/80" />
        </span>
        <span aria-hidden className="dr-cahaya-pintu absolute inset-0 block" />
        <span className="dr-pintu absolute inset-0 block">
          <span className="absolute inset-0 block rounded-t-[6px] bg-[linear-gradient(180deg,#4b6178_0%,#33465a_100%)]">
            <span
              aria-hidden
              className="dr-kaca absolute inset-x-[16%] top-[8%] block h-[28%] rounded-sm border-[3px] border-[#1f2d3a]"
            />
            <span
              aria-hidden
              className="absolute inset-x-[14%] top-[42%] block rounded-sm bg-[#f2a93b] px-1 py-0.5 text-center shadow-sm"
            >
              <span className="block text-[9px] font-black leading-tight tracking-wider text-[#1f2d3a] sm:text-[10px]">
                SIAGA 24 JAM
              </span>
            </span>
            <span
              aria-hidden
              className="absolute inset-x-[16%] top-[60%] block h-[28%] rounded-sm border-2 border-[#1f2d3a]/40"
            />
            <span
              aria-hidden
              className="absolute right-[10%] top-[54%] block h-6 w-2 rounded-full bg-[#dfe6ec] shadow-[0_0_6px_rgba(255,255,255,0.6)]"
            />
          </span>
        </span>
      </span>
      <PetunjukPintu
        aktif={!membuka}
        teks={membuka ? 'Pintu terbuka, masuk…' : 'Klik pintu untuk masuk'}
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
    <div className={`relative flex flex-1 flex-col overflow-hidden ${membuka ? 'dr-membuka' : ''}`}>
      <LangitSiang />

      <div
        ref={zoomRef}
        className="dr-fasad-zoom relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-end px-3 sm:px-6"
      >
        <div className="relative z-10 mx-auto flex w-[92%] items-end justify-center">
          <LampuSirene className="relative z-10 -mb-1 w-16 sm:w-20" />
          <span
            aria-hidden
            className="absolute bottom-0 right-[6%] h-10 w-1 rounded-full bg-[#1f2d3a] sm:h-14"
          >
            <span className="absolute -left-1.5 top-0 block h-3 w-4 rounded-sm bg-[#c8553d]" />
          </span>
        </div>
        <div className="dr-atap relative z-10 mx-auto h-6 w-[96%] rounded-t-lg shadow-md sm:h-8" />
        <div className="dr-tembok-pos relative z-10 px-[4%] pt-4 shadow-[0_-10px_40px_rgba(31,45,58,0.2)] sm:pt-6">
          <div className="mx-auto w-fit rounded-lg border-[3px] border-[#33465a] bg-white px-5 py-2.5 shadow-[0_8px_20px_-6px_rgba(31,45,58,0.45)] sm:px-8 sm:py-3.5">
            <div className="flex items-center justify-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2a93b] text-[#1f2d3a] sm:h-11 sm:w-11">
                <Siren aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <div>
                <p className="font-display text-xl font-bold tracking-[0.14em] text-[#1f2d3a] sm:text-3xl">
                  POS SIAGA WARGA
                </p>
                <p className="text-center text-[9px] uppercase tracking-[0.4em] text-[#33465a] sm:text-[11px]">
                  RW 05 · ramah isyarat
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-[4%] px-[2%] sm:mt-6">
            <JendelaPos />
            <PintuPos membuka={membuka} onMasuk={onMasuk} />
            <div className="relative flex h-32 flex-col justify-end sm:h-44">
              <Kentongan className="absolute -top-2 right-[6%] hidden w-7 sm:block sm:w-8" />
              <PapanPengumuman className="mb-2 w-full max-w-[150px] -rotate-1" />
            </div>
          </div>

          <GarisSiaga className="mt-0 h-3 sm:h-4" />
        </div>

        <div
          className="dr-jalan relative left-1/2 flex w-screen -translate-x-1/2 flex-col items-center gap-4 px-4 pb-8 pt-6 sm:flex-row sm:items-end sm:justify-center sm:gap-10 sm:pb-10"
          aria-hidden={membuka}
        >
          <RumahTetangga />
          <div
            aria-hidden
            className="dr-zebra pointer-events-none absolute inset-x-[20%] top-9 hidden h-7 opacity-70 sm:block"
          />
          <SepedaJatuh
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-[3%] hidden w-36 lg:block"
          />
          <KerucutJalan
            aria-hidden
            className="pointer-events-none absolute bottom-6 left-[16%] hidden w-9 lg:block"
          />
          <TongSampah
            aria-hidden
            className="pointer-events-none absolute bottom-6 right-[16%] hidden w-10 lg:block"
          />
          <Pohon
            aria-hidden
            className="pointer-events-none absolute bottom-4 right-[3%] hidden w-24 lg:block"
          />
          {papanInfo}
        </div>
      </div>
    </div>
  )
}
