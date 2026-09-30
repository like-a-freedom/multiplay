import { describe, expect, it } from 'vitest'

import { xpRoute } from '@/presentation/utils/xpRoute'

describe('xpRoute', () => {
  it.each([
    [0, { level: 1, earnedInLevel: 0, fraction: 0 }],
    [90, { level: 1, earnedInLevel: 90, fraction: 0.9 }],
    [100, { level: 2, earnedInLevel: 0, fraction: 0 }],
    [120, { level: 2, earnedInLevel: 20, fraction: 0.2 }],
  ] as const)('maps %i total XP to a normalized level route', (totalXp, expected) => {
    expect(xpRoute(totalXp)).toEqual(expected)
  })
})
