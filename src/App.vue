<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

import type { MissionKind } from '@/application/useCases/startMission'
import { retentionSummary } from '@/domain/learning/retention'
import { TOTAL_FACTS, rewardsPausedByClockRollback } from '@/domain/progress/rewards'
import { factNeedsReview, upcomingReviewDate } from '@/domain/progress/progressState'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import { reviewCountToday, useGameSession } from '@/presentation/composables/gameSession'
import { today } from '@/presentation/utils/clock'
import DiagnosticScreen from '@/presentation/screens/DiagnosticScreen.vue'
import HomeScreen from '@/presentation/screens/HomeScreen.vue'
import KnowledgeMapScreen from '@/presentation/screens/KnowledgeMapScreen.vue'
import MissionScreen from '@/presentation/screens/MissionScreen.vue'
import ReportScreen from '@/presentation/screens/ReportScreen.vue'

type Screen = 'diagnostic' | 'home' | 'mission' | 'map' | 'report'

const session = useGameSession()
const todayDate = today()

// Updates and status notices appear between missions so a lesson is never disturbed (PRD §4).
const lessonActive = computed(() => screen.value === 'mission' || screen.value === 'diagnostic')

const needsDiagnostic = computed(() => {
  const diagnostic = session.state.value.diagnostic
  return diagnostic == null || (!diagnostic.completed && !diagnostic.skipped)
})

const screen = ref<Screen>(needsDiagnostic.value ? 'diagnostic' : 'home')
watch(screen, () => {
  void nextTick(() => {
    const heading = document.querySelector<HTMLElement>('main h1')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus()
  })
})
const diagnosticResume = ref(true)
const missionKind = ref<MissionKind>('mission')

function play(kind: MissionKind): void {
  missionKind.value = kind
  screen.value = 'mission'
}

const reviewsToday = computed(() => reviewCountToday(session.state.value, todayDate))
const bestStreakDays = computed(() => session.state.value.rewards.streak.bestDays)
const retention = computed(() => retentionSummary(session.state.value.attempts))
const nextReview = computed(() => upcomingReviewDate(session.state.value, todayDate))
const clockRolledBack = computed(() =>
  rewardsPausedByClockRollback(session.state.value, todayDate),
)

const factIds = computed(() => Object.keys(session.state.value.facts))
const earnedFactIds = computed(() =>
  Object.values(session.state.value.facts)
    .filter((fact) => fact.mastery.hasStar)
    .map((fact) => fact.factId),
)
const reviewFactIds = computed(() =>
  Object.values(session.state.value.facts)
    .filter((fact) => factNeedsReview(fact, todayDate))
    .map((fact) => fact.factId),
)

// PWA: "offline ready"; an update is offered without reloading a lesson (PRD M6).
const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
const offlineNoticeDismissed = ref(false)
const updateDismissed = ref(false)
const resetConfirm = ref(false)

function onReset(): void {
  session.resetProgress()
  resetConfirm.value = false
  screen.value = 'diagnostic'
  diagnosticResume.value = true
}

function onRecheck(): void {
  diagnosticResume.value = false
  screen.value = 'diagnostic'
}

function onDiagnosticFinished(): void {
  diagnosticResume.value = true
  screen.value = 'home'
}
</script>

<template>
  <main>
    <div v-if="offlineReady && !offlineNoticeDismissed && !lessonActive" class="banner" role="status">
      <span>Готово без интернета</span>
      <SecondaryButton label="Понятно" @click="offlineNoticeDismissed = true" />
    </div>

    <div v-if="needRefresh && !updateDismissed && !lessonActive" class="banner" role="status">
      <span>Обновление готово</span>
      <SecondaryButton label="Обновить" @click="updateServiceWorker(true)" />
      <SecondaryButton label="Позже" @click="updateDismissed = true" />
    </div>

    <div v-if="clockRolledBack && !lessonActive" class="banner" role="status">
      <span>Дата устройства стала раньше последнего начисления. Практика доступна, но XP и серия приостановлены.</span>
    </div>

    <div v-if="session.storageStatus.value !== 'ok'" class="banner banner--error" role="alert">
      <template v-if="session.storageStatus.value === 'corrupt'">
        <span>Данные прогресса повреждены. Сброс данных удалит их.</span>
        <SecondaryButton v-if="resetConfirm" label="Отмена" @click="resetConfirm = false" />
        <SecondaryButton
          :label="resetConfirm ? 'Подтвердить сброс' : 'Сбросить данные'"
          @click="resetConfirm ? onReset() : (resetConfirm = true)"
        />
      </template>
      <template v-else-if="session.storageStatus.value === 'unknown-version'">
        <span>Данные сохранены другой версией приложения. Сброс данных удалит их.</span>
        <SecondaryButton v-if="resetConfirm" label="Отмена" @click="resetConfirm = false" />
        <SecondaryButton
          :label="resetConfirm ? 'Подтвердить сброс' : 'Сбросить данные'"
          @click="resetConfirm ? onReset() : (resetConfirm = true)"
        />
      </template>
      <template v-else>
        <span>Прогресс не сохраняется</span>
        <SecondaryButton label="Повторить запись" @click="session.save()" />
      </template>
    </div>

    <DiagnosticScreen
      v-if="screen === 'diagnostic'"
      :resume="diagnosticResume"
      @finished="onDiagnosticFinished"
    />

    <HomeScreen
      v-else-if="screen === 'home'"
      :xp="session.totalXp.value"
      :level="session.level.value"
      :streak-days="session.streakDays.value"
      :stars="session.stars.value"
      :total-facts="TOTAL_FACTS"
      :reviews-today="reviewsToday"
      :maintenance-mode="session.state.value.mode === 'maintenance'"
      :next-review-date="nextReview"
      @play="play('mission')"
      @practice="play('practice')"
      @review="play('review')"
      @map="screen = 'map'"
      @report="screen = 'report'"
    />

    <MissionScreen
      v-else-if="screen === 'mission'"
      :kind="missionKind"
      @exit="screen = 'home'"
      @completed="screen = 'home'"
      @map="screen = 'map'"
    />

    <KnowledgeMapScreen
      v-else-if="screen === 'map'"
      :fact-ids="factIds"
      :earned-fact-ids="earnedFactIds"
      :review-fact-ids="reviewFactIds"
      @back="screen = 'home'"
      @review="play('review')"
    />

    <ReportScreen
      v-else
      :xp="session.totalXp.value"
      :level="session.level.value"
      :stars="session.stars.value"
      :total-facts="TOTAL_FACTS"
      :best-streak-days="bestStreakDays"
      :reviews-today="reviewsToday"
      :retention-correct="retention.correct"
      :retention-checked="retention.checked"
      :has-diagnostic-set="session.state.value.diagnostic !== null"
      @back="screen = 'home'"
      @reset="onReset"
      @recheck="onRecheck"
    />
  </main>
</template>

<style scoped>
.banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  max-width: 480px;
  margin: 0 auto var(--space-lg);
  padding: var(--space-md);
  border-radius: var(--radius-control);
  background: var(--color-space-raised);
  color: var(--color-on-space);
}

.banner--error {
  border: 1px solid var(--color-error);
}
</style>
