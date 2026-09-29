import { allFacts } from '@/domain/fact/multiplicationFact'
import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { AttemptOutcome } from '@/domain/learning/answer'
import { type MasteryProgress, createMasteryProgress } from '@/domain/learning/mastery'
import type { ReviewSchedule } from '@/domain/learning/reviewSchedule'
import { isDueForReview } from '@/domain/learning/reviewSchedule'
import type { FactPlanningStatus, MissionState } from '@/domain/mission/mission'
import { type StreakState, createStreakState } from '@/domain/game/streak'

/**
 * Агрегат прогресса: факты, попытки, текущая миссия и начисления (PRD §4 «Сохранение»).
 * Учебный прогресс (расписание, освоение) отделён от игрового (XP, серия).
 */

export type FactStatus = 'new' | 'familiar'

export interface FactProgress {
  readonly factId: string
  readonly status: FactStatus
  readonly review: ReviewSchedule | null
  readonly mastery: MasteryProgress
  readonly lastAnswerDate: CalendarDate | null
}

export interface AttemptRecord {
  readonly factId: string
  readonly date: CalendarDate
  readonly outcome: AttemptOutcome
  /** Самостоятельный ответ: решение не показывалось ранее в этот день. */
  readonly independent: boolean
  /** `null` — попытка в диагностике, а не в миссии. */
  readonly missionId: string | null
}

export interface MissionCompletion {
  readonly missionId: string
  readonly date: CalendarDate
}

export interface RewardState {
  readonly totalXp: number
  readonly completions: readonly MissionCompletion[]
  readonly streak: StreakState
}

export type GameMode = 'expedition' | 'maintenance'

/** Сохранённый диагностический набор (PRD §3): повторяется для проверки удержания. */
export interface DiagnosticState {
  readonly factIds: readonly string[]
  readonly skipped: boolean
  readonly completed: boolean
}

export interface ProgressState {
  readonly facts: Readonly<Record<string, FactProgress>>
  readonly attempts: readonly AttemptRecord[]
  readonly currentMission: MissionState | null
  readonly rewards: RewardState
  readonly mode: GameMode
  readonly expeditionFinished: boolean
  readonly diagnostic: DiagnosticState | null
}

export function createProgressState(): ProgressState {
  const facts: Record<string, FactProgress> = {}
  for (const fact of allFacts()) {
    facts[fact.id] = {
      factId: fact.id,
      status: 'new',
      review: null,
      mastery: createMasteryProgress(),
      lastAnswerDate: null,
    }
  }
  return {
    facts,
    attempts: [],
    currentMission: null,
    rewards: { totalXp: 0, completions: [], streak: createStreakState() },
    mode: 'expedition',
    expeditionFinished: false,
    diagnostic: null,
  }
}

/** Число открытых звёзд достижений. */
export function starsEarned(state: ProgressState): number {
  return Object.values(state.facts).filter((fact) => fact.mastery.hasStar).length
}

export function planningStatus(fact: FactProgress, today: CalendarDate): FactPlanningStatus {
  if (fact.status === 'new') return 'new'
  const reviewIsDue =
    fact.review !== null && (fact.mastery.needsReview || isDueForReview(fact.review, today))
  return reviewIsDue ? 'due' : 'familiar'
}

/** «Пора повторить» (CONTEXT.md): ошибка либо наступивший срок проверки. */
export function factNeedsReview(fact: FactProgress, today: CalendarDate): boolean {
  return planningStatus(fact, today) === 'due'
}

/** Решение показывалось сегодня: была ошибка или «Не знаю» по этому факту. */
export function solutionShownOnDate(
  state: ProgressState,
  factId: string,
  date: CalendarDate,
): boolean {
  return state.attempts.some(
    (attempt) => attempt.factId === factId && attempt.date === date && attempt.outcome !== 'correct',
  )
}

/** Ближайшая будущая дата повторения (для поддерживающего режима, PRD §3). */
export function upcomingReviewDate(state: ProgressState, today: CalendarDate): CalendarDate | null {
  const dates = Object.values(state.facts)
    .map((fact) => fact.review?.nextReviewDate)
    .filter((date): date is CalendarDate => date !== null && date !== undefined && date > today)
    .sort()
  return dates[0] ?? null
}
