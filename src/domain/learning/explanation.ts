import { type MultiplicationFact } from '@/domain/fact/multiplicationFact'
import { capitalize, numberWord } from '@/domain/learning/numberWords'

/**
 * The hint after a wrong answer or "Don't know" (PRD §2): one short strategy
 * phrased as a school rule or equal addends. The correct answer is already
 * shown above, so the hint never repeats it.
 */

export function explanationFor(fact: MultiplicationFact): string {
  const [count, value] = fact.factors

  if (count === 0) return 'На ноль умножать — всегда будет 0.'
  if (count === 1) return `На единицу умножать — остаётся то же число: ${value}.`
  if (value === 10) return `На десять умножать — приписать нолик: ${count * 10}.`

  if (count <= 5) {
    const addends = Array.from({ length: count }, () => value).join(' + ')
    return `${capitalize(numberWord(count))} по ${numberWord(value)}: ${addends} = ${count * value}.`
  }

  // Hard fact: split the second factor through 5 and a remainder (PRD §2).
  const rest = value - 5
  return `Разбей ${value} на 5 и ${rest}: ${count * 5} + ${count * rest}.`
}
