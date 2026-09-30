// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { allFacts } from '@/domain/fact/multiplicationFact'
import KnowledgeMapScreen from '@/presentation/screens/KnowledgeMapScreen.vue'

const factIds = allFacts().map((fact) => fact.id)

function mountMap(earnedFactIds: string[], reviewFactIds: string[] = []) {
  return mount(KnowledgeMapScreen, {
    props: { factIds, earnedFactIds, reviewFactIds },
    attachTo: document.body,
  })
}

describe('KnowledgeMapScreen star marking', () => {
  it('fills exactly the collected stars and outlines the rest', async () => {
    const collected = [factIds[0], factIds[7]]
    const wrapper = mountMap(collected)

    const earned = wrapper.findAll('.map__star--earned')
    const idle = wrapper.findAll('.map__star--idle')
    expect(earned).toHaveLength(2)
    expect(idle).toHaveLength(factIds.length - 2)

    // The mark follows each fact's position, not just a count.
    expect(wrapper.findAll('.map__sky svg[class*="map__star"]').at(0)?.classes()).toContain(
      'map__star--earned',
    )
    expect(wrapper.findAll('.map__sky svg[class*="map__star"]').at(7)?.classes()).toContain(
      'map__star--earned',
    )
    wrapper.unmount()
  })

  it('states the collected count and keeps it in sync with the props', async () => {
    const wrapper = mountMap(factIds.slice(0, 5))
    expect(wrapper.text()).toContain('Открыто звёзд: 5 из 66')
    await wrapper.setProps({ earnedFactIds: factIds.slice(0, 6) })
    expect(wrapper.text()).toContain('Открыто звёзд: 6 из 66')
    expect(wrapper.findAll('.map__star--earned')).toHaveLength(6)
    wrapper.unmount()
  })

  it('offers a text alternative for every fact in the archive list', async () => {
    const wrapper = mountMap([factIds[0], factIds[1]], [factIds[2]])
    const items = wrapper.findAll('.map__facts li')
    expect(items).toHaveLength(66)
    expect(items[0].text()).toContain('Звезда открыта')
    expect(items[1].text()).toContain('Звезда открыта')
    expect(items[2].text()).toContain('Звезда впереди')
    expect(items[2].text()).toContain('Пора повторить')
    wrapper.unmount()
  })
})
