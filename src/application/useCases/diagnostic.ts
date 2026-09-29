import type { AttemptOutcome } from '@/domain/learning/answer'
import { explanationFor } from '@/domain/learning/explanation'
import { factFromId, type MultiplicationFact } from '@/domain/fact/multiplicationFact'
import { pickDiagnosticFacts, DIAGNOSTIC_SIZE } from '@/domain/mission/composeDiagnostic'
import { allFacts } from '@/domain/fact/multiplicationFact'
import type { DiagnosticState, ProgressState } from '@/domain/progress/progressState'

/**
 * Use cases диагностики (PRD §3 «Диагностика»): без таймера, без XP и серии,
 * без присвоения освоения. Ответы и подсказки показываются после проверки.
 * Сохранённый набор повторяется для проверки удержания (PRD §5).
 */

export function startDiagnostic(
  state: ProgressState,
  random: () => number = Math.random,
): ProgressState {
  if (state.diagnostic != null) return state
  const diagnostic: DiagnosticState = {
    factIds: pickDiagnosticFacts(allFacts(), random).map((fact) => fact.id),
    skipped: false,
    completed: false,
  }
  return { ...state, diagnostic }
}

export function skipDiagnostic(state: ProgressState): ProgressState {
  return withDiagnostic(state, { skipped: true, completed: false })
}

export function finishDiagnostic(state: ProgressState): ProgressState {
  return withDiagnostic(state, { skipped: false, completed: true })
}

export interface DiagnosticCard {
  readonly fact: MultiplicationFact
  readonly expression: string
  readonly explanation: string
  /** `null` — попытка ещё не сделана. */
  readonly outcome: AttemptOutcome | null
}

/** Материал проверки: набор по порядку; `resume` пропускает уже отвечённые факты. */
export function diagnosticCards(
  state: ProgressState,
  resume: boolean,
): readonly DiagnosticCard[] {
  const factIds = state.diagnostic?.factIds ?? []
  return factIds
    .map((factId) => {
      const fact = factFromId(factId)
      const attempts = state.attempts.filter((a) => a.factId === factId && a.missionId === null)
      const last = attempts[attempts.length - 1]
      return {
        fact,
        expression: `${fact.factors[0]} × ${fact.factors[1]} = ?`,
        explanation: explanationFor(fact),
        outcome: last?.outcome ?? null,
        answered: attempts.length > 0,
      }
    })
    .filter((card) => !resume || !card.answered)
    .slice(0, DIAGNOSTIC_SIZE)
}

function withDiagnostic(
  state: ProgressState,
  patch: Pick<DiagnosticState, 'skipped' | 'completed'>,
): ProgressState {
  if (state.diagnostic === null) return state
  return { ...state, diagnostic: { ...state.diagnostic, ...patch } }
}
