<script setup lang="ts">
/** Inspira UI SparklesText (MIT): rotating/scaling four-point sparkles, made finite for milestones. */
defineProps<{ text: string }>()
</script>
<template>
  <span class="inspira-sparkles-text">{{ text }}
    <svg v-for="(point, index) in [{ x: -4, y: 12 }, { x: 96, y: -3 }, { x: 87, y: 80 }]" :key="index" class="inspira-sparkles-text__star" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" :style="{ left: `${point.x}%`, top: `${point.y}%`, animationDelay: `${index * 200}ms` }"><path d="m12 1 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" /></svg>
  </span>
</template>
<style scoped>
.inspira-sparkles-text { position: relative; display: inline-block; }
.inspira-sparkles-text__star { position: absolute; color: var(--color-star); pointer-events: none; animation: sparkle-text 1.2s 2 both; }
@keyframes sparkle-text { 0%,100% { opacity: 0; transform: scale(.3) rotate(75deg); } 45% { opacity: 1; transform: scale(1) rotate(120deg); } }
@media (prefers-reduced-motion: reduce) { .inspira-sparkles-text__star { animation: none; } }
</style>
