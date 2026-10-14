import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Halaman tidak ditemukan | Lakon' }

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-teks-samar font-mono text-xs font-bold uppercase tracking-[0.2em]">404</p>
      <h1 className="font-display text-3xl font-semibold">Halaman ini tidak ada</h1>
      <p className="text-teks-sekunder text-pretty">
        Alamatnya mungkin salah ketik, atau adegannya sudah dipindahkan. Kamu bisa kembali ke daftar
        adegan dan memilih dari sana.
      </p>
      <Link href="/skenario" className="tombol-utama w-fit">
        Kembali ke daftar adegan
      </Link>
    </main>
  )
}
