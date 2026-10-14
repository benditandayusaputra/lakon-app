import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'
import { handshapeSchema, signSchema, type Sign } from '@lakon/sign-schema'
import { getSessionUser } from '@/db/auth'

export const dynamic = 'force-dynamic'

const contentRoot = join(process.cwd(), '..', '..', 'content')

const readFolder = async (folder: string): Promise<Record<string, unknown>> => {
  const dir = join(contentRoot, folder)
  const files: Record<string, unknown> = {}
  let names: string[] = []
  try {
    names = (await readdir(dir)).filter((name) => name.endsWith('.json'))
  } catch {
    return files
  }
  for (const name of names) {
    const raw = await readFile(join(dir, name), 'utf8')
    files[name.replace(/\.json$/, '')] = JSON.parse(raw)
  }
  return files
}

export async function GET() {
  return NextResponse.json({
    handshapes: await readFolder('handshapes'),
    signs: await readFolder('signs'),
    scenarios: await readFolder('scenarios'),
  })
}

const writeJson = (folder: string, id: string, data: unknown) =>
  writeFile(join(contentRoot, folder, `${id}.json`), JSON.stringify(data, null, 2) + '\n')

const refreshUsedIn = async () => {
  const signs = await readFolder('signs')
  const usedIn = new Map<string, Set<string>>()
  for (const [signId, raw] of Object.entries(signs)) {
    const sign = raw as Sign
    for (const phase of sign.phases ?? []) {
      for (const spec of [phase.dominant, phase.nonDominant]) {
        if (!spec) continue
        if (!usedIn.has(spec.handshape)) usedIn.set(spec.handshape, new Set())
        usedIn.get(spec.handshape)!.add(signId)
      }
    }
  }
  const handshapes = await readFolder('handshapes')
  for (const [shapeId, raw] of Object.entries(handshapes)) {
    const shape = raw as { usedIn?: string[] }
    const next = [...(usedIn.get(shapeId) ?? new Set())].sort()
    const current = [...(shape.usedIn ?? [])].sort()
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      await writeJson('handshapes', shapeId, { ...shape, usedIn: next })
    }
  }
}

const withoutReview = (value: unknown) => {
  const clone = JSON.parse(JSON.stringify(value)) as Record<string, unknown>
  delete clone.review
  return JSON.stringify(clone)
}

const readExisting = async (folder: string, id: string): Promise<unknown | null> => {
  try {
    return JSON.parse(await readFile(join(contentRoot, folder, `${id}.json`), 'utf8'))
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser().catch(() => null)
  if (!user || (user.role !== 'admin' && user.role !== 'validator')) {
    return NextResponse.json(
      { ok: false, issues: ['perlu peran admin atau validator untuk menyimpan konten'] },
      { status: 403 },
    )
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { ok: false, issues: ['editor konten hanya bisa menyimpan saat dijalankan lokal'] },
      { status: 501 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    signs?: Record<string, unknown>
    handshapes?: Record<string, unknown>
  } | null
  if (!body) {
    return NextResponse.json({ ok: false, issues: ['isi permintaan tidak valid'] }, { status: 400 })
  }
  const issues: string[] = []
  const validSigns: [string, unknown][] = []
  const validShapes: [string, unknown][] = []

  for (const [id, raw] of Object.entries(body.signs ?? {})) {
    const result = signSchema.safeParse(raw)
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((issue) => `${id}: ${issue.path.join('.')}: ${issue.message}`),
      )
      continue
    }
    if (result.data.id !== id) {
      issues.push(`${id}: id tidak sama dengan kunci`)
      continue
    }
    validSigns.push([id, result.data])
  }

  for (const [id, raw] of Object.entries(body.handshapes ?? {})) {
    const result = handshapeSchema.safeParse(raw)
    if (!result.success) {
      issues.push(
        ...result.error.issues.map((issue) => `${id}: ${issue.path.join('.')}: ${issue.message}`),
      )
      continue
    }
    if (result.data.id !== id) {
      issues.push(`${id}: id tidak sama dengan kunci`)
      continue
    }
    validShapes.push([id, result.data])
  }

  if (user.role === 'validator') {
    for (const [folder, entries] of [
      ['signs', validSigns],
      ['handshapes', validShapes],
    ] as const) {
      for (const [id, data] of entries) {
        const existing = await readExisting(folder, id)
        if (!existing) {
          issues.push(`${id}: validator tidak boleh membuat berkas baru`)
          continue
        }
        if (withoutReview(existing) !== withoutReview(data)) {
          issues.push(`${id}: peran validator hanya boleh mengubah field review`)
        }
      }
    }
  }

  if (issues.length > 0) {
    return NextResponse.json({ ok: false, issues }, { status: 422 })
  }

  for (const [id, data] of validSigns) await writeJson('signs', id, data)
  for (const [id, data] of validShapes) await writeJson('handshapes', id, data)
  await refreshUsedIn()

  return NextResponse.json({ ok: true, saved: validSigns.length + validShapes.length })
}
