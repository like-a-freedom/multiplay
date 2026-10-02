// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const runtime = vi.hoisted(() => ({
  active: null as { value: boolean } | null,
  frame: null as ((frame: { timestamp: number }) => void) | null,
  motionValues: [] as { value: number; set(value: number): void }[],
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
  useRafFn: (callback: (frame: { timestamp: number }) => void) => {
    runtime.frame = callback
    return { pause: runtime.pause, resume: runtime.resume }
  },
}))

vi.mock('motion-v', async () => {
  const { defineComponent, h } = await import('vue')
  return {
    m: {
      div: defineComponent({
        setup(_, context) {
          return () => h('div', context.slots.default?.())
        },
      }),
    },
    useMotionValue: (initial: number) => {
      const motionValue = {
        value: initial,
        set(value: number) {
          this.value = value
        },
      }
      runtime.motionValues.push(motionValue)
      return motionValue
    },
  }
})

import Float from '@/presentation/components/inspira/Float.vue'

beforeEach(() => {
  runtime.active = null
  runtime.frame = null
  runtime.motionValues = []
  runtime.pause.mockClear()
  runtime.resume.mockClear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('ambient mascot float', () => {
  it('pauses offscreen, animates when visible, and resets on exit', async () => {
    const wrapper = mount(Float, {
      props: { amplitude: 10, speed: 1 },
      slots: { default: '<span>Orbi</span>' },
    })

    expect(runtime.pause).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('Orbi')
    runtime.active!.value = true
    await nextTick()
    expect(runtime.resume).toHaveBeenCalledOnce()

    runtime.frame!({ timestamp: 1000 })
    expect(runtime.motionValues[0].value).toBeCloseTo(Math.sin(0.6) * 10)
    expect(runtime.motionValues[1].value).toBeCloseTo(Math.sin(0.3) * 3)

    runtime.active!.value = false
    await nextTick()
    expect(runtime.pause).toHaveBeenCalledTimes(2)
    expect(runtime.motionValues.map((value) => value.value)).toEqual([0, 0])

    wrapper.unmount()
    expect(runtime.pause).toHaveBeenCalledTimes(3)
  })
})
