'use client'

import { ArrowRight, Check, Eye, RotateCcw, SkipForward } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ScenarioEngine } from '@/features/scenario/engine'

const ikon = 'inline-block h-[1em] w-[1em] align-text-bottom'

export function UmpanJawab({
  benar,
  jawaban,
  pesanSalah = 'Masih belum sesuai. Coba lagi, atau lewati dan lihat jawabannya.',
  onLanjut,
  onCobaLagi,
  onLewati,
}: {
  benar: boolean
  jawaban?: string
  pesanSalah?: string
  onLanjut?: () => void
  onCobaLagi: () => void
  onLewati?: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const judulId = useId()
  const pesanId = useId()
  const [dilewati, setDilewati] = useState(false)

  const bukaLagi = () => {
    if (ref.current && !ref.current.open) ref.current.showModal()
  }

  useEffect(bukaLagi, [])

  const lulus = benar || dilewati

  return (
    <dialog
      ref={ref}
      aria-labelledby={judulId}
      aria-describedby={lulus ? undefined : pesanId}
      onCancel={(event) => event.preventDefault()}
      onClose={bukaLagi}
      className={`umpan-jawab bg-halaman text-teks fixed inset-x-0 bottom-0 top-auto m-0 max-h-none w-full max-w-none border-0 border-t-4 px-4 py-5 shadow-[0_-16px_40px_-16px_rgba(0,0,0,0.45)] backdrop:bg-black/25 sm:px-6 ${
        benar ? 'border-berhasil' : dilewati ? 'border-primary' : 'border-ulang'
      }`}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p
            id={judulId}
            className={`flex items-center gap-2 text-xl font-bold ${benar ? 'text-berhasil' : dilewati ? 'text-primary' : 'text-ulang'}`}
          >
            {benar ? (
              <Check aria-hidden className={ikon} />
            ) : dilewati ? (
              <Eye aria-hidden className={ikon} />
            ) : (
              <RotateCcw aria-hidden className={ikon} />
            )}
            {benar ? 'Benar!' : dilewati ? 'Jawaban yang benar' : 'Belum tepat'}
          </p>
          {lulus && jawaban ? (
            <p className="font-display mt-1 text-2xl font-bold first-letter:uppercase">{jawaban}</p>
          ) : null}
          {lulus ? null : (
            <p id={pesanId} className="mt-1">
              {pesanSalah}
            </p>
          )}
        </div>
        <div className="flex flex-row-reverse flex-wrap justify-end gap-3">
          {lulus ? (
            <button
              type="button"
              autoFocus
              onClick={dilewati ? onLewati : onLanjut}
              className="tombol-utama"
            >
              Lanjut <ArrowRight aria-hidden className={ikon} />
            </button>
          ) : (
            <>
              <button type="button" autoFocus onClick={onCobaLagi} className="tombol-utama">
                <RotateCcw aria-hidden className={`mr-1 ${ikon}`} />
                Coba lagi
              </button>
              {onLewati ? (
                <button
                  type="button"
                  onClick={jawaban ? () => setDilewati(true) : onLewati}
                  className="tombol-sekunder"
                >
                  <SkipForward aria-hidden className={`mr-1 ${ikon}`} />
                  Lewati
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </dialog>
  )
}

export const useJawab = (engine: ScenarioEngine, onMaju: (moved: string) => void) => {
  const [hasil, setHasil] = useState<{ benar: boolean; jawaban: string } | null>(null)

  const jawab = (benar: boolean, jawaban: string) => {
    if (!benar) engine.answer('salah')
    setHasil({ benar, jawaban })
  }

  const tutup = (moved: string) => {
    setHasil(null)
    onMaju(moved)
  }

  const umpan = hasil ? (
    <UmpanJawab
      benar={hasil.benar}
      jawaban={hasil.jawaban}
      onLanjut={() => tutup(engine.answer('benar'))}
      onCobaLagi={() => setHasil(null)}
      onLewati={() => tutup(engine.skip())}
    />
  ) : null

  return { jawab, umpan }
}
