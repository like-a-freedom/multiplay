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
  /** Scheduled review date; `null` means the fact has no review schedule yet. */
  readonly nextReviewDate: CalendarDate | null
  /** The post-error review mark; it persists after the scheduled date arrives. */
  readonly needsReview: boolean
  /** Index of the latest accepted attempt; larger indices are more recent. */
  readonly lastAttemptIndex: number | null
  readonly lastAttemptDate: CalendarDate | null
  readonly lastAttemptOutcome: AttemptOutcome | null
  /** Last-answer date fallback for old snapshots without attempt history. */
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
