<script setup lang="ts">
defineProps<{ label: string; disabled?: boolean; variant?: 'danger' | 'danger-solid' }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button :class="['button-secondary', variant ? `button-secondary--${variant}` : '']" type="button" :disabled="disabled" @click="$emit('click')">
    {{ label }}
  </button>
</template>

<style scoped>
.button-secondary {
  min-height: 52px;
  padding: 14px 20px;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-control);
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-size-button);
  font-weight: 800;
  transition: background 150ms, transform 150ms var(--ease-playful);
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
.button-secondary--danger { color: var(--color-error); border-color: var(--color-error); background: var(--color-danger-surface); }
.button-secondary--danger-solid { color: var(--color-white); border-color: var(--color-error); background: var(--color-error); }
.button-secondary--danger:active:not(:disabled), .button-secondary--danger-solid:active:not(:disabled) { background: var(--color-danger-surface); color: var(--color-error); }
@media (hover: hover) { .button-secondary--danger:hover:not(:disabled), .button-secondary--danger-solid:hover:not(:disabled) { background: var(--color-danger-surface); color: var(--color-error); } }
</style>
