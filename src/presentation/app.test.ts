// @vitest-environment happy-dom
import { computed, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/App.vue'
import { addCalendarDays } from '@/domain/learning/calendarDate'
import { createMasteryProgress } from '@/domain/learning/mastery'
import { createProgressState, type ProgressState } from '@/domain/progress/progressState'
import { starsEarned } from '@/domain/progress/progressState'
import { levelFromXp } from '@/domain/game/experience'
import { type GameSession, gameSessionKey, type StorageStatus } from '@/presentation/composables/gameSession'
import MissionScreen from '@/presentation/screens/MissionScreen.vue'
import { today } from '@/presentation/utils/clock'

const serviceWorker = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  updateServiceWorker: vi.fn(),
}))

vi.mock('virtual:pwa-register/vue', async () => {
  const { ref } = await import('vue')
  return {
    useRegisterSW: () => ({
      offlineReady: ref(serviceWorker.offlineReady),
      needRefresh: ref(serviceWorker.needRefresh),
      updateServiceWorker: serviceWorker.updateServiceWorker,
    }),
  }
})

const mountedWrappers: ReturnType<typeof mount>[] = []

function readyState(): ProgressState {
  return {
    ...createProgressState(),
    diagnostic: { factIds: ['2:3'], skipped: true, completed: true },
  }
}

function makeSession(state = readyState(), initialStatus: StorageStatus = 'ok') {
  const stateRef = ref(state)
  const storageStatus = ref(initialStatus)
  const resetProgress = vi.fn(() => {
    stateRef.value = createProgressState()
    storageStatus.value = 'ok'
  })
  const save = vi.fn(() => true)
  const session: GameSession = {
    state: stateRef,
    storageStatus,
    totalXp: computed(() => stateRef.value.rewards.totalXp),
    level: computed(() => levelFromXp(stateRef.value.rewards.totalXp)),
    stars: computed(() => starsEarned(stateRef.value)),
    streakDays: computed(() => stateRef.value.rewards.streak.days),
    save,
    resetProgress,
  }
  return { session, save, resetProgress, stateRef, storageStatus }
}

function mountApp(session: GameSession) {
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { provide: { [gameSessionKey as symbol]: session } },
  })
  mountedWrappers.push(wrapper)
  return wrapper
}

function setReducedMotion(reduced: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((media: string) => ({
      matches: media.includes('prefers-reduced-motion') && reduced,
      media,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

beforeEach(() => {
  serviceWorker.offlineReady = false
  serviceWorker.needRefresh = false
  serviceWorker.updateServiceWorker.mockClear()
  setReducedMotion(true)
})

afterEach(() => {
  for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('application screen flow', () => {
  it('navigates from home to the star map and report, then back home', async () => {
    const { session } = makeSession()
    const wrapper = mountApp(session)

    expect(wrapper.find('.home').exists()).toBe(true)
    await wrapper.get('.home__map-link').trigger('click')
    expect(wrapper.find('.map').exists()).toBe(true)
    const dock = wrapper.get('.inspira-dock')
    await dock.trigger('pointermove', { pointerType: 'mouse', clientX: 0 })
    expect(dock.get('button[aria-label="Главная"] .inspira-dock__icon').attributes('style')).toContain(
      'scale(1.13)',
    )
    await dock.trigger('pointermove', { pointerType: 'touch', clientX: 90 })
    expect(dock.get('button[aria-label="Главная"] .inspira-dock__icon').attributes('style')).toContain(
      'scale(1.13)',
    )
    await dock.trigger('pointerleave')

    await wrapper.get('button[aria-label="Отчёт для взрослого"]').trigger('click')
    expect(wrapper.find('.report').exists()).toBe(true)
    await wrapper.get('.report .screen__actions button:first-child').trigger('click')
    expect(wrapper.find('.diagnostic').exists()).toBe(true)
    await wrapper.get('.diagnostic .screen__actions button:last-child').trigger('click')
    expect(wrapper.find('.home').exists()).toBe(true)
  })

  it('enters the mission selected by the due-review action', async () => {
    const base = readyState()
    const state: ProgressState = {
      ...base,
      rewards: {
        ...base.rewards,
        streak: { ...base.rewards.streak, lastRewardedDate: '2099-01-01' },
      },
      facts: {
        ...base.facts,
        '2:3': {
          ...base.facts['2:3'],
          status: 'familiar',
          review: { completedSuccesses: 0, nextReviewDate: '2020-01-01' },
        },
      },
    }
    const { session } = makeSession(state)
    serviceWorker.needRefresh = true
    const wrapper = mountApp(session)

    expect(wrapper.get('.home__review-number').text()).toBe('1')
    expect(wrapper.text()).toContain('Дата устройства стала раньше')
    await wrapper.get('.home__mission .inspira-shimmer-button').trigger('click')
    expect(wrapper.findComponent(MissionScreen).exists()).toBe(true)
    expect(wrapper.get('.mission-progress__text').text()).toBe('Карточка 1 из 1')
    expect(wrapper.get('.question-card__expression').text()).toContain('2 × 3')
    expect(wrapper.text()).not.toContain('Обновление готово')
    expect(wrapper.text()).not.toContain('Дата устройства стала раньше')
  })

  it('carries a newly earned star from the mission feedback to the map reveal', async () => {
    const base = readyState()
    const date = today()
    const state: ProgressState = {
      ...base,
      facts: {
        ...base.facts,
        '2:3': {
          ...base.facts['2:3'],
          status: 'familiar',
          review: { completedSuccesses: 1, nextReviewDate: addCalendarDays(date, -1) },
          mastery: {
            ...createMasteryProgress(),
            independentSuccessDates: [addCalendarDays(date, -8)],
          },
        },
      },
    }
    const { session } = makeSession(state)
    const wrapper = mountApp(session)

    await wrapper.get('.home__mission .inspira-shimmer-button').trigger('click')
    await wrapper.get('input').setValue('6')
    await wrapper.get('.mission .screen__actions .button-primary').trigger('click')
    expect(session.stars.value).toBe(1)
    expect(wrapper.find('.question-card__new-star').exists()).toBe(true)
    await wrapper.get('.mission .screen__actions .button-primary').trigger('click')
    await wrapper.get('.mission > .screen__actions button:first-child').trigger('click')
    expect(wrapper.find('.home').exists()).toBe(true)

    setReducedMotion(false)
    await wrapper.get('.home__map-link').trigger('click')
    expect(
      wrapper.get('.constellation-sky--map .constellation-sky__star[data-fact-id="2:3"]')
        .attributes('data-newly-unlocked'),
    ).toBe('true')
  })

  it('keeps update and offline notices between sessions and retries a failed save', async () => {
    serviceWorker.needRefresh = true
    serviceWorker.offlineReady = true
    const { session, save } = makeSession()
    session.storageStatus.value = 'write-failed'
    const wrapper = mountApp(session)

    const notices = wrapper.findAll('[role="status"]')
    expect(notices.some((notice) => notice.text().includes('Обновление готово'))).toBe(true)
    expect(notices.some((notice) => notice.text().includes('Готово без интернета'))).toBe(true)
    const updateBanner = wrapper.findAll('.banner').find((banner) => banner.text().includes('Обновление готово'))
    expect(updateBanner).toBeDefined()
    await updateBanner!.get('button').trigger('click')
    expect(serviceWorker.updateServiceWorker).toHaveBeenCalledWith(true)
    await updateBanner!.findAll('button')[1].trigger('click')
    expect(wrapper.text()).not.toContain('Обновление готово')
    await wrapper.get('[role="alert"] button').trigger('click')
    expect(save).toHaveBeenCalledOnce()
    await wrapper.get('.banner--offline button').trigger('click')
    expect(wrapper.find('.banner--offline').exists()).toBe(false)
  })

  it.each([
    ['corrupt', 'Данные прогресса повреждены'],
    ['unknown-version', 'Данные сохранены другой версией приложения'],
  ] as const)('requires explicit confirmation before resetting %s progress', async (status, message) => {
    const { session, resetProgress } = makeSession(readyState(), status)
    const wrapper = mountApp(session)

    expect(wrapper.get('[role="alert"]').text()).toContain(message)
    await wrapper.get('[role="alert"] button').trigger('click')
    expect(resetProgress).not.toHaveBeenCalled()
    await wrapper.get('[role="alert"] button:last-child').trigger('click')
    expect(resetProgress).toHaveBeenCalledOnce()
    expect(session.storageStatus.value).toBe('ok')
    expect(wrapper.find('.diagnostic').exists()).toBe(true)
  })

  it('completes the first diagnostic before returning to the home screen', async () => {
    const { session, save } = makeSession(createProgressState())
    const wrapper = mountApp(session)

    expect(wrapper.find('.diagnostic__welcome-copy').exists()).toBe(true)
    await wrapper.get('.diagnostic__invite .launch-button__label').trigger('click')

    for (let index = 0; index < 10; index += 1) {
      const expression = wrapper.get(
        '.question-card--front .question-card__expression span[aria-hidden]',
      ).text()
      const factors = expression.match(/(\d+)\s*×\s*(\d+)/)
      if (factors === null) throw new Error(`Could not read diagnostic prompt: ${expression}`)
      const answer = Number(factors[1]) * Number(factors[2])
      await wrapper.get('input').setValue(String(answer))
      await wrapper.get('.diagnostic .screen__actions .button-primary').trigger('click')
    }

    expect(session.state.value.diagnostic?.completed).toBe(true)
    expect(session.state.value.attempts).toHaveLength(10)
    expect(session.state.value.rewards.totalXp).toBe(0)
    expect(save).toHaveBeenCalledTimes(11)
    await wrapper.get('.diagnostic .screen__actions .button-primary').trigger('click')
    expect(wrapper.find('.home').exists()).toBe(true)
  })

  it('cancels an in-flight launch when the user leaves for the map', async () => {
    setReducedMotion(false)
    vi.useFakeTimers()
    const { session } = makeSession()
    const wrapper = mountApp(session)

    await wrapper.get('.home__mission .inspira-shimmer-button').trigger('click')
    expect(wrapper.find('.home__mission .inspira-shimmer-button').attributes('aria-busy')).toBe('true')
    await wrapper.get('.home__map-link').trigger('click')
    await vi.advanceTimersByTimeAsync(300)

    expect(wrapper.find('.map').exists()).toBe(true)
    expect(wrapper.findComponent(MissionScreen).exists()).toBe(false)
  })

  it('starts the selected mission after the launch transition completes', async () => {
    setReducedMotion(false)
    vi.useFakeTimers()
    const { session } = makeSession()
    const wrapper = mountApp(session)
    const launch = wrapper.get('.home__mission .inspira-shimmer-button')

    await launch.trigger('click')
    expect(launch.attributes('aria-busy')).toBe('true')
    await launch.trigger('click')
    await vi.advanceTimersByTimeAsync(240)

    expect(wrapper.findComponent(MissionScreen).exists()).toBe(true)
    expect(wrapper.get('.mission-progress__text').text()).toBe('Карточка 1 из 2')
  })
})
