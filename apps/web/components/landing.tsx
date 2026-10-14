'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Compass,
  Eye,
  Hand,
  Map,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import { HeroLatar } from '@/components/hero-latar'
import { HeroIlustrasi, TEKS_ILUSTRASI } from '@/components/hero-ilustrasi'
import { PetaPerjalanan } from '@/components/peta-perjalanan'
import { TiraiPembuka } from '@/components/tirai-pembuka'
import { Tur } from '@/components/tur'
import { useContent } from '@/features/content/use-content'
import { scenarioSignIds } from '@/features/ui/adegan'
import { scenarioRank } from '@/features/ui/tokens'

const TrySignBlock = dynamic(() => import('@/components/try-sign-block'), {
  ssr: false,
  loading: () => <p className="text-teks-sekunder">Memuat…</p>,
})

const KUNCI_TUR = 'lakon:tur-landing'

const copy = {
  id: {
    langLabel: 'EN',
    langSwitch: 'Switch to English',
    navScenes: 'Adegan',
    navTry: 'Coba isyarat',
    navSignIn: 'Masuk',
    navTour: 'Tur',
    navTourLabel: 'Buka tur pengenalan',
    heroTitle: 'Latihan percakapan BISINDO di dalam transaksi yang benar-benar kamu jalani.',
    heroBody:
      'Lima adegan, dua peran. Pelajari isyarat dari video penanda asli atau avatar 3D tiga sudut, peragakan di depan kamera, umpan baliknya muncul di tempat.',
    heroCta: 'Coba satu isyarat',
    heroSecondary: 'Lihat lima adegan',
    tryEyebrow: 'Tanpa akun',
    tryTitle: 'Coba satu isyarat, sekarang',
    tryBody: 'Tanpa unduhan. Selesai dalam 20 detik.',
    trySteps: [
      [Eye, 'Lihat peragaan', 'Pilih video penanda manusia atau avatar 3D.'],
      [Camera, 'Nyalakan kamera', 'Atau pilih jalur tanpa kamera.'],
      [Hand, 'Peragakan', 'Hitung mundur 3 detik, lalu hasilnya muncul.'],
    ],
    tryPrivacy: 'Video diproses di perangkatmu dan tidak pernah dikirim.',
    tryCardTitle: 'Latihan contoh',
    tryCardMeta: '± 20 detik',
    tryMissing: 'Isyarat contoh sedang disiapkan. Pilih salah satu adegan untuk mulai belajar.',
    loading: 'Memuat…',
    loadBlock: 'Muat blok latihan',
    twoWayTitle: 'Satu adegan, dua peran',
    twoWayBody: 'Pilih peranmu di peta perjalanan. Setiap adegan bisa dijalani dari kedua sisi.',
    sideDeaf: 'Sisi Tuli',
    sideService: 'Sisi pekerja layanan',
    deafRole: 'Kamu yang berisyarat. Menjalani transaksi: memesan, bertanya, membayar.',
    serviceRole: 'Kamu yang membaca isyarat. Melayani pelanggan Tuli sampai tuntas.',
    scenariosTitle: 'Pilih tempat, bukan daftar kata',
    scenariosBody: 'Adegan terbuka satu demi satu. Mulai dari kedai kopi.',
    sceneLabel: 'Adegan',
    sceneStart: 'Mulai',
    sceneRepeat: 'Ulangi',
    sceneLocked: 'terkunci',
    mapStart: 'Mulai di sini',
    mapHome: 'Rumah',
    mapFinish: 'Garis akhir',
    mapSoon: 'segera',
    mapNewScene: 'Adegan baru',
    mapSoonBody: 'Sedang disiapkan. Nantikan di rilis berikutnya.',
    mapBuilding: 'Masih dibangun',
    scenarioMoods: {
      'kedai-kopi': 'Amber pagi, kayu jati',
      puskesmas: 'Hijau teduh, ruang tunggu',
      transportasi: 'Beton, biru peron',
      'wawancara-kerja': 'Kedai pagi, kayu terang',
      darurat: 'Cahaya siang, paling tenang',
    } as Record<string, string>,
    scenarioSigns: 'isyarat',
    scenarioMinutes: 'menit',
    accessTitle: 'Aksesibel sejak awal',
    accessItems: [
      'Tanpa suara sama sekali',
      'Kontras WCAG 2.2 AA',
      'Jalur tanpa kamera di tiap latihan',
      'Video tidak pernah keluar dari perangkat',
    ],
    footerCtaTitle: 'Siap naik panggung?',
    footerCtaBody: 'Buat akun, lalu mulai dari adegan kedai kopi.',
    footerCtaPrimary: 'Daftar sekarang',
    footerTagline:
      'Latihan percakapan BISINDO lewat transaksi sehari-hari, untuk pelanggan Tuli dan pekerja layanan.',
    footerExplore: 'Jelajahi',
    footerAccount: 'Akun',
    footerSignUp: 'Daftar',
    footerMeta: 'Alat belajar bahasa untuk dua pihak. Kode terbuka.',
    tour: {
      label: 'Tur pengenalan',
      lanjut: 'Lanjut',
      kembali: 'Kembali',
      selesai: 'Selesai',
      lewati: 'Tutup tur',
      urutan: (ke: number, total: number) => `Langkah ${ke} dari ${total}`,
    },
    tourSteps: [
      [
        'kenalan',
        'Selamat datang di Lakon',
        'Lakon melatih percakapan BISINDO lewat transaksi sehari-hari. Lihat peragaan, tiru di depan kamera, lalu jalani adegannya.',
      ],
      [
        'coba',
        'Coba tanpa akun',
        'Peragakan satu isyarat di sini. Videomu tetap di perangkat, dan ada jalur tanpa kamera.',
      ],
      ['peran', 'Pilih peranmu', 'Jalani adegan sebagai pelanggan Tuli atau pekerja layanan.'],
      ['adegan', 'Peta adegan', 'Adegan terbuka satu per satu. Mulai dari kedai kopi.'],
      ['tur', 'Buka tur lagi', 'Tombol ini membuka tur ini kapan saja.'],
    ],
  },
  en: {
    langLabel: 'ID',
    langSwitch: 'Ganti ke bahasa Indonesia',
    navScenes: 'Scenes',
    navTry: 'Try a sign',
    navSignIn: 'Sign in',
    navTour: 'Tour',
    navTourLabel: 'Open the intro tour',
    heroTitle: 'BISINDO conversation practice inside transactions you actually live.',
    heroBody:
      'Five scenes, two roles. Learn each sign from a real signer on video or a 3D avatar with three angles, perform it on camera, and get feedback on the spot.',
    heroCta: 'Try one sign',
    heroSecondary: 'See the five scenes',
    tryEyebrow: 'No account',
    tryTitle: 'Try one sign, right now',
    tryBody: 'No download. Done in 20 seconds.',
    trySteps: [
      [Eye, 'Watch the demo', 'A real signer on video or the 3D avatar.'],
      [Camera, 'Turn on the camera', 'Or take the no-camera path.'],
      [Hand, 'Perform it', 'A 3-second countdown, then your result.'],
    ],
    tryPrivacy: 'Video is processed on your device and never sent anywhere.',
    tryCardTitle: 'Sample practice',
    tryCardMeta: '± 20 sec',
    tryMissing: 'The sample sign is being prepared. Pick a scene to start learning.',
    loading: 'Loading…',
    loadBlock: 'Load the practice block',
    twoWayTitle: 'One scene, two roles',
    twoWayBody: 'Pick a role on your journey map. Every scene can be played from both sides.',
    sideDeaf: 'Deaf side',
    sideService: 'Service side',
    deafRole: 'You sign. Go through the transaction: order, ask, pay.',
    serviceRole: 'You read the signs. Serve a Deaf customer to the end.',
    scenariosTitle: 'Pick a place, not a word list',
    scenariosBody: 'Scenes unlock one after another. Start at the coffee shop.',
    sceneLabel: 'Scene',
    sceneStart: 'Start',
    sceneRepeat: 'Replay',
    sceneLocked: 'locked',
    mapStart: 'Start here',
    mapHome: 'Home',
    mapFinish: 'Finish line',
    mapSoon: 'coming soon',
    mapNewScene: 'A new scene',
    mapSoonBody: 'In the works. Watch for the next release.',
    mapBuilding: 'Under construction',
    scenarioMoods: {
      'kedai-kopi': 'Morning amber, teak wood',
      puskesmas: 'Calm green, waiting room',
      transportasi: 'Concrete, platform blue',
      'wawancara-kerja': 'Morning café, light wood',
      darurat: 'Daylight, calmest of all',
    } as Record<string, string>,
    scenarioSigns: 'signs',
    scenarioMinutes: 'min',
    accessTitle: 'Accessible by design',
    accessItems: [
      'No sound at all',
      'WCAG 2.2 AA contrast',
      'A no-camera path in every exercise',
      'Video never leaves the device',
    ],
    footerCtaTitle: 'Ready to take the stage?',
    footerCtaBody: 'Create an account, then start at the coffee shop.',
    footerCtaPrimary: 'Sign up now',
    footerTagline:
      'BISINDO conversation practice through everyday transactions, for Deaf customers and service workers.',
    footerExplore: 'Explore',
    footerAccount: 'Account',
    footerSignUp: 'Sign up',
    footerMeta: 'A language learning tool for both sides. Open source.',
    tour: {
      label: 'Intro tour',
      lanjut: 'Next',
      kembali: 'Back',
      selesai: 'Done',
      lewati: 'Close tour',
      urutan: (ke: number, total: number) => `Step ${ke} of ${total}`,
    },
    tourSteps: [
      [
        'kenalan',
        'Welcome to Lakon',
        'Lakon trains BISINDO conversation through everyday transactions. Watch the demo, mirror it on camera, then play the scene.',
      ],
      [
        'coba',
        'Try it without an account',
        'Perform one sign right here. Your video stays on your device, and there is a no-camera path.',
      ],
      ['peran', 'Pick your role', 'Play each scene as the Deaf customer or the service worker.'],
      ['adegan', 'Scene map', 'Scenes unlock one by one. Start at the coffee shop.'],
      ['tur', 'Open the tour again', 'This button opens the tour any time.'],
    ],
  },
} as const

type Lang = keyof typeof copy

function sudahTur() {
  try {
    return localStorage.getItem(KUNCI_TUR) === '1'
  } catch {
    return true
  }
}

function tandaiTur() {
  try {
    localStorage.setItem(KUNCI_TUR, '1')
  } catch {
    // penyimpanan diblokir: tur cukup muncul lagi di kunjungan berikutnya
  }
}

export function Landing() {
  const [lang, setLang] = useState<Lang>('id')
  const t = copy[lang]
  const other: Lang = lang === 'id' ? 'en' : 'id'

  const { content } = useContent()
  const scenarios = content
    ? Object.values(content.scenarios).sort((a, b) => scenarioRank(a.id) - scenarioRank(b.id))
    : []

  const trySectionRef = useRef<HTMLElement | null>(null)
  const [showTry, setShowTry] = useState(false)
  const [menempel, setMenempel] = useState(false)
  const [turBuka, setTurBuka] = useState(false)

  useEffect(() => {
    const section = trySectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShowTry(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const perbarui = () => setMenempel(window.scrollY > 8)
    perbarui()
    window.addEventListener('scroll', perbarui, { passive: true })
    return () => window.removeEventListener('scroll', perbarui)
  }, [])

  useEffect(() => {
    if (sudahTur()) return
    const tanpaGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const jeda = window.setTimeout(() => setTurBuka(true), tanpaGerak ? 300 : 2000)
    return () => window.clearTimeout(jeda)
  }, [])

  const tutupTur = () => {
    setTurBuka(false)
    tandaiTur()
  }

  const roles = [
    [Hand, t.sideDeaf, t.deafRole],
    [Eye, t.sideService, t.serviceRole],
  ] as const

  return (
    <main lang={lang} className="flex min-h-dvh flex-col">
      <TiraiPembuka />
      <Tur
        buka={turBuka}
        onTutup={tutupTur}
        teks={t.tour}
        langkah={t.tourSteps.map(([target, judul, isi]) => ({ target, judul, isi }))}
      />

      <header
        className={`text-halaman fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          menempel
            ? 'bg-panggung/90 border-halaman/10 shadow-lg shadow-black/20 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold">
            <Logo />
            Lakon
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2.5">
            <a
              href="#adegan"
              className="hover:text-sorot hidden px-2.5 py-2 text-sm font-medium transition-colors md:inline-block"
            >
              {t.navScenes}
            </a>
            <button
              type="button"
              data-tur="tur"
              onClick={() => setTurBuka(true)}
              aria-label={t.navTourLabel}
              className="hover:text-sorot rounded-kontrol flex min-h-11 items-center gap-1.5 px-2.5 text-sm font-medium transition-colors"
            >
              <Compass aria-hidden size={18} />
              <span className="hidden sm:inline">{t.navTour}</span>
            </button>
            <a
              href="#coba"
              className="bg-primary hover:bg-primary-hover rounded-kontrol hidden min-h-11 items-center px-4 text-sm font-bold text-white transition-colors sm:inline-flex"
            >
              {t.navTry}
            </a>
            <Link
              href="/masuk"
              className="border-halaman/30 hover:border-halaman/70 rounded-kontrol flex min-h-11 items-center border px-3.5 text-sm font-semibold transition-colors"
            >
              {t.navSignIn}
            </Link>
            <button
              type="button"
              onClick={() => setLang(other)}
              className="border-halaman/30 hover:border-halaman/70 rounded-kontrol min-h-11 border px-3 font-mono text-sm transition-colors"
              aria-label={t.langSwitch}
            >
              {t.langLabel}
            </button>
          </nav>
        </div>
      </header>

      <section className="bg-panggung text-halaman relative overflow-hidden pt-[4.25rem]">
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <HeroLatar />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pb-44 pt-10 sm:px-6 sm:pb-52 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="animasi-masuk masuk-setelah-tirai flex flex-col gap-6 text-center lg:text-left">
            <h1 className="font-display text-balance text-3xl font-semibold leading-[1.1] sm:text-4xl md:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="text-halaman/80 mx-auto max-w-prose text-pretty text-base leading-relaxed sm:text-lg lg:mx-0">
              {t.heroBody}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <a href="#coba" className="tombol-cta justify-center text-center">
                {t.heroCta}
                <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
              </a>
              <a
                href="#adegan"
                className="tombol-garis-terang bg-panggung/70 text-center backdrop-blur-sm"
              >
                {t.heroSecondary}
              </a>
            </div>
          </div>
          <div
            data-tur="kenalan"
            className="animasi-masuk masuk-setelah-tirai mx-auto w-full max-w-lg"
          >
            <HeroIlustrasi teks={TEKS_ILUSTRASI[lang]} />
          </div>
        </div>
      </section>

      <section id="coba" ref={trySectionRef} className="scroll-mt-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-7 lg:sticky lg:top-24 lg:self-start">
            <div>
              <p className="bg-primary-tint text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Sparkles aria-hidden size={14} strokeWidth={2.5} />
                {t.tryEyebrow}
              </p>
              <h2 className="font-display mt-3 text-balance text-3xl font-semibold sm:text-4xl">
                {t.tryTitle}
              </h2>
              <p className="text-teks-sekunder mt-2 text-base sm:text-lg">{t.tryBody}</p>
            </div>
            <ol className="flex flex-col gap-5">
              {t.trySteps.map(([Ikon, judul, isi], index) => (
                <li key={judul} className="relative flex gap-4">
                  {index < t.trySteps.length - 1 ? (
                    <span
                      aria-hidden
                      className="bg-border-halus absolute -bottom-5 left-5 top-11 w-0.5 -translate-x-1/2"
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className="bg-panggung text-sorot relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  >
                    <Ikon size={18} strokeWidth={2.25} />
                  </span>
                  <div className="pt-0.5">
                    <p className="font-bold">
                      <span className="text-primary mr-1.5 font-mono">{index + 1}.</span>
                      {judul}
                    </p>
                    <p className="text-teks-sekunder mt-0.5 text-sm leading-relaxed">{isi}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="border-border-halus bg-kartu rounded-kartu flex items-start gap-2.5 border p-3.5 text-sm leading-relaxed">
              <ShieldCheck aria-hidden size={18} className="text-berhasil mt-0.5 shrink-0" />
              {t.tryPrivacy}
            </p>
          </div>

          <div
            data-tur="coba"
            className="border-border-halus bg-kartu shadow-kartu-angkat rounded-kartu-besar overflow-hidden border"
          >
            <div className="bg-panggung text-halaman flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Hand aria-hidden size={16} className="text-sorot" />
                {t.tryCardTitle}
              </p>
              <span className="text-halaman/60 font-mono text-xs">{t.tryCardMeta}</span>
            </div>
            <div className="p-3 sm:p-5">
              {showTry ? (
                <TrySignBlock lang={lang} missingText={t.tryMissing} loadingText={t.loading} />
              ) : (
                <button type="button" onClick={() => setShowTry(true)} className="tombol-sekunder">
                  {t.loadBlock}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-terangkat">
        <div data-tur="peran" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
            <span
              aria-hidden
              className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            >
              <Users size={20} strokeWidth={2.25} />
            </span>
            {t.twoWayTitle}
          </h2>
          <p className="text-teks-sekunder mt-2 text-base sm:text-lg">{t.twoWayBody}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roles.map(([Ikon, judul, isi]) => (
              <div
                key={judul}
                className="border-border-halus bg-kartu shadow-kartu rounded-kartu flex flex-col gap-2 border p-5"
              >
                <span className="flex items-center gap-2.5 text-lg font-bold">
                  <span
                    aria-hidden
                    className="bg-terangkat text-aksen flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  >
                    <Ikon size={18} strokeWidth={2.25} />
                  </span>
                  {judul}
                </span>
                <span className="text-teks-sekunder text-sm leading-relaxed">{isi}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="adegan"
        className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16"
      >
        <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
          <span
            aria-hidden
            className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          >
            <Map size={20} strokeWidth={2.25} />
          </span>
          {t.scenariosTitle}
        </h2>
        <p className="text-teks-sekunder mt-2 text-base sm:text-lg">{t.scenariosBody}</p>
        <div data-tur="adegan" className="mt-6">
          <PetaPerjalanan
            simpul={scenarios.map((scenario) => ({
              id: scenario.id,
              judul: scenario.title[lang],
              suasana: t.scenarioMoods[scenario.id] ?? '',
              isyarat: scenarioSignIds(scenario).size,
              menit: scenario.estimatedMinutes ?? 15,
              href: '/daftar',
            }))}
            posisiPemain={-1}
            karakter="robot"
            teks={{
              adegan: t.sceneLabel,
              mulai: t.sceneStart,
              ulangi: t.sceneRepeat,
              terkunci: t.sceneLocked,
              isyarat: t.scenarioSigns,
              menit: t.scenarioMinutes,
              mulaiDiSini: t.mapStart,
              rumah: t.mapHome,
              garisAkhir: t.mapFinish,
              segera: t.mapSoon,
              adeganBaru: t.mapNewScene,
              segeraKeterangan: t.mapSoonBody,
              dibangun: t.mapBuilding,
            }}
          />
        </div>
      </section>

      <section className="bg-terangkat">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
            <span
              aria-hidden
              className="bg-panggung text-sorot flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            >
              <ShieldCheck size={20} strokeWidth={2.25} />
            </span>
            {t.accessTitle}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {t.accessItems.map((item) => (
              <li
                key={item}
                className="border-border-halus bg-kartu shadow-kartu flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <CheckCircle2 aria-hidden size={15} className="text-berhasil shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="bg-panggung text-halaman relative overflow-hidden">
        <div aria-hidden className="garis-tenda relative h-1.5 opacity-70" />
        <div aria-hidden className="sorot-panggung absolute inset-0" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="border-halaman/10 flex flex-col gap-6 border-b py-12 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                {t.footerCtaTitle}
              </h2>
              <p className="text-halaman/70 mt-2 text-base sm:text-lg">{t.footerCtaBody}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/daftar" className="tombol-cta">
                {t.footerCtaPrimary}
                <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
              </Link>
              <a href="#coba" className="tombol-garis-terang">
                {t.navTry}
              </a>
            </div>
          </div>

          <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
              <p className="flex items-center gap-2.5 text-xl font-bold">
                <Logo />
                Lakon
              </p>
              <p className="text-halaman/65 max-w-sm text-sm leading-relaxed">{t.footerTagline}</p>
            </div>
            <nav aria-label={t.footerExplore} className="flex flex-col gap-1 text-sm">
              <p className="text-halaman/50 mb-1 font-mono text-xs uppercase tracking-wider">
                {t.footerExplore}
              </p>
              <a href="#coba" className="hover:text-sorot w-fit py-1.5 transition-colors">
                {t.navTry}
              </a>
              <a href="#adegan" className="hover:text-sorot w-fit py-1.5 transition-colors">
                {t.navScenes}
              </a>
              <button
                type="button"
                onClick={() => setTurBuka(true)}
                className="hover:text-sorot w-fit py-1.5 text-left transition-colors"
              >
                {t.tour.label}
              </button>
            </nav>
            <nav aria-label={t.footerAccount} className="flex flex-col gap-1 text-sm">
              <p className="text-halaman/50 mb-1 font-mono text-xs uppercase tracking-wider">
                {t.footerAccount}
              </p>
              <Link href="/masuk" className="hover:text-sorot w-fit py-1.5 transition-colors">
                {t.navSignIn}
              </Link>
              <Link href="/daftar" className="hover:text-sorot w-fit py-1.5 transition-colors">
                {t.footerSignUp}
              </Link>
            </nav>
          </div>

          <div className="border-halaman/10 text-halaman/50 flex flex-col gap-1 border-t py-5 text-xs sm:flex-row sm:justify-between">
            <p>© 2026 Lakon</p>
            <p>{t.footerMeta}</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
