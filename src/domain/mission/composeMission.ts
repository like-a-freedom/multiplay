import type { FactCandidate } from '@/domain/mission/mission'
import { shuffle } from '@/domain/mission/shuffle'

/**
 * Mission composition (PRD §3): up to 10 distinct facts — two slots reserved
 * for new facts (while any remain), then due reviews, then familiar practice.
 * Fewer than two new facts releases their slots to reviews; with few known
 * facts the mission is shorter.
 */

export const MISSION_CARD_LIMIT = 10
export const NEW_FACT_SLOTS = 2

export function composeMission(candidates: readonly FactCandidate[]): readonly FactCandidate[] {
  const news = candidates.filter((c) => c.status === 'new').slice(0, NEW_FACT_SLOTS)
  const due = candidates.filter((c) => c.status === 'due')
  const familiar = candidates.filter((c) => c.status === 'familiar')
  return [...news, ...due, ...familiar].slice(0, MISSION_CARD_LIMIT)
}

/**
 * Free practice (PRD §3, maintenance mode): familiar facts outside their
 * review date — early practice that never advances a step or postpones a
 * date (that rule lives in `submitCardAnswer`).
 */
export function composePractice(
  candidates: readonly FactCandidate[],
  random: () => number = Math.random,
): readonly FactCandidate[] {
  const familiar = candidates.filter((c) => c.status === 'familiar')
  return shuffle(familiar, random).slice(0, MISSION_CARD_LIMIT)
}

/**
 * A review session (the "due for review" mark, CONTEXT.md): only facts with a
 * past error or a reached review date — straight to work, no new facts.
 */
export function composeReview(candidates: readonly FactCandidate[]): readonly FactCandidate[] {
  return candidates.filter((c) => c.status === 'due').slice(0, MISSION_CARD_LIMIT)
}
