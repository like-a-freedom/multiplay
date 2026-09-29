import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { MissionRewardOutcome } from '@/domain/progress/rewards'
import { applyMissionRewards } from '@/domain/progress/rewards'
import type { ProgressState } from '@/domain/progress/progressState'

/**
 * Use case: finish a mission in a single update carrying its mission id
 * (PRD M4). Rewards are idempotent; the move to maintenance mode is saved
 * with the completion (PRD M7).
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
