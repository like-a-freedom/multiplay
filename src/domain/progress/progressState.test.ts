import { describe, expect, it } from 'vitest'

import { createProgressState, upcomingReviewDate, unansweredCardFactIds } from '@/domain/progress/progressState'

describe('progress review navigation', () => {
  it('shows the nearest review date after today and ignores due or past dates', () => {
    const base = createProgressState()
    const state = {
      ...base,
      facts: {
        ...base.facts,
        '2:3': {
          ...base.facts['2:3'],
          status: 'familiar' as const,
          review: { completedSuccesses: 1, nextReviewDate: '2026-05-12' },
        },
        '3:4': {
          ...base.facts['3:4'],
          status: 'familiar' as const,
          review: { completedSuccesses: 2, nextReviewDate: '2026-05-10' },
        },
        '4:5': {
          ...base.facts['4:5'],
          status: 'familiar' as const,
          review: { completedSuccesses: 0, nextReviewDate: '2026-05-01' },
        },
      },
    }

    expect(upcomingReviewDate(state, '2026-05-10')).toBe('2026-05-12')
    expect(upcomingReviewDate(base, '2026-05-10')).toBeNull()
  })

  it('offers only unfinished cards when resuming the saved mission', () => {
    const remaining = unansweredCardFactIds({
      id: 'mission-7',
      cardFactIds: ['2:3', '4:5', '7:8'],
      answeredFactIds: ['4:5'],
    })

    expect(remaining).toEqual(['2:3', '7:8'])
  })
})
