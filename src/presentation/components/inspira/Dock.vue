<script setup lang="ts">
/** Inspira UI Dock/DockIcon (MIT): distance-based magnification.
 * Stable touch targets, permanent labels, keyboard focus, no hover-only navigation. */
import { ref } from 'vue'
import GameIcon from '@/presentation/components/GameIcon.vue'
defineProps<{ current: 'home' | 'map' | 'report' }>()
const emit = defineEmits<{ navigate: [screen: 'home' | 'map' | 'report'] }>()
const hovered = ref<string | null>(null)
const items = [
  { screen: 'home', label: 'Станция', accessible: 'Главная', icon: 'home' },
  { screen: 'map', label: 'Звёзды', accessible: 'Открыть карту', icon: 'star' },
  { screen: 'report', label: 'Взрослым', accessible: 'Отчёт для взрослого', icon: 'chart' },
] as const
const pointerX = ref(Infinity)
function magnification(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  pointerX.value = event.clientX
}
function scale(element: HTMLElement | null): number {
  if (!element || !Number.isFinite(pointerX.value)) return 1
  const rect = element.getBoundingClientRect()
  return 1 + Math.max(0, 1 - Math.abs(pointerX.value - rect.x - rect.width / 2) / 100) * .13
}
const buttons = ref<HTMLElement[]>([])
</script>
<template>
  <nav class="inspira-dock" aria-label="Навигация" @pointermove="magnification" @pointerleave="pointerX = Infinity">
    <button v-for="(item, index) in items" :key="item.screen" :ref="(el) => { if (el) buttons[index] = el as HTMLElement }" type="button" :aria-label="item.accessible" :aria-current="current === item.screen ? 'page' : undefined" @focus="hovered = item.screen" @blur="hovered = null" @click="emit('navigate', item.screen)">
      <span class="inspira-dock__icon" :style="{ transform: `scale(${hovered === item.screen ? 1.13 : scale(buttons[index] ?? null)})` }"><GameIcon :name="item.icon" /></span><span>{{ item.label }}</span>
    </button>
  </nav>
</template>
<style scoped>
.inspira-dock { display: flex; justify-content: space-around; gap: var(--space-sm); width: 100%; max-width: 460px; margin: var(--space-xxl) auto 0; padding: var(--space-sm); border: 1px solid var(--color-divider); border-radius: var(--radius-card); background: var(--color-paper); box-shadow: 0 8px 24px var(--color-shadow); }
.inspira-dock button { display: flex; flex: 1; align-items: center; justify-content: center; flex-direction: column; gap: var(--space-xs); min-width: 48px; min-height: 64px; padding: var(--space-sm); border: 0; border-radius: var(--radius-control); background: transparent; color: var(--color-ink-muted); font-size: var(--font-size-label); font-weight: 800; cursor: pointer; }
.inspira-dock button[aria-current] { color: var(--color-focus); background: var(--color-lilac-soft); }
.inspira-dock__icon { display: flex; transition: transform 220ms var(--ease-playful); }
@media (prefers-reduced-motion: reduce) { .inspira-dock__icon { transition: none; transform: none !important; } }
.inspira-dock { flex-wrap: wrap; }
.inspira-dock button { flex: 1 0 auto; }
.inspira-dock button > span:last-child { white-space: nowrap; }
</style>
