import { describe, expect, it } from 'vitest'

import { levelFromXp, missionXp } from '@/domain/game/experience'

describe('experience', () => {
  it('computes level as 1 + floor(xp / 100)', () => {
    expect(levelFromXp(0)).toBe(1)
    expect(levelFromXp(99)).toBe(1)
    expect(levelFromXp(100)).toBe(2)
    expect(levelFromXp(350)).toBe(4)
  })

  it('pays 10 XP for the first three missions of the day and nothing beyond', () => {
    expect(missionXp(0)).toBe(10)
    expect(missionXp(1)).toBe(10)
    expect(missionXp(2)).toBe(10)
    expect(missionXp(3)).toBe(0)
    expect(missionXp(7)).toBe(0)
  })
})
