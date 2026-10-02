<script setup lang="ts">
import { computed } from 'vue'

import GameIcon from '@/presentation/components/GameIcon.vue'
import OrbitScene from '@/presentation/components/OrbitScene.vue'
import BorderBeam from '@/presentation/components/inspira/BorderBeam.vue'
import CardSpotlight from '@/presentation/components/inspira/CardSpotlight.vue'

import ConstellationSky from '@/presentation/components/ConstellationSky.vue'
import LaunchButton from '@/presentation/components/LaunchButton.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import StreakBadge from '@/presentation/components/StreakBadge.vue'
import XpRoute from '@/presentation/components/XpRoute.vue'
import XpCounter from '@/presentation/components/XpCounter.vue'
import { formatDateRu } from '@/presentation/utils/formatDate'

/**
 * Home screen (PRD §3): play, streak, XP, level, knowledge stars.
 * "Due for review" is an action, not a reminder: when reviews exist the first
 * button opens them directly. In maintenance mode the
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
const emit = defineEmits<{ play: []; practice: []; review: []; map: [] }>()

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
    <header class="home__header">
      <h1 class="screen__title home__brand"><span class="home__brand-symbol" aria-hidden="true">×</span> Умножайка</h1>
      <XpCounter :xp="xp" />
    </header>
    <div class="home__greeting">
      <h2>{{ maintenanceMode ? 'Вся галактика твоя!' : 'К звёздам!' }}</h2>
      <p>{{ maintenanceMode ? 'Орби рядом. Повторим знакомое?' : 'По одному примеру. В своём темпе.' }}</p>
    </div>
    <OrbitScene :launching="launching" />
    <div class="home__mission">
      <BorderBeam />
      <div class="home__mission-heading">
        <h2>{{ reviewsToday > 0 ? 'Вспомним знакомое' : maintenanceMode ? 'Летим дальше?' : 'Твоя следующая миссия' }}</h2>
        <StreakBadge v-if="!maintenanceMode && streakDays > 0" :days="streakDays" />
      </div>
      <div v-if="reviewsToday > 0" class="home__review-summary">
        <strong class="home__review-number" :aria-label="`К повторению: ${reviewsToday}`">{{ reviewsToday }}</strong>
        <div><strong>Примеры ждут повторения</strong><p>Орби поможет вспомнить.</p></div>
      </div>
      <p v-else-if="maintenanceMode" class="home__mission-copy">На сегодня повторений нет<template v-if="nextReviewDate"> · ближайшее {{ formatDateRu(nextReviewDate) }}</template></p>
      <p v-else class="home__mission-copy">Короткий полёт, новые открытия.</p>
      <div class="screen__actions">
        <LaunchButton :label="primaryLabel" :disabled="launching" :launching="launching" @click="primaryAction" />
        <SecondaryButton v-if="reviewsToday > 0" :label="maintenanceMode ? 'Свободная практика' : 'Играть'" :disabled="launching" @click="maintenanceMode ? emit('practice') : emit('play')" />
      </div>
    </div>
    <XpRoute class="home__route" :total-xp="xp" :launching="launching" />
    <CardSpotlight class="home__knowledge-spotlight">
      <section class="home__knowledge" aria-label="Звёзды знаний">
        <div class="home__sky"><ConstellationSky :earned-fact-ids="earnedFactIds" variant="preview" /></div>
        <div class="home__knowledge-content">
          <h2>Твоя галактика</h2>
          <p class="home__stars">Звёзды знаний: {{ stars }} из {{ totalFacts }}</p>
          <button class="home__map-link" type="button" @click="emit('map')">Карта звёзд <GameIcon name="arrow" :size="18" /></button>
        </div>
      </section>
    </CardSpotlight>
  </section>
</template>
<style scoped>
.home { gap: var(--space-lg); }
.home__header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-md); }
.home__brand { display: flex; align-items: center; gap: var(--space-sm); font-size: var(--font-size-heading); letter-spacing: -.025em; }
.home__brand-symbol { display: grid; place-content: center; width: 32px; height: 32px; border-radius: var(--radius-icon); background: var(--color-lilac); color: var(--color-ink); font-size: var(--font-size-symbol); line-height: 1; }
.home__header :deep(.xp-counter) { padding: var(--space-sm) var(--space-md); border-radius: var(--radius-badge); background: var(--color-lilac-soft); font-size: var(--font-size-meta); font-weight: 800; }
.home__greeting { padding-top: var(--space-lg); text-align: center; }
.home__greeting h2 { margin: 0 0 var(--space-sm); font-size: clamp(var(--font-size-title), 12vw, var(--font-size-display)); font-weight: 900; letter-spacing: -.04em; line-height: 1.1; text-wrap: balance; overflow-wrap: normal; }
.home__greeting p { color: var(--color-ink-muted); }
.home :deep(.orbit-scene) { margin-top: -8px; margin-bottom: -12px; }
.home__mission { position: relative; display: grid; gap: var(--space-md); padding: var(--space-xl); border-radius: var(--radius-card); background: var(--color-paper); box-shadow: var(--shadow-card); }
.home__mission-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.home__mission-heading h2 { margin: 0; font-size: var(--font-size-button); font-weight: 900; }
.home__mission-copy { color: var(--color-ink-muted); font-size: var(--font-size-label); }
.home__review-summary { display: flex; align-items: center; gap: var(--space-md); padding-block: var(--space-xs); }
.home__review-number { flex: 0 0 auto; display: grid; place-items: center; min-width: 48px; min-height: 48px; padding: var(--space-sm); border-radius: var(--radius-control); background: var(--color-review-surface); color: var(--color-review-ink); font-size: var(--font-size-title); line-height: 1; font-variant-numeric: tabular-nums; }
.home__review-summary div { min-width: 0; }
.home__review-summary div > strong { display: block; font-size: var(--font-size-label); font-weight: 900; }
.home__review-summary p { margin-top: var(--space-xs); color: var(--color-ink-muted); font-size: var(--font-size-label); }
.home__route { padding: var(--space-sm) var(--space-lg); }
.home__route :deep(.xp-route__title) { color: var(--color-ink-muted); }
.home__route :deep(.xp-route__level) { color: var(--color-focus); font-weight: 900; }
.home__route :deep(.xp-route__progress) { color: var(--color-ink-muted); font-size: var(--font-size-label); text-align: center; }
.home__route :deep(.xp-route__surface) { fill: var(--color-lilac-soft); stroke: none; }
.home__knowledge-spotlight { border: 1px solid var(--color-divider); border-radius: var(--radius-card); background: var(--color-paper); }
.home__knowledge { display: grid; grid-template-columns: 144px minmax(0, 1fr); align-items: center; gap: var(--space-lg); padding: var(--space-lg); }
.home__sky { background: var(--color-cosmos); border-radius: var(--radius-control); overflow: hidden; }
.home__knowledge-content { display: grid; gap: var(--space-xs); }
.home__knowledge-content h2 { margin: 0; font-size: var(--font-size-button); font-weight: 900; }
.home__stars { font-size: var(--font-size-label); color: var(--color-ink-muted); }
.home__map-link { display: flex; align-items: center; gap: var(--space-sm); width: fit-content; min-height: 48px; padding: var(--space-sm) 0; border: 0; background: transparent; color: var(--color-focus); font: inherit; font-size: var(--font-size-label); font-weight: 900; cursor: pointer; }
@media (max-width: 360px) {
  .home__header { flex-wrap: wrap; }
  .home__knowledge { grid-template-columns: 1fr; padding: var(--space-lg); }
  .home__sky { width: 176px; max-width: 100%; margin-inline: auto; }
  .home__mission :deep(.inspira-shimmer-button) { padding-inline: var(--space-lg); }
  .home__mission :deep(.inspira-shimmer-button__content svg) { display: none; }
  .home__mission :deep(.launch-button__label) { white-space: nowrap; }
}
</style>
