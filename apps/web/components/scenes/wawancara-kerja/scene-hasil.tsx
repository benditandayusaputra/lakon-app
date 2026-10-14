'use client'

import Link from 'next/link'
import { ArrowLeft, Check, CheckCircle2, Clock3, Coffee, Hand, RotateCcw } from 'lucide-react'
import { CangkirSaji } from './props'
import { prettify, rupiah, type MenuTes } from './types'

export function SceneHasil({
  nama,
  pilihanMenu,
  dikuasai,
  perluUlang,
  menit,
  jumlahLangkah,
  onUlangi,
}: {
  nama: string
  pilihanMenu: MenuTes | null
  dikuasai: string[]
  perluUlang: string[]
  menit: number
  jumlahLangkah: number
  onUlangi: () => void
}) {
  const diterima = perluUlang.length === 0
  const inisial = nama
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata.charAt(0).toUpperCase())
    .join('')
  const waktu = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-14 sm:px-6">
      <div aria-hidden className="relative z-0 h-14 w-full max-w-md sm:h-16">
        <span className="absolute left-1/2 top-0 h-full w-7 -translate-x-1/2 bg-[repeating-linear-gradient(180deg,#b4632c_0_10px,#8a4526_10px_20px)] shadow-md" />
        <span className="absolute bottom-0 left-1/2 h-4 w-10 -translate-x-1/2 rounded-sm bg-[#8a8378]" />
      </div>

      <div className="wk-jatuh-badge relative z-10 w-full max-w-md">
        <div className="rounded-kartu relative overflow-hidden border-4 border-[#453419] bg-[#fdf9f0] shadow-[0_30px_60px_-24px_rgba(69,52,25,0.6)]">
          <div className="bg-[#b4632c] px-6 py-3 text-center text-[#fdf6e3]">
            <p className="font-display flex items-center justify-center gap-2 text-xl font-black tracking-[0.2em]">
              <Coffee aria-hidden className="h-5 w-5" />
              KOPI LAKON
            </p>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#ffe9b8]">
              kartu hasil wawancara barista
            </p>
          </div>

          <div className="text-teks relative px-6 py-5 font-mono text-sm sm:px-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#c9b695] bg-[#f3e6d0] text-xl font-black text-[#8a6a45] sm:h-16 sm:w-16 sm:text-2xl">
                {inisial || 'P'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-widest text-[#8a6a45]">Pelamar</p>
                <p className="font-display break-words text-xl font-bold leading-tight sm:text-2xl">
                  {nama}
                </p>
                <p className="text-teks-sekunder text-xs">posisi: barista</p>
              </div>
              <span
                aria-hidden
                className="wk-stempel font-display border-berhasil text-berhasil pointer-events-none shrink-0 rotate-[-12deg] rounded-md border-4 px-2 py-0.5 text-sm font-black tracking-[0.12em] opacity-85 sm:px-3 sm:py-1 sm:text-base"
              >
                {diterima ? 'DITERIMA' : 'SELESAI'}
              </span>
            </div>
            <p className="sr-only">
              {diterima ? 'Status: diterima magang' : 'Status: wawancara selesai'}
            </p>
            <p className="text-teks-sekunder mt-2 text-xs">{waktu}</p>
            <div className="border-border-tegas my-3 border-t border-dashed" />
            <div className="flex justify-between gap-2">
              <span className="shrink-0">Tes menu</span>
              <span className="text-right">
                {pilihanMenu
                  ? `${pilihanMenu.nama} · ${rupiah(pilihanMenu.harga)}`
                  : 'belum ditunjuk'}
              </span>
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
                <li className="normal-case">tidak ada</li>
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
                <li className="normal-case">tidak ada</li>
              )}
            </ul>
            <div className="border-border-tegas my-3 border-t border-dashed" />
            <p className="text-teks-sekunder flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Clock3 aria-hidden className="h-3.5 w-3.5" />± {menit} menit
              </span>
              <span>{jumlahLangkah} langkah wawancara</span>
            </p>
            <p className="wk-font-kapur mt-4 text-center text-xl text-[#6b4226]">
              {diterima ? (
                <>
                  Selamat datang di tim Kopi Lakon!{' '}
                  <Coffee aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
                </>
              ) : (
                <>
                  Terima kasih sudah datang, latihan lagi ya!{' '}
                  <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
                </>
              )}
            </p>
          </div>
        </div>
        <CangkirSaji
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-6 hidden w-20 lg:block"
        />
        <p className="pointer-events-none absolute -right-28 bottom-0 hidden w-28 text-center text-xs font-bold text-[#8a6a45] lg:block">
          kopi sambutan dari kepala barista
        </p>
      </div>

      <div
        className="wk-muncul z-10 mt-8 flex flex-wrap justify-center gap-3"
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
          Ulangi wawancara
        </button>
      </div>
    </div>
  )
}
