// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  loadConfetti: vi.fn(),
  create: vi.fn(),
  fire: vi.fn(),
  reset: vi.fn(),
}))

vi.mock('@/presentation/components/inspira/confettiLoader', () => ({
  loadConfetti: mocks.loadConfetti,
}))

import ExpeditionCelebration from '@/presentation/components/ExpeditionCelebration.vue'

beforeEach(() => {
  vi.clearAllMocks()
  mocks.create.mockReturnValue(Object.assign(mocks.fire, { reset: mocks.reset }))
  mocks.loadConfetti.mockResolvedValue({ default: { create: mocks.create } })
})

describe('ExpeditionCelebration', () => {
  it('fires one restrained burst after the async canvas module is ready', async () => {
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: false },
    })
    await flushPromises()

    expect(mocks.loadConfetti).toHaveBeenCalledTimes(1)
    expect(mocks.create).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), {
      resize: true,
      useWorker: false,
      disableForReducedMotion: true,
    })
    expect(mocks.fire).toHaveBeenCalledTimes(1)
    expect(mocks.fire).toHaveBeenCalledWith(expect.objectContaining({ particleCount: 48, ticks: 100 }))
    expect(wrapper.find('canvas').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('canvas').attributes('data-loaded')).toBe('true')
    expect(wrapper.find('canvas').attributes('data-fired')).toBe('true')
    expect(wrapper.find('.expedition-celebration').attributes('aria-hidden')).toBe('true')
    wrapper.unmount()
  })

  it('queues exactly one fire until the async module is ready', async () => {
    let resolveModule!: (module: { default: { create: typeof mocks.create } }) => void
    mocks.loadConfetti.mockReturnValue(new Promise((resolve) => { resolveModule = resolve }))
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: false },
    })
    await wrapper.vm.$nextTick()
    expect(mocks.fire).not.toHaveBeenCalled()

    resolveModule({ default: { create: mocks.create } })
    await flushPromises()

    expect(mocks.fire).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('discards a queued fire if the screen unmounts before the module resolves', async () => {
    let resolveModule!: (module: { default: { create: typeof mocks.create } }) => void
    mocks.loadConfetti.mockReturnValue(new Promise((resolve) => { resolveModule = resolve }))
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: false },
    })
    await wrapper.vm.$nextTick()
    wrapper.unmount()
    resolveModule({ default: { create: mocks.create } })
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.fire).not.toHaveBeenCalled()
  })

  it('discards a queued fire if reduced motion is enabled before the module resolves', async () => {
    let resolveModule!: (module: { default: { create: typeof mocks.create } }) => void
    mocks.loadConfetti.mockReturnValue(new Promise((resolve) => { resolveModule = resolve }))
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: false },
    })
    await wrapper.vm.$nextTick()
    await wrapper.setProps({ reducedMotion: true })
    resolveModule({ default: { create: mocks.create } })
    await flushPromises()

    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.fire).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('resets an active canvas if reduced motion is enabled during the burst', async () => {
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: false },
    })
    await flushPromises()
    expect(mocks.fire).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ reducedMotion: true })

    expect(mocks.reset).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.expedition-celebration').exists()).toBe(false)
    wrapper.unmount()
  })

  it('does not load or fire confetti when motion is reduced', async () => {
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: true },
    })
    await flushPromises()

    expect(wrapper.find('.expedition-celebration').exists()).toBe(false)
    expect(mocks.loadConfetti).not.toHaveBeenCalled()
    expect(mocks.create).not.toHaveBeenCalled()
    expect(mocks.fire).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('leaves the static screen usable when the async module fails to load', async () => {
    mocks.loadConfetti.mockRejectedValue(new Error('chunk unavailable'))
    const wrapper = mount(ExpeditionCelebration, {
      props: { active: true, reducedMotion: false },
    })
    await flushPromises()

    expect(wrapper.find('.expedition-celebration').exists()).toBe(true)
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(mocks.fire).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
