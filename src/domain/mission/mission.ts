/**
 * A mission (CONTEXT.md): a short session with a fixed set of cards.
 * The queue is frozen at start (PRD §3).
 */

export type FactPlanningStatus = 'new' | 'due' | 'familiar'

export interface FactCandidate {
  readonly factId: string
  readonly status: FactPlanningStatus
}

export interface MissionPlan {
  readonly id: string
  readonly cardFactIds: readonly string[]
}

export interface MissionState {
  readonly id: string
  readonly cardFactIds: readonly string[]
  readonly answeredFactIds: readonly string[]
}
