import { describe, expect, it } from 'vitest'

import {
  isDueForReview,
  scheduleAfterError,
  scheduleAfterFirstSuccess,
  scheduleAfterPlannedSuccess,
  scheduleFromDiagnosticAnswer,
} from '@/domain/learning/reviewSchedule'

describe('review schedule', () => {
  it('follows the 1, 3, 7, 14, 14… intervals from the answer date', () => {
    const first = scheduleAfterFirstSuccess('2026-01-01')
    expect(first.nextReviewDate).toBe('2026-01-02')

    const second = scheduleAfterPlannedSuccess(first, '2026-01-02')
    expect(second.nextReviewDate).toBe('2026-01-05')

    const third = scheduleAfterPlannedSuccess(second, '2026-01-05')
    expect(third.nextReviewDate).toBe('2026-01-12')

    const fourth = scheduleAfterPlannedSuccess(third, '2026-01-12')
    expect(fourth.nextReviewDate).toBe('2026-01-26')

    const fifth = scheduleAfterPlannedSuccess(fourth, '2026-01-26')
    expect(fifth.nextReviewDate).toBe('2026-02-09')
  })

  it('resets on error and schedules the repeat for tomorrow', () => {
    const schedule = scheduleAfterError('2026-01-10')
    expect(schedule).toEqual({ completedSuccesses: 0, nextReviewDate: '2026-01-11' })
  })

  it('is due on or after the review date, not before', () => {
    const schedule = { completedSuccesses: 1, nextReviewDate: '2026-01-05' }
    expect(isDueForReview(schedule, '2026-01-04')).toBe(false)
    expect(isDueForReview(schedule, '2026-01-05')).toBe(true)
    expect(isDueForReview(schedule, '2026-01-06')).toBe(true)
  })

  it('diagnostic answers do not start the schedule counter', () => {
    expect(scheduleFromDiagnosticAnswer('2026-01-01', 'correct')).toEqual({
      completedSuccesses: 0,
      nextReviewDate: '2026-01-02',
    })
    expect(scheduleFromDiagnosticAnswer('2026-01-01', 'wrong').nextReviewDate).toBe('2026-01-01')
    expect(scheduleFromDiagnosticAnswer('2026-01-01', 'unknown').nextReviewDate).toBe('2026-01-01')
  })
})
