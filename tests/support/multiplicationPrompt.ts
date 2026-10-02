import type { Page } from '@playwright/test'

export interface MultiplicationPrompt {
  readonly factors: readonly [number, number]
  readonly product: number
}

export async function currentPrompt(page: Page): Promise<MultiplicationPrompt> {
  const expression = await page
    .locator('.question-card--front .question-card__expression span[aria-hidden]')
    .textContent()
  if (expression === null) throw new Error('the current multiplication prompt is not visible')
  return parsePrompt(expression)
}

export function parsePrompt(expression: string): MultiplicationPrompt {
  const match = expression.match(/(\d+)\s*×\s*(\d+)/)
  if (match === null) throw new Error(`could not read the multiplication prompt: ${expression}`)
  const factors: readonly [number, number] = [Number(match[1]), Number(match[2])]
  return { factors, product: factors[0] * factors[1] }
}

export function correctAnswer(prompt: MultiplicationPrompt): string {
  return String(prompt.product)
}

export function deliberatelyWrongAnswer(prompt: MultiplicationPrompt): string {
  return String(prompt.product === 100 ? prompt.product - 1 : prompt.product + 1)
}

export function isSimplePrompt(prompt: MultiplicationPrompt): boolean {
  return prompt.factors.some((factor) => [0, 1, 2, 5, 10].includes(factor))
}

export function isRulePrompt(prompt: MultiplicationPrompt): boolean {
  return prompt.factors.some((factor) => factor === 0 || factor === 1)
}
