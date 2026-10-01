<script setup lang="ts">
/**
 * The answer field (DESIGN.md): system numeric keyboard via inputmode, a
 * visible label, the error wired via aria-describedby. An invalid value is
 * never cleared automatically.
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
    <div class="answer-field__control">
      <input
        id="answer-input"
        class="answer-field__input"
        :value="modelValue"
        type="text"
        inputmode="numeric"
        placeholder="Введи целое число от 0 до 100"
        autocomplete="off"
        :disabled="disabled"
        :aria-invalid="errorText ? true : undefined"
        enterkeyhint="done"
        :aria-describedby="errorText ? 'answer-error' : 'answer-help'"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keyup.enter.stop.prevent="$emit('submit')"
      />
      <span v-if="modelValue === ''" class="answer-field__placeholder" aria-hidden="true">Введи целое число от 0 до 100</span>
    </div>
    <p v-if="errorText" id="answer-error" class="answer-field__error" aria-live="polite">
      {{ errorText }}
    </p>
    <span v-else id="answer-help" class="visually-hidden">Введи целое число от 0 до 100</span>
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
  width: 100%;
  caret-color: var(--color-action);
}

.answer-field__control { display: grid; }
.answer-field__control > * { grid-area: 1 / 1; }
.answer-field__placeholder {
  align-self: center;
  padding: 12px 16px;
  border: 1px solid transparent;
  color: var(--color-ink-muted);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  overflow-wrap: normal;
  pointer-events: none;
}

.answer-field__input:focus-visible {
  outline: 2px solid var(--color-focus-on-space);
  outline-offset: 2px;
}

.answer-field__input::placeholder {
  color: transparent;
  font-size: var(--font-size-body);
  font-weight: 400;
}

.answer-field__error {
  margin: 0;
  border-radius: var(--radius-control);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-label);
}

.answer-field__error {
  color: var(--color-error);
  background: var(--color-paper);
}
.answer-field__input[aria-invalid="true"] {
  border: 2px solid var(--color-error);
}
.answer-field__input:disabled {
  opacity: 1;
  -webkit-text-fill-color: var(--color-ink);
}
</style>
