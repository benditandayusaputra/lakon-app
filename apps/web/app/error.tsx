'use client'

import Link from 'next/link'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-6 py-16">
      <p className="text-teks-samar font-mono text-xs font-bold uppercase tracking-[0.2em]">
        Ada yang tersendat
      </p>
      <h1 className="font-display text-3xl font-semibold">Halaman ini gagal dimuat</h1>
      <p className="text-teks-sekunder text-pretty" role="alert">
        Kemajuan belajarmu tetap tersimpan. Coba muat ulang halamannya, atau kembali ke daftar
        adegan.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="tombol-utama w-fit">
          Coba lagi
        </button>
        <Link href="/skenario" className="tombol-sekunder w-fit">
          Kembali ke daftar adegan
        </Link>
      </div>
    </main>
  )
}
