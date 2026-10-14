import { expect, test } from '@playwright/test'

test('landing tampil dwibahasa', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'English' })).toBeVisible()
})
