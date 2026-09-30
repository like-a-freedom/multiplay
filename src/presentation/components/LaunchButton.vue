<script setup lang="ts">
import RippleButton from '@/presentation/components/inspira/RippleButton.vue'

defineProps<{ label: string; disabled: boolean; launching: boolean }>()
defineEmits<{ click: [] }>()

const classes = 'min-h-[56px] w-full rounded-[var(--radius-control)] border border-[var(--color-on-space)] bg-expedition-action px-6 py-4 text-[length:var(--font-size-button)] font-bold leading-[var(--line-height-button)] text-white shadow-sm transition-transform duration-150 hover:bg-[var(--color-action-pressed)] active:scale-[.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-on-space)] disabled:cursor-not-allowed motion-reduce:transition-none'
</script>

<template>
  <RippleButton
    :class="classes"
    :disabled="disabled"
    :launching="launching"
    @click="$emit('click')"
  >
    {{ label }}
  </RippleButton>
</template>
