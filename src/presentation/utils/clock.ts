import type { CalendarDate } from '@/domain/learning/calendarDate'
import { toCalendarDate } from '@/domain/learning/calendarDate'

/** Today's local calendar date; tests control it via `vi.setSystemTime`. */
export function today(): CalendarDate {
  return toCalendarDate(new Date())
}
