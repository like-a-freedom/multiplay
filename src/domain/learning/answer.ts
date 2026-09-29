import type { MultiplicationFact } from '@/domain/fact/multiplicationFact'

/**
 * Проверка ввода (PRD M2): принимаются целые числа 0–100.
 * Пустая строка, знак, дробь и другие символы — подсказка ввода, а не учебная ошибка.
 */

export type ParsedAnswer = { ok: true; value: number } | { ok: false }

export function parseAnswer(raw: string): ParsedAnswer {
  const trimmed = raw.trim()
  if (!/^\d{1,3}$/.test(trimmed)) return { ok: false }
  const value = Number(trimmed)
  if (value > 100) return { ok: false }
  return { ok: true, value }
}

export type AttemptOutcome = 'correct' | 'wrong' | 'unknown'

export function judgeAnswer(fact: MultiplicationFact, value: number): 'correct' | 'wrong' {
  return value === fact.product ? 'correct' : 'wrong'
}
