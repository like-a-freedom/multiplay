import { expect, test } from '@playwright/test'

import { createProgressState } from '../../src/domain/progress/progressState'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

test('ошибка в 0 × 5 показывает спокойную карточку и пустые группы', async ({ page }) => {
  const initial = createProgressState()
  const progress = {
    ...initial,
    diagnostic: { factIds: [], skipped: true, completed: false },
    currentMission: { id: 'review-zero-five', cardFactIds: ['0:5'], answeredFactIds: [] },
  }
  await page.addInitScript(([key, snapshot]) => localStorage.setItem(key, snapshot), [
    PROGRESS_STORAGE_KEY,
    serializeSnapshot(progress),
  ])
  await page.setViewportSize({ width: 428, height: 926 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Играть' }).click()
  await expect(page.locator('.question-card__expression')).toContainText('0 × 5 = ?')
  await page.getByLabel('Ответ на пример').fill('5')
  await page.getByRole('button', { name: 'Проверить' }).click()

  const card = page.locator('.question-card')
  await expect(card).toHaveClass(/question-card--review/)
  await expect(card).toHaveCSS('background-color', 'rgb(255, 243, 221)')
  await expect(card.getByText('Разберём вместе')).toBeVisible()
  await expect(card.locator('.question-card__feedback')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', /^review-appear/)
  await expect(card.getByText('Твой ответ: 5')).toBeVisible()
  await expect(card.getByText('Верный ответ: 0')).toBeVisible()
  await expect(card.getByText('Ноль групп по 5: ничего не берём, получается 0.')).toBeVisible()
  await expect(card.locator('.question-card__zero-visual')).toContainText('групп по 5')
  await expect(card.locator('.question-card__confetti span')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: '/tmp/math-review-zero-five.png' })

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', 'none')
  await expect(card.locator('.question-card__hint')).toHaveCSS('animation-name', 'none')
})

test('«Не знаю» открывает спокойную подсказку без оценки ребёнка', async ({ page }) => {
  const initial = createProgressState()
  const progress = {
    ...initial,
    diagnostic: { factIds: [], skipped: true, completed: false },
    currentMission: { id: 'hint-zero-seven', cardFactIds: ['0:7'], answeredFactIds: [] },
  }
  await page.addInitScript(([key, snapshot]) => localStorage.setItem(key, snapshot), [
    PROGRESS_STORAGE_KEY,
    serializeSnapshot(progress),
  ])
  await page.setViewportSize({ width: 428, height: 926 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Играть' }).click()
  await expect(page.getByLabel('Ответ на пример')).toHaveAttribute('placeholder', 'Введи целое число от 0 до 100')
  await page.getByRole('button', { name: 'Не знаю' }).click()

  const card = page.locator('.question-card')
  await expect(card).toHaveClass(/question-card--review/)
  await expect(card.getByText('Посмотрим подсказку')).toBeVisible()
  await expect(card.getByText('Верный ответ: 0')).toBeVisible()
  await expect(card.getByText('Твой ответ:', { exact: false })).toHaveCount(0)
  await expect(card.getByText('Как это работает')).toBeVisible()
  await expect(card.getByText('Ноль групп по 7: ничего не берём, получается 0.')).toBeVisible()
  await expect(card.locator('.question-card__zero-visual')).toContainText('групп по 7')
  await page.screenshot({ path: '/tmp/math-hint-zero-seven.png', fullPage: true })
})
