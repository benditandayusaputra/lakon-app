import { Check } from 'lucide-react'
import { Pejalan } from '@/components/pejalan'

export type Gender = 'perempuan' | 'laki-laki' | null

const PILIHAN = [
  { nilai: 'perempuan', karakter: 'perempuan', label: 'Perempuan', keterangan: null },
  { nilai: 'laki-laki', karakter: 'laki-laki', label: 'Laki-laki', keterangan: null },
  { nilai: null, karakter: 'robot', label: 'Robot', keterangan: 'Tidak memberi tahu' },
] as const

export function PilihKarakter({
  nama,
  nilai,
  onPilih,
  disabled = false,
}: {
  nama: string
  nilai: Gender
  onPilih: (nilai: Gender) => void
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Karakter di peta perjalanan"
      className="grid grid-cols-3 gap-2.5"
    >
      {PILIHAN.map((pilihan) => {
        const aktif = nilai === pilihan.nilai
        return (
          <label
            key={pilihan.label}
            className={`rounded-kartu relative flex min-w-0 cursor-pointer flex-col items-center gap-1.5 border-2 px-1.5 pb-3 pt-2 text-center transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${
              aktif
                ? 'border-primary bg-primary-tint'
                : 'border-border-halus bg-kartu hover:border-border-tegas'
            }`}
          >
            <input
              type="radio"
              name={nama}
              checked={aktif}
              disabled={disabled}
              onChange={() => onPilih(pilihan.nilai)}
              className="sr-only"
            />
            {aktif ? (
              <span
                aria-hidden
                className="bg-primary absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white"
              >
                <Check size={13} strokeWidth={3} />
              </span>
            ) : null}
            <svg aria-hidden viewBox="-24 -40 48 92" className="h-16 w-10">
              <Pejalan karakter={pilihan.karakter} berjalan={aktif} />
            </svg>
            <span className="text-sm font-bold leading-tight">{pilihan.label}</span>
            {pilihan.keterangan ? (
              <span className="text-teks-samar -mt-1 text-[0.7rem] leading-tight">
                {pilihan.keterangan}
              </span>
            ) : null}
          </label>
        )
      })}
    </div>
  )
}
