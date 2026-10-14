'use client'

import Link from 'next/link'
import { ArrowLeft, Bus, Check, CheckCircle2, Clock3, Hand, RotateCcw } from 'lucide-react'
import { BusKota } from './props'
import { HARGA_TIKET, TUJUAN, prettify, rupiah } from './types'

export function SceneTiket({
  dikuasai,
  perluUlang,
  menit,
  jumlahLangkah,
  onUlangi,
}: {
  dikuasai: string[]
  perluUlang: string[]
  menit: number
  jumlahLangkah: number
  onUlangi: () => void
}) {
  const waktu = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center overflow-hidden px-4 pb-40 sm:px-6 sm:pb-44">
      <div
        aria-hidden
        className="relative z-20 mt-4 h-4 w-full max-w-md rounded-md bg-[#1c3a55] shadow-lg"
      >
        <span className="absolute inset-x-6 top-1/2 block h-1 -translate-y-1/2 rounded-full bg-[#0d1f2e]" />
      </div>
      <div className="kk-cetak-struk relative z-10 w-full max-w-md">
        <div className="rounded-b-kartu relative overflow-hidden bg-[#fdfefe] shadow-[0_30px_60px_-24px_rgba(13,31,46,0.6)]">
          <div className="bg-[#1c3a55] px-6 py-4 text-center">
            <Bus aria-hidden className="mx-auto h-6 w-6 text-[#ffd28a]" />
            <p className="font-display mt-1 text-xl font-black tracking-[0.2em] text-[#eef5fb]">
              TIKET BUS KOTA
            </p>
            <p className="text-xs tracking-[0.3em] text-[#8fb4d8]">HALTE LAKON · KORIDOR 1</p>
          </div>
          <span
            aria-hidden
            className="kk-stempel font-display pointer-events-none absolute right-4 top-[7.5rem] rotate-[-14deg] rounded-md border-4 border-[#33608c] px-2.5 py-1 text-base font-black tracking-[0.15em] text-[#33608c] opacity-60 sm:text-lg"
          >
            TERVALIDASI
          </span>
          <div className="px-6 py-4 font-mono text-sm text-[#12283c] sm:px-8">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#41546b]">Dari</p>
                <p className="text-base font-bold">Halte Lakon</p>
              </div>
              <p aria-hidden className="pb-1 text-lg font-black text-[#33608c]">
                ⟶
              </p>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-[#41546b]">Tujuan</p>
                <p className="text-base font-bold">{TUJUAN}</p>
              </div>
            </div>
            <div className="my-3 border-t border-dashed border-[#8fb4d8]" />
            <div className="flex justify-between gap-2">
              <span>1× Tiket dewasa</span>
              <span>{rupiah(HARGA_TIKET)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-[#41546b]">
              <span>Pembayaran</span>
              <span>KARTU · LUNAS</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-[#41546b]">
              <span>Turun di</span>
              <span>Halte ketiga · {TUJUAN}</span>
            </div>
            <p className="mt-1 text-xs text-[#41546b]">{waktu}</p>
            <div className="my-3 flex items-center gap-1" aria-hidden>
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} className="h-px flex-1 bg-[#8fb4d8]" />
              ))}
            </div>
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
            <div className="my-3 border-t border-dashed border-[#8fb4d8]" />
            <p className="flex items-center justify-between text-xs text-[#41546b]">
              <span className="flex items-center gap-1.5">
                <Clock3 aria-hidden className="h-3.5 w-3.5" />± {menit} menit
              </span>
              <span>{jumlahLangkah} langkah percakapan</span>
            </p>
            <p className="mt-3 text-center text-sm font-bold text-[#26496b]">
              Hati-hati di jalan, sampai jumpa lagi!{' '}
              <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
            </p>
            <p className="mt-1 text-center text-[10px] tracking-[0.3em] text-[#8fb4d8]">
              K1 · 03 · {TUJUAN.toUpperCase()}
            </p>
          </div>
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
          className="tombol-sekunder flex items-center gap-2 bg-white/70 font-bold"
        >
          <RotateCcw aria-hidden className="h-4 w-4" />
          Ulangi perjalanan
        </button>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[#c3ccd4]" />
        <div className="absolute inset-x-0 bottom-24 h-2.5 bg-[repeating-linear-gradient(90deg,#f2b23e_0_44px,#12283c_44px_88px)] opacity-90" />
        <BusKota datang className="absolute bottom-3 right-[4%] w-72 sm:w-96" />
        <p className="absolute bottom-8 left-[6%] hidden font-mono text-xs font-bold tracking-[0.25em] text-[#41546b] md:block">
          BUS K1 TIBA · SILAKAN NAIK
        </p>
      </div>
    </div>
  )
}
