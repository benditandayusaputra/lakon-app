import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { bacaAvatar, destroySession, getSessionUser, isDemoAccount } from '@/db/auth'

const patchSchema = z.object({
  avatar: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)
    .max(300_000)
    .nullable()
    .optional(),
  gender: z.enum(['perempuan', 'laki-laki']).nullable().optional(),
})

export async function PATCH(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  if (isDemoAccount(user.email)) {
    return NextResponse.json(
      { ok: false, error: 'Akun demo dipakai bersama, jadi profilnya tidak bisa diubah.' },
      { status: 403 },
    )
  }
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Foto atau pilihan tidak valid.' },
      { status: 400 },
    )
  }
  const perubahan: { avatar?: string | null; gender?: 'perempuan' | 'laki-laki' | null } = {}
  if (parsed.data.avatar !== undefined) perubahan.avatar = parsed.data.avatar
  if (parsed.data.gender !== undefined) perubahan.gender = parsed.data.gender
  if (Object.keys(perubahan).length > 0) {
    await db.update(schema.users).set(perubahan).where(eq(schema.users.id, user.id))
  }
  return NextResponse.json({ ok: true, ...perubahan })
}

export async function DELETE() {
  const user = await getSessionUser().catch(() => null)
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })
  if (isDemoAccount(user.email)) {
    return NextResponse.json(
      { ok: false, error: 'Akun demo dipakai bersama, jadi tidak bisa dihapus.' },
      { status: 403 },
    )
  }
  await db.delete(schema.users).where(eq(schema.users.id, user.id))
  await destroySession()
  return NextResponse.json({ ok: true })
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ ok: true, user: null })
    return NextResponse.json({ ok: true, user: { ...user, avatar: await bacaAvatar(user.id) } })
  } catch {
    return NextResponse.json({ ok: true, user: null })
  }
}
