<script setup lang="ts">
import { ref } from 'vue'

import SecondaryButton from '@/presentation/components/SecondaryButton.vue'
import GameIcon from '@/presentation/components/GameIcon.vue'

/**
 * Adult report (PRD §4–5): XP, stars and facts due listed separately; the
 * retention metric with numerator and denominator; the no-backup note; a
 * confirmed reset.
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
    <p class="report__intro">Опыт показывает практику. Звёзды — то, что удалось запомнить надолго.</p>

    <dl class="report__tiles">
      <div class="report__tile">
        <dt class="report__tile-label">XP</dt>
        <dd class="report__tile-value">{{ xp }}</dd>
        <dd class="report__tile-note">Уровень {{ level }}</dd>
      </div>
      <div class="report__tile">
        <dt class="report__tile-label">Открытые звёзды</dt>
        <dd class="report__tile-value">{{ stars }} из {{ totalFacts }}</dd>
      </div>
      <div class="report__tile">
        <dt class="report__tile-label">Факты для повторения</dt>
        <dd class="report__tile-value">{{ reviewsToday }}</dd>
      </div>
      <div class="report__tile">
        <dt class="report__tile-label">Лучшая серия дней</dt>
        <dd class="report__tile-value">{{ bestStreakDays }}</dd>
      </div>
      <div class="report__tile report__tile--wide">
        <dt class="report__tile-label">Удержание</dt>
        <dd class="report__tile-value">
          <template v-if="retentionChecked > 0">{{ retentionCorrect }} из {{ retentionChecked }}</template>
          <template v-else>Пока нет данных</template>
        </dd>
        <dd class="report__tile-note">Первые верные ответы после перерыва ≥7 дней</dd>
      </div>
    </dl>

    <p class="report__note">
      <GameIcon name="shield" :size="24" />
      <span>
      Прогресс хранится только на этом устройстве. Резервной копии нет: очистка данных
      или удаление приложения может привести к потере прогресса.
      </span>
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
.report__tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  margin: 0;
}

.report__tile {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 0;
  padding: var(--space-lg);
  border-radius: var(--radius-card);
  background: var(--color-space-raised);
  border: 1px solid var(--color-divider);
}
.report__intro { color: var(--color-ink-muted); font-size: var(--font-size-label); }
.report__tile:first-child { background: var(--color-lilac-soft); border-color: transparent; }
.report__tile:nth-child(2) { background: var(--color-review-surface); border-color: transparent; }
.report__tile:nth-child(3) { background: var(--color-mint-soft); border-color: transparent; }

.report__tile--wide {
  grid-column: 1 / -1;
}

.report__tile-label {
  /* Two-line reserve: values start at the same baseline across every tile. */
  min-height: calc(2 * var(--font-size-label) * var(--line-height-label));
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}

.report__tile-value {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: 900;
  line-height: var(--line-height-title);
  color: var(--color-on-space);
  font-variant-numeric: tabular-nums;
}

.report__tile-note {
  margin: 0;
  font-size: var(--font-size-body);
  font-weight: 400;
  line-height: var(--line-height-body);
  color: var(--color-on-space);
}

.report__note {
  display: flex;
  gap: var(--space-md);
  margin: 0;
  /* On the dark background body text must be `on-space` (DESIGN.md, Colors). */
  color: var(--color-on-space);
  font-size: var(--font-size-label);
}
.report__note svg { flex-shrink: 0; color: var(--color-focus); }
</style>
