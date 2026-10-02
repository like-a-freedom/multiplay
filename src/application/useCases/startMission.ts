import type { AttemptOutcome } from '@/domain/learning/answer'
import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { AttemptRecord, FactProgress, ProgressState } from '@/domain/progress/progressState'
import type { FactCandidate, MissionPlan } from '@/domain/mission/mission'
import { composeMission, composePractice, composeReview } from '@/domain/mission/composeMission'
import { planningStatus } from '@/domain/progress/progressState'

/**
 * Use case: start a mission. The queue is frozen at start (PRD §3).
 * `kind: 'practice'` is free practice; `kind: 'review'` is a review session
 * of the "due for review" facts instead of the planned mission.
 */

export type MissionKind = 'mission' | 'practice' | 'review'

export interface StartMissionCommand {
  readonly missionId: string
  readonly date: CalendarDate
  readonly kind?: MissionKind
  readonly random?: () => number
}

export interface StartMissionResult {
  readonly state: ProgressState
  readonly mission: MissionPlan
}

interface LastAttempt {
  readonly index: number
  readonly date: CalendarDate
  readonly outcome: AttemptOutcome
}

/** Позиция последней принятой попытки каждого факта — одним проходом по истории. */
function lastAttemptsByFact(attempts: readonly AttemptRecord[]): Map<string, LastAttempt> {
  const latest = new Map<string, LastAttempt>()
  attempts.forEach((attempt, index) => {
    latest.set(attempt.factId, { index, date: attempt.date, outcome: attempt.outcome })
  })
  return latest
}

function toCandidate(fact: FactProgress, status: FactCandidate['status'], last: LastAttempt | undefined): FactCandidate {
  return {
    factId: fact.factId,
    status,
    nextReviewDate: fact.review?.nextReviewDate ?? null,
    needsReview: fact.mastery.needsReview,
    lastAttemptIndex: last?.index ?? null,
    lastAttemptDate: last?.date ?? null,
    lastAttemptOutcome: last?.outcome ?? null,
    lastAnswerDate: fact.lastAnswerDate,
  }
}

export function startMission(
  state: ProgressState,
  command: StartMissionCommand,
): StartMissionResult {
  const lastAttempts = lastAttemptsByFact(state.attempts)
  const candidates: FactCandidate[] = Object.values(state.facts).map((fact) =>
    toCandidate(fact, planningStatus(fact, command.date), lastAttempts.get(fact.factId)),
  )
  const cards =
    command.kind === 'practice'
      ? composePractice(candidates, command.random)
      : command.kind === 'review'
        ? composeReview(candidates, { date: command.date, random: command.random })
        : composeMission(candidates, { date: command.date, random: command.random })
  const cardFactIds = cards.map((card) => card.factId)

  return {
    state: {
      ...state,
      currentMission: { id: command.missionId, cardFactIds, answeredFactIds: [] },
    },
    mission: { id: command.missionId, cardFactIds },
  }
}
