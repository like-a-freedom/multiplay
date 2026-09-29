<script setup lang="ts">
/**
 * Поле ответа (DESIGN.md): системная цифровая клавиатура через inputmode,
 * видимый label, текст ошибки через aria-describedby. Ошибочное значение не удаляется.
 */
defineProps<{
  modelValue: string
  label?: string
  errorText?: string | null
  disabled?: boolean
}>()
defineEmits<{ 'update:modelValue': [value: string]; submit: [] }>()
</script>

<template>
  <div class="answer-field">
    <label class="answer-field__label" for="answer-input">{{ label ?? 'Твой ответ' }}</label>
    <input
      id="answer-input"
      class="answer-field__input"
      :value="modelValue"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :disabled="disabled"
      :aria-describedby="errorText ? 'answer-error' : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keyup.enter.stop.prevent="$emit('submit')"
    />
    <p v-if="errorText" id="answer-error" class="answer-field__error" aria-live="polite">
      {{ errorText }}
    </p>
  </div>
</template>

<style scoped>
.answer-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.answer-field__label {
  font-size: var(--font-size-label);
  font-weight: 600;
  line-height: var(--line-height-label);
  color: var(--color-on-space);
}

.answer-field__input {
  min-height: 64px;
  padding: 12px 16px;
  border: 1px solid var(--color-control-outline);
  border-radius: var(--radius-control);
  background: var(--color-white);
  color: var(--color-ink);
  font-family: var(--font-family);
  font-size: var(--font-size-title);
  font-weight: 700;
  line-height: var(--line-height-title);
  font-variant-numeric: tabular-nums;
}

.answer-field__input:focus-visible {
  outline: 2px solid var(--color-focus-on-space);
  outline-offset: 2px;
}

.answer-field__error {
  margin: 0;
  color: var(--color-error);
  font-size: var(--font-size-label);
}
</style>
