'use client'

import { Circle, Hand, QrCode, Star } from 'lucide-react'
import { ArtMinuman, KartuQris } from './props'
import { MENU_UTAMA, rupiah, type MenuKedai } from './types'

export function PilihanMenu({
  prompt,
  options,
  ditunjuk,
  catatan,
  onPilih,
}: {
  prompt: string
  options: string[]
  ditunjuk?: number
  catatan?: string
  onPilih: (index: number, entri: MenuKedai | undefined) => void
}) {
  const otomatis = ditunjuk !== undefined
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <p aria-live="polite" className="font-bold text-[#f5e9d7]">
        {prompt}
      </p>
      {catatan ? (
        <p className="bg-sorot w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-[#2b1a0e]">
          {catatan}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option, index) => {
          const entri = MENU_UTAMA.find((m) => m.opsi === option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index, entri)}
              disabled={otomatis}
              className={`kk-kartu-menu rounded-kartu relative flex flex-col items-center gap-1 border-2 p-4 pt-5 text-center transition ${
                ditunjuk === index
                  ? 'border-primary bg-primary-tint shadow-kartu-angkat scale-105'
                  : otomatis && ditunjuk !== -1
                    ? 'border-border-halus bg-kartu shadow-kartu opacity-50'
                    : 'border-border-halus bg-kartu shadow-kartu'
              }`}
            >
              {entri?.badge ? (
                <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#b4632c] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#fdf6ea] shadow-md">
                  <Star aria-hidden className="h-3 w-3 fill-current" />
                  {entri.badge}
                </span>
              ) : null}
              <ArtMinuman jenis={option} className="h-24 w-24" />
              <span className="font-display text-lg font-bold leading-tight">
                {entri?.nama ?? option}
              </span>
              {entri ? (
                <span className="text-teks-sekunder text-xs leading-snug">{entri.sub}</span>
              ) : null}
              <span className="mt-1 rounded-full bg-[#6b4226] px-3 py-0.5 text-sm font-bold text-[#f8efdf]">
                {entri ? rupiah(entri.harga) : ''}
              </span>
              {ditunjuk === index ? (
                <span className="text-primary mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                  <Hand aria-hidden className="h-3.5 w-3.5 motion-safe:animate-bounce" /> ditunjuk
                  pelanggan
                </span>
              ) : otomatis ? null : (
                <span className="text-teks-samar mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                  <Hand aria-hidden className="h-3.5 w-3.5" /> tunjuk ini
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function LayarKasir({
  prompt,
  options,
  pesanan,
  onPilih,
}: {
  prompt: string
  options: string[]
  pesanan: MenuKedai | null
  onPilih: (index: number) => void
}) {
  const item = pesanan ?? MENU_UTAMA[0]!
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <div className="rounded-kartu mx-auto w-full max-w-sm border-4 border-[#241811] bg-[#101a12] p-4 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)]">
        <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[#7dbb8f]">
          <span>Kasir · Kopi Lakon</span>
          <Circle
            aria-hidden
            className="kk-lampu-nyala inline-block h-[0.6em] w-[0.6em] fill-current"
          />
        </p>
        <div className="my-2 border-t border-dashed border-[#2e4a36]" />
        <p className="flex justify-between font-mono text-sm text-[#c9e8d2]">
          <span>1× {item.nama} (Panas)</span>
          <span>{item.harga.toLocaleString('id-ID')}</span>
        </p>
        <div className="my-2 border-t border-dashed border-[#2e4a36]" />
        <p className="flex items-baseline justify-between font-mono text-[#7dbb8f]">
          <span className="text-xs uppercase tracking-widest">Total</span>
          <span className="text-2xl font-bold text-[#b7f0c6]">{rupiah(item.harga)}</span>
        </p>
      </div>
      <p className="font-bold text-[#f5e9d7]">{prompt}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => onPilih(index)}
            className={`kk-kartu-menu rounded-kontrol border-border-halus bg-kartu min-h-12 border-2 px-4 py-3 font-bold shadow-md ${
              option.startsWith('Rp') ? 'font-mono text-lg' : 'text-left text-sm'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export function BayarQris({
  prompt,
  options,
  onPilih,
}: {
  prompt: string
  options: string[]
  onPilih: (index: number) => void
}) {
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <KartuQris className="w-40 shrink-0 -rotate-1" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-bold text-[#f5e9d7]">{prompt}</p>
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index)}
              className="kk-kartu-menu rounded-kontrol border-border-halus bg-kartu min-h-12 border-2 px-4 py-3 text-left font-bold shadow-md"
            >
              <QrCode aria-hidden className="mr-2 inline h-4 w-4 text-[#6b4226]" />
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
