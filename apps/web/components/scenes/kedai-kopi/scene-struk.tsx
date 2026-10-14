'use client'

import Link from 'next/link'
import { ArrowLeft, Check, CheckCircle2, Clock3, Coffee, Hand, RotateCcw } from 'lucide-react'
import { LampuTali } from './props'
import { MENU_UTAMA, prettify, rupiah, type MenuKedai } from './types'

export function SceneStruk({
  pesanan,
  dikuasai,
  perluUlang,
  menit,
  jumlahLangkah,
  onUlangi,
}: {
  pesanan: MenuKedai | null
  dikuasai: string[]
  perluUlang: string[]
  menit: number
  jumlahLangkah: number
  onUlangi: () => void
}) {
  const item = pesanan ?? MENU_UTAMA[0]!
  const waktu = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-14 sm:px-6">
      <LampuTali
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-7 w-full opacity-80"
      />
      <div
        aria-hidden
        className="kk-kayu-gelap relative z-20 mt-4 h-4 w-full max-w-md rounded-md shadow-lg"
      >
        <span className="absolute inset-x-6 top-1/2 block h-1 -translate-y-1/2 rounded-full bg-[#1d120a]" />
      </div>
      <div className="kk-cetak-struk relative z-10 w-full max-w-md">
        <div className="kk-gerigi-atas rotate-180" aria-hidden />
        <div className="text-teks relative overflow-hidden bg-[#fdfbf3] px-6 py-6 font-mono text-sm shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] sm:px-8">
          <span
            aria-hidden
            className="kk-stempel font-display border-berhasil text-berhasil pointer-events-none absolute right-5 top-24 rotate-[-14deg] rounded-md border-4 px-3 py-1 text-xl font-black tracking-[0.2em] opacity-80"
          >
            LUNAS
          </span>
          <div className="text-center">
            <Coffee aria-hidden className="mx-auto h-7 w-7 text-[#6b4226]" />
            <p className="font-display mt-1 text-xl font-black tracking-[0.2em]">KOPI LAKON</p>
            <p className="text-teks-sekunder mt-0.5 text-xs">Kedai kopi ramah isyarat</p>
            <p className="text-teks-sekunder text-xs">Jl. Cikini Raya No. 5, Jakarta</p>
            <p className="text-teks-sekunder mt-1 text-xs">{waktu}</p>
          </div>
          <div className="border-border-tegas my-3 border-t border-dashed" />
          <div className="flex justify-between gap-2">
            <span>1× {item.nama} (Panas)</span>
            <span>{rupiah(item.harga)}</span>
          </div>
          <div className="border-border-tegas my-3 border-t border-dashed" />
          <div className="flex justify-between text-base font-bold">
            <span>TOTAL</span>
            <span>{rupiah(item.harga)}</span>
          </div>
          <div className="text-teks-sekunder mt-1 flex justify-between text-xs">
            <span>Pembayaran</span>
            <span>QRIS · LUNAS</span>
          </div>
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
          <p className="kk-font-kapur mt-4 text-center text-xl text-[#6b4226]">
            Terima kasih, sampai jumpa lagi!{' '}
            <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
          </p>
          <p className="text-teks-samar mt-1 text-center text-[10px] tracking-[0.3em]">
            * * * * * * * * * * * *
          </p>
        </div>
        <div className="kk-gerigi-bawah" aria-hidden />
      </div>
      <div
        className="kk-muncul z-10 mt-8 flex flex-wrap justify-center gap-3"
        style={{ animationDelay: '900ms' }}
      >
        <Link href="/skenario" className="tombol-cta">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Kembali ke skenario
        </Link>
        <button type="button" onClick={onUlangi} className="tombol-garis-terang">
          <RotateCcw aria-hidden className="h-4 w-4" />
          Ulangi kunjungan
        </button>
      </div>
    </div>
  )
}
