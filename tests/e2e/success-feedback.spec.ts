import { expect, test } from '@playwright/test'

import { createProgressState } from '../../src/domain/progress/progressState'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

async function openMission(page: import('@playwright/test').Page) {
  await page.goto('./')
  await page.getByRole('button', { name: 'Начать знакомство' }).click()
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть' }).click()
}

function waitForFlip(page: import('@playwright/test').Page) {
  return page.locator('.inspira-flip-card__inner').evaluate((element) => new Promise<void>((resolve) => {
    const duration = Number.parseFloat(getComputedStyle(element).transitionDuration)
    if (duration === 0) return resolve()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(fallback)
      element.removeEventListener('transitionend', onTransitionEnd)
      resolve()
    }
    const onTransitionEnd = (event: Event) => {
      if (event.target === element && (event as TransitionEvent).propertyName === 'transform') finish()
    }
    const fallback = window.setTimeout(finish, duration + 100)
    element.addEventListener('transitionend', onTransitionEnd)
  }))
}

test('правильный ответ окрашивает карточку без конфетти на самой карточке', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await openMission(page)
  const front = page.locator('.question-card--front')
  await expect(front.locator('.question-card__confetti')).toHaveCount(0)
  await expect(page.locator('.inspira-flip-card')).toHaveAttribute('data-flipped', 'false')
  await expect(page.locator('.inspira-flip-card__back')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.inspira-flip-card__back')).toHaveAttribute('inert', '')
  await expect(page.locator('.inspira-flip-card__back')).toHaveCSS('visibility', 'hidden')
  await page.screenshot({ path: '/tmp/math-inspira-flip-front-mobile.png' })
  await page.getByLabel('Ответ на пример').fill('0')
  const correctFlip = waitForFlip(page)
  await page.getByRole('button', { name: 'Проверить' }).click()
  await correctFlip

  const card = page.locator('.question-card--correct')
  await expect(card).toBeVisible()
  await expect(page.locator('.inspira-flip-card')).toHaveAttribute('data-flipped', 'true')
  await expect(page.locator('.inspira-flip-card__front')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.inspira-flip-card__back')).not.toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('.inspira-flip-card__front')).toHaveCSS('visibility', 'hidden')
  await expect(card).toHaveCSS('background-color', 'rgb(227, 246, 237)')
  await expect(card.getByText('Верно')).toBeVisible()
  await expect(card.locator('.question-card__expression')).toContainText('0 × 0 = 0')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('background-color', 'rgb(22, 116, 93)')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', /^success-confirm/)
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
  await page.screenshot({ path: '/tmp/math-success-normal.png' })
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await page.getByRole('button', { name: 'Продолжить' }).click()
  await expect(page.locator('.question-card--front')).toBeVisible()
  await expect(page.locator('.inspira-flip-card')).toHaveAttribute('data-flipped', 'false')
  await expect(page.getByLabel('Ответ на пример')).toBeFocused()
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
  await page.getByLabel('Ответ на пример').fill('1')
  const reviewFlip = waitForFlip(page)
  await page.getByRole('button', { name: 'Проверить' }).click()
  await reviewFlip
  const reviewCard = page.locator('.question-card--review')
  await expect(reviewCard.getByText('Разберём вместе')).toBeVisible()
  await expect(reviewCard).toBeVisible()
  await expect(reviewCard).toHaveCSS('background-color', 'rgb(255, 243, 221)')
  await expect(reviewCard.locator('.question-card__confetti')).toHaveCount(0)
})

test('при уменьшении движения остаются цвет и текст без анимации', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openMission(page)
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByRole('button', { name: 'Проверить' }).click()

  const card = page.locator('.question-card--correct')
  await expect(card).toHaveCSS('background-color', 'rgb(227, 246, 237)')
  await expect(page.locator('.inspira-flip-card')).toHaveAttribute('data-flipped', 'true')
  await expect(page.locator('.inspira-flip-card__inner')).toHaveCSS('transition-duration', '0s')
  await expect(card.getByText('Верно')).toBeVisible()
  await expect(card.locator('.question-card__expression')).toContainText('0 × 0 = 0')
  await page.screenshot({ path: '/tmp/math-success-reduced.png' })
  await expect(card).toHaveCSS('animation-name', 'none')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', 'none')
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
})

test('wide viewport keeps the revealed card centered and free of horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openMission(page)
  await page.getByLabel('Ответ на пример').fill('1')
  await page.getByRole('button', { name: 'Проверить' }).click()

  const card = page.locator('.question-card--review')
  await expect(card).toBeVisible()
  const bounds = await card.boundingBox()
  const layoutWidth = await card.evaluate((element) => Number.parseFloat(getComputedStyle(element).width))
  expect(bounds).not.toBeNull()
  expect(layoutWidth).toBeLessThanOrEqual(480)
  expect(bounds!.x).toBeGreaterThanOrEqual(0)
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440)
  expect(Math.abs(bounds!.x + bounds!.width / 2 - 720)).toBeLessThan(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '/tmp/math-inspira-flip-desktop.png', fullPage: true })
})

test('accepted answer survives refresh and the resumed mission awards XP once', async ({ page }) => {
  const initial = createProgressState()
  const seeded = {
    ...initial,
    diagnostic: { factIds: [], skipped: true, completed: true },
  }
  await page.goto('./')
  await page.evaluate(
    ([key, snapshot]) => window.localStorage.setItem(key, snapshot),
    [PROGRESS_STORAGE_KEY, serializeSnapshot(seeded)],
  )
  await page.reload()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()

  await expect(page.getByText('Карточка 1 из 2')).toBeVisible()
  const firstExpression = await page.locator('.question-card--front .question-card__expression span[aria-hidden]').textContent()
  const [left, right] = (firstExpression ?? '').split('=')[0].trim().split(' × ').map(Number)
  await page.getByLabel('Ответ на пример').fill(String(left * right))
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(page.getByText('Верно')).toBeVisible()
  await page.reload()

  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await expect(page.getByText('Верно')).toHaveCount(0)
  const resumedExpression = await page.locator('.question-card--front .question-card__expression span[aria-hidden]').textContent()
  expect(resumedExpression).not.toBe(firstExpression)
  const [nextLeft, nextRight] = (resumedExpression ?? '').split('=')[0].trim().split(' × ').map(Number)
  await page.getByLabel('Ответ на пример').fill(String(nextLeft * nextRight))
  await page.getByRole('button', { name: 'Проверить' }).click()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await expect(page.getByText('Миссия завершена!')).toBeVisible()
  await expect(page.getByRole('status', {
    name: 'Опыт за практику: +10 XP. Всего 10 XP. Уровень 1.',
  })).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить' }).click()
  await page.reload()
  await expect(page.getByText('Всего XP: 10')).toBeVisible()
})
