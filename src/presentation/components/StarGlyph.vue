<script setup lang="ts">
import { useId } from 'vue'

// Phosphor Icons, star-fill (MIT). The original silhouette is preserved.
// Source and license: public/licenses/phosphor-icons.txt.
withDefaults(defineProps<{ earned?: boolean; size?: number }>(), { earned: true, size: 32 })
const goldId = useId()
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
    <defs v-if="earned">
      <linearGradient :id="goldId" x1="32" y1="24" x2="192" y2="232" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="var(--color-star-highlight)" />
        <stop offset=".58" stop-color="var(--color-star)" />
        <stop offset="1" stop-color="var(--color-star-edge)" />
      </linearGradient>
    </defs>
    <path
      class="star-glyph__shape"
      :fill="earned ? `url(#${goldId})` : 'var(--star-empty-fill, var(--color-space-raised))'"
      d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"
    />
  </svg>
</template>

<style scoped>
.star-glyph { display: block; flex: 0 0 auto; overflow: visible; }
.star-glyph__shape {
  stroke: var(--color-star-idle);
  stroke-width: 14;
  stroke-linejoin: round;
}
.star-glyph--earned .star-glyph__shape {
  stroke: var(--color-star-edge);
  stroke-width: 7;
}
</style>
