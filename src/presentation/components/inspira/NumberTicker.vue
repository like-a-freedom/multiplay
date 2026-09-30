<script setup lang="ts">
import { TransitionPresets, useTransition } from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  duration?: number
  decimalPlaces?: number
}>(), {
  duration: 650,
  decimalPlaces: 0,
})

const count = ref(0)
const output = useTransition(count, {
  duration: props.duration,
  transition: TransitionPresets.easeOutCubic,
})
const formatted = computed(() => new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: props.decimalPlaces,
  maximumFractionDigits: props.decimalPlaces,
}).format(Number(output.value.toFixed(props.decimalPlaces))))
let frameId = 0

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion || props.value <= 0) {
    count.value = props.value
    return
  }

  frameId = window.requestAnimationFrame(() => {
    count.value = props.value
  })
})

onBeforeUnmount(() => {
  if (frameId !== 0) window.cancelAnimationFrame(frameId)
})
</script>

<template>
  <span class="number-ticker tabular-nums" aria-hidden="true">+{{ formatted }} XP</span>
</template>

<style scoped>
.number-ticker {
  display: inline-block;
  color: var(--color-ink);
  font-size: var(--font-size-title);
  font-weight: 700;
  line-height: var(--line-height-title);
  font-variant-numeric: tabular-nums;
}
</style>
