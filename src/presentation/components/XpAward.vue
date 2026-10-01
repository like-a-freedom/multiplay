<script setup lang="ts">
import { computed } from 'vue'
import type { XpBlockedReason } from '@/domain/progress/rewards'

import NumberTicker from '@/presentation/components/inspira/NumberTicker.vue'

const props = defineProps<{
  awardedXp: number
  bonusXp: number
  totalXp: number
  level: number
  xpBlockedReason: XpBlockedReason | null
}>()

const awardTotal = computed(() => props.awardedXp + props.bonusXp)
const reason = computed(() => {
  if (awardTotal.value > 0) return props.awardedXp > 0 ? 'XP за миссию — за попытку ответить самому.' : ''
  if (props.xpBlockedReason === 'no-answer') return 'Ты посмотрел подсказки. Попробуй ввести ответ сам — даже ошибка считается попыткой.'
  if (props.xpBlockedReason === 'clock-rollback') return 'Награды приостановлены из-за даты устройства.'
  if (props.xpBlockedReason === 'already-completed') return 'Опыт за эту миссию уже учтён.'
  return 'Дневные 30 XP уже получены. Играть дальше можно.'
})
const accessibleLabel = computed(() => {
  const breakdown = props.bonusXp > 0
    ? `: ${props.awardedXp} XP за миссию и ${props.bonusXp} XP за серию дней`
    : ''
  return `Опыт за практику: +${awardTotal.value} XP${breakdown}. Всего ${props.totalXp} XP. Уровень ${props.level}. ${reason.value}`
})
</script>

<template>
  <div class="xp-award" role="status" :aria-label="accessibleLabel">
    <div class="xp-award__content" aria-hidden="true">
      <span class="xp-award__label">Опыт за практику</span>
      <NumberTicker
        v-if="awardTotal > 0"
        class="xp-award__visual"
        :value="awardTotal"
        :duration="650"
        :decimal-places="0"
      />
      <strong v-else class="xp-award__value">+0 XP</strong>
      <span v-if="bonusXp > 0" class="xp-award__breakdown">
        {{ awardedXp }} XP за миссию <span aria-hidden="true">+</span> {{ bonusXp }} XP за серию дней
      </span>
      <span v-if="reason" class="xp-award__reason">
        {{ reason }}
      </span>
      <span class="xp-award__total">Всего {{ totalXp }} XP · уровень {{ level }}</span>
    </div>
  </div>
</template>

<style scoped>
.xp-award {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-focus);
  padding: var(--space-lg);
  border-radius: var(--radius-control);
  background: var(--color-lilac-soft);
  border-bottom: 0;
}

.xp-award__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
}

.xp-award__label,
.xp-award__breakdown,
.xp-award__reason {
  font-size: var(--font-size-label);
}

.xp-award__value {
  color: var(--color-ink);
  font-size: var(--font-size-title);
  line-height: var(--line-height-title);
  font-variant-numeric: tabular-nums;
}

.xp-award__breakdown { color: var(--color-ink); }

.xp-award__total {
  padding-top: var(--space-sm);
  font-size: var(--font-size-label);
}
</style>
