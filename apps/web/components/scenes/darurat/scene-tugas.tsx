'use client'

import { Circle, Hand, MapPin, PhoneCall, Star } from 'lucide-react'
import { GambarKejadian, PetaLingkungan } from './props'
import {
  KARTU_KEJADIAN,
  LOKASI_KEJADIAN_INDEX,
  NOMOR_DARURAT,
  TITIK_PETA,
  type KartuKejadian,
  type NomorDarurat,
  type TitikPeta,
} from './types'

export function PilihKejadian({
  prompt,
  options,
  onPilih,
}: {
  prompt: string
  options: string[]
  onPilih: (index: number, entri: KartuKejadian | undefined) => void
}) {
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <p className="font-bold text-[#1f2d3a]">{prompt}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option, index) => {
          const entri = KARTU_KEJADIAN.find((k) => k.opsi === option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index, entri)}
              className="kk-kartu-menu dr-kertas rounded-kartu relative flex flex-col items-center gap-1 border-2 border-[#8fa3b5] p-4 pt-5 text-center shadow-lg"
            >
              <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#33465a] font-mono text-xs font-black text-white">
                {index + 1}
              </span>
              {entri ? <GambarKejadian jenis={entri.gambar} className="h-24 w-24" /> : null}
              <span className="font-display text-lg font-bold leading-tight">
                {entri?.judul ?? option}
              </span>
              {entri ? (
                <span className="text-teks-sekunder text-xs leading-snug">{entri.sub}</span>
              ) : null}
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

export function PilihLokasi({
  prompt,
  options,
  onPilih,
}: {
  prompt: string
  options: string[]
  onPilih: (index: number, entri: TitikPeta | undefined) => void
}) {
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <PetaLingkungan
        tandaiIndex={LOKASI_KEJADIAN_INDEX}
        className="mx-auto w-full max-w-lg"
        judul="PETA LINGKUNGAN · TANDA MERAH = KEJADIAN"
      />
      <p className="font-bold text-[#1f2d3a]">{prompt}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option, index) => {
          const entri = TITIK_PETA.find((t) => t.opsi === option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index, entri)}
              className="kk-kartu-menu dr-kertas rounded-kontrol flex items-center gap-2 border-2 border-[#8fa3b5] px-4 py-3 text-left text-sm font-bold shadow-md"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#33465a] text-xs font-black text-white">
                {entri?.kode ?? <MapPin aria-hidden className="h-4 w-4" />}
              </span>
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PilihNomor({
  prompt,
  options,
  onPilih,
}: {
  prompt: string
  options: string[]
  onPilih: (index: number, entri: NomorDarurat | undefined) => void
}) {
  const semuaNomor = options.every((option) => NOMOR_DARURAT.some((n) => n.opsi === option))
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <p className="font-bold text-[#1f2d3a]">{prompt}</p>
      {semuaNomor ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {options.map((option, index) => {
            const entri = NOMOR_DARURAT.find((n) => n.opsi === option)!
            return (
              <button
                key={option}
                type="button"
                onClick={() => onPilih(index, entri)}
                className="kk-kartu-menu dr-kertas rounded-kartu relative flex flex-col items-center gap-1 border-2 border-[#8fa3b5] p-4 pt-6 text-center shadow-lg"
              >
                {entri.badge ? (
                  <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#2c3a47] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    <Star aria-hidden className="h-3 w-3 fill-current" />
                    {entri.badge}
                  </span>
                ) : null}
                <span className="rounded-xl bg-[#1f2d3a] px-4 py-2 font-mono text-3xl font-black tracking-widest text-[#ffd98a] shadow-inner">
                  {entri.nomor}
                </span>
                <span className="font-display mt-1 text-lg font-bold leading-tight">
                  {entri.nama}
                </span>
                <span className="text-teks-sekunder text-xs leading-snug">{entri.sub}</span>
                <span className="text-teks-samar mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                  <Hand aria-hidden className="h-3.5 w-3.5" /> tunjuk ini
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid gap-2">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index, undefined)}
              className="kk-kartu-menu dr-kertas rounded-kontrol border-2 border-[#8fa3b5] px-4 py-3 text-left font-bold shadow-md"
            >
              <PhoneCall aria-hidden className="mr-2 inline h-4 w-4 text-[#33465a]" />
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function KartuPanggilan({
  nomor,
  nama,
  onLanjut,
}: {
  nomor: string
  nama: string
  onLanjut: () => void
}) {
  return (
    <div className="kk-muncul flex flex-col gap-3">
      <div className="rounded-kartu mx-auto w-full max-w-sm border-4 border-[#1f2d3a] bg-[#0f1a24] p-4 shadow-[0_18px_40px_-14px_rgba(15,26,36,0.8)]">
        <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[#7fd4ff]">
          <span>Telepon pos · memanggil</span>
          <Circle
            aria-hidden
            className="pk-led-kedip inline-block h-[0.6em] w-[0.6em] fill-current"
          />
        </p>
        <div className="my-3 flex items-center gap-4">
          <span className="dr-cincin relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#3e8e5e] text-white">
            <PhoneCall aria-hidden className="h-6 w-6" />
          </span>
          <div>
            <p className="font-mono text-3xl font-black tracking-widest text-[#ffd98a]">{nomor}</p>
            <p className="text-sm font-bold text-[#cfe9ff]">{nama}</p>
          </div>
        </div>
        <div className="flex items-end gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="dr-gelombang block w-2 rounded-sm bg-[#5fd0a4]"
              style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
          <span className="ml-2 font-mono text-xs text-[#7fd4ff]">tersambung…</span>
        </div>
      </div>
      <p className="text-sm font-bold text-[#1f2d3a]">
        Warga menelepon di depanmu. Kamu bisa melihat nomor yang dihubungi.
      </p>
      <button type="button" onClick={onLanjut} className="tombol-cta self-start">
        <PhoneCall aria-hidden className="h-5 w-5" />
        Bantuan sudah dipanggil, lanjut
      </button>
    </div>
  )
}
