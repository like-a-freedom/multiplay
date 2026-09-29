import { type MultiplicationFact } from '@/domain/fact/multiplicationFact'
import { capitalize, numberWord } from '@/domain/learning/numberWords'

/**
 * Объясняющая подсказка (PRD §2): одна короткая стратегия получения ответа
 * на языке школьных правил и «одинаковых слагаемых» (N по M).
 * Правильный ответ уже показан строкой выше, поэтому в подсказке он не повторяется.
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

  // Трудные факты: разложение второго множителя через 5 и остаток (PRD §2).
  const rest = value - 5
  return `Разбей ${value} на 5 и ${rest}: ${count * 5} + ${count * rest}.`
}
