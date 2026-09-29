import type { CalendarDate } from '@/domain/learning/calendarDate'
import { calendarDayDiff } from '@/domain/learning/calendarDate'

/**
 * Подтверждение освоения (PRD §3 «Освоение»): два самостоятельных успеха
 * в разные дни с промежутком ≥7 календарных дней и без ошибки между ними.
 * Звезда достижения постоянна; поздняя ошибка добавляет «Пора повторить»
 * и перезапускает учебное подтверждение, но не гасит звезду.
 */

export interface MasteryProgress {
  /** Даты самостоятельных успехов после последней ошибки (без повторов дня). */
  readonly independentSuccessDates: readonly CalendarDate[]
  /** Звезда достижения открыта хотя бы однажды — уже навсегда. */
  readonly hasStar: boolean
  /** Отметка «Пора повторить» после ошибки; снимается новым циклом подтверждения. */
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
