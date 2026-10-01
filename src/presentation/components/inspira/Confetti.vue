<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { loadConfetti } from '@/presentation/components/inspira/confettiLoader'

const props = withDefaults(defineProps<{
  manualstart?: boolean
  reducedMotion?: boolean
}>(), {
  manualstart: false,
  reducedMotion: false,
})
const canvas = ref<HTMLCanvasElement | null>(null)
const loaded = ref(false)
const fired = ref(false)

type ConfettiTrigger = ReturnType<typeof import('canvas-confetti').create>
let trigger: ConfettiTrigger | null = null
let pendingFire = false
let mounted = true
let loading = false

function fireNow(): void {
  if (!pendingFire || !trigger || fired.value || !mounted || props.reducedMotion) return
  pendingFire = false
  try {
    trigger({
      particleCount: 48,
      spread: 72,
      startVelocity: 23,
      ticks: 100,
      scalar: 0.8,
      origin: { x: 0.5, y: 0.28 },
      colors: ['#FFD166', '#B9A5FA', '#8DE2CA', '#FF8E6B'],
      shapes: ['star', 'circle'],
      zIndex: 1,
    })
    fired.value = true
  } catch {
    // A canvas failure must leave the completion screen and its actions usable.
  }
}

async function load(): Promise<void> {
  if (!mounted || props.reducedMotion || trigger || loading) return
  loading = true
  try {
    const module = await loadConfetti()
    if (!mounted || props.reducedMotion || !canvas.value) return
    trigger = module.default.create(canvas.value, {
      resize: true,
      useWorker: false,
      disableForReducedMotion: true,
    })
    loaded.value = true
    fireNow()
  } catch {
    pendingFire = false
    // The static finish state is the fallback when the optional chunk is unavailable.
  } finally {
    loading = false
  }
}

function fire(): void {
  if (!mounted || props.reducedMotion || fired.value) return
  pendingFire = true
  fireNow()
  if (!loaded.value) void load()
}

watch(() => props.reducedMotion, (isReduced) => {
  if (isReduced) {
    pendingFire = false
    trigger?.reset()
    trigger = null
    loaded.value = false
  } else if (mounted && !loaded.value) {
    void load()
  }
})

onMounted(() => {
  if (props.reducedMotion) return
  if (!props.manualstart) pendingFire = true
  void load()
})

onBeforeUnmount(() => {
  mounted = false
  pendingFire = false
  trigger?.reset()
  trigger = null
})

defineExpose({ fire })
</script>

<template>
  <canvas
    ref="canvas"
    class="inspira-confetti"
    aria-hidden="true"
    :data-loaded="String(loaded)"
    :data-fired="String(fired)"
  />
</template>

<style scoped>
.inspira-confetti {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
