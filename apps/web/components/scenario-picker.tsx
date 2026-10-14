'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, Flag, Hand, Info, LogOut, MapPinned, Repeat, Users } from 'lucide-react'
import { useContent } from '@/features/content/use-content'
import {
  bacaProgres,
  type Arah,
  type RunEntry,
  type SignProgressEntry,
} from '@/features/progress/store'
import { AvatarAkun } from '@/components/avatar-akun'
import { Logo } from '@/components/logo'
import { PetaPerjalanan } from '@/components/peta-perjalanan'
import { SyncBadge } from '@/components/sync-badge'
import { scenarioSignIds } from '@/features/ui/adegan'
import { paletteFor, scenarioRank } from '@/features/ui/tokens'

const SCENE_MOODS: Record<string, string> = {
  'kedai-kopi': 'Amber pagi, kayu jati',
  puskesmas: 'Hijau teduh, ruang tunggu',
  transportasi: 'Beton, biru peron',
  'wawancara-kerja': 'Kedai pagi, kayu terang',
  darurat: 'Cahaya siang, paling tenang',
}

const ROLES = [
  {
    value: 'deaf',
    icon: Hand,
    title: 'Sisi Tuli',
    body: 'Kamu yang berisyarat. Peragakan tiap isyarat di depan kamera.',
    ctaName: 'sisi Tuli',
  },
  {
    value: 'service',
    icon: Eye,
    title: 'Sisi pekerja layanan',
    body: 'Kamu yang membaca isyarat. Tebak maknanya lalu layani sampai tuntas.',
    ctaName: 'sisi pekerja layanan',
  },
] as const

export function ScenarioPicker() {
  const router = useRouter()
  const { content, error } = useContent()
  const [direction, setDirection] = useState<Arah>('deaf')
  const [runs, setRuns] = useState<RunEntry[]>([])
  const [signs, setSigns] = useState<SignProgressEntry[]>([])
  const [account, setAccount] = useState<{
    displayName: string
    avatar: string | null
    gender: 'perempuan' | 'laki-laki' | null
  } | null>(null)
  const [progresSiap, setProgresSiap] = useState(false)
  const [progresGagal, setProgresGagal] = useState(false)
  const [akunSiap, setAkunSiap] = useState(false)
  const [keluarSibuk, setKeluarSibuk] = useState(false)
  const [keluarGagal, setKeluarGagal] = useState(false)

  useEffect(() => {
    void bacaProgres()
      .then((progres) => {
        setRuns(progres.runs)
        setSigns(progres.signs)
      })
      .catch(() => setProgresGagal(true))
      .finally(() => setProgresSiap(true))
    void fetch('/api/auth/saya')
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          data: {
            user: {
              displayName: string
              avatar: string | null
              gender: 'perempuan' | 'laki-laki' | null
            } | null
          } | null,
        ) => setAccount(data?.user ?? null),
      )
      .catch(() => {})
      .finally(() => setAkunSiap(true))
  }, [])

  const scenarios = useMemo(
    () =>
      content
        ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
        : [],
    [content],
  )

  const runsByScenario = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const run of runs) {
      if (run.direction !== direction) continue
      counts[run.scenarioId] = (counts[run.scenarioId] ?? 0) + 1
    }
    return counts
  }, [runs, direction])

  const masteredSigns = useMemo(
    () =>
      new Set(
        signs
          .filter(
            (entry) =>
              entry.direction === direction &&
              entry.status !== 'belum' &&
              entry.status !== 'berlatih',
          )
          .map((entry) => entry.signId),
      ),
    [signs, direction],
  )

  const totalRuns = Object.values(runsByScenario).reduce((sum, count) => sum + count, 0)
  const activeRole = ROLES.find((role) => role.value === direction) ?? ROLES[0]
  const selesai = scenarios.filter((scenario) => (runsByScenario[scenario.id] ?? 0) > 0).length
  const posisiPemain = scenarios.reduce(
    (akhir, scenario, index) => ((runsByScenario[scenario.id] ?? 0) > 0 ? index : akhir),
    -1,
  )
  const totalIsyarat = new Set(scenarios.flatMap((scenario) => [...scenarioSignIds(scenario)])).size
  const persenAdegan = scenarios.length > 0 ? Math.round((selesai / scenarios.length) * 100) : 0
  const berikutnya = scenarios.find((scenario, index) => {
    const sebelumnya = scenarios[index - 1]
    const terkunci = index > 0 && (runsByScenario[sebelumnya?.id ?? ''] ?? 0) === 0
    return !terkunci && (runsByScenario[scenario.id] ?? 0) === 0
  })

  const siap = progresSiap && scenarios.length > 0

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

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="border-halaman/10 bg-panggung text-halaman sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/skenario" className="flex items-center gap-2.5 text-xl font-bold">
            <Logo />
            Lakon
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="bg-halaman flex items-center rounded-full px-2 py-1.5 md:px-3">
              <SyncBadge />
            </span>
            <Link
              href="/profil"
              aria-label="Profil"
              className="border-halaman/30 hover:border-halaman/70 rounded-kontrol flex min-h-11 items-center gap-2 border px-3 text-sm transition-colors"
            >
              {akunSiap ? (
                <>
                  <AvatarAkun
                    nama={account?.displayName ?? 'Profil'}
                    avatar={account?.avatar ?? null}
                    ukuran={24}
                  />
                  <span aria-hidden className="max-w-28 truncate max-[359px]:sr-only">
                    {account?.displayName ?? 'Profil'}
                  </span>
                </>
              ) : (
                <span aria-hidden className="bg-halaman/15 h-6 w-16 animate-pulse rounded-full" />
              )}
            </Link>
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
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 pb-10 pt-9 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:pb-14 lg:pt-12">
          <div className="flex flex-col gap-4">
            <p className="text-sorot flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em]">
              <MapPinned aria-hidden size={14} />
              Peta perjalananmu
            </p>
            <h1 className="font-display text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Perjalananmu, satu adegan demi satu adegan.
            </h1>
            <p className="text-halaman/80 max-w-prose text-pretty">
              Adegan berikutnya terbuka setelah adegan sebelumnya kamu selesaikan. Progres dihitung
              terpisah untuk tiap peran.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-3 gap-3">
              {(
                [
                  [Flag, siap ? `${selesai}/${scenarios.length}` : '—', 'adegan selesai'],
                  [Hand, siap ? `${masteredSigns.size}/${totalIsyarat}` : '—', 'isyarat dikuasai'],
                  [Repeat, siap ? String(totalRuns) : '—', 'sesi selesai'],
                ] as const
              ).map(([Ikon, value, label]) => (
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
                  <dd className="font-display text-2xl font-semibold sm:text-3xl">{value}</dd>
                  <dt className="text-halaman/60 text-xs leading-tight sm:text-sm">{label}</dt>
                </div>
              ))}
            </dl>
            <div className="border-halaman/15 bg-halaman/5 rounded-kartu flex flex-col gap-2 border p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-bold">
                  <activeRole.icon aria-hidden size={15} className="text-sorot" />
                  {activeRole.title}
                </span>
                <span className="text-halaman/70 font-mono text-xs">
                  {siap ? `${persenAdegan}% perjalanan` : 'memuat progres…'}
                </span>
              </div>
              <div aria-hidden className="bg-halaman/15 h-2 overflow-hidden rounded-full">
                <span
                  className="bg-sorot block h-full rounded-full transition-[width] duration-500"
                  style={{ width: siap ? `${persenAdegan}%` : 0 }}
                />
              </div>
              <p className="text-halaman/70 text-xs">
                {!siap
                  ? 'Progres kamu sedang dimuat.'
                  : berikutnya
                    ? `Berikutnya: ${berikutnya.title.id}.`
                    : selesai === scenarios.length
                      ? 'Semua adegan selesai untuk peran ini. Adegan baru segera hadir.'
                      : 'Mulai dari adegan pertama.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 pb-16 pt-8 sm:px-6 xl:grid-cols-[19rem_minmax(0,1fr)] xl:gap-8">
        <aside className="flex flex-col gap-5 xl:sticky xl:top-24 xl:self-start">
          <fieldset>
            <legend className="font-display flex items-center gap-2 text-xl font-semibold">
              <Users aria-hidden size={20} className="text-aksen" />
              Pilih peranmu
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {ROLES.map((role) => {
                const active = direction === role.value
                const RoleIcon = role.icon
                return (
                  <label
                    key={role.value}
                    className={`rounded-kartu flex cursor-pointer flex-col gap-2 border-2 p-4 transition-all ${
                      active
                        ? 'border-primary bg-primary-tint shadow-kartu-angkat'
                        : 'border-border-halus bg-kartu shadow-kartu hover:border-border-tegas'
                    }`}
                  >
                    <input
                      type="radio"
                      name="arah"
                      value={role.value}
                      checked={active}
                      onChange={() => setDirection(role.value)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2.5 font-bold">
                      <span
                        aria-hidden
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          active ? 'bg-primary text-white' : 'bg-terangkat text-aksen'
                        }`}
                      >
                        <RoleIcon size={17} strokeWidth={2.25} />
                      </span>
                      {role.title}
                    </span>
                    <span className="text-teks-sekunder text-sm">{role.body}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {siap && berikutnya ? (
            <div
              className="border-border-halus bg-kartu shadow-kartu rounded-kartu hidden flex-col gap-3 border p-4 xl:flex"
              style={{ borderTopColor: paletteFor(berikutnya.id).accent, borderTopWidth: 4 }}
            >
              <p className="text-teks-samar font-mono text-xs font-bold uppercase tracking-[0.2em]">
                Berikutnya untuk {activeRole.ctaName}
              </p>
              <p className="font-display text-lg font-semibold leading-tight">
                {berikutnya.title.id}
              </p>
              <p className="text-teks-sekunder text-sm">{SCENE_MOODS[berikutnya.id] ?? ''}</p>
              <button
                type="button"
                onClick={() => router.push(`/skenario/${berikutnya.id}?arah=${direction}`)}
                className="tombol-utama inline-flex items-center justify-center gap-2"
              >
                Mulai adegan
                <ArrowRight aria-hidden size={16} />
              </button>
            </div>
          ) : null}

          <p className="text-teks-sekunder hidden items-center gap-2 text-sm xl:flex">
            <Hand aria-hidden size={16} className="text-aksen" />
            Isyarat dikuasai di {activeRole.ctaName}:{' '}
            <strong>{siap ? masteredSigns.size : '—'}</strong>
          </p>
        </aside>

        <div className="min-w-0">
          {error || progresGagal ? (
            <div
              role="alert"
              className="border-border-halus bg-kartu shadow-kartu rounded-kartu mb-6 flex items-start gap-3 border p-5"
            >
              <Info aria-hidden size={20} className="text-galat mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">
                  {error ? 'Adegan gagal dimuat' : 'Progres gagal dimuat'}
                </p>
                <p className="text-teks-sekunder mt-1 text-sm">
                  {error ?? 'Periksa koneksi internet.'} Muat ulang halaman untuk mencoba lagi.
                </p>
              </div>
            </div>
          ) : null}

          {scenarios.length > 0 && progresSiap ? (
            <PetaPerjalanan
              key={direction}
              simpul={scenarios.map((scenario, index) => {
                const signIds = scenarioSignIds(scenario)
                const masteredHere = [...signIds].filter((id) => masteredSigns.has(id)).length
                const jumlahRun = runsByScenario[scenario.id] ?? 0
                const sebelumnya = scenarios[index - 1]
                const terkunci = index > 0 && (runsByScenario[sebelumnya?.id ?? ''] ?? 0) === 0
                return {
                  id: scenario.id,
                  judul: scenario.title.id,
                  suasana: SCENE_MOODS[scenario.id] ?? '',
                  isyarat: signIds.size,
                  menit: scenario.estimatedMinutes ?? 15,
                  href: `/skenario/${scenario.id}?arah=${direction}`,
                  status: terkunci ? 'kunci' : jumlahRun > 0 ? 'selesai' : 'buka',
                  persen: signIds.size > 0 ? Math.round((masteredHere / signIds.size) * 100) : 0,
                  keterangan: terkunci
                    ? `Selesaikan “${sebelumnya?.title.id ?? 'adegan sebelumnya'}” dulu untuk membukanya.`
                    : jumlahRun > 0
                      ? `${SCENE_MOODS[scenario.id] ?? ''} · diselesaikan ${jumlahRun}×`
                      : undefined,
                }
              })}
              posisiPemain={posisiPemain}
              karakter={account?.gender ?? 'robot'}
              teks={{
                adegan: 'Adegan',
                mulai: 'Mulai',
                ulangi: 'Ulangi',
                terkunci: 'terkunci',
                isyarat: 'isyarat',
                menit: 'menit',
                mulaiDiSini: 'Mulai di sini',
                kamuDiSini: 'Kamu di sini',
                rumah: 'Rumah',
                garisAkhir: 'Garis akhir',
                segera: 'segera',
                adeganBaru: 'Adegan baru',
                segeraKeterangan: 'Sedang disiapkan. Nantikan di rilis berikutnya.',
                dibangun: 'Masih dibangun',
                sudahSelesai: 'sudah selesai',
                belumDimulai: 'belum dimulai',
                dikuasai: 'isyarat dikuasai',
              }}
              onSampai={(item) => router.push(item.href)}
            />
          ) : !error ? (
            <div className="border-border-halus bg-kartu rounded-kartu-besar flex animate-pulse flex-col gap-4 border p-6">
              <span className="sr-only">Memuat adegan…</span>
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex gap-4">
                  <div className="bg-terangkat h-16 w-16 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2.5 py-2">
                    <div className="bg-terangkat h-4 w-1/3 rounded-lg" />
                    <div className="bg-terangkat h-5 w-2/3 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <footer className="border-border-halus bg-terangkat border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <p className="text-teks-sekunder flex items-center gap-2 text-sm">
            <Hand aria-hidden size={16} className="text-aksen" />
            Isyarat dikuasai: <strong>{siap ? masteredSigns.size : '—'}</strong>
          </p>
          <p className="text-teks-sekunder text-sm">
            Peran aktif: <strong className="text-teks">{activeRole.title}</strong>
          </p>
        </div>
      </footer>
    </main>
  )
}
