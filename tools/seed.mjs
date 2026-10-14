import { randomBytes, scryptSync } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(join(import.meta.dirname, '..', 'apps', 'web', 'package.json'))
const { neon } = require('@neondatabase/serverless')

process.loadEnvFile(join(import.meta.dirname, '..', '.env'))
const sql = neon(process.env.DATABASE_URL)

const internalPassword = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing ${name}. Set it in .env before seeding internal accounts.`)
    process.exit(1)
  }
  return value
}

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}

const upsertUser = async (email, displayName, password, role) => {
  const rows = await sql(
    `insert into users (email, display_name, password_hash, role)
     values ($1, $2, $3, $4)
     on conflict (email) do update set display_name = $2, password_hash = $3, role = $4
     returning id`,
    [email, displayName, hashPassword(password), role],
  )
  return rows[0].id
}

const demoId = await upsertUser('demo@lakon.id', 'Akun Demo', 'CobaLakon2026', 'pengguna')
await upsertUser('admin@lakon.id', 'Admin Lakon', internalPassword('SEED_ADMIN_PASSWORD'), 'admin')
await upsertUser(
  'validator@lakon.id',
  'Validator Lakon',
  internalPassword('SEED_VALIDATOR_PASSWORD'),
  'validator',
)

const contoh = [
  ['bendi@lakon.id', 'Bendi', 'BendiLakon2026'],
  ['kevin@lakon.id', 'Kevin', 'KevinLakon2026'],
  ['jessica@lakon.id', 'Jessica', 'JessicaLakon2026'],
  ['nawal@lakon.id', 'Nawal', 'NawalLakon2026'],
]
for (const [email, nama, sandi] of contoh) await upsertUser(email, nama, sandi, 'pengguna')

const progress = [
  ['halo', 'dikuasai', 2],
  ['kopi', 'dikuasai', 3],
  ['panas', 'dikuasai', 1],
  ['manis', 'berlatih', 4],
  ['pahit', 'berlatih', 2],
  ['terima-kasih', 'dinilai-sendiri', 5],
]
await sql(`delete from sign_progress where user_id = $1`, [demoId])
for (const [signId, status, attempts] of progress) {
  await sql(
    `insert into sign_progress (user_id, sign_id, direction, status, attempts, updated_at)
     values ($1, $2, 'deaf', $3, $4, now())
     on conflict (user_id, sign_id, direction) do update set status = $3, attempts = $4, updated_at = now()`,
    [demoId, signId, status, attempts],
  )
}

await sql(`delete from scenario_runs where user_id = $1`, [demoId])
await sql(
  `insert into scenario_runs (user_id, scenario_id, direction, duration_ms, mastered, needs_repeat, completed_at)
   values ($1, 'kedai-kopi', 'deaf', 540000, $2, $3, now() - interval '2 days')`,
  [demoId, JSON.stringify(['halo', 'kopi', 'panas']), JSON.stringify(['berapa', 'terima-kasih'])],
)

const URUTAN_ADEGAN = ['kedai-kopi', 'puskesmas', 'transportasi', 'wawancara-kerja', 'darurat']

const bacaAdegan = (id) =>
  JSON.parse(
    readFileSync(join(import.meta.dirname, '..', 'content', 'scenarios', `${id}.json`), 'utf8'),
  )

const isyaratAdegan = (adegan) => [
  ...new Set([
    ...adegan.vocab,
    ...adegan.nodes.flatMap((node) =>
      node.task
        ? [node.task.deaf, node.task.service]
            .filter((task) => task.type !== 'point' && task.sign)
            .map((task) => task.sign)
        : [],
    ),
  ]),
]

const siapkanAkunDemo = async (email, nama, sandi, jumlahSelesai) => {
  const id = await upsertUser(email, nama, sandi, 'pengguna')
  await sql(`delete from sign_progress where user_id = $1`, [id])
  await sql(`delete from scenario_runs where user_id = $1`, [id])
  await sql(`delete from checkpoints where user_id = $1`, [id])
  if (jumlahSelesai === 0) {
    await sql(`update users set avatar = null, gender = null where id = $1`, [id])
  }
  const selesai = URUTAN_ADEGAN.slice(0, jumlahSelesai).map(bacaAdegan)
  for (const arah of ['deaf', 'service']) {
    const dikuasai = new Set()
    for (const [urutan, adegan] of selesai.entries()) {
      const isyarat = isyaratAdegan(adegan)
      for (const signId of isyarat) dikuasai.add(signId)
      await sql(
        `insert into scenario_runs (user_id, scenario_id, direction, duration_ms, mastered, needs_repeat, completed_at)
         values ($1, $2, $3, $4, $5, '[]', now() - $6::int * interval '1 day')`,
        [
          id,
          adegan.id,
          arah,
          adegan.estimatedMinutes * 60000,
          JSON.stringify(isyarat),
          jumlahSelesai - urutan,
        ],
      )
    }
    for (const signId of dikuasai) {
      await sql(
        `insert into sign_progress (user_id, sign_id, direction, status, attempts, updated_at)
         values ($1, $2, $3, 'dikuasai', 2, now())`,
        [id, signId, arah],
      )
    }
  }
}

await siapkanAkunDemo('demo.baru@lakon.id', 'Demo Baru', 'BaruLakon2026', 0)
await siapkanAkunDemo('demo.dua@lakon.id', 'Demo Dua Adegan', 'DuaLakon2026', 2)
await siapkanAkunDemo('demo.penuh@lakon.id', 'Demo Penuh', 'PenuhLakon2026', URUTAN_ADEGAN.length)

console.log('seed done: demo@lakon.id / CobaLakon2026 (partial progress)')
console.log('           admin@lakon.id / $SEED_ADMIN_PASSWORD')
console.log('           validator@lakon.id / $SEED_VALIDATOR_PASSWORD')
console.log('           samples: bendi@lakon.id / BendiLakon2026, kevin@lakon.id / KevinLakon2026,')
console.log(
  '                    jessica@lakon.id / JessicaLakon2026, nawal@lakon.id / NawalLakon2026',
)
console.log('           presentation: demo.baru@lakon.id / BaruLakon2026 (no progress)')
console.log('                         demo.dua@lakon.id / DuaLakon2026 (2 scenes finished)')
console.log('                         demo.penuh@lakon.id / PenuhLakon2026 (5 scenes finished)')
