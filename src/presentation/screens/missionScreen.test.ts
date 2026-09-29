// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'

import type { GameSession } from '@/presentation/composables/gameSession'
import { gameSessionKey } from '@/presentation/composables/gameSession'
import MissionScreen from '@/presentation/screens/MissionScreen.vue'
import { createProgressState } from '@/domain/progress/progressState'
import { levelFromXp } from '@/domain/game/experience'
import { starsEarned } from '@/domain/progress/progressState'

function fakeSession(): GameSession {
  const state = ref(createProgressState())
  return {
    state,
    storageStatus: ref('ok'),
    totalXp: computed(() => state.value.rewards.totalXp),
    level: computed(() => levelFromXp(state.value.rewards.totalXp)),
    stars: computed(() => starsEarned(state.value)),
    streakDays: computed(() => state.value.rewards.streak.days),
    save: () => true,
    resetProgress: () => undefined,
  }
}

function mountMission() {
  return mount(MissionScreen, {
    global: { provide: { [gameSessionKey as symbol]: fakeSession() } },
    attachTo: document.body,
  })
}

const buttons = (wrapper: ReturnType<typeof mountMission>) =>
  wrapper.findAll('button')

async function answer(wrapper: ReturnType<typeof mountMission>, value: string) {
  const input = wrapper.get('input')
  await input.setValue(value)
  const check = buttons(wrapper).find((b) => b.text() === 'Проверить')
  expect(check).toBeDefined()
  await check!.trigger('click')
}

describe('MissionScreen answer flow', () => {
  it('accepts the correct answer typed into the field (repro: 0 for 0×0 and 0×1)', async () => {
    const wrapper = mountMission()
    await wrapper.vm.$nextTick()

    // Первая карточка свежей миссии — 0 × 0
    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Верно')

    await buttons(wrapper).find((b) => b.text() === 'Продолжить')!.trigger('click')
    await wrapper.vm.$nextTick()

    // Вторая карточка — 0 × 1
    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Верно')
    wrapper.unmount()
  })

  it('marks a wrong answer wrong, keeps the typed value and names it in the feedback', async () => {
    const wrapper = mountMission()
    await wrapper.vm.$nextTick()

    await answer(wrapper, '1')
    expect(wrapper.text()).toContain('Попробуем ещё')
    expect(wrapper.text()).toContain('ты ответил 1, а верный ответ 0')
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('1')
    wrapper.unmount()
  })

  it('hides the answer field after a correct answer', async () => {
    const wrapper = mountMission()
    await wrapper.vm.$nextTick()

    await answer(wrapper, '0')
    expect(wrapper.text()).toContain('Верно')
    expect(wrapper.find('input').exists()).toBe(false)
    wrapper.unmount()
  })

  it('submits the answer on Enter from the field', async () => {
    const wrapper = mountMission()
    await wrapper.vm.$nextTick()

    const input = wrapper.get('input')
    await input.setValue('0')
    await input.trigger('keyup.enter')
    expect(wrapper.text()).toContain('Верно')
    wrapper.unmount()
  })
})
