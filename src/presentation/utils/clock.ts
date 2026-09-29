import type { CalendarDate } from '@/domain/learning/calendarDate'
import { toCalendarDate } from '@/domain/learning/calendarDate'

/** Текущая местная календарная дата; тесты управляют ею через `vi.setSystemTime`. */
export function today(): CalendarDate {
  return toCalendarDate(new Date())
}
