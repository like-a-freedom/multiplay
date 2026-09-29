import type { ProgressState } from '@/domain/progress/progressState'

/**
 * Port (DIP): progress storage. The implementation lives in
 * infrastructure/storage. One versioned `localStorage` snapshot; corrupt or
 * unknown versions are never silently cleared (PRD §4, "Saving").
 */

export type SaveProgressResult = { ok: true } | { ok: false; reason: 'storage-unavailable' | 'write-failed' }

export type LoadProgressResult =
  | { kind: 'empty' }
  | { kind: 'saved'; state: ProgressState }
  | { kind: 'corrupt' }
  | { kind: 'unknown-version'; version: number }
  | { kind: 'storage-unavailable' }

export interface ProgressStore {
  load(): LoadProgressResult
  /** Writes are atomic: one write per accepted action. */
  save(state: ProgressState): SaveProgressResult
  /** A reset happens only after an explicit confirmation in the UI. */
  reset(): void
}
