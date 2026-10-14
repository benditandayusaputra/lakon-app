'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Hand,
  KeyRound,
  LogIn,
  Mail,
  Monitor,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserPlus,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { HeroIlustrasi, TEKS_ILUSTRASI } from '@/components/hero-ilustrasi'
import { HeroLatar } from '@/components/hero-latar'
import { Logo } from '@/components/logo'
import { PilihKarakter, type Gender } from '@/components/pilih-karakter'

type Mode = 'masuk' | 'daftar'

type FieldErrors = Partial<Record<'nama' | 'email' | 'sandi', string>>

const label: Record<
  Mode,
  {
    title: string
    lead: string
    action: string
    panelTitle: string
    panelBody: string
  }
> = {
  masuk: {
    title: 'Selamat datang kembali',
    lead: 'Masuk untuk melanjutkan latihan dari adegan terakhirmu.',
    action: 'Masuk',
    panelTitle: 'Panggungmu masih menunggu.',
    panelBody:
      'Kemajuanmu tersimpan per adegan dan per peran. Lanjutkan tepat dari tempatmu berhenti.',
  },
  daftar: {
    title: 'Buat akun',
    lead: 'Satu akun untuk lima adegan dan dua peran.',
    action: 'Buat akun',
    panelTitle: 'Naik ke panggung pertamamu.',
    panelBody:
      'Simpan kemajuan latihanmu: isyarat yang sudah lulus, adegan yang sedang berjalan, dan hasil ujian percakapan.',
  },
}

const features = [
  { icon: Hand, title: 'Peraga manusia dan 3D' },
  { icon: Monitor, title: 'Verifikasi di perangkatmu' },
  { icon: Sparkles, title: 'Dua peran per adegan' },
]

const tabs: { mode: Mode; href: string; teks: string; icon: LucideIcon }[] = [
  { mode: 'masuk', href: '/masuk', teks: 'Masuk', icon: LogIn },
  { mode: 'daftar', href: '/daftar', teks: 'Daftar', icon: UserPlus },
]

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="text-ulang flex items-center gap-1.5 text-sm font-bold">
      <TriangleAlert aria-hidden className="h-4 w-4 shrink-0" />
      {message}
    </p>
  )
}

function Field({
  id,
  label: fieldLabel,
  icon,
  error,
  children,
}: {
  id: string
  label: string
  icon: LucideIcon
  error?: string
  children: ReactNode
}) {
  const FieldIcon = icon
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {fieldLabel}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center ${
            error ? 'text-ulang' : 'text-teks-samar'
          }`}
        >
          <FieldIcon aria-hidden className="h-5 w-5" />
        </span>
        {children}
      </div>
      <FieldError id={`galat-${id}`} message={error} />
    </div>
  )
}

function inputClass(invalid: boolean) {
  return `bg-kartu min-h-12 w-full rounded-kontrol border-2 pl-11 text-base transition-colors ${
    invalid
      ? 'border-ulang'
      : 'border-border-halus hover:border-border-tegas focus:border-border-tegas'
  }`
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const t = label[mode]
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<{ pesan: string; sistem: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [showSandi, setShowSandi] = useState(false)
  const [sandiValue, setSandiValue] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState<Gender>(null)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nama = String(data.get('nama') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const sandi = String(data.get('sandi') ?? '')

    const next: FieldErrors = {}
    if (mode === 'daftar' && nama.length < 2) next.nama = 'Isi nama panggilanmu.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Alamat email belum lengkap.'
    if (sandi.length < 8) next.sandi = 'Kata sandi minimal 8 karakter.'
    setErrors(next)
    setFormError(null)
    if (Object.keys(next).length > 0) return

    setBusy(true)
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          mode === 'daftar' ? { nama, email, sandi, jenisKelamin } : { email, sandi },
        ),
      })
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        field?: keyof FieldErrors
      }
      if (!response.ok || !result.ok) {
        if (result.field && result.error) {
          setErrors({ [result.field]: result.error })
        } else {
          setFormError({
            pesan:
              result.error ??
              (mode === 'daftar'
                ? 'Akun belum bisa dibuat. Periksa datamu lalu coba lagi.'
                : 'Email atau kata sandi tidak cocok.'),
            sistem: response.status >= 500,
          })
        }
        setBusy(false)
        return
      }
      router.push('/skenario')
    } catch {
      setFormError({ pesan: 'Koneksi gagal. Periksa jaringanmu lalu coba lagi.', sistem: true })
      setBusy(false)
    }
  }

  const sandiCukup = sandiValue.length >= 8

  return (
    <div className="bg-halaman flex min-h-dvh flex-col">
      <div aria-hidden className="garis-tenda h-1.5 shrink-0" />

      <header className="bg-panggung text-halaman lg:hidden">
        <div className="px-4 py-4 sm:px-10">
          <Link href="/" className="flex w-fit items-center gap-2 text-lg font-bold">
            <Logo className="h-6 w-6" />
            Lakon
          </Link>
        </div>
      </header>

      <div className="flex flex-1 lg:grid lg:grid-cols-[10fr_9fr]">
        <aside className="bg-panggung text-halaman relative hidden overflow-hidden lg:flex lg:flex-col">
          <div aria-hidden className="sorot-panggung absolute inset-0" />
          <HeroLatar ringkas />

          <div className="relative flex flex-1 flex-col gap-10 px-10 pb-44 pt-10 xl:px-16">
            <Link href="/" className="flex w-fit items-center gap-2.5 text-xl font-bold">
              <Logo />
              Lakon
            </Link>

            <div className="animasi-masuk my-auto flex max-w-xl flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-balance text-4xl font-semibold leading-[1.1] xl:text-[2.75rem]">
                  {t.panelTitle}
                </h2>
                <p className="text-halaman/75 text-pretty text-lg leading-relaxed">{t.panelBody}</p>
              </div>
              <div className="w-full max-w-sm">
                <HeroIlustrasi teks={TEKS_ILUSTRASI.id} />
              </div>
              <ul className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <li
                    key={feature.title}
                    className="border-halaman/15 bg-halaman/5 flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium"
                  >
                    <feature.icon aria-hidden className="text-sorot h-4 w-4" />
                    {feature.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="bg-terangkat flex flex-1 items-center justify-center px-4 py-8 sm:px-10 sm:py-14">
          <div className="animasi-masuk flex w-full max-w-md flex-col gap-5">
            <div className="border-border-halus bg-kartu shadow-kartu-angkat rounded-kartu-besar flex flex-col gap-6 border p-5 sm:p-8">
              <nav
                aria-label="Akun"
                className="bg-terangkat rounded-kontrol grid grid-cols-2 gap-1 p-1"
              >
                {tabs.map((tab) => (
                  <Link
                    key={tab.mode}
                    href={tab.href}
                    aria-current={tab.mode === mode ? 'page' : undefined}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors ${
                      tab.mode === mode
                        ? 'bg-kartu text-teks shadow-kartu'
                        : 'text-teks-sekunder hover:text-teks'
                    }`}
                  >
                    <tab.icon aria-hidden className="h-4 w-4" />
                    {tab.teks}
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col gap-2">
                <h1 className="font-display text-3xl font-semibold leading-tight sm:text-[2.1rem]">
                  {t.title}
                </h1>
                <p className="text-teks-sekunder">{t.lead}</p>
              </div>

              <form onSubmit={submit} noValidate className="flex flex-col gap-5">
                {mode === 'daftar' ? (
                  <Field id="nama" label="Nama panggilan" icon={UserRound} error={errors.nama}>
                    <input
                      id="nama"
                      name="nama"
                      autoComplete="nickname"
                      placeholder="Nama yang dipakai di adegan"
                      aria-invalid={Boolean(errors.nama)}
                      aria-describedby={errors.nama ? 'galat-nama' : undefined}
                      className={inputClass(Boolean(errors.nama))}
                    />
                  </Field>
                ) : null}

                <Field id="email" label="Email" icon={Mail} error={errors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'galat-email' : undefined}
                    className={inputClass(Boolean(errors.email))}
                  />
                </Field>

                <div className="flex flex-col gap-1.5">
                  <Field id="sandi" label="Kata sandi" icon={KeyRound} error={errors.sandi}>
                    <input
                      id="sandi"
                      name="sandi"
                      type={showSandi ? 'text' : 'password'}
                      autoComplete={mode === 'daftar' ? 'new-password' : 'current-password'}
                      placeholder={mode === 'daftar' ? 'Minimal 8 karakter' : 'Kata sandimu'}
                      onChange={(event) => setSandiValue(event.currentTarget.value)}
                      aria-invalid={Boolean(errors.sandi)}
                      aria-describedby={
                        errors.sandi
                          ? 'galat-sandi'
                          : mode === 'daftar'
                            ? 'bantuan-sandi'
                            : undefined
                      }
                      className={`${inputClass(Boolean(errors.sandi))} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSandi((v) => !v)}
                      aria-label={showSandi ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                      aria-pressed={showSandi}
                      className="text-teks-samar hover:text-teks rounded-kontrol absolute inset-y-1 right-1 flex w-11 items-center justify-center transition-colors"
                    >
                      {showSandi ? (
                        <EyeOff aria-hidden className="h-5 w-5" />
                      ) : (
                        <Eye aria-hidden className="h-5 w-5" />
                      )}
                    </button>
                  </Field>
                  {mode === 'daftar' && !errors.sandi ? (
                    <p
                      id="bantuan-sandi"
                      className={`flex items-center gap-1.5 text-sm ${
                        sandiCukup ? 'text-berhasil font-bold' : 'text-teks-samar'
                      }`}
                    >
                      <Check aria-hidden className={`h-4 w-4 ${sandiCukup ? '' : 'opacity-40'}`} />
                      Minimal 8 karakter
                    </p>
                  ) : null}
                </div>

                {mode === 'daftar' ? (
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <p className="text-sm font-bold">Karakter di peta perjalanan</p>
                      <p className="text-teks-samar mt-0.5 text-xs">
                        Yang berjalan di peta adeganmu. Bisa diganti nanti di profil.
                      </p>
                    </div>
                    <PilihKarakter
                      nama="jenisKelamin"
                      nilai={jenisKelamin}
                      onPilih={setJenisKelamin}
                    />
                  </div>
                ) : null}

                {formError ? (
                  <p
                    role="alert"
                    className={`rounded-kontrol flex items-start gap-2.5 border-2 px-4 py-3 font-bold ${
                      formError.sistem
                        ? 'border-galat/40 bg-galat/5 text-galat'
                        : 'border-ulang/40 bg-ulang/5 text-ulang'
                    }`}
                  >
                    <TriangleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
                    {formError.pesan}
                  </p>
                ) : null}

                <button type="submit" disabled={busy} className="tombol-cta w-full text-base">
                  {busy ? (
                    <>
                      <span
                        aria-hidden
                        className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                      Sebentar…
                    </>
                  ) : (
                    <>
                      {t.action}
                      <ArrowRight aria-hidden className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="text-teks-samar flex items-center justify-center gap-1.5 text-center text-xs">
              <ShieldCheck aria-hidden className="h-4 w-4 shrink-0" />
              Video latihan tidak pernah meninggalkan perangkatmu.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
