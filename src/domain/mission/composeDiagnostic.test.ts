import { describe, expect, it } from 'vitest'

import { pickDiagnosticFacts, DIAGNOSTIC_SIZE } from '@/domain/mission/composeDiagnostic'
import { allFacts, isSimpleFact } from '@/domain/fact/multiplicationFact'

function sequenceRandom(values: number[]): () => number {
  let index = 0
  return () => values[index++ % values.length] ?? 0
}

describe('pickDiagnosticFacts', () => {
  it('picks 10 distinct facts mixing simple and hard ones', () => {
    const picked = pickDiagnosticFacts(allFacts(), sequenceRandom([0.5, 0.2, 0.9, 0.1]))
    expect(picked).toHaveLength(DIAGNOSTIC_SIZE)
    expect(new Set(picked.map((fact) => fact.id)).size).toBe(DIAGNOSTIC_SIZE)

    const simpleCount = picked.filter(isSimpleFact).length
    const hardCount = picked.length - simpleCount
    expect(simpleCount).toBe(5)
    expect(hardCount).toBe(5)
  })

  it('is deterministic for a given random sequence', () => {
    const first = pickDiagnosticFacts(allFacts(), sequenceRandom([0.3, 0.7]))
    const second = pickDiagnosticFacts(allFacts(), sequenceRandom([0.3, 0.7]))
    expect(first.map((fact) => fact.id)).toEqual(second.map((fact) => fact.id))
  })
})
