import type { ProgressState } from '@/domain/progress/progressState'

/**
 * Port (DIP): хранилище прогресса. Реализация — в infrastructure/storage.
 * Один версионированный снимок `localStorage`; повреждённые или неизвестные
 * версии не очищаются молча (PRD §4 «Сохранение»).
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
  /** Сохранение атомарно: одна запись на принятое действие. */
  save(state: ProgressState): SaveProgressResult
  /** Сброс — только после явного подтверждения (UI). */
  reset(): void
}
