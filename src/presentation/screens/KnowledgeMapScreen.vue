<script setup lang="ts">
import { ref } from 'vue'

import { factFromId } from '@/domain/fact/multiplicationFact'
import ConstellationSky from '@/presentation/components/ConstellationSky.vue'
import PrimaryButton from '@/presentation/components/PrimaryButton.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import StarGlyph from '@/presentation/components/StarGlyph.vue'
import Sparkles from '@/presentation/components/inspira/Sparkles.vue'
import AnimatedCircularProgressBar from '@/presentation/components/inspira/AnimatedCircularProgressBar.vue'
import CompanionCue from '@/presentation/components/CompanionCue.vue'

/**
 * Knowledge map (PRD §3, DESIGN.md): a constellation of 66 facts on orbits.
 * A star is permanent; the "due for review" mark is separate and never dims it.
 */

const props = defineProps<{
  factIds: readonly string[]
  earnedFactIds: readonly string[]
  reviewFactIds: readonly string[]
  newlyUnlockedFactIds?: readonly string[]
}>()
const emit = defineEmits<{ back: []; review: []; 'reveals-consumed': [] }>()

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
    <h1 class="screen__title">Карта звёзд</h1>

    <p class="map__subtitle">Каждая звезда — пример, который ты запомнил.</p>
    <div class="map__galaxy">
    <Sparkles :particle-density="12" particle-color="#b9a5fa" />
    <p class="map__count">Открыто звёзд: {{ earnedFactIds.length }} из {{ factIds.length }}</p>
    <div class="map__chart">
    <ConstellationSky
      class="map__sky"
      :earned-fact-ids="earnedFactIds"
      :newly-unlocked-fact-ids="newlyUnlockedFactIds"
      variant="map"
      @reveals-consumed="emit('reveals-consumed')"
    />
    <AnimatedCircularProgressBar class="map__gauge" :value="earnedFactIds.length" :max="factIds.length">
      <StarGlyph :size="32" :earned="earnedFactIds.length > 0" />
    </AnimatedCircularProgressBar>
    </div>
    <div class="map__legend">
      <span><StarGlyph :size="20" />Открыта</span>
      <span><StarGlyph :size="20" :earned="false" />Впереди</span>
    </div>
    </div>
    <p v-if="earnedFactIds.length === 0" class="map__intro">Звезда открывается за пример, который ты решил сам и повторил спустя неделю. XP на звёзды не влияют.</p>
    <CompanionCue v-else :text="earnedFactIds.length === factIds.length ? 'Все звёзды твои! Остаётся иногда вспоминать.' : 'Твоя галактика растёт. Открытые звёзды остаются с тобой.'" />

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
        <p class="map__rule">Одна звезда открывается за один пример, который ты правильно решил сам и повторил не раньше чем через неделю. Ошибка до второй проверки начинает путь заново. Открытая звезда остаётся; XP на неё не влияют.</p>
        <ul class="map__facts" aria-label="Достижения по каждому факту">
          <li v-for="factId in factIds" :key="factId" :data-fact-id="factId">
            <div class="map__fact-heading">
              <span class="map__fact-star"><StarGlyph :size="24" :earned="isEarned(factId)" /></span>
              <strong>{{ factLabel(factId) }}</strong>
            </div>
            <div class="map__fact-statuses">
              <span :class="['map__fact-status', isEarned(factId) ? 'map__fact-status--earned' : 'map__fact-status--future']">{{ isEarned(factId) ? 'Звезда открыта' : 'Звезда впереди' }}</span>
              <span v-if="reviewFactIds.includes(factId)" class="map__fact-status map__fact-status--review">Пора повторить</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
    <div class="screen__actions">
      <PrimaryButton
        v-if="reviewFactIds.length > 0"
        label="Повторить сейчас"
        @click="$emit('review')"
      />
      <SecondaryButton label="Назад" @click="$emit('back')" />
    </div>
  </section>
</template>

<style scoped>
.map__count { margin: 0; font-weight: 700; }
.map__subtitle { color: var(--color-ink-muted); font-size: var(--font-size-label); }
.map__galaxy { position: relative; padding: var(--space-xl); overflow: hidden; border-radius: var(--radius-card); background: var(--color-cosmos); color: var(--color-on-cosmos); box-shadow: 0 12px 32px rgb(32 39 65 / .18); }
.map__galaxy > :not(.inspira-sparkles) { position: relative; z-index: 1; }
.map__chart { position: relative; max-width: 320px; margin-inline: auto; }
.map__gauge { position: absolute; width: 25.625%; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%; background: var(--color-cosmos); }
.map__galaxy .map__count { text-align: center; font-size: var(--font-size-body); font-weight: 900; }
.map__intro { color: var(--color-ink-muted); line-height: 1.6; }
.map__intro { font-size: var(--font-size-label); }
.map__rule { margin: 0 0 var(--space-xl); color: var(--color-ink-muted); font-size: var(--font-size-label); }

.map__sky { align-self: center; }

.map__legend { display: flex; justify-content: center; flex-wrap: wrap; gap: var(--space-xl); font-size: var(--font-size-label); }
.map__legend span,
.map__fact-heading { display: flex; align-items: center; gap: var(--space-sm); }

.map__reviews {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
}
.map__review-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.map__review-heading h2 {
  flex: 1 1 12rem;
  margin: 0;
  font-size: var(--font-size-heading);
  font-weight: 900;
  line-height: var(--line-height-body);
  overflow-wrap: normal;
}

.map__review-count {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  min-width: 36px;
  min-height: 36px;
  padding: var(--space-xs);
  border-radius: var(--radius-badge);
  background: var(--color-mint-soft);
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
  font-size: var(--font-size-body);
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
  border: 1px solid var(--color-divider);
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
  gap: var(--space-md);
  min-width: 0;
  padding: var(--space-md);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  background: var(--color-space);
}
.map__facts strong {
  font-size: var(--font-size-button);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}
.map__fact-star { display: grid; flex: 0 0 32px; place-items: center; width: 32px; height: 32px; border-radius: var(--radius-icon); background: var(--color-cosmos); }
.map__fact-statuses { display: flex; flex-wrap: wrap; gap: var(--space-xs); }
.map__fact-status { padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-icon); font-size: var(--font-size-meta); font-weight: 800; line-height: var(--line-height-label); }
.map__fact-status--earned { background: var(--color-success-surface); color: var(--color-success); }
.map__fact-status--future { background: var(--color-help-surface); color: var(--color-help-ink); }
.map__fact-status--review { background: var(--color-review-surface); color: var(--color-review-ink); }

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
