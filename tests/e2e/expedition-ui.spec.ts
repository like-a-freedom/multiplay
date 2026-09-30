import { expect, test } from '@playwright/test'

test('home starts one short mission after the launch transition', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  const offlineNotice = page.getByRole('button', { name: 'Понятно', exact: true })
  if (await offlineNotice.count()) await offlineNotice.click()

  const homeHeading = page.getByRole('heading', { name: 'Умножайка' })
  const launchButton = page.getByRole('button', { name: 'Играть', exact: true })
  await expect(homeHeading).toBeVisible()
  await expect(launchButton).toHaveCSS('min-height', '56px')
  await expect(launchButton).toHaveCSS('background-color', 'rgb(23, 92, 211)')
  await expect(launchButton).toHaveCSS('font-size', '17px')

  await page.clock.install()
  await launchButton.focus()
  await page.keyboard.press('Space')
  await page.screenshot({ path: '/tmp/math-phase1-launching.png' })
  await expect(page.locator('.ripple-animation')).toHaveCount(1)
  await expect(page.locator('.ripple-animation')).toHaveCSS('border-top-color', 'rgb(249, 186, 67)')
  await expect(homeHeading).toBeVisible()
  await page.clock.runFor(200)
  await expect(launchButton).toHaveAttribute('aria-busy', 'true')
  await expect(launchButton).toHaveCSS('opacity', '1')
  expect(await page.getByText('Карточка 1 из 2').count()).toBe(0)
  await page.clock.runFor(40)
  await expect(page.getByText('Карточка 1 из 2')).toBeVisible()
})


test('touching the play action gives visible golden feedback before the mission', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  const offlineNotice = page.getByRole('button', { name: 'Понятно', exact: true })
  if (await offlineNotice.count()) await offlineNotice.click()
  const launchButton = page.getByRole('button', { name: 'Играть', exact: true })
  await launchButton.click()
  const ripple = page.locator('.ripple-animation')
  await expect(ripple).toHaveCount(1)
  await expect(ripple).toHaveCSS('border-top-color', 'rgb(249, 186, 67)')
  await expect(launchButton).toHaveAttribute('aria-busy', 'true')
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  await page.screenshot({ path: '/tmp/math-phase1-tap.png' })
  await expect(page.getByText('Карточка 1 из 2')).toBeVisible()
})

test('reduced motion opens the mission without waiting for the launch transition', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 2')).toBeVisible()
})


test('reloading during launch leaves a valid home and does not create a mission', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.clock.install()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Умножайка' })).toBeVisible()
  expect(await page.getByText(/Карточка 1 из/).count()).toBe(0)
})
