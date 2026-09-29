<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import { completeMission } from '@/application/useCases/completeMission'
import { startMission } from '@/application/useCases/startMission'
import { factFromId } from '@/domain/fact/multiplicationFact'
import type { AttemptOutcome } from '@/domain/learning/answer'
import { explanationFor } from '@/domain/learning/explanation'
import { unansweredCardFactIds, type ProgressState } from '@/domain/progress/progressState'
import AnswerField from '@/presentation/components/AnswerField.vue'
import MissionProgress from '@/presentation/components/MissionProgress.vue'
import PrimaryButton from '@/presentation/components/PrimaryButton.vue'
import QuestionCard from '@/presentation/components/QuestionCard.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import { useGameSession } from '@/presentation/composables/gameSession'
import { today } from '@/presentation/utils/clock'
import { STAR_PATH } from '@/presentation/utils/constellation'
import { spokenExpression } from '@/presentation/utils/spokenExpression'

/**
 * Экран миссии: одна карточка за раз, ответ скрыт до попытки,
 * после ответа — результат и подсказка (PRD §2–3). Без автоперехода.
 */

interface Feedback {
  readonly outcome: AttemptOutcome
  readonly text: string
  readonly tone: 'success' | 'error' | 'hint'
  readonly hintText: string | null
  readonly submittedValue: number | null
}

const props = defineProps<{ practice?: boolean }>()
const emit = defineEmits<{ exit: []; completed: [] }>()
const session = useGameSession()

const missionId = ref('')
const cardFactIds = ref<string[]>([])
const cardIndex = ref(0)
const answerInput = ref('')
const inputError = ref<string | null>(null)
const feedback = ref<Feedback | null>(null)
const finished = ref(false)
const expeditionJustFinished = ref(false)
const awardedXp = ref(0)
const bonusXp = ref(0)
const cardRegion = ref<HTMLElement | null>(null)
const actions = ref<HTMLElement | null>(null)

const fact = computed(() => factFromId(cardFactIds.value[cardIndex.value] ?? '0:0'))
const allAnswered = computed(() => cardIndex.value >= cardFactIds.value.length)

onMounted(() => {
  // Плановая игра продолжает незавершённую миссию (PRD M4, §7); свободная практика
  // начинает новую сессию и замораживает новую очередь.
  const existing = props.practice === true ? null : session.state.value.currentMission
  if (existing !== null) {
    missionId.value = existing.id
    cardFactIds.value = unansweredCardFactIds(existing)
  } else {
    const started = startMission(session.state.value, {
      missionId: crypto.randomUUID(),
      date: today(),
      kind: props.practice === true ? 'practice' : 'mission',
    })
    missionId.value = started.mission.id
    session.state.value = started.state
    cardFactIds.value = [...started.mission.cardFactIds]
    session.save()
  }
  if (cardFactIds.value.length === 0) {
    finish()
  } else {
    focusCard()
  }
})

function check(): void {
  if (feedback.value !== null) return
  const result = submitCardAnswer(session.state.value, {
    factId: fact.value.id,
    date: today(),
    missionId: missionId.value,
    rawAnswer: answerInput.value,
    choseUnknown: false,
  })
  if (result.kind === 'invalid-input') {
    inputError.value = 'Введи целое число от 0 до 100'
    return
  }
  applyAccepted(result.outcome, result.state, result.acceptedValue)
}

function dontKnow(): void {
  if (feedback.value !== null) return
  const result = submitCardAnswer(session.state.value, {
    factId: fact.value.id,
    date: today(),
    missionId: missionId.value,
    rawAnswer: null,
    choseUnknown: true,
  })
  if (result.kind === 'accepted') applyAccepted(result.outcome, result.state, result.acceptedValue)
}

function applyAccepted(
  outcome: AttemptOutcome,
  state: ProgressState,
  acceptedValue: number | null,
): void {
  inputError.value = null
  session.state.value = state
  session.save()
  feedback.value = {
    outcome,
    text: feedbackText(outcome),
    submittedValue: acceptedValue,
    tone: outcome === 'correct' ? 'success' : outcome === 'wrong' ? 'error' : 'hint',
    hintText: outcome === 'correct' ? null : explanationFor(fact.value),
  }
  focusPrimaryAction()
}

function next(): void {
  feedback.value = null
  answerInput.value = ''
  cardIndex.value += 1
  if (allAnswered.value) {
    finish()
  } else {
    focusCard()
  }
}

function finish(): void {
  const result = completeMission(session.state.value, { missionId: missionId.value, date: today() })
  session.state.value = result.state
  expeditionJustFinished.value = result.expeditionJustFinished
  awardedXp.value = result.xpAwarded
  bonusXp.value = result.streakBonusXp
  session.save()
  finished.value = true
  focusCard()
}

/** Предсказуемый фокус: после ответа — главное действие, на новой карточке — поле ввода. */
function focusCard(): void {
  void nextTick(() => {
    const input = cardRegion.value?.querySelector('input')
    if (input instanceof HTMLElement) input.focus()
    else cardRegion.value?.focus()
  })
}

function focusPrimaryAction(): void {
  void nextTick(() => actions.value?.querySelector('button')?.focus())
}

function feedbackText(outcome: AttemptOutcome): string {
  if (outcome === 'correct') return 'Верно'
  return outcome === 'unknown' ? 'Посмотрим подсказку' : 'Разберём вместе'
}
</script>

<template>
  <section class="screen mission" tabindex="-1">
    <h1 class="visually-hidden">Миссия</h1>
    <template v-if="!finished">
      <MissionProgress :current="cardIndex + 1" :total="Math.max(cardFactIds.length, 1)" />

      <div ref="cardRegion" class="mission__card" tabindex="-1">
        <QuestionCard
          :expression="`${fact.factors[0]} × ${fact.factors[1]} = ?`"
          :spoken="spokenExpression(fact.factors[0], fact.factors[1])"
          :feedback-text="feedback?.text ?? null"
          :feedback-tone="feedback?.tone ?? null"
          :celebrate="feedback?.outcome === 'correct'"
          :review="feedback !== null && feedback.outcome !== 'correct'"
          :answer-value="feedback ? fact.product : undefined"
          :submitted-value="feedback?.outcome === 'wrong' ? feedback.submittedValue : null"
          :zero-group-value="feedback && feedback.outcome !== 'correct' && fact.factors[0] === 0 ? fact.factors[1] : null"
          :hint-text="feedback?.hintText ?? null"
        />

        <!-- После верного ответа поле убирается; ошибочное значение остаётся видимым (DESIGN.md). -->
        <AnswerField
          v-if="feedback === null"
          v-model="answerInput"
          :error-text="inputError"
          :disabled="feedback !== null"
          label="Ответ на пример"
          @update:model-value="inputError = null"
          @submit="check"
        />
      </div>

      <div ref="actions" class="screen__actions">
        <PrimaryButton
          v-if="feedback === null"
          label="Проверить"
          :disabled="answerInput.trim() === ''"
          @click="check"
        />
        <PrimaryButton v-else label="Продолжить" @click="next" />
        <SecondaryButton v-if="feedback === null" label="Не знаю" @click="dontKnow" />
        <SecondaryButton label="Назад" @click="emit('exit')" />
      </div>
    </template>

    <template v-else>
      <div ref="cardRegion" class="mission__finish" tabindex="-1">
        <svg
          class="mission__finish-art"
          :class="{ 'mission__finish-art--expedition': expeditionJustFinished }"
          :viewBox="expeditionJustFinished ? '0 0 330 180' : '0 0 320 112'"
          aria-hidden="true"
        >
          <template v-if="expeditionJustFinished">
            <path
              v-for="n in 66"
              :key="n"
              :d="STAR_PATH"
              :transform="`translate(${15 + ((n - 1) % 11) * 30} ${15 + Math.floor((n - 1) / 11) * 30})`"
              class="mission__finish-star"
            />
          </template>
          <template v-else>
            <path class="mission__finish-orbit" d="M -24 88 C 74 5 201 127 345 18" />
            <path :d="STAR_PATH" transform="translate(54 66) scale(.7)" class="mission__finish-star mission__finish-star--small" />
            <path :d="STAR_PATH" transform="translate(163 73) scale(2.5)" class="mission__finish-star mission__finish-star--hero" />
            <path :d="STAR_PATH" transform="translate(271 30) scale(.9)" class="mission__finish-star mission__finish-star--small" />
          </template>
        </svg>
        <div class="mission__finish-content">
          <p class="mission__finish-eyebrow">Маршрут пройден</p>
          <h2 class="mission__finish-title">{{ expeditionJustFinished ? 'Экспедиция завершена!' : 'Миссия завершена!' }}</h2>
          <p class="mission__finish-copy">
            {{ expeditionJustFinished ? 'Все 66 звёзд открыты. Теперь можно повторять и играть свободно.' : 'Ты потренировался. Завтра можно продолжить маршрут.' }}
          </p>
          <div class="mission__award" role="status">
            <template v-if="awardedXp + bonusXp > 0">
              <span class="mission__award-label">Награда за миссию</span>
              <strong class="mission__award-value">+{{ awardedXp + bonusXp }} XP</strong>
              <span v-if="bonusXp > 0" class="mission__award-bonus">В том числе {{ bonusXp }} XP за серию</span>
            </template>
            <span v-else>Практика засчитана. Новые XP в этой миссии не начислены.</span>
          </div>
          <p v-if="session.stars.value > 0" class="mission__stars">Открыто звёзд: {{ session.stars.value }} из 66</p>
          <p v-else class="mission__stars">Звёзды — за ответы, которые помнишь через неделю.</p>
        </div>
      </div>
      <div ref="actions" class="screen__actions">
        <PrimaryButton label="Продолжить" @click="emit('completed')" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.mission:focus {
  outline: none;
}

.mission__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.mission__card:focus {
  outline: none;
}
.mission__finish {
  overflow: hidden;
  border-radius: var(--radius-card);
  background: var(--color-paper);
  color: var(--color-ink);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
}

.mission__finish:focus { outline: none; }

.mission__finish-art {
  display: block;
  width: 100%;
  height: 112px;
  background: var(--color-space-raised);
}

.mission__finish-art--expedition { height: 180px; }

.mission__finish-orbit {
  fill: none;
  stroke: var(--color-control-outline);
  stroke-width: 2;
  stroke-dasharray: 4 8;
}

.mission__finish-star { fill: var(--color-streak); }
.mission__finish-star--small { fill: var(--color-on-space); }

.mission__finish-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
}

.mission__finish-eyebrow {
  color: var(--color-success);
  font-size: var(--font-size-label);
  font-weight: 700;
}

.mission__finish-title {
  margin: 0;
  font-size: var(--font-size-title);
  line-height: var(--line-height-title);
  text-wrap: balance;
}

.mission__finish-copy { color: var(--color-ink-muted); }

.mission__award {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-lg);
  border: 1px solid var(--color-review-outline);
  border-radius: var(--radius-control);
  background: var(--color-review-surface);
  color: var(--color-review-ink);
}

.mission__award-label,
.mission__award-bonus {
  font-size: var(--font-size-label);
}

.mission__award-value {
  color: var(--color-ink);
  font-size: 2.5rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.mission__stars {
  color: var(--color-ink-muted);
  font-size: var(--font-size-label);
}

@media (prefers-reduced-motion: no-preference) {
  .mission__finish-star--hero {
    transform-origin: 163px 73px;
    animation: mission-star-arrive 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .mission__award {
    animation: award-arrive 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@keyframes mission-star-arrive {
  from { opacity: .45; scale: .75; }
  to { opacity: 1; scale: 1; }
}

@keyframes award-arrive {
  from { opacity: .65; transform: translateY(8px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
