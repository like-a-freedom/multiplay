<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { allFacts } from '@/domain/fact/multiplicationFact'
import StarGlyph from '@/presentation/components/StarGlyph.vue'
import { constellationPositions } from '@/presentation/utils/constellation'

const props = withDefaults(defineProps<{
  earnedFactIds: readonly string[]
  newlyUnlockedFactIds?: readonly string[]
  variant: 'preview' | 'map' | 'final'
}>(), {
  newlyUnlockedFactIds: () => [],
})
const emit = defineEmits<{ 'reveals-consumed': [] }>()

const size = 320
const starSize = computed(() => props.variant === 'final' ? 24 : 22)
const galaxyUrl = `${import.meta.env.BASE_URL}art/orbit-galaxy.webp`
const facts = allFacts()
const factIds = facts.map((fact) => fact.id)
const positions = constellationPositions(facts.length, size)
const positionByFactId = new Map(factIds.map((factId, index) => [factId, positions[index]]))
const earnedFactIdSet = computed(() => new Set(props.earnedFactIds))
const reducedMotion = ref(typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const validRevealIds = [...new Set(props.newlyUnlockedFactIds)]
  .filter((factId) => positionByFactId.has(factId) && earnedFactIdSet.value.has(factId))
const revealFactIds = ref(reducedMotion.value ? [] : validRevealIds)
const revealFactIdSet = computed(() => new Set(revealFactIds.value))
const orbits = [size * 0.18, size * 0.3, size * 0.42]
let revealTimer: number | undefined
let motionQuery: MediaQueryList | undefined

const motionChanged = (event: MediaQueryListEvent) => {
  reducedMotion.value = event.matches
  if (event.matches) revealFactIds.value = []
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener?.('change', motionChanged)
  if (validRevealIds.length > 0) {
    emit('reveals-consumed')
    if (revealFactIds.value.length > 0) {
      revealTimer = window.setTimeout(() => {
        revealFactIds.value = []
      }, 1250)
    }
  }
})

onBeforeUnmount(() => {
  if (revealTimer !== undefined) window.clearTimeout(revealTimer)
  motionQuery?.removeEventListener?.('change', motionChanged)
})
</script>

<template>
  <svg
    :class="['constellation-sky', `constellation-sky--${variant}`]"
    :viewBox="`0 0 ${size} ${size}`"
    aria-hidden="true"
    focusable="false"
  >
    <image class="constellation-sky__galaxy" :href="galaxyUrl" :width="size" :height="size" preserveAspectRatio="xMidYMid slice" />
    <rect class="constellation-sky__veil" :width="size" :height="size" />
    <circle
      v-for="radius in orbits"
      :key="radius"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      class="constellation-sky__orbit"
    />
    <circle :cx="size / 2" :cy="size / 2" r="4" class="constellation-sky__beacon" />
    <line
      v-for="factId in revealFactIds"
      :key="factId"
      :x1="size / 2"
      :y1="size / 2"
      :x2="positionByFactId.get(factId)?.x"
      :y2="positionByFactId.get(factId)?.y"
      :data-fact-id="factId"
      class="constellation-sky__reveal-line"
    />
    <StarGlyph
      v-for="(factId, index) in factIds"
      :key="factId"
      :x="positions[index].x - starSize / 2"
      :y="positions[index].y - starSize / 2"
      :size="starSize"
      :earned="earnedFactIdSet.has(factId)"
      :data-fact-id="factId"
      :data-earned="earnedFactIdSet.has(factId)"
      :data-newly-unlocked="revealFactIdSet.has(factId)"
      :class="[
        'constellation-sky__star',
        earnedFactIdSet.has(factId) ? 'constellation-sky__star--earned' : 'constellation-sky__star--idle',
        revealFactIdSet.has(factId) ? 'constellation-sky__star--revealing' : '',
        variant === 'map' ? (earnedFactIdSet.has(factId) ? 'map__star--earned' : 'map__star--idle') : '',
      ]"
    />
  </svg>
</template>

<style scoped>
.constellation-sky {
  display: block;
  width: 100%;
  height: auto;
  overflow: hidden;
  aspect-ratio: 1;
}

.constellation-sky--preview {
  max-width: 176px;
  margin-inline: auto;
}
.constellation-sky--map {
  max-width: 320px;
  border-radius: var(--radius-card);
  background: var(--color-cosmos);
}
.constellation-sky--final {
  max-width: 360px;
  border-radius: var(--radius-card);
  background: var(--color-cosmos);
}

.constellation-sky__veil {
  fill: var(--color-cosmos);
  opacity: .48;
}

.constellation-sky__orbit {
  fill: none;
  stroke: var(--color-lilac);
  stroke-width: .8;
  opacity: .3;
}

.constellation-sky__beacon {
  fill: var(--color-control-outline);
  stroke: var(--color-space);
  stroke-width: 2;
}

.constellation-sky__reveal-line {
  fill: none;
  stroke: var(--color-star-highlight);
  stroke-width: 1.6;
  stroke-dasharray: 360;
  stroke-dashoffset: 360;
  opacity: .7;
}

.constellation-sky__star--revealing {
  transform-box: fill-box;
  transform-origin: center;
}

@media (prefers-reduced-motion: no-preference) {
  .constellation-sky__reveal-line {
    animation: constellation-line-arrive 720ms ease-out both;
  }
  .constellation-sky__star--revealing {
    animation: constellation-star-arrive 620ms cubic-bezier(.16, 1, .3, 1) both;
  }
}

@keyframes constellation-line-arrive {
  to { stroke-dashoffset: 0; opacity: .52; }
}

@keyframes constellation-star-arrive {
  0% { transform: scale(.55); }
  65% { transform: scale(1.16); }
  100% { transform: scale(1); }
}
</style>
