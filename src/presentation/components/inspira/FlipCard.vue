<script setup lang="ts">
/**
 * Accessible, explicitly controlled adaptation of Inspira UI's Flip Card.
 * Unlike the source demo, this does not flip on hover: submitting an answer
 * controls the reveal so the result stays available to touch and keyboard users.
 */
withDefaults(defineProps<{ flipped: boolean; axis?: 'x' | 'y' }>(), { axis: 'y' })
</script>

<template>
  <div class="inspira-flip-card" :data-flipped="flipped">
    <div
      class="inspira-flip-card__inner"
      :class="{
        'inspira-flip-card__inner--flip-x': flipped && axis === 'x',
        'inspira-flip-card__inner--flip-y': flipped && axis === 'y',
      }"
    >
      <div
        class="inspira-flip-card__face inspira-flip-card__front"
        :aria-hidden="flipped ? 'true' : undefined"
        :inert="flipped"
      >
        <slot name="front" />
      </div>
      <div
        class="inspira-flip-card__face inspira-flip-card__back"
        :aria-hidden="flipped ? undefined : 'true'"
        :inert="!flipped"
      >
        <slot name="back" />
      </div>
    </div>
  </div>
</template>

<style>
.inspira-flip-card {
  width: 100%;
  perspective: 1000px;
}

.inspira-flip-card__inner {
  display: grid;
  width: 100%;
  transform-style: preserve-3d;
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.inspira-flip-card__inner--flip-x { transform: rotateX(180deg); }
.inspira-flip-card__inner--flip-y { transform: rotateY(180deg); }

.inspira-flip-card__face {
  grid-area: 1 / 1;
  min-width: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  visibility: hidden;
  transition: visibility 0s linear 210ms;
}

.inspira-flip-card[data-flipped='false'] .inspira-flip-card__front,
.inspira-flip-card[data-flipped='true'] .inspira-flip-card__back {
  visibility: visible;
  transition-delay: 0s;
}

.inspira-flip-card__front { transform: translateZ(0.01px); }
.inspira-flip-card__back { transform: rotateY(180deg) translateZ(0.01px); }

.inspira-flip-card__inner--flip-x .inspira-flip-card__back {
  transform: rotateX(180deg) translateZ(0.01px);
}

@media (prefers-reduced-motion: reduce) {
  .inspira-flip-card__inner { transition-duration: 0ms; }
  .inspira-flip-card__face { transition-delay: 0s; }
}
</style>
