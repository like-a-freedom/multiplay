<script setup lang="ts">
/** Inspira UI Float (MIT): native sine-based translation/rotation, with visibility and reduced-motion support. */
import { m, useMotionValue } from 'motion-v'
import { useRafFn } from '@vueuse/core'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useSceneMotion } from '@/presentation/composables/sceneMotion'

const props = withDefaults(defineProps<{ amplitude?: number; speed?: number }>(), { amplitude: 7, speed: .5 })
const root = ref<HTMLElement | null>(null)
const { active } = useSceneMotion(root)
const y = useMotionValue(0)
const rotate = useMotionValue(0)
const { pause, resume } = useRafFn(({ timestamp }) => {
  const time = timestamp * .001 * props.speed
  y.set(Math.sin(time * .6) * props.amplitude)
  rotate.set(Math.sin(time * .3) * 3)
}, { immediate: false, fpsLimit: 30 })
watch(active, (run) => { if (run) resume(); else { pause(); y.set(0); rotate.set(0) } }, { immediate: true })
onBeforeUnmount(pause)
</script>
<template><div ref="root" class="inspira-float"><m.div :style="{ y, rotate }"><slot /></m.div></div></template>
