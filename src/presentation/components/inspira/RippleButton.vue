<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { onBeforeUnmount, ref } from 'vue'
import { cn } from '@inspira-ui/plugins'

interface Ripple {
  readonly id: number
  readonly x: number
  readonly y: number
  readonly size: number
}

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  rippleColor?: string
  duration?: number
  disabled?: boolean
  launching?: boolean
}>(), {
  rippleColor: 'var(--color-streak)',
  duration: 520,
  disabled: false,
  launching: false,
})
const emit = defineEmits<{ click: [] }>()
const button = ref<HTMLButtonElement | null>(null)
const ripples = ref<Ripple[]>([])
const timers = new Map<number, number>()
let nextRippleId = 0

function handleClick(event: MouseEvent): void {
  if (props.disabled) return
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) addRipple(event)
  emit('click')
}

function addRipple(event: MouseEvent): void {
  const element = button.value
  if (!element) return

  const bounds = element.getBoundingClientRect()
  const size = Math.max(bounds.width, bounds.height)
  const keyboardActivation = event.detail === 0
  const x = keyboardActivation ? bounds.width / 2 : event.clientX - bounds.left
  const y = keyboardActivation ? bounds.height / 2 : event.clientY - bounds.top
  const id = ++nextRippleId
  ripples.value.push({ id, x: x - size / 2, y: y - size / 2, size })
  const timer = window.setTimeout(() => {
    ripples.value = ripples.value.filter((ripple) => ripple.id !== id)
    timers.delete(id)
  }, props.duration)
  timers.set(id, timer)
}

onBeforeUnmount(() => {
  for (const timer of timers.values()) window.clearTimeout(timer)
  timers.clear()
})
</script>

<template>
  <button
    ref="button"
    type="button"
    :class="cn('relative flex cursor-pointer items-center justify-center overflow-hidden text-center', props.class)"
    :disabled="disabled"
    :aria-busy="launching ? 'true' : undefined"
    @click="handleClick"
  >
    <span class="relative z-10"><slot /></span>
    <span class="pointer-events-none absolute inset-0" aria-hidden="true">
      <span
        v-for="ripple in ripples"
        :key="ripple.id"
        class="ripple-animation absolute rounded-full border-2"
        :style="{
          width: `${ripple.size}px`,
          height: `${ripple.size}px`,
          top: `${ripple.y}px`,
          left: `${ripple.x}px`,
          borderColor: rippleColor,
          animationDuration: `${duration}ms`,
        }"
      />
    </span>
  </button>
</template>

<style scoped>
@keyframes ripple-expansion {
  from { opacity: .95; transform: scale(0); }
  to { opacity: 0; transform: scale(2); }
}

.ripple-animation { animation: ripple-expansion ease-out both; }
@media (prefers-reduced-motion: reduce) { .ripple-animation { animation: none; } }
</style>
