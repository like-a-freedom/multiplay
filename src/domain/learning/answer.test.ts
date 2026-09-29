import { describe, expect, it } from 'vitest'

import { parseAnswer } from '@/domain/learning/answer'

describe('parseAnswer', () => {
  it('accepts integers from 0 to 100', () => {
    expect(parseAnswer('0')).toEqual({ ok: true, value: 0 })
    expect(parseAnswer('56')).toEqual({ ok: true, value: 56 })
    expect(parseAnswer('100')).toEqual({ ok: true, value: 100 })
    expect(parseAnswer(' 42 ')).toEqual({ ok: true, value: 42 })
  })

  it('rejects empty input, signs, fractions and other symbols with an input hint', () => {
    expect(parseAnswer('')).toEqual({ ok: false })
    expect(parseAnswer('-5')).toEqual({ ok: false })
    expect(parseAnswer('+5')).toEqual({ ok: false })
    expect(parseAnswer('3.5')).toEqual({ ok: false })
    expect(parseAnswer('7×8')).toEqual({ ok: false })
    expect(parseAnswer('101')).toEqual({ ok: false })
    expect(parseAnswer('1000')).toEqual({ ok: false })
  })
})
