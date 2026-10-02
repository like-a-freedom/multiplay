import { describe, expect, it } from 'vitest'

import { startMission } from '@/application/useCases/startMission'
import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import { allFacts, factFromId, isSimpleFact } from '@/domain/fact/multiplicationFact'
import { createMasteryProgress } from '@/domain/learning/mastery'
import type { ProgressState } from '@/domain/progress/progressState'
import { createProgressState } from '@/domain/progress/progressState'

/** Seeded PRNG: the same seed always produces the same sequence. */
function rng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** Every fact is familiar and every review date is in the future. */
function allFamiliarReady(): ProgressState {
  const base = createProgressState()
  return {
    ...base,
    facts: Object.fromEntries(
      Object.entries(base.facts).map(([id, fact]) => [
        id,
        {
          ...fact,
          status: 'familiar' as const,
          review: { completedSuccesses: 4, nextReviewDate: '2026-02-01' },
          mastery: createMasteryProgress(),
          lastAnswerDate: null,
        },
      ]),
    ),
  }
}

function answerCorrect(state: ProgressState, factId: string, date: string, missionId: string | null): ProgressState {
  const result = submitCardAnswer(state, {
    factId,
    date,
    missionId,
    rawAnswer: String(factFromId(factId).product),
    choseUnknown: false,
  })
  if (result.kind !== 'accepted') throw new Error(`ожидался принятый ответ для ${factId}`)
  return result.state
}

/** Return the same progress with the fact keys in reverse insertion order. */
function withReversedFactOrder(state: ProgressState): ProgressState {
  const entries = Object.entries(state.facts)
  entries.reverse()
  return { ...state, facts: Object.fromEntries(entries) }
}

describe('startMission: разнообразие состава (регрессия «слишком часто ×0»)', () => {
  it('свежая миссия вводит один простой и один сложный факт, а не блок нулей', () => {
    const mission = startMission(createProgressState(), {
      missionId: 'fresh',
      date: '2026-01-01',
      random: rng(1),
    }).mission

    expect(mission.cardFactIds).toHaveLength(2)
    const classes = mission.cardFactIds.map((id) => isSimpleFact(factFromId(id)))
    expect(classes.filter((simple) => simple)).toHaveLength(1)
    expect(classes.filter((simple) => !simple)).toHaveLength(1)
  })

  it('при всех знакомых фактах миссия не заполняется нулями: rule-фактов не больше двух', () => {
    const mission = startMission(allFamiliarReady(), {
      missionId: 'familiar-only',
      date: '2026-01-01',
      random: rng(7),
    }).mission

    expect(mission.cardFactIds).toHaveLength(10)
    const ruleCount = mission.cardFactIds.filter((id) => {
      const [smaller] = factFromId(id).factors
      return smaller === 0 || smaller === 1
    }).length
    expect(ruleCount).toBeLessThanOrEqual(2)
  })

  it('выбор не зависит от порядка ключей сохранения', () => {
    const state = createProgressState()
    const forward = startMission(state, { missionId: 'm', date: '2026-01-01', random: rng(42) })
    const reversed = startMission(withReversedFactOrder(state), {
      missionId: 'm',
      date: '2026-01-01',
      random: rng(42),
    })
    expect(reversed.mission.cardFactIds).toEqual(forward.mission.cardFactIds)
  })

  it('добивка ротируется по давности: отвеченные сегодня не идут впереди никогда не виденных', () => {
    let state = allFamiliarReady()
    state = answerCorrect(state, '0:0', '2026-01-01', null)
    state = answerCorrect(state, '0:1', '2026-01-01', null)

    const mission = startMission(state, {
      missionId: 'rotation',
      date: '2026-01-01',
      random: rng(3),
    }).mission

    expect(mission.cardFactIds).toHaveLength(10)
    expect(mission.cardFactIds).not.toContain('0:0')
    expect(mission.cardFactIds).not.toContain('0:1')
  })

  it('для старого familiar-снимка неизвестная дата раньше известной', () => {
    const state = allFamiliarReady()
    const legacyIds = allFacts().slice(0, 11).map((fact) => fact.id)
    const unknownDateId = legacyIds[10]
    const legacySet = new Set(legacyIds)
    const legacyState: ProgressState = {
      ...state,
      facts: Object.fromEntries(
        Object.entries(state.facts).map(([id, fact], index) => [
          id,
          {
            ...fact,
            lastAttemptIndex: legacySet.has(id) ? null : index + 11,
            lastAnswerDate: legacySet.has(id)
              ? id === unknownDateId
                ? null
                : '2025-12-20'
              : '2025-12-31',
          },
        ]),
      ),
    }

    const mission = startMission(legacyState, {
      missionId: 'legacy-date-fallback',
      date: '2026-01-01',
      random: rng(17),
    }).mission

    expect(mission.cardFactIds).toContain(unknownDateId)
  })

  it('календарно подошедшие повторы важнее ранней практики по будущей дате', () => {
    const base = createProgressState()
    const overdueIds = Object.keys(base.facts).slice(0, 10)
    const earlyRetryId = Object.keys(base.facts)[10]
    const overdueSet = new Set(overdueIds)
    const state: ProgressState = {
      ...base,
      facts: Object.fromEntries(
        Object.entries(base.facts).map(([id, fact]) => {
          if (overdueSet.has(id)) {
            return [id, {
              ...fact,
              status: 'familiar' as const,
              review: { completedSuccesses: 1, nextReviewDate: '2025-12-01' },
            }]
          }
          if (id === earlyRetryId) {
            return [id, {
              ...fact,
              status: 'familiar' as const,
              review: { completedSuccesses: 0, nextReviewDate: '2026-02-01' },
              mastery: { ...fact.mastery, needsReview: true },
            }]
          }
          return [id, {
            ...fact,
            status: 'familiar' as const,
            review: { completedSuccesses: 4, nextReviewDate: '2026-02-01' },
          }]
        }),
      ),
    }

    const mission = startMission(state, {
      missionId: 'overdue-before-early-retry',
      date: '2026-01-01',
      random: rng(13),
    }).mission

    expect(mission.cardFactIds).toHaveLength(10)
    expect(new Set(mission.cardFactIds)).toEqual(new Set(overdueIds))
    expect(mission.cardFactIds).not.toContain(earlyRetryId)
  })

  it('диагностическая ошибка сегодня не вытесняет старые календарные повторы', () => {
    const base = allFamiliarReady()
    const overdueIds = allFacts().slice(0, 10).map((fact) => fact.id)
    const overdueSet = new Set(overdueIds)
    const diagnosticErrorId = '10:10'
    const scheduled: ProgressState = {
      ...base,
      facts: Object.fromEntries(
        Object.entries(base.facts).map(([id, fact]) => [
          id,
          overdueSet.has(id)
            ? {
                ...fact,
                review: { completedSuccesses: 1, nextReviewDate: '2025-12-01' },
              }
            : fact,
        ]),
      ),
    }
    const error = submitCardAnswer(scheduled, {
      factId: diagnosticErrorId,
      date: '2026-01-01',
      missionId: null,
      rawAnswer: null,
      choseUnknown: true,
    })
    if (error.kind !== 'accepted') throw new Error('ожидалась принятая диагностическая ошибка')

    const review = startMission(error.state, {
      missionId: 'diagnostic-error-review',
      date: '2026-01-01',
      kind: 'review',
      random: rng(19),
    }).mission

    expect(new Set(review.cardFactIds)).toEqual(new Set(overdueIds))
    expect(review.cardFactIds).not.toContain(diagnosticErrorId)
  })
})
