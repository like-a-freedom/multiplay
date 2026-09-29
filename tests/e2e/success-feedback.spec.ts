import { expect, test } from '@playwright/test'

async function openMission(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Пропустить проверку' }).click()
  await page.getByRole('button', { name: 'Играть' }).click()
}

test('правильный ответ окрашивает карточку и запускает однократное конфетти', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 })
  await openMission(page)
  await page.getByLabel('Ответ на пример').fill('0')
  await page.getByRole('button', { name: 'Проверить' }).click()

  const card = page.locator('.question-card')
  await expect(card).toHaveClass(/question-card--correct/)
  await expect(card).toHaveCSS('background-color', 'rgb(224, 244, 232)')
  await expect(card.getByText('Верно')).toBeVisible()
  await expect(card.locator('.question-card__expression')).toContainText('0 × 0 = 0')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('background-color', 'rgb(11, 107, 98)')
  await expect(card.locator('.question-card__feedback')).toHaveCSS('animation-name', /^success-confirm/)
  await expect(card.locator('.question-card__confetti span')).toHaveCount(8)
  expect(await card.locator('.question-card__confetti span').first().evaluate((piece) => getComputedStyle(piece).animationName)).toMatch(/^confetti-burst/)
  await page.screenshot({ path: '/tmp/math-success-normal.png' })
  await expect(page.getByRole('button', { name: 'Продолжить' })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await page.getByRole('button', { name: 'Продолжить' }).click()
  await expect(card).not.toHaveClass(/question-card--correct/)
  await expect(card.locator('.question-card__confetti span')).toHaveCount(0)
  await page.getByLabel('Ответ на пример').fill('1')
  await page.getByRole('button', { name: 'Проверить' }).click()
  await expect(card.getByText('Разберём вместе')).toBeVisible()
  await expect(card).toHaveClass(/question-card--review/)
  await expect(card).toHaveCSS('background-color', 'rgb(255, 243, 221)')
  await expect(card.locator('.question-card__confetti span')).toHaveCount(0)
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
  await expect(card.locator('.question-card__confetti span').first()).toHaveCSS('animation-name', 'none')
})
