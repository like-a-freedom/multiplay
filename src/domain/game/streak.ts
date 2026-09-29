import type { CalendarDate } from '@/domain/learning/calendarDate'
import { calendarDayDiff, isCalendarDayBefore } from '@/domain/learning/calendarDate'

/**
 * Daily streak (PRD §3): one completed lesson per local calendar day extends it.
 * Milestones 3, 7, 14, 30 pay +20 XP once per current streak; several missions
 * in a day never extend it twice.
 */

export const STREAK_MILESTONES = [3, 7, 14, 30] as const
export const STREAK_MILESTONE_BONUS_XP = 20

export interface StreakState {
  readonly days: number
  readonly bestDays: number
  /** Last date a reward was paid — guards against a clock rollback. */
  readonly lastRewardedDate: CalendarDate | null
  /** Milestones of the current streak whose bonus is already paid. */
  readonly earnedMilestoneDays: readonly number[]
}

export function createStreakState(): StreakState {
  return { days: 0, bestDays: 0, lastRewardedDate: null, earnedMilestoneDays: [] }
}

/** The device date moved before the last rewarded date — rewards are paused. */
export function rewardsSuspended(streak: StreakState, today: CalendarDate): boolean {
  return streak.lastRewardedDate !== null && isCalendarDayBefore(today, streak.lastRewardedDate)
}

export interface StreakUpdate {
  readonly streak: StreakState
  readonly bonusXp: number
}

export function streakAfterCompletion(streak: StreakState, today: CalendarDate): StreakUpdate {
  if (rewardsSuspended(streak, today)) return { streak, bonusXp: 0 }
  if (streak.lastRewardedDate === today) return { streak, bonusXp: 0 }

  const continues =
    streak.lastRewardedDate !== null && calendarDayDiff(streak.lastRewardedDate, today) === 1
  const days = continues ? streak.days + 1 : 1
  const earnedMilestoneDays = continues ? [...streak.earnedMilestoneDays] : []

  const isMilestone =
    (STREAK_MILESTONES as readonly number[]).includes(days) && !earnedMilestoneDays.includes(days)
  if (isMilestone) earnedMilestoneDays.push(days)

  return {
    streak: {
      days,
      bestDays: Math.max(streak.bestDays, days),
      lastRewardedDate: today,
      earnedMilestoneDays,
    },
    bonusXp: isMilestone ? STREAK_MILESTONE_BONUS_XP : 0,
  }
}
