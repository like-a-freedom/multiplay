import { describe, expect, it } from 'vitest'

import { allFacts, factFromId } from '@/domain/fact/multiplicationFact'
import { composeMission, composePractice, composeReview } from '@/domain/mission/composeMission'
import type { FactCandidate } from '@/domain/mission/mission'

const DATE = '2026-01-01'
const random = () => 0.42

function candidate(
  factId: string,
  status: FactCandidate['status'],
  extra: Partial<FactCandidate> = {},
): FactCandidate {
  return {
    factId,
    status,
    nextReviewDate: status === 'due' ? '2025-12-01' : null,
    needsReview: false,
    lastAttemptIndex: null,
    lastAttemptDate: null,
    lastAttemptOutcome: null,
    lastAnswerDate: null,
    ...extra,
  }
}

function ruleFactCount(factIds: readonly string[]): number {
  return factIds.filter((id) => factFromId(id).factors[0] <= 1).length
}

describe('composeMission', () => {
  it('introduces one simple and one hard fact when both groups are available', () => {
    const cards = composeMission(
      [candidate('2:3', 'new'), candidate('7:8', 'new')],
      { date: DATE, random },
    )
    const simpleCount = cards.filter((card) => {
      const [a, b] = factFromId(card.factId).factors
      return [0, 1, 2, 5, 10].includes(a) || [0, 1, 2, 5, 10].includes(b)
    }).length

    expect(cards).toHaveLength(2)
    expect(new Set(cards.map((card) => card.factId)).size).toBe(2)
    expect(simpleCount).toBe(1)
  })

  it('fills a mission with reviews before familiar practice and keeps the ten-card limit', () => {
    const newFact = candidate('2:3', 'new')
    const due = allFacts()
      .filter((fact) => fact.id !== newFact.factId)
      .slice(0, 12)
      .map((fact) => candidate(fact.id, 'due'))
    const cards = composeMission([newFact, ...due], { date: DATE, random })

    expect(cards).toHaveLength(10)
    expect(cards.filter((card) => card.status === 'new')).toHaveLength(1)
    expect(cards.filter((card) => card.status === 'due')).toHaveLength(9)
    expect(cards.every((card) => card.status !== 'familiar')).toBe(true)
  })

  it('uses freed new slots for reviews and stays short when known facts are scarce', () => {
    const cards = composeMission(
      [candidate('2:3', 'new'), candidate('4:5', 'due')],
      { date: DATE, random },
    )
    expect(new Set(cards.map((card) => card.factId))).toEqual(new Set(['2:3', '4:5']))
  })

  it('caps familiar rule facts softly when alternatives exist', () => {
    const facts = allFacts().map((fact, index) =>
      candidate(fact.id, 'familiar', { lastAttemptIndex: index, lastAttemptDate: '2025-12-31' }),
    )
    const cards = composeMission(facts, { date: DATE, random })

    expect(cards).toHaveLength(10)
    expect(ruleFactCount(cards.map((card) => card.factId))).toBeLessThanOrEqual(2)
  })

  it('keeps a full mission when only rule facts are available', () => {
    const rules = allFacts()
      .filter((fact) => fact.factors[0] <= 1)
      .map((fact, index) => candidate(fact.id, 'familiar', { lastAttemptIndex: index }))
    const cards = composeMission(rules, { date: DATE, random })

    expect(cards).toHaveLength(10)
    expect(ruleFactCount(cards.map((card) => card.factId))).toBe(10)
  })

  it('prefers a new fact that shares no factor with the other new fact when possible', () => {
    const cards = composeMission(
      [candidate('5:7', 'new'), candidate('7:8', 'new'), candidate('3:4', 'new')],
      { date: DATE, random },
    )
    const [first, second] = cards.map((card) => factFromId(card.factId).factors)
    expect(first.some((factor) => second.includes(factor))).toBe(false)
  })
})

describe('composeReview', () => {
  it('selects only due facts and caps the review session at ten', () => {
    const due = allFacts().slice(0, 12).map((fact) => candidate(fact.id, 'due'))
    const cards = composeReview(
      [candidate('2:3', 'new'), ...due, candidate('3:4', 'familiar')],
      { date: DATE, random },
    )

    expect(cards).toHaveLength(10)
    expect(cards.every((card) => card.status === 'due')).toBe(true)
    expect(cards.map((card) => card.factId)).not.toContain('2:3')
    expect(cards.map((card) => card.factId)).not.toContain('3:4')
  })

  it('does not let early error retries displace calendar-due facts when the session is full', () => {
    const overdue = allFacts().slice(0, 10).map((fact) =>
      candidate(fact.id, 'due', { nextReviewDate: '2025-12-01' }),
    )
    const retry = candidate('10:10', 'due', {
      nextReviewDate: '2026-02-01',
      needsReview: true,
      lastAttemptIndex: 5,
      lastAttemptDate: DATE,
      lastAttemptOutcome: 'wrong',
    })
    const cards = composeReview([...overdue, retry], { date: DATE, random })

    expect(new Set(cards.map((card) => card.factId))).toEqual(
      new Set(overdue.map((card) => card.factId)),
    )
  })

  it('serves the oldest calendar dates first when more than ten reviews are due', () => {
    const oldest = allFacts().slice(0, 10).map((fact) =>
      candidate(fact.id, 'due', { nextReviewDate: '2025-11-01' }),
    )
    const recentlyDue = candidate('10:10', 'due', { nextReviewDate: '2025-12-31' })
    const cards = composeReview([...oldest, recentlyDue], { date: DATE, random })

    expect(new Set(cards.map((card) => card.factId))).toEqual(
      new Set(oldest.map((card) => card.factId)),
    )
  })

  it('does not let an error retry from today displace untouched calendar-due facts', () => {
    const overdue = allFacts().slice(0, 10).map((fact) =>
      candidate(fact.id, 'due', { nextReviewDate: '2025-12-01' }),
    )
    const sameDayRetry = candidate('10:10', 'due', {
      nextReviewDate: DATE,
      needsReview: true,
      lastAttemptIndex: 10,
      lastAttemptDate: DATE,
      lastAttemptOutcome: 'unknown',
    })
    const cards = composeReview([...overdue, sameDayRetry], { date: DATE, random })

    expect(new Set(cards.map((card) => card.factId))).toEqual(
      new Set(overdue.map((card) => card.factId)),
    )
  })
})

describe('composePractice', () => {
  it('takes only familiar facts and caps at ten', () => {
    const candidates = [
      candidate('2:3', 'new'),
      candidate('3:4', 'due'),
      candidate('4:5', 'familiar'),
      candidate('5:6', 'familiar'),
    ]
    const cards = composePractice(candidates, random)

    expect(cards.map((card) => card.factId).sort()).toEqual(['4:5', '5:6'])
  })

  it('varies the order and sample with the random source', () => {
    const familiar = allFacts()
      .filter((fact) => fact.factors[0] > 0)
      .map((fact) => candidate(fact.id, 'familiar'))
    const first = composePractice(familiar, () => 0.1).map((card) => card.factId)
    const second = composePractice(familiar, () => 0.9).map((card) => card.factId)

    expect(first).toHaveLength(10)
    expect(second).toHaveLength(10)
    expect(first).not.toEqual(second)
  })
})
