<script setup lang="ts">
/** Mission indicator (DESIGN.md): the actual mission length as text plus a semantic progress element. */
defineProps<{ current: number; total: number }>()
</script>

<template>
  <div class="mission-progress">
    <p class="mission-progress__text">Карточка {{ current }} из {{ total }}</p>
    <progress aria-label="Завершённые карточки" class="mission-progress__bar" :value="current - 1" :max="total">
      {{ current - 1 }} из {{ total }}
    </progress>
  </div>
</template>

<style scoped>
.mission-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.mission-progress__text {
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}

.mission-progress__bar {
  width: 100%;
  height: 8px;
  border: none;
  border-radius: var(--radius-badge);
  background: var(--color-space-raised);
}

.mission-progress__bar::-webkit-progress-bar {
  border-radius: var(--radius-badge);
  background: var(--color-space-raised);
}

.mission-progress__bar::-webkit-progress-value {
  border-radius: var(--radius-badge);
  background: var(--color-on-space);
}
.mission-progress__bar::-moz-progress-bar {
  background: var(--color-on-space);
  border-radius: var(--radius-badge);
}
</style>
