import type { FactCandidate } from '@/domain/mission/mission'
import { shuffle } from '@/domain/mission/shuffle'

/**
 * Состав миссии (PRD §3): до 10 разных фактов — зарезервировать два места
 * для новых (если они остались), затем ожидающие повторения, затем знакомые.
 * Если новых меньше двух, свободные места отдаются повторениям;
 * если известных мало, миссия короче.
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
 * Свободная практика (PRD §3 «Поддерживающий режим»): знакомые факты вне
 * срока повторения. Это досрочная практика: ступень она не продвигает
 * и срок не отодвигает (правило применяется в `submitCardAnswer`).
 */
export function composePractice(
  candidates: readonly FactCandidate[],
  random: () => number = Math.random,
): readonly FactCandidate[] {
  const familiar = candidates.filter((c) => c.status === 'familiar')
  return shuffle(familiar, random).slice(0, MISSION_CARD_LIMIT)
}
