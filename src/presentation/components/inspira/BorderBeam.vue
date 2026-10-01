<script setup lang="ts">
/** Inspira UI BorderBeam (MIT): native offset-path and masked border. */
withDefaults(defineProps<{ duration?: number; colorFrom?: string; colorTo?: string; size?: number }>(), {
  duration: 8, colorFrom: 'var(--color-lilac)', colorTo: 'var(--color-mint)', size: 100,
})
</script>
<template>
  <div class="inspira-border-beam" aria-hidden="true" :style="{ '--beam-duration': `${duration}s`, '--beam-from': colorFrom, '--beam-to': colorTo, '--beam-size': `${size}px` }" />
</template>
<style scoped>
.inspira-border-beam {
  position: absolute; inset: 0; border-radius: inherit; border: 2px solid transparent;
  pointer-events: none; mask: linear-gradient(transparent, transparent) padding-box, linear-gradient(white, white) border-box;
  mask-composite: intersect; -webkit-mask-composite: source-in;
}
.inspira-border-beam::after {
  content: ''; position: absolute; width: var(--beam-size); aspect-ratio: 1;
  background: linear-gradient(to left, var(--beam-from), var(--beam-to), transparent);
  offset-path: rect(0 auto auto 0 round 28px); offset-anchor: 90% 50%;
  animation: border-beam-anim var(--beam-duration) infinite linear;
}
@keyframes border-beam-anim { to { offset-distance: 100%; } }
@media (prefers-reduced-motion: reduce) { .inspira-border-beam::after { animation: none; } }
</style>
