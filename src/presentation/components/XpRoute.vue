<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { XP_PER_LEVEL } from '@/domain/game/experience'
import AnimatedBeam from '@/presentation/components/inspira/AnimatedBeam.vue'
import ExpeditionShip from '@/presentation/components/ExpeditionShip.vue'
import { xpRoute } from '@/presentation/utils/xpRoute'

type Point = { x: number; y: number }

const props = withDefaults(defineProps<{
  totalXp: number
  fromXp?: number | null
  variant?: 'home' | 'finish'
  launching?: boolean
}>(), {
  fromXp: null,
  variant: 'home',
  launching: false,
})

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
const target = computed(() => xpRoute(props.totalXp))
const start = computed(() => xpRoute(Math.max(0, props.fromXp ?? props.totalXp)))
const hasEarnedXp = computed(() =>
  props.variant === 'finish' && props.fromXp !== null && props.fromXp !== undefined && props.totalXp > props.fromXp,
)
const displayLevel = ref(hasEarnedXp.value ? start.value.level : target.value.level)
const displayFraction = ref(hasEarnedXp.value ? start.value.fraction : target.value.fraction)
const isAnimating = ref(false)
const beamFinished = ref(false)
const prefersReducedMotion = ref(false)
const phaseStart = ref(start.value.fraction)
const phaseEnd = ref(target.value.fraction)
const phaseDuration = ref(650)
const beamKey = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const fromRef = ref<SVGCircleElement | null>(null)
const toRef = ref<SVGCircleElement | null>(null)
let frameId = 0
let mounted = true

const beamActive = computed(() =>
  isAnimating.value && !beamFinished.value && !prefersReducedMotion.value && phaseEnd.value > phaseStart.value,
)
const currentProgress = computed(() => ({
  level: displayLevel.value,
  earnedInLevel: Math.round(displayFraction.value * XP_PER_LEVEL),
  fraction: displayFraction.value,
}))
const shipPosition = computed(() => pointAtFraction(currentProgress.value.fraction))
const beamFromPosition = computed(() => pointAtFraction(phaseStart.value))
const beamToPosition = computed(() => pointAtFraction(phaseEnd.value))
const shipLabel = computed(
  () => `Корабль экспедиции: уровень ${target.value.level}, ${target.value.earnedInLevel} из ${XP_PER_LEVEL} XP`,
)

function pointAtFraction(fraction: number): Point {
  const routeStep = Math.max(0, Math.min(1, fraction)) * (routePoints.length - 1)
  const startIndex = Math.floor(routeStep)
  const endIndex = Math.min(startIndex + 1, routePoints.length - 1)
  const blend = routeStep - startIndex
  const from = routePoints[startIndex]
  const to = routePoints[endIndex]
  return {
    x: from.x + (to.x - from.x) * blend,
    y: from.y + (to.y - from.y) * blend,
  }
}

function animateFraction(from: number, to: number, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    let startedAt: number | null = null
    const tick = (timestamp: number) => {
      if (!mounted) {
        resolve()
        return
      }
      startedAt ??= timestamp
      const fraction = Math.min((timestamp - startedAt) / Math.max(1, durationMs), 1)
      const eased = 1 - (1 - fraction) ** 3
      displayFraction.value = from + (to - from) * eased
      if (fraction < 1) frameId = window.requestAnimationFrame(tick)
      else resolve()
    }
    frameId = window.requestAnimationFrame(tick)
  })
}

async function flyToEarnedPosition(): Promise<void> {
  if (!hasEarnedXp.value) return
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion.value) {
    displayLevel.value = target.value.level
    displayFraction.value = target.value.fraction
    return
  }

  const startLevel = start.value.level
  const crossedLevels = Math.max(0, target.value.level - startLevel)
  const segmentCount = crossedLevels + 1
  const duration = 650 / segmentCount
  isAnimating.value = true
  let fraction = start.value.fraction

  for (let level = startLevel; level < target.value.level && mounted; level += 1) {
    displayLevel.value = level
    displayFraction.value = fraction
    phaseStart.value = fraction
    phaseEnd.value = 1
    phaseDuration.value = duration
    beamFinished.value = false
    beamKey.value += 1
    await nextTick()
    await animateFraction(fraction, 1, duration)
    fraction = 0
    displayLevel.value = level + 1
    displayFraction.value = 0
  }

  if (!mounted) return
  if (target.value.fraction > fraction) {
    displayLevel.value = target.value.level
    displayFraction.value = fraction
    phaseStart.value = fraction
    phaseEnd.value = target.value.fraction
    phaseDuration.value = duration
    beamFinished.value = false
    beamKey.value += 1
    await nextTick()
    await animateFraction(fraction, target.value.fraction, duration)
  }
  if (mounted) {
    displayLevel.value = target.value.level
    displayFraction.value = target.value.fraction
    isAnimating.value = false
  }
}

onMounted(() => {
  void flyToEarnedPosition()
})

onBeforeUnmount(() => {
  mounted = false
  if (frameId !== 0) window.cancelAnimationFrame(frameId)
})
</script>

<template>
  <section
    ref="containerRef"
    :class="['xp-route', { 'xp-route--finish': variant === 'finish' }]"
    :aria-label="variant === 'finish' ? 'Полёт по маршруту опыта' : 'Маршрут опыта'"
    :data-level="currentProgress.level"
    :data-earned-in-level="currentProgress.earnedInLevel"
  >
    <div class="xp-route__heading">
      <h2 class="xp-route__title">{{ variant === 'finish' ? 'Полёт по маршруту' : 'Экспедиция' }}</h2>
      <span class="xp-route__level">Уровень {{ currentProgress.level }}</span>
    </div>
    <svg
      class="xp-route__map"
      viewBox="0 0 360 184"
      role="img"
      :aria-label="shipLabel"
      :data-level="currentProgress.level"
      :data-earned-in-level="currentProgress.earnedInLevel"
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
        <circle :cx="point.x" :cy="point.y" :r="point.xp <= currentProgress.earnedInLevel ? 6 : 4.5" :class="['xp-route__waypoint', { 'xp-route__waypoint--earned': point.xp <= currentProgress.earnedInLevel }]" />
        <circle v-if="point.xp <= currentProgress.earnedInLevel" :cx="point.x" :cy="point.y" r="10" class="xp-route__waypoint-halo" />
      </g>
      <circle
        ref="fromRef"
        class="xp-route__beam-anchor"
        :cx="beamFromPosition.x"
        :cy="beamFromPosition.y"
        r="1"
      />
      <circle
        ref="toRef"
        class="xp-route__beam-anchor"
        :cx="beamToPosition.x"
        :cy="beamToPosition.y"
        r="1"
      />
      <ExpeditionShip :x="shipPosition.x" :y="shipPosition.y" :launching="launching" />
    </svg>
    <AnimatedBeam
      v-if="beamActive"
      :key="beamKey"
      :container-ref="containerRef"
      :from-ref="fromRef"
      :to-ref="toRef"
      :active="beamActive"
      :duration-ms="phaseDuration"
      @finished="beamFinished = true"
    />
    <p class="xp-route__progress">{{ target.earnedInLevel }} из {{ XP_PER_LEVEL }} XP до следующего уровня</p>
  </section>
</template>

<style scoped>
.xp-route {
  position: relative;
  display: grid;
  gap: var(--space-sm);
  width: 100%;
}
.xp-route--finish {
  padding: var(--space-md);
  border-radius: var(--radius-card);
  background: var(--color-space);
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
.xp-route__beam-anchor { opacity: 0; }
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
