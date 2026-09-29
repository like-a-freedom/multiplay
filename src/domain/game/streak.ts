import type { CalendarDate } from '@/domain/learning/calendarDate'
import { calendarDayDiff, isCalendarDayBefore } from '@/domain/learning/calendarDate'

/**
 * Серия дней (PRD §3): один завершённый урок за местный календарный день
 * продлевает серию. Рубежи 3, 7, 14, 30 дают +20 XP по разу за текущую серию.
 * Несколько миссий в день серию повторно не увеличивают.
 */

export const STREAK_MILESTONES = [3, 7, 14, 30] as const
export const STREAK_MILESTONE_BONUS_XP = 20

export interface StreakState {
  readonly days: number
  readonly bestDays: number
  /** Последняя дата, за которую начислена награда; защита от перевода часов назад. */
  readonly lastRewardedDate: CalendarDate | null
  /** Рубежи текущей серии, за которые бонус уже выдан. */
  readonly earnedMilestoneDays: readonly number[]
}

export function createStreakState(): StreakState {
  return { days: 0, bestDays: 0, lastRewardedDate: null, earnedMilestoneDays: [] }
}

/** Дата устройства стала раньше последней награждённой — награды приостановлены. */
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
