<script setup lang="ts">
/** Inspira UI Orbit (MIT), preserving counter-rotation to keep orbiting objects upright. */
withDefaults(defineProps<{ radius?: number; duration?: number; delay?: number; reverse?: boolean }>(), {
  radius: 100, duration: 30, delay: 0, reverse: false,
})
</script>
<template>
  <div class="inspira-orbit" aria-hidden="true" :style="{ '--orbit-radius': `${radius}px`, animationDuration: `${duration}s`, animationDelay: `${-delay}s`, animationDirection: reverse ? 'reverse' : 'normal' }"><slot /></div>
</template>
<style scoped>
.inspira-orbit { position: absolute; left: 50%; top: 50%; width: 0; height: 0; animation: orbit 30s linear infinite; pointer-events: none; }
.inspira-orbit :deep(> *) { position: absolute; transform: translate(-50%, -50%); }
@keyframes orbit {
  from { transform: rotate(0deg) translateY(var(--orbit-radius)) rotate(0deg); }
  to { transform: rotate(360deg) translateY(var(--orbit-radius)) rotate(-360deg); }
}
@media (prefers-reduced-motion: reduce) { .inspira-orbit { animation: none; transform: rotate(35deg) translateY(var(--orbit-radius)) rotate(-35deg); } }
</style>
