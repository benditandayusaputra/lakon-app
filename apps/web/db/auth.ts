import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { and, eq, gt } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { db, schema } from './index'

export const SESSION_COOKIE = 'lakon_sesi'
const SESSION_DAYS = 30

export const isDemoAccount = (email: string) => /^demo(\.[a-z]+)?@lakon\.id$/.test(email)

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export type SessionUser = {
  id: string
  email: string
  displayName: string
  role: 'pengguna' | 'validator' | 'admin'
  gender: 'perempuan' | 'laki-laki' | null
}

export const createSession = async (userId: string): Promise<{ token: string; maxAge: number }> => {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000)
  await db.insert(schema.sessions).values({ token, userId, expiresAt })
  return { token, maxAge: SESSION_DAYS * 24 * 3600 }
}

export const setSessionCookie = async (token: string, maxAge: number) => {
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
}

export const getSessionUser = async (): Promise<SessionUser | null> => {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  const rows = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      displayName: schema.users.displayName,
      role: schema.users.role,
      gender: schema.users.gender,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.token, token), gt(schema.sessions.expiresAt, new Date())))
    .limit(1)
  return rows[0] ?? null
}

export const bacaAvatar = async (userId: string): Promise<string | null> => {
  const rows = await db
    .select({ avatar: schema.users.avatar })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)
  return rows[0]?.avatar ?? null
}

export const destroySession = async () => {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.delete(schema.sessions).where(eq(schema.sessions.token, token))
  }
  store.delete(SESSION_COOKIE)
}
