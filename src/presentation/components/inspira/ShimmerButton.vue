<script setup lang="ts">
/** Inspira UI ShimmerButton (MIT), preserving its conic shimmer and inset material. */
withDefaults(defineProps<{ disabled?: boolean; launching?: boolean }>(), { disabled: false, launching: false })
defineEmits<{ click: [] }>()
</script>
<template>
  <button type="button" class="inspira-shimmer-button" :disabled="disabled" :aria-busy="launching || undefined" @click="$emit('click')">
    <span class="inspira-shimmer-button__shimmer" aria-hidden="true"><span /></span>
    <span class="inspira-shimmer-button__surface" aria-hidden="true" />
    <span class="inspira-shimmer-button__content"><slot /></span>
  </button>
</template>
<style scoped>
.inspira-shimmer-button { --shimmer-speed: 3.5s; position: relative; isolation: isolate; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 64px; padding: var(--space-lg) var(--space-xl); border: 0; border-radius: var(--radius-control); background: var(--color-action); color: var(--color-on-action); font-size: var(--font-size-button); font-weight: 900; line-height: var(--line-height-button); box-shadow: var(--shadow-action); cursor: pointer; transition: transform 180ms var(--ease-playful), background 180ms; overflow: hidden; }
.inspira-shimmer-button__shimmer { position: absolute; inset: 0; z-index: -2; overflow: hidden; container-type: size; }
.inspira-shimmer-button__shimmer > span { position: absolute; inset: -100%; background: conic-gradient(from 225deg, transparent 0deg, #fff2bc 90deg, transparent 90deg); animation: shimmer-btn-spin-around calc(var(--shimmer-speed) * 2) linear infinite; }
.inspira-shimmer-button__surface { position: absolute; inset: 2px; z-index: -1; border-radius: calc(var(--radius-control) - 2px); background: var(--color-action); box-shadow: inset 0 -4px 0 rgb(170 101 0 / .16); }
.inspira-shimmer-button__content { display: flex; align-items: center; justify-content: center; gap: var(--space-md); }
.inspira-shimmer-button:active:not(:disabled) { transform: translateY(2px) scale(.985); }
.inspira-shimmer-button:disabled { cursor: wait; }
@media (hover: hover) { .inspira-shimmer-button:hover:not(:disabled) { background: var(--color-action-pressed); transform: translateY(-2px); } }
@keyframes shimmer-btn-spin-around { 0% { transform: rotate(0); } 15%,35% { transform: rotate(90deg); } 65%,85% { transform: rotate(270deg); } 100% { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .inspira-shimmer-button { transition: none; } .inspira-shimmer-button__shimmer { display: none; } }
</style>
