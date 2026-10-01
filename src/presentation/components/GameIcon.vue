<script setup lang="ts">
withDefaults(defineProps<{ name: 'rocket' | 'star' | 'home' | 'chart' | 'arrow' | 'back' | 'fire' | 'check' | 'spark' | 'shield'; size?: number }>(), { size: 24 })
const paths = {
  rocket: 'M14 5c2.5-2.5 5-2 5-2s.5 2.5-2 5l-6 6-4-4 7-5ZM7 10l-4 1 2 4m6-1 1 5 3-2M7 17l-3 3m1-5-2 2',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  home: 'm3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9',
  chart: 'M5 20V10m7 10V4m7 16v-7M3 20h18',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  fire: 'M12 3c1 5 5 5 5 9 2-1 2-3 2-3 3 6-1 12-7 12S2 15 5 10c0 3 2 3 2 3 0-4 3-6 5-10Zm0 10c-4 4-3 6 0 6s4-3 0-6Z',
  check: 'm5 12 4 4L19 6',
  spark: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z',
  shield: 'm12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Zm-4 9 3 3 5-6',
}
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path :d="paths[name]" /></svg>
</template>
