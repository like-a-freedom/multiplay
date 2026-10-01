<script setup lang="ts">
import ShimmerButton from '@/presentation/components/inspira/ShimmerButton.vue'
import GameIcon from '@/presentation/components/GameIcon.vue'

defineProps<{ label: string; disabled: boolean; launching: boolean }>()
defineEmits<{ click: [] }>()

</script>

<template>
  <ShimmerButton
    :disabled="disabled"
    :launching="launching"
    @click="$emit('click')"
  >
    <GameIcon name="rocket" /> <span class="launch-button__label">{{ label }}</span> <GameIcon name="arrow" :size="20" />
  </ShimmerButton>
</template>
