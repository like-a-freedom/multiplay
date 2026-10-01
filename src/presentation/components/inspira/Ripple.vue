<script setup lang="ts">
/** Native Inspira UI Ripple/RippleCircle (MIT), bounded to the decorative hero. */
withDefaults(defineProps<{ baseCircleSize?: number; numberOfCircles?: number }>(), { baseCircleSize: 140, numberOfCircles: 3 })
</script>
<template>
  <div class="inspira-ripple" aria-hidden="true">
    <div v-for="index in numberOfCircles" :key="index" class="inspira-ripple__circle" :style="{ width: `${baseCircleSize + index * 52}px`, height: `${baseCircleSize + index * 52}px`, opacity: .24 - index * .045, animationDelay: `${index * 180}ms` }" />
  </div>
</template>
<style scoped>
.inspira-ripple { position: absolute; inset: 0; pointer-events: none; }
.inspira-ripple__circle { position: absolute; top: 50%; left: 50%; border: 1px solid var(--color-lilac); border-radius: 50%; transform: translate(-50%, -50%); animation: ripple-effect 4s ease-in-out infinite; }
@keyframes ripple-effect { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(.92); } }
@media (prefers-reduced-motion: reduce) { .inspira-ripple__circle { animation: none; } }
</style>
