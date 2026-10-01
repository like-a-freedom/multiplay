<script setup lang="ts">
import { computed } from 'vue'

// Original generated ceramic stars share Orbi's materials and light.
// The SVG container preserves each fact's stable coordinates and native image aspect ratio.
const props = withDefaults(defineProps<{ earned?: boolean; size?: number }>(), { earned: true, size: 32 })
const starUrl = computed(() => `${import.meta.env.BASE_URL}art/orbit-star-${props.earned ? 'earned' : 'idle'}.webp`)
</script>

<template>
  <svg
    class="star-glyph"
    :class="{ 'star-glyph--earned': earned }"
    :width="size"
    :height="size"
    viewBox="0 0 256 256"
    aria-hidden="true"
    focusable="false"
  >
    <image class="star-glyph__art" :href="starUrl" width="256" height="256" preserveAspectRatio="xMidYMid meet" />
  </svg>
</template>

<style scoped>
.star-glyph { display: block; flex: 0 0 auto; overflow: visible; }
</style>
