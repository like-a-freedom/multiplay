import { describe, expect, it } from 'vitest'

import {
  createStreakState,
  rewardsSuspended,
  streakAfterCompletion,
} from '@/domain/game/streak'

describe('streak', () => {
  it('extends by one when the previous completion was yesterday', () => {
    let streak = createStreakState()
    streak = streakAfterCompletion(streak, '2026-01-01').streak
    streak = streakAfterCompletion(streak, '2026-01-02').streak
    expect(streak.days).toBe(2)
  })

  it('does not extend twice within the same day', () => {
    let streak = createStreakState()
    streak = streakAfterCompletion(streak, '2026-01-01').streak
    const sameDay = streakAfterCompletion(streak, '2026-01-01')
    expect(sameDay.streak.days).toBe(1)
    expect(sameDay.bonusXp).toBe(0)
  })

  it('restarts after a missed day and keeps the best result', () => {
    let streak = createStreakState()
    streak = streakAfterCompletion(streak, '2026-01-01').streak
    streak = streakAfterCompletion(streak, '2026-01-02').streak
    streak = streakAfterCompletion(streak, '2026-01-05').streak
    expect(streak.days).toBe(1)
    expect(streak.bestDays).toBe(2)
    expect(streak.earnedMilestoneDays).toEqual([])
  })

  it('pays +20 XP once per milestone: 3, 7, 14, 30', () => {
    let streak = createStreakState()
    let bonusDays: number[] = []
    for (let day = 1; day <= 31; day += 1) {
      const date = `2026-01-${String(day).padStart(2, '0')}`
      const update = streakAfterCompletion(streak, date)
      streak = update.streak
      if (update.bonusXp > 0) bonusDays.push(streak.days)
    }
    expect(bonusDays).toEqual([3, 7, 14, 30])
  })

  it('makes milestone bonuses available again in a new streak', () => {
    let streak = createStreakState()
    streak = streakAfterCompletion(streak, '2026-01-01').streak
    streak = streakAfterCompletion(streak, '2026-01-02').streak
    streak = streakAfterCompletion(streak, '2026-01-03').streak
    expect(streak.earnedMilestoneDays).toEqual([3])

    streak = streakAfterCompletion(streak, '2026-01-06').streak // A missed day starts a new streak.
    const third = streakAfterCompletion(streak, '2026-01-07').streak
    const milestoneAgain = streakAfterCompletion(third, '2026-01-08')
    expect(milestoneAgain.streak.days).toBe(3)
    expect(milestoneAgain.bonusXp).toBe(20)
  })

  it('suspends rewards when the device date moves before the last rewarded date', () => {
    let streak = createStreakState()
    streak = streakAfterCompletion(streak, '2026-01-10').streak
    expect(rewardsSuspended(streak, '2026-01-09')).toBe(true)

    const update = streakAfterCompletion(streak, '2026-01-09')
    expect(update.streak).toBe(streak)
    expect(update.bonusXp).toBe(0)
  })
})
