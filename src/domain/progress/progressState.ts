import { allFacts } from '@/domain/fact/multiplicationFact'
import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { AttemptOutcome } from '@/domain/learning/answer'
import { type MasteryProgress, createMasteryProgress } from '@/domain/learning/mastery'
import type { ReviewSchedule } from '@/domain/learning/reviewSchedule'
import { isDueForReview } from '@/domain/learning/reviewSchedule'
import type { FactPlanningStatus, MissionState } from '@/domain/mission/mission'
import { type StreakState, createStreakState } from '@/domain/game/streak'

/**
 * Progress aggregate: facts, attempts, the current mission and rewards (PRD §4,
 * "Saving"). Learning progress (schedule, mastery) is kept apart from game
 * progress (XP, streak).
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
  /** An independent answer: no solution was shown earlier that day. */
  readonly independent: boolean
  /** `null` — an attempt in diagnostics, not in a mission. */
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

/** The persisted diagnostic set (PRD §3), reused for the retention check. */
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

export function starsEarned(state: ProgressState): number {
  return Object.values(state.facts).filter((fact) => fact.mastery.hasStar).length
}

export function planningStatus(fact: FactProgress, today: CalendarDate): FactPlanningStatus {
  if (fact.status === 'new') return 'new'
  const reviewIsDue =
    fact.review !== null && (fact.mastery.needsReview || isDueForReview(fact.review, today))
  return reviewIsDue ? 'due' : 'familiar'
}

/** The "due for review" mark (CONTEXT.md): a past error or a reached review date. */
export function factNeedsReview(fact: FactProgress, today: CalendarDate): boolean {
  return planningStatus(fact, today) === 'due'
}

/** The solution was shown today: an error or "Don't know" happened for this fact. */
export function solutionShownOnDate(
  state: ProgressState,
  factId: string,
  date: CalendarDate,
): boolean {
  return state.attempts.some(
    (attempt) => attempt.factId === factId && attempt.date === date && attempt.outcome !== 'correct',
  )
}

/** The nearest future review date (maintenance mode, PRD §3). */
export function upcomingReviewDate(state: ProgressState, today: CalendarDate): CalendarDate | null {
  const dates = Object.values(state.facts)
    .map((fact) => fact.review?.nextReviewDate)
    .filter((date): date is CalendarDate => date !== null && date !== undefined && date > today)
    .sort()
  return dates[0] ?? null
}

/** Cards of the frozen queue that were not answered yet (mission recovery, PRD M4). */
export function unansweredCardFactIds(mission: MissionState): string[] {
  return mission.cardFactIds.filter((factId) => !mission.answeredFactIds.includes(factId))
}
