/**
 * XP and levels (PRD §3): +10 per completed mission, at most 30 plain XP for
 * the first three missions of a day; level = 1 + floor(XP / 100).
 * XP never measures knowledge of the table.
 */

export const XP_PER_MISSION = 10
export const DAILY_MISSION_XP_LIMIT = 30

export function levelFromXp(totalXp: number): number {
  return 1 + Math.floor(totalXp / 100)
}

/** XP for the next completed mission, given how many were completed today. */
export function missionXp(completedTodayBefore: number): number {
  return completedTodayBefore * XP_PER_MISSION >= DAILY_MISSION_XP_LIMIT ? 0 : XP_PER_MISSION
}
