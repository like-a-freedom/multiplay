<script setup lang="ts">
import { computed } from 'vue'

import NumberTicker from '@/presentation/components/inspira/NumberTicker.vue'

const props = defineProps<{
  awardedXp: number
  bonusXp: number
  totalXp: number
  level: number
  xpPausedByClock: boolean
}>()

const awardTotal = computed(() => props.awardedXp + props.bonusXp)
const accessibleLabel = computed(() => {
  const breakdown = props.bonusXp > 0
    ? `: ${props.awardedXp} XP за миссию и ${props.bonusXp} XP за серию дней`
    : ''
  const reason = awardTotal.value > 0
    ? ''
    : props.xpPausedByClock
      ? ' Награды приостановлены из-за даты устройства.'
      : ' Дневные 30 XP уже получены. Играть дальше можно.'

  return `Опыт за практику: +${awardTotal.value} XP${breakdown}. Всего ${props.totalXp} XP. Уровень ${props.level}.${reason}`
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
      <span v-else-if="awardTotal === 0" class="xp-award__reason">
        {{ xpPausedByClock ? 'Награды приостановлены из-за даты устройства.' : 'Дневные 30 XP уже получены. Играть дальше можно.' }}
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
  color: var(--color-ink-muted);
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
