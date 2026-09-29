import { describe, expect, it } from 'vitest'

import {
  LocalStorageProgressStore,
  PROGRESS_STORAGE_KEY,
  type KeyValueStorage,
} from '@/infrastructure/storage/localStorageProgressStore'
import { createProgressState } from '@/domain/progress/progressState'

function fakeStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

describe('LocalStorageProgressStore', () => {
  it('returns empty when nothing is saved yet', () => {
    expect(new LocalStorageProgressStore(fakeStorage()).load()).toEqual({ kind: 'empty' })
  })

  it('saves and loads the progress state', () => {
    const storage = fakeStorage()
    const store = new LocalStorageProgressStore(storage)
    const state = createProgressState()

    expect(store.save(state)).toEqual({ ok: true })
    expect(storage.data.has(PROGRESS_STORAGE_KEY)).toBe(true)

    const loaded = store.load()
    expect(loaded.kind).toBe('saved')
  })

  it('reports a failed write instead of claiming success', () => {
    const failing: KeyValueStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    expect(new LocalStorageProgressStore(failing).save(createProgressState())).toEqual({
      ok: false,
      reason: 'write-failed',
    })
  })

  it('reports unavailable storage instead of claiming success', () => {
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
      removeItem: () => {
        throw new Error('SecurityError')
      },
    }
    const store = new LocalStorageProgressStore(broken)
    expect(store.load()).toEqual({ kind: 'storage-unavailable' })
    expect(store.save(createProgressState())).toEqual({ ok: false, reason: 'write-failed' })
  })

  it('clears the record only on explicit reset', () => {
    const storage = fakeStorage()
    const store = new LocalStorageProgressStore(storage)
    store.save(createProgressState())
    store.reset()
    expect(store.load()).toEqual({ kind: 'empty' })
  })
})
