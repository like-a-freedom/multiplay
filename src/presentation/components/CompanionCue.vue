<script setup lang="ts">
withDefaults(defineProps<{ text: string; mood?: 'calm' | 'happy' | 'thinking' }>(), { mood: 'calm' })
const mascotUrl = `${import.meta.env.BASE_URL}art/orbit-mascot.webp`
</script>
<template><div class="companion-cue" :class="`companion-cue--${mood}`"><img :src="mascotUrl" alt="" width="64" height="64" /><p>{{ text }}</p></div></template>
<style scoped>
.companion-cue { display: flex; align-items: center; gap: var(--space-md); color: var(--color-ink-muted); font-size: var(--font-size-label); }
.companion-cue img { width: 54px; height: 54px; object-fit: contain; flex-shrink: 0; }
.companion-cue p { max-width: 28ch; }
.companion-cue--happy { color: var(--color-success); }
.companion-cue--thinking { color: var(--color-review-ink); }
</style>
