<script setup lang="ts">
import { ref } from 'vue'

import SecondaryButton from '@/presentation/components/SecondaryButton.vue'

/**
 * Отчёт для взрослого (PRD §4–5): раздельно XP, звёзды и факты для повторения;
 * показатель удержания с числителем и знаменателем; надпись об отсутствии
 * резервной копии; сброс — с подтверждением.
 */
defineProps<{
  xp: number
  level: number
  stars: number
  totalFacts: number
  bestStreakDays: number
  reviewsToday: number
  retentionCorrect: number
  retentionChecked: number
  hasDiagnosticSet: boolean
}>()
const emit = defineEmits<{ back: []; reset: []; recheck: [] }>()

const confirmReset = ref(false)

function reset(): void {
  if (!confirmReset.value) {
    confirmReset.value = true
    return
  }
  emit('reset')
}
</script>

<template>
  <section class="screen report">
    <h1 class="screen__title">Отчёт для взрослого</h1>
    <ul class="report__list">
      <li>XP: {{ xp }} · Уровень {{ level }}</li>
      <li>Открытые звёзды: {{ stars }} из {{ totalFacts }}</li>
      <li>Факты для повторения: {{ reviewsToday }}</li>
      <li>Лучшая серия дней: {{ bestStreakDays }}</li>
    </ul>

    <p class="report__metric">
      Удержание (первые верные ответы после перерыва ≥7 дней):
      <strong v-if="retentionChecked > 0">{{ retentionCorrect }} из {{ retentionChecked }}</strong>
      <strong v-else>Пока нет данных</strong>
    </p>

    <p class="report__note">
      Прогресс хранится только на этом устройстве. Резервной копии нет: очистка данных
      или удаление приложения может привести к потере прогресса.
    </p>

    <div class="screen__actions">
      <SecondaryButton
        v-if="hasDiagnosticSet"
        label="Повторить проверку набора"
        @click="emit('recheck')"
      />
      <SecondaryButton label="Назад" @click="emit('back')" />
      <p v-if="confirmReset" role="alert">Удалить все ответы, звёзды и XP? Это действие нельзя отменить.</p>
      <SecondaryButton v-if="confirmReset" label="Отмена" @click="confirmReset = false" />
      <SecondaryButton
        :label="confirmReset ? 'Подтвердить сброс' : 'Сбросить данные'"
        @click="reset"
      />
    </div>
  </section>
</template>

<style scoped>
.report__list {
  margin: 0;
  padding-left: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.report__metric,
.report__note {
  margin: 0;
  color: var(--color-on-space);
  font-size: var(--font-size-label);
}

.report__note {
  color: var(--color-on-space);
}
</style>
