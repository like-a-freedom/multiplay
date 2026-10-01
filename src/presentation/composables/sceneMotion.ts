import { computed, type Ref } from 'vue'
import { useDocumentVisibility, useElementVisibility, usePreferredReducedMotion } from '@vueuse/core'

/** Ambient motion runs only while its scene is visible and the child permits motion. */
export function useSceneMotion(element: Ref<HTMLElement | null>) {
  const reduced = usePreferredReducedMotion()
  const visibility = useDocumentVisibility()
  const inViewport = useElementVisibility(element)
  return { reduced, active: computed(() => !reduced.value && visibility.value === 'visible' && inViewport.value) }
}
