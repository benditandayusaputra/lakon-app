import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(join(import.meta.dirname, '..', 'apps', 'web', 'package.json'))
const { chromium } = require('@playwright/test')
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8')

const BASE = process.env.LAKON_BASE_URL ?? 'http://localhost:3000'
const outDir = join(import.meta.dirname, '..', 'docs', 'accessibility-audit')
await mkdir(outDir, { recursive: true })

const PAGES = [
  { name: 'landing', url: '/' },
  { name: 'sign-in', url: '/masuk' },
  { name: 'register', url: '/daftar' },
  { name: 'scenario-picker', url: '/skenario' },
  { name: 'scenario-intro', url: '/skenario/kedai-kopi?arah=deaf' },
  { name: 'scenario-learning', url: '/skenario/kedai-kopi?arah=deaf', click: 'Mulai belajar' },
  { name: 'internal-gate', url: '/dev/pipeline' },
]

const ADMIN_PAGES = [
  { name: 'dev-pipeline', url: '/dev/pipeline' },
  { name: 'dev-verify', url: '/dev/verify' },
  { name: 'tools-collect', url: '/tools/collect' },
]

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

const audit = async ({ name, url, click }) => {
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(2500)
  if (click) {
    await page
      .getByRole('button', { name: click })
      .click({ timeout: 10000 })
      .catch(() => {})
    await page.waitForTimeout(1500)
  }
  await page.evaluate(axeSource)
  const result = await page.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] } }),
  )
  return { name, url, violations: result.violations }
}

const results = []
for (const entry of PAGES) results.push(await audit(entry))

const login = await page.request.post(`${BASE}/api/auth/masuk`, {
  data: { email: 'admin@lakon.id', sandi: process.env.SEED_ADMIN_PASSWORD ?? '' },
})
if (login.ok()) {
  for (const entry of ADMIN_PAGES) results.push(await audit(entry))
} else {
  console.warn('admin login failed, skipping internal pages')
}

await browser.close()

const date = new Date().toISOString().slice(0, 10)
let totalViolations = 0
const lines = [
  `# Audit aksesibilitas axe-core (${date})`,
  '',
  `Standar: WCAG 2 A, AA, dan 2.2 AA. URL dasar: \`${BASE}\``,
  '',
]
for (const { name, url, violations } of results) {
  totalViolations += violations.length
  lines.push(`## ${name} (${url})`, '')
  if (violations.length === 0) {
    lines.push('Tidak ada pelanggaran.', '')
    continue
  }
  for (const violation of violations) {
    lines.push(
      `- **${violation.id}** (${violation.impact}): ${violation.help} — ${violation.nodes.length} elemen`,
    )
    for (const node of violation.nodes.slice(0, 3)) {
      lines.push(`  - \`${node.target.join(' ')}\``)
    }
  }
  lines.push('')
}
lines.push(`Total pelanggaran: ${totalViolations}`)

await writeFile(join(outDir, 'axe-report.md'), lines.join('\n') + '\n')
await writeFile(join(outDir, 'axe-report.json'), JSON.stringify(results, null, 2) + '\n')
console.log(`done: ${totalViolations} violations, report in docs/accessibility-audit/`)
for (const { name, violations } of results) {
  console.log(`  ${name}: ${violations.length}`)
}
