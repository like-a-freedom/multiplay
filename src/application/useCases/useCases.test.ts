import { describe, expect, it } from 'vitest'

import { startMission } from '@/application/useCases/startMission'
import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import { completeMission } from '@/application/useCases/completeMission'
import { createProgressState, factNeedsReview, starsEarned } from '@/domain/progress/progressState'

describe('mission use cases', () => {
  it('starts free practice only from familiar facts (fresh state has none)', () => {
    const practice = startMission(createProgressState(), {
      missionId: 'p1',
      date: '2026-01-01',
      kind: 'practice',
    })
    expect(practice.mission.cardFactIds).toHaveLength(0)

    const planned = startMission(createProgressState(), { missionId: 'm1', date: '2026-01-01' })
    expect(planned.mission.cardFactIds).toHaveLength(2)
  })

  it('freezes the card queue at mission start', () => {
    const started = startMission(createProgressState(), { missionId: 'm1', date: '2026-01-01' })
    // Свежее состояние: только два новых факта, повторений и знакомых нет — миссия короче.
    expect(started.mission.cardFactIds).toHaveLength(2)
    expect(started.state.currentMission?.id).toBe('m1')
    expect(started.state.currentMission?.cardFactIds).toEqual([...started.mission.cardFactIds])
  })

  it('rejects invalid input without recording a learning mistake', () => {
    const state = createProgressState()
    const result = submitCardAnswer(
      state,
      { factId: '2:3', date: '2026-01-01', missionId: 'm1', rawAnswer: '6.6', choseUnknown: false },
      6,
    )
    expect(result.kind).toBe('invalid-input')
  })

  it('records the accepted attempt and schedules the review', () => {
    const state = createProgressState()
    const result = submitCardAnswer(
      state,
      { factId: '2:3', date: '2026-01-01', missionId: 'm1', rawAnswer: '6', choseUnknown: false },
      6,
    )
    if (result.kind !== 'accepted') throw new Error('expected accepted attempt')
    expect(result.outcome).toBe('correct')
    expect(result.state.attempts).toHaveLength(1)
    expect(result.state.facts['2:3'].review?.nextReviewDate).toBe('2026-01-02')
  })

  it('schedules an error for tomorrow and marks the fact for review', () => {
    const state = createProgressState()
    const result = submitCardAnswer(
      state,
      { factId: '2:3', date: '2026-01-01', missionId: 'm1', rawAnswer: null, choseUnknown: true },
      6,
    )
    if (result.kind !== 'accepted') throw new Error('expected accepted attempt')
    expect(result.outcome).toBe('unknown')
    expect(result.state.facts['2:3'].review?.nextReviewDate).toBe('2026-01-02')
    expect(factNeedsReview(result.state.facts['2:3'], '2026-01-01')).toBe(true)
  })

  it('treats a success after today’s shown solution as not independent', () => {
    let state = createProgressState()
    state = record(state, '2:3', '2026-01-01', 'm1', true) // «Не знаю» → показано решение
    const result = submitCardAnswer(
      state,
      { factId: '2:3', date: '2026-01-01', missionId: 'm1', rawAnswer: '6', choseUnknown: false },
      6,
    )
    if (result.kind !== 'accepted') throw new Error('expected accepted attempt')
    const fact = result.state.facts['2:3']
    expect(result.state.attempts[1].independent).toBe(false)
    expect(fact.mastery.independentSuccessDates).toEqual([])
    expect(fact.review?.nextReviewDate).toBe('2026-01-02') // расписание не сдвинулось
  })

  it('does not grant mastery progress for diagnostic answers', () => {
    const state = createProgressState()
    const result = submitCardAnswer(
      state,
      { factId: '2:3', date: '2026-01-01', missionId: null, rawAnswer: '6', choseUnknown: false },
      6,
    )
    if (result.kind !== 'accepted') throw new Error('expected accepted attempt')
    const fact = result.state.facts['2:3']
    expect(fact.mastery.independentSuccessDates).toEqual([])
    expect(fact.status).toBe('familiar')
  })

  it('completes a mission with one atomic reward update per mission id', () => {
    let state = startMission(createProgressState(), { missionId: 'm1', date: '2026-01-01' }).state
    state = record(state, '2:3', '2026-01-01', 'm1', false, '6', 6)
    const done = completeMission(state, { missionId: 'm1', date: '2026-01-01' })
    expect(done.state.currentMission).toBeNull()
    expect(done.state.rewards.totalXp).toBe(10)

    const repeated = completeMission(done.state, { missionId: 'm1', date: '2026-01-01' })
    expect(repeated.state.rewards.totalXp).toBe(10)
    expect(starsEarned(repeated.state)).toBe(0)
  })
})

function record(
  state: ReturnType<typeof createProgressState>,
  factId: string,
  date: string,
  missionId: string | null,
  choseUnknown: boolean,
  rawAnswer: string | null = null,
  product = 0,
): ReturnType<typeof createProgressState> {
  const result = submitCardAnswer(state, { factId, date, missionId, rawAnswer, choseUnknown }, product)
  if (result.kind !== 'accepted') throw new Error('expected accepted attempt')
  return result.state
}
