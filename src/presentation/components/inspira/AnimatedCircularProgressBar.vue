<script setup lang="ts">
/** Native Inspira UI AnimatedCircularProgressBar (MIT): SVG stroke-dasharray gauge. */
import { computed } from 'vue'
const props = defineProps<{ value: number; max: number }>()
const fraction = computed(() => props.max > 0 ? Math.min(1, Math.max(0, props.value / props.max)) : 0)
</script>
<template>
  <div class="inspira-circular-progress" role="progressbar" aria-label="Открытые звёзды знаний" :aria-valuenow="value" :aria-valuemax="max" aria-valuemin="0">
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" class="inspira-circular-progress__track" /><circle v-if="fraction > 0" cx="50" cy="50" r="45" class="inspira-circular-progress__value" :style="{ strokeDasharray: `${fraction * 282.743} 282.743` }" /></svg>
    <div class="inspira-circular-progress__center"><slot /></div>
  </div>
</template>
<style scoped>
.inspira-circular-progress { position: relative; }
.inspira-circular-progress svg { display: block; width: 100%; }
.inspira-circular-progress circle { fill: none; stroke-width: 5; }
.inspira-circular-progress__track { stroke: var(--color-cosmos-soft); }
.inspira-circular-progress__value { stroke: var(--color-star); stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; transition: stroke-dasharray 800ms var(--ease-playful); }
.inspira-circular-progress__center { position: absolute; inset: 0; display: grid; place-content: center; }
@media (prefers-reduced-motion: reduce) { .inspira-circular-progress__value { transition: none; } }
</style>
