import { factFromId } from '@/domain/fact/multiplicationFact'
import { type AttemptOutcome, type ParsedAnswer, parseAnswer } from '@/domain/learning/answer'
import type { CalendarDate } from '@/domain/learning/calendarDate'
import { type MasteryProgress, recordError, recordIndependentSuccess } from '@/domain/learning/mastery'
import {
  type ReviewSchedule,
  scheduleAfterError,
  scheduleAfterFirstSuccess,
  scheduleAfterPlannedSuccess,
  scheduleFromDiagnosticAnswer,
  isDueForReview,
} from '@/domain/learning/reviewSchedule'
import type { FactProgress, ProgressState } from '@/domain/progress/progressState'
import { solutionShownOnDate } from '@/domain/progress/progressState'

/**
 * Use case: one accepted attempt per card. Every accepted attempt is saved
 * immediately (PRD M4); pressing "Check" again after an accepted answer never
 * creates a second attempt (one answer per card, enforced by the UI).
 * The correct product comes from the fact id — callers cannot substitute it.
 */

export interface SubmitCardAnswerCommand {
  readonly factId: string
  readonly date: CalendarDate
  /** `null` for a diagnostic attempt; otherwise the current mission id. */
  readonly missionId: string | null
  /** `null` when "Don't know" was pressed; otherwise the raw input. */
  readonly rawAnswer: string | null
  readonly choseUnknown: boolean
}

export type SubmitCardAnswerResult =
  | { kind: 'invalid-input' }
  | {
      kind: 'accepted'
      readonly outcome: AttemptOutcome
      /** The accepted number; `null` for "Don't know". */
      readonly acceptedValue: number | null
      readonly state: ProgressState
    }

export function submitCardAnswer(
  state: ProgressState,
  command: SubmitCardAnswerCommand,
): SubmitCardAnswerResult {
  const fact = state.facts[command.factId]
  if (fact === undefined) return { kind: 'invalid-input' }

  if (command.choseUnknown) {
    return record(state, fact, command, 'unknown', null)
  }

  const parsed: ParsedAnswer = parseAnswer(command.rawAnswer ?? '')
  if (!parsed.ok) return { kind: 'invalid-input' }

  const product = factFromId(command.factId).product
  const outcome: AttemptOutcome = parsed.value === product ? 'correct' : 'wrong'
  return record(state, fact, command, outcome, parsed.value)
}

function record(
  state: ProgressState,
  fact: FactProgress,
  command: SubmitCardAnswerCommand,
  outcome: AttemptOutcome,
  acceptedValue: number | null,
): SubmitCardAnswerResult {
  const wasIndependent =
    outcome === 'correct' && !solutionShownOnDate(state, command.factId, command.date)

  const updatedFact = updateFactProgress(
    fact,
    outcome,
    wasIndependent,
    command.date,
    command.missionId === null,
  )

  const answeredFactIds =
    state.currentMission !== null && state.currentMission.id === command.missionId
      ? [...state.currentMission.answeredFactIds, command.factId]
      : state.currentMission?.answeredFactIds ?? []

  const currentMission =
    state.currentMission !== null && state.currentMission.id === command.missionId
      ? { ...state.currentMission, answeredFactIds }
      : state.currentMission

  return {
    kind: 'accepted',
    outcome,
    acceptedValue,
    state: {
      ...state,
      facts: { ...state.facts, [command.factId]: updatedFact },
      attempts: [
        ...state.attempts,
        {
          factId: command.factId,
          date: command.date,
          outcome,
          independent: wasIndependent,
          missionId: command.missionId,
        },
      ],
      currentMission,
    },
  }
}

function updateFactProgress(
  fact: FactProgress,
  outcome: AttemptOutcome,
  independent: boolean,
  date: CalendarDate,
  isDiagnostic: boolean,
): FactProgress {
  const base: FactProgress = { ...fact, status: 'familiar', lastAnswerDate: date }

  if (isDiagnostic) {
    // Diagnostics never grant mastery and never start the counter (PRD §3).
    return { ...base, review: scheduleFromDiagnosticAnswer(date, outcome) }
  }

  if (outcome !== 'correct') {
    return applyScheduleAndMastery(base, scheduleAfterError(date), recordError(fact.mastery))
  }

  if (!independent) {
    // A success after a solution shown today does not advance the schedule.
    return base
  }

  const review = nextReviewAfterSuccess(fact.review, date)
  return applyScheduleAndMastery(base, review, recordIndependentSuccess(fact.mastery, date))
}

function nextReviewAfterSuccess(previous: ReviewSchedule | null, date: CalendarDate): ReviewSchedule {
  if (previous === null) return scheduleAfterFirstSuccess(date)
  if (!isDueForReview(previous, date)) return previous // досрочная практика срок не отодвигает
  return scheduleAfterPlannedSuccess(previous, date)
}

function applyScheduleAndMastery(
  fact: FactProgress,
  review: ReviewSchedule,
  mastery: MasteryProgress,
): FactProgress {
  return { ...fact, review, mastery }
}
