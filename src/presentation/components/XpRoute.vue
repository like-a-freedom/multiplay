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
  { x: 52, y: 100 },
  { x: 79, y: 95 },
  { x: 106, y: 99 },
  { x: 131, y: 87 },
  { x: 157, y: 76 },
  { x: 183, y: 81 },
  { x: 210, y: 91 },
  { x: 238, y: 77 },
  { x: 263, y: 66 },
  { x: 286, y: 69 },
  { x: 312, y: 48 },
]
const planetUrl = `${import.meta.env.BASE_URL}art/orbit-planet.webp`

// The track and moving ship share one curve; the artwork's center is its route anchor.
function curveSegment(index: number) {
  const previous = routePoints[Math.max(0, index - 1)]
  const from = routePoints[index]
  const to = routePoints[index + 1]
  const following = routePoints[Math.min(routePoints.length - 1, index + 2)]
  return {
    from,
    to,
    first: { x: from.x + (to.x - previous.x) / 6, y: from.y + (to.y - previous.y) / 6 },
    second: { x: to.x - (following.x - from.x) / 6, y: to.y - (following.y - from.y) / 6 },
  }
}
const trackPath = `M ${routePoints[0].x} ${routePoints[0].y} ` + routePoints.slice(0, -1).map((_, index) => {
  const { first, second, to } = curveSegment(index)
  return `C ${first.x} ${first.y} ${second.x} ${second.y} ${to.x} ${to.y}`
}).join(' ')
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
  const startIndex = Math.min(Math.floor(routeStep), routePoints.length - 2)
  const blend = routeStep - startIndex
  const { from, first, second, to } = curveSegment(startIndex)
  const rest = 1 - blend
  return {
    x: rest ** 3 * from.x + 3 * rest ** 2 * blend * first.x + 3 * rest * blend ** 2 * second.x + blend ** 3 * to.x,
    y: rest ** 3 * from.y + 3 * rest ** 2 * blend * first.y + 3 * rest * blend ** 2 * second.y + blend ** 3 * to.y,
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
      viewBox="0 0 360 156"
      role="img"
      :aria-label="shipLabel"
      :data-level="currentProgress.level"
      :data-earned-in-level="currentProgress.earnedInLevel"
    >
      <rect x="0.5" y="0.5" width="359" height="155" rx="24" class="xp-route__surface" />
      <image :href="planetUrl" x="223" y="7" width="128" height="128" class="xp-route__planet" aria-hidden="true" />
      <g class="xp-route__sky-dots" aria-hidden="true"><circle cx="31" cy="32" r="2" /><circle cx="144" cy="27" r="1.5" /><circle cx="203" cy="48" r="2" /><circle cx="177" cy="123" r="1.5" /></g>
      <path :d="trackPath" class="xp-route__track" />
      <circle cx="52" cy="100" r="7" class="xp-route__launch-pad" />
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
    <p class="xp-route__progress">{{ target.earnedInLevel }} из {{ XP_PER_LEVEL }} XP <span>До уровня {{ target.level + 1 }} — ещё {{ XP_PER_LEVEL - target.earnedInLevel }} XP</span></p>
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
  padding-block: var(--space-sm);
}
.xp-route--finish .xp-route__surface { stroke: none; }
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
.xp-route__progress span { display: block; margin-top: var(--space-xs); font-size: var(--font-size-meta); font-weight: 600; }
.xp-route__title { font-weight: 700; }
.xp-route__level {
  color: var(--color-focus);
  font-weight: 900;
  white-space: nowrap;
}
.xp-route__map {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.xp-route__surface {
  fill: var(--color-lilac-soft);
  stroke: none;
  stroke-width: 1;
}
.xp-route__planet { opacity: .95; }
.xp-route__sky-dots { fill: var(--color-focus); opacity: .35; }
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
