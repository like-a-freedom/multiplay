<script setup lang="ts">
/** Inspira UI Sparkles (MIT), preserving its canvas particle/twinkle algorithm.
 * Fixes DPR coordinates, caps frame/particle counts, and pauses invisible scenes. */
import { useRafFn } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useSceneMotion } from '@/presentation/composables/sceneMotion'

const props = withDefaults(defineProps<{ particleColor?: string; particleDensity?: number }>(), { particleColor: '#ffffff', particleDensity: 28 })
const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const { active } = useSceneMotion(root)
let ctx: CanvasRenderingContext2D | null = null
let observer: ResizeObserver | undefined
let width = 0, height = 0
const particles = Array.from({ length: Math.min(48, Math.max(0, props.particleDensity)) }, () => ({
  x: Math.random(), y: Math.random(), size: Math.random() * 1.6 + .6,
  vx: (Math.random() - .5) * .00025, vy: -.00015, phase: Math.random() * Math.PI * 2,
}))
function draw(move: boolean) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = props.particleColor
  for (const p of particles) {
    if (move) { p.x = (p.x + p.vx + 1) % 1; p.y = (p.y + p.vy + 1) % 1; p.phase += .025 }
    ctx.globalAlpha = .35 + (Math.sin(p.phase) + 1) * .22
    ctx.beginPath(); ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
}
function resize() {
  if (!root.value || !canvas.value || !ctx) return
  const rect = root.value.getBoundingClientRect()
  width = rect.width; height = rect.height
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.value.width = Math.round(width * dpr); canvas.value.height = Math.round(height * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(false)
}
const { pause, resume } = useRafFn(() => draw(true), { immediate: false, fpsLimit: 30 })
watch(active, (run) => run ? resume() : pause())
onMounted(() => {
  try { ctx = canvas.value?.getContext('2d') ?? null } catch { return }
  if (!ctx) return
  observer = new ResizeObserver(resize); if (root.value) observer.observe(root.value)
  resize(); if (active.value) resume()
})
onBeforeUnmount(() => { pause(); observer?.disconnect() })
</script>
<template><div ref="root" class="inspira-sparkles" aria-hidden="true"><canvas ref="canvas" /></div></template>
<style scoped>
.inspira-sparkles, canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
</style>
