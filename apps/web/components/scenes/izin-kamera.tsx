'use client'

import { useState } from 'react'
import { Camera, CameraOff, History, Play, RotateCcw, ShieldCheck } from 'lucide-react'
import { nyalakanKamera } from '@/features/practice/capture'

export function IzinKamera({
  onLanjut,
  aksen = '#8cc8ff',
  lanjutan,
  onMulaiUlang,
  tanpaKamera = false,
}: {
  onLanjut: () => void
  aksen?: string
  lanjutan?: string
  onMulaiUlang?: () => void
  tanpaKamera?: boolean
}) {
  const [sibuk, setSibuk] = useState(false)
  const [pesan, setPesan] = useState<string | null>(null)

  const nyalakan = async () => {
    setSibuk(true)
    const hasil = await nyalakanKamera()
    setSibuk(false)
    if (hasil.ok) {
      onLanjut()
      return
    }
    setPesan(
      hasil.reason === 'denied'
        ? 'Izin kamera ditolak. Kamu tetap bisa berlatih dengan membandingkan sendiri.'
        : hasil.reason === 'no-camera'
          ? 'Kamera tidak ditemukan di perangkat ini.'
          : 'Kamera tidak bisa dipakai di peramban ini.',
    )
  }

  const Ikon = lanjutan ? History : tanpaKamera ? Play : Camera

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <section
        aria-labelledby="izin-kamera-judul"
        className="kk-muncul rounded-kartu-besar border border-white/15 bg-[#17120d]/90 p-6 text-[#f6efe4] shadow-2xl backdrop-blur sm:p-8"
      >
        <span
          aria-hidden
          className="rounded-kartu flex h-12 w-12 items-center justify-center"
          style={{ backgroundColor: `${aksen}33`, color: aksen }}
        >
          <Ikon size={24} strokeWidth={2} />
        </span>
        <h1
          id="izin-kamera-judul"
          className="font-display mt-5 text-balance text-2xl font-semibold leading-tight sm:text-3xl"
        >
          {lanjutan
            ? 'Lanjutkan adeganmu'
            : tanpaKamera
              ? 'Siap memulai adegan?'
              : 'Nyalakan kamera untuk berlatih'}
        </h1>
        {lanjutan ? (
          <p
            className="mt-4 rounded-xl border-l-4 px-4 py-3 text-sm leading-relaxed"
            style={{ backgroundColor: `${aksen}1a`, borderColor: aksen }}
          >
            Kamu berhenti di <strong className="font-bold">{lanjutan}</strong>.
            <span className="block text-[#f6efe4]/70">Kemajuanmu tersimpan.</span>
          </p>
        ) : null}
        {tanpaKamera ? (
          <p className="mt-4 leading-relaxed text-[#f6efe4]/80">
            Di sisi pekerja layanan kamu membaca isyarat. Kamera tidak diperlukan.
          </p>
        ) : (
          <>
            <p className="mt-4 leading-relaxed text-[#f6efe4]/80">
              Kamera memeriksa gerakan tanganmu. Sekali menyala, kamera tetap aktif sampai adegan
              selesai.
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-[#f6efe4]/70">
              <ShieldCheck aria-hidden size={16} className="shrink-0" style={{ color: aksen }} />
              Video tidak pernah keluar dari perangkatmu.
            </p>
          </>
        )}
        {pesan ? (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold"
          >
            <CameraOff aria-hidden size={16} className="mt-0.5 shrink-0" />
            {pesan}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3">
          {tanpaKamera ? null : (
            <button
              type="button"
              onClick={() => void nyalakan()}
              disabled={sibuk}
              className="tombol-cta w-full whitespace-nowrap"
            >
              <Camera aria-hidden className="h-5 w-5 shrink-0" />
              {sibuk ? 'Meminta izin…' : 'Nyalakan kamera'}
            </button>
          )}
          <button
            type="button"
            onClick={onLanjut}
            className={`w-full gap-2 whitespace-nowrap ${tanpaKamera ? 'tombol-cta' : 'tombol-garis-terang'}`}
          >
            {tanpaKamera ? (
              <Play aria-hidden className="h-5 w-5 shrink-0" />
            ) : (
              <CameraOff aria-hidden className="h-5 w-5 shrink-0" />
            )}
            {tanpaKamera ? (lanjutan ? 'Lanjutkan adegan' : 'Mulai adegan') : 'Lanjut tanpa kamera'}
          </button>
        </div>
        {lanjutan && onMulaiUlang ? (
          <div className="mt-5 border-t border-white/10 pt-4 text-center">
            <button
              type="button"
              onClick={onMulaiUlang}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#f6efe4]/70 underline-offset-4 hover:text-[#f6efe4] hover:underline"
            >
              <RotateCcw aria-hidden size={15} />
              Mulai adegan dari awal
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
