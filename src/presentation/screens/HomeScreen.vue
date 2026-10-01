<script setup lang="ts">
import { computed } from 'vue'

import ConstellationSky from '@/presentation/components/ConstellationSky.vue'
import LaunchButton from '@/presentation/components/LaunchButton.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import StreakBadge from '@/presentation/components/StreakBadge.vue'
import XpRoute from '@/presentation/components/XpRoute.vue'
import XpCounter from '@/presentation/components/XpCounter.vue'
import { formatDateRu } from '@/presentation/utils/formatDate'

/**
 * Home screen (PRD §3): play, streak, XP, level, knowledge stars.
 * "Due for review" is an action, not a reminder: while reviews exist the first
 * button is "Повторить" and goes straight to work. In maintenance mode the
 * streak is replaced by the number of facts due and the nearest date when
 * the queue is empty.
 */
const props = defineProps<{
  xp: number
  streakDays: number
  stars: number
  earnedFactIds: readonly string[]
  totalFacts: number
  reviewsToday: number
  maintenanceMode: boolean
  nextReviewDate: string | null
  launching: boolean
}>()
const emit = defineEmits<{ play: []; practice: []; review: []; map: []; report: [] }>()

const primaryLabel = computed(() => {
  if (props.reviewsToday > 0) return 'Повторить'
  return props.maintenanceMode ? 'Свободная практика' : 'Играть'
})

function primaryAction(): void {
  if (props.reviewsToday > 0) emit('review')
  else if (props.maintenanceMode) emit('practice')
  else emit('play')
}
</script>

<template>
  <section class="screen home">
    <h1 class="screen__title">Умножайка</h1>
    <div class="home__status">
      <XpCounter :xp="xp" />
      <StreakBadge v-if="!maintenanceMode" :days="streakDays" />
    </div>
    <XpRoute :total-xp="xp" :launching="launching" />
    <p v-if="maintenanceMode" class="home__maintenance">
      <template v-if="reviewsToday > 0">К повторению: {{ reviewsToday }}</template>
      <template v-else>
        На сегодня повторений нет<template v-if="nextReviewDate">
          · ближайшее {{ formatDateRu(nextReviewDate) }}</template>
      </template>
    </p>

    <div class="screen__actions">
      <!-- One obvious action: while reviews exist, go review. -->
      <LaunchButton :label="primaryLabel" :disabled="launching" :launching="launching" @click="primaryAction" />
      <SecondaryButton
        v-if="reviewsToday > 0 && !maintenanceMode"
        label="Играть"
        :disabled="launching"
        @click="emit('play')"
      />
      <SecondaryButton
        v-if="reviewsToday > 0 && maintenanceMode"
        label="Свободная практика"
        :disabled="launching"
        @click="emit('practice')"
      />
    </div>
    <section class="home__knowledge" aria-label="Звёзды знаний">
      <ConstellationSky :earned-fact-ids="earnedFactIds" variant="preview" />
      <div class="home__knowledge-content">
        <p class="home__stars">Звёзды знаний: {{ stars }} из {{ totalFacts }}</p>
        <SecondaryButton label="Карта звёзд" @click="emit('map')" />
      </div>
    </section>
    <SecondaryButton class="home__report" label="Отчёт для взрослого" @click="emit('report')" />
  </section>
</template>

<style scoped>
.home__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.home__knowledge {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: var(--space-lg);
  padding-block: var(--space-lg);
  border-block: 1px solid var(--color-control-outline);
}
.home__knowledge-content { display: grid; gap: var(--space-md); }
.home__report {
  background: transparent;
  color: var(--color-on-space);
  border-color: transparent;
  font-size: var(--font-size-label);
}
.home__report:active:not(:disabled) { background: var(--color-space-raised); }
@media (hover: hover) {
  .home__report:hover:not(:disabled) { background: var(--color-space-raised); }
}

.home__stars,
.home__maintenance {
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}
.home .screen__title { overflow-wrap: anywhere; }
</style>
