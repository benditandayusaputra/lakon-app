import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { getSessionUser } from '@/db/auth'

const kunci = z.object({
  scenarioId: z.string().min(1).max(64),
  direction: z.enum(['deaf', 'service']),
})

const putSchema = kunci.extend({
  state: z.string().max(200_000),
  updatedAt: z.number(),
})

export async function GET(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const url = new URL(request.url)
  const parsed = kunci.safeParse({
    scenarioId: url.searchParams.get('scenarioId'),
    direction: url.searchParams.get('direction'),
  })
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
  const rows = await db
    .select({ state: schema.checkpoints.state, updatedAt: schema.checkpoints.updatedAt })
    .from(schema.checkpoints)
    .where(
      and(
        eq(schema.checkpoints.userId, user.id),
        eq(schema.checkpoints.scenarioId, parsed.data.scenarioId),
        eq(schema.checkpoints.direction, parsed.data.direction),
      ),
    )
    .limit(1)
  const row = rows[0]
  return NextResponse.json({
    ok: true,
    checkpoint: row ? { state: row.state, updatedAt: row.updatedAt.getTime() } : null,
  })
}

export async function PUT(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const parsed = putSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
  await db
    .insert(schema.checkpoints)
    .values({
      userId: user.id,
      scenarioId: parsed.data.scenarioId,
      direction: parsed.data.direction,
      state: parsed.data.state,
      updatedAt: new Date(parsed.data.updatedAt),
    })
    .onConflictDoUpdate({
      target: [
        schema.checkpoints.userId,
        schema.checkpoints.scenarioId,
        schema.checkpoints.direction,
      ],
      set: { state: parsed.data.state, updatedAt: new Date(parsed.data.updatedAt) },
    })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  const parsed = kunci.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
  await db
    .delete(schema.checkpoints)
    .where(
      and(
        eq(schema.checkpoints.userId, user.id),
        eq(schema.checkpoints.scenarioId, parsed.data.scenarioId),
        eq(schema.checkpoints.direction, parsed.data.direction),
      ),
    )
  return NextResponse.json({ ok: true })
}
