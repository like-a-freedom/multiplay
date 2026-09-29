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
    text: feedbackText(outcome, acceptedValue),
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

function feedbackText(outcome: AttemptOutcome, acceptedValue: number | null): string {
  const product = fact.value.product
  if (outcome === 'correct') return 'Верно'
  if (outcome === 'wrong') {
    return `Попробуем ещё: ты ответил ${acceptedValue}, а верный ответ ${product}`
  }
  return `Посмотри подсказку: ответ ${product}`
}
</script>

<template>
  <section class="screen mission" tabindex="-1">
    <template v-if="!finished">
      <MissionProgress :current="cardIndex + 1" :total="Math.max(cardFactIds.length, 1)" />

      <div ref="cardRegion" class="mission__card" tabindex="-1">
        <QuestionCard
          :expression="`${fact.factors[0]} × ${fact.factors[1]} = ?`"
          :spoken="spokenExpression(fact.factors[0], fact.factors[1])"
          :feedback-text="feedback?.text ?? null"
          :feedback-tone="feedback?.tone ?? null"
          :hint-text="feedback?.hintText ?? null"
        />

        <!-- После верного ответа поле убирается; ошибочное значение остаётся видимым (DESIGN.md). -->
        <AnswerField
          v-if="feedback === null || feedback.outcome === 'wrong'"
          v-model="answerInput"
          :error-text="inputError"
          :disabled="feedback !== null"
          label="Ответ на пример"
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
      <div ref="cardRegion" class="mission__card" tabindex="-1">
        <QuestionCard
          v-if="expeditionJustFinished"
          expression="Экспедиция завершена!"
          spoken="Экспедиция завершена"
          feedback-text="Все 66 звёзд открыты"
          feedback-tone="success"
          hint-text="Теперь доступны повторения и свободная практика."
        />
        <QuestionCard
          v-else
          expression="Миссия завершена!"
          spoken="Миссия завершена"
          feedback-text="Отличная работа"
          feedback-tone="success"
        />
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
</style>
