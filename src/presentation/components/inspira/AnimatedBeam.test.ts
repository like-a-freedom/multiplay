// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AnimatedBeam from '@/presentation/components/inspira/AnimatedBeam.vue'

function bounds(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

let frames: Map<number, FrameRequestCallback>
let frameId: number
let observer: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }

class ResizeObserverFixture {
  observe = vi.fn()
  disconnect = vi.fn()
  constructor(_callback: ResizeObserverCallback) {
    observer = this
  }
}

function runFrame(timestamp: number): void {
  const next = frames.entries().next().value
  if (next === undefined) throw new Error('the animation has no pending frame')
  const [id, callback] = next
  frames.delete(id)
  callback(timestamp)
}

beforeEach(() => {
  frames = new Map()
  frameId = 0
  observer = { observe: vi.fn(), disconnect: vi.fn() }
  vi.stubGlobal('ResizeObserver', ResizeObserverFixture)
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frameId += 1
    frames.set(frameId, callback)
    return frameId
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id)
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('experience beam', () => {
  it('draws between the live XP anchors and announces the end of its flight', async () => {
    const container = document.createElement('div')
    const from = document.createElement('circle')
    const to = document.createElement('circle')
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(bounds(10, 20, 360, 156))
    vi.spyOn(from, 'getBoundingClientRect').mockReturnValue(bounds(62, 120, 0, 0))
    vi.spyOn(to, 'getBoundingClientRect').mockReturnValue(bounds(322, 68, 0, 0))

    const wrapper = mount(AnimatedBeam, {
      props: { containerRef: container, fromRef: from, toRef: to, active: true, durationMs: 100 },
    })
    await flushPromises()

    expect(observer.observe).toHaveBeenCalledWith(container)
    expect(wrapper.get('.xp-route__beam').attributes('viewBox')).toBe('0 0 360 156')
    expect(Number(wrapper.get('.xp-route__beam').attributes('data-path-length'))).toBeGreaterThan(0)

    runFrame(1000)
    runFrame(1050)
    await nextTick()
    expect(Number(wrapper.get('.xp-route__beam').attributes('data-progress'))).toBeCloseTo(0.875)

    runFrame(1100)
    await nextTick()
    expect(wrapper.emitted('finished')).toHaveLength(1)
    expect(wrapper.get('.xp-route__beam').attributes('data-progress')).toBe('1.000')

    wrapper.unmount()
    expect(observer.disconnect).toHaveBeenCalledOnce()
  })

  it('does not start when its anchors are absent, coincident, or outside a visible container', async () => {
    const from = document.createElement('circle')
    const to = document.createElement('circle')
    const zeroSizeContainer = document.createElement('div')
    vi.spyOn(zeroSizeContainer, 'getBoundingClientRect').mockReturnValue(bounds(0, 0, 0, 0))
    vi.spyOn(from, 'getBoundingClientRect').mockReturnValue(bounds(10, 10, 0, 0))
    vi.spyOn(to, 'getBoundingClientRect').mockReturnValue(bounds(10, 10, 0, 0))

    const missingAnchor = mount(AnimatedBeam, {
      props: { containerRef: zeroSizeContainer, fromRef: null, toRef: to, active: true, durationMs: 100 },
    })
    await flushPromises()
    expect(missingAnchor.find('.xp-route__beam').exists()).toBe(false)
    expect(frames.size).toBe(0)
    missingAnchor.unmount()

    const coincidentAnchors = mount(AnimatedBeam, {
      props: { containerRef: zeroSizeContainer, fromRef: from, toRef: to, active: true, durationMs: 100 },
    })
    await flushPromises()
    expect(coincidentAnchors.find('.xp-route__beam').exists()).toBe(false)
    expect(frames.size).toBe(0)
    coincidentAnchors.unmount()

    vi.spyOn(to, 'getBoundingClientRect').mockReturnValue(bounds(80, 60, 0, 0))
    const hiddenContainer = mount(AnimatedBeam, {
      props: { containerRef: zeroSizeContainer, fromRef: from, toRef: to, active: true, durationMs: 100 },
    })
    await flushPromises()
    expect(hiddenContainer.find('.xp-route__beam').exists()).toBe(true)
    expect(frames.size).toBe(0)
    hiddenContainer.unmount()
  })
})
