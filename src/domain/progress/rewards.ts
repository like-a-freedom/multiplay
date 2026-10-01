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
export type XpBlockedReason = 'no-answer' | 'daily-limit' | 'clock-rollback' | 'already-completed'

export interface MissionRewardOutcome {
  readonly state: ProgressState
  readonly xpAwarded: number
  readonly streakBonusXp: number
  readonly expeditionJustFinished: boolean
  readonly xpBlockedReason: XpBlockedReason | null
}

/** Entering an answer is practice, whether it is right or wrong. Hints alone are not an answer. */
export function missionHasEnteredAnswer(state: ProgressState, missionId: string): boolean {
  return state.attempts.some((attempt) => attempt.missionId === missionId && attempt.outcome !== 'unknown')
}

export function applyMissionRewards(
  state: ProgressState,
  missionId: string,
  date: CalendarDate,
): MissionRewardOutcome {
  const alreadyRewarded = state.rewards.completions.some((c) => c.missionId === missionId)
  if (alreadyRewarded) {
    return { state, xpAwarded: 0, streakBonusXp: 0, expeditionJustFinished: false, xpBlockedReason: 'already-completed' }
  }

  const xpEligible = missionHasEnteredAnswer(state, missionId)
  const completionsToday = state.rewards.completions.filter((c) => c.date === date && c.xpEligible !== false).length
  const suspended = rewardsSuspended(state.rewards.streak, date)

  // Practice stays available, but new rewards are paused until the date recovers.
  const xpAwarded = !xpEligible || suspended ? 0 : missionXp(completionsToday)

  let streakUpdate: StreakUpdate = { streak: state.rewards.streak, bonusXp: 0 }
  if (xpEligible && state.mode === 'expedition' && !suspended) {
    streakUpdate = streakAfterCompletion(state.rewards.streak, date)
  }

  const withRewards: ProgressState = {
    ...state,
    currentMission: null,
    rewards: {
      totalXp: state.rewards.totalXp + xpAwarded + streakUpdate.bonusXp,
      completions: [...state.rewards.completions, { missionId, date, xpEligible }],
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
    xpBlockedReason: !xpEligible ? 'no-answer' : suspended ? 'clock-rollback' : xpAwarded === 0 ? 'daily-limit' : null,
  }
}

/** The device date is before the last rewarded date. */
export function rewardsPausedByClockRollback(state: ProgressState, today: CalendarDate): boolean {
  return (
    state.rewards.streak.lastRewardedDate !== null &&
    isCalendarDayBefore(today, state.rewards.streak.lastRewardedDate)
  )
}
