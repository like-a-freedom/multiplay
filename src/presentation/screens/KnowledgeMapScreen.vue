<script setup lang="ts">
import { computed, ref } from 'vue'

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
const factsExpanded = ref(false)

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

    <section class="map__reviews" aria-labelledby="map-review-title">
      <div class="map__review-heading">
        <h2 id="map-review-title">Пора повторить</h2>
        <span class="map__review-count" :aria-label="`${reviewFactIds.length} фактов`">{{ reviewFactIds.length }}</span>
      </div>
      <ul v-if="reviewFactIds.length > 0" class="map__review-grid" aria-label="Примеры для повторения">
        <li v-for="(factId, index) in reviewFactIds" :key="factId" class="map__review-card">
          <span class="map__review-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ factLabel(factId) }}</strong>
        </li>
      </ul>
      <p v-else class="map__review-empty">На сегодня повторений нет. Можно играть свободно.</p>
    </section>

    <section class="map__archive" aria-label="Все факты и достижения">
      <button
        class="map__archive-toggle"
        type="button"
        :aria-expanded="factsExpanded"
        aria-controls="map-facts"
        @click="factsExpanded = !factsExpanded"
      >
        <span class="map__archive-text">
          <strong>Все факты и достижения</strong>
          <small>{{ factIds.length }} примеров на карте</small>
        </span>
        <svg class="map__archive-chevron" :class="{ 'map__archive-chevron--open': factsExpanded }" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div v-show="factsExpanded" id="map-facts" class="map__archive-content">
        <ul class="map__facts" aria-label="Достижения по каждому факту">
          <li v-for="factId in factIds" :key="factId">
            <strong>{{ factLabel(factId) }}</strong>
            <span>{{ isEarned(factId) ? 'Звезда открыта' : 'Звезда впереди' }}</span>
            <span v-if="reviewFactIds.includes(factId)">Пора повторить</span>
          </li>
        </ul>
      </div>
    </section>
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
  fill: var(--color-on-space);
}

.map__star--idle {
  fill: none;
  stroke: var(--color-control-outline);
  stroke-width: 2;
}

.map__reviews {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
}
.map__sky {
  background: var(--color-space-raised);
  border-radius: var(--radius-card);
}

.map__review-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.map__review-heading h2 {
  margin: 0;
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
}

.map__review-count {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  min-width: 36px;
  min-height: 36px;
  padding: var(--space-xs);
  border-radius: var(--radius-badge);
  background: var(--color-space-raised);
  color: var(--color-on-space);
  font-size: var(--font-size-label);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.map__review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.map__review-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
  padding: var(--space-md);
  border: 1px solid var(--color-control-outline);
  border-radius: var(--radius-control);
  background: var(--color-white);
}

.map__review-card strong {
  font-size: 1.375rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.map__review-index {
  color: var(--color-ink-muted);
  font-size: var(--font-size-label);
  font-variant-numeric: tabular-nums;
}

.map__review-empty { color: var(--color-ink-muted); }

.map__archive {
  overflow: hidden;
  border: 1px solid var(--color-control-outline);
  border-radius: var(--radius-card);
  background: var(--color-space-raised);
  color: var(--color-on-space);
}

.map__archive-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  width: 100%;
  min-height: 64px;
  padding: var(--space-lg);
  border: 0;
  background: transparent;
  color: var(--color-on-space);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.map__archive-toggle:focus-visible {
  outline: 2px solid var(--color-focus-on-space);
  outline-offset: -4px;
}

.map__archive-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.map__archive-text small {
  color: var(--color-on-space);
  font-size: var(--font-size-label);
  opacity: .8;
}

.map__archive-chevron {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map__archive-chevron--open { transform: rotate(180deg); }

.map__archive-content {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-control-outline);
}

.map__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
  list-style: none;
  margin: 0;
  padding: 0;
}
.map__facts li {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 0;
  padding: var(--space-md);
  border: 1px solid var(--color-control-outline);
  border-radius: var(--radius-control);
  background: var(--color-space);
}
.map__facts strong {
  font-variant-numeric: tabular-nums;
}
.map__facts span {
  font-size: var(--font-size-label);
  color: var(--color-on-space);
}

@media (max-width: 360px) {
  .map__review-grid,
  .map__facts { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: no-preference) {
  .map__archive-chevron { transition: transform 180ms ease-out; }
  .map__archive-content { animation: archive-appear 220ms ease-out; }
}

@keyframes archive-appear {
  from { opacity: .7; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
