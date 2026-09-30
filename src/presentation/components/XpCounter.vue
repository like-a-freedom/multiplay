<script setup lang="ts">
/** XP as a plain text counter; XP never measures knowledge of the table (CONTEXT.md). */
defineProps<{ xp: number }>()
</script>

<template>
  <p class="xp-counter">Всего XP: {{ xp }}</p>
</template>

<style scoped>
.xp-counter {
  margin: 0;
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}
</style>
