import { expect, test } from '@playwright/test'

import { createProgressState } from '../../src/domain/progress/progressState'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

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

test('ошибка в 0 × 5 показывает спокойную карточку и правило-коротышку', async ({ page }) => {
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
  await page.goto('./')
  await page.getByRole('button', { name: 'Играть' }).click()
  await expect(page.locator('.question-card--front .question-card__expression')).toContainText('0 × 5 = ?')
  await page.getByLabel('Ответ на пример').fill('5')
  const flipFinished = waitForFlip(page)
  await page.getByRole('button', { name: 'Проверить' }).click()
  await flipFinished

  const card = page.locator('.question-card--review')
  await expect(card).toBeVisible()
  await expect(page.locator('.inspira-flip-card__front')).toHaveAttribute('aria-hidden', 'true')
  await expect(card).toHaveCSS('background-color', 'rgb(255, 243, 221)')
  await expect(card.getByText('Разберём вместе')).toBeVisible()
  await expect(card.locator('.question-card__feedback')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', /^review-appear/)
  await expect(card.getByText('Твой ответ: 5')).toBeVisible()
  await expect(card.getByText('Верный ответ: 0')).toBeVisible()
  await expect(card.getByText('На ноль умножать — всегда будет 0.')).toBeVisible()
  await expect(card.locator('.question-card__zero-visual')).toHaveCount(0)
  await expect(card.locator('.question-card__confetti')).toHaveCount(0)
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
  await page.goto('./')
  const offlineNotice = page.getByRole('button', { name: 'Понятно', exact: true })
  if (await offlineNotice.count()) await offlineNotice.click()
  await page.getByRole('button', { name: 'Играть' }).click()
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await expect(page.getByLabel('Ответ на пример')).toHaveAttribute('placeholder', 'Введи целое число от 0 до 100')
  await page.getByRole('button', { name: 'Не знаю' }).click()

  const card = page.locator('.question-card--review')
  await expect(card).toBeVisible()
  await expect(card.getByText('Посмотрим подсказку')).toBeVisible()
  await expect(card.getByText('Верный ответ: 0')).toBeVisible()
  await expect(card.getByText('Твой ответ:', { exact: false })).toHaveCount(0)
  await expect(card.getByText('Как вспомнить')).toBeVisible()
  await expect(card.getByText('На ноль умножать — всегда будет 0.')).toBeVisible()
  await expect(card.locator('.question-card__zero-visual')).toHaveCount(0)
  await page.screenshot({ path: '/tmp/math-hint-zero-seven.png', fullPage: true })
})
