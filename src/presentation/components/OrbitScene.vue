<script setup lang="ts">
import { ref } from 'vue'
import Float from '@/presentation/components/inspira/Float.vue'
import Orbit from '@/presentation/components/inspira/Orbit.vue'
import Ripple from '@/presentation/components/inspira/Ripple.vue'
import Sparkles from '@/presentation/components/inspira/Sparkles.vue'
import GameIcon from '@/presentation/components/GameIcon.vue'
import { useSceneMotion } from '@/presentation/composables/sceneMotion'

withDefaults(defineProps<{ compact?: boolean; launching?: boolean }>(), { compact: false, launching: false })
const root = ref<HTMLElement | null>(null)
const { active } = useSceneMotion(root)
const mascotUrl = `${import.meta.env.BASE_URL}art/orbit-mascot.webp`
const planetUrl = `${import.meta.env.BASE_URL}art/orbit-planet.webp`
</script>
<template>
  <div ref="root" class="orbit-scene" :class="{ 'orbit-scene--compact': compact, 'orbit-scene--launching': launching, 'motion-paused': !active }" aria-hidden="true">
    <Ripple :base-circle-size="compact ? 92 : 150" />
    <Sparkles particle-color="#6552bd" :particle-density="16" />
    <img class="orbit-scene__planet" :src="planetUrl" alt="" width="1024" height="1024" />
    <Orbit :radius="compact ? 76 : 116" :duration="36" :delay="9"><span class="orbit-scene__tile orbit-scene__tile--mint">×</span></Orbit>
    <Orbit :radius="compact ? 88 : 135" :duration="46" :delay="30" reverse><span class="orbit-scene__tile orbit-scene__tile--sun"><GameIcon name="spark" :size="21" /></span></Orbit>
    <Float class="orbit-scene__mascot" :amplitude="compact ? 3 : 7"><img :src="mascotUrl" alt="" width="1254" height="1254" fetchpriority="high" /></Float>
    <span class="orbit-scene__dot orbit-scene__dot--coral" />
    <span class="orbit-scene__dot orbit-scene__dot--mint" />
  </div>
</template>
<style scoped>
.orbit-scene { position: relative; width: 100%; height: 264px; overflow: hidden; isolation: isolate; }
.orbit-scene__planet { position: absolute; width: 210px; height: 210px; object-fit: contain; left: calc(50% - 125px); top: 31px; }
.orbit-scene__mascot { position: absolute; width: 246px; height: 246px; left: calc(50% - 85px); top: 9px; filter: drop-shadow(0 12px 12px rgb(49 30 87 / .12)); }
.orbit-scene__mascot img { display: block; width: 100%; height: auto; }
.orbit-scene__tile { display: grid; place-content: center; width: 40px; height: 40px; border-radius: 14px; font-size: 1.75rem; font-weight: 900; color: var(--color-ink); box-shadow: 0 4px 10px var(--color-shadow); }
.orbit-scene__tile--mint { background: var(--color-mint); }
.orbit-scene__tile--sun { width: 34px; height: 34px; background: var(--color-star); border-radius: 50%; }
.orbit-scene__dot { position: absolute; width: 9px; height: 9px; border-radius: 50%; }
.orbit-scene__dot--coral { left: 15%; top: 24%; background: var(--color-coral); }
.orbit-scene__dot--mint { left: 80%; top: 78%; background: var(--color-mint); }
.orbit-scene--compact { height: 190px; max-width: 300px; margin-inline: auto; }
.orbit-scene--compact .orbit-scene__planet { width: 145px; height: 145px; left: calc(50% - 88px); top: 23px; }
.orbit-scene--compact .orbit-scene__mascot { width: 176px; height: 176px; left: calc(50% - 63px); top: 5px; }
.orbit-scene--launching .orbit-scene__mascot { animation: orbit-launch 240ms var(--ease-playful); }
@keyframes orbit-launch { to { transform: translate(16px, -18px) rotate(8deg); } }
@media (prefers-reduced-motion: reduce) { .orbit-scene--launching .orbit-scene__mascot { animation: none; } }
</style>
