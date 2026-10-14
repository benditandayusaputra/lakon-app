import { redirect } from 'next/navigation'
import { getSessionUser } from '@/db/auth'

export default async function ScenarioLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser().catch(() => null)
  if (!user) redirect('/masuk')
  return <>{children}</>
}
