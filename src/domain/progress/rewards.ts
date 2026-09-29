import { type CalendarDate, isCalendarDayBefore } from '@/domain/learning/calendarDate'
import { missionXp } from '@/domain/game/experience'
import { type StreakUpdate, rewardsSuspended, streakAfterCompletion } from '@/domain/game/streak'
import type { ProgressState } from '@/domain/progress/progressState'
import { starsEarned } from '@/domain/progress/progressState'

/**
 * Mission completion and rewards (PRD §3): +10 XP for the first three missions
 * of a day, a streak bonus on top of the cap, one record per mission id.
 * A restart or a recovery never pays twice; the expedition finish is saved
 * together with the mission that earned it.
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

  // Practice stays available, but new rewards are paused until the date recovers.
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

  // Expedition finish: the mission that earned the last star — transition once.
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

/** The device date is before the last rewarded date. */
export function rewardsPausedByClockRollback(state: ProgressState, today: CalendarDate): boolean {
  return (
    state.rewards.streak.lastRewardedDate !== null &&
    isCalendarDayBefore(today, state.rewards.streak.lastRewardedDate)
  )
}
