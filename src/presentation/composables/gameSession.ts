import { type InjectionKey, type Ref, computed, inject, ref } from 'vue'

import type { LoadProgressResult, ProgressStore } from '@/application/ports/progressStore'
import { levelFromXp } from '@/domain/game/experience'
import { createProgressState, factNeedsReview, starsEarned } from '@/domain/progress/progressState'
import type { ProgressState } from '@/domain/progress/progressState'
import type { CalendarDate } from '@/domain/learning/calendarDate'

/**
 * Shared game session (AGENTS.md): a thin wrapper over ProgressStore.
 * Corrupt or unknown data is never overwritten until an explicit reset (PRD §4).
 */

export type StorageStatus = 'ok' | 'write-failed' | 'corrupt' | 'unknown-version' | 'storage-unavailable'

export interface GameSession {
  readonly state: Ref<ProgressState>
  readonly storageStatus: Ref<StorageStatus>
  readonly totalXp: Ref<number>
  readonly level: Ref<number>
  readonly stars: Ref<number>
  readonly streakDays: Ref<number>
  save(): boolean
  resetProgress(): void
}

export const gameSessionKey: InjectionKey<GameSession> = Symbol('gameSession')

export function useGameSession(): GameSession {
  const session = inject(gameSessionKey)
  if (session === undefined) {
    throw new Error('GameSession must be provided by the composition root (main.ts)')
  }
  return session
}

export function createGameSession(store: ProgressStore): GameSession {
  const loaded: LoadProgressResult = store.load()
  const loadedState = loaded.kind === 'saved' ? loaded.state : createProgressState()
  const state = ref<ProgressState>(loadedState)
  const storageStatus = ref<StorageStatus>(statusFromLoad(loaded))

  // Writes are blocked until the user confirms a reset of damaged data.
  const writeBlocked = () =>
    storageStatus.value === 'corrupt' || storageStatus.value === 'unknown-version'

  function save(): boolean {
    if (writeBlocked()) return false
    const result = store.save(state.value)
    storageStatus.value = result.ok ? 'ok' : 'write-failed'
    return result.ok
  }

  function resetProgress(): void {
    store.reset()
    state.value = createProgressState()
    storageStatus.value = 'ok'
  }

  return {
    state,
    storageStatus,
    totalXp: computed(() => state.value.rewards.totalXp),
    level: computed(() => levelFromXp(state.value.rewards.totalXp)),
    stars: computed(() => starsEarned(state.value)),
    streakDays: computed(() => state.value.rewards.streak.days),
    save,
    resetProgress,
  }
}

export function reviewCountToday(state: ProgressState, today: CalendarDate): number {
  return Object.values(state.facts).filter((fact) => factNeedsReview(fact, today)).length
}

function statusFromLoad(loaded: LoadProgressResult): StorageStatus {
  switch (loaded.kind) {
    case 'corrupt':
      return 'corrupt'
    case 'unknown-version':
      return 'unknown-version'
    case 'storage-unavailable':
      return 'storage-unavailable'
    default:
      return 'ok'
  }
}
