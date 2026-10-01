<script setup lang="ts">
import type { AttemptOutcome } from '@/domain/learning/answer'

const props = defineProps<{ current: number; total: number; outcomes?: readonly (AttemptOutcome | undefined)[] }>()
function status(step: number): string {
  const outcome = props.outcomes?.[step - 1]
  if (outcome) return outcome
  return step < props.current ? 'done' : step === props.current ? 'current' : 'future'
}
function label(step: number): string {
  const labels: Record<string, string> = { correct: 'Верно', wrong: 'Разобрали вместе', unknown: 'С подсказкой', done: 'Завершена', current: 'Сейчас', future: 'Впереди' }
  return `Карточка ${step}: ${labels[status(step)]}`
}
</script>

<template>
  <div class="mission-progress">
    <ol class="mission-progress__steps" aria-label="Результаты карточек">
      <li v-for="step in total" :key="step" :class="`mission-progress__step--${status(step)}`" :aria-label="label(step)" :data-outcome="status(step)">
        <svg v-if="status(step) === 'correct'" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-9" /></svg>
        <svg v-else-if="status(step) === 'wrong'" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9a7 7 0 1 0 0 6M19 4v5h-5" /></svg>
        <svg v-else-if="status(step) === 'unknown'" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17v-2a6 6 0 1 1 6 0v2M9 17h6M10 21h4" /></svg>
      </li>
    </ol>
    <p class="mission-progress__text">Карточка {{ current }} из {{ total }}</p>
    <progress aria-label="Завершённые карточки" class="visually-hidden" :value="outcomes ? outcomes.filter(Boolean).length : current - 1" :max="total">{{ current - 1 }} из {{ total }}</progress>
  </div>
</template>

<style scoped>
.mission-progress { display: flex; flex-direction: column; gap: var(--space-sm); }
.mission-progress__steps { display: flex; gap: var(--space-sm); margin: 0; padding: 0; list-style: none; }
.mission-progress__steps li { display: grid; place-content: center; flex: 1; min-width: 0; height: 20px; border-radius: var(--radius-badge); background: var(--color-divider); }
.mission-progress__steps .mission-progress__step--done { background: var(--color-lilac-soft); }
.mission-progress__steps .mission-progress__step--correct { background: var(--color-mint); color: var(--color-success); }
.mission-progress__steps .mission-progress__step--wrong { background: var(--color-review-surface); color: var(--color-review-ink); box-shadow: inset 0 0 0 1px var(--color-review-outline); }
.mission-progress__steps .mission-progress__step--unknown { background: var(--color-help-surface); color: var(--color-help-ink); box-shadow: inset 0 0 0 1px var(--color-help-ink); }
.mission-progress__steps .mission-progress__step--current { background: var(--color-focus); }
.mission-progress__steps svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
.mission-progress__text { margin: 0; font-size: var(--font-size-label); font-weight: 700; line-height: var(--line-height-label); color: var(--color-ink); }
</style>
