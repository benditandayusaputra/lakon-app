'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, ExternalLink, Eye, Hand } from 'lucide-react'
import { compileSign } from '@lakon/sign-compiler'
import { AvatarStage } from '@/components/avatar-stage'
import { LatihanBaca } from '@/components/latihan-baca'
import { Logo } from '@/components/logo'
import { PracticeBlock } from '@/components/practice-block'
import {
  detikSumber,
  formatWaktu,
  geserHuruf,
  geserSoal,
  HURUF,
  idHuruf,
  labelHuruf,
  SUMBER_URL,
  tautanSumber,
  URUTAN_BACA,
  type ArahAbjad,
} from '@/features/abjad/abjad'
import { SEED_SAN_RIG } from '@/features/avatar/seed-san-rig'
import { useContent } from '@/features/content/use-content'
import { lepasKamera } from '@/features/practice/capture'
import { bacaProgres, saveSignProgress, type SignProgressEntry } from '@/features/progress/store'

type Tampilan = 'peragaan' | 'latihan'

const PERAN = [
  {
    arah: 'deaf',
    ikon: Hand,
    judul: 'Sisi Tuli',
    isi: 'Lihat peragaan tiap huruf, lalu peragakan sendiri di depan kamera.',
  },
  {
    arah: 'service',
    ikon: Eye,
    judul: 'Sisi pekerja layanan',
    isi: 'Baca isyarat huruf dari pelanggan, lalu pilih huruf yang benar.',
  },
] as const

const KANDIDAT_BACA = HURUF.map(idHuruf)

const tombolPilih = (aktif: boolean) =>
  `tombol-sekunder flex-1 justify-center px-4 ${aktif ? 'border-primary! bg-primary-tint text-primary! font-bold' : ''}`

const kotakGrid = (aktif: boolean) =>
  `rounded-kontrol font-display relative flex aspect-square min-h-11 w-full items-center justify-center border-2 text-lg font-semibold transition-colors ${
    aktif
      ? 'border-primary bg-primary-tint text-primary'
      : 'border-border-halus bg-kartu hover:border-border-tegas'
  }`

const tandaSelesai = (
  <Check aria-hidden size={13} strokeWidth={3} className="text-aksen absolute right-1 top-1" />
)

const bacaDikuasai = (signs: SignProgressEntry[], arah: ArahAbjad) =>
  new Set(
    signs
      .filter(
        (entry) =>
          entry.direction === arah &&
          (entry.status === 'dikuasai' || entry.status === 'dinilai-sendiri'),
      )
      .map((entry) => entry.signId),
  )

function TautanSumber({ huruf }: { huruf?: string }) {
  return (
    <p className="text-teks-sekunder text-sm">
      Peragaan manusia dipotong dari{' '}
      <a
        href={huruf ? tautanSumber(huruf) : SUMBER_URL}
        className="underline"
        target="_blank"
        rel="noreferrer"
      >
        video HaiDokter bersama GERKATIN dan PUSBISINDO (2018)
        {huruf ? `, huruf ${huruf.toUpperCase()} di menit ${formatWaktu(detikSumber(huruf))}` : ''}
        <ExternalLink aria-hidden size={13} className="ml-1 inline-block align-baseline" />
      </a>
      . Peraga 3D masih draf dan belum divalidasi penanda Tuli.
    </p>
  )
}

export function AbjadBelajar({ awal, arahAwal }: { awal: string; arahAwal: ArahAbjad }) {
  const { content, error } = useContent()
  const [arah, setArah] = useState<ArahAbjad>(arahAwal)
  const [huruf, setHuruf] = useState(awal)
  const [soal, setSoal] = useState(0)
  const [tampilan, setTampilan] = useState<Tampilan>('peragaan')
  const [dikuasai, setDikuasai] = useState<Record<ArahAbjad, Set<string>>>({
    deaf: new Set(),
    service: new Set(),
  })
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => lepasKamera, [])

  useEffect(() => {
    void bacaProgres()
      .then(({ signs }) =>
        setDikuasai({ deaf: bacaDikuasai(signs, 'deaf'), service: bacaDikuasai(signs, 'service') }),
      )
      .catch(() => {})
  }, [])

  const hurufAktif = arah === 'service' ? URUTAN_BACA[soal]! : huruf
  const id = idHuruf(hurufAktif)
  const sign = content?.signs[id]
  const compiled = useMemo(() => {
    if (!sign || !content) return null
    try {
      return compileSign(sign, content.handshapes, SEED_SAN_RIG)
    } catch {
      return null
    }
  }, [sign, content])

  const perbaruiUrl = (arahBaru: ArahAbjad, hurufBaru: string) =>
    window.history.replaceState(
      null,
      '',
      arahBaru === 'service' ? '/abjad?arah=service' : `/abjad?huruf=${hurufBaru}`,
    )

  const gantiArah = (arahBaru: ArahAbjad) => {
    setArah(arahBaru)
    setPercobaan(0)
    perbaruiUrl(arahBaru, huruf)
  }

  const pilih = (berikut: string) => {
    setHuruf(berikut)
    setPercobaan(0)
    perbaruiUrl('deaf', berikut)
  }

  const pilihSoal = (nomor: number) => {
    setSoal(nomor)
    setPercobaan(0)
  }

  const simpan = (status: SignProgressEntry['status'], attempts: number) => {
    // Gagal sekali tidak boleh menurunkan huruf yang sudah dikuasai.
    if (status === 'berlatih' && dikuasai[arah].has(id)) return
    void saveSignProgress({ signId: id, direction: arah, status, attempts })
    if (status !== 'berlatih') {
      setDikuasai((lama) => ({ ...lama, [arah]: new Set(lama[arah]).add(id) }))
    }
  }

  const gagalSekali = () => {
    setPercobaan((jumlah) => jumlah + 1)
    simpan('berlatih', percobaan + 1)
  }

  const jumlahDikuasai = HURUF.filter((h) => dikuasai[arah].has(idHuruf(h))).length
  const besar = hurufAktif.toUpperCase()
  const sudahDibaca = dikuasai.service.has(id)

  const isi = error ? (
    <p role="alert" className="border-border-halus bg-kartu rounded-kartu border p-5">
      Huruf gagal dimuat. Periksa koneksi lalu muat ulang halaman.
    </p>
  ) : !content ? (
    <div className="bg-terangkat rounded-kartu-besar h-[50vh] animate-pulse">
      <span className="sr-only">Memuat huruf…</span>
    </div>
  ) : !compiled || !sign ? (
    <p className="border-border-halus bg-kartu rounded-kartu border p-5">
      Huruf ini belum punya peragaan.
    </p>
  ) : arah === 'service' ? (
    <div className="border-border-halus bg-kartu shadow-kartu rounded-kartu-besar flex flex-col gap-4 border p-4 sm:p-5">
      <LatihanBaca
        key={id}
        compiled={compiled}
        sign={sign}
        signId={id}
        kandidat={KANDIDAT_BACA}
        label={labelHuruf}
        onLulus={() => {
          simpan('dikuasai', percobaan + 1)
          pilihSoal(geserSoal(soal, 1))
        }}
        onGagal={gagalSekali}
        onLewati={() => simpan('dinilai-sendiri', percobaan)}
      />
      {sudahDibaca ? (
        <button
          type="button"
          onClick={() => pilihSoal(geserSoal(soal, 1))}
          className="tombol-cta self-end"
        >
          <Check aria-hidden className="inline-block h-[1em] w-[1em]" />
          Soal berikutnya
        </button>
      ) : null}
    </div>
  ) : tampilan === 'peragaan' ? (
    <div className="flex flex-col gap-3">
      <AvatarStage
        compiled={compiled}
        sign={sign}
        showControls
        signLabel={`Huruf ${besar}`}
        stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border border-border-halus"
        className="sm:h-[58vh]"
      />
      <button type="button" onClick={() => setTampilan('latihan')} className="tombol-cta self-end">
        Coba huruf {besar}
        <ArrowRight aria-hidden className="inline-block h-[1em] w-[1em]" />
      </button>
    </div>
  ) : (
    <div className="border-border-halus bg-kartu shadow-kartu rounded-kartu-besar flex flex-col gap-4 border p-4 sm:p-5">
      <PracticeBlock
        key={id}
        compiled={compiled}
        sign={sign}
        signLabel={`Huruf ${besar}`}
        onPassed={() => simpan('dikuasai', percobaan + 1)}
        onFailedAttempt={gagalSekali}
        onSelfAssessed={() => simpan('dinilai-sendiri', percobaan)}
      />
      {dikuasai.deaf.has(id) ? (
        <button
          type="button"
          onClick={() => pilih(geserHuruf(huruf, 1))}
          className="tombol-cta self-end"
        >
          <Check aria-hidden className="inline-block h-[1em] w-[1em]" />
          Lanjut ke huruf {geserHuruf(huruf, 1).toUpperCase()}
        </button>
      ) : null}
    </div>
  )

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung text-halaman sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/skenario" className="flex items-center gap-2.5 text-xl font-bold">
            <Logo />
            Lakon
          </Link>
          <Link
            href="/skenario"
            className="border-halaman/30 hover:border-halaman/70 rounded-kontrol flex min-h-11 items-center gap-2 border px-3 text-sm transition-colors"
          >
            <ArrowLeft aria-hidden size={15} />
            Peta perjalanan
          </Link>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pb-8 pt-8 sm:px-6">
          <p className="text-sorot flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
            <Hand aria-hidden size={14} />
            Abjad BISINDO
          </p>
          <h1 className="font-display text-balance text-3xl font-semibold leading-tight sm:text-4xl">
            Satu huruf, satu latihan.
          </h1>
          <p className="text-halaman/80 max-w-prose text-pretty">
            Pakai ejaan jari untuk nama dan kata yang belum punya isyarat. Pilih peranmu:
            memeragakan huruf, atau membaca huruf dari pelanggan.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <div
            role="group"
            aria-label="Pilih peranmu"
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1"
          >
            {PERAN.map((peran) => {
              const aktif = arah === peran.arah
              return (
                <button
                  key={peran.arah}
                  type="button"
                  onClick={() => gantiArah(peran.arah)}
                  aria-pressed={aktif}
                  className={`rounded-kartu flex flex-col gap-1 border-2 p-3 text-left transition-all ${
                    aktif
                      ? 'border-primary bg-primary-tint shadow-kartu-angkat'
                      : 'border-border-halus bg-kartu shadow-kartu hover:border-border-tegas'
                  }`}
                >
                  <span className="flex items-center gap-2 font-bold">
                    <peran.ikon
                      aria-hidden
                      size={17}
                      className={aktif ? 'text-primary' : 'text-aksen'}
                    />
                    {peran.judul}
                  </span>
                  <span className="text-teks-sekunder text-sm">{peran.isi}</span>
                </button>
              )
            })}
          </div>

          <nav aria-label={arah === 'service' ? 'Pilih soal' : 'Pilih huruf'}>
            <p className="text-teks-sekunder mb-3 text-sm">
              {arah === 'service' ? 'Terbaca benar' : 'Dikuasai'}: <strong>{jumlahDikuasai}</strong>{' '}
              / 26
            </p>
            <ul className="grid grid-cols-7 gap-2 sm:grid-cols-9 lg:grid-cols-5">
              {arah === 'service'
                ? URUTAN_BACA.map((h, nomor) => {
                    const sudah = dikuasai.service.has(idHuruf(h))
                    return (
                      <li key={h}>
                        <button
                          type="button"
                          onClick={() => pilihSoal(nomor)}
                          aria-current={nomor === soal ? 'true' : undefined}
                          aria-label={`Soal ${nomor + 1}${sudah ? `, huruf ${h.toUpperCase()}, sudah terbaca` : ''}`}
                          className={kotakGrid(nomor === soal)}
                        >
                          {sudah ? h.toUpperCase() : nomor + 1}
                          {sudah ? tandaSelesai : null}
                        </button>
                      </li>
                    )
                  })
                : HURUF.map((h) => {
                    const sudah = dikuasai.deaf.has(idHuruf(h))
                    return (
                      <li key={h}>
                        <button
                          type="button"
                          onClick={() => pilih(h)}
                          aria-current={h === huruf ? 'true' : undefined}
                          aria-label={`Huruf ${h.toUpperCase()}${sudah ? ', sudah dikuasai' : ''}`}
                          className={kotakGrid(h === huruf)}
                        >
                          {h.toUpperCase()}
                          {sudah ? tandaSelesai : null}
                        </button>
                      </li>
                    )
                  })}
            </ul>
          </nav>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="border-border-halus bg-kartu shadow-kartu rounded-kartu flex flex-wrap items-center justify-between gap-3 border px-5 py-3.5">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="bg-panggung text-halaman font-display flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-bold"
              >
                {arah === 'service' ? (sudahDibaca ? besar : '?') : besar}
              </span>
              <div>
                <p className="text-aksen font-mono text-xs font-bold uppercase tracking-[0.2em]">
                  {arah === 'service'
                    ? `Soal ${soal + 1} dari 26`
                    : `Huruf ${HURUF.indexOf(huruf) + 1} dari 26`}
                </p>
                <h2 className="font-display text-2xl font-bold">
                  {arah === 'service' ? 'Huruf apa ini?' : `Huruf ${besar}`}
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  arah === 'service' ? pilihSoal(geserSoal(soal, -1)) : pilih(geserHuruf(huruf, -1))
                }
                className="tombol-sekunder px-3"
                aria-label={
                  arah === 'service'
                    ? 'Soal sebelumnya'
                    : `Huruf sebelumnya, ${geserHuruf(huruf, -1).toUpperCase()}`
                }
              >
                <ArrowLeft aria-hidden size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  arah === 'service' ? pilihSoal(geserSoal(soal, 1)) : pilih(geserHuruf(huruf, 1))
                }
                className="tombol-sekunder px-3"
                aria-label={
                  arah === 'service'
                    ? 'Soal berikutnya'
                    : `Huruf berikutnya, ${geserHuruf(huruf, 1).toUpperCase()}`
                }
              >
                <ArrowRight aria-hidden size={18} />
              </button>
            </div>
          </div>

          {arah === 'deaf' ? (
            <div role="group" aria-label="Pilih kegiatan" className="flex gap-2">
              <button
                type="button"
                onClick={() => setTampilan('peragaan')}
                aria-pressed={tampilan === 'peragaan'}
                className={tombolPilih(tampilan === 'peragaan')}
              >
                <Eye aria-hidden size={16} className="mr-1.5 inline-block align-text-bottom" />
                Peragaan
              </button>
              <button
                type="button"
                onClick={() => setTampilan('latihan')}
                aria-pressed={tampilan === 'latihan'}
                className={tombolPilih(tampilan === 'latihan')}
              >
                <Hand aria-hidden size={16} className="mr-1.5 inline-block align-text-bottom" />
                Latihan
              </button>
            </div>
          ) : null}

          {isi}

          {/* Di sisi pekerja, tautan berstempel waktu baru muncul setelah huruf terbaca agar jawaban tidak bocor. */}
          <TautanSumber huruf={arah === 'deaf' || sudahDibaca ? hurufAktif : undefined} />
        </div>
      </section>
    </main>
  )
}
