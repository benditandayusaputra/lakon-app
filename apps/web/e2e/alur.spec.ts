import { expect, test, type Page } from '@playwright/test'

const DEMO = { email: 'demo@lakon.id', sandi: 'CobaLakon2026' }

const masukAkunBaru = async (page: Page) => {
  const response = await page.request.post('/api/auth/daftar', {
    data: {
      nama: 'Penguji Alur',
      email: `uji-alur-${Date.now()}-${Math.floor(Math.random() * 1e6)}@lakon.id`,
      sandi: 'sandi-uji-123',
    },
  })
  expect(response.ok()).toBe(true)
}

const tutupUmpan = async (page: Page) => {
  const lembar = page.getByRole('dialog')
  await expect(lembar).toBeVisible()
  const lanjut = lembar.getByRole('button', { name: 'Lanjut' })
  if (await lanjut.isVisible().catch(() => false)) {
    await lanjut.click()
    await page.waitForTimeout(250)
    return true
  }
  const lewati = lembar.getByRole('button', { name: 'Lewati' })
  if (await lewati.isVisible().catch(() => false)) {
    await lewati.click()
    await lembar.getByRole('button', { name: 'Lanjut' }).click()
    await page.waitForTimeout(250)
    return true
  }
  await lembar.getByRole('button', { name: 'Coba lagi' }).click()
  await page.waitForTimeout(250)
  return false
}

const jawabLatihanBaca = async (page: Page) => {
  const soal = page.getByText('Pelanggan berisyarat. Apa maknanya?')
  if (!(await soal.isVisible().catch(() => false))) return false
  const opsi = page.locator('p:has-text("Pelanggan berisyarat. Apa maknanya?") + div button')
  const jumlah = await opsi.count()
  for (let i = 0; i < jumlah; i++) {
    await opsi.nth(i).click()
    if (await tutupUmpan(page)) return true
  }
  return true
}

const skipAllLearning = async (page: Page) => {
  for (let i = 0; i < 64; i++) {
    if (
      await page
        .getByRole('button', { name: 'Menuju kasir' })
        .isVisible()
        .catch(() => false)
    ) {
      break
    }
    if (await jawabLatihanBaca(page)) continue
    let clicked = false
    for (const name of [
      'Lewati dulu',
      'Lanjut ke praktik',
      'Tanpa kamera',
      'Sudah cukup mirip, lanjut',
    ]) {
      const button = page.getByRole('button', { name })
      if (await button.isVisible().catch(() => false)) {
        await button.click()
        await page.waitForTimeout(250)
        clicked = true
        break
      }
    }
    if (!clicked) await page.waitForTimeout(300)
  }
  await expect(page.getByRole('button', { name: 'Menuju kasir' })).toBeVisible()
}

const finishExam = async (page: Page) => {
  let percobaan = 0
  for (let i = 0; i < 90; i++) {
    if (
      await page
        .getByRole('button', { name: 'Ulangi kunjungan' })
        .isVisible()
        .catch(() => false)
    ) {
      return
    }
    if (
      await page
        .getByRole('dialog')
        .isVisible()
        .catch(() => false)
    ) {
      percobaan = (await tutupUmpan(page)) ? 0 : percobaan + 1
      continue
    }
    const tirai = page.getByRole('button', { name: 'Lihat ringkasan' })
    if (await tirai.isVisible().catch(() => false)) {
      await tirai.click()
      await page.waitForTimeout(250)
      continue
    }
    const produce = page.getByRole('button', { name: 'Sudah kuperagakan, lanjut' })
    if (await produce.isVisible().catch(() => false)) {
      await produce.click()
      await page.waitForTimeout(250)
      continue
    }
    const tanpaKamera = page.getByRole('button', { name: 'Tanpa kamera' })
    if (await tanpaKamera.isVisible().catch(() => false)) {
      await tanpaKamera.click()
      await page.waitForTimeout(250)
      continue
    }
    const mirip = page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' })
    if (await mirip.isVisible().catch(() => false)) {
      await mirip.click()
      await page.waitForTimeout(250)
      continue
    }
    const kartu = page.locator('button.kk-kartu-menu:enabled')
    const jumlahKartu = await kartu.count()
    const option = jumlahKartu > 0 ? kartu.nth(percobaan % jumlahKartu) : kartu.first()
    if (await option.isVisible().catch(() => false)) {
      await option.click()
      await page.waitForTimeout(250)
      continue
    }
    const lanjut = page.getByRole('button', { name: 'Lanjut', exact: true })
    if (await lanjut.isVisible().catch(() => false)) {
      await lanjut.click()
      await page.waitForTimeout(250)
      continue
    }
    await page.waitForTimeout(300)
  }
  await expect(page.getByRole('button', { name: 'Ulangi kunjungan' })).toBeVisible()
}

const enterScenario = async (page: Page, direction: 'deaf' | 'service') => {
  await page.goto(`/skenario/kedai-kopi?arah=${direction}`)
  const pintu = page.getByRole('button', { name: /pintu/i })
  const tanpaKamera = page.getByRole('button', { name: 'Lanjut tanpa kamera' })
  const judul = page.getByRole('heading', { name: 'halo' })
  await Promise.race([
    pintu.waitFor({ timeout: 60_000 }),
    tanpaKamera.waitFor({ timeout: 60_000 }),
    judul.waitFor({ timeout: 60_000 }),
  ]).catch(() => {})
  if (await pintu.isVisible().catch(() => false)) await pintu.click()
  await tanpaKamera.click({ timeout: 10_000 }).catch(() => {})
  await expect(judul).toBeVisible({ timeout: 60_000 })
}

test.describe('alur inti', () => {
  test('1. landing sampai blok coba satu isyarat tanpa login', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('BISINDO')
    await page.locator('#coba').scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Nyalakan kamera' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('button', { name: 'Tanpa kamera' })).toBeVisible()
  })

  test('2. daftar, masuk, keluar', async ({ page }) => {
    const email = `uji-${Date.now()}@lakon.id`
    await page.goto('/daftar')
    await page.getByLabel('Nama panggilan').fill('Penguji E2E')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Kata sandi', { exact: true }).fill('sandi-uji-123')
    await page.getByRole('button', { name: 'Buat akun' }).click()
    await page.waitForURL('**/skenario')
    await expect(page.getByRole('link', { name: 'Penguji E2E' })).toBeVisible()

    await page.getByRole('link', { name: 'Penguji E2E' }).click()
    await page.waitForURL('**/profil')
    await page.getByRole('button', { name: 'Keluar', exact: true }).click()
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()

    await page.goto('/masuk')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Kata sandi', { exact: true }).fill('sandi-salah-99')
    await page.getByRole('button', { name: 'Masuk' }).click()
    await expect(page.getByText('Email atau kata sandi tidak cocok.')).toBeVisible()

    await page.getByLabel('Kata sandi', { exact: true }).fill('sandi-uji-123')
    await page.getByRole('button', { name: 'Masuk' }).click()
    await page.waitForURL('**/skenario')
  })

  test('2b. tanpa login, /skenario dialihkan ke /masuk', async ({ page }) => {
    await page.goto('/skenario')
    await page.waitForURL('**/masuk')
    await page.goto('/skenario/kedai-kopi?arah=deaf')
    await page.waitForURL('**/masuk')
  })

  test('3. masuk dengan akun demo yang berprogres', async ({ page }) => {
    await page.goto('/masuk')
    await page.getByLabel('Email').fill(DEMO.email)
    await page.getByLabel('Kata sandi', { exact: true }).fill(DEMO.sandi)
    await page.getByRole('button', { name: 'Masuk' }).click()
    await page.waitForURL('**/skenario')
    await expect(page.getByRole('link', { name: 'Akun Demo' })).toBeVisible()
    await expect(page.getByText(/Isyarat yang sudah dipelajari: [1-9]/)).toBeVisible()
  })

  test('4+6. arah A: fase belajar lalu ujian sampai ringkasan', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario')
    await page.getByRole('button', { name: /Memesan minuman/ }).click()
    await page.getByRole('button', { name: /pintu/i }).click()
    await page
      .getByRole('button', { name: 'Lanjut tanpa kamera' })
      .click({ timeout: 10_000 })
      .catch(() => {})
    await expect(page.getByRole('heading', { name: 'halo' })).toBeVisible({ timeout: 60_000 })

    await skipAllLearning(page)
    await page.getByRole('button', { name: 'Menuju kasir' }).click()
    await expect(page.getByText('Selamat pagi, mau pesan apa?')).toBeVisible()
    await finishExam(page)
    await expect(page.getByText('Perlu diulang', { exact: false })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ulangi kunjungan' })).toBeVisible()
  })

  test('5. tiga kali belum tepat memunculkan jalan keluar', async ({ page }) => {
    test.slow()
    await page.goto('/#coba')
    await page.locator('#coba').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Nyalakan kamera' }).click({ timeout: 30_000 })
    const start = page.getByRole('button', { name: 'Mulai peragakan' })
    await expect(start).toBeVisible({ timeout: 90_000 })

    const belumTepat = page.getByText('Belum tepat', { exact: false })
    const lewati = page.getByRole('button', { name: 'Lewati' })
    await start.click()
    await expect(belumTepat).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Masih belum sesuai', { exact: false })).toBeVisible()
    await expect(lewati).toHaveCount(0)

    for (let attempt = 2; attempt <= 3; attempt++) {
      await page.getByRole('button', { name: 'Coba lagi' }).click()
      await expect(belumTepat).toBeHidden()
      await start.click()
      await expect(belumTepat).toBeVisible({ timeout: 30_000 })
    }

    await lewati.click()
    await expect(belumTepat).toBeHidden()
    await expect(start).toBeVisible()
  })

  test('7. arah B: tugas reseptif sampai ringkasan', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario')
    await page.getByText('Sisi pekerja layanan', { exact: false }).click()
    await page.getByRole('button', { name: /Memesan minuman/ }).click()
    await page.getByRole('button', { name: /pintu/i }).click()
    await page
      .getByRole('button', { name: 'Lanjut tanpa kamera' })
      .click({ timeout: 10_000 })
      .catch(() => {})
    await expect(page.getByRole('heading', { name: 'Isyarat 1' })).toBeVisible({ timeout: 60_000 })

    await skipAllLearning(page)
    await page.getByRole('button', { name: 'Menuju kasir' }).click()
    await expect(page.getByText('Pelanggan berisyarat. Apa maknanya?')).toBeVisible()
    await finishExam(page)
    await expect(page.getByRole('button', { name: 'Ulangi kunjungan' })).toBeVisible()
  })

  test('8. izin kamera ditolak: jalur alternatif berfungsi', async ({ page }) => {
    await page.addInitScript(() => {
      const denied = () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: denied })
    })
    await page.goto('/#coba')
    await page.locator('#coba').scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: 'Nyalakan kamera' }).click({ timeout: 30_000 })
    await expect(page.getByText('Kamera tidak tersedia', { exact: false })).toBeVisible({
      timeout: 20_000,
    })
    await page.getByRole('button', { name: 'Latihan tanpa kamera' }).click()
    await page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' }).click()
    await expect(page.getByRole('button', { name: 'Nyalakan kamera' })).toBeVisible()
  })

  test('9. offline: seluruh skenario masih bisa dijalankan', async ({ page, context }) => {
    test.slow()
    await masukAkunBaru(page)
    await page.goto('/')
    await page.waitForFunction(
      async () => Boolean((await navigator.serviceWorker.getRegistration())?.active),
      undefined,
      { timeout: 30_000 },
    )

    await enterScenario(page, 'deaf')
    await page.waitForTimeout(2000)

    await context.setOffline(true)
    await enterScenario(page, 'deaf')
    await skipAllLearning(page)
    await page.getByRole('button', { name: 'Menuju kasir' }).click()
    await finishExam(page)
    await expect(page.getByRole('button', { name: 'Ulangi kunjungan' })).toBeVisible()
    await context.setOffline(false)
  })

  test('10. progres bertahan setelah muat ulang', async ({ page }) => {
    await masukAkunBaru(page)
    await enterScenario(page, 'deaf')
    await page.getByRole('button', { name: 'Lanjut ke praktik' }).click()
    await page.getByRole('button', { name: 'Tanpa kamera' }).click()
    const tersimpan = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/progress') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Sudah cukup mirip, lanjut' }).click()
    expect((await tersimpan).ok()).toBe(true)

    await page.goto('/skenario')
    await expect(page.getByText(/Isyarat yang sudah dipelajari: [1-9]/)).toBeVisible()
    await page.reload()
    await expect(page.getByText(/Isyarat yang sudah dipelajari: [1-9]/)).toBeVisible()
  })

  test('11. sudah masuk: landing dan /masuk dialihkan ke /skenario', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/')
    await page.waitForURL('**/skenario')
    await page.goto('/masuk')
    await page.waitForURL('**/skenario')
    await page.goto('/daftar')
    await page.waitForURL('**/skenario')
  })

  test('12. adegan kedua terkunci sebelum adegan pertama selesai', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario')
    await expect(page.getByRole('button', { name: /Memesan minuman/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /puskesmas/i })).toHaveCount(0)
    await expect(page.getByText(/Selesaikan .* dulu untuk membukanya/).first()).toBeVisible()
  })

  test('13. profil memuat tombol keluar dan hapus data', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario')
    await expect(page.getByRole('button', { name: 'Hapus seluruh data belajarku' })).toHaveCount(0)
    await page.goto('/profil')
    await expect(page.getByRole('button', { name: 'Keluar', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Hapus seluruh data belajarku' }).click()
    await page.getByRole('button', { name: 'Ya, hapus sekarang' }).click()
    await expect(page.getByText('Seluruh data belajarmu sudah dihapus.')).toBeVisible()
  })

  test('14. pembuka adegan menerangkan langkah sebelum masuk', async ({ page }) => {
    await masukAkunBaru(page)
    await page.goto('/skenario/kedai-kopi?arah=deaf')
    await expect(page.getByRole('button', { name: /pintu/i })).toBeVisible()
    await expect(page.getByText('sisi Tuli')).toBeVisible()
    await expect(page.getByText('Klik pintu untuk masuk')).toBeVisible()
  })

  test('15. praktik menyembunyikan peragaan sampai ditoggle', async ({ page }) => {
    await masukAkunBaru(page)
    await enterScenario(page, 'deaf')
    await expect(page.getByRole('button', { name: 'Manusia', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect(page.locator('video[src^="/peraga/"]')).toHaveCount(1)
    await page.getByRole('button', { name: 'Lanjut ke praktik' }).click()
    const toggle = page.getByRole('button', { name: 'Tampilkan peragaan' })
    await expect(toggle).toBeVisible()
    await expect(page.getByRole('button', { name: 'Depan' })).toHaveCount(0)
    await toggle.click()
    await expect(page.getByRole('button', { name: 'Sembunyikan peragaan' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kanan' })).toHaveCount(0)
    await page.getByRole('button', { name: '3D', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Depan' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kanan' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kiri' })).toBeVisible()
    await page.getByRole('button', { name: 'Manusia', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Kiri' })).toHaveCount(0)
  })

  test('16. akun demo penuh: semua adegan selesai, adegan baru segera hadir', async ({ page }) => {
    await page.goto('/masuk')
    await page.getByLabel('Email').fill('demo.penuh@lakon.id')
    await page.getByLabel('Kata sandi', { exact: true }).fill('PenuhLakon2026')
    await page.getByRole('button', { name: 'Masuk' }).click()
    await page.waitForURL('**/skenario')
    await expect(page.getByText('5/5')).toBeVisible()
    await expect(page.getByRole('img', { name: /Adegan 6: Adegan baru/ })).toBeVisible()
    await expect(page.getByText('Masih dibangun')).toBeVisible()
  })

  test('17. akun demo bersama tidak bisa menghapus data belajar', async ({ page }) => {
    const masuk = await page.request.post('/api/auth/masuk', {
      data: { email: 'demo.penuh@lakon.id', sandi: 'PenuhLakon2026' },
    })
    expect(masuk.ok()).toBe(true)
    expect((await page.request.delete('/api/progress')).status()).toBe(403)
    await page.goto('/profil')
    await expect(page.getByText('Akun demo dipakai bersama')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Hapus seluruh data belajarku' })).toHaveCount(0)
    await page.goto('/skenario')
    await expect(page.getByText('5/5')).toBeVisible()
  })

  test('18. keluar dari adegan yang berjalan meminta konfirmasi', async ({ page }) => {
    await masukAkunBaru(page)
    await enterScenario(page, 'deaf')
    await page.getByRole('link', { name: 'Skenario' }).click()
    const dialog = page.getByRole('dialog', { name: 'Keluar dari sesi ini?' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Tetap di sini' }).click()
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/\/skenario\/kedai-kopi/)
    await page.getByRole('link', { name: 'Skenario' }).click()
    await page.getByRole('dialog').getByRole('link', { name: 'Keluar' }).click()
    await page.waitForURL('**/skenario')
  })
})
