<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button class="button-primary" type="button" :disabled="disabled" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<style scoped>
.button-primary {
  min-height: 56px;
  padding: 16px 24px;
  border: 1px solid var(--color-on-space);
  border-radius: var(--radius-control);
  background: var(--color-action);
  color: var(--color-white);
  font-family: var(--font-family);
  font-size: var(--font-size-button);
  font-weight: 700;
  line-height: var(--line-height-button);
  cursor: pointer;
}

.button-primary:active:not(:disabled) {
  background: var(--color-action-pressed);
}

.button-primary:focus-visible {
  outline: 2px solid var(--color-focus-on-space);
  outline-offset: 2px;
}

.button-primary:disabled {
  opacity: 0.5;
}
@media (hover: hover) { .button-primary:hover:not(:disabled) {
  background: var(--color-action-pressed);
} }
</style>
