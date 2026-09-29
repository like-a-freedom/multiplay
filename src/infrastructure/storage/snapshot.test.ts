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

  it('reports unknown versions instead of silently clearing them', () => {
    const result = parseSnapshot(JSON.stringify({ version: SNAPSHOT_VERSION + 1, state: {} }))
    expect(result).toEqual({ kind: 'unknown-version', version: SNAPSHOT_VERSION + 1 })
  })
})
