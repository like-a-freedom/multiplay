<script setup lang="ts">
import { computed } from 'vue'

/**
 * Карточка примера (DESIGN.md): ответ скрыт до попытки; после ответа —
 * правильный результат и короткая подсказка. Жеста переворота нет.
 */
const props = defineProps<{
  variant?: 'question' | 'summary'
  celebrate?: boolean
  starUnlocked?: boolean
  review?: boolean
  answerValue?: number
  submittedValue?: number | null
  expression: string
  spoken: string
  feedbackText?: string | null
  feedbackTone?: 'success' | 'error' | 'hint' | null
  hintText?: string | null
}>()

const visibleExpression = computed(() =>
  props.celebrate && props.answerValue !== undefined
    ? props.expression.replace(/\?$/, String(props.answerValue))
    : props.expression,
)
</script>

<template>
  <section
    class="question-card"
    :class="{
      'question-card--summary': variant === 'summary',
      'question-card--correct': celebrate,
      'question-card--review': review,
    }"
  >
    <div v-if="celebrate" class="question-card__confetti" aria-hidden="true">
      <span v-for="piece in 8" :key="piece" />
    </div>
    <p class="question-card__expression">
      <!-- Пример озвучиваем осмысленно («Семь умножить на восемь»); цифры скрыты от скринридера. -->
      <span class="visually-hidden">{{ spoken }}</span>
      <span aria-hidden="true">{{ visibleExpression }}</span>
    </p>
    <div class="question-card__result" aria-live="polite" aria-atomic="true">
      <p
        v-if="feedbackText"
        class="question-card__feedback"
        :class="`question-card__feedback--${feedbackTone ?? 'hint'}`"
      >
        {{ feedbackText }}
      </p>
      <span v-if="celebrate && answerValue !== undefined" class="visually-hidden">
        Правильный ответ: {{ answerValue }}
      </span>
      <p v-if="starUnlocked" class="question-card__star-unlocked">Новая звезда открыта на карте!</p>
      <div v-if="review && answerValue !== undefined" class="question-card__answer-row">
        <p v-if="submittedValue !== null && submittedValue !== undefined" class="question-card__submitted">
          Твой ответ: {{ submittedValue }}
        </p>
        <p class="question-card__correct-answer">Верный ответ: <strong>{{ answerValue }}</strong></p>
      </div>
      <div v-if="hintText" class="question-card__hint">
        <p class="question-card__hint-label">Как вспомнить</p>
        <p>{{ hintText }}</p>
      </div>
    </div>
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

.question-card--correct {
  position: relative;
  overflow: hidden;
  background: var(--color-success-surface);
  box-shadow: inset 0 0 0 2px var(--color-success), 0 8px 24px rgb(0 0 0 / 0.25);
}

.question-card--review {
  background: var(--color-review-surface);
  box-shadow: inset 0 0 0 2px var(--color-review-outline), 0 8px 24px rgb(0 0 0 / 0.25);
}

.question-card__confetti {
  position: absolute;
  top: 65%;
  left: 72%;
  z-index: 1;
  pointer-events: none;
}

.question-card__confetti span {
  position: absolute;
  width: 8px;
  height: 12px;
  border-radius: 2px;
  background: var(--color-streak);
  opacity: 0;
}

.question-card__confetti span:nth-child(2n) { background: var(--color-success); }
.question-card__confetti span:nth-child(3n) { background: var(--color-ink); }
.question-card__confetti span:nth-child(1) { --dx: -76px; --dy: -56px; --turn: -55deg; }
.question-card__confetti span:nth-child(2) { --dx: -36px; --dy: -82px; --turn: 35deg; }
.question-card__confetti span:nth-child(3) { --dx: 18px; --dy: -85px; --turn: 70deg; }
.question-card__confetti span:nth-child(4) { --dx: 75px; --dy: -52px; --turn: -40deg; }
.question-card__confetti span:nth-child(5) { --dx: -80px; --dy: 30px; --turn: 80deg; }
.question-card__confetti span:nth-child(6) { --dx: -34px; --dy: 64px; --turn: -65deg; }
.question-card__confetti span:nth-child(7) { --dx: 24px; --dy: 68px; --turn: 45deg; }
.question-card__confetti span:nth-child(8) { --dx: 82px; --dy: 34px; --turn: -75deg; }

.question-card__expression {
  margin: 0;
  font-size: var(--font-size-question);
  font-weight: 700;
  line-height: var(--line-height-question);
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.question-card__feedback {
  display: block;
  max-width: 100%;
  margin: 0;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-control);
  font-size: var(--font-size-body);
  font-weight: 700;
  line-height: var(--line-height-body);
}

.question-card__feedback--success {
  color: var(--color-white);
  background: var(--color-success);
}

.question-card__feedback--error,
.question-card__feedback--hint {
  color: var(--color-review-ink);
  background: var(--color-white);
  box-shadow: inset 0 0 0 1px var(--color-review-outline);
}

.question-card__star-unlocked {
  align-self: flex-start;
  margin: 0;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-control);
  background: var(--color-streak);
  color: var(--color-ink);
  font-weight: 700;
}

.question-card__hint {
  color: var(--color-ink);
  padding: var(--space-md) var(--space-lg);
  border-left: 3px solid var(--color-review-outline);
  border-radius: 0 var(--radius-control) var(--radius-control) 0;
  background: var(--color-white);
}

.question-card__hint p {
  margin: 0;
}

.question-card__hint .question-card__hint-label {
  margin-bottom: var(--space-xs);
  color: var(--color-review-ink);
  font-size: var(--font-size-label);
  font-weight: 700;
}

.question-card__result {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.question-card__answer-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-md) var(--space-xl);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-control);
  background: var(--color-white);
}

.question-card__answer-row p {
  margin: 0;
}

.question-card__submitted {
  color: var(--color-ink-muted);
  font-size: var(--font-size-body);
}

.question-card__correct-answer {
  color: var(--color-ink);
  font-weight: 700;
}

.question-card__correct-answer strong {
  font-size: inherit;
  font-variant-numeric: tabular-nums;
}

.question-card--summary .question-card__expression {
  font-size: var(--font-size-title);
  line-height: var(--line-height-title);
  letter-spacing: normal;
  text-wrap: balance;
  hyphens: auto;
}

@media (prefers-reduced-motion: no-preference) {
  .question-card--correct {
    animation: correct-card 220ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .question-card--correct .question-card__feedback {
    animation: success-confirm 460ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .question-card__star-unlocked {
    animation: review-appear 320ms 120ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .question-card--review .question-card__answer-row,
  .question-card--review .question-card__hint {
    animation: review-appear 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .question-card--review .question-card__hint { animation-delay: 120ms; }

  .question-card--review .question-card__feedback {
    animation: review-appear 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .question-card__confetti span {
    animation: confetti-burst 620ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
}

@keyframes review-appear {
  from { opacity: 0.7; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes correct-card {
  from { transform: scale(0.985); }
  to { transform: scale(1); }
}

@keyframes success-confirm {
  0% { opacity: .7; transform: translateY(8px) scale(.92); }
  65% { opacity: 1; transform: translateY(0) scale(1.06); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes confetti-burst {
  0% { opacity: 0; transform: translate(0, 0) rotate(0); }
  14% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--turn)); }
}
</style>
