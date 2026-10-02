import { describe, expect, it } from 'vitest'

import { retentionSummary } from '@/domain/learning/retention'
import type { AttemptRecord } from '@/domain/progress/progressState'

const attempt = (
  factId: string,
  date: string,
  outcome: AttemptRecord['outcome'],
): AttemptRecord => ({ factId, date, outcome, independent: true, missionId: 'm1' })

describe('retentionSummary', () => {
  it('returns zero data for empty attempts', () => {
    expect(retentionSummary([])).toEqual({ checked: 0, correct: 0 })
  })

  it('counts first answers only after a gap of at least 7 days', () => {
    const summary = retentionSummary([
      attempt('2:3', '2026-01-01', 'wrong'),
      attempt('2:3', '2026-01-10', 'correct'), // A nine-day gap qualifies; the first answer is correct.
      attempt('2:3', '2026-01-11', 'wrong'), // The next day does not qualify.
      attempt('7:8', '2026-01-01', 'correct'),
      attempt('7:8', '2026-01-05', 'correct'), // A four-day gap does not qualify.
    ])
    expect(summary).toEqual({ checked: 1, correct: 1 })
  })

  it('uses the first answer of the day, not later attempts', () => {
    const summary = retentionSummary([
      attempt('2:3', '2026-01-01', 'correct'),
      attempt('2:3', '2026-02-01', 'wrong'), // The day's first answer is wrong.
      attempt('2:3', '2026-02-01', 'correct'), // A later success that day does not count.
    ])
    expect(summary).toEqual({ checked: 1, correct: 0 })
  })
})
