import { type CalendarDate, addCalendarDays, isCalendarDayBefore } from '@/domain/learning/calendarDate'

/**
 * Расписание повторений (PRD §3 «Расписание»): после первого самостоятельного
 * успеха повтор через 1 день, после следующих успешных плановых повторов —
 * через 3, 7, затем каждый раз через 14 дней от даты ответа.
 * Ошибка или «Не знаю» сбрасывает счётчик успехов и назначает повтор на завтра.
 * Досрочная практика ступень не продвигает и срок не отодвигает.
 */

export const REVIEW_INTERVALS = [1, 3, 7, 14] as const

export interface ReviewSchedule {
  /** Сколько самостоятельных успехов зафиксировано после последней ошибки. */
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
  // Диагностический успех не запускает отсчёт: верный ответ доступен завтра,
  // ошибочный — на повтор сразу.
  return {
    completedSuccesses: 0,
    nextReviewDate: addCalendarDays(answerDate, outcome === 'correct' ? 1 : 0),
  }
}
