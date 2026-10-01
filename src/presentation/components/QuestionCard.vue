<script setup lang="ts">
import { computed } from 'vue'
import StarGlyph from '@/presentation/components/StarGlyph.vue'
import FlipCard from '@/presentation/components/inspira/FlipCard.vue'
import GameIcon from '@/presentation/components/GameIcon.vue'

/** The answer remains hidden until the child submits; that explicit action reveals the reverse. */
const props = defineProps<{
  variant?: 'question' | 'summary'
  revealed?: boolean
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
  (props.revealed || props.celebrate) && props.answerValue !== undefined
    ? props.expression.replace(/\?$/, String(props.answerValue))
    : props.expression,
)
</script>

<template>
  <FlipCard :flipped="revealed ?? false">
    <template #front>
      <section class="question-card question-card--front" :class="{ 'question-card--summary': variant === 'summary' }">
        <p class="question-card__expression">
          <!-- The expression is announced as words; digits are visual-only. -->
          <span class="visually-hidden">{{ spoken }}</span>
          <span aria-hidden="true">{{ expression }}</span>
        </p>
        <slot />
      </section>
    </template>
    <template #back>
      <section
        class="question-card question-card--back"
        :class="{
          'question-card--summary': variant === 'summary',
          'question-card--correct': celebrate,
          'question-card--review': review,
        }"
      >
        <p class="question-card__expression">
          <span class="visually-hidden">{{ spoken }}</span>
          <span aria-hidden="true">{{ visibleExpression }}</span>
        </p>
        <div class="question-card__result" aria-live="polite" aria-atomic="true">
          <p
            v-if="feedbackText"
            class="question-card__feedback"
            :class="`question-card__feedback--${feedbackTone ?? 'hint'}`"
          >
            <GameIcon v-if="celebrate" name="check" :size="22" />
            {{ feedbackText }}
          </p>
          <span v-if="celebrate && answerValue !== undefined" class="visually-hidden">
            Правильный ответ: {{ answerValue }}
          </span>
          <p v-if="starUnlocked" class="question-card__star-unlocked">
            <StarGlyph :size="40" class="question-card__new-star" />
            <span>Новая звезда открыта на карте!</span>
          </p>
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
      </section>
    </template>
  </FlipCard>
</template>

<style scoped>
.question-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  min-height: 260px;
  padding: var(--space-xl);
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-divider);
}

.question-card--correct {
  background: var(--color-success-surface);
  box-shadow: inset 0 0 0 2px var(--color-success), 0 8px 24px var(--color-shadow);
}

.question-card--review {
  background: var(--color-review-surface);
  box-shadow: inset 0 0 0 2px var(--color-review-outline), 0 8px 24px var(--color-shadow);
}

.question-card__expression {
  margin: 0;
  font-size: var(--font-size-question);
  font-weight: 900;
  line-height: var(--line-height-question);
  letter-spacing: -0.025em;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
  text-align: center;
  padding-block: var(--space-lg);
}

.question-card__feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  max-width: 100%;
  margin: 0;
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-control);
  font-size: var(--font-size-body);
  font-weight: 900;
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
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: 0;
  padding: var(--space-md);
  border: 1px solid var(--color-star-edge);
  border-radius: var(--radius-control);
  background: var(--color-review-surface);
  color: var(--color-ink);
  font-weight: 700;
}

.question-card__hint {
  color: var(--color-ink);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-review-outline);
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

  .question-card__new-star {
    animation: star-unlock 480ms 120ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .question-card--review .question-card__answer-row,
  .question-card--review .question-card__hint {
    animation: review-appear 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .question-card--review .question-card__hint { animation-delay: 120ms; }

  .question-card--review .question-card__feedback {
    animation: review-appear 240ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@keyframes review-appear {
  from { opacity: 0.7; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes star-unlock {
  from { opacity: .5; transform: scale(.7) rotate(-12deg); }
  to { opacity: 1; transform: scale(1) rotate(0); }
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

</style>
