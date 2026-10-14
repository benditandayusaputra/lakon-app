'use client'

import { FileText, Hand, Star } from 'lucide-react'
import { ArtMinuman, MapBerkas } from './props'
import { MENU_TES, rupiah, type MenuTes } from './types'

export function SerahkanBerkas({
  prompt,
  options,
  onPilih,
}: {
  prompt: string
  options: string[]
  onPilih: (index: number) => void
}) {
  return (
    <div className="wk-muncul flex flex-col gap-3">
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="wk-map-masuk w-full max-w-60 shrink-0 sm:w-56">
          <MapBerkas sorot className="w-full drop-shadow-lg" />
          <p className="mt-1 text-center text-xs font-bold text-[#8a6a45]">
            Berkas lamaranmu ada di meja
          </p>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-bold text-[#453419]">{prompt}</p>
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index)}
              className="wk-kartu wk-kertas rounded-kontrol border-2 border-[#c9b695] px-4 py-3 text-left font-bold shadow-md"
            >
              <FileText aria-hidden className="mr-2 inline h-4 w-4 text-[#8a6a45]" />
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PilihanMenu({
  prompt,
  options,
  onPilih,
}: {
  prompt: string
  options: string[]
  onPilih: (index: number, entri: MenuTes | undefined) => void
}) {
  return (
    <div className="wk-muncul flex flex-col gap-3">
      <p className="font-bold text-[#453419]">{prompt}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option, index) => {
          const entri = MENU_TES.find((m) => m.opsi === option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPilih(index, entri)}
              className="wk-kartu wk-kertas rounded-kartu relative flex flex-col items-center gap-1 border-2 border-[#c9b695] p-4 pt-5 text-center shadow-lg"
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
