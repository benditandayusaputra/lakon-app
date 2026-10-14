'use client'

import { Circle, CreditCard, Hand, MapPin } from 'lucide-react'
import { AlatTap, JariAngka, PetaRute } from './props'
import { HALTE_RUTE, HARGA_TIKET, TUJUAN, rupiah } from './types'

export function PilihTujuan({
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
      <PetaRute className="mx-auto w-full max-w-lg" />
      <p className="font-bold text-[#12283c]">{prompt}</p>
      <p className="w-fit rounded-full bg-[#e4edf5] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#1c3a55]">
        Tujuan perjalanan: {TUJUAN}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option, index) => {
          const halte = HALTE_RUTE.find((h) => h.nama === option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index)}
              className="kk-kartu-menu tp-kertas rounded-kartu flex flex-col items-center gap-1.5 border-2 border-[#8fb4d8] p-4 text-center shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c3a55] font-mono text-sm font-black text-[#ffd28a]">
                {halte?.kode ?? '—'}
              </span>
              <span className="font-display text-lg font-bold leading-tight">{option}</span>
              <span className="text-teks-sekunder flex items-center gap-1 text-xs">
                <MapPin aria-hidden className="h-3.5 w-3.5" /> koridor 1
              </span>
              <span className="text-teks-samar mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <Hand aria-hidden className="h-3.5 w-3.5" /> tunjuk ini
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PilihJumlah({
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
      <p className="font-bold text-[#12283c]">{prompt}</p>
      <p className="w-fit rounded-full bg-[#e4edf5] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#1c3a55]">
        Jumlah penumpang: 1 orang
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option, index) => {
          const jumlah = (Number.parseInt(option, 10) || 1) as 1 | 2 | 3
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index)}
              className="kk-kartu-menu tp-kertas rounded-kartu flex flex-col items-center gap-1 border-2 border-[#8fb4d8] p-4 text-center shadow-lg"
            >
              <JariAngka jumlah={jumlah} className="h-20 w-20" />
              <span className="font-display text-lg font-bold">{option}</span>
              <span className="mt-1 rounded-full bg-[#1c3a55] px-3 py-0.5 text-sm font-bold text-[#eef5fb]">
                {rupiah(HARGA_TIKET * jumlah)}
              </span>
              <span className="text-teks-samar mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <Hand aria-hidden className="h-3.5 w-3.5" /> tunjuk ini
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function LayarLoketHarga({
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
      <div className="rounded-kartu mx-auto w-full max-w-sm border-4 border-[#0d1f2e] bg-[#0d1f2e] p-4 shadow-[0_18px_40px_-14px_rgba(13,31,46,0.7)]">
        <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[#7fd4ff]">
          <span>Loket 1 · Halte Lakon</span>
          <Circle
            aria-hidden
            className="pk-led-kedip inline-block h-[0.6em] w-[0.6em] fill-current"
          />
        </p>
        <div className="my-2 border-t border-dashed border-[#26496b]" />
        <p className="flex justify-between font-mono text-sm text-[#cfe9ff]">
          <span>1× Tiket K1 · {TUJUAN}</span>
          <span>{HARGA_TIKET.toLocaleString('id-ID')}</span>
        </p>
        <div className="my-2 border-t border-dashed border-[#26496b]" />
        <p className="flex items-baseline justify-between font-mono text-[#7fd4ff]">
          <span className="text-xs uppercase tracking-widest">Total</span>
          <span className="text-2xl font-bold text-[#b8ecff]">{rupiah(HARGA_TIKET)}</span>
        </p>
      </div>
      <p className="font-bold text-[#12283c]">{prompt}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => onPilih(index)}
            className={`kk-kartu-menu tp-kertas rounded-kontrol border-2 border-[#8fb4d8] px-4 py-3 font-bold shadow-md ${
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

export function BayarTap({
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
        <div className="tp-kertas w-40 shrink-0 -rotate-1 rounded-xl border-2 border-[#8fb4d8] p-2 shadow-lg">
          <AlatTap className="mx-auto w-28" />
          <p className="text-center text-[10px] font-bold text-[#41546b]">
            Tempelkan kartu di alat ini
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-bold text-[#12283c]">{prompt}</p>
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index)}
              className="kk-kartu-menu tp-kertas rounded-kontrol border-2 border-[#8fb4d8] px-4 py-3 text-left font-bold shadow-md"
            >
              <CreditCard aria-hidden className="mr-2 inline h-4 w-4 text-[#33608c]" />
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PilihTurun({
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
      <PetaRute
        tandaiIndex={2}
        className="mx-auto w-full max-w-lg"
        judul="PETA RUTE · TITIK TURUNMU"
      />
      <p className="font-bold text-[#12283c]">{prompt}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            onClick={() => onPilih(index)}
            className="kk-kartu-menu tp-kertas rounded-kontrol border-2 border-[#8fb4d8] px-4 py-3 text-left text-sm font-bold shadow-md"
          >
            <MapPin aria-hidden className="mr-2 inline h-4 w-4 text-[#33608c]" />
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
