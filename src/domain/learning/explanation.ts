import { type MultiplicationFact, isSimpleFactor } from '@/domain/fact/multiplicationFact'

/**
 * Объясняющая подсказка (PRD §2): одна подготовленная стратегия получения ответа.
 * `7 × 8` читается «семь раз по восемь» — первый множитель показывает,
 * сколько раз берём второй; так же устроено разложение из PRD.
 * Правильный ответ уже показан строкой выше, поэтому в подсказке он не повторяется.
 */

export function explanationFor(fact: MultiplicationFact): string {
  const [count, value] = fact.factors

  if (count === 0) return `Ноль групп по ${value}: ничего не берём, получается 0.`
  if (count === 1) return `1 × ${value} — это 1 раз по ${value}`

  const isSimple = (factor: number) => isSimpleFactor(factor) && factor !== 0 && factor !== 1
  if (value > 5 && !isSimple(count) && !isSimple(value)) {
    const rest = value - 5
    return `${count} × ${value} = ${count} × 5 + ${count} × ${rest} = ${count * 5} + ${count * rest}`
  }

  const parts = count <= 5 ? `: ${Array.from({ length: count }, () => value).join(' + ')}` : ''
  return `${count} × ${value} — это ${count} ${pluralRu(count, 'раз', 'раза', 'раз')} по ${value}${parts}`
}

function pluralRu(value: number, one: string, few: string, many: string): string {
  const mod10 = value % 10
  const mod100 = value % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
