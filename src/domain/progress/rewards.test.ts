import { describe, expect, it } from 'vitest'

import { applyMissionRewards } from '@/domain/progress/rewards'
import { createProgressState, type ProgressState } from '@/domain/progress/progressState'
import { createMasteryProgress } from '@/domain/learning/mastery'

function withStars(state: ProgressState, count: number): ProgressState {
  const facts = { ...state.facts }
  for (const factId of Object.keys(facts).slice(0, count)) {
    facts[factId] = {
      ...facts[factId],
      mastery: { ...createMasteryProgress(), hasStar: true },
    }
  }
  return { ...state, facts }
}

describe('applyMissionRewards', () => {
  it('awards +10 XP and is idempotent per mission id', () => {
    const state = createProgressState()
    const first = applyMissionRewards(state, 'm1', '2026-01-01')
    expect(first.xpAwarded).toBe(10)
    expect(first.state.rewards.totalXp).toBe(10)

    const repeated = applyMissionRewards(first.state, 'm1', '2026-01-01')
    expect(repeated.state).toBe(first.state)
    expect(repeated.xpAwarded).toBe(0)
    expect(repeated.state.rewards.totalXp).toBe(10)
  })

  it('caps ordinary XP at 30 per calendar day and pays nothing for later missions', () => {
    let state = createProgressState()
    let total = 0
    for (const id of ['m1', 'm2', 'm3']) {
      const result = applyMissionRewards(state, id, '2026-01-01')
      state = result.state
      total += result.xpAwarded
    }
    expect(total).toBe(30)

    const fourth = applyMissionRewards(state, 'm4', '2026-01-01')
    expect(fourth.xpAwarded).toBe(0)

    const nextDay = applyMissionRewards(fourth.state, 'm5', '2026-01-02')
    expect(nextDay.xpAwarded).toBe(10)
  })

  it('pays the streak bonus on top of the daily XP limit', () => {
    let state = createProgressState()
    for (let day = 1; day <= 3; day += 1) {
      state = applyMissionRewards(state, `m${day}`, `2026-01-0${day}`).state
    }
    expect(state.rewards.totalXp).toBe(30 + 20)
    expect(state.rewards.streak.days).toBe(3)
  })

  it('finishes the expedition exactly once with the mission that opens the last star', () => {
    // 66 звёзд уже открыты попытками этой миссии — переход сохраняется с её завершением.
    const state = withStars(createProgressState(), 66)
    const finishing = applyMissionRewards(state, 'm-final', '2026-01-01')
    expect(finishing.expeditionJustFinished).toBe(true)
    expect(finishing.state.mode).toBe('maintenance')
    expect(finishing.state.expeditionFinished).toBe(true)

    const again = applyMissionRewards(finishing.state, 'm-final', '2026-01-01')
    expect(again.expeditionJustFinished).toBe(false)
    expect(again.state.expeditionFinished).toBe(true)
  })

  it('keeps the last streak result in maintenance mode without new streak changes', () => {
    let state = createProgressState()
    state = applyMissionRewards(state, 'm1', '2026-01-01').state
    state = { ...state, mode: 'maintenance' }
    const next = applyMissionRewards(state, 'm2', '2026-01-02')
    expect(next.state.rewards.streak.days).toBe(1)
    expect(next.xpAwarded).toBe(10)
  })

  it('pauses rewards when the device date rolls back but keeps practice available', () => {
    let state = createProgressState()
    state = applyMissionRewards(state, 'm1', '2026-01-10').state
    const rolledBack = applyMissionRewards(state, 'm2', '2026-01-09')
    expect(rolledBack.xpAwarded).toBe(0)
    expect(rolledBack.state.rewards.completions).toHaveLength(2)
  })
})
