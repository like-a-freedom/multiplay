import { describe, expect, it } from 'vitest'

import { composeMission, composePractice, composeReview } from '@/domain/mission/composeMission'
import type { FactCandidate } from '@/domain/mission/mission'

const candidate = (factId: string, status: FactCandidate['status']): FactCandidate => ({ factId, status })

describe('composeMission', () => {
  it('reserves two slots for new facts, then due reviews, then familiar practice', () => {
    const cards = composeMission([
      candidate('f1', 'familiar'),
      candidate('n1', 'new'),
      candidate('d1', 'due'),
      candidate('n2', 'new'),
      candidate('n3', 'new'),
      candidate('d2', 'due'),
      candidate('f2', 'familiar'),
    ])
    expect(cards.map((c) => c.factId)).toEqual(['n1', 'n2', 'd1', 'd2', 'f1', 'f2'])
  })

  it('gives freed new slots to reviews and caps the mission at 10 cards', () => {
    const due = Array.from({ length: 12 }, (_, i) => candidate(`d${i}`, 'due'))
    const cards = composeMission([candidate('n1', 'new'), ...due])
    expect(cards).toHaveLength(10)
    expect(cards[0].factId).toBe('n1')
  })

  it('makes the mission shorter when familiar facts are scarce', () => {
    const cards = composeMission([candidate('n1', 'new'), candidate('d1', 'due')])
    expect(cards).toHaveLength(2)
  })
})

describe('composeReview', () => {
  it('takes only facts marked «Пора повторить» and caps at 10', () => {
    const due = Array.from({ length: 12 }, (_, i) => candidate(`d${i}`, 'due'))
    const cards = composeReview([
      candidate('n1', 'new'),
      ...due,
      candidate('f1', 'familiar'),
    ])
    expect(cards).toHaveLength(10)
    expect(cards.every((c) => c.status === 'due')).toBe(true)
    expect(cards.map((c) => c.factId)).not.toContain('n1')
    expect(cards.map((c) => c.factId)).not.toContain('f1')
  })
})

describe('composePractice', () => {
  it('takes only familiar facts: new and due go to planned missions', () => {
    const cards = composePractice(
      [candidate('n1', 'new'), candidate('d1', 'due'), candidate('f1', 'familiar'), candidate('f2', 'familiar')],
      () => 0.5,
    )
    expect(cards.map((c) => c.factId).sort()).toEqual(['f1', 'f2'])
  })

  it('caps practice at 10 cards and varies the order with the random source', () => {
    const familiar = Array.from({ length: 15 }, (_, i) => candidate(`f${i}`, 'familiar'))
    expect(composePractice(familiar, () => 0.9)).toHaveLength(10)

    const first = composePractice(familiar, () => 0.1).map((c) => c.factId)
    const second = composePractice(familiar, () => 0.9).map((c) => c.factId)
    expect(first).not.toEqual(second)
  })
})
