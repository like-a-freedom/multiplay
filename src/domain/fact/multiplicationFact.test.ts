import { describe, expect, it } from 'vitest'

import { allFacts, factId, makeFact } from '@/domain/fact/multiplicationFact'

describe('factId', () => {
  it('treats factor order as one fact', () => {
    expect(factId(7, 8)).toBe(factId(8, 7))
  })

  it('formats the id as min:max', () => {
    expect(factId(8, 7)).toBe('7:8')
  })
})

describe('makeFact', () => {
  it('keeps factors sorted and computes the product', () => {
    expect(makeFact(8, 7)).toEqual({ id: '7:8', factors: [7, 8], product: 56 })
  })
})

describe('allFacts', () => {
  it('contains 66 unique unordered pairs with factors 0–10', () => {
    const facts = allFacts()
    expect(facts).toHaveLength(66)
    expect(new Set(facts.map((fact) => fact.id)).size).toBe(66)
    for (const fact of facts) {
      expect(fact.factors[0]).toBeGreaterThanOrEqual(0)
      expect(fact.factors[1]).toBeLessThanOrEqual(10)
      expect(fact.product).toBe(fact.factors[0] * fact.factors[1])
    }
  })
})
