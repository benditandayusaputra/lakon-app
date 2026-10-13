'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Eye, Hand } from 'lucide-react'
import { compileSign } from '@lakon/sign-compiler'
import { AvatarStage } from '@/components/avatar-stage'
import { Logo } from '@/components/logo'
import { PracticeBlock } from '@/components/practice-block'
import { geserHuruf, HURUF, idHuruf } from '@/features/abjad/abjad'
import { SEED_SAN_RIG } from '@/features/avatar/seed-san-rig'
import { useContent } from '@/features/content/use-content'
import { lepasKamera } from '@/features/practice/capture'
import { bacaProgres, saveSignProgress, type SignProgressEntry } from '@/features/progress/store'

const SUMBER_URL = 'https://www.youtube.com/watch?v=AZ8pT075NFI'

type Tampilan = 'peragaan' | 'latihan'

const tombolPilih = (aktif: boolean) =>
  `tombol-sekunder flex-1 justify-center px-4 ${aktif ? 'border-primary! bg-primary-tint text-primary! font-bold' : ''}`

export function AbjadBelajar({ awal }: { awal: string }) {
  const { content, error } = useContent()
  const [huruf, setHuruf] = useState(awal)
  const [tampilan, setTampilan] = useState<Tampilan>('peragaan')
  const [dikuasai, setDikuasai] = useState<Set<string>>(new Set())
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => lepasKamera, [])

  useEffect(() => {
    void bacaProgres()
      .then(({ signs }) =>
        setDikuasai(
          new Set(
            signs
              .filter(
                (entry) =>
                  entry.direction === 'deaf' &&
                  (entry.status === 'dikuasai' || entry.status === 'dinilai-sendiri'),
              )
              .map((entry) => entry.signId),
          ),
        ),
      )
      .catch(() => {})
  }, [])

  const id = idHuruf(huruf)
  const sign = content?.signs[id]
  const compiled = useMemo(() => {
    if (!sign || !content) return null
    try {
      return compileSign(sign, content.handshapes, SEED_SAN_RIG)
    } catch {
      return null
    }
  }, [sign, content])

  const pilih = (berikut: string) => {
    setHuruf(berikut)
    setPercobaan(0)
    window.history.replaceState(null, '', `/abjad?huruf=${berikut}`)
  }

  const simpan = (status: SignProgressEntry['status'], attempts: number) => {
    // Gagal sekali tidak boleh menurunkan huruf yang sudah dikuasai.
    if (status === 'berlatih' && dikuasai.has(id)) return
    void saveSignProgress({ signId: id, direction: 'deaf', status, attempts })
    if (status !== 'berlatih') setDikuasai((lama) => new Set(lama).add(id))
  }

  const besar = huruf.toUpperCase()

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
            Lihat peragaan tiap huruf, lalu coba sendiri di depan kamera. Pakai ejaan jari untuk
            nama dan kata yang belum punya isyarat.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <nav aria-label="Pilih huruf" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-teks-sekunder mb-3 text-sm">
            Dikuasai: <strong>{HURUF.filter((h) => dikuasai.has(idHuruf(h))).length}</strong> / 26
          </p>
          <ul className="grid grid-cols-7 gap-2 sm:grid-cols-9 lg:grid-cols-5">
            {HURUF.map((h) => {
              const aktif = h === huruf
              const sudah = dikuasai.has(idHuruf(h))
              return (
                <li key={h}>
                  <button
                    type="button"
                    onClick={() => pilih(h)}
                    aria-current={aktif ? 'true' : undefined}
                    aria-label={`Huruf ${h.toUpperCase()}${sudah ? ', sudah dikuasai' : ''}`}
                    className={`rounded-kontrol font-display relative flex aspect-square min-h-11 w-full items-center justify-center border-2 text-lg font-semibold transition-colors ${
                      aktif
                        ? 'border-primary bg-primary-tint text-primary'
                        : 'border-border-halus bg-kartu hover:border-border-tegas'
                    }`}
                  >
                    {h.toUpperCase()}
                    {sudah ? (
                      <Check
                        aria-hidden
                        size={13}
                        strokeWidth={3}
                        className="text-aksen absolute right-1 top-1"
                      />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="border-border-halus bg-kartu shadow-kartu rounded-kartu flex flex-wrap items-center justify-between gap-3 border px-5 py-3.5">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="bg-panggung text-halaman font-display flex h-14 w-14 items-center justify-center rounded-xl text-3xl font-bold"
              >
                {besar}
              </span>
              <div>
                <p className="text-aksen font-mono text-xs font-bold uppercase tracking-[0.2em]">
                  Huruf {HURUF.indexOf(huruf) + 1} dari 26
                </p>
                <h2 className="font-display text-2xl font-bold">Huruf {besar}</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => pilih(geserHuruf(huruf, -1))}
                className="tombol-sekunder px-3"
                aria-label={`Huruf sebelumnya, ${geserHuruf(huruf, -1).toUpperCase()}`}
              >
                <ArrowLeft aria-hidden size={18} />
              </button>
              <button
                type="button"
                onClick={() => pilih(geserHuruf(huruf, 1))}
                className="tombol-sekunder px-3"
                aria-label={`Huruf berikutnya, ${geserHuruf(huruf, 1).toUpperCase()}`}
              >
                <ArrowRight aria-hidden size={18} />
              </button>
            </div>
          </div>

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

          {error ? (
            <p role="alert" className="border-border-halus bg-kartu rounded-kartu border p-5">
              Huruf gagal dimuat. Periksa koneksi lalu muat ulang halaman.
            </p>
          ) : !content ? (
            <div className="bg-terangkat rounded-kartu-besar h-[50vh] animate-pulse">
              <span className="sr-only">Memuat huruf…</span>
            </div>
          ) : compiled && sign ? (
            tampilan === 'peragaan' ? (
              <div className="flex flex-col gap-3">
                <AvatarStage
                  compiled={compiled}
                  sign={sign}
                  showControls
                  signLabel={`Huruf ${besar}`}
                  stageClassName="bg-zona-tenang zona-tenang-gradasi overflow-hidden rounded-kartu-besar border border-border-halus"
                  className="sm:h-[58vh]"
                />
                <button
                  type="button"
                  onClick={() => setTampilan('latihan')}
                  className="tombol-cta self-end"
                >
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
                  onFailedAttempt={() => {
                    setPercobaan((jumlah) => jumlah + 1)
                    simpan('berlatih', percobaan + 1)
                  }}
                  onSelfAssessed={() => simpan('dinilai-sendiri', percobaan)}
                />
                {dikuasai.has(id) ? (
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
          ) : (
            <p className="border-border-halus bg-kartu rounded-kartu border p-5">
              Huruf {besar} belum punya peragaan.
            </p>
          )}

          <p className="text-teks-sekunder text-sm">
            Peragaan manusia dipotong dari{' '}
            <a href={SUMBER_URL} className="underline" target="_blank" rel="noreferrer">
              video HaiDokter bersama GERKATIN dan PUSBISINDO (2018)
            </a>
            . Peraga 3D masih draf dan belum divalidasi penanda Tuli.
          </p>
        </div>
      </section>
    </main>
  )
}
