<script setup lang="ts">
import PrimaryButton from '@/presentation/components/PrimaryButton.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import StreakBadge from '@/presentation/components/StreakBadge.vue'
import XpCounter from '@/presentation/components/XpCounter.vue'
import { formatDateRu } from '@/presentation/utils/formatDate'

/**
 * Главный экран (PRD §3): «Играть», серия, XP, уровень, звёзды.
 * В поддерживающем режиме вместо серии — число фактов к повторению
 * и ближайшая дата, когда очередь пуста.
 */
defineProps<{
  xp: number
  level: number
  streakDays: number
  stars: number
  totalFacts: number
  reviewsToday: number
  maintenanceMode: boolean
  nextReviewDate: string | null
}>()
defineEmits<{ play: []; practice: []; map: []; report: [] }>()
</script>

<template>
  <section class="screen home">
    <h1 class="screen__title">Математическая экспедиция</h1>

    <svg class="home__orbit" viewBox="0 0 320 96" aria-hidden="true">
      <ellipse cx="160" cy="48" rx="136" ry="30" />
      <ellipse cx="160" cy="48" rx="80" ry="20" />
      <circle cx="160" cy="48" r="9" /><circle cx="24" cy="48" r="4" /><circle cx="240" cy="48" r="4" />
    </svg>
    <div class="home__status">
      <XpCounter :xp="xp" :level="level" />
      <StreakBadge v-if="!maintenanceMode" :days="streakDays" />
      <p v-else class="home__maintenance">
        <template v-if="reviewsToday > 0">К повторению: {{ reviewsToday }}</template>
        <template v-else>
          На сегодня повторений нет<template v-if="nextReviewDate">
            · ближайшее {{ formatDateRu(nextReviewDate) }}</template>
        </template>
      </p>
      <p class="home__stars">Звёзды знаний: {{ stars }} из {{ totalFacts }}</p>
    </div>

    <div class="screen__actions">
      <PrimaryButton v-if="!maintenanceMode || reviewsToday > 0" :label="maintenanceMode ? 'Повторить' : 'Играть'" @click="$emit('play')" />
      <PrimaryButton v-else label="Свободная практика" @click="$emit('practice')" />
      <SecondaryButton
        v-if="maintenanceMode && reviewsToday > 0"
        label="Свободная практика"
        @click="$emit('practice')"
      />
      <SecondaryButton label="Карта звёзд" @click="$emit('map')" />
      <SecondaryButton label="Отчёт для взрослого" @click="$emit('report')" />
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
.home__orbit {
  width: 100%;
  height: 96px;
  fill: none;
  stroke: var(--color-on-space);
  stroke-width: 2;
}
.home__orbit circle {
  fill: var(--color-space);
}
</style>
