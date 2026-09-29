<script setup lang="ts">
/**
 * Карточка примера (DESIGN.md): ответ скрыт до попытки; после ответа —
 * правильный результат и короткая подсказка. Жеста переворота нет.
 */
defineProps<{
  expression: string
  spoken: string
  feedbackText?: string | null
  feedbackTone?: 'success' | 'error' | 'hint' | null
  hintText?: string | null
}>()
</script>

<template>
  <section class="question-card">
    <p class="question-card__expression" role="text" :aria-label="spoken">{{ expression }}</p>
    <p
      v-if="feedbackText"
      class="question-card__feedback"
      :class="`question-card__feedback--${feedbackTone ?? 'hint'}`"
      aria-live="polite"
    >
      {{ feedbackText }}
    </p>
    <p v-if="hintText" class="question-card__hint">{{ hintText }}</p>
    <slot />
  </section>
</template>

<style scoped>
.question-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-xl);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
}

.question-card__expression {
  margin: 0;
  font-size: var(--font-size-question);
  font-weight: 700;
  line-height: var(--line-height-question);
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
}

.question-card__feedback {
  margin: 0;
  font-weight: 700;
}

.question-card__feedback--success {
  color: var(--color-success);
}

.question-card__feedback--error {
  color: var(--color-error);
}

.question-card__feedback--hint {
  color: var(--color-ink);
}

.question-card__hint {
  margin: 0;
  color: var(--color-ink-muted);
}
</style>
