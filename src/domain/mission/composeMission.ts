import { factFromId, isSimpleFact } from '@/domain/fact/multiplicationFact'
import type { CalendarDate } from '@/domain/learning/calendarDate'
import type { FactCandidate } from '@/domain/mission/mission'
import { shuffle } from '@/domain/mission/shuffle'

/**
 * Mission composition (PRD §3): up to 10 distinct facts — two slots reserved
 * for new facts (while any remain), then due reviews, then familiar practice.
 * Fewer than two new facts releases their slots to reviews; with few known
 * facts the mission is shorter.
 */

export const MISSION_CARD_LIMIT = 10
export const NEW_FACT_SLOTS = 2
export const RULE_FACT_TARGET = 2

interface MissionOptions {
  readonly date: CalendarDate
  readonly random?: () => number
}

/** Facts containing 0 or 1 are rule facts for the variety preference. */
function isRuleFact(candidate: FactCandidate): boolean {
  return factFromId(candidate.factId).factors[0] <= 1
}

function sharesFactor(a: FactCandidate, b: FactCandidate): boolean {
  const factorsA = factFromId(a.factId).factors
  const factorsB = factFromId(b.factId).factors
  return factorsA.some((factor) => factorsB.includes(factor))
}

function compareNullableDate(a: CalendarDate | null, b: CalendarDate | null): number {
  if (a === null) return b === null ? 0 : 1
  if (b === null) return -1
  return a.localeCompare(b)
}

/** A missing legacy answer date means unknown recency, not a recent answer. */
function compareLastAnswerDate(a: CalendarDate | null, b: CalendarDate | null): number {
  if (a === null) return b === null ? 0 : -1
  if (b === null) return 1
  return a.localeCompare(b)
}

/** Unseen/unknown recency comes first; otherwise the earliest attempt is oldest. */
function compareRecency(a: FactCandidate, b: FactCandidate): number {
  if (a.lastAttemptIndex === null && b.lastAttemptIndex !== null) return -1
  if (a.lastAttemptIndex !== null && b.lastAttemptIndex === null) return 1
  if (a.lastAttemptIndex !== null && b.lastAttemptIndex !== null) {
    return a.lastAttemptIndex - b.lastAttemptIndex
  }
  return compareLastAnswerDate(a.lastAnswerDate, b.lastAnswerDate)
}

function compareFactId(a: FactCandidate, b: FactCandidate): number {
  const aFactors = factFromId(a.factId).factors
  const bFactors = factFromId(b.factId).factors
  return aFactors[0] - bFactors[0] || aFactors[1] - bFactors[1]
}

function pickRandom<T>(items: readonly T[], random: () => number): T {
  const [picked] = shuffle(items, random)
  if (picked === undefined) throw new Error('cannot pick from an empty collection')
  return picked
}

function calendarReviewIsDue(candidate: FactCandidate, date: CalendarDate): boolean {
  return candidate.nextReviewDate !== null && candidate.nextReviewDate <= date
}

function reviewPriority(candidate: FactCandidate, date: CalendarDate): number {
  const dateIsDue = calendarReviewIsDue(candidate, date)
  const answeredToday = candidate.lastAttemptDate === date
  if (dateIsDue && !answeredToday) return 0
  if (candidate.lastAttemptOutcome === 'wrong' || candidate.lastAttemptOutcome === 'unknown') return 1
  if (dateIsDue) return 2
  return 3
}

function compareReviewPriority(a: FactCandidate, b: FactCandidate, date: CalendarDate): number {
  return (
    reviewPriority(a, date) - reviewPriority(b, date) ||
    compareNullableDate(a.nextReviewDate, b.nextReviewDate) ||
    compareRecency(a, b)
  )
}

/**
 * Sort by urgency and age; randomize only candidates tied on those meaningful
 * priorities. Sorting by the canonical fact id before shuffling makes the
 * injected random stream independent of record insertion order.
 */
function rankReviews(
  candidates: readonly FactCandidate[],
  date: CalendarDate,
  random: () => number,
): FactCandidate[] {
  const sorted = [...candidates].sort(
    (a, b) => compareReviewPriority(a, b, date) || compareFactId(a, b),
  )
  const ranked: FactCandidate[] = []

  for (let start = 0; start < sorted.length;) {
    let end = start + 1
    while (
      end < sorted.length &&
      compareReviewPriority(sorted[start], sorted[end], date) === 0
    ) {
      end += 1
    }
    ranked.push(...shuffle(sorted.slice(start, end), random))
    start = end
  }
  return ranked
}

function pickNewFacts(
  candidates: readonly FactCandidate[],
  slots: number,
  currentRuleCount: number,
  random: () => number,
): FactCandidate[] {
  if (slots === 0) return []

  const remaining = [...candidates]
  const picked: FactCandidate[] = []
  let ruleCount = currentRuleCount

  const takeFrom = (group: readonly FactCandidate[]): FactCandidate | undefined => {
    let choices = group.filter((candidate) => !picked.includes(candidate))
    if (choices.length === 0) return undefined

    if (ruleCount >= RULE_FACT_TARGET) {
      const nonRuleChoices = choices.filter((candidate) => !isRuleFact(candidate))
      if (nonRuleChoices.length > 0) choices = nonRuleChoices
    }

    const first = picked[0]
    if (first !== undefined) {
      const differentFactorChoices = choices.filter((candidate) => !sharesFactor(candidate, first))
      if (differentFactorChoices.length > 0) choices = differentFactorChoices
    }

    const canonicalChoices = [...choices].sort(compareFactId)
    return pickRandom(canonicalChoices, random)
  }

  const simple = remaining.filter((candidate) => isSimpleFact(factFromId(candidate.factId)))
  const hard = remaining.filter((candidate) => !isSimpleFact(factFromId(candidate.factId)))

  if (slots >= 2 && simple.length > 0 && hard.length > 0) {
    const simpleFact = takeFrom(simple)
    if (simpleFact !== undefined) {
      picked.push(simpleFact)
      if (isRuleFact(simpleFact)) ruleCount += 1
    }
    const hardFact = takeFrom(hard)
    if (hardFact !== undefined) picked.push(hardFact)
    return picked
  }

  const singleGroup =
    simple.length === 0 ? hard : hard.length === 0 ? simple : remaining
  while (picked.length < slots) {
    const fact = takeFrom(singleGroup)
    if (fact === undefined) break
    picked.push(fact)
    if (isRuleFact(fact)) ruleCount += 1
  }
  return picked
}

function fillFamiliar(
  candidates: readonly FactCandidate[],
  slots: number,
  initialRuleCount: number,
  random: () => number,
): FactCandidate[] {
  const sorted = [...candidates].sort(
    (a, b) => compareRecency(a, b) || compareFactId(a, b),
  )
  const ranked: FactCandidate[] = []
  for (let start = 0; start < sorted.length;) {
    let end = start + 1
    while (end < sorted.length && compareRecency(sorted[start], sorted[end]) === 0) end += 1
    ranked.push(...shuffle(sorted.slice(start, end), random))
    start = end
  }

  const picked: FactCandidate[] = []
  const deferredRules: FactCandidate[] = []
  let ruleCount = initialRuleCount
  let nonRulesRemaining = ranked.filter((candidate) => !isRuleFact(candidate)).length

  for (const candidate of ranked) {
    if (picked.length >= slots) break
    if (isRuleFact(candidate)) {
      if (ruleCount >= RULE_FACT_TARGET && nonRulesRemaining > 0) {
        deferredRules.push(candidate)
        continue
      }
      ruleCount += 1
    } else {
      nonRulesRemaining -= 1
    }
    picked.push(candidate)
  }

  for (const candidate of deferredRules) {
    if (picked.length >= slots) break
    picked.push(candidate)
  }
  return picked
}

export function composeMission(
  candidates: readonly FactCandidate[],
  { date, random = Math.random }: MissionOptions,
): readonly FactCandidate[] {
  const news = candidates.filter((candidate) => candidate.status === 'new')
  const due = candidates.filter((candidate) => candidate.status === 'due')
  const familiar = candidates.filter((candidate) => candidate.status === 'familiar')
  const newSlots = Math.min(NEW_FACT_SLOTS, news.length)
  const selectedReviews = rankReviews(due, date, random).slice(0, MISSION_CARD_LIMIT - newSlots)
  const existingRuleCount = selectedReviews.filter(isRuleFact).length
  const selectedNew = pickNewFacts(news, newSlots, existingRuleCount, random)
  const selected = [...selectedNew, ...selectedReviews]
  const familiarSlots = MISSION_CARD_LIMIT - selected.length
  const familiarFacts =
    familiarSlots > 0
      ? fillFamiliar(
          familiar,
          familiarSlots,
          selected.filter(isRuleFact).length,
          random,
        )
      : []

  return shuffle([...selected, ...familiarFacts], random)
}

/**
 * Free practice (PRD §3, maintenance mode): familiar facts outside their
 * review date — early practice that never advances a step or postpones a
 * date (that rule lives in `submitCardAnswer`).
 */
export function composePractice(
  candidates: readonly FactCandidate[],
  random: () => number = Math.random,
): readonly FactCandidate[] {
  const familiar = candidates.filter((candidate) => candidate.status === 'familiar')
  return shuffle(familiar, random).slice(0, MISSION_CARD_LIMIT)
}

/**
 * A review session (the "due for review" mark, CONTEXT.md): only facts with a
 * past error or a reached review date — straight to work, no new facts.
 */
export function composeReview(
  candidates: readonly FactCandidate[],
  { date, random = Math.random }: MissionOptions,
): readonly FactCandidate[] {
  const due = candidates.filter((candidate) => candidate.status === 'due')
  return shuffle(rankReviews(due, date, random).slice(0, MISSION_CARD_LIMIT), random)
}
