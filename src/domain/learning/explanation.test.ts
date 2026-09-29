import { describe, expect, it } from 'vitest'

import { explanationFor } from '@/domain/learning/explanation'
import { makeFact } from '@/domain/fact/multiplicationFact'

describe('explanationFor', () => {
  it('explains hard facts by decomposition into familiar products', () => {
    expect(explanationFor(makeFact(7, 8))).toBe('7 × 8 = 7 × 5 + 7 × 3 = 35 + 21')
  })

  it('explains simple facts as repeated addition (первый множитель — сколько раз берём второй)', () => {
    expect(explanationFor(makeFact(3, 4))).toBe('3 × 4 — это 3 раза по 4: 4 + 4 + 4')
    expect(explanationFor(makeFact(2, 7))).toBe('2 × 7 — это 2 раза по 7: 7 + 7')
  })

  it('explains zero and one facts in plain Russian', () => {
    expect(explanationFor(makeFact(0, 1))).toBe('0 × 1 — это 0 раз по 1: складывать нечего')
    expect(explanationFor(makeFact(1, 9))).toBe('1 × 9 — это 1 раз по 9')
  })

  it('keeps long repeated addition short enough to read', () => {
    expect(explanationFor(makeFact(6, 10))).toBe('6 × 10 — это 6 раз по 10')
  })

  it('does not repeat the answer: it is already shown after the attempt', () => {
    expect(explanationFor(makeFact(0, 1))).not.toContain('поэтому 0')
    expect(explanationFor(makeFact(7, 8))).not.toContain('56')
  })
})
