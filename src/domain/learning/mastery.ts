import type { CalendarDate } from '@/domain/learning/calendarDate'
import { calendarDayDiff } from '@/domain/learning/calendarDate'

/**
 * Mastery confirmation (PRD §3): two independent successes on different days
 * at least 7 calendar days apart with no error in between. The achievement
 * star is permanent; a later error adds the "review" mark and restarts the
 * learning confirmation but never removes the star.
 */

export interface MasteryProgress {
  /** Dates of independent successes since the last error (one per day). */
  readonly independentSuccessDates: readonly CalendarDate[]
  /** The achievement star was opened at least once — now permanent. */
  readonly hasStar: boolean
  /** The "review" mark after an error; cleared by a new confirmation cycle. */
  readonly needsReview: boolean
}

export function createMasteryProgress(): MasteryProgress {
  return { independentSuccessDates: [], hasStar: false, needsReview: false }
}

const MASTERY_GAP_DAYS = 7

export function recordIndependentSuccess(
  mastery: MasteryProgress,
  answerDate: CalendarDate,
): MasteryProgress {
  const dates = mastery.independentSuccessDates
  if (dates.length > 0 && dates[dates.length - 1] === answerDate) {
    return mastery // два успеха в один день подтверждением не считаются
  }
  const nextDates = [...dates, answerDate]
  const confirmed =
    nextDates.length >= 2 &&
    calendarDayDiff(nextDates[0], nextDates[nextDates.length - 1]) >= MASTERY_GAP_DAYS
  if (!confirmed) {
    return { ...mastery, independentSuccessDates: nextDates }
  }
  return { independentSuccessDates: [], hasStar: true, needsReview: false }
}

export function recordError(mastery: MasteryProgress): MasteryProgress {
  return {
    independentSuccessDates: [],
    hasStar: mastery.hasStar,
    needsReview: true,
  }
}
