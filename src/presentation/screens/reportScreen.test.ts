// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ReportScreen from '@/presentation/screens/ReportScreen.vue'

const defaultProps = {
  xp: 240,
  level: 3,
  stars: 4,
  totalFacts: 66,
  bestStreakDays: 8,
  reviewsToday: 2,
  retentionCorrect: 0,
  retentionChecked: 0,
  hasDiagnosticSet: false,
}

function mountReport(props: Partial<typeof defaultProps> = {}) {
  return mount(ReportScreen, {
    props: { ...defaultProps, ...props },
    attachTo: document.body,
  })
}

beforeEach(() => {
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('adult progress report', () => {
  it('shows current game metrics and the empty retention state until eligible answers exist', () => {
    const wrapper = mountReport()

    expect(wrapper.get('.report__tile-value').text()).toBe('240')
    expect(wrapper.text()).toContain('4 из 66')
    expect(wrapper.text()).toContain('Пока нет данных')
    expect(wrapper.find('button[aria-label="Повторить проверку набора"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Резервной копии нет')
  })

  it('shows retained answers with a denominator and offers the saved diagnostic again', async () => {
    const wrapper = mountReport({
      retentionCorrect: 3,
      retentionChecked: 5,
      hasDiagnosticSet: true,
    })

    expect(wrapper.text()).toContain('3 из 5')
    await wrapper.findAll('.screen__actions button')[0].trigger('click')
    expect(wrapper.emitted('recheck')).toHaveLength(1)
  })

  it('cancels reset without emitting it and restores focus to the trigger', async () => {
    const wrapper = mountReport()
    const trigger = wrapper.get('.report__danger-zone button')
    await trigger.trigger('click')

    const dialog = wrapper.get('dialog')
    const cancel = dialog.get('button[autofocus]')
    const confirm = dialog.get('button[aria-label="Удалить весь прогресс"]')
    expect(document.activeElement).toBe(cancel.element)

    await cancel.trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirm.element)
    await confirm.trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(cancel.element)

    await cancel.trigger('click')
    await wrapper.vm.$nextTick()
    expect(dialog.attributes('open')).toBeUndefined()
    expect(document.activeElement).toBe(trigger.element)
    expect(wrapper.emitted('reset')).toBeUndefined()
  })

  it('keeps the reset dialog open for inside clicks and dismisses an outside backdrop click', async () => {
    const wrapper = mountReport()
    await wrapper.get('.report__danger-zone button').trigger('click')
    const dialog = wrapper.get('dialog')
    vi.spyOn(dialog.element, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      right: 110,
      top: 10,
      bottom: 110,
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)

    await dialog.trigger('click', { clientX: 50, clientY: 50 })
    expect(dialog.attributes('open')).toBeDefined()
    await dialog.trigger('click', { clientX: 5, clientY: 50 })
    expect(dialog.attributes('open')).toBeUndefined()
  })

  it('emits a reset only after the destructive action is confirmed', async () => {
    const wrapper = mountReport()
    await wrapper.get('.report__danger-zone button').trigger('click')
    await wrapper.get('button[aria-label="Удалить весь прогресс"]').trigger('click')

    expect(wrapper.emitted('reset')).toHaveLength(1)
    expect(wrapper.get('dialog').attributes('open')).toBeUndefined()
  })
})
