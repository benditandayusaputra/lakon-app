import Link from 'next/link'
import { getSessionUser } from '@/db/auth'

export async function RoleGuard({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser().catch(() => null)
  if (!user || (user.role !== 'admin' && user.role !== 'validator')) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="font-display text-2xl font-bold">Halaman internal</h1>
        <p>
          Rute /dev dan /tools hanya untuk peran admin atau validator.
          {user ? ` Akunmu berperan ${user.role}.` : ' Kamu belum masuk.'}
        </p>
        <p>
          <Link href="/masuk" className="tombol-utama inline-block">
            Masuk
          </Link>
        </p>
      </main>
    )
  }
  return <>{children}</>
}
