// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import HomeScreen from '@/presentation/screens/HomeScreen.vue'

interface HomeProps {
  xp: number
  streakDays: number
  stars: number
  earnedFactIds: string[]
  totalFacts: number
  reviewsToday: number
  maintenanceMode: boolean
  nextReviewDate: string | null
  launching: boolean
}

const defaultProps: HomeProps = {
  xp: 120,
  streakDays: 3,
  stars: 4,
  earnedFactIds: ['2:3', '3:4', '4:5', '5:6'],
  totalFacts: 66,
  reviewsToday: 0,
  maintenanceMode: false,
  nextReviewDate: null,
  launching: false,
}

function mountHome(props: Partial<HomeProps> = {}) {
  return mount(HomeScreen, {
    props: { ...defaultProps, ...props },
    global: { stubs: { OrbitScene: true, ConstellationSky: true } },
  })
}

describe('home mission choices', () => {
  it('offers the expedition mission when there are no reviews and maintenance has not started', async () => {
    const wrapper = mountHome()

    expect(wrapper.get('.home__mission-copy').text()).toBe('Короткий полёт, новые открытия.')
    expect(wrapper.get('.home__stars').text()).toBe('Звёзды знаний: 4 из 66')
    await wrapper.get('.home__mission .inspira-shimmer-button').trigger('click')
    expect(wrapper.emitted('play')).toHaveLength(1)
    expect(wrapper.emitted('practice')).toBeUndefined()
    expect(wrapper.emitted('review')).toBeUndefined()
  })

  it('prioritizes due reviews and keeps the alternate play action available', async () => {
    const wrapper = mountHome({ reviewsToday: 2 })

    expect(wrapper.get('.launch-button__label').text()).toBe('Повторить')
    expect(wrapper.get('.home__review-number').text()).toBe('2')
    await wrapper.get('.home__mission .inspira-shimmer-button').trigger('click')
    await wrapper.get('.screen__actions button:last-child').trigger('click')

    expect(wrapper.emitted('review')).toHaveLength(1)
    expect(wrapper.emitted('play')).toHaveLength(1)
  })

  it('offers free practice in maintenance mode and shows the nearest review date', async () => {
    const wrapper = mountHome({ maintenanceMode: true, nextReviewDate: '2026-09-04' })

    expect(wrapper.get('.home__greeting h2').text()).toBe('Вся галактика твоя!')
    expect(wrapper.get('.home__mission-copy').text()).toContain('04.09.2026')
    expect(wrapper.get('.launch-button__label').text()).toBe('Свободная практика')
    await wrapper.get('.home__mission .inspira-shimmer-button').trigger('click')
    expect(wrapper.emitted('practice')).toHaveLength(1)
    expect(wrapper.emitted('play')).toBeUndefined()
  })

  it('keeps review primary while offering free practice as the maintenance alternative', async () => {
    const wrapper = mountHome({ maintenanceMode: true, reviewsToday: 1 })

    expect(wrapper.get('.launch-button__label').text()).toBe('Повторить')
    const buttons = wrapper.findAll('.screen__actions button')
    expect(buttons[1].text()).toBe('Свободная практика')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('practice')).toHaveLength(1)
    expect(wrapper.emitted('review')).toBeUndefined()
  })

  it('disables the launch action during its transition and opens the knowledge map', async () => {
    const wrapper = mountHome({ launching: true })
    const launch = wrapper.get('.home__mission .inspira-shimmer-button')
    expect(launch.attributes('disabled')).toBeDefined()
    expect(launch.attributes('aria-busy')).toBe('true')

    await wrapper.get('.home__map-link').trigger('click')
    expect(wrapper.emitted('map')).toHaveLength(1)
  })

  it('moves the knowledge spotlight to the pointer position', async () => {
    const wrapper = mountHome()
    const spotlight = wrapper.get('.home__knowledge-spotlight')
    vi.spyOn(spotlight.element, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      right: 110,
      bottom: 120,
      width: 100,
      height: 100,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    } as DOMRect)

    await spotlight.trigger('pointermove', { clientX: 60, clientY: 45 })
    expect(spotlight.attributes('style')).toContain('--light-x: 50%')
    expect(spotlight.attributes('style')).toContain('--light-y: 25%')
  })
})
