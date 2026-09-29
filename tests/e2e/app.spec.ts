import { expect, test } from '@playwright/test'

import { createProgressState, type FactProgress, type ProgressState } from '../../src/domain/progress/progressState'
import { createMasteryProgress } from '../../src/domain/learning/mastery'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

test('первый запуск: диагностика, пропуск ведёт на главный экран', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Короткая проверка' })).toBeVisible()
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()

  await expect(page.getByRole('heading', { name: 'Математическая экспедиция' })).toBeVisible()
})

test('миссия: ошибка называет введённое, Enter отправляет ответ, XP переживает перезагрузку', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть' }).click()

  // Карточка 1 из 2: 0 × 0 — намеренно неверный ответ.
  await expect(page.getByText('Карточка 1 из 2')).toBeVisible()
  await page.getByLabel('Ответ на пример').fill('1')
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(page.getByText('ты ответил 1, а верный ответ 0')).toBeVisible()
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
  await page.goto('/')

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
