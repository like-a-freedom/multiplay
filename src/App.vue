<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { LazyMotion, domAnimation } from 'motion-v'
import { useDocumentVisibility } from '@vueuse/core'
import { useRegisterSW } from 'virtual:pwa-register/vue'

import type { MissionKind } from '@/application/useCases/startMission'
import { allFacts } from '@/domain/fact/multiplicationFact'
import { retentionSummary } from '@/domain/learning/retention'
import { TOTAL_FACTS, rewardsPausedByClockRollback } from '@/domain/progress/rewards'
import { factNeedsReview, upcomingReviewDate } from '@/domain/progress/progressState'
import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import Dock from '@/presentation/components/inspira/Dock.vue'
import { reviewCountToday, useGameSession } from '@/presentation/composables/gameSession'
import { today } from '@/presentation/utils/clock'
import DiagnosticScreen from '@/presentation/screens/DiagnosticScreen.vue'
import HomeScreen from '@/presentation/screens/HomeScreen.vue'
import KnowledgeMapScreen from '@/presentation/screens/KnowledgeMapScreen.vue'
import MissionScreen from '@/presentation/screens/MissionScreen.vue'
import ReportScreen from '@/presentation/screens/ReportScreen.vue'

type Screen = 'diagnostic' | 'home' | 'mission' | 'map' | 'report'

const session = useGameSession()
const documentVisibility = useDocumentVisibility()
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
const pendingStarRevealIds = ref<string[]>([])

function play(kind: MissionKind): void {
  missionKind.value = kind
  screen.value = 'mission'
}

const launching = ref(false)
let launchTimer: number | undefined

function launch(kind: MissionKind): void {
  if (launching.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    play(kind)
    return
  }
  missionKind.value = kind
  launching.value = true
  launchTimer = window.setTimeout(() => {
    launchTimer = undefined
    launching.value = false
    play(kind)
  }, 240)
}

function cancelLaunch(): void {
  if (launchTimer !== undefined) window.clearTimeout(launchTimer)
  launchTimer = undefined
  launching.value = false
}

function openMap(): void {
  cancelLaunch()
  screen.value = 'map'
}

function onStarUnlocked(factId: string): void {
  if (!pendingStarRevealIds.value.includes(factId)) {
    pendingStarRevealIds.value = [...pendingStarRevealIds.value, factId]
  }
}

function consumeStarReveals(): void {
  pendingStarRevealIds.value = []
}

function openReport(): void {
  cancelLaunch()
  screen.value = 'report'
}

function navigate(screenName: 'home' | 'map' | 'report'): void {
  cancelLaunch()
  screen.value = screenName
}

onBeforeUnmount(cancelLaunch)

const reviewsToday = computed(() => reviewCountToday(session.state.value, todayDate))
const bestStreakDays = computed(() => session.state.value.rewards.streak.bestDays)
const retention = computed(() => retentionSummary(session.state.value.attempts))
const nextReview = computed(() => upcomingReviewDate(session.state.value, todayDate))
const clockRolledBack = computed(() =>
  rewardsPausedByClockRollback(session.state.value, todayDate),
)

const factIds = allFacts().map((fact) => fact.id)
const earnedFactIds = computed(() =>
  factIds.filter((factId) => session.state.value.facts[factId]?.mastery.hasStar),
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
  <LazyMotion :features="domAnimation">
  <main :class="{ 'motion-paused': documentVisibility !== 'visible' }">
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
      @play="diagnosticResume = true; play('mission')"
    />

    <HomeScreen
      v-else-if="screen === 'home'"
      :xp="session.totalXp.value"
      :streak-days="session.streakDays.value"
      :stars="session.stars.value"
      :earned-fact-ids="earnedFactIds"
      :total-facts="TOTAL_FACTS"
      :reviews-today="reviewsToday"
      :maintenance-mode="session.state.value.mode === 'maintenance'"
      :next-review-date="nextReview"
      :launching="launching"
      @play="launch('mission')"
      @practice="launch('practice')"
      @review="launch('review')"
      @map="openMap"
      @report="openReport"
    />

    <MissionScreen
      v-else-if="screen === 'mission'"
      :kind="missionKind"
      @exit="screen = 'home'"
      @completed="screen = 'home'"
      @map="screen = 'map'"
      @star-unlocked="onStarUnlocked"
    />

    <KnowledgeMapScreen
      v-else-if="screen === 'map'"
      :fact-ids="factIds"
      :earned-fact-ids="earnedFactIds"
      :review-fact-ids="reviewFactIds"
      :newly-unlocked-fact-ids="pendingStarRevealIds"
      @back="screen = 'home'"
      @review="play('review')"
      @reveals-consumed="consumeStarReveals"
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
    <Dock v-if="screen === 'home' || screen === 'map' || screen === 'report'" :current="screen" @navigate="navigate" />
    <div v-if="offlineReady && !offlineNoticeDismissed && !lessonActive" class="banner banner--offline" role="status">
      <span>Готово без интернета</span>
      <SecondaryButton label="Понятно" @click="offlineNoticeDismissed = true" />
    </div>
  </main>
  </LazyMotion>
</template>

<style scoped>
.banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  max-width: 460px;
  margin: 0 auto var(--space-lg);
  padding: var(--space-md);
  border-radius: var(--radius-control);
  background: var(--color-lilac-soft);
  color: var(--color-on-space);
}

.banner--error {
  border: 1px solid var(--color-error);
}
.banner--offline {
  margin-top: var(--space-lg);
  margin-bottom: 0;
  font-size: var(--font-size-label);
}
</style>
