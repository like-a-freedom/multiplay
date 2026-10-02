import { computed, ref } from 'vue'

import type { GameSession } from '@/presentation/composables/gameSession'
import { gameSessionKey } from '@/presentation/composables/gameSession'
import { createProgressState, starsEarned } from '@/domain/progress/progressState'
import { levelFromXp } from '@/domain/game/experience'

/** Shared presentation-test fixture: a game session without persistent storage. */
export function fakeGameSession(): GameSession {
  const state = ref(createProgressState())
  return {
    state,
    storageStatus: ref('ok'),
    totalXp: computed(() => state.value.rewards.totalXp),
    level: computed(() => levelFromXp(state.value.rewards.totalXp)),
    stars: computed(() => starsEarned(state.value)),
    streakDays: computed(() => state.value.rewards.streak.days),
    save: () => true,
    resetProgress: () => undefined,
  }
}

export function sessionMountOptions(session: GameSession = fakeGameSession()) {
  return {
    global: { provide: { [gameSessionKey as symbol]: session } },
    attachTo: document.body,
  }
}
