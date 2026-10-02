import type { AttemptOutcome } from '@/domain/learning/answer'
import type { CalendarDate } from '@/domain/learning/calendarDate'

/**
 * A mission (CONTEXT.md): a short session with a fixed set of cards.
 * The queue is frozen at start (PRD §3).
 */

export type FactPlanningStatus = 'new' | 'due' | 'familiar'

export interface FactCandidate {
  readonly factId: string
  readonly status: FactPlanningStatus
  /** Дата планового повторения; `null` — факт ещё не ставился в расписание. */
  readonly nextReviewDate: CalendarDate | null
  /** Отметка «Пора повторить» после ошибки; переживает наступление даты. */
  readonly needsReview: boolean
  /** Позиция последней принятой попытки в истории; больше — свежее. */
  readonly lastAttemptIndex: number | null
  readonly lastAttemptDate: CalendarDate | null
  readonly lastAttemptOutcome: AttemptOutcome | null
  /** Дата последнего ответа из записи факта — fallback для старых снимков без попыток. */
  readonly lastAnswerDate: CalendarDate | null
}

export interface MissionPlan {
  readonly id: string
  readonly cardFactIds: readonly string[]
}

export interface MissionState {
  readonly id: string
  readonly cardFactIds: readonly string[]
  readonly answeredFactIds: readonly string[]
}
