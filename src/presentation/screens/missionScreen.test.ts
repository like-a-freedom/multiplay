// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MissionScreen from '@/presentation/screens/MissionScreen.vue'
import { fakeGameSession, sessionMountOptions } from '../../../tests/support/fakeGameSession'

function mountMission(session = fakeGameSession()) {
  return mount(MissionScreen, sessionMountOptions(session))
}

const buttons = (wrapper: ReturnType<typeof mountMission>) => wrapper.findAll('button')

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
    expect(wrapper.text()).toContain('Разберём вместе')
    expect(wrapper.text()).toContain('Твой ответ: 1')
    expect(wrapper.text()).toContain('Верный ответ: 0')
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.find('.question-card--review').exists()).toBe(true)
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

  it('resumes the unfinished mission with its frozen queue and id (PRD M4, §7)', async () => {
    const session = fakeGameSession()
    const first = mountMission(session)
    await first.vm.$nextTick()

    await answer(first, '0') // 0 × 0 отвечена
    await buttons(first).find((b) => b.text() === 'Продолжить')!.trigger('click')
    await first.vm.$nextTick()
    first.unmount() // закрытие посередине миссии

    const second = mountMission(session)
    await second.vm.$nextTick()
    expect(second.text()).toContain('Карточка 1 из 1') // осталась неотвеченная 0 × 1

    await answer(second, '0')
    expect(second.text()).toContain('Верно')
    await buttons(second).find((b) => b.text() === 'Продолжить')!.trigger('click')
    expect(second.text()).toContain('Миссия завершена!')
    // Награда одна: восстановленная миссия сохранила ID и не наградила дважды.
    expect(session.totalXp.value).toBe(10)
    second.unmount()
  })
})
