/**
 * XP и уровень (PRD §3): +10 XP за завершённую миссию, максимум 30 обычных XP
 * за первые три миссии дня; уровень = 1 + floor(XP / 100).
 * XP не влияет на оценку знаний.
 */

export const XP_PER_MISSION = 10
export const DAILY_MISSION_XP_LIMIT = 30

export function levelFromXp(totalXp: number): number {
  return 1 + Math.floor(totalXp / 100)
}

/** XP за очередную завершённую миссию при числе уже завершённых в этот день. */
export function missionXp(completedTodayBefore: number): number {
  return completedTodayBefore * XP_PER_MISSION >= DAILY_MISSION_XP_LIMIT ? 0 : XP_PER_MISSION
}
