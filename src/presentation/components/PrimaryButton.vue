<script setup lang="ts">
import RippleButton from '@/presentation/components/inspira/RippleButton.vue'
defineProps<{ label: string; disabled?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <RippleButton class="button-primary" :disabled="disabled" ripple-color="var(--color-white)" @click="$emit('click')">
    {{ label }}
  </RippleButton>
</template>

<style scoped>
.button-primary {
  min-height: 60px;
  padding: 16px 24px;
  border: 0;
  border-radius: var(--radius-control);
  background: var(--color-action);
  color: var(--color-on-action);
  font-family: var(--font-family);
  font-size: var(--font-size-button);
  font-weight: 900;
  box-shadow: var(--shadow-action);
  transition: transform 150ms var(--ease-playful), background 150ms;
  line-height: var(--line-height-button);
  cursor: pointer;
}

.button-primary:active:not(:disabled) {
  background: var(--color-action-pressed);
  transform: translateY(2px);
}

.button-primary:focus-visible {
  outline: 2px solid var(--color-focus-on-space);
  outline-offset: 2px;
}

.button-primary:disabled {
  background: var(--color-divider);
  color: var(--color-ink-muted);
  box-shadow: none;
  cursor: default;
}
@media (hover: hover) { .button-primary:hover:not(:disabled) {
  background: var(--color-action-pressed);
} }
</style>
