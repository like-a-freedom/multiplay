import { expect, test } from '@playwright/test'

import { createLastStarExpeditionState } from '../support/expeditionFixture'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'

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

test('last mastery star completes the expedition with one celebration while offline', async ({ page, context }) => {
  const scriptResponses: { url: string; fromServiceWorker: boolean }[] = []
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script') {
      scriptResponses.push({
        url: response.url(),
        fromServiceWorker: response.fromServiceWorker(),
      })
    }
  })

  await page.goto('./')
  // Activation waits for the precache install; the offline banner is hidden on the diagnostic screen.
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

  await page.evaluate(
    ([key, snapshot]) => window.localStorage.setItem(key, snapshot),
    [PROGRESS_STORAGE_KEY, serializeSnapshot(createLastStarExpeditionState())],
  )
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Умножайка' })).toBeVisible()
  await expect(page.locator('.home .constellation-sky__star--earned')).toHaveCount(65)

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Умножайка' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('100')
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByText('Новая звезда открыта на карте!')).toBeVisible()
  await expect(page.locator('.expedition-celebration')).toHaveCount(0)
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Экспедиция завершена!' })).toBeVisible()
  await expect(page.locator('.mission__final-sky .constellation-sky__star--earned')).toHaveCount(66)
  await expect(page.locator('.mission__final-sky .constellation-sky__star--idle')).toHaveCount(0)
  await expect(page.locator('.expedition-celebration canvas')).toHaveAttribute('data-loaded', 'true')
  await expect(page.locator('.expedition-celebration canvas')).toHaveAttribute('data-fired', 'true')
  await expect(page.getByRole('button', { name: 'Продолжить', exact: true })).toBeEnabled()

  expect(scriptResponses.filter((entry) => entry.fromServiceWorker).length).toBeGreaterThanOrEqual(2)
  expect(scriptResponses.some((entry) => entry.fromServiceWorker && entry.url.includes('confetti.module'))).toBe(true)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Умножайка' })).toBeVisible()
  await expect(page.getByText('К повторению: 0')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Свободная практика', exact: true })).toBeVisible()
  await expect(page.locator('.expedition-celebration')).toHaveCount(0)
  await expect(page.locator('.home .constellation-sky__star--earned')).toHaveCount(66)
})
