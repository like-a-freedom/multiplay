// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { allFacts } from '@/domain/fact/multiplicationFact'
import ConstellationSky from '@/presentation/components/ConstellationSky.vue'
import { constellationPositions } from '@/presentation/utils/constellation'

const facts = allFacts()
const factIds = facts.map((fact) => fact.id)

afterEach(() => vi.unstubAllGlobals())

describe('ConstellationSky', () => {
  it('uses the canonical 66 facts and keeps each fact at its stable orbit position', () => {
    const wrapper = mount(ConstellationSky, {
      props: { earnedFactIds: [], variant: 'map' },
    })
    const stars = wrapper.findAll('.constellation-sky__star')
    const positions = constellationPositions(66)

    expect(stars).toHaveLength(66)
    for (const index of [0, 17, 65]) {
      expect(stars[index].attributes('data-fact-id')).toBe(factIds[index])
      expect(stars[index].attributes('x')).toBe(String(positions[index].x - 9))
      expect(stars[index].attributes('y')).toBe(String(positions[index].y - 9))
    }
    wrapper.unmount()
  })

  it('shows 0, 1, and 66 earned facts without treating a preview as progress', () => {
    const zero = mount(ConstellationSky, {
      props: { earnedFactIds: [], variant: 'preview' },
    })
    expect(zero.findAll('.constellation-sky__star--earned')).toHaveLength(0)
    expect(zero.findAll('.constellation-sky__star--idle')).toHaveLength(66)
    zero.unmount()

    const one = mount(ConstellationSky, {
      props: { earnedFactIds: [factIds[12]], variant: 'preview' },
    })
    expect(one.findAll('.constellation-sky__star--earned')).toHaveLength(1)
    expect(one.find('[data-fact-id="1:2"]').classes()).toContain('constellation-sky__star--earned')
    one.unmount()

    const all = mount(ConstellationSky, {
      props: { earnedFactIds: factIds, variant: 'final' },
    })
    expect(all.findAll('.constellation-sky__star--earned')).toHaveLength(66)
    expect(all.findAll('.constellation-sky__star--idle')).toHaveLength(0)
    all.unmount()
  })

  it('draws one temporary reveal line for each newly unlocked fact without shifting existing stars', () => {
    const wrapper = mount(ConstellationSky, {
      props: {
        earnedFactIds: [factIds[0], factIds[1], factIds[2]],
        newlyUnlockedFactIds: [factIds[1], factIds[2], factIds[2]],
        variant: 'map',
      },
    })
    const existingStar = wrapper.get(`[data-fact-id="${factIds[0]}"]`)
    const positionBefore = [existingStar.attributes('x'), existingStar.attributes('y')]

    expect(wrapper.findAll('.constellation-sky__reveal-line')).toHaveLength(2)
    expect(wrapper.findAll('.constellation-sky__star--revealing')).toHaveLength(2)
    expect(wrapper.findAll('.constellation-sky__star--earned')).toHaveLength(3)
    expect(wrapper.find(`[data-fact-id="${factIds[0]}"]`).classes()).not.toContain('constellation-sky__star--revealing')
    expect([
      wrapper.get(`[data-fact-id="${factIds[0]}"]`).attributes('x'),
      wrapper.get(`[data-fact-id="${factIds[0]}"]`).attributes('y'),
    ]).toEqual(positionBefore)
    wrapper.unmount()
  })

  it('renders earned stars statically without reveal lines when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
    const wrapper = mount(ConstellationSky, {
      props: {
        earnedFactIds: [factIds[0]],
        newlyUnlockedFactIds: [factIds[0]],
        variant: 'map',
      },
    })

    expect(wrapper.findAll('.constellation-sky__star--earned')).toHaveLength(1)
    expect(wrapper.findAll('.constellation-sky__reveal-line')).toHaveLength(0)
    expect(wrapper.emitted('reveals-consumed')).toHaveLength(1)
    wrapper.unmount()
  })
})
