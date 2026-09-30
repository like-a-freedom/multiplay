<script setup lang="ts">
import { computed } from 'vue'

import { XP_PER_LEVEL } from '@/domain/game/experience'
import ExpeditionShip from '@/presentation/components/ExpeditionShip.vue'
import { xpRoute } from '@/presentation/utils/xpRoute'

type Point = { x: number; y: number }

const props = withDefaults(defineProps<{
  totalXp: number
  launching?: boolean
}>(), { launching: false })

// Point zero is the launch pad; the ten remaining points are earned at 10 XP steps.
const routePoints: readonly Point[] = [
  { x: 32, y: 148 },
  { x: 59, y: 137 },
  { x: 86, y: 145 },
  { x: 111, y: 116 },
  { x: 137, y: 91 },
  { x: 163, y: 103 },
  { x: 190, y: 126 },
  { x: 218, y: 92 },
  { x: 245, y: 63 },
  { x: 276, y: 78 },
  { x: 331, y: 33 },
]
const waypoints = routePoints.slice(1).map((point, index) => ({ ...point, xp: (index + 1) * 10 }))
const progress = computed(() => xpRoute(props.totalXp))
const shipPosition = computed(() => {
  const routeStep = progress.value.fraction * (routePoints.length - 1)
  const startIndex = Math.floor(routeStep)
  const endIndex = Math.min(startIndex + 1, routePoints.length - 1)
  const blend = routeStep - startIndex
  const start = routePoints[startIndex]
  const end = routePoints[endIndex]
  return {
    x: start.x + (end.x - start.x) * blend,
    y: start.y + (end.y - start.y) * blend,
  }
})
const shipLabel = computed(
  () => `Корабль экспедиции: уровень ${progress.value.level}, ${progress.value.earnedInLevel} из ${XP_PER_LEVEL} XP`,
)
</script>

<template>
  <section class="xp-route" aria-label="Маршрут опыта">
    <div class="xp-route__heading">
      <h2 class="xp-route__title">Экспедиция</h2>
      <span class="xp-route__level">Уровень {{ progress.level }}</span>
    </div>
    <svg
      class="xp-route__map"
      viewBox="0 0 360 184"
      role="img"
      :aria-label="shipLabel"
      :data-level="progress.level"
      :data-earned-in-level="progress.earnedInLevel"
    >
      <defs>
        <linearGradient id="xp-route-glow" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="var(--color-action)" stop-opacity=".18" />
          <stop offset="1" stop-color="var(--color-star)" stop-opacity=".18" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="359" height="183" rx="20" class="xp-route__surface" />
      <circle cx="292" cy="112" r="57" fill="url(#xp-route-glow)" />
      <path d="M 32 148 C 53 121 70 164 91 139 C 112 114 132 77 153 96 C 176 117 181 146 205 111 C 226 80 242 49 262 67 C 282 85 298 43 331 33" class="xp-route__track" />
      <circle cx="32" cy="148" r="7" class="xp-route__launch-pad" />
      <g v-for="point in waypoints" :key="point.xp">
        <circle :cx="point.x" :cy="point.y" :r="point.xp <= progress.earnedInLevel ? 6 : 4.5" :class="['xp-route__waypoint', { 'xp-route__waypoint--earned': point.xp <= progress.earnedInLevel }]" />
        <circle v-if="point.xp <= progress.earnedInLevel" :cx="point.x" :cy="point.y" r="10" class="xp-route__waypoint-halo" />
      </g>
      <ExpeditionShip :x="shipPosition.x" :y="shipPosition.y" :launching="launching" />
    </svg>
    <p class="xp-route__progress">{{ progress.earnedInLevel }} из {{ XP_PER_LEVEL }} XP до следующего уровня</p>
  </section>
</template>

<style scoped>
.xp-route {
  display: grid;
  gap: var(--space-sm);
  width: 100%;
}
.xp-route__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  min-width: 0;
}
.xp-route__title,
.xp-route__level,
.xp-route__progress {
  margin: 0;
  color: var(--color-on-space);
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
}
.xp-route__title { font-weight: 700; }
.xp-route__level {
  color: var(--color-star-highlight);
  white-space: nowrap;
}
.xp-route__map {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.xp-route__surface {
  fill: var(--color-space-raised);
  stroke: color-mix(in srgb, var(--color-control-outline) 54%, transparent);
  stroke-width: 1;
}
.xp-route__track {
  fill: none;
  stroke: var(--color-control-outline);
  stroke-dasharray: 3 7;
  stroke-linecap: round;
  stroke-width: 2.5;
}
.xp-route__launch-pad {
  fill: var(--color-space);
  stroke: var(--color-star);
  stroke-width: 2;
}
.xp-route__waypoint {
  fill: var(--color-space);
  stroke: var(--color-star-idle);
  stroke-width: 1.5;
}
.xp-route__waypoint--earned {
  fill: var(--color-star);
  stroke: var(--color-star-highlight);
  stroke-width: 1;
}
.xp-route__waypoint-halo {
  fill: none;
  stroke: var(--color-star);
  stroke-width: 1;
  opacity: 0.2;
}
.xp-route__progress {
  color: var(--color-on-space);
  font-variant-numeric: tabular-nums;
}
@media (max-width: 360px) {
  .xp-route__heading {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }
}

</style>
