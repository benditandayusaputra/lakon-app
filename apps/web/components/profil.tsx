'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  Flag,
  Hand,
  ImageOff,
  LogOut,
  Repeat,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Trophy,
  UserRound,
} from 'lucide-react'
import { AvatarAkun } from '@/components/avatar-akun'
import { PilihKarakter, type Gender } from '@/components/pilih-karakter'
import { Logo } from '@/components/logo'
import { SyncBadge } from '@/components/sync-badge'
import { useContent } from '@/features/content/use-content'
import {
  bacaProgres,
  clearAllProgress,
  type Arah,
  type RunEntry,
  type SignProgressEntry,
} from '@/features/progress/store'
import { scenarioSignIds } from '@/features/ui/adegan'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

const PERAN: { value: Arah; judul: string; icon: typeof Hand; keterangan: string }[] = [
  { value: 'deaf', judul: 'Sisi Tuli', icon: Hand, keterangan: 'memperagakan isyarat' },
  { value: 'service', judul: 'Sisi pekerja layanan', icon: Eye, keterangan: 'membaca isyarat' },
]

const perkecilFoto = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file)
  const sisi = 192
  const canvas = document.createElement('canvas')
  canvas.width = sisi
  canvas.height = sisi
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('kanvas tidak tersedia')
  const skala = Math.max(sisi / bitmap.width, sisi / bitmap.height)
  const lebar = bitmap.width * skala
  const tinggi = bitmap.height * skala
  ctx.drawImage(bitmap, (sisi - lebar) / 2, (sisi - tinggi) / 2, lebar, tinggi)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.86)
}

export function Profil({
  nama,
  email,
  peran,
  avatarAwal,
  genderAwal,
  akunDemo,
}: {
  nama: string
  email: string
  peran: string
  avatarAwal: string | null
  genderAwal: Gender
  akunDemo: boolean
}) {
  const { content } = useContent()
  const [runs, setRuns] = useState<RunEntry[]>([])
  const [signs, setSigns] = useState<SignProgressEntry[]>([])
  const [avatar, setAvatar] = useState<string | null>(avatarAwal)
  const [gender, setGender] = useState<Gender>(genderAwal)
  const [genderPesan, setGenderPesan] = useState<string | null>(null)
  const [fotoPesan, setFotoPesan] = useState<string | null>(null)
  const [fotoSibuk, setFotoSibuk] = useState(false)
  const [genderSibuk, setGenderSibuk] = useState(false)
  const [keluarSibuk, setKeluarSibuk] = useState(false)
  const [keluarGagal, setKeluarGagal] = useState(false)
  const [progresSiap, setProgresSiap] = useState(false)
  const [dihapus, setDihapus] = useState(false)
  const [minta, setMinta] = useState(false)
  const [hapusGagal, setHapusGagal] = useState(false)
  const [mintaAkun, setMintaAkun] = useState(false)
  const [akunSibuk, setAkunSibuk] = useState(false)
  const [akunGagal, setAkunGagal] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    void bacaProgres()
      .then((progres) => {
        setSigns(progres.signs)
        setRuns(progres.runs)
      })
      .catch(() => {})
      .finally(() => setProgresSiap(true))
  }, [])

  const scenarios = useMemo(
    () =>
      content
        ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
        : [],
    [content],
  )
  const totalIsyarat = new Set(scenarios.flatMap((scenario) => [...scenarioSignIds(scenario)])).size
  const siap = progresSiap && scenarios.length > 0

  const ringkas = (arah: Arah) => {
    const runArah = runs.filter((run) => run.direction === arah)
    const dikuasai = new Set(
      signs
        .filter(
          (entry) =>
            entry.direction === arah && entry.status !== 'belum' && entry.status !== 'berlatih',
        )
        .map((entry) => entry.signId),
    )
    const perAdegan = scenarios.map((scenario) => {
      const ids = scenarioSignIds(scenario)
      const kuasai = [...ids].filter((id) => dikuasai.has(id)).length
      const sesi = runArah.filter((run) => run.scenarioId === scenario.id).length
      return { scenario, kuasai, total: ids.size, sesi }
    })
    const selesai = perAdegan.filter((item) => item.sesi > 0).length
    return { runArah, dikuasai, perAdegan, selesai }
  }

  const simpanFoto = async (file: File | undefined) => {
    if (!file) return
    setFotoSibuk(true)
    setFotoPesan(null)
    try {
      const dataUrl = await perkecilFoto(file)
      const response = await fetch('/api/auth/saya', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatar: dataUrl }),
      })
      if (!response.ok) throw new Error('gagal')
      setAvatar(dataUrl)
      setFotoPesan('Foto profil tersimpan.')
    } catch {
      setFotoPesan('Foto tidak bisa dipakai. Coba berkas JPG atau PNG lain.')
    } finally {
      setFotoSibuk(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const hapusFoto = async () => {
    setFotoSibuk(true)
    setFotoPesan(null)
    try {
      const response = await fetch('/api/auth/saya', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ avatar: null }),
      })
      if (!response.ok) throw new Error('gagal')
      setAvatar(null)
      setFotoPesan('Foto profil dihapus.')
    } catch {
      setFotoPesan('Foto belum terhapus. Periksa koneksi lalu coba lagi.')
    } finally {
      setFotoSibuk(false)
    }
  }

  const simpanGender = async (nilai: Gender) => {
    const sebelumnya = gender
    setGenderSibuk(true)
    setGender(nilai)
    setGenderPesan(null)
    try {
      const response = await fetch('/api/auth/saya', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ gender: nilai }),
      })
      if (!response.ok) throw new Error('gagal')
      setGenderPesan('Karakter peta tersimpan.')
    } catch {
      setGender(sebelumnya)
      setGenderPesan('Karakter belum tersimpan, coba lagi.')
    } finally {
      setGenderSibuk(false)
    }
  }

  const keluar = () => {
    setKeluarSibuk(true)
    setKeluarGagal(false)
    void fetch('/api/auth/keluar', { method: 'POST' })
      .then((response) => {
        if (!response.ok) throw new Error('gagal')
        navigator.serviceWorker?.controller?.postMessage('lakon-keluar')
        window.location.assign('/')
      })
      .catch(() => {
        setKeluarGagal(true)
        setKeluarSibuk(false)
      })
  }

  const hapus = () => {
    setHapusGagal(false)
    void clearAllProgress()
      .then(() => {
        setRuns([])
        setSigns([])
        setMinta(false)
        setDihapus(true)
      })
      .catch(() => setHapusGagal(true))
  }

  const hapusAkun = () => {
    setAkunGagal(false)
    setAkunSibuk(true)
    void fetch('/api/auth/saya', { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) throw new Error('gagal')
        navigator.serviceWorker?.controller?.postMessage('lakon-keluar')
        window.location.assign('/')
      })
      .catch(() => {
        setAkunGagal(true)
        setAkunSibuk(false)
      })
  }

  const totalSesi = runs.length
  const totalDikuasai = new Set(
    signs
      .filter((entry) => entry.status !== 'belum' && entry.status !== 'berlatih')
      .map((entry) => entry.signId),
  ).size

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung text-halaman sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/skenario"
              className="hidden items-center gap-2.5 text-xl font-bold sm:flex"
            >
              <Logo />
              Lakon
            </Link>
            <Link
              href="/skenario"
              className="flex min-h-11 items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline"
            >
              <ArrowLeft aria-hidden size={15} />
              Skenario
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="bg-halaman flex items-center rounded-full px-2 py-1.5 md:px-3">
              <SyncBadge />
            </span>
            <button
              type="button"
              onClick={keluar}
              disabled={keluarSibuk}
              className="border-halaman/30 hover:border-halaman/70 rounded-kontrol flex min-h-11 items-center gap-2 border px-3 text-sm transition-colors disabled:opacity-50"
              aria-label={keluarGagal ? 'Keluar gagal, coba lagi' : 'Keluar dari akun'}
            >
              <LogOut aria-hidden size={15} />
              <span className="hidden sm:inline">
                {keluarSibuk ? 'Keluar…' : keluarGagal ? 'Coba lagi' : 'Keluar'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-9 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:pb-12 lg:pt-12">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <AvatarAkun
                nama={nama}
                avatar={avatar}
                ukuran={96}
                className="border-sorot border-4 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)]"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={fotoSibuk}
                aria-label="Ganti foto profil"
                className="bg-primary hover:bg-primary-hover border-panggung absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              >
                <Camera aria-hidden size={16} strokeWidth={2.5} />
              </button>
              <input
                ref={fileRef}
                type="file"
                aria-label="Unggah foto profil"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => void simpanFoto(event.currentTarget.files?.[0])}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sorot font-mono text-xs font-bold uppercase tracking-[0.2em]">
                Profil
              </p>
              <h1 className="font-display wrap-break-word mt-1 text-2xl font-semibold sm:text-4xl">
                {nama}
              </h1>
              <p className="text-halaman/70 break-all">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="border-halaman/25 bg-halaman/10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wide">
                  <UserRound aria-hidden size={12} />
                  {peran}
                </span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={fotoSibuk}
                  className="border-halaman/25 hover:border-halaman/60 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Camera aria-hidden size={13} />
                  {fotoSibuk ? 'Menyimpan…' : avatar ? 'Ganti foto' : 'Tambah foto'}
                </button>
                {avatar ? (
                  <button
                    type="button"
                    onClick={() => void hapusFoto()}
                    disabled={fotoSibuk}
                    className="border-halaman/25 hover:border-halaman/60 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <ImageOff aria-hidden size={13} />
                    Hapus foto
                  </button>
                ) : null}
              </div>
              <p aria-live="polite" className="text-halaman/70 mt-1.5 min-h-5 text-xs">
                {fotoPesan}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 lg:w-[26rem]">
            {(
              [
                [Hand, siap ? `${totalDikuasai}/${totalIsyarat}` : '—', 'isyarat dikuasai'],
                [Repeat, siap ? String(totalSesi) : '—', 'sesi selesai'],
                [
                  Trophy,
                  siap ? String(ringkas('deaf').selesai + ringkas('service').selesai) : '—',
                  'adegan tuntas',
                ],
              ] as const
            ).map(([Ikon, nilai, label]) => (
              <div
                key={label}
                className="border-halaman/15 bg-halaman/5 rounded-kartu flex flex-col gap-1.5 border p-3 sm:p-4"
              >
                <span
                  aria-hidden
                  className="bg-sorot/15 text-sorot flex h-8 w-8 items-center justify-center rounded-lg"
                >
                  <Ikon size={16} strokeWidth={2.25} />
                </span>
                <dd className="font-display text-2xl font-semibold sm:text-3xl">{nilai}</dd>
                <dt className="text-halaman/60 text-xs leading-tight sm:text-sm">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
        <section>
          <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
            <Flag aria-hidden size={22} className="text-aksen" />
            Progres belajarmu
          </h2>
          <p className="text-teks-sekunder mt-1 text-sm">
            Dihitung terpisah untuk tiap peran. Adegan terbuka berurutan.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {PERAN.map((item) => {
              const data = ringkas(item.value)
              const persen =
                scenarios.length > 0 ? Math.round((data.selesai / scenarios.length) * 100) : 0
              const Ikon = item.icon
              return (
                <article
                  key={item.value}
                  className="border-border-halus bg-kartu shadow-kartu rounded-kartu-besar flex flex-col gap-4 border p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2.5 text-lg font-bold">
                      <span
                        aria-hidden
                        className="bg-panggung text-sorot flex h-9 w-9 items-center justify-center rounded-xl"
                      >
                        <Ikon size={18} strokeWidth={2.25} />
                      </span>
                      {item.judul}
                    </p>
                    <span className="text-teks-samar font-mono text-xs">{item.keterangan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {(
                      [
                        [siap ? `${data.selesai}/${scenarios.length}` : '—', 'adegan'],
                        [siap ? `${data.dikuasai.size}/${totalIsyarat}` : '—', 'isyarat'],
                        [siap ? String(data.runArah.length) : '—', 'sesi'],
                      ] as const
                    ).map(([nilai, label]) => (
                      <div key={label} className="bg-terangkat rounded-kartu px-2 py-3">
                        <p className="font-display text-2xl font-semibold">{nilai}</p>
                        <p className="text-teks-sekunder text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-teks-sekunder">Perjalanan</span>
                      <span className="font-mono">{persen}%</span>
                    </div>
                    <div
                      aria-hidden
                      className="bg-terangkat mt-1.5 h-2 overflow-hidden rounded-full"
                    >
                      <span
                        className="bg-aksen block h-full rounded-full transition-[width] duration-500"
                        style={{ width: `${persen}%` }}
                      />
                    </div>
                  </div>
                  <ol className="flex flex-col gap-2.5">
                    {data.perAdegan.map(({ scenario, kuasai, total, sesi }, index) => {
                      const palette = paletteFor(scenario.id)
                      const persenAdegan = total > 0 ? Math.round((kuasai / total) * 100) : 0
                      return (
                        <li key={scenario.id} className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                              sesi > 0 ? 'text-white' : 'bg-terangkat text-teks-samar'
                            }`}
                            style={sesi > 0 ? { backgroundColor: palette.accent } : undefined}
                          >
                            {sesi > 0 ? <CheckCircle2 size={14} strokeWidth={2.5} /> : index + 1}
                          </span>
                          <span className="block min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2 text-sm">
                              <span className="wrap-break-word min-w-0 font-bold">
                                {scenario.title.id}
                              </span>
                              <span className="text-teks-samar shrink-0 font-mono text-[0.65rem]">
                                {kuasai}/{total}
                                {sesi > 0 ? ` · ${sesi}×` : ''}
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className="bg-terangkat mt-1 block h-1.5 rounded-full"
                            >
                              <span
                                className="block h-full rounded-full"
                                style={{
                                  width: `${persenAdegan}%`,
                                  backgroundColor: palette.accent,
                                }}
                              />
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </article>
              )
            })}
          </div>
        </section>

        <section className="border-border-halus bg-kartu shadow-kartu rounded-kartu-besar flex flex-col gap-4 border p-5 sm:p-6">
          <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
            <UserRound aria-hidden size={22} className="text-aksen" />
            Karakter di peta perjalanan
          </h2>
          <p className="text-teks-sekunder text-sm">
            Karakter ini yang berjalan dari rumah ke tiap adegan di peta.
          </p>
          <PilihKarakter
            nama="karakter-profil"
            nilai={gender}
            onPilih={(nilai) => void simpanGender(nilai)}
            disabled={genderSibuk}
          />
          <p aria-live="polite" className="text-teks-sekunder min-h-5 text-xs">
            {genderPesan}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="border-border-halus bg-kartu shadow-kartu rounded-kartu-besar flex flex-col gap-4 border p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
              <ShieldCheck aria-hidden size={22} className="text-aksen" />
              Akun
            </h2>
            <p className="text-teks-sekunder text-sm">
              Video latihan tidak pernah meninggalkan perangkatmu. Progres tersimpan langsung di
              database akun ini, jadi bisa dilanjutkan dari perangkat mana pun.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={keluar}
                disabled={keluarSibuk}
                className="tombol-utama inline-flex items-center gap-2"
              >
                <LogOut aria-hidden size={16} />
                {keluarSibuk ? 'Keluar…' : keluarGagal ? 'Keluar gagal, coba lagi' : 'Keluar'}
              </button>
            </div>
          </section>

          <section className="border-border-tegas bg-kartu rounded-kartu-besar flex flex-col gap-3 border-2 p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold">
              <Trash2 aria-hidden size={22} className="text-aksen" />
              Hapus data belajar
            </h2>
            <p className="text-teks-sekunder max-w-prose text-sm">
              Menghapus seluruh progres isyarat, checkpoint, dan riwayat sesi dari database. Akunmu
              tetap ada. Tindakan ini tidak bisa dibatalkan.
            </p>
            <p aria-live="polite" className="text-sm">
              {dihapus ? (
                <span className="text-berhasil flex items-center gap-2 font-bold">
                  <CheckCircle2 aria-hidden size={16} />
                  Seluruh data belajarmu sudah dihapus.
                </span>
              ) : hapusGagal ? (
                <span className="text-galat flex items-center gap-2 font-bold">
                  <TriangleAlert aria-hidden size={16} />
                  Data belum terhapus. Periksa koneksi lalu coba lagi.
                </span>
              ) : null}
            </p>
            {akunDemo ? (
              <p className="text-sm font-bold">
                Akun demo dipakai bersama, jadi data belajarnya tidak bisa dihapus.
              </p>
            ) : minta ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-bold">Yakin hapus seluruh data belajarmu?</p>
                <button type="button" onClick={hapus} className="tombol-utama">
                  Ya, hapus sekarang
                </button>
                <button type="button" onClick={() => setMinta(false)} className="tombol-sekunder">
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDihapus(false)
                  setMinta(true)
                }}
                className="tombol-sekunder flex items-center gap-2 self-start text-sm"
              >
                <Trash2 aria-hidden size={15} />
                Hapus seluruh data belajarku
              </button>
            )}
            {akunDemo ? null : (
              <div className="border-border-tegas/60 mt-2 flex flex-col gap-3 border-t pt-4">
                <p className="text-teks-sekunder max-w-prose text-sm">
                  Mau berhenti sama sekali? Menghapus akun akan menghapus emailmu beserta seluruh
                  data belajarmu dari database, dan tidak bisa dibatalkan.
                </p>
                <p aria-live="polite" className="text-sm">
                  {akunGagal ? (
                    <span className="text-galat flex items-center gap-2 font-bold">
                      <TriangleAlert aria-hidden size={16} />
                      Akun belum terhapus. Periksa koneksi lalu coba lagi.
                    </span>
                  ) : null}
                </p>
                {mintaAkun ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-bold">Yakin hapus akunmu selamanya?</p>
                    <button
                      type="button"
                      onClick={hapusAkun}
                      disabled={akunSibuk}
                      className="tombol-utama"
                    >
                      {akunSibuk ? 'Menghapus…' : 'Ya, hapus akunku'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMintaAkun(false)}
                      disabled={akunSibuk}
                      className="tombol-sekunder"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMintaAkun(true)}
                    className="tombol-sekunder flex items-center gap-2 self-start text-sm"
                  >
                    <Trash2 aria-hidden size={15} />
                    Hapus akunku
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
