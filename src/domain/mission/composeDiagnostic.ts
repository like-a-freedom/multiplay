import type { MultiplicationFact } from '@/domain/fact/multiplicationFact'
import { isSimpleFact } from '@/domain/fact/multiplicationFact'
import { shuffle } from '@/domain/mission/shuffle'

/**
 * Диагностический набор (PRD §3 «Диагностика»): 10 разных фактов
 * с простыми и трудными множителями. Выбранный набор сохраняется:
 * он же используется для проверки удержания через 2 и 4 недели (PRD §5).
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
