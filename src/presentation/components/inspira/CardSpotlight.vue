<script setup lang="ts">
/** Inspira UI CardSpotlight (MIT): radial light following the pointer. Keyboard and touch reveal it too. */
import { ref } from 'vue'
const x = ref(50), y = ref(50)
function move(event: PointerEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  x.value = (event.clientX - rect.left) / rect.width * 100
  y.value = (event.clientY - rect.top) / rect.height * 100
}
</script>
<template><div class="inspira-card-spotlight" :style="{ '--light-x': `${x}%`, '--light-y': `${y}%` }" @pointermove="move"><div class="inspira-card-spotlight__light" aria-hidden="true" /><slot /></div></template>
<style scoped>
.inspira-card-spotlight { position: relative; isolation: isolate; }
.inspira-card-spotlight__light { position: absolute; inset: 0; z-index: -1; border-radius: inherit; pointer-events: none; background: radial-gradient(circle at var(--light-x) var(--light-y), var(--color-lilac-soft), transparent 72%); opacity: 0; transition: opacity 240ms; }
.inspira-card-spotlight:hover .inspira-card-spotlight__light, .inspira-card-spotlight:focus-within .inspira-card-spotlight__light, .inspira-card-spotlight:active .inspira-card-spotlight__light { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .inspira-card-spotlight__light { transition: none; } }
</style>
