import { describe, expect, it } from 'vitest'

import { applyMissionRewards } from '@/domain/progress/rewards'
import { createProgressState, type ProgressState } from '@/domain/progress/progressState'
import { createMasteryProgress } from '@/domain/learning/mastery'
import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { AttemptOutcome } from '@/domain/learning/answer'

function withAnswer(state: ProgressState, missionId: string, date: CalendarDate, outcome: AttemptOutcome = 'correct'): ProgressState {
  return { ...state, attempts: [...state.attempts, { factId: '0:0', missionId, date, outcome, independent: true }] }
}

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
    const state = withAnswer(createProgressState(), 'm1', '2026-01-01')
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
      const result = applyMissionRewards(withAnswer(state, id, '2026-01-01'), id, '2026-01-01')
      state = result.state
      total += result.xpAwarded
    }
    expect(total).toBe(30)

    const fourth = applyMissionRewards(withAnswer(state, 'm4', '2026-01-01'), 'm4', '2026-01-01')
    expect(fourth.xpAwarded).toBe(0)

    const nextDay = applyMissionRewards(withAnswer(fourth.state, 'm5', '2026-01-02'), 'm5', '2026-01-02')
    expect(nextDay.xpAwarded).toBe(10)
  })

  it('pays the streak bonus on top of the daily XP limit', () => {
    let state = createProgressState()
    for (let day = 1; day <= 3; day += 1) {
      const date = `2026-01-0${day}` as CalendarDate
      state = applyMissionRewards(withAnswer(state, `m${day}`, date), `m${day}`, date).state
    }
    expect(state.rewards.totalXp).toBe(30 + 20)
    expect(state.rewards.streak.days).toBe(3)
  })

  it('finishes the expedition exactly once with the mission that opens the last star', () => {
    // All 66 stars were earned in this mission; the mode transition is saved with its completion.
    const state = withAnswer(withStars(createProgressState(), 66), 'm-final', '2026-01-01')
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
    state = applyMissionRewards(withAnswer(state, 'm1', '2026-01-01'), 'm1', '2026-01-01').state
    state = { ...state, mode: 'maintenance' }
    const next = applyMissionRewards(withAnswer(state, 'm2', '2026-01-02'), 'm2', '2026-01-02')
    expect(next.state.rewards.streak.days).toBe(1)
    expect(next.xpAwarded).toBe(10)
  })

  it('pauses rewards when the device date rolls back but keeps practice available', () => {
    let state = createProgressState()
    state = applyMissionRewards(withAnswer(state, 'm1', '2026-01-10'), 'm1', '2026-01-10').state
    const rolledBack = applyMissionRewards(withAnswer(state, 'm2', '2026-01-09'), 'm2', '2026-01-09')
    expect(rolledBack.xpAwarded).toBe(0)
    expect(rolledBack.state.rewards.completions).toHaveLength(2)
  })

  it('gives no XP or streak bonus for hints only and does not consume a rewarded mission slot', () => {
    let state = createProgressState()
    state = applyMissionRewards(withAnswer(state, 'day1', '2026-01-01'), 'day1', '2026-01-01').state
    state = applyMissionRewards(withAnswer(state, 'day2', '2026-01-02'), 'day2', '2026-01-02').state
    const hints = applyMissionRewards(withAnswer(state, 'hints', '2026-01-03', 'unknown'), 'hints', '2026-01-03')
    expect(hints.xpAwarded).toBe(0)
    expect(hints.streakBonusXp).toBe(0)
    expect(hints.xpBlockedReason).toBe('no-answer')
    expect(hints.state.rewards.streak).toEqual(state.rewards.streak)
    expect(hints.state.rewards.completions.at(-1)?.xpEligible).toBe(false)
    expect(applyMissionRewards(hints.state, 'hints', '2026-01-03').state).toBe(hints.state)
    const entered = applyMissionRewards(withAnswer(hints.state, 'entered', '2026-01-03', 'wrong'), 'entered', '2026-01-03')
    expect(entered.xpAwarded).toBe(10)
    expect(entered.streakBonusXp).toBe(20)
    expect(entered.state.rewards.streak.days).toBe(3)
    const second = applyMissionRewards(withAnswer(entered.state, 'second', '2026-01-03'), 'second', '2026-01-03')
    const third = applyMissionRewards(withAnswer(second.state, 'third', '2026-01-03'), 'third', '2026-01-03')
    expect(second.xpAwarded + third.xpAwarded).toBe(20)
  })

  it('requires an entered answer in this mission, not a diagnostic or another mission', () => {
    const state = withAnswer(createProgressState(), 'other', '2026-01-01')
    const result = applyMissionRewards(state, 'only-hints', '2026-01-01')
    expect(result.xpAwarded).toBe(0)
    expect(result.state.rewards.totalXp).toBe(0)
  })

  it('keeps historical completions without eligibility flags in the daily cap', () => {
    const initial = createProgressState()
    const state = withAnswer({ ...initial, rewards: { ...initial.rewards, totalXp: 30, completions: ['a', 'b', 'c'].map(missionId => ({ missionId, date: '2026-01-01' as CalendarDate })) } }, 'new', '2026-01-01', 'wrong')
    const result = applyMissionRewards(state, 'new', '2026-01-01')
    expect(result.xpAwarded).toBe(0)
    expect(result.xpBlockedReason).toBe('daily-limit')
    expect(result.state.rewards.totalXp).toBe(30)
  })
})
