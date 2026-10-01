<script setup lang="ts">
/** Mission indicator (DESIGN.md): the actual mission length as text plus a semantic progress element. */
defineProps<{ current: number; total: number }>()
</script>

<template>
  <div class="mission-progress">
    <div class="mission-progress__steps" aria-hidden="true">
      <span v-for="step in total" :key="step" :class="{ 'mission-progress__step--done': step < current, 'mission-progress__step--current': step === current }">
        <svg v-if="step < current" viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg>
      </span>
    </div>
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
  gap: var(--space-md);
}
.mission-progress__steps { display: flex; gap: var(--space-sm); }
.mission-progress__steps span { display: grid; place-content: center; flex: 1; min-width: 0; height: 14px; border-radius: var(--radius-badge); background: var(--color-divider); }
.mission-progress__steps .mission-progress__step--done { background: var(--color-mint); }
.mission-progress__steps .mission-progress__step--current { background: var(--color-focus); }
.mission-progress__steps svg { width: 12px; height: 12px; fill: none; stroke: var(--color-success); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }

.mission-progress__text {
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}

.mission-progress__bar {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
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
