<script setup lang="ts">
import { LazyMotion, domAnimation, m } from 'motion-v'

defineProps<{
  x: number
  y: number
  launching?: boolean
}>()
</script>

<template>
  <LazyMotion :features="domAnimation">
    <m.g
      class="expedition-ship-motion"
      :initial="false"
      :animate="launching ? { rotate: -7, scale: 1.08 } : { rotate: 0, scale: 1 }"
      :transition="launching ? { type: 'spring', stiffness: 280, damping: 18, duration: 0.24 } : { duration: 0.18 }"
      :style="{ transformBox: 'fill-box', transformOrigin: 'center' }"
      aria-hidden="true"
    >
      <g :transform="`translate(${x} ${y})`" class="expedition-ship expedition-ship-position">
        <path d="M -23 -6 L 8 -11 L 23 0 L 8 11 L -23 6 Z" fill="var(--color-paper)" />
        <path d="M -10 -7 L 0 -15 L 4 -7 Z M -10 7 L 0 15 L 4 7 Z" fill="var(--color-star)" />
        <path d="M -22 -5 L -12 0 L -22 5 Z" fill="var(--color-action)" />
        <path d="M -25 -3 L -34 0 L -25 3 Z" fill="var(--color-star-highlight)" class="expedition-ship__thrust" />
        <circle cx="5" cy="0" r="4.25" fill="var(--color-action)" stroke="var(--color-star-highlight)" stroke-width="1.5" />
        <circle cx="6.25" cy="-1.25" r="1.1" fill="var(--color-white)" />
        <path d="M -13 -1.5 H -7" stroke="var(--color-control-outline)" stroke-linecap="round" stroke-width="1.5" />
      </g>
    </m.g>
  </LazyMotion>
</template>

<style scoped>
.expedition-ship__thrust {
  opacity: 0.85;
}
</style>
