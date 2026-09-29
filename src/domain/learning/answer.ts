/**
 * Input validation (PRD M2): integers 0–100 only. An empty string, a sign, a
 * fraction or any other character triggers the input hint, not a learning mistake.
 */

export type ParsedAnswer = { ok: true; value: number } | { ok: false }

export type AttemptOutcome = 'correct' | 'wrong' | 'unknown'

export function parseAnswer(raw: string): ParsedAnswer {
  const trimmed = raw.trim()
  if (!/^\d{1,3}$/.test(trimmed)) return { ok: false }
  const value = Number(trimmed)
  if (value > 100) return { ok: false }
  return { ok: true, value }
}
