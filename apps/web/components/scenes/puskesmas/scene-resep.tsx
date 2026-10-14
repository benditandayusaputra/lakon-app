'use client'

import Link from 'next/link'
import { ArrowLeft, Check, CheckCircle2, Clock3, Hand, RotateCcw } from 'lucide-react'

const prettify = (id: string) => id.replace(/-/g, ' ')

export function SceneResepPuskesmas({
  dikuasai,
  perluDiulang,
  menit,
  langkah,
  onUlangi,
}: {
  dikuasai: string[]
  perluDiulang: string[]
  menit: number
  langkah: number
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
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-14 sm:px-6">
      <div className="kk-muncul relative z-10 mt-6 w-full max-w-md">
        <div className="text-teks rounded-md bg-white px-6 py-6 text-sm shadow-[0_30px_60px_-24px_rgba(29,68,47,0.55)] sm:px-8">
          <div className="flex items-center gap-3 border-b-4 border-double border-[#2f7d52] pb-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2f7d52]">
              <svg viewBox="0 0 40 40" width="22" height="22" aria-hidden>
                <rect x="4" y="15" width="32" height="10" rx="3" fill="#ffffff" />
                <rect x="15" y="4" width="10" height="32" rx="3" fill="#ffffff" />
              </svg>
            </span>
            <div>
              <p className="font-display text-lg font-black leading-tight text-[#1d442f]">
                PUSKESMAS HARAPAN SEHAT
              </p>
              <p className="text-teks-sekunder text-xs">Poli Umum · Jl. Melati No. 3, Jakarta</p>
            </div>
          </div>

          <div className="text-teks-sekunder mt-3 flex justify-between font-mono text-xs">
            <span>Pasien: peserta Lakon</span>
            <span>{waktu}</span>
          </div>

          <p className="font-display mt-4 text-3xl font-black italic text-[#1d442f]" aria-hidden>
            R/
          </p>
          <div className="kk-font-kapur mt-1 space-y-1 border-b border-dashed border-[#9dbfa9] pb-3 text-xl leading-snug text-[#2b3a2e]">
            <p>Parasetamol 500 mg — No. X</p>
            <p>S 3 dd 1, sesudah makan</p>
            <p className="text-teks-sekunder text-lg">Istirahat cukup, banyak minum air.</p>
          </div>

          <p className="text-berhasil mt-4 text-xs font-bold uppercase tracking-widest">
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
            {perluDiulang.length > 0 ? (
              perluDiulang.map((sign) => (
                <li key={sign} className="flex items-center gap-2">
                  <RotateCcw aria-hidden className="text-ulang h-3.5 w-3.5" />
                  {prettify(sign)}
                </li>
              ))
            ) : (
              <li>tidak ada</li>
            )}
          </ul>

          <div className="mt-4 flex items-end justify-between border-t border-dashed border-[#9dbfa9] pt-3">
            <p className="text-teks-sekunder flex items-center gap-1.5 text-xs">
              <Clock3 aria-hidden className="h-3.5 w-3.5" />± {menit} menit · {langkah} langkah
            </p>
            <div className="text-center">
              <div
                aria-hidden
                className="mx-auto flex h-16 w-16 -rotate-12 items-center justify-center rounded-full border-[3px] border-[#2f7d52]/70 text-center"
              >
                <p className="text-[8px] font-black uppercase leading-tight text-[#2f7d52]/70">
                  Puskesmas
                  <br />
                  Harapan
                  <br />
                  Sehat
                </p>
              </div>
              <p className="kk-font-kapur mt-1 text-lg leading-none text-[#1d442f]">dr. Lakon</p>
            </div>
          </div>
          <p className="kk-font-kapur mt-3 text-center text-xl text-[#2f7d52]">
            Semoga lekas sembuh!{' '}
            <Hand aria-hidden className="inline-block h-[1em] w-[1em] align-text-bottom" />
          </p>
        </div>
      </div>

      <div
        className="kk-muncul z-10 mt-8 flex flex-wrap justify-center gap-3"
        style={{ animationDelay: '160ms' }}
      >
        <Link href="/skenario" className="tombol-cta">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Kembali ke skenario
        </Link>
        <button type="button" onClick={onUlangi} className="tombol-sekunder bg-kartu">
          <RotateCcw aria-hidden className="h-4 w-4" />
          Ulangi kunjungan
        </button>
      </div>
    </div>
  )
}
