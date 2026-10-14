import { defineConfig } from 'drizzle-kit'

process.loadEnvFile('../../.env')

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
