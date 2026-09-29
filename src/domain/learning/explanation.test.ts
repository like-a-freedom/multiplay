import { describe, expect, it } from 'vitest'

import { explanationFor } from '@/domain/learning/explanation'
import { makeFact } from '@/domain/fact/multiplicationFact'

// Спецификация утверждённых формулировок (см. предложение об упрощении подсказок).
describe('explanationFor', () => {
  it('explains zero facts with the school rule', () => {
    expect(explanationFor(makeFact(0, 2))).toBe('На ноль умножать — всегда будет 0.')
  })

  it('explains one facts with the school rule', () => {
    expect(explanationFor(makeFact(1, 9))).toBe('На единицу умножать — остаётся то же число: 9.')
  })

  it('explains ten facts with the school rule', () => {
    expect(explanationFor(makeFact(6, 10))).toBe('На десять умножать — приписать нолик: 60.')
  })

  it('explains simple facts as school «N по M» with equal addends', () => {
    expect(explanationFor(makeFact(2, 7))).toBe('Два по семь: 7 + 7 = 14.')
    expect(explanationFor(makeFact(3, 4))).toBe('Три по четыре: 4 + 4 + 4 = 12.')
    expect(explanationFor(makeFact(5, 7))).toBe('Пять по семь: 7 + 7 + 7 + 7 + 7 = 35.')
  })

  it('explains hard facts by breaking the second factor through 5', () => {
    expect(explanationFor(makeFact(7, 8))).toBe('Разбей 8 на 5 и 3: 35 + 21.')
    expect(explanationFor(makeFact(6, 7))).toBe('Разбей 7 на 5 и 2: 30 + 12.')
  })

  it('never uses the unfamiliar «групп» wording', () => {
    for (const a of [0, 1, 2, 5, 7, 10]) {
      for (const b of [0, 3, 4, 6, 8, 9, 10]) {
        expect(explanationFor(makeFact(a, b))).not.toContain('групп')
      }
    }
  })
})
