'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Hand,
  RotateCcw,
  Siren,
} from 'lucide-react'
import { Ambulans } from './props'
import { KARTU_KEJADIAN, NOMOR_DARURAT, TITIK_PETA, prettify, type Laporan } from './types'

export function SceneLaporan({
  laporan,
  dikuasai,
  perluUlang,
  menit,
  jumlahLangkah,
  onUlangi,
}: {
  laporan: Laporan
  dikuasai: string[]
  perluUlang: string[]
  menit: number
  jumlahLangkah: number
  onUlangi: () => void
}) {
  const kejadian = laporan.kejadian ?? KARTU_KEJADIAN[1]!
  const lokasi = laporan.lokasi ?? TITIK_PETA[1]!
  const pihak = laporan.pihak ?? NOMOR_DARURAT[0]!
  const waktu = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-14 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none relative h-28 w-full max-w-3xl overflow-hidden sm:h-36"
      >
        <div className="dr-jalan absolute inset-x-0 bottom-0 h-10 rounded-t-lg sm:h-12" />
        <div className="dr-zebra absolute bottom-3 left-[14%] h-5 w-[22%] opacity-70" />
        <Ambulans className="dr-ambulans-datang absolute bottom-2 right-[4%] w-56 sm:w-72" />
      </div>

      <div className="dr-klip relative z-10 w-full max-w-md">
        <div
          aria-hidden
          className="absolute -top-3 left-1/2 z-20 h-7 w-24 -translate-x-1/2 rounded-md bg-[#33465a] shadow-md"
        >
          <span className="absolute inset-x-6 top-1/2 block h-1.5 -translate-y-1/2 rounded-full bg-[#1f2d3a]" />
        </div>
        <div className="kk-muncul rounded-kartu text-teks relative overflow-hidden bg-[#fbfcfd] px-6 pb-6 pt-8 font-mono text-sm shadow-[0_30px_60px_-24px_rgba(31,45,58,0.7)] sm:px-8">
          <span
            aria-hidden
            className="kk-stempel font-display border-berhasil text-berhasil pointer-events-none absolute right-4 top-[4.5rem] rotate-[-12deg] rounded-md border-4 px-3 py-1 text-lg font-black tracking-[0.2em] opacity-60"
          >
            DITANGANI
          </span>
          <div className="text-center">
            <Siren aria-hidden className="mx-auto h-7 w-7 text-[#33465a]" />
            <p className="font-display mt-1 text-xl font-black tracking-[0.2em]">
              LAPORAN KEJADIAN
            </p>
            <p className="text-teks-sekunder mt-0.5 text-xs">
              Pos Siaga Warga RW 05 · ramah isyarat
            </p>
            <p className="text-teks-sekunder text-xs">Jl. Kenanga Raya, Jakarta</p>
            <p className="text-teks-sekunder mt-1 text-xs">{waktu}</p>
          </div>
          <div className="border-border-tegas my-3 border-t border-dashed" />
          <dl className="space-y-1.5">
            <div className="flex justify-between gap-3">
              <dt className="text-teks-sekunder">Kejadian</dt>
              <dd className="text-right font-bold">{kejadian.judul}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-teks-sekunder">Lokasi</dt>
              <dd className="text-right font-bold">{lokasi.opsi}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-teks-sekunder">Keluhan</dt>
              <dd className="text-right font-bold">Sakit di tangan</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-teks-sekunder">Bantuan</dt>
              <dd className="text-right font-bold">
                {pihak.nama} · {pihak.nomor}
              </dd>
            </div>
          </dl>
          <div className="border-border-tegas my-3 border-t border-dashed" />
          <p className="text-berhasil text-xs font-bold uppercase tracking-widest">
            <Check aria-hidden className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom" />
            Isyarat dikuasai
          </p>
          <ul className="mt-1 space-y-0.5 capitalize">
            {dikuasai.length > 0 ? (
              dikuasai.map((sign) => (
                <li key={sign} className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden className="text-berhasil h-3.5 w-3.5" />
                  {prettify(sign)}
                </li>
              ))
            ) : (
              <li>tidak ada</li>
            )}
          </ul>
          <p className="text-ulang mt-3 text-xs font-bold uppercase tracking-widest">
            <RotateCcw
              aria-hidden
              className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
            />
            Perlu diulang
          </p>
          <ul className="mt-1 space-y-0.5 capitalize">
            {perluUlang.length > 0 ? (
              perluUlang.map((sign) => (
                <li key={sign} className="flex items-center gap-2">
                  <RotateCcw aria-hidden className="text-ulang h-3.5 w-3.5" />
                  {prettify(sign)}
                </li>
              ))
            ) : (
              <li>tidak ada</li>
            )}
          </ul>
          <div className="border-border-tegas my-3 border-t border-dashed" />
          <p className="text-teks-sekunder flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5">
              <Clock3 aria-hidden className="h-3.5 w-3.5" />± {menit} menit
            </span>
            <span>{jumlahLangkah} langkah percakapan</span>
          </p>
          <p className="kk-font-kapur mt-4 text-center text-xl text-[#33465a]">
            Bantuan datang. Kamu sudah bisa minta tolong dengan tenang{' '}
            <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
          </p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#8fa3b5]">
            <ClipboardCheck aria-hidden className="h-3.5 w-3.5" /> petugas jaga · RW 05
          </p>
        </div>
      </div>
      <div
        className="kk-muncul z-10 mt-8 flex flex-wrap justify-center gap-3"
        style={{ animationDelay: '900ms' }}
      >
        <Link href="/skenario" className="tombol-cta">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Kembali ke skenario
        </Link>
        <button
          type="button"
          onClick={onUlangi}
          className="tombol-sekunder inline-flex items-center gap-2 bg-white/70"
        >
          <RotateCcw aria-hidden className="h-4 w-4" />
          Ulangi simulasi
        </button>
      </div>
    </div>
  )
}
