import { describe, expect, it } from 'vitest'

import {
  addCalendarDays,
  calendarDayDiff,
  isCalendarDayBefore,
  toCalendarDate,
} from '@/domain/learning/calendarDate'

describe('calendarDate', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(toCalendarDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toCalendarDate(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('counts calendar days across month boundaries', () => {
    expect(calendarDayDiff('2026-01-30', '2026-02-02')).toBe(3)
  })

  it('counts calendar days across DST transitions, not 24h intervals', () => {
    // March 29, 2026 is the daylight-saving transition in most European regions.
    expect(calendarDayDiff('2026-03-28', '2026-03-30')).toBe(2)
  })

  it('adds days across year boundaries', () => {
    expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('compares dates before', () => {
    expect(isCalendarDayBefore('2026-01-01', '2026-01-02')).toBe(true)
    expect(isCalendarDayBefore('2026-01-02', '2026-01-02')).toBe(false)
  })
})
