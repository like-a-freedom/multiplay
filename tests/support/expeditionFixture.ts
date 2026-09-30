import { allFacts } from '@/domain/fact/multiplicationFact'
import type { FactProgress, ProgressState } from '@/domain/progress/progressState'
import { createProgressState } from '@/domain/progress/progressState'
import { createMasteryProgress } from '@/domain/learning/mastery'

/** A one-card mission that can earn the expedition's final mastery star. */
export function createLastStarExpeditionState(): ProgressState {
  const base = createProgressState()
  const lastFactId = allFacts().at(-1)!.id
  const facts: Record<string, FactProgress> = {}

  for (const fact of allFacts()) {
    const mastery = fact.id === lastFactId
      ? { ...createMasteryProgress(), independentSuccessDates: ['2020-01-01' as const] }
      : { ...createMasteryProgress(), hasStar: true }
    facts[fact.id] = {
      ...base.facts[fact.id],
      status: 'familiar',
      review: { completedSuccesses: 0, nextReviewDate: '2099-01-01' },
      mastery,
    }
  }

  return {
    ...base,
    facts,
    currentMission: { id: 'last-expedition-star', cardFactIds: [lastFactId], answeredFactIds: [] },
    mode: 'expedition',
    expeditionFinished: false,
    diagnostic: { factIds: [], skipped: true, completed: true },
  }
}
