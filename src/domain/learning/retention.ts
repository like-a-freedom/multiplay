import type { CalendarDate } from '@/domain/learning/calendarDate'
import { calendarDayDiff } from '@/domain/learning/calendarDate'
import type { AttemptRecord } from '@/domain/progress/progressState'

/**
 * Показатель удержания (PRD §5): доля правильных первых ответов среди
 * проверенных фактов, не показывавшихся последние ≥7 календарных дней.
 * Всегда с числителем и знаменателем; при пустой выборке — «Пока нет данных».
 */

export interface RetentionSummary {
  /** Проверок после перерыва ≥7 дней (знаменатель). */
  readonly checked: number
  /** Среди них верный первый ответ (числитель). */
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

/** Все появления факта по дням: первая попытка дня — «первый ответ без подсказки». */
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
