import type { LoadProgressResult, ProgressStore, SaveProgressResult } from '@/application/ports/progressStore'
import type { ProgressState } from '@/domain/progress/progressState'
import { parseSnapshot, serializeSnapshot } from '@/infrastructure/storage/snapshot'

/** The minimal storage contract (DIP): `localStorage` or a test double. */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const PROGRESS_STORAGE_KEY = 'math-expedition:progress'

export class LocalStorageProgressStore implements ProgressStore {
  constructor(private readonly storage: KeyValueStorage) {}

  load(): LoadProgressResult {
    let raw: string | null
    try {
      raw = this.storage.getItem(PROGRESS_STORAGE_KEY)
    } catch {
      return { kind: 'storage-unavailable' }
    }
    if (raw === null) return { kind: 'empty' }
    return parseSnapshot(raw)
  }

  save(state: ProgressState): SaveProgressResult {
    try {
      this.storage.setItem(PROGRESS_STORAGE_KEY, serializeSnapshot(state))
      return { ok: true }
    } catch {
      // A failed write must never be reported as a successful save (PRD M6).
      return { ok: false, reason: 'write-failed' }
    }
  }

  reset(): void {
    try {
      this.storage.removeItem(PROGRESS_STORAGE_KEY)
    } catch {
      // A reset is an explicit user action; an access failure was already
      // surfaced as "progress is not being saved".
    }
  }
}
