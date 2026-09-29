import type { MultiplicationFact } from '@/domain/fact/multiplicationFact'
import { isSimpleFact } from '@/domain/fact/multiplicationFact'
import { shuffle } from '@/domain/mission/shuffle'

/**
 * The diagnostic set (PRD §3): 10 distinct facts mixing simple and hard
 * factors. The chosen set is persisted and reused for the retention check
 * after 2 and 4 weeks (PRD §5).
 */

export const DIAGNOSTIC_SIZE = 10
export const DIAGNOSTIC_SIMPLE_COUNT = 5

export function pickDiagnosticFacts(
  facts: readonly MultiplicationFact[],
  random: () => number = Math.random,
): readonly MultiplicationFact[] {
  const simple = shuffle(facts.filter(isSimpleFact), random)
  const hard = shuffle(facts.filter((fact) => !isSimpleFact(fact)), random)
  return [
    ...simple.slice(0, DIAGNOSTIC_SIMPLE_COUNT),
    ...hard.slice(0, DIAGNOSTIC_SIZE - DIAGNOSTIC_SIMPLE_COUNT),
  ]
}
