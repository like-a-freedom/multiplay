/**
 * Местная календарная дата `YYYY-MM-DD`.
 * Сравнение — по календарным дням, а не по интервалам в 24 часа (PRD §4 «Даты»).
 */

export type CalendarDate = string

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toCalendarDate(date: Date): CalendarDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toUtcMillis(date: CalendarDate): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

/** Разница в календарных днях: `to - from`. */
export function calendarDayDiff(from: CalendarDate, to: CalendarDate): number {
  return Math.round((toUtcMillis(to) - toUtcMillis(from)) / 86_400_000)
}

export function addCalendarDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(toUtcMillis(date) + days * 86_400_000)
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`
}

export function isCalendarDayBefore(date: CalendarDate, other: CalendarDate): boolean {
  return calendarDayDiff(date, other) > 0
}
