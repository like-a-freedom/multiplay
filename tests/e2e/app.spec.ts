import { expect, test } from '@playwright/test'

import { createProgressState, type FactProgress, type ProgressState } from '../../src/domain/progress/progressState'
import { createMasteryProgress } from '../../src/domain/learning/mastery'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

test('первый запуск: диагностика, пропуск ведёт на главный экран', async ({ page }) => {
  await page.goto('./')

  await expect(page.getByRole('heading', { name: 'Короткая проверка' })).toBeVisible()
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()

  await expect(page.getByRole('heading', { name: 'Умножайка' })).toBeVisible()
})

test('миссия: ошибка называет введённое, Enter отправляет ответ, XP переживает перезагрузку', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть' }).click()

  // Карточка 1 из 2: 0 × 0 — намеренно неверный ответ.
  await expect(page.getByText('Карточка 1 из 2')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('1')
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(page.getByText('Твой ответ: 1')).toBeVisible()
  await expect(page.getByText('Верный ответ: 0')).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить' }).click()

  // Карточка 2 из 2: 0 × 1 — верный ответ отправляется Enter'ом.
  await expect(page.getByText('Карточка 2 из 2')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByText('Верно')).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить' }).click()

  await expect(page.getByText('Миссия завершена!')).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить' }).click()

  await expect(page.getByText('XP: 10 · Уровень 1')).toBeVisible()

  // Незаконченная сессия не теряет награду: прогресс живёт после перезагрузки.
  await page.reload()
  await expect(page.getByText('XP: 10 · Уровень 1')).toBeVisible()
})

test('поддерживающий режим: свободная практика доступна всегда', async ({ page }) => {
  await page.addInitScript(
    ([key, snapshot]) => {
      window.localStorage.setItem(key, snapshot)
    },
    [PROGRESS_STORAGE_KEY, serializeSnapshot(finishedExpedition())],
  )
  await page.goto('./')

  await expect(page.getByText('На сегодня повторений нет')).toBeVisible()
  await page.getByRole('button', { name: 'Свободная практика' }).click()

  await expect(page.getByText('Карточка 1 из 10')).toBeVisible()

  // Практика перемешана — вычисляем ответ из показанного примера (видимая часть без озвучки).
  const expression = await page.locator('.question-card__expression span[aria-hidden]').textContent()
  const [a, b] = (expression ?? '').split('=')[0].trim().split(' × ').map(Number)
  await page.getByLabel('Ответ на пример').fill(String(a * b))
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByText('Верно')).toBeVisible()
})

test('«Пора повторить» ведёт сразу в повторение', async ({ page }) => {
  await page.addInitScript(
    ([key, snapshot]) => {
      window.localStorage.setItem(key, snapshot)
    },
    [PROGRESS_STORAGE_KEY, serializeSnapshot(maintenanceWithReview())],
  )
  await page.goto('./')

  await expect(page.getByText('К повторению: 1')).toBeVisible()
  await page.getByRole('button', { name: 'Повторить', exact: true }).click()

  // Повторение — только факт с наступившим сроком, без новых и практики.
  await expect(page.getByText('Карточка 1 из 1')).toBeVisible()
  await expect(page.getByText('2 × 3 = ?')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('6')
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByText('Верно')).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await expect(page.getByText('Миссия завершена!')).toBeVisible()
})

function finishedExpedition(): ProgressState {
  const base = createProgressState()
  const facts: Record<string, FactProgress> = {}
  for (const [factId, fact] of Object.entries(base.facts)) {
    facts[factId] = {
      ...fact,
      status: 'familiar',
      review: { completedSuccesses: 3, nextReviewDate: '2099-01-01' },
      mastery: { ...createMasteryProgress(), hasStar: true },
    }
  }
  return {
    ...base,
    facts,
    mode: 'maintenance',
    expeditionFinished: true,
    diagnostic: { factIds: [], skipped: false, completed: true },
  }
}

/** Поддерживающий режим: один факт с наступившим сроком проверки. */
function maintenanceWithReview(): ProgressState {
  const base = finishedExpedition()
  const fact = base.facts['2:3']
  return {
    ...base,
    facts: {
      ...base.facts,
      '2:3': {
        ...fact,
        status: 'familiar',
        review: { completedSuccesses: 0, nextReviewDate: '2020-01-01' },
      },
    },
  }
}

test('карта звёзд отмечает собранные звёзды на созвездии', async ({ page }) => {
  await page.addInitScript(
    ([key, snapshot]) => {
      window.localStorage.setItem(key, snapshot)
    },
    [PROGRESS_STORAGE_KEY, serializeSnapshot(stateWithStars(5))],
  )
  await page.goto('./')

  await expect(page.getByText('Открыто звёзд: 5 из 66')).toHaveCount(0) // заголовок ещё на главной
  await page.getByRole('button', { name: 'Карта звёзд', exact: true }).click()

  await expect(page.getByText('Открыто звёзд: 5 из 66')).toBeVisible()
  await expect(page.locator('.map__star--earned')).toHaveCount(5)
  await expect(page.locator('.map__star--idle')).toHaveCount(61)

  // Текстовая альтернатива: каждый факт назван со статусом в архиве.
  await page.getByRole('button', { name: /Все факты и достижения/ }).click()
  await expect(page.getByText('Звезда открыта')).toHaveCount(5)
  await expect(page.getByText('Звезда впереди')).toHaveCount(61)
})

/** Exactly `count` stars earned; the rest of the fact set stays unearned. */
function stateWithStars(count: number): ProgressState {
  const base = finishedExpedition()
  const facts: Record<string, FactProgress> = {}
  for (const [index, [factId, fact]] of Object.entries(base.facts).entries()) {
    facts[factId] = { ...fact, mastery: { ...fact.mastery, hasStar: index < count } }
  }
  return { ...base, facts }
}
