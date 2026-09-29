import { describe, expect, it } from 'vitest'

import { createMasteryProgress, recordError, recordIndependentSuccess } from '@/domain/learning/mastery'

describe('mastery', () => {
  it('needs two independent successes at least 7 days apart', () => {
    let mastery = createMasteryProgress()
    mastery = recordIndependentSuccess(mastery, '2026-01-01')
    expect(mastery.hasStar).toBe(false)

    mastery = recordIndependentSuccess(mastery, '2026-01-06')
    expect(mastery.hasStar).toBe(false)

    mastery = recordIndependentSuccess(mastery, '2026-01-09')
    expect(mastery.hasStar).toBe(true)
  })

  it('does not count two successes on the same day', () => {
    let mastery = createMasteryProgress()
    mastery = recordIndependentSuccess(mastery, '2026-01-01')
    const sameDay = recordIndependentSuccess(mastery, '2026-01-01')
    expect(sameDay).toBe(mastery)
    expect(sameDay.independentSuccessDates).toHaveLength(1)
  })

  it('error restarts the confirmation and marks review without removing the star', () => {
    let mastery = createMasteryProgress()
    mastery = recordIndependentSuccess(mastery, '2026-01-01')
    mastery = recordIndependentSuccess(mastery, '2026-01-09')
    expect(mastery.hasStar).toBe(true)

    mastery = recordError(mastery)
    expect(mastery).toEqual({ independentSuccessDates: [], hasStar: true, needsReview: true })
  })

  it('a new confirmation cycle clears the review mark but grants no second star', () => {
    let mastery = createMasteryProgress()
    mastery = recordIndependentSuccess(mastery, '2026-01-01')
    mastery = recordIndependentSuccess(mastery, '2026-01-09')
    mastery = recordError(mastery)

    mastery = recordIndependentSuccess(mastery, '2026-02-01')
    mastery = recordIndependentSuccess(mastery, '2026-02-09')
    expect(mastery.hasStar).toBe(true)
    expect(mastery.needsReview).toBe(false)
    expect(mastery.independentSuccessDates).toEqual([])
  })
})
