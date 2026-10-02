// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => ({
  active: null as { value: boolean } | null,
  frame: null as (() => void) | null,
  pause: vi.fn(),
  resume: vi.fn(),
}))

vi.mock('@/presentation/composables/sceneMotion', async () => {
  const { ref } = await import('vue')
  return {
    useSceneMotion: () => {
      const active = ref(false)
      runtime.active = active
      return { active }
    },
  }
})

vi.mock('@vueuse/core', () => ({
  useRafFn: (callback: () => void) => {
    runtime.frame = callback
    return { pause: runtime.pause, resume: runtime.resume }
  },
}))

import Sparkles from '@/presentation/components/inspira/Sparkles.vue'

let observer: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }

class ResizeObserverFixture {
  observe = vi.fn()
  disconnect = vi.fn()
  constructor(_callback: ResizeObserverCallback) {
    observer = this
  }
}

function canvasContext() {
  return {
    clearRect: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
  }
}

beforeEach(() => {
  runtime.active = null
  runtime.frame = null
  runtime.pause.mockClear()
  runtime.resume.mockClear()
  observer = { observe: vi.fn(), disconnect: vi.fn() }
  vi.stubGlobal('ResizeObserver', ResizeObserverFixture)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return {
      left: 0,
      top: 0,
      right: 120,
      bottom: 60,
      width: 120,
      height: 60,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('ambient star field', () => {
  it('draws a capped field, animates only while visible, and disconnects on exit', async () => {
    const context = canvasContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    )
    const wrapper = mount(Sparkles, { props: { particleColor: '#fff', particleDensity: 60 } })
    await nextTick()

    expect(observer.observe).toHaveBeenCalledWith(wrapper.get('.inspira-sparkles').element)
    expect(wrapper.get('canvas').element.width).toBe(120)
    expect(wrapper.get('canvas').element.height).toBe(60)
    expect(context.arc).toHaveBeenCalledTimes(48)
    expect(context.fillStyle).toBe('#fff')
    expect(context.globalAlpha).toBe(1)
    expect(runtime.resume).not.toHaveBeenCalled()

    runtime.active!.value = true
    await nextTick()
    expect(runtime.resume).toHaveBeenCalledOnce()
    runtime.frame!()
    expect(context.arc).toHaveBeenCalledTimes(96)

    runtime.active!.value = false
    await nextTick()
    expect(runtime.pause).toHaveBeenCalledOnce()
    wrapper.unmount()
    expect(observer.disconnect).toHaveBeenCalledOnce()
  })

  it('leaves a scene usable when canvas rendering is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const wrapper = mount(Sparkles)
    await nextTick()

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(observer.observe).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('still draws a static field when ResizeObserver is not supported', async () => {
    const globalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver')
    const windowDescriptor = Object.getOwnPropertyDescriptor(window, 'ResizeObserver')
    Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: null })
    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: null })
    try {
      const context = canvasContext()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        context as unknown as CanvasRenderingContext2D,
      )
      const wrapper = mount(Sparkles, { props: { particleDensity: 3 } })
      await nextTick()

      expect(context.arc).toHaveBeenCalledTimes(3)
      expect(runtime.resume).not.toHaveBeenCalled()
      wrapper.unmount()
    } finally {
      if (globalDescriptor === undefined) Reflect.deleteProperty(globalThis, 'ResizeObserver')
      else Object.defineProperty(globalThis, 'ResizeObserver', globalDescriptor)
      if (windowDescriptor === undefined) Reflect.deleteProperty(window, 'ResizeObserver')
      else Object.defineProperty(window, 'ResizeObserver', windowDescriptor)
    }
  })
})
