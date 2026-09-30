import { XP_PER_LEVEL } from '@/domain/game/experience'

export interface XpRoutePosition {
  readonly level: number
  readonly earnedInLevel: number
  /** Progress through the current level, always in [0, 1). */
  readonly fraction: number
}

/** Maps a non-negative total XP value to its position on the current level route. */
export function xpRoute(totalXp: number): XpRoutePosition {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const earnedInLevel = totalXp % XP_PER_LEVEL
  return { level, earnedInLevel, fraction: earnedInLevel / XP_PER_LEVEL }
}
