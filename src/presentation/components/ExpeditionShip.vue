<script setup lang="ts">
import { LazyMotion, domAnimation, m } from 'motion-v'

const shipUrl = `${import.meta.env.BASE_URL}art/orbit-ship.webp`

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
        <image :href="shipUrl" x="-45" y="-45" width="90" height="90" class="expedition-ship__art" />
      </g>
    </m.g>
  </LazyMotion>
</template>

<style scoped>
.expedition-ship__art { filter: drop-shadow(0 4px 4px rgb(49 30 87 / .12)); }
</style>
