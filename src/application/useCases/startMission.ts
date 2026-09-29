import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { FactCandidate, MissionPlan } from '@/domain/mission/mission'
import { composeMission, composePractice, composeReview } from '@/domain/mission/composeMission'
import type { ProgressState } from '@/domain/progress/progressState'
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

export function startMission(
  state: ProgressState,
  command: StartMissionCommand,
): StartMissionResult {
  const candidates: FactCandidate[] = Object.values(state.facts).map((fact) => ({
    factId: fact.factId,
    status: planningStatus(fact, command.date),
  }))
  const cards =
    command.kind === 'practice'
      ? composePractice(candidates, command.random)
      : command.kind === 'review'
        ? composeReview(candidates)
        : composeMission(candidates)
  const cardFactIds = cards.map((card) => card.factId)

  return {
    state: {
      ...state,
      currentMission: { id: command.missionId, cardFactIds, answeredFactIds: [] },
    },
    mission: { id: command.missionId, cardFactIds },
  }
}
