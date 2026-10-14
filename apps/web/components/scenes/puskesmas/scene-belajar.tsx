'use client'

import { ArrowRight, Check, Stethoscope } from 'lucide-react'
import type { CompiledSign } from '@lakon/sign-compiler'
import type { Sign } from '@lakon/sign-schema'
import { AvatarStage } from '@/components/avatar-stage'
import { LatihanBaca } from '@/components/latihan-baca'
import { PracticeBlock } from '@/components/practice-block'
import type { Direction } from '@/features/scenario/engine'
import {
  JamDinding,
  KursiTunggu,
  LayarAntrean,
  PosterKesehatan,
} from '@/components/scenes/puskesmas/karakter'

const prettify = (id: string) => id.replace(/-/g, ' ')

export function AmbienRuangTunggu({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <JamDinding className="absolute left-[4%] top-2 w-10 opacity-80 sm:w-12" />
        <KursiTunggu className="absolute bottom-0 left-[2%] w-52 opacity-45 lg:w-64" />
        <PosterKesehatan
          varian="cuci-tangan"
          className="absolute right-[3%] top-4 hidden w-16 rotate-1 opacity-80 xl:block"
        />
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-12 pt-2 sm:px-6">
        {children}
      </div>
    </div>
  )
}

export function PanelAlurLayanan() {
  const langkah = [
    'Daftar di loket',
    'Tunggu nomor antrean',
    'Periksa di poli umum',
    'Ambil obat di apotek',
  ]
  return (
    <div className="hidden flex-col items-center gap-5 lg:flex">
      <div className="rounded-kartu bg-kartu w-full border-2 border-[#c4dcca] p-4 shadow-lg">
        <p className="text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2f7d52]">
          Alur Pelayanan
        </p>
        <ol className="mt-3 space-y-2.5">
          {langkah.map((teks, index) => (
            <li key={teks} className="flex items-center gap-2.5 text-sm font-bold text-[#1d442f]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f7d52] text-xs text-white">
                {index + 1}
              </span>
              {teks}
            </li>
          ))}
        </ol>
      </div>
      <LayarAntrean nomor="A-03" poli="Poli Umum" className="w-full" />
      <PosterKesehatan varian="gizi" className="w-24 -rotate-1" />
    </div>
  )
}

export function SceneBelajarPuskesmas({
  isyaratAktif,
  urutan,
  sign,
  compiled,
  tampilan,
  direction,
  percobaan,
  gagalBeruntun,
  arahLabel,
  onTampilan,
  onLulus,
  onGagal,
  onNilaiSendiri,
  onLewati,
  onMulaiUjian,
}: {
  isyaratAktif: string | null
  urutan: readonly string[]
  sign: Sign | undefined
  compiled: CompiledSign | null
  tampilan: 'demo' | 'praktik'
  direction: Direction
  percobaan: number
  gagalBeruntun: number
  arahLabel: string
  onTampilan: (tampilan: 'demo' | 'praktik') => void
  onLulus: () => void
  onGagal: () => void
  onNilaiSendiri: () => void
  onLewati: () => void
  onMulaiUjian: () => void
}) {
  if (isyaratAktif === null) {
    return (
      <AmbienRuangTunggu>
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div className="kk-muncul rounded-kartu-besar bg-kartu flex flex-col items-start gap-4 border-2 border-[#c4dcca] p-6 shadow-xl sm:p-8">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2f7d52]">
              Latihan selesai
            </p>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Semua isyarat siap dipakai
            </h1>
            <p className="max-w-prose text-lg">
              Sekarang jalani kunjungan berobatnya dari loket sampai apotek. Kamu berperan sebagai{' '}
              {arahLabel}.
            </p>
            <div className="flex flex-wrap gap-2" aria-hidden>
              {urutan.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-[#9dbfa9] bg-[#eef5ef] px-3 py-1 text-sm font-bold capitalize text-[#1d442f]"
                >
                  <Check
                    aria-hidden
                    className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
                  />
                  {prettify(id)}
                </span>
              ))}
            </div>
            <button type="button" onClick={onMulaiUjian} className="tombol-cta">
              <Stethoscope aria-hidden className="mr-2 inline h-5 w-5" />
              Menuju loket pendaftaran
            </button>
          </div>
          <PanelAlurLayanan />
        </div>
      </AmbienRuangTunggu>
    )
  }

  const orderIndex = urutan.indexOf(isyaratAktif)

  return (
    <AmbienRuangTunggu>
      <div className="grid flex-1 gap-5 lg:grid-cols-[1fr_13.65rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-kartu bg-kartu flex flex-wrap items-center justify-between gap-3 border-2 border-[#c4dcca] px-5 py-3.5 shadow-lg">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2f7d52]">
                Latihan sebelum berobat
              </p>
              <h1 className="font-display text-2xl font-bold capitalize sm:text-3xl">
                {direction === 'service' ? `Isyarat ${orderIndex + 1}` : prettify(isyaratAktif)}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-teks-sekunder font-mono text-sm">
                {orderIndex + 1} / {urutan.length}
              </p>
              <div aria-hidden className="flex items-center gap-1.5">
                {urutan.map((id, index) => (
                  <svg key={id} viewBox="0 0 20 20" className="h-4 w-4">
                    <rect
                      x="7.5"
                      y="2"
                      width="5"
                      height="16"
                      rx="2"
                      fill={
                        index < orderIndex
                          ? '#2f7d52'
                          : index === orderIndex
                            ? '#d9a521'
                            : '#dde6dd'
                      }
                    />
                    <rect
                      x="2"
                      y="7.5"
                      width="16"
                      height="5"
                      rx="2"
                      fill={
                        index < orderIndex
                          ? '#2f7d52'
                          : index === orderIndex
                            ? '#d9a521'
                            : '#dde6dd'
                      }
                    />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {compiled && sign ? (
            tampilan === 'demo' && direction === 'deaf' ? (
              <div className="kk-muncul flex flex-col gap-4">
                <AvatarStage
                  compiled={compiled}
                  sign={sign}
                  showControls
                  signLabel={sign.gloss.id}
                  stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border-4 border-[#c4dcca] shadow-[0_24px_50px_-20px_rgba(29,68,47,0.4)]"
                  className="sm:h-[58vh]"
                />
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-stretch">
                  <div className="rounded-kartu bg-kartu border-2 border-[#c4dcca] p-4 shadow-lg">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#2f7d52]">
                      Isyarat ini
                    </p>
                    <p className="font-display mt-1 text-xl font-bold">{sign.gloss.id}</p>
                    <p className="text-teks-sekunder">{sign.gloss.en}</p>
                    <p className="text-teks-sekunder mt-2 text-sm">
                      {sign.review.status === 'approved' ? (
                        <>
                          <Check
                            aria-hidden
                            className="mr-1 inline-block h-[1em] w-[1em] align-text-bottom"
                          />
                          tervalidasi penanda Tuli
                        </>
                      ) : (
                        `${sign.gloss.id} · BISINDO`
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTampilan('praktik')}
                    className="tombol-utama w-full text-lg md:w-auto md:self-end md:px-10"
                  >
                    Lanjut ke praktik{' '}
                    <ArrowRight
                      aria-hidden
                      className="inline-block h-[1em] w-[1em] align-text-bottom"
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div className="kk-muncul rounded-kartu-besar bg-kartu flex flex-col gap-4 border-2 border-[#c4dcca] p-4 shadow-xl sm:p-5">
                {direction === 'service' ? (
                  <LatihanBaca
                    compiled={compiled}
                    sign={sign}
                    signId={isyaratAktif}
                    kandidat={urutan}
                    onLulus={onLulus}
                    onGagal={onGagal}
                    onLewati={onNilaiSendiri}
                  />
                ) : (
                  <PracticeBlock
                    compiled={compiled}
                    sign={sign}
                    signLabel={sign.gloss.id}
                    onPassed={onLulus}
                    onFailedAttempt={onGagal}
                    onSelfAssessed={onNilaiSendiri}
                  />
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {percobaan > 0 ? (
                    <p className="text-teks-samar text-sm">
                      percobaan: {percobaan}, gagal beruntun: {gagalBeruntun}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          ) : (
            <div className="rounded-kartu bg-kartu flex flex-col gap-3 border-2 border-[#c4dcca] p-5 shadow-lg">
              <p>
                Isyarat <span className="font-bold">{prettify(isyaratAktif)}</span> belum punya
                peragaan karena bentuknya belum divalidasi penanda Tuli.
              </p>
              <button type="button" onClick={onLewati} className="tombol-sekunder self-start">
                Lewati dulu
              </button>
            </div>
          )}
        </div>

        <PanelAlurLayanan />
      </div>
    </AmbienRuangTunggu>
  )
}
