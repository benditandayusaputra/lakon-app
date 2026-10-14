import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import { notFound, redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/db'
import { getSessionUser } from '@/db/auth'
import { KameraSesi } from '@/components/kamera-sesi'
import { KedaiKopiFlow } from '@/components/scenes/kedai-kopi/flow'
import { PuskesmasFlow } from '@/components/scenes/puskesmas/flow'
import { TransportasiFlow } from '@/components/scenes/transportasi/flow'
import { WawancaraKerjaFlow } from '@/components/scenes/wawancara-kerja/flow'
import { DaruratFlow } from '@/components/scenes/darurat/flow'
import { SCENARIO_ORDER } from '@/features/ui/tokens'

const caveat = Caveat({ subsets: ['latin'], variable: '--font-kapur' })

export const metadata: Metadata = { title: 'Skenario | Lakon' }

export default async function ScenarioDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ arah?: string }>
}) {
  const { id } = await params
  const urutan = SCENARIO_ORDER.indexOf(id as (typeof SCENARIO_ORDER)[number])
  if (urutan === -1) notFound()

  const sebelumnya = SCENARIO_ORDER[urutan - 1]
  if (sebelumnya) {
    const direction = (await searchParams).arah === 'service' ? 'service' : 'deaf'
    const user = await getSessionUser().catch(() => null)
    if (!user) redirect('/masuk')
    const [run] = await db
      .select({ id: schema.scenarioRuns.id })
      .from(schema.scenarioRuns)
      .where(
        and(
          eq(schema.scenarioRuns.userId, user.id),
          eq(schema.scenarioRuns.scenarioId, sebelumnya),
          eq(schema.scenarioRuns.direction, direction),
        ),
      )
      .limit(1)
    if (!run) redirect('/skenario')
  }

  return (
    <div className={caveat.variable}>
      <KameraSesi />
      <Suspense fallback={<p className="p-10">Memuat…</p>}>
        {id === 'kedai-kopi' ? (
          <KedaiKopiFlow />
        ) : id === 'puskesmas' ? (
          <PuskesmasFlow />
        ) : id === 'transportasi' ? (
          <TransportasiFlow />
        ) : id === 'wawancara-kerja' ? (
          <WawancaraKerjaFlow />
        ) : (
          <DaruratFlow />
        )}
      </Suspense>
    </div>
  )
}
