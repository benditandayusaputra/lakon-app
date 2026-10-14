import { expect, test, type Page } from '@playwright/test'

const metric = (page: Page, label: string) =>
  page.locator('dl > div').filter({ hasText: label }).locator('dd span')

const runRoute = async (page: Page, route: string) => {
  await page.goto('/dev/pipeline')
  await page.getByLabel('Paksa jalur').selectOption(route)
  await page.getByRole('button', { name: 'Mulai' }).click()
  await expect(page.getByRole('status')).toContainText('running', { timeout: 20_000 })
  await expect(metric(page, 'Backend aktif')).not.toHaveText('belum siap', { timeout: 60_000 })
  await expect(metric(page, 'Usia data terakhir')).not.toHaveText('-', { timeout: 60_000 })
}

test.describe('pipeline diagnostik', () => {
  test.slow()

  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('/api/auth/masuk', {
      data: { email: 'admin@lakon.id', sandi: process.env.SEED_ADMIN_PASSWORD ?? '' },
    })
    test.skip(!response.ok(), 'akun admin belum di-seed, jalankan node tools/seed.mjs')
  })

  test('jalur WebCodecs menghasilkan landmark', async ({ page }) => {
    await runRoute(page, 'track-processor')
    await expect(metric(page, 'Jalur pengambilan gambar')).toHaveText('track-processor')
    await expect(metric(page, 'Resolusi kamera')).toHaveText(/\d+x\d+/)
  })

  test('jalur cadangan requestVideoFrameCallback menghasilkan landmark', async ({ page }) => {
    await runRoute(page, 'video-frame-callback')
    await expect(metric(page, 'Jalur pengambilan gambar')).toHaveText('video-frame-callback')
  })

  test('tanpa kamera halaman tetap terbaca', async ({ page }) => {
    await page.goto('/dev/pipeline')
    await expect(page.getByRole('heading', { name: 'Diagnostik pipeline' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mulai' })).toBeEnabled()
  })
})
