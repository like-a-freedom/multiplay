// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FlipCard from '@/presentation/components/inspira/FlipCard.vue'

describe('Inspira FlipCard adaptation', () => {
  it('keeps the answer inaccessible until the explicit reveal state is enabled', async () => {
    const wrapper = mount(FlipCard, {
      props: { flipped: false },
      slots: { front: '7 × 8 = ?', back: '56' },
    })
    const front = wrapper.get('.inspira-flip-card__front')
    const back = wrapper.get('.inspira-flip-card__back')

    expect(front.text()).toContain('7 × 8 = ?')
    expect(front.attributes('aria-hidden')).toBeUndefined()
    expect(front.attributes('inert')).toBeUndefined()
    expect(back.attributes('aria-hidden')).toBe('true')
    expect(back.attributes('inert')).toBeDefined()

    await wrapper.setProps({ flipped: true })

    expect(front.attributes('aria-hidden')).toBe('true')
    expect(front.attributes('inert')).toBeDefined()
    expect(back.text()).toContain('56')
    expect(back.attributes('aria-hidden')).toBeUndefined()
    expect(back.attributes('inert')).toBeUndefined()
    wrapper.unmount()
  })
})
