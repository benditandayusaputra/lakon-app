import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { getSessionUser, isDemoAccount } from '@/db/auth'

const signEntry = z.object({
  signId: z.string().min(1).max(64),
  direction: z.enum(['deaf', 'service']).default('deaf'),
  status: z.enum(['belum', 'berlatih', 'dikuasai', 'dinilai-sendiri']),
  attempts: z.number().int().min(0).max(100_000),
  updatedAt: z.number().finite(),
})

const runEntry = z.object({
  scenarioId: z.string().min(1).max(64),
  direction: z.enum(['deaf', 'service']),
  durationMs: z.number().int().min(0).max(86_400_000),
  mastered: z.array(z.string().max(64)).max(200),
  needsRepeat: z.array(z.string().max(64)).max(200),
  completedAt: z.number().finite(),
})

const attemptEntry = z.object({
  signId: z.string().min(1).max(64),
  similarity: z.number().int().min(0).max(100).nullable(),
  passed: z.boolean(),
  createdAt: z.number().finite(),
})

const bodySchema = z.object({
  signs: z.array(signEntry).max(200).default([]),
  runs: z.array(runEntry).max(50).default([]),
  attempts: z.array(attemptEntry).max(50).default([]),
})

export async function GET() {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const signs = await db
    .select()
    .from(schema.signProgress)
    .where(eq(schema.signProgress.userId, user.id))
  const runs = await db
    .select()
    .from(schema.scenarioRuns)
    .where(eq(schema.scenarioRuns.userId, user.id))
  const attempts = await db
    .select()
    .from(schema.practiceAttempts)
    .where(eq(schema.practiceAttempts.userId, user.id))

  return NextResponse.json({
    ok: true,
    signs: signs.map((row) => ({
      signId: row.signId,
      direction: row.direction,
      status: row.status,
      attempts: row.attempts,
      updatedAt: row.updatedAt.getTime(),
    })),
    runs: runs.map((row) => ({
      scenarioId: row.scenarioId,
      direction: row.direction,
      durationMs: row.durationMs,
      mastered: JSON.parse(row.mastered) as string[],
      needsRepeat: JSON.parse(row.needsRepeat) as string[],
      completedAt: row.completedAt.getTime(),
    })),
    attempts: attempts.map((row) => ({
      signId: row.signId,
      similarity: row.similarity,
      passed: row.passed,
      createdAt: row.createdAt.getTime(),
    })),
  })
}

export async function POST(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  for (const entry of parsed.data.signs) {
    await db
      .insert(schema.signProgress)
      .values({
        userId: user.id,
        signId: entry.signId,
        direction: entry.direction,
        status: entry.status,
        attempts: entry.attempts,
        updatedAt: new Date(entry.updatedAt),
      })
      .onConflictDoUpdate({
        target: [
          schema.signProgress.userId,
          schema.signProgress.signId,
          schema.signProgress.direction,
        ],
        set: {
          status: entry.status,
          attempts: entry.attempts,
          updatedAt: new Date(entry.updatedAt),
        },
      })
  }

  for (const run of parsed.data.runs) {
    await db.insert(schema.scenarioRuns).values({
      userId: user.id,
      scenarioId: run.scenarioId,
      direction: run.direction,
      durationMs: run.durationMs,
      mastered: JSON.stringify(run.mastered),
      needsRepeat: JSON.stringify(run.needsRepeat),
      completedAt: new Date(run.completedAt),
    })
  }

  for (const attempt of parsed.data.attempts) {
    await db.insert(schema.practiceAttempts).values({
      userId: user.id,
      signId: attempt.signId,
      similarity: attempt.similarity,
      passed: attempt.passed,
      createdAt: new Date(attempt.createdAt),
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  if (isDemoAccount(user.email)) return NextResponse.json({ ok: false }, { status: 403 })
  await db.delete(schema.signProgress).where(eq(schema.signProgress.userId, user.id))
  await db.delete(schema.scenarioRuns).where(eq(schema.scenarioRuns.userId, user.id))
  await db.delete(schema.practiceAttempts).where(eq(schema.practiceAttempts.userId, user.id))
  await db.delete(schema.checkpoints).where(eq(schema.checkpoints.userId, user.id))
  return NextResponse.json({ ok: true })
}
