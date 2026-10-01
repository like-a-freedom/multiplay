import { expect, test } from '@playwright/test'

import { createProgressState } from '../../src/domain/progress/progressState'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

async function openMission(page: import('@playwright/test').Page) {
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть' }).click()
}

test('правильный ответ окрашивает карточку без конфетти на самой карточке', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await openMission(page)
  const card = page.locator('.question-card')
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByRole('button', { name: 'Проверить' }).click()

  await expect(card).toHaveClass(/question-card--correct/)
  await expect(card).toHaveCSS('background-color', 'rgb(224, 244, 232)')
  await expect(card.getByText('Верно')).toBeVisible()
  await expect(card.locator('.question-card__expression')).toContainText('0 × 0 = 0')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('background-color', 'rgb(11, 107, 98)')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', /^success-confirm/)
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
  await page.screenshot({ path: '/tmp/math-success-normal.png' })
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await page.getByRole('button', { name: 'Продолжить' }).click()
  await expect(card).not.toHaveClass(/question-card--correct/)
  await expect(page.getByLabel('Ответ на пример')).toBeFocused()
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
  await page.getByLabel('Ответ на пример').fill('1')
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(card.getByText('Разберём вместе')).toBeVisible()
  await expect(card).toHaveClass(/question-card--review/)
  await expect(card).toHaveCSS('background-color', 'rgb(255, 243, 221)')
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
})

test('при уменьшении движения остаются цвет и текст без анимации', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openMission(page)
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByRole('button', { name: 'Проверить' }).click()

  const card = page.locator('.question-card')
  await expect(card).toHaveCSS('background-color', 'rgb(224, 244, 232)')
  await expect(card.getByText('Верно')).toBeVisible()
  await expect(card.locator('.question-card__expression')).toContainText('0 × 0 = 0')
  await page.screenshot({ path: '/tmp/math-success-reduced.png' })
  await expect(card).toHaveCSS('animation-name', 'none')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', 'none')
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
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
  const firstExpression = await page.locator('.question-card__expression span[aria-hidden]').textContent()
  const [left, right] = (firstExpression ?? '').split('=')[0].trim().split(' × ').map(Number)
  await page.getByLabel('Ответ на пример').fill(String(left * right))
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(page.getByText('Верно')).toBeVisible()
  await page.reload()

  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await expect(page.getByText('Верно')).toHaveCount(0)
  const resumedExpression = await page.locator('.question-card__expression span[aria-hidden]').textContent()
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
