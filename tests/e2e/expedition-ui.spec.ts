import { expect, test } from '@playwright/test'

import { createLastStarExpeditionState } from '../support/expeditionFixture'
import { createProgressState } from '../../src/domain/progress/progressState'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

test('home starts one short mission after the launch transition', async ({ page }) => {
  await page.clock.install()
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

  const ship = page.locator('.expedition-ship-motion')
  const initialTransform = await ship.evaluate((element) => getComputedStyle(element).transform)
  await launchButton.focus()
  await page.keyboard.press('Space')
  await page.clock.runFor(100)
  const launchState = await page.evaluate(() => ({
    busy: document.querySelector('button[aria-busy="true"]') !== null,
    missionVisible: document.body.innerText.includes('Карточка 1 из 2'),
  }))
  expect(launchState).toEqual({ busy: true, missionVisible: false })
  expect(await ship.evaluate((element) => getComputedStyle(element).transform)).not.toBe(initialTransform)
  await page.screenshot({ path: '/tmp/math-phase2-launching-webkit.png' })
  await page.clock.runFor(140)
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


test('home route reflects earned XP while mastery stars stay separate', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()

  for (let card = 1; card <= 2; card += 1) {
    await expect(page.getByText(`Карточка ${card} из 2`)).toBeVisible()
    const expression = await page.locator('.question-card__expression span[aria-hidden]').textContent()
    const [left, right] = (expression ?? '').split('=')[0].trim().split(' × ').map(Number)
    await page.getByLabel('Ответ на пример').fill(String(left * right))
    await page.getByLabel('Ответ на пример').press('Enter')
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  }

  await expect(page.getByText('Миссия завершена!')).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await expect(page.getByRole('img', { name: 'Корабль экспедиции: уровень 1, 10 из 100 XP' })).toBeVisible()
  await expect(page.getByText('Звёзды знаний: 0 из 66')).toBeVisible()
  await page.screenshot({ path: '/tmp/math-task5-home-preview.png', fullPage: true })
})

test('a fourth +0 mission leaves the ship in place after reload', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-09-30T12:00:00+03:00') })
  const initial = createProgressState()
  const today = '2026-09-30'
  const seeded = {
    ...initial,
    currentMission: { id: 'fourth-mission', cardFactIds: ['0:0'], answeredFactIds: [] },
    rewards: {
      ...initial.rewards,
      totalXp: 30,
      completions: [1, 2, 3].map((number) => ({ missionId: `mission-${number}`, date: today })),
    },
    diagnostic: { factIds: [], skipped: true, completed: true },
  }
  await page.goto('./')
  await page.evaluate(
    ([key, snapshot]) => window.localStorage.setItem(key, snapshot),
    [PROGRESS_STORAGE_KEY, serializeSnapshot(seeded)],
  )
  await page.reload()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByLabel('Ответ на пример').press('Enter')
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await expect(page.getByText('Миссия завершена!')).toBeVisible()
  await expect(page.getByText('+0 XP')).toBeVisible()
  await expect(page.locator('.xp-route--finish')).toBeVisible()
  await expect(page.locator('.xp-route--finish')).toHaveAttribute('data-earned-in-level', '30')
  await expect(page.locator('.xp-route__beam')).toHaveCount(0)
  await expect(page.locator('.xp-award__visual')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Продолжить', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()

  const ship = page.getByRole('img', { name: 'Корабль экспедиции: уровень 1, 30 из 100 XP' })
  await expect(ship).toBeVisible()
  await page.reload()
  await expect(page.getByRole('img', { name: 'Корабль экспедиции: уровень 1, 30 из 100 XP' })).toBeVisible()
  await expect(page.getByText('Всего XP: 30')).toBeVisible()
  expect(await page.getByText('Карточка 1 из 1').count()).toBe(0)
})

test('reduced motion presents the final XP and route without a flight or beam', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const initial = createProgressState()
  const seeded = {
    ...initial,
    currentMission: { id: 'reduced-motion-finish', cardFactIds: ['0:0'], answeredFactIds: [] },
    diagnostic: { factIds: [], skipped: true, completed: true },
  }
  await page.goto('./')
  await page.evaluate(
    ([key, snapshot]) => window.localStorage.setItem(key, snapshot),
    [PROGRESS_STORAGE_KEY, serializeSnapshot(seeded)],
  )
  await page.reload()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByLabel('Ответ на пример').press('Enter')
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()

  await expect(page.locator('.xp-award__visual')).toHaveText('+10 XP')
  await expect(page.getByRole('img', { name: 'Корабль экспедиции: уровень 1, 10 из 100 XP' })).toBeVisible()
  await expect(page.locator('.xp-route__beam')).toHaveCount(0)
})

for (const size of [
  { name: 'mobile', width: 428, height: 926 },
  { name: 'zoom', width: 320, height: 740 },
  { name: 'desktop', width: 1280, height: 900 },
]) {
  test(`final expedition sky and celebration fit ${size.name}`, async ({ page }) => {
    await page.setViewportSize(size)
    await page.goto('./')
    await page.evaluate(
      ([key, snapshot]) => window.localStorage.setItem(key, snapshot),
      [PROGRESS_STORAGE_KEY, serializeSnapshot(createLastStarExpeditionState())],
    )
    await page.reload()
    if (size.name === 'zoom') {
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    }

    await page.getByRole('button', { name: 'Играть', exact: true }).click()
    await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
    await page.getByLabel('Ответ на пример').fill('100')
    await page.getByLabel('Ответ на пример').press('Enter')
    await expect(page.getByText('Новая звезда открыта на карте!')).toBeVisible()
    await expect(page.locator('.expedition-celebration')).toHaveCount(0)
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Экспедиция завершена!' })).toBeVisible()
    if (size.name === 'zoom') {
      await expect(page.locator('.mission__finish-title')).toHaveCSS('hyphens', 'auto')
      await expect(page.locator('.mission__finish-title')).toHaveCSS('overflow-wrap', 'normal')
    }
    await expect(page.locator('.mission__final-sky .constellation-sky__star--earned')).toHaveCount(66)
    await expect(page.locator('.mission .xp-route')).toHaveCount(0)
    await expect(page.locator('.expedition-celebration canvas')).toHaveAttribute('data-fired', 'true')
    await expect(page.locator('.xp-award__visual')).toHaveText('+10 XP')
    expect(await page.locator('.mission__final-sky').evaluate((sky) =>
      sky.contains(sky.querySelector('.expedition-celebration canvas')),
    )).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    for (const button of await page.getByRole('button').all()) {
      const bounds = await button.boundingBox()
      if (bounds) {
        expect(bounds.width).toBeGreaterThanOrEqual(48)
        expect(bounds.height).toBeGreaterThanOrEqual(48)
      }
    }
    await page.screenshot({ path: `/tmp/math-task6-final-sky-${size.name}.png`, fullPage: true })
    if (size.name === 'mobile') {
      await page.getByRole('button', { name: 'Карта звёзд', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Карта звёзд' })).toBeVisible()
      await expect(page.locator('.expedition-celebration')).toHaveCount(0)
      await page.getByRole('button', { name: 'Назад', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Умножайка' })).toBeVisible()
      await page.getByRole('button', { name: 'Карта звёзд', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Карта звёзд' })).toBeVisible()
      await expect(page.locator('.constellation-sky__reveal-line')).toHaveCount(0)
      await expect(page.locator('.expedition-celebration')).toHaveCount(0)
    }
  })
}

test('reduced motion shows the final sky without loading a celebration canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  await page.evaluate(
    ([key, snapshot]) => window.localStorage.setItem(key, snapshot),
    [PROGRESS_STORAGE_KEY, serializeSnapshot(createLastStarExpeditionState())],
  )
  await page.reload()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('100')
  await page.getByLabel('Ответ на пример').press('Enter')
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Экспедиция завершена!' })).toBeVisible()
  await expect(page.locator('.mission__final-sky .constellation-sky__star--earned')).toHaveCount(66)
  await expect(page.locator('.xp-award__visual')).toHaveText('+10 XP')
  await expect(page.locator('.expedition-celebration')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Продолжить', exact: true })).toBeEnabled()
  await page.screenshot({ path: '/tmp/math-task6-final-sky-reduced.png', fullPage: true })
})
