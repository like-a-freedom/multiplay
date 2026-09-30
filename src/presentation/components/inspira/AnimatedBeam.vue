<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  containerRef: HTMLElement | null
  fromRef: Element | null
  toRef: Element | null
  active: boolean
  durationMs: number
}>()
const emit = defineEmits<{ finished: [] }>()

const bounds = ref({ width: 0, height: 0 })
const path = ref('')
const progress = ref(0)
const pathLength = ref(0)
const endpoint = ref({ x: 0, y: 0 })
let frameId = 0
let resizeObserver: ResizeObserver | null = null
const gradientId = `xp-beam-${++nextBeamId}`

function measure(): boolean {
  const container = props.containerRef
  const from = props.fromRef
  const to = props.toRef
  if (!container || !from || !to) return false

  const containerBounds = container.getBoundingClientRect()
  const fromBounds = from.getBoundingClientRect()
  const toBounds = to.getBoundingClientRect()
  const originX = fromBounds.left + fromBounds.width / 2 - containerBounds.left
  const originY = fromBounds.top + fromBounds.height / 2 - containerBounds.top
  const endX = toBounds.left + toBounds.width / 2 - containerBounds.left
  const endY = toBounds.top + toBounds.height / 2 - containerBounds.top
  const directionX = endX - originX
  const directionY = endY - originY
  const directionLength = Math.hypot(directionX, directionY)
  if (!Number.isFinite(directionLength) || directionLength === 0) return false
  const wakeLength = Math.min(32, Math.max(18, directionLength * 0.75))
  const startX = originX - directionX / directionLength * wakeLength
  const startY = originY - directionY / directionLength * wakeLength
  const bend = Math.max(8, Math.min(24, Math.abs(endX - startX) * 0.1))
  const controlX = (startX + endX) / 2
  const controlY = (startY + endY) / 2 - bend

  let measuredLength = 0
  let previousX = startX
  let previousY = startY
  for (let step = 1; step <= 24; step += 1) {
    const t = step / 24
    const inverse = 1 - t
    const x = inverse ** 2 * startX + 2 * inverse * t * controlX + t ** 2 * endX
    const y = inverse ** 2 * startY + 2 * inverse * t * controlY + t ** 2 * endY
    measuredLength += Math.hypot(x - previousX, y - previousY)
    previousX = x
    previousY = y
  }

  bounds.value = { width: containerBounds.width, height: containerBounds.height }
  endpoint.value = { x: endX, y: endY }
  path.value = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`
  pathLength.value = measuredLength
  return containerBounds.width > 0 && containerBounds.height > 0
}

function animate(startedAt: number): void {
  const elapsed = Math.max(0, startedAt - animationStartedAt)
  const duration = Math.max(1, props.durationMs)
  const fraction = Math.min(elapsed / duration, 1)
  progress.value = 1 - (1 - fraction) ** 3
  if (fraction < 1) {
    frameId = window.requestAnimationFrame(animate)
  } else {
    emit('finished')
  }
}

let animationStartedAt = 0
function start(): boolean {
  if (!props.active || !measure()) return false
  progress.value = 0
  frameId = window.requestAnimationFrame((timestamp) => {
    animationStartedAt = timestamp
    frameId = window.requestAnimationFrame(animate)
  })
  return true
}

onMounted(async () => {
  await nextTick()
  if (!start()) return

  if (typeof ResizeObserver !== 'undefined' && props.containerRef) {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(props.containerRef)
  }
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  if (frameId !== 0) window.cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', measure)
})
</script>

<template>
  <svg
    v-if="path"
    class="xp-route__beam"
    aria-hidden="true"
    :width="bounds.width"
    :height="bounds.height"
    :viewBox="`0 0 ${bounds.width} ${bounds.height}`"
    :data-progress="progress.toFixed(3)"
    :data-path-length="pathLength.toFixed(1)"
  >
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="var(--color-action)" stop-opacity=".25" />
        <stop offset="55%" stop-color="var(--color-star)" />
        <stop offset="100%" stop-color="var(--color-white)" />
      </linearGradient>
      <radialGradient :id="`${gradientId}-flare`">
        <stop offset="0%" stop-color="var(--color-white)" stop-opacity=".95" />
        <stop offset="38%" stop-color="var(--color-star)" stop-opacity=".9" />
        <stop offset="100%" stop-color="var(--color-star)" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle
      class="xp-route__beam-flare"
      :cx="endpoint.x"
      :cy="endpoint.y"
      r="15"
      :fill="`url(#${gradientId}-flare)`"
      :opacity="0.2 + progress * 0.65"
      :data-intensity="progress.toFixed(3)"
    />
    <path
      :d="path"
      fill="none"
      :stroke="`url(#${gradientId})`"
      stroke-width="5"
      stroke-linecap="round"
      :stroke-dasharray="pathLength"
      :stroke-dashoffset="pathLength * (1 - progress)"
    />
  </svg>
</template>

<script lang="ts">
let nextBeamId = 0
</script>

<style scoped>
.xp-route__beam {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  filter: drop-shadow(0 0 7px rgb(249 186 67 / 0.72));
}
.xp-route__beam-flare { filter: drop-shadow(0 0 6px rgb(249 186 67 / 0.7)); }
</style>
