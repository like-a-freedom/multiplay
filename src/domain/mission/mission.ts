/**
 * Миссия (CONTEXT.md): короткое занятие с определённым набором карточек.
 * Очередь фиксируется при старте (PRD §3 «Состав миссии»).
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
