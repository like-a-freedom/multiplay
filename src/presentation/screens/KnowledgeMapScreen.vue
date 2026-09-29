<script setup lang="ts">
import { computed } from 'vue'

import { factFromId } from '@/domain/fact/multiplicationFact'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import { STAR_PATH, constellationPositions } from '@/presentation/utils/constellation'

/**
 * Карта знаний (PRD §3, DESIGN.md): созвездие из 66 фактов на орбитах.
 * Звезда открыта навсегда; «Пора повторить» — отдельная подпись, без гашения звезды.
 */

const props = defineProps<{
  factIds: readonly string[]
  earnedFactIds: readonly string[]
  reviewFactIds: readonly string[]
}>()
defineEmits<{ back: [] }>()

const size = 320
const positions = computed(() => constellationPositions(props.factIds.length, size))
const orbits = [size * 0.18, size * 0.3, size * 0.42]

function isEarned(factId: string): boolean {
  return props.earnedFactIds.includes(factId)
}

function factLabel(factId: string): string {
  const fact = factFromId(factId)
  return `${fact.factors[0]} × ${fact.factors[1]}`
}
</script>

<template>
  <section class="screen map">
    <h1 class="screen__title">Что уже помню</h1>

    <p v-if="earnedFactIds.length === 0">Начнём экспедицию</p>
    <p v-else>Открыто звёзд: {{ earnedFactIds.length }} из {{ factIds.length }}</p>

    <svg
      class="map__sky"
      :viewBox="`0 0 ${size} ${size}`"
      role="img"
      aria-hidden="true"
    >
      <circle
        v-for="radius in orbits"
        :key="radius"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        class="map__orbit"
      />
      <path
        v-for="(position, index) in positions"
        :key="factIds[index]"
        :d="STAR_PATH"
        :transform="`translate(${position.x} ${position.y})`"
        :class="isEarned(factIds[index]) ? 'map__star--earned' : 'map__star--idle'"
      />
    </svg>

    <p class="map__reviews">
      Пора повторить: {{ reviewFactIds.length }}
      <template v-if="reviewFactIds.length > 0">
        — {{ reviewFactIds.map(factLabel).join(', ') }}
      </template>
    </p>

    <div class="screen__actions">
      <SecondaryButton label="Назад" @click="$emit('back')" />
    </div>
  </section>
</template>

<style scoped>
.map__sky {
  width: 100%;
  max-width: 320px;
  align-self: center;
}

.map__orbit {
  fill: none;
  stroke: var(--color-divider);
  stroke-width: 1;
}

.map__star--earned {
  fill: var(--color-streak);
}

.map__star--idle {
  fill: none;
  stroke: var(--color-control-outline);
  stroke-width: 1.5;
}

.map__reviews {
  margin: 0;
  color: var(--color-on-space);
}
</style>
