// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DiagnosticScreen from '@/presentation/screens/DiagnosticScreen.vue'
import { fakeGameSession, sessionMountOptions } from '../../../tests/support/fakeGameSession'

function mountDiagnostic(session = fakeGameSession(), props = { resume: false }) {
  return mount(DiagnosticScreen, { ...sessionMountOptions(session), props })
}

describe('DiagnosticScreen', () => {
  it('defers feedback until the end of the check (PRD §3)', async () => {
    const session = fakeGameSession()
    const wrapper = mountDiagnostic(session)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Короткая проверка')
    expect(wrapper.text()).toContain('Карточка 1 из 10')

    const input = wrapper.get('input')
    await input.setValue('0')
    await input.trigger('keyup.enter') // Enter отправляет ответ
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Карточка 2 из 10')
    expect(wrapper.text()).not.toContain('Верно') // ответы отложены до конца
    wrapper.unmount()
  })

  it('shows answers and hints only in the final summary', async () => {
    const wrapper = mountDiagnostic()
    await wrapper.vm.$nextTick()

    for (let card = 0; card < 10; card += 1) {
      const input = wrapper.get('input')
      await input.setValue('0')
      await input.trigger('keyup.enter')
      await wrapper.vm.$nextTick()
    }

    expect(wrapper.text()).toContain('Проверка завершена')
    expect(wrapper.text()).toContain('Ответы и подсказки — ниже')
    expect(wrapper.findAll('.diagnostic__summary li')).toHaveLength(10)
    expect(
      wrapper.findAll('button').find((b) => b.text() === 'Продолжить'),
    ).toBeDefined()
    wrapper.unmount()
  })

  it('empty submit keeps the placeholder as the only hint instead of stacking an error', async () => {
    const wrapper = mountDiagnostic()
    await wrapper.vm.$nextTick()

    await wrapper.get('input').trigger('keyup.enter')
    expect(wrapper.find('.answer-field__error').exists()).toBe(false)
    wrapper.unmount()
  })

  it('skip keeps the saved set and finishes the check', async () => {
    const session = fakeGameSession()
    const wrapper = mountDiagnostic(session)
    await wrapper.vm.$nextTick()

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Пропустить проверку')!
      .trigger('click')

    expect(wrapper.emitted('finished')).toHaveLength(1)
    expect(session.state.value.diagnostic?.skipped).toBe(true)
    expect(session.state.value.diagnostic?.factIds).toHaveLength(10)
    wrapper.unmount()
  })
})
