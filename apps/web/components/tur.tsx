'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { posisiKartu } from '@/features/ui/tur-posisi'

export type LangkahTur = { target: string; judul: string; isi: string }

export type TeksTur = {
  label: string
  lanjut: string
  kembali: string
  selesai: string
  lewati: string
  urutan: (ke: number, total: number) => string
}

const CELAH_SOROT = 8

export function Tur({
  langkah,
  buka,
  onTutup,
  teks,
}: {
  langkah: LangkahTur[]
  buka: boolean
  onTutup: () => void
  teks: TeksTur
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const sorotRef = useRef<HTMLDivElement>(null)
  const kartuRef = useRef<HTMLDivElement>(null)
  const utamaRef = useRef<HTMLButtonElement>(null)
  const [indeks, setIndeks] = useState(0)
  const sekarang = langkah[indeks]

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (buka && !dialog.open) {
      setIndeks(0)
      dialog.showModal()
      utamaRef.current?.focus()
    } else if (!buka && dialog.open) {
      dialog.close()
    }
  }, [buka])

  const ukur = useCallback(() => {
    const target = document.querySelector(`[data-tur="${sekarang?.target}"]`)
    const sorot = sorotRef.current
    const kartu = kartuRef.current
    if (!target || !sorot || !kartu) return
    const kotak = target.getBoundingClientRect()
    sorot.style.top = `${kotak.top - CELAH_SOROT}px`
    sorot.style.left = `${kotak.left - CELAH_SOROT}px`
    sorot.style.width = `${kotak.width + CELAH_SOROT * 2}px`
    sorot.style.height = `${kotak.height + CELAH_SOROT * 2}px`
    const { top, left } = posisiKartu(
      kotak,
      { width: kartu.offsetWidth, height: kartu.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    )
    kartu.style.top = `${top}px`
    kartu.style.left = `${left}px`
  }, [sekarang])

  useLayoutEffect(() => {
    if (!buka || !sekarang) return
    const gerakHalus = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .querySelector(`[data-tur="${sekarang.target}"]`)
      ?.scrollIntoView({ block: 'center', behavior: gerakHalus ? 'smooth' : 'auto' })
    ukur()
    let bingkai = 0
    const jadwalkan = () => {
      cancelAnimationFrame(bingkai)
      bingkai = requestAnimationFrame(ukur)
    }
    window.addEventListener('scroll', jadwalkan, { passive: true })
    window.addEventListener('resize', jadwalkan)
    return () => {
      cancelAnimationFrame(bingkai)
      window.removeEventListener('scroll', jadwalkan)
      window.removeEventListener('resize', jadwalkan)
    }
  }, [buka, sekarang, ukur])

  const terakhir = indeks === langkah.length - 1

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="tur-judul"
      aria-describedby="tur-isi"
      onClose={onTutup}
      className="m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
    >
      {buka && sekarang ? (
        <>
          <div ref={sorotRef} aria-hidden className="tur-sorot" />
          <div
            ref={kartuRef}
            className="tur-kartu bg-kartu text-teks rounded-kartu fixed w-[min(22rem,calc(100vw-2rem))] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-primary font-mono text-xs font-bold uppercase tracking-wider">
                {teks.urutan(indeks + 1, langkah.length)}
              </p>
              <button
                type="button"
                onClick={onTutup}
                aria-label={teks.lewati}
                className="text-teks-sekunder hover:text-teks -m-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              >
                <X aria-hidden size={18} />
              </button>
            </div>
            <h2 id="tur-judul" className="font-display -mt-1 text-xl font-semibold">
              {sekarang.judul}
            </h2>
            <p id="tur-isi" className="text-teks-sekunder mt-1.5 text-sm leading-relaxed">
              {sekarang.isi}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div aria-hidden className="flex gap-1.5">
                {langkah.map((item, i) => (
                  <span
                    key={item.target}
                    className={`h-1.5 rounded-full transition-all ${
                      i === indeks ? 'bg-primary w-5' : 'bg-border-halus w-1.5'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {indeks > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIndeks(indeks - 1)}
                    className="border-border-tegas rounded-kontrol min-h-11 border px-3.5 text-sm font-semibold"
                  >
                    {teks.kembali}
                  </button>
                ) : null}
                <button
                  ref={utamaRef}
                  type="button"
                  onClick={() => (terakhir ? onTutup() : setIndeks(indeks + 1))}
                  className="bg-primary hover:bg-primary-hover rounded-kontrol min-h-11 px-4 text-sm font-bold text-white"
                >
                  {terakhir ? teks.selesai : teks.lanjut}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  )
}
