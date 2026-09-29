<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button class="button-secondary" type="button" :disabled="disabled" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<style scoped>
.button-secondary {
  min-height: 52px;
  padding: 14px 20px;
  border: 1px solid var(--color-control-outline);
  border-radius: var(--radius-control);
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-size-button);
  font-weight: 700;
  line-height: var(--line-height-button);
  cursor: pointer;
}

.button-secondary:active:not(:disabled) {
  background: var(--color-divider);
}

.button-secondary:focus-visible {
  outline: 2px solid var(--color-focus-on-space);
  outline-offset: 2px;
}

.button-secondary:disabled {
  opacity: 0.5;
}
@media (hover: hover) { .button-secondary:hover:not(:disabled) {
  background: var(--color-divider);
} }
</style>
