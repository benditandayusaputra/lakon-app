import { redirect } from 'next/navigation'
import { Landing } from '@/components/landing'
import { getSessionUser } from '@/db/auth'

export default async function Page() {
  const user = await getSessionUser().catch(() => null)
  if (user) redirect('/skenario')
  return <Landing />
}
