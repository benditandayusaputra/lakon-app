import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/web/features/**/*.test.ts'],
    environment: 'node',
  },
})
