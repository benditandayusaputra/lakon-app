import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getSessionUser } from '@/db/auth'

export const metadata: Metadata = { title: 'Masuk | Lakon' }

export default async function MasukPage() {
  const user = await getSessionUser().catch(() => null)
  if (user) redirect('/skenario')
  return <AuthForm mode="masuk" />
}
