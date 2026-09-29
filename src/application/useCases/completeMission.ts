import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { MissionRewardOutcome } from '@/domain/progress/rewards'
import { applyMissionRewards } from '@/domain/progress/rewards'
import type { ProgressState } from '@/domain/progress/progressState'

/**
 * Use case: завершение миссии одним обновлением с ID миссии (PRD M4).
 * Начисления идемпотентны, переход в поддерживающий режим сохраняется
 * вместе с завершением миссии (PRD M7).
 */

export interface CompleteMissionCommand {
  readonly missionId: string
  readonly date: CalendarDate
}

export function completeMission(
  state: ProgressState,
  command: CompleteMissionCommand,
): MissionRewardOutcome {
  return applyMissionRewards(state, command.missionId, command.date)
}
