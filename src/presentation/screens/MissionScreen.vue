<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { submitCardAnswer } from '@/application/useCases/submitCardAnswer'
import { completeMission } from '@/application/useCases/completeMission'
import { startMission, type MissionKind } from '@/application/useCases/startMission'
import { allFacts, factFromId } from '@/domain/fact/multiplicationFact'
import type { AttemptOutcome } from '@/domain/learning/answer'
import { explanationFor } from '@/domain/learning/explanation'
import type { ProgressState } from '@/domain/progress/progressState'
import type { XpBlockedReason } from '@/domain/progress/rewards'
import AnswerField from '@/presentation/components/AnswerField.vue'
import CompanionCue from '@/presentation/components/CompanionCue.vue'
import GameIcon from '@/presentation/components/GameIcon.vue'
import OrbitScene from '@/presentation/components/OrbitScene.vue'
import Confetti from '@/presentation/components/inspira/Confetti.vue'
import SparklesText from '@/presentation/components/inspira/SparklesText.vue'
import ConstellationSky from '@/presentation/components/ConstellationSky.vue'
import ExpeditionCelebration from '@/presentation/components/ExpeditionCelebration.vue'
import MissionProgress from '@/presentation/components/MissionProgress.vue'
import PrimaryButton from '@/presentation/components/PrimaryButton.vue'
import QuestionCard from '@/presentation/components/QuestionCard.vue'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import StarGlyph from '@/presentation/components/StarGlyph.vue'
import XpAward from '@/presentation/components/XpAward.vue'
import XpRoute from '@/presentation/components/XpRoute.vue'
import { useGameSession } from '@/presentation/composables/gameSession'
import { today } from '@/presentation/utils/clock'
import { spokenExpression } from '@/presentation/utils/spokenExpression'

/**
 * Mission screen: one card at a time, the answer hidden until an attempt;
 * after the attempt — the result and a hint (PRD §2–3). No auto-advance.
 */

interface Feedback {
  readonly outcome: AttemptOutcome
  readonly text: string
  readonly tone: 'success' | 'error' | 'hint'
  readonly hintText: string | null
  readonly submittedValue: number | null
  readonly starUnlocked: boolean
}

const props = defineProps<{ kind?: MissionKind }>()
const emit = defineEmits<{ exit: []; completed: []; map: []; 'star-unlocked': [factId: string] }>()
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
const xpBeforeCompletion = ref<number | null>(null)
const xpBlockedReason = ref<XpBlockedReason | null>(null)
const prefersReducedMotion = ref(false)
const cardRegion = ref<HTMLElement | null>(null)
const actions = ref<HTMLElement | null>(null)
const allFactIds = allFacts().map((fact) => fact.id)
let motionQuery: MediaQueryList | undefined

const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
  prefersReducedMotion.value = event.matches
}

const fact = computed(() => factFromId(cardFactIds.value[cardIndex.value] ?? '0:0'))
const allAnswered = computed(() => cardIndex.value >= cardFactIds.value.length)
const outcomes = computed(() => cardFactIds.value.map((factId) => session.state.value.attempts.filter((attempt) => attempt.missionId === missionId.value && attempt.factId === factId).at(-1)?.outcome))
const outcomeCounts = computed(() => ({
  correct: outcomes.value.filter((outcome) => outcome === 'correct').length,
  wrong: outcomes.value.filter((outcome) => outcome === 'wrong').length,
  unknown: outcomes.value.filter((outcome) => outcome === 'unknown').length,
}))

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = motionQuery.matches
  motionQuery.addEventListener?.('change', onMotionPreferenceChange)
  // A planned mission or a review resumes an unfinished session (PRD M4, §7);
  // free practice starts a new one and freezes a new queue.
  const kind = props.kind ?? 'mission'
  const existing = kind === 'practice' ? null : session.state.value.currentMission
  if (existing !== null) {
    missionId.value = existing.id
    cardFactIds.value = [...existing.cardFactIds]
    const firstUnanswered = existing.cardFactIds.findIndex((factId) => !existing.answeredFactIds.includes(factId))
    cardIndex.value = firstUnanswered < 0 ? existing.cardFactIds.length : firstUnanswered
  } else {
    const started = startMission(session.state.value, {
      missionId: crypto.randomUUID(),
      date: today(),
      kind,
    })
    missionId.value = started.mission.id
    session.state.value = started.state
    cardFactIds.value = [...started.mission.cardFactIds]
    session.save()
  }
  if (allAnswered.value) {
    finish()
  } else {
    focusCard()
  }
})

onBeforeUnmount(() => {
  motionQuery?.removeEventListener?.('change', onMotionPreferenceChange)
})

function check(): void {
  if (feedback.value !== null) return
  // An empty field is not an error: the hint already sits in the placeholder (PRD M2).
  if (answerInput.value.trim() === '') return

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
  const starUnlocked =
    !session.state.value.facts[fact.value.id].mastery.hasStar &&
    state.facts[fact.value.id].mastery.hasStar
  session.state.value = state
  session.save()
  feedback.value = {
    outcome,
    text: feedbackText(outcome),
    submittedValue: acceptedValue,
    tone: outcome === 'correct' ? 'success' : outcome === 'wrong' ? 'error' : 'hint',
    hintText: outcome === 'correct' ? null : explanationFor(fact.value),
    starUnlocked,
  }
  if (starUnlocked) emit('star-unlocked', fact.value.id)
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
  const date = today()
  xpBeforeCompletion.value = session.totalXp.value
  const result = completeMission(session.state.value, { missionId: missionId.value, date })
  session.state.value = result.state
  expeditionJustFinished.value = result.expeditionJustFinished
  awardedXp.value = result.xpAwarded
  bonusXp.value = result.streakBonusXp
  xpBlockedReason.value = result.xpBlockedReason
  session.save()
  finished.value = true
  focusCard()
}

/** Predictable focus: the primary action after an answer, the input on a new card. */
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
    <header v-if="!finished" class="mission__header">
      <button class="mission__back" type="button" aria-label="Назад" @click="emit('exit')"><GameIcon name="back" /></button>
      <h1 class="screen__title">{{ kind === 'review' ? 'Вспоминаем' : 'Миссия' }}</h1>
      <GameIcon class="mission__header-icon" name="rocket" :size="28" />
    </header>
    <h1 v-else class="visually-hidden">Миссия</h1>
    <template v-if="!finished">
      <MissionProgress :current="cardIndex + 1" :total="Math.max(cardFactIds.length, 1)" :outcomes="outcomes" />

      <div ref="cardRegion" class="mission__card" tabindex="-1">
        <QuestionCard
          :expression="`${fact.factors[0]} × ${fact.factors[1]} = ?`"
          :spoken="spokenExpression(fact.factors[0], fact.factors[1])"
          :revealed="feedback !== null"
          :feedback-text="feedback?.text ?? null"
          :feedback-tone="feedback?.tone ?? null"
          :celebrate="feedback?.outcome === 'correct'"
          :star-unlocked="feedback?.starUnlocked ?? false"
          :review="feedback !== null && feedback.outcome !== 'correct'"
          :answer-value="feedback ? fact.product : undefined"
          :submitted-value="feedback?.outcome === 'wrong' ? feedback.submittedValue : null"
          :hint-text="feedback?.hintText ?? null"
        >
          <!-- The field is hidden after submission; the front face becomes inert during the reveal. -->
          <AnswerField
            v-if="feedback === null"
            v-model="answerInput"
            :error-text="inputError"
            label="Ответ на пример"
            @update:model-value="inputError = null"
            @submit="check"
          />
        </QuestionCard>
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
      </div>
      <CompanionCue v-if="feedback === null" text="Я рядом. Если не знаешь — разберём вместе." />
      <CompanionCue v-else :mood="feedback.outcome === 'correct' ? 'happy' : 'thinking'" :text="feedback.outcome === 'correct' ? 'Точно! Ещё одно маленькое открытие.' : 'Теперь есть способ вспомнить. Попробуем ещё?'" />
    </template>

    <template v-else>
      <div ref="cardRegion" class="mission__finish" tabindex="-1">
        <Confetti v-if="!expeditionJustFinished && awardedXp + bonusXp > 0" :reduced-motion="prefersReducedMotion" />
        <div class="mission__finish-content">
          <OrbitScene v-if="!expeditionJustFinished" compact />
          <h2 class="mission__finish-title"><SparklesText :text="expeditionJustFinished ? 'Экспедиция завершена!' : 'Миссия завершена!'" /></h2>
          <p class="mission__finish-copy">
            {{ expeditionJustFinished ? 'Все 66 звёзд открыты. Теперь можно повторять и играть свободно.' : 'Ты прошёл маршрут. Можно сыграть ещё или вернуться позже.' }}
          </p>
          <div v-if="expeditionJustFinished" class="mission__final-sky">
            <ConstellationSky :earned-fact-ids="allFactIds" variant="final" />
            <ExpeditionCelebration
              :active="expeditionJustFinished"
              :reduced-motion="prefersReducedMotion"
            />
          </div>
          <dl class="mission__results" aria-label="Итоги карточек">
            <div class="mission__result--correct"><dt>Верно</dt><dd>{{ outcomeCounts.correct }}</dd></div>
            <div class="mission__result--wrong"><dt>Разобрали</dt><dd>{{ outcomeCounts.wrong }}</dd></div>
            <div class="mission__result--unknown"><dt>С подсказкой</dt><dd>{{ outcomeCounts.unknown }}</dd></div>
          </dl>
          <XpAward
            :awarded-xp="awardedXp"
            :bonus-xp="bonusXp"
            :total-xp="session.totalXp.value"
            :level="session.level.value"
            :xp-blocked-reason="xpBlockedReason"
          />
          <XpRoute
            v-if="!expeditionJustFinished"
            variant="finish"
            :total-xp="session.totalXp.value"
            :from-xp="xpBeforeCompletion"
          />
          <div class="mission__stars">
            <div class="mission__stars-heading">
              <span class="mission__stars-symbol"><StarGlyph :size="32" :earned="session.stars.value > 0" /></span>
              <strong>Звёзды знаний: {{ session.stars.value }} из 66</strong>
            </div>
            <p>Звезда открывается за пример, который ты решил сам и повторил спустя неделю. XP на звёзды не влияют.</p>
          </div>
        </div>
      </div>
      <div ref="actions" class="screen__actions">
        <PrimaryButton label="Продолжить" @click="emit('completed')" />
        <SecondaryButton label="Карта звёзд" @click="emit('map')" />
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
  position: relative;
  overflow: hidden;
  color: var(--color-ink);
}

.mission__finish:focus { outline: none; }

.mission__finish-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.mission__finish-title {
  margin: 0;
  font-size: var(--font-size-title);
  line-height: var(--line-height-title);
  text-wrap: balance;
  hyphens: auto;
  overflow-wrap: normal;
  text-align: center;
  font-weight: 900;
}

.mission__finish-copy { color: var(--color-ink-muted); text-align: center; font-size: var(--font-size-label); }
.mission__header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-md); }
.mission__header .screen__title { font-size: var(--font-size-heading-compact); }
.mission__back { display: grid; place-content: center; width: 48px; height: 48px; border: 1px solid var(--color-divider); border-radius: var(--radius-control); background: var(--color-paper); color: var(--color-ink); cursor: pointer; }
.mission__header-icon { margin-inline: var(--space-md); color: var(--color-focus); }
.mission :deep(.companion-cue) { align-self: center; }
.mission :deep(.xp-route__level) { color: var(--color-focus); }

.mission__final-sky {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 280px;
  align-self: center;
  overflow: hidden;
  border-radius: var(--radius-card);
  isolation: isolate;
}

.mission__stars {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-divider);
}

.mission__stars strong { color: var(--color-ink); }
.xp-award + .mission__stars { border-top: 0; padding-top: 0; }
.mission__stars-heading { display: flex; align-items: center; gap: var(--space-md); }
.mission__stars-symbol { display: grid; flex-shrink: 0; place-items: center; width: 40px; height: 40px; border-radius: var(--radius-icon); background: var(--color-cosmos); }
.mission__results { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-sm); margin: 0; padding-block: var(--space-md); border-block: 1px solid var(--color-divider); }
.mission__results > div { display: grid; grid-template-rows: auto 1fr; gap: var(--space-xs); text-align: center; }
.mission__results dt { font-size: var(--font-size-meta); font-weight: 800; line-height: var(--line-height-label); }
.mission__results dd { align-self: end; margin: 0; font-size: var(--font-size-heading-compact); font-weight: 900; font-variant-numeric: tabular-nums; }
.mission__result--correct { color: var(--color-success); }
.mission__result--wrong { color: var(--color-review-ink); }
.mission__result--unknown { color: var(--color-help-ink); }
@media (max-width: 360px) { .mission__results { grid-template-columns: 1fr; gap: var(--space-md); } .mission__results > div { display: flex; justify-content: space-between; align-items: baseline; } }
.mission__stars p {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--font-size-label);
}

@media (prefers-reduced-motion: no-preference) {
  .xp-award {
    animation: award-arrive 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
}

@keyframes award-arrive {
  from { opacity: .65; transform: translateY(8px) scale(.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
