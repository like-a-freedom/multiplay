<script setup lang="ts">
import { nextTick, ref } from 'vue'

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

const resetDialog = ref<HTMLDialogElement | null>(null)
const dangerZone = ref<HTMLElement | null>(null)
let resetTrigger: HTMLElement | null = null

function openReset(): void {
  resetTrigger = dangerZone.value?.querySelector('button') ?? null
  resetDialog.value?.showModal()
  resetDialog.value?.querySelector<HTMLButtonElement>('[autofocus]')?.focus({ preventScroll: true })
  if (resetDialog.value) resetDialog.value.scrollTop = 0
}

function closeReset(): void {
  resetDialog.value?.close()
}

function restoreFocus(): void {
  void nextTick(() => resetTrigger?.focus())
}

function keepDialogFocus(event: KeyboardEvent): void {
  if (event.key !== 'Tab') return
  const buttons = resetDialog.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
  if (!buttons?.length) return
  const first = buttons[0]
  const last = buttons[buttons.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function dismissBackdrop(event: MouseEvent): void {
  const dialog = resetDialog.value
  if (!dialog || event.target !== dialog) return
  const bounds = dialog.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeReset()
}

function confirmReset(): void {
  closeReset()
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
        <dd class="report__tile-note"><span class="report__level">Уровень {{ level }}</span></dd>
      </div>
      <div class="report__tile">
        <dt class="report__tile-label">Открытые звёзды</dt>
        <dd class="report__tile-value">{{ stars }} <span class="report__denominator">из {{ totalFacts }}</span></dd>
        <dd class="report__tile-note">Знания надолго</dd>
      </div>
      <div class="report__tile">
        <dt class="report__tile-label">Факты для повторения</dt>
        <dd class="report__tile-value">{{ reviewsToday }}</dd>
        <dd class="report__tile-note">На сегодня</dd>
      </div>
      <div class="report__tile">
        <dt class="report__tile-label">Лучшая серия дней</dt>
        <dd class="report__tile-value">{{ bestStreakDays }}</dd>
        <dd class="report__tile-note">Личный рекорд</dd>
      </div>
      <div class="report__tile report__tile--wide">
        <dt class="report__tile-label">Удержание</dt>
        <dd :class="['report__tile-value', { 'report__tile-value--empty': retentionChecked === 0 }]">
          <template v-if="retentionChecked > 0">{{ retentionCorrect }} <span class="report__denominator">из {{ retentionChecked }}</span></template>
          <template v-else>Пока нет данных</template>
        </dd>
        <dd class="report__tile-note">Первые верные ответы после перерыва от 7 дней</dd>
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
    </div>
    <div ref="dangerZone" class="report__danger-zone"><SecondaryButton label="Сбросить данные" variant="danger" @click="openReset" /></div>
    <dialog ref="resetDialog" class="report__reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-copy" @click="dismissBackdrop" @keydown="keepDialogFocus" @close="restoreFocus">
      <h2 id="reset-title">Удалить весь прогресс?</h2>
      <p id="reset-copy">Все ответы, звёзды и XP удалятся навсегда.</p>
      <div class="screen__actions">
        <SecondaryButton label="Отмена" autofocus @click="closeReset" />
        <SecondaryButton label="Удалить" aria-label="Удалить весь прогресс" variant="danger-solid" @click="confirmReset" />
      </div>
    </dialog>
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
  display: grid;
  grid-template-rows: auto auto 1fr;
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
  min-height: calc(2 * var(--font-size-body) * var(--line-height-button));
  font-size: var(--font-size-body);
  font-weight: 900;
  line-height: var(--line-height-button);
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
  align-self: end;
  font-size: var(--font-size-label);
  font-weight: 700;
  line-height: var(--line-height-body);
  color: var(--color-ink-muted);
}
.report__tile:first-child .report__tile-note { color: var(--color-focus); }
.report__tile:nth-child(2) .report__tile-note { color: var(--color-review-ink); }
.report__tile:nth-child(3) .report__tile-note { color: var(--color-success); }
.report__denominator { display: inline-block; font-size: var(--font-size-label); font-weight: 700; line-height: var(--line-height-label); }
.report__level { display: inline-block; padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-badge); background: var(--color-paper); font-weight: 900; }
.report__tile-value--empty { font-size: var(--font-size-body); font-weight: 700; }
.report__tile--wide .report__tile-label { min-height: 0; }
.report__danger-zone { display: grid; padding-top: var(--space-lg); border-top: 1px solid var(--color-divider); }
.report__reset-dialog { width: min(420px, calc(100% - 32px)); max-height: calc(100dvh - 32px); margin: auto; padding: var(--space-xl); overflow: auto; border: 1px solid var(--color-divider); border-radius: var(--radius-card); background: var(--color-paper); color: var(--color-ink); box-shadow: 0 20px 60px rgb(32 39 65 / .24); }
.report__reset-dialog::backdrop { background: rgb(32 39 65 / .48); }
.report__reset-dialog h2 { margin: 0 0 var(--space-md); font-size: var(--font-size-heading-compact); font-weight: 900; line-height: var(--line-height-button); }
.report__reset-dialog p { margin-bottom: var(--space-xl); font-size: var(--font-size-body); hyphens: auto; }
@media (max-width: 360px) { .report__tiles { grid-template-columns: 1fr; } .report__tile-label { min-height: 0; } .report__reset-dialog { padding: var(--space-lg); } }

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
