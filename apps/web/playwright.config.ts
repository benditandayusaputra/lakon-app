import { join } from 'node:path'
import { defineConfig } from '@playwright/test'

const fakeVideo = join(import.meta.dirname, 'e2e', 'fixtures', 'gerak.y4m')

const testDatabaseUrl = process.env.DATABASE_URL_TEST
if (!testDatabaseUrl || testDatabaseUrl === process.env.DATABASE_URL) {
  throw new Error(
    'e2e refuses to run: DATABASE_URL_TEST is not set to a separate database.\n' +
      'The suite seeds and rewrites accounts, so it must never touch DATABASE_URL (production).\n' +
      'Create a throwaway Postgres (e.g. a Neon branch of the production database) and run:\n' +
      '  DATABASE_URL_TEST="postgresql://USER:PASSWORD@HOST/DB?sslmode=require" pnpm e2e',
  )
}
process.env.DATABASE_URL = testDatabaseUrl

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  workers: 1,
  use: {
    baseURL: 'http://localhost:3100',
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        `--use-file-for-fake-video-capture=${fakeVideo}`,
      ],
    },
  },
  timeout: 120_000,
  expect: { timeout: 15_000 },
  webServer: {
    command: 'LAKON_ALLOW_DRAFT=1 pnpm build && pnpm exec next start -p 3100',
    env: { DATABASE_URL: testDatabaseUrl },
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
