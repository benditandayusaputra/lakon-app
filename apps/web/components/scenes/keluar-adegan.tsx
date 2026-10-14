'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useId, useRef } from 'react'

export function KeluarAdegan({ tanya }: { tanya: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const judulId = useId()

  return (
    <>
      <Link
        href="/skenario"
        onClick={(event) => {
          if (!tanya) return
          event.preventDefault()
          ref.current?.showModal()
        }}
        className="rounded-kontrol flex min-h-11 items-center gap-1.5 px-2 py-1 text-sm font-bold underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Skenario
      </Link>
      <dialog
        ref={ref}
        aria-labelledby={judulId}
        className="bg-halaman text-teks rounded-kartu-besar m-auto w-[min(28rem,calc(100%-2rem))] p-6 shadow-2xl backdrop:bg-black/40"
      >
        <h2 id={judulId} className="font-display text-2xl font-bold">
          Keluar dari sesi ini?
        </h2>
        <p className="mt-2">
          Sesi latihan dihentikan. Progresmu tersimpan, jadi bisa dilanjutkan nanti.
        </p>
        <form method="dialog" className="mt-5 flex flex-row-reverse flex-wrap justify-end gap-3">
          <button type="submit" autoFocus className="tombol-utama">
            Tetap di sini
          </button>
          <Link href="/skenario" className="tombol-sekunder inline-flex items-center">
            Keluar
          </Link>
        </form>
      </dialog>
    </>
  )
}
