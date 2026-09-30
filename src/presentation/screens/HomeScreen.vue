<script setup lang="ts">
import { computed } from 'vue'

import LaunchButton from '@/presentation/components/LaunchButton.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import StreakBadge from '@/presentation/components/StreakBadge.vue'
import XpRoute from '@/presentation/components/XpRoute.vue'
import StarGlyph from '@/presentation/components/StarGlyph.vue'
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

    <XpRoute :total-xp="xp" :launching="launching" />
    <div class="home__status">
      <XpCounter :xp="xp" />
      <StreakBadge v-if="!maintenanceMode" :days="streakDays" />
      <p v-else class="home__maintenance">
        <template v-if="reviewsToday > 0">К повторению: {{ reviewsToday }}</template>
        <template v-else>
          На сегодня повторений нет<template v-if="nextReviewDate">
            · ближайшее {{ formatDateRu(nextReviewDate) }}</template>
        </template>
      </p>
      <p class="home__stars"><StarGlyph :size="24" :earned="stars > 0" />Звёзды знаний: {{ stars }} из {{ totalFacts }}</p>
    </div>

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
      <SecondaryButton label="Карта звёзд" @click="emit('map')" />
      <SecondaryButton label="Отчёт для взрослого" @click="emit('report')" />
    </div>
  </section>
</template>

<style scoped>
.home__status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  background: var(--color-space-raised);
  border-radius: var(--radius-card);
  padding: var(--space-xl);
}

.home__stars,
.home__maintenance {
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}
.home__stars { display: flex; align-items: center; gap: var(--space-sm); }
</style>
