<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'

import {
  type DiagnosticCard,
  diagnosticCards,
  finishDiagnostic,
  skipDiagnostic,
  startDiagnostic,
} from '@/application/useCases/diagnostic'
import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import AnswerField from '@/presentation/components/AnswerField.vue'
import MissionProgress from '@/presentation/components/MissionProgress.vue'
import PrimaryButton from '@/presentation/components/PrimaryButton.vue'
import QuestionCard from '@/presentation/components/QuestionCard.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import { useGameSession } from '@/presentation/composables/gameSession'
import { today } from '@/presentation/utils/clock'
import { spokenExpression } from '@/presentation/utils/spokenExpression'

/**
 * Диагностика (PRD §3): 10 карточек без таймера; ответы и подсказки —
 * только после окончания проверки. Можно пропустить. Без XP и серии.
 */

const props = defineProps<{ resume: boolean }>()
const emit = defineEmits<{ finished: [] }>()

const session = useGameSession()
const cards = ref<readonly DiagnosticCard[]>([])
const cardIndex = ref(0)
const answerInput = ref('')
const inputError = ref<string | null>(null)
const summary = ref(false)
const region = ref<HTMLElement | null>(null)
function focusCurrent(): void {
  void nextTick(() => {
    const target = summary.value ? region.value?.querySelector<HTMLElement>('h1') : region.value?.querySelector<HTMLInputElement>('input')
    target?.focus()
  })
}

const card = computed(() => cards.value[cardIndex.value])
const lastIndex = computed(() => Math.max(cards.value.length - 1, 0))

onMounted(() => {
  session.state.value = startDiagnostic(session.state.value)
  cards.value = diagnosticCards(session.state.value, props.resume)
  if (cards.value.length === 0) complete()
})

function answer(choseUnknown: boolean): void {
  const current = card.value
  if (current === undefined) return
  // Пустое поле — не ошибка: подсказка уже видна в плейсхолдере (PRD M2).
  if (!choseUnknown && answerInput.value.trim() === '') return

  const result = submitCardAnswer(session.state.value, {
    factId: current.fact.id,
    date: today(),
    missionId: null,
    rawAnswer: choseUnknown ? null : answerInput.value,
    choseUnknown,
  })
  if (result.kind === 'invalid-input') {
    inputError.value = 'Введи целое число от 0 до 100'
    return
  }

  session.state.value = result.state
  session.save()
  inputError.value = null
  answerInput.value = ''

  if (cardIndex.value >= lastIndex.value) {
    complete()
  } else {
    cardIndex.value += 1
    focusCurrent()
  }
}

function skip(): void {
  session.state.value = skipDiagnostic(session.state.value)
  session.save()
  emit('finished')
}

function complete(): void {
  session.state.value = finishDiagnostic(session.state.value)
  session.save()
  cards.value = diagnosticCards(session.state.value, false)
  summary.value = true
  focusCurrent()
}

function outcomeWord(outcome: DiagnosticCard['outcome']): string {
  if (outcome === 'correct') return 'Верно'
  if (outcome === 'wrong') return 'Ответ неверный'
  return 'Не знаю'
}
</script>

<template>
  <section ref="region" class="screen diagnostic">
    <template v-if="!summary">
      <h1 class="screen__title" tabindex="-1">Короткая проверка</h1>
      <p>Без спешки. Если ответ пока неизвестен, нажми «Не знаю».</p>
      <MissionProgress :current="cardIndex + 1" :total="Math.max(cards.length, 1)" />

      <QuestionCard
        v-if="card"
        :expression="card.expression"
        :spoken="spokenExpression(card.fact.factors[0], card.fact.factors[1])"
      />

      <AnswerField
        v-model="answerInput"
        :error-text="inputError"
        label="Ответ на пример"
        @update:model-value="inputError = null"
        @submit="answer(false)"
      />

      <div class="screen__actions">
        <PrimaryButton
          :label="cardIndex >= lastIndex ? 'Завершить проверку' : 'Далее'"
          :disabled="answerInput.trim() === ''"
          @click="answer(false)"
        />
        <SecondaryButton label="Не знаю" @click="answer(true)" />
        <SecondaryButton label="Пропустить проверку" @click="skip" />
      </div>
    </template>

    <template v-else>
      <h1 class="screen__title" tabindex="-1">Проверка завершена</h1>
      <p>Ответы и подсказки — ниже. Проверка не даёт XP и не влияет на серию.</p>
      <ul class="diagnostic__summary">
        <li v-for="item in cards" :key="item.fact.id">
          <strong>{{ item.fact.factors[0] }} × {{ item.fact.factors[1] }} = {{ item.fact.product }}</strong>
          — {{ outcomeWord(item.outcome) }} · {{ item.explanation }}
        </li>
      </ul>
      <div class="screen__actions">
        <PrimaryButton label="Продолжить" @click="emit('finished')" />
      </div>
    </template>
  </section>
</template>

<style scoped>
.diagnostic__summary {
  margin: 0;
  padding-left: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
