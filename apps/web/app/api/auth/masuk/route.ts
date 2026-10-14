import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { createSession, setSessionCookie, verifyPassword } from '@/db/auth'
import { asalPermintaan, bolehCoba } from '@/features/auth/batas-percobaan'

const bodySchema = z.object({
  email: z.string().trim().email().max(320),
  sandi: z.string().min(1).max(200),
})

const HASH_UMPAN =
  '00000000000000000000000000000000:' +
  '0000000000000000000000000000000000000000000000000000000000000000' +
  '0000000000000000000000000000000000000000000000000000000000000000'

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak dikenali.' }, { status: 415 })
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Data formulir belum lengkap.' }, { status: 400 })
  }
  const kunci = `masuk:${asalPermintaan(request)}:${parsed.data.email.toLowerCase()}`
  if (!bolehCoba(kunci)) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' },
      { status: 429 },
    )
  }
  try {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, parsed.data.email.toLowerCase()))
      .limit(1)
    const user = rows[0]
    if (!verifyPassword(parsed.data.sandi, user?.passwordHash ?? HASH_UMPAN) || !user) {
      return NextResponse.json(
        { ok: false, error: 'Email atau kata sandi tidak cocok.' },
        { status: 401 },
      )
    }
    const session = await createSession(user.id)
    await setSessionCookie(session.token, session.maxAge)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server bermasalah. Coba lagi.' }, { status: 500 })
  }
}
