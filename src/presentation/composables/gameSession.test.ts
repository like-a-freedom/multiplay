// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import type { LoadProgressResult, ProgressStore, SaveProgressResult } from '@/application/ports/progressStore'
import { createMasteryProgress } from '@/domain/learning/mastery'
import { createProgressState, type ProgressState } from '@/domain/progress/progressState'
import { createGameSession, reviewCountToday, useGameSession } from '@/presentation/composables/gameSession'

type TestStore = Omit<ProgressStore, 'save' | 'reset'> & {
  save: ReturnType<typeof vi.fn<ProgressStore['save']>>
  reset: ReturnType<typeof vi.fn<ProgressStore['reset']>>
}

function storeWith(
  loaded: LoadProgressResult,
  saveResult: SaveProgressResult = { ok: true },
): TestStore {
  return {
    load: vi.fn(() => loaded),
    save: vi.fn<ProgressStore['save']>(() => saveResult),
    reset: vi.fn<ProgressStore['reset']>(),
  }
}

function stateWithSessionMetrics(): ProgressState {
  const state = createProgressState()
  return {
    ...state,
    rewards: {
      ...state.rewards,
      totalXp: 240,
      streak: { ...state.rewards.streak, days: 5 },
    },
    facts: {
      ...state.facts,
      '2:3': {
        ...state.facts['2:3'],
        mastery: { ...createMasteryProgress(), hasStar: true },
      },
    },
  }
}

describe('game session persistence boundary', () => {
  it('starts a new expedition when storage is empty and exposes reactive progress metrics', () => {
    const store = storeWith({ kind: 'empty' })
    const session = createGameSession(store)

    expect(session.storageStatus.value).toBe('ok')
    expect(session.totalXp.value).toBe(0)
    expect(session.level.value).toBe(1)
    expect(session.stars.value).toBe(0)
    expect(session.streakDays.value).toBe(0)

    session.state.value = stateWithSessionMetrics()
    expect(session.totalXp.value).toBe(240)
    expect(session.level.value).toBe(3)
    expect(session.stars.value).toBe(1)
    expect(session.streakDays.value).toBe(5)
  })

  it('restores saved progress without replacing it with a fresh expedition', () => {
    const saved = stateWithSessionMetrics()
    const store = storeWith({ kind: 'saved', state: saved })
    const session = createGameSession(store)

    expect(session.state.value).toEqual(saved)
    expect(session.totalXp.value).toBe(240)
    expect(session.level.value).toBe(3)
    expect(session.stars.value).toBe(1)
    expect(session.streakDays.value).toBe(5)
  })

  it.each([
    [{ kind: 'corrupt' } as const, 'corrupt'],
    [{ kind: 'unknown-version', version: 99 } as const, 'unknown-version'],
  ])('blocks writes after damaged or unsupported saved data: %s', (loaded, expectedStatus) => {
    const store = storeWith(loaded)
    const session = createGameSession(store)

    expect(session.storageStatus.value).toBe(expectedStatus)
    expect(session.save()).toBe(false)
    expect(store.save).not.toHaveBeenCalled()

    session.resetProgress()
    expect(store.reset).toHaveBeenCalledOnce()
    expect(session.storageStatus.value).toBe('ok')
    expect(session.state.value.expeditionFinished).toBe(false)
    expect(session.state.value.rewards.totalXp).toBe(0)
    expect(Object.values(session.state.value.facts).every((fact) => fact.status === 'new')).toBe(true)
  })

  it('reports a failed write and recovers after a later successful save', () => {
    const store = storeWith({ kind: 'empty' }, { ok: false, reason: 'write-failed' })
    const session = createGameSession(store)

    expect(session.save()).toBe(false)
    expect(session.storageStatus.value).toBe('write-failed')

    vi.mocked(store.save).mockReturnValue({ ok: true })
    expect(session.save()).toBe(true)
    expect(session.storageStatus.value).toBe('ok')
    expect(store.save).toHaveBeenCalledTimes(2)
  })

  it('allows a retry after storage becomes available again', () => {
    const store = storeWith({ kind: 'storage-unavailable' }, { ok: false, reason: 'storage-unavailable' })
    const session = createGameSession(store)

    expect(session.storageStatus.value).toBe('storage-unavailable')
    expect(session.save()).toBe(false)
    expect(store.save).toHaveBeenCalledOnce()

    vi.mocked(store.save).mockReturnValue({ ok: true })
    expect(session.save()).toBe(true)
    expect(session.storageStatus.value).toBe('ok')
  })

  it('counts calendar-due facts and post-error review marks, but not future reviews', () => {
    const base = createProgressState()
    const state: ProgressState = {
      ...base,
      facts: {
        ...base.facts,
        '2:3': {
          ...base.facts['2:3'],
          status: 'familiar',
          review: { completedSuccesses: 1, nextReviewDate: '2026-01-01' },
        },
        '4:5': {
          ...base.facts['4:5'],
          status: 'familiar',
          review: { completedSuccesses: 0, nextReviewDate: '2026-01-10' },
          mastery: { ...base.facts['4:5'].mastery, needsReview: true },
        },
        '6:7': {
          ...base.facts['6:7'],
          status: 'familiar',
          review: { completedSuccesses: 2, nextReviewDate: '2026-01-11' },
        },
      },
    }

    expect(reviewCountToday(state, '2026-01-10')).toBe(2)
    expect(reviewCountToday(state, '2025-12-31')).toBe(1)
  })

  it('requires the composition root to provide the session', () => {
    const Probe = defineComponent(() => {
      useGameSession()
      return () => h('div')
    })
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      expect(() => mount(Probe)).toThrow('GameSession must be provided by the composition root (main.ts)')
    } finally {
      warning.mockRestore()
    }
  })
})
