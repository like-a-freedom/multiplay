import type { CalendarDate } from '@/domain/learning/calendarDate'
import { calendarDayDiff } from '@/domain/learning/calendarDate'
import type { AttemptRecord } from '@/domain/progress/progressState'

/**
 * Retention metric (PRD §5): share of correct first answers among checked
 * facts that have not been shown for at least 7 calendar days. Always carries
 * a numerator and a denominator; "no data yet" for an empty sample.
 */

export interface RetentionSummary {
  /** Checks after a gap of at least 7 days (denominator). */
  readonly checked: number
  /** Correct first answers among them (numerator). */
  readonly correct: number
}

interface DayCluster {
  readonly date: CalendarDate
  readonly firstOutcome: AttemptRecord['outcome']
}

export function retentionSummary(attempts: readonly AttemptRecord[]): RetentionSummary {
  let checked = 0
  let correct = 0

  for (const clusters of clustersByFact(attempts).values()) {
    for (let i = 1; i < clusters.length; i += 1) {
      const gap = calendarDayDiff(clusters[i - 1].date, clusters[i].date)
      if (gap < 7) continue
      checked += 1
      if (clusters[i].firstOutcome === 'correct') correct += 1
    }
  }

  return { checked, correct }
}

/** One cluster per fact per day: the day's first attempt is the "first answer without a hint". */
function clustersByFact(attempts: readonly AttemptRecord[]): Map<string, DayCluster[]> {
  const byFact = new Map<string, Map<CalendarDate, AttemptRecord['outcome']>>()
  for (const attempt of attempts) {
    const byDate = byFact.get(attempt.factId) ?? new Map<CalendarDate, AttemptRecord['outcome']>()
    if (!byDate.has(attempt.date)) byDate.set(attempt.date, attempt.outcome)
    byFact.set(attempt.factId, byDate)
  }

  const clustered = new Map<string, DayCluster[]>()
  for (const [factId, byDate] of byFact) {
    clustered.set(
      factId,
      [...byDate.entries()]
        .map(([date, firstOutcome]) => ({ date, firstOutcome }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    )
  }
  return clustered
}
