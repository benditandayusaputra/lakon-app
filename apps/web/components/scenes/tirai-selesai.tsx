'use client'

import { useEffect, useState } from 'react'
import { PartyPopper } from 'lucide-react'

const KILAU = [8, 20, 33, 47, 58, 71, 84, 92]

export function TiraiSelesai({
  judul,
  pesan,
  dikuasai,
  menit,
  onSelesai,
  aksen = '#8cc8ff',
}: {
  judul: string
  pesan: string
  dikuasai: number
  menit: number
  onSelesai: () => void
  aksen?: string
}) {
  const [sisa, setSisa] = useState(3)

  useEffect(() => {
    const cepat =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (cepat) {
      setSisa(0)
      return
    }
    const timer = window.setInterval(() => setSisa((nilai) => Math.max(0, nilai - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (sisa === 0) onSelesai()
  }, [sisa, onSelesai])

  return (
    <div
      role="status"
      className="tirai-selesai fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-6 text-center text-[#f6efe4]"
    >
      <div
        aria-hidden
        className="tirai-kilau pointer-events-none absolute inset-x-0 bottom-1/3 h-40"
      >
        {KILAU.map((kiri, index) => (
          <span
            key={kiri}
            className="absolute block h-2.5 w-2.5 rounded-sm"
            style={{
              left: `${kiri}%`,
              backgroundColor: index % 2 === 0 ? aksen : '#f6efe4',
              animationDelay: `${index * 140}ms`,
            }}
          />
        ))}
      </div>

      <span
        className="tirai-lencana flex h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: aksen, color: '#17120d' }}
      >
        <PartyPopper aria-hidden className="h-11 w-11" />
      </span>
      <h2 className="font-display text-balance text-4xl font-semibold">{judul}</h2>
      <p className="max-w-md text-pretty text-lg text-[#f6efe4]/80">{pesan}</p>
      <p className="font-mono text-sm text-[#f6efe4]/70">
        {dikuasai} isyarat dikuasai · ± {menit} menit
      </p>
      <button type="button" autoFocus onClick={onSelesai} className="tombol-cta mt-2">
        Lihat ringkasan {sisa > 0 ? `(${sisa})` : ''}
      </button>
    </div>
  )
}
