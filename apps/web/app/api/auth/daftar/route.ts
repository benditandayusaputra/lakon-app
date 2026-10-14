import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db, schema } from '@/db'
import { createSession, hashPassword, setSessionCookie } from '@/db/auth'
import { asalPermintaan, bolehCoba } from '@/features/auth/batas-percobaan'

const bodySchema = z.object({
  nama: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(320),
  sandi: z.string().min(8).max(200),
  jenisKelamin: z.enum(['perempuan', 'laki-laki']).nullable().optional(),
})

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'Permintaan tidak dikenali.' }, { status: 415 })
  }
  if (!bolehCoba(`daftar:${asalPermintaan(request)}`, 20, 60 * 60_000)) {
    return NextResponse.json(
      { ok: false, error: 'Terlalu banyak pendaftaran. Coba lagi nanti.' },
      { status: 429 },
    )
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Data formulir belum lengkap.' }, { status: 400 })
  }
  const { nama, email, sandi, jenisKelamin } = parsed.data
  try {
    const inserted = await db
      .insert(schema.users)
      .values({
        email: email.toLowerCase(),
        displayName: nama,
        passwordHash: hashPassword(sandi),
        gender: jenisKelamin ?? null,
      })
      .returning({ id: schema.users.id })
    const user = inserted[0]!
    const session = await createSession(user.id)
    await setSessionCookie(session.token, session.maxAge)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('duplicate') || message.includes('unique')) {
      return NextResponse.json(
        { ok: false, field: 'email', error: 'Email ini sudah terdaftar. Coba masuk.' },
        { status: 409 },
      )
    }
    return NextResponse.json({ ok: false, error: 'Server bermasalah. Coba lagi.' }, { status: 500 })
  }
}
