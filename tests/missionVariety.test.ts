import { describe, expect, it } from 'vitest'

import { completeMission } from '@/application/useCases/completeMission'
import { finishDiagnostic, skipDiagnostic, startDiagnostic } from '@/application/useCases/diagnostic'
import { startMission } from '@/application/useCases/startMission'
import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import { factFromId, isSimpleFact } from '@/domain/fact/multiplicationFact'
import { addCalendarDays, calendarDayDiff } from '@/domain/learning/calendarDate'
import { RULE_FACT_TARGET } from '@/domain/mission/composeMission'
import { parseSnapshot, serializeSnapshot } from '@/infrastructure/storage/snapshot'
import { createProgressState, planningStatus, type ProgressState } from '@/domain/progress/progressState'

type DiagnosticSetup = 'skip' | 'complete' | 'partial'
interface MissionScenario {
  readonly diagnostic: DiagnosticSetup
  readonly missionsPerDay: 1 | 3
  readonly allowErrors: boolean
}

const scenarios: readonly MissionScenario[] = (['skip', 'complete', 'partial'] as const).flatMap(
  (diagnostic) =>
    ([1, 3] as const).flatMap((missionsPerDay) =>
      [false, true].map((allowErrors) => ({ diagnostic, missionsPerDay, allowErrors })),
    ),
)

function rng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function restore(state: ProgressState): ProgressState {
  const result = parseSnapshot(serializeSnapshot(state))
  if (result.kind !== 'saved') throw new Error('прогресс не прошёл round-trip снимка')
  return result.state
}

function recordAnswer(
  state: ProgressState,
  factId: string,
  date: string,
  missionId: string | null,
  wrong: boolean,
): ProgressState {
  const product = factFromId(factId).product
  const rawAnswer = wrong ? String(product === 100 ? product - 1 : product + 1) : String(product)
  const result = submitCardAnswer(state, {
    factId,
    date,
    missionId,
    rawAnswer,
    choseUnknown: false,
  })
  if (result.kind !== 'accepted') throw new Error(`ответ не был принят: ${factId} = ${rawAnswer}`)
  return result.state
}

function setupDiagnostic(kind: DiagnosticSetup): ProgressState {
  let state = createProgressState()
  if (kind === 'skip') return skipDiagnostic(startDiagnostic(state, rng(11)))

  state = startDiagnostic(state, rng(11))
  const diagnosticIds = state.diagnostic?.factIds ?? []
  const count = kind === 'complete' ? diagnosticIds.length : 4
  for (const factId of diagnosticIds.slice(0, count)) {
    state = recordAnswer(state, factId, '2026-01-01', null, false)
  }
  return kind === 'complete' ? finishDiagnostic(state) : skipDiagnostic(state)
}

function allFactsDue(): ProgressState {
  const base = createProgressState()
  return {
    ...base,
    facts: Object.fromEntries(
      Object.entries(base.facts).map(([id, fact]) => [
        id,
        {
          ...fact,
          status: 'familiar' as const,
          review: { completedSuccesses: 4, nextReviewDate: '2025-12-31' },
        },
      ]),
    ),
  }
}

function isRuleFact(factId: string): boolean {
  return factFromId(factId).factors[0] <= 1
}

describe('mission variety over real use cases', () => {
  it.each(scenarios)(
    'keeps facts reachable and reviews timely for $diagnostic diagnostics, $missionsPerDay missions/day, errors=$allowErrors',
    ({ diagnostic, missionsPerDay, allowErrors }) => {
      let state = setupDiagnostic(diagnostic)
      const random = rng(2026)
      const firstIntroduction = new Map<string, number>()
      for (const attempt of state.attempts) {
        if (attempt.missionId === null) firstIntroduction.set(attempt.factId, 0)
      }
      let missionCount = 0
      let cardCount = 0
      let zeroCardCount = 0
      let ruleCardCount = 0
      let maxCalendarOverdueDays = 0

      for (let day = 0; day < 42; day += 1) {
        const date = addCalendarDays('2026-01-01', day)
        for (let session = 0; session < missionsPerDay; session += 1) {
          const isMaintenance = state.mode === 'maintenance'
          const hasDue = Object.values(state.facts).some(
            (fact) => planningStatus(fact, date) === 'due',
          )
          const kind = isMaintenance ? (hasDue ? 'review' : 'practice') : 'mission'
          const missionId = `${diagnostic}-${missionsPerDay}-${allowErrors}-${day}-${session}`
          for (const fact of Object.values(state.facts)) {
            if (fact.review !== null && fact.review.nextReviewDate <= date) {
              maxCalendarOverdueDays = Math.max(
                maxCalendarOverdueDays,
                calendarDayDiff(fact.review.nextReviewDate, date),
              )
            }
          }
          const priorState = state
          const started = startMission(state, { missionId, date, kind, random })
          state = restore(started.state)
          const cardIds = started.mission.cardFactIds

          expect(cardIds.length).toBeLessThanOrEqual(10)
          expect(new Set(cardIds).size).toBe(cardIds.length)
          if (kind === 'mission') {
            const selectedNewOrDue = cardIds.filter(
              (factId) => planningStatus(priorState.facts[factId], date) !== 'familiar',
            )
            const familiarCandidates = Object.values(priorState.facts).filter(
              (fact) => planningStatus(fact, date) === 'familiar',
            )
            const familiarCapacity = Math.min(
              10 - selectedNewOrDue.length,
              familiarCandidates.length,
            )
            const nonRuleFamiliarCount = familiarCandidates.filter(
              (fact) => !isRuleFact(fact.factId),
            ).length
            const baseRuleCount = selectedNewOrDue.filter(isRuleFact).length
            const maximumRuleCards =
              baseRuleCount + Math.max(0, familiarCapacity - nonRuleFamiliarCount)
            expect(cardIds.filter(isRuleFact).length).toBeLessThanOrEqual(
              Math.max(RULE_FACT_TARGET, maximumRuleCards),
            )
          }
          missionCount += 1
          cardCount += cardIds.length
          zeroCardCount += cardIds.filter((factId) => factFromId(factId).factors[0] === 0).length
          ruleCardCount += cardIds.filter(isRuleFact).length

          for (const factId of cardIds) {
            if (state.facts[factId].status === 'new' && !firstIntroduction.has(factId)) {
              firstIntroduction.set(factId, missionCount)
            }
            const fact = factFromId(factId)
            const shouldMiss = allowErrors && !isSimpleFact(fact) && random() < 0.18
            state = recordAnswer(state, factId, date, missionId, shouldMiss)
          }
          state = restore(completeMission(state, { missionId, date }).state)
        }
      }

      expect(firstIntroduction.size).toBe(66)
      expect([...firstIntroduction.values()].every((mission) => mission <= 33)).toBe(true)
      expect(cardCount).toBeGreaterThan(0)
      expect(zeroCardCount).toBeGreaterThan(0)
      expect(zeroCardCount).toBeLessThan(cardCount)
      expect(ruleCardCount).toBeLessThan(cardCount)
      expect(maxCalendarOverdueDays).toBeLessThanOrEqual(14)
    },
  )

  it('serves all 66 calendar-due facts in at most seven same-day review sessions', () => {
    let state = allFactsDue()
    const reviewed = new Set<string>()
    const date = '2026-01-01'

    for (let session = 0; session < 7; session += 1) {
      const missionId = `review-${session}`
      const started = startMission(state, {
        missionId,
        date,
        kind: 'review',
        random: rng(session + 1),
      })
      expect(started.mission.cardFactIds.length).toBeGreaterThan(0)
      expect(started.mission.cardFactIds.length).toBeLessThanOrEqual(10)
      state = started.state
      for (const factId of started.mission.cardFactIds) {
        expect(reviewed.has(factId)).toBe(false)
        reviewed.add(factId)
        state = recordAnswer(state, factId, date, missionId, false)
      }
      state = completeMission(state, { missionId, date }).state
    }

    expect(reviewed.size).toBe(66)
    expect(Object.values(state.facts).every((fact) => fact.review?.nextReviewDate === '2026-01-15')).toBe(true)
  })
})
