import { expect, test, type Page } from '@playwright/test'

import { createProgressState, type ProgressState } from '../../src/domain/progress/progressState'
import { serializeSnapshot } from '../../src/infrastructure/storage/snapshot'
import { PROGRESS_STORAGE_KEY } from '../../src/infrastructure/storage/localStorageProgressStore'

async function seed(page: Page, state: ProgressState): Promise<void> {
  await page.goto('./')
  await page.evaluate(([key, snapshot]) => localStorage.setItem(key, snapshot), [PROGRESS_STORAGE_KEY, serializeSnapshot(state)])
  await page.reload()
}
function ready(): ProgressState {
  return { ...createProgressState(), diagnostic: { factIds: [], skipped: true, completed: true } }
}
async function saved(page: Page): Promise<ProgressState> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!).state, PROGRESS_STORAGE_KEY)
}

async function currentProduct(page: Page): Promise<number> {
  const expression = await page
    .locator('.question-card--front .question-card__expression span[aria-hidden]')
    .textContent()
  const match = expression?.match(/(\d+)\s*×\s*(\d+)/)
  expect(match, `не удалось прочитать пример: ${expression}`).not.toBeNull()
  return Number(match![1]) * Number(match![2])
}

function wrongAnswer(product: number): string {
  return String(product === 100 ? product - 1 : product + 1)
}

test('mixed outcomes stay truthful after reload and a wrong answer earns effort XP', async ({ page }) => {
  const initial = ready()
  await seed(page, { ...initial, currentMission: { id: 'mixed', cardFactIds: ['0:0', '0:1', '0:2'], answeredFactIds: [] } })
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await page.getByLabel('Ответ на пример').fill('1')
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByRole('listitem', { name: 'Карточка 1: Разобрали вместе' })).toHaveAttribute('data-outcome', 'wrong')
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await expect(page.getByText('Карточка 2 из 3', { exact: true })).toBeVisible()
  await expect(page.getByRole('listitem', { name: 'Карточка 1: Разобрали вместе' })).toHaveAttribute('data-outcome', 'wrong')
  await page.getByRole('button', { name: 'Не знаю', exact: true }).click()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await expect(page.getByRole('listitem', { name: 'Карточка 2: С подсказкой' })).toHaveAttribute('data-outcome', 'unknown')
  await expect(page.getByRole('listitem', { name: 'Карточка 3: Сейчас' })).toHaveAttribute('data-outcome', 'current')
  const wrongColor = await page.locator('[data-outcome="wrong"]').evaluate(e => getComputedStyle(e).backgroundColor)
  const hintColor = await page.locator('[data-outcome="unknown"]').evaluate(e => getComputedStyle(e).backgroundColor)
  expect(wrongColor).not.toBe(hintColor)
  await page.locator('.mission__card').evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.finish()))
  await page.screenshot({ path: '/tmp/math-round2-mixed-progress.png', fullPage: true })
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByRole('listitem', { name: 'Карточка 3: Верно' })).toHaveAttribute('data-outcome', 'correct')
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await expect(page.locator('.mission__results')).toContainText('Верно1Разобрали1С подсказкой1')
  await expect(page.getByRole('status', { name: /Опыт за практику: \+10 XP/ })).toBeVisible()
  await expect(page.locator('.xp-award__visual')).toHaveText('+10 XP')
  await page.locator('.mission__finish').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity).forEach(animation => animation.finish()))
  await page.screenshot({ path: '/tmp/math-round2-mixed-finish.png', fullPage: true })
  expect((await saved(page)).rewards.totalXp).toBe(10)
  await page.reload()
  expect((await saved(page)).rewards.totalXp).toBe(10)
})

test('hints-only finish pays no XP or streak, then an entered wrong answer qualifies', async ({ page }) => {
  await seed(page, ready())
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Не знаю', exact: true }).click()
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  }
  await expect(page.getByText('+0 XP', { exact: true })).toBeVisible()
  await expect(page.locator('.xp-award__reason')).toContainText('даже ошибка считается попыткой')
  await expect(page.locator('.xp-route__beam, .inspira-confetti')).toHaveCount(0)
  const hintsOnly = await saved(page)
  expect(hintsOnly.rewards.totalXp).toBe(0)
  expect(hintsOnly.rewards.streak.days).toBe(0)
  expect(hintsOnly.rewards.completions[0].xpEligible).toBe(false)
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  const product = await currentProduct(page)
  await page.getByLabel('Ответ на пример').fill(wrongAnswer(product))
  await page.getByLabel('Ответ на пример').press('Enter')
  await expect(page.getByText('Разберём вместе', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  // Four cards: two previously seen and two new.
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'Не знаю', exact: true }).click()
    await page.getByRole('button', { name: 'Продолжить', exact: true }).click()
  }
  await expect(page.getByRole('status', { name: /Опыт за практику: \+10 XP/ })).toBeVisible()
  const attempted = await saved(page)
  expect(attempted.rewards.totalXp).toBe(10)
  expect(attempted.rewards.streak.days).toBe(1)
  expect(attempted.rewards.completions[1].xpEligible).toBe(true)
})

test('reset requires protected confirmation; cancel and Escape preserve the disposable fixture', async ({ page }) => {
  const initial = ready()
  await seed(page, { ...initial, rewards: { ...initial.rewards, totalXp: 20 } })
  await page.getByRole('button', { name: 'Отчёт для взрослого' }).click()
  const before = await saved(page)
  const trigger = page.getByRole('button', { name: 'Сбросить данные', exact: true })
  await trigger.focus()
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Удалить весь прогресс?' })
  await expect(dialog).toBeVisible()
  const cancel = dialog.getByRole('button', { name: 'Отмена', exact: true })
  await expect(cancel).toBeFocused()
  await cancel.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Удалить весь прогресс', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(cancel).toBeFocused()
  await cancel.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  expect(await saved(page)).toEqual(before)
  await trigger.click()
  await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
  expect(await saved(page)).toEqual(before)
  await trigger.click()
  await dialog.getByRole('button', { name: 'Удалить весь прогресс', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Привет! Я Орби.' })).toBeVisible()
  expect(await page.evaluate(key => localStorage.getItem(key), PROGRESS_STORAGE_KEY)).toBeNull()
})

for (const size of [{ name: 'mobile', width: 428, height: 926 }, { name: 'desktop', width: 1280, height: 900 }, { name: 'comment', width: 723, height: 780 }, { name: 'zoom', width: 320, height: 740 }]) {
  test(`review and report hierarchy: ${size.name}`, async ({ page }) => {
    await page.setViewportSize(size)
    const initial = ready()
    const facts = { ...initial.facts }
    for (const id of ['0:0', '0:1', '0:2']) facts[id] = { ...facts[id], status: 'familiar', review: { completedSuccesses: 0, nextReviewDate: '2020-01-01' } }
    await seed(page, { ...initial, facts, rewards: { ...initial.rewards, totalXp: 20 } })
    if (size.name === 'zoom') await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await expect(page.locator('.home__review-number')).toHaveText('3')
    await expect(page.locator('.home__footnote')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const wordLines = async (selector: string, word: string) => page.locator(selector).evaluate((element, token) => {
      const text = element.firstChild!
      const start = text.textContent!.indexOf(token)
      const range = document.createRange()
      range.setStart(text, start)
      range.setEnd(text, start + token.length)
      return [...range.getClientRects()].filter(rect => rect.width > 0).length
    }, word)
    expect(await wordLines('.home__greeting h2', 'звёздам!')).toBe(1)
    expect(await wordLines('.home__mission .launch-button__label', 'Повторить')).toBe(1)
    await page.screenshot({ path: `/tmp/math-round2-due-home-${size.name}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Карта звёзд', exact: true }).click()
    expect(await wordLines('.map__review-heading h2', 'повторить')).toBe(1)
    const gauge = (await page.locator('.map__gauge').boundingBox())!
    const markers = await page.locator('.map__chart .constellation-sky__star').evaluateAll(elements => elements.map(element => {
      const { left, top, right, bottom } = element.getBoundingClientRect()
      return { left, top, right, bottom }
    }))
    expect(markers).toHaveLength(66)
    for (const marker of markers) {
      const cx = gauge.x + gauge.width / 2
      const cy = gauge.y + gauge.height / 2
      const nearestX = Math.max(marker.left, Math.min(cx, marker.right))
      const nearestY = Math.max(marker.top, Math.min(cy, marker.bottom))
      expect(Math.hypot(nearestX - cx, nearestY - cy)).toBeGreaterThan(gauge.width / 2)
    }
    await page.screenshot({ path: `/tmp/math-round2-map-${size.name}.png`, fullPage: true })
    await page.getByRole('button', { name: /Все факты и достижения/ }).click()
    const fact = page.locator('.map__facts li').first()
    await expect(fact).toContainText('Звезда впереди')
    await expect(fact).toContainText('Пора повторить')
    await page.locator('.map__facts li').first().scrollIntoViewIfNeeded()
    await page.locator('.map__archive-content').evaluate(element => element.getAnimations().forEach(animation => animation.finish()))
    await page.screenshot({ path: `/tmp/math-round2-archive-${size.name}.png` })
    await page.getByRole('button', { name: 'Отчёт для взрослого' }).click()
    const values = await page.locator('.report__tile-value').all()
    const labels = await page.locator('.report__tile-label').all()
    if (size.name !== 'zoom') {
      expect(Math.abs((await values[0].boundingBox())!.y - (await values[1].boundingBox())!.y)).toBeLessThan(1)
      expect(Math.abs((await values[2].boundingBox())!.y - (await values[3].boundingBox())!.y)).toBeLessThan(1)
    }
    for (const label of labels) await expect(label).toHaveCSS('font-weight', '900')
    await expect(page.locator('.report__tile-value--empty')).toHaveCSS('font-weight', '700')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: `/tmp/math-round2-report-${size.name}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Сбросить данные', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Отмена', exact: true })).toBeFocused()
    const dialog = page.getByRole('dialog', { name: 'Удалить весь прогресс?' })
    expect(await dialog.evaluate(element => element.scrollTop)).toBe(0)
    const dialogBounds = (await dialog.boundingBox())!
    for (const element of await dialog.locator('h2, p, button').all()) {
      const bounds = (await element.boundingBox())!
      expect(bounds.y).toBeGreaterThanOrEqual(dialogBounds.y)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(Math.min(dialogBounds.y + dialogBounds.height, size.height))
    }
    await page.screenshot({ path: `/tmp/math-round2-reset-${size.name}.png` })
    await page.getByRole('button', { name: 'Отмена', exact: true }).click()
  })
}
