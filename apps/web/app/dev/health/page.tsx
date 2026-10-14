import { Check, X } from 'lucide-react'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { validateContent, type ContentSet } from '@lakon/sign-schema'
import { db, schema } from '@/db'

export const dynamic = 'force-dynamic'

const contentRoot = join(process.cwd(), '..', '..', 'content')
const publicRoot = join(process.cwd(), 'public')

const readFolder = async (folder: string): Promise<Record<string, unknown>> => {
  const files: Record<string, unknown> = {}
  try {
    for (const name of (await readdir(join(contentRoot, folder))).filter((f) =>
      f.endsWith('.json'),
    )) {
      files[name.replace(/\.json$/, '')] = JSON.parse(
        await readFile(join(contentRoot, folder, name), 'utf8'),
      )
    }
  } catch {
    return files
  }
  return files
}

const fileOk = async (path: string) => {
  try {
    return (await stat(join(publicRoot, path))).size > 0
  } catch {
    return false
  }
}

type Check = { label: string; ok: boolean; detail: string }

export default async function HealthPage() {
  const content: ContentSet = {
    handshapes: await readFolder('handshapes'),
    signs: await readFolder('signs'),
    scenarios: await readFolder('scenarios'),
  }
  const issues = validateContent(content)
  const signs = Object.values(content.signs) as { review?: { status?: string } }[]
  const approved = signs.filter((sign) => sign.review?.status === 'approved').length

  let dbDetail = ''
  let dbOk = false
  try {
    const users = await db.select({ id: schema.users.id }).from(schema.users)
    dbOk = true
    dbDetail = `${users.length} akun`
  } catch (err) {
    dbDetail = err instanceof Error ? err.message : String(err)
  }

  let model: { kind?: string; labels?: string[]; accuracyUnseen?: number } | null = null
  try {
    model = JSON.parse(await readFile(join(publicRoot, 'models', 'classifier.json'), 'utf8'))
  } catch {
    model = null
  }

  const checks: Check[] = [
    {
      label: 'Database',
      ok: dbOk,
      detail: dbDetail,
    },
    {
      label: 'Validasi konten',
      ok: issues.length === 0,
      detail:
        issues.length === 0
          ? `${Object.keys(content.handshapes).length} handshape, ${signs.length} isyarat, ${Object.keys(content.scenarios).length} skenario`
          : issues
              .slice(0, 3)
              .map((issue) => `${issue.file}: ${issue.message}`)
              .join('; '),
    },
    {
      label: 'Berkas avatar VRM',
      ok: await fileOk('models/seed-san.vrm'),
      detail: 'public/models/seed-san.vrm',
    },
    {
      label: 'WASM MediaPipe lokal',
      ok:
        (await fileOk('mediapipe/wasm/vision_wasm_internal.wasm')) &&
        (await fileOk('models/mediapipe/hand_landmarker.task')) &&
        (await fileOk('models/mediapipe/pose_landmarker_lite.task')),
      detail: 'jalankan node tools/fetch-assets.mjs bila belum ada',
    },
    {
      label: 'Model klasifikasi',
      ok: true,
      detail: model
        ? `${model.kind}, ${model.labels?.length ?? 0} kelas, akurasi holdout ${((model.accuracyUnseen ?? 0) * 100).toFixed(0)}%`
        : 'tanpa model (sistem berjalan dengan DTW saja)',
    },
  ]

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Kesehatan sistem</h1>
      <p className="text-sm">
        Isyarat approved: <strong>{approved}</strong> dari {signs.length} · draf diblokir dari build
        produksi kecuali LAKON_ALLOW_DRAFT=1
      </p>
      <ul className="flex flex-col gap-2">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`flex items-start gap-3 rounded-xl border-2 p-3 ${check.ok ? 'border-berhasil' : 'border-galat'}`}
          >
            <span aria-hidden className="text-lg">
              {check.ok ? (
                <Check aria-hidden className="h-5 w-5" />
              ) : (
                <X aria-hidden className="h-5 w-5" />
              )}
            </span>
            <div>
              <p className="font-bold">
                {check.label}: {check.ok ? 'sehat' : 'bermasalah'}
              </p>
              <p className="text-sm">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
