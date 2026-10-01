import { describe, expect, it } from 'vitest'

import { SNAPSHOT_VERSION, parseSnapshot, serializeSnapshot } from '@/infrastructure/storage/snapshot'
import { createProgressState } from '@/domain/progress/progressState'

describe('progress snapshot', () => {
  it('round-trips the versioned snapshot', () => {
    const state = createProgressState()
    const result = parseSnapshot(serializeSnapshot(state))
    expect(result.kind).toBe('saved')
    if (result.kind === 'saved') {
      expect(Object.keys(result.state.facts)).toHaveLength(66)
    }
  })

  it('reports corrupt data instead of silently clearing it', () => {
    expect(parseSnapshot('not json').kind).toBe('corrupt')
    expect(parseSnapshot('{"version":"x"}').kind).toBe('corrupt')
    expect(parseSnapshot(JSON.stringify({ version: SNAPSHOT_VERSION, state: {} })).kind).toBe('corrupt')
  })

  it('preserves eligibility flags and historical XP without a migration', () => {
    const initial = createProgressState()
    const state = { ...initial, rewards: { ...initial.rewards, totalXp: 10, completions: [
      { missionId: 'historical', date: '2026-01-01' as const },
      { missionId: 'hints-only', date: '2026-01-01' as const, xpEligible: false },
      { missionId: 'entered', date: '2026-01-02' as const, xpEligible: true },
    ] } }
    const result = parseSnapshot(serializeSnapshot(state))
    expect(result.kind).toBe('saved')
    if (result.kind === 'saved') expect(result.state.rewards).toEqual(state.rewards)
  })

  it('normalizes early snapshots without the diagnostic field instead of crashing', () => {
    const legacy = JSON.parse(serializeSnapshot(createProgressState()))
    delete legacy.state.diagnostic
    const result = parseSnapshot(JSON.stringify(legacy))
    expect(result.kind).toBe('saved')
    if (result.kind === 'saved') expect(result.state.diagnostic).toBeNull()
  })

  it('reports unknown versions instead of silently clearing them', () => {
    const result = parseSnapshot(JSON.stringify({ version: SNAPSHOT_VERSION + 1, state: {} }))
    expect(result).toEqual({ kind: 'unknown-version', version: SNAPSHOT_VERSION + 1 })
  })
})
