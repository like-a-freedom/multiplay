import { expect, test } from '@playwright/test'

test('static deployment: manifest, icons, worker scope and offline reload', async ({ page, context }) => {
  const failures: string[] = []
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url())
  })
  await page.goto('./')
  const basePath = new URL('./', page.url()).pathname
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(manifestHref).not.toBeNull()
  const manifestUrl = new URL(manifestHref!, page.url()).href
  const response = await page.request.get(manifestUrl)
  expect(response.ok()).toBe(true)
  const manifest = await response.json()
  for (const field of ['start_url', 'scope', 'id']) {
    expect(new URL(manifest[field], manifestUrl).pathname).toBe(basePath)
  }
  const iconHref = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')
  const iconUrls = [new URL(iconHref!, page.url()), ...manifest.icons.map((icon: { src: string }) => new URL(icon.src, manifestUrl))]
  for (const url of iconUrls) {
    expect(url.pathname.startsWith(basePath)).toBe(true)
    const iconResponse = await page.request.get(url.href)
    expect(iconResponse.ok()).toBe(true)
    expect(iconResponse.headers()['content-type']).toContain('image/png')
  }

  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await page.getByRole('button', { name: 'Не знаю', exact: true }).click()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  const registrationScope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)
  expect(new URL(registrationScope).pathname).toBe(basePath)

  await context.setOffline(true)
  await page.reload()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await page.getByRole('button', { name: 'Не знаю', exact: true }).click()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await expect(page.getByText('+10 XP', { exact: true })).toBeVisible()
  expect(failures).toEqual([])
})
