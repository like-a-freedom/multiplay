import { type CalendarDate, addCalendarDays, isCalendarDayBefore } from '@/domain/learning/calendarDate'

/**
 * Review schedule (PRD §3): one day after the first independent success, then
 * 3, 7 and 14 days from the answer date of each following planned review.
 * An error or "Don't know" resets the success counter and schedules the next
 * review for tomorrow. Early practice never advances a step or postpones a date.
 */

export const REVIEW_INTERVALS = [1, 3, 7, 14] as const

export interface ReviewSchedule {
  /** Independent successes recorded since the last error. */
  readonly completedSuccesses: number
  readonly nextReviewDate: CalendarDate
}

export function isDueForReview(schedule: ReviewSchedule, today: CalendarDate): boolean {
  return !isCalendarDayBefore(today, schedule.nextReviewDate)
}

export function scheduleAfterFirstSuccess(answerDate: CalendarDate): ReviewSchedule {
  return { completedSuccesses: 1, nextReviewDate: addCalendarDays(answerDate, REVIEW_INTERVALS[0]) }
}

export function scheduleAfterPlannedSuccess(
  previous: ReviewSchedule,
  answerDate: CalendarDate,
): ReviewSchedule {
  const completedSuccesses = previous.completedSuccesses + 1
  const intervalIndex = Math.min(previous.completedSuccesses, REVIEW_INTERVALS.length - 1)
  return {
    completedSuccesses,
    nextReviewDate: addCalendarDays(answerDate, REVIEW_INTERVALS[intervalIndex]),
  }
}

export function scheduleAfterError(answerDate: CalendarDate): ReviewSchedule {
  return { completedSuccesses: 0, nextReviewDate: addCalendarDays(answerDate, 1) }
}

export function scheduleFromDiagnosticAnswer(
  answerDate: CalendarDate,
  outcome: 'correct' | 'wrong' | 'unknown',
): ReviewSchedule {
  // A diagnostic success never starts the counter: a correct answer becomes
  // due tomorrow, a wrong one immediately.
  return {
    completedSuccesses: 0,
    nextReviewDate: addCalendarDays(answerDate, outcome === 'correct' ? 1 : 0),
  }
}
