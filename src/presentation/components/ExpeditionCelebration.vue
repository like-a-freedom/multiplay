<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import Confetti from '@/presentation/components/inspira/Confetti.vue'

const props = defineProps<{
  active: boolean
  reducedMotion: boolean
}>()
const confetti = ref<InstanceType<typeof Confetti> | null>(null)
const started = ref(false)
let mounted = true

async function startOnce(): Promise<void> {
  if (!props.active || props.reducedMotion || started.value) return
  started.value = true
  await nextTick()
  if (!mounted || !props.active || props.reducedMotion) return
  confetti.value?.fire()
}

watch(
  () => [props.active, props.reducedMotion] as const,
  ([active, reducedMotion]) => {
    if (active && !reducedMotion) void startOnce()
  },
  { immediate: true, flush: 'post' },
)

onBeforeUnmount(() => {
  mounted = false
})
</script>

<template>
  <div
    v-if="active && !reducedMotion"
    class="expedition-celebration"
    aria-hidden="true"
  >
    <Confetti ref="confetti" manualstart :reduced-motion="reducedMotion" />
  </div>
</template>

<style scoped>
.expedition-celebration {
  position: absolute;
  z-index: 2;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
