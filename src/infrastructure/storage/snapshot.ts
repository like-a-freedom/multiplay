import type { LoadProgressResult } from '@/application/ports/progressStore'
import type { ProgressState } from '@/domain/progress/progressState'
import type { MasteryProgress } from '@/domain/learning/mastery'
import type { ReviewSchedule } from '@/domain/learning/reviewSchedule'
import type { StreakState } from '@/domain/game/streak'

/**
 * Версионированный снимок прогресса (PRD §4 «Сохранение»).
 * Повреждённые или неизвестные версии не очищаются молча: они возвращаются
 * отдельными состояниями для явного сообщения и подтверждаемого сброса.
 */

export const SNAPSHOT_VERSION = 1

export function serializeSnapshot(state: ProgressState): string {
  return JSON.stringify({ version: SNAPSHOT_VERSION, state })
}

export function parseSnapshot(raw: string): LoadProgressResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { kind: 'corrupt' }
  }

  if (typeof parsed !== 'object' || parsed === null) return { kind: 'corrupt' }
  const { version, state } = parsed as { version?: unknown; state?: unknown }

  if (typeof version !== 'number' || !Number.isInteger(version)) return { kind: 'corrupt' }
  if (version !== SNAPSHOT_VERSION) return { kind: 'unknown-version', version }
  if (!isProgressState(state)) return { kind: 'corrupt' }

  // Снимки ранних прототипов не содержат diagnostic — нормализуем в null,
  // иначе экраны падают на undefined (белый экран).
  return { kind: 'saved', state: { ...state, diagnostic: state.diagnostic ?? null } }
}

function isProgressState(value: unknown): value is ProgressState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ProgressState>
  return (
    typeof candidate.facts === 'object' &&
    candidate.facts !== null &&
    Array.isArray(candidate.attempts) &&
    typeof candidate.rewards === 'object' &&
    candidate.rewards !== null &&
    isRewardState(candidate.rewards) &&
    (candidate.mode === 'expedition' || candidate.mode === 'maintenance') &&
    typeof candidate.expeditionFinished === 'boolean' &&
    isDiagnosticState(candidate.diagnostic) &&
    Object.values(candidate.facts).every(isFactProgress)
  )
}

function isDiagnosticState(value: unknown): boolean {
  // Поле добавлено после первого прототипа; старые снимки нормализуются в null.
  if (value === null || value === undefined) return true
  const candidate = value as Partial<ProgressState['diagnostic']> & { factIds?: unknown }
  return (
    Array.isArray(candidate.factIds) &&
    typeof candidate.skipped === 'boolean' &&
    typeof candidate.completed === 'boolean'
  )
}

function isRewardState(value: unknown): boolean {
  const candidate = value as Partial<ProgressState['rewards']>
  return (
    typeof candidate.totalXp === 'number' &&
    Array.isArray(candidate.completions) &&
    typeof candidate.streak === 'object' &&
    candidate.streak !== null &&
    isStreakState(candidate.streak)
  )
}

function isStreakState(value: unknown): value is StreakState {
  const candidate = value as Partial<StreakState>
  return (
    typeof candidate.days === 'number' &&
    typeof candidate.bestDays === 'number' &&
    (candidate.lastRewardedDate === null || typeof candidate.lastRewardedDate === 'string') &&
    Array.isArray(candidate.earnedMilestoneDays)
  )
}

function isFactProgress(value: unknown): value is ProgressState['facts'][string] {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ProgressState['facts'][string]>
  return (
    typeof candidate.factId === 'string' &&
    (candidate.status === 'new' || candidate.status === 'familiar') &&
    (candidate.review === null || isReviewSchedule(candidate.review)) &&
    isMasteryProgress(candidate.mastery)
  )
}

function isReviewSchedule(value: unknown): value is ReviewSchedule {
  const candidate = value as Partial<ReviewSchedule>
  return typeof candidate.completedSuccesses === 'number' && typeof candidate.nextReviewDate === 'string'
}

function isMasteryProgress(value: unknown): value is MasteryProgress {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<MasteryProgress>
  return (
    Array.isArray(candidate.independentSuccessDates) &&
    typeof candidate.hasStar === 'boolean' &&
    typeof candidate.needsReview === 'boolean'
  )
}
