import { type CalendarDate, isCalendarDayBefore } from '@/domain/learning/calendarDate'
import { missionXp } from '@/domain/game/experience'
import { type StreakUpdate, rewardsSuspended, streakAfterCompletion } from '@/domain/game/streak'
import type { ProgressState } from '@/domain/progress/progressState'
import { starsEarned } from '@/domain/progress/progressState'

/**
 * Завершение миссии и награды (PRD §3 «Завершение и награды»): +10 XP
 * за первые три миссии дня, бонус серии сверх лимита, одна запись на ID миссии.
 * Повторный запуск или восстановление не выдают награду второй раз.
 * Финиш экспедиции сохраняется вместе с завершением миссии.
 */

export const TOTAL_FACTS = 66

export interface MissionRewardOutcome {
  readonly state: ProgressState
  readonly xpAwarded: number
  readonly streakBonusXp: number
  readonly expeditionJustFinished: boolean
}

export function applyMissionRewards(
  state: ProgressState,
  missionId: string,
  date: CalendarDate,
): MissionRewardOutcome {
  const alreadyRewarded = state.rewards.completions.some((c) => c.missionId === missionId)
  if (alreadyRewarded) {
    return { state, xpAwarded: 0, streakBonusXp: 0, expeditionJustFinished: false }
  }

  const completionsToday = state.rewards.completions.filter((c) => c.date === date).length
  const suspended = rewardsSuspended(state.rewards.streak, date)

  // Практика доступна, но новые награды приостановлены до восстановления даты.
  const xpAwarded = suspended ? 0 : missionXp(completionsToday)

  let streakUpdate: StreakUpdate = { streak: state.rewards.streak, bonusXp: 0 }
  if (state.mode === 'expedition' && !suspended) {
    streakUpdate = streakAfterCompletion(state.rewards.streak, date)
  }

  const withRewards: ProgressState = {
    ...state,
    currentMission: null,
    rewards: {
      totalXp: state.rewards.totalXp + xpAwarded + streakUpdate.bonusXp,
      completions: [...state.rewards.completions, { missionId, date }],
      streak: streakUpdate.streak,
    },
  }

  // Финиш экспедиции: последняя звезда открыта этой миссией — переход один раз.
  const expeditionJustFinished =
    withRewards.mode === 'expedition' &&
    !withRewards.expeditionFinished &&
    starsEarned(withRewards) >= TOTAL_FACTS
  const next: ProgressState = expeditionJustFinished
    ? { ...withRewards, mode: 'maintenance', expeditionFinished: true }
    : withRewards

  return {
    state: next,
    xpAwarded,
    streakBonusXp: streakUpdate.bonusXp,
    expeditionJustFinished,
  }
}

/** Дата устройства стала раньше последней награждённой даты. */
export function rewardsPausedByClockRollback(state: ProgressState, today: CalendarDate): boolean {
  return (
    state.rewards.streak.lastRewardedDate !== null &&
    isCalendarDayBefore(today, state.rewards.streak.lastRewardedDate)
  )
}
