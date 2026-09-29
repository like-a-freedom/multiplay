<script setup lang="ts">
/** The streak as a golden badge with the day count and a text label (DESIGN.md). */
defineProps<{ days: number }>()
</script>

<template>
  <p class="streak-badge">Серия: {{ days }} {{ days === 1 ? 'день' : 'дн.' }}</p>
</template>

<style scoped>
.streak-badge {
  display: inline-block;
  margin: 0;
  padding: 8px 12px;
  border-radius: var(--radius-badge);
  background: var(--color-streak);
  color: var(--color-ink);
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
}
</style>
