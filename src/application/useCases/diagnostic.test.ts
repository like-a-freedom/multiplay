import { describe, expect, it } from 'vitest'

import {
  diagnosticCards,
  finishDiagnostic,
  skipDiagnostic,
  startDiagnostic,
} from '@/application/useCases/diagnostic'
import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import { createProgressState } from '@/domain/progress/progressState'

function fixedRandom(): number {
  return 0.42
}

describe('diagnostic use cases', () => {
  it('saves the diagnostic set once and reuses it', () => {
    const state = startDiagnostic(createProgressState(), fixedRandom)
    const again = startDiagnostic(state, fixedRandom)
    expect(again).toBe(state)
    expect(state.diagnostic?.factIds).toHaveLength(10)
  })

  it('skip and finish only flip flags on the saved set', () => {
    const state = startDiagnostic(createProgressState(), fixedRandom)
    const skipped = skipDiagnostic(state)
    expect(skipped.diagnostic?.skipped).toBe(true)
    expect(skipped.diagnostic?.factIds).toEqual(state.diagnostic?.factIds)

    const finished = finishDiagnostic(state)
    expect(finished.diagnostic?.completed).toBe(true)
  })

  it('defers answers: outcomes appear only after the check', () => {
    let state = startDiagnostic(createProgressState(), fixedRandom)
    const factId = state.diagnostic!.factIds[0]

    const before = diagnosticCards(state, false)
    expect(before[0].outcome).toBeNull()

    const result = submitCardAnswer(
      state,
      { factId, date: '2026-01-01', missionId: null, rawAnswer: null, choseUnknown: true },
      0,
    )
    if (result.kind !== 'accepted') throw new Error('expected accepted attempt')
    state = finishDiagnostic(result.state)

    const after = diagnosticCards(state, false)
    expect(after[0].outcome).toBe('unknown')
    // resume-режим показывает только неотвеченные
    expect(diagnosticCards(state, true)).toHaveLength(9)
  })
})
