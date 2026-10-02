// @vitest-environment happy-dom
import { nextTick } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'

import { PROGRESS_STORAGE_KEY } from '@/infrastructure/storage/localStorageProgressStore'
import { parseSnapshot } from '@/infrastructure/storage/snapshot'

const serviceWorker = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
}))

vi.mock('virtual:pwa-register/vue', async () => {
  const { ref } = await import('vue')
  return {
    useRegisterSW: () => ({
      offlineReady: ref(serviceWorker.offlineReady),
      needRefresh: ref(serviceWorker.needRefresh),
      updateServiceWorker: vi.fn(),
    }),
  }
})

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = '<div id="app"></div>'
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn((media: string) => ({
      matches: media.includes('prefers-reduced-motion'),
      media,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

it('boots the app with local progress storage and starts the first diagnostic', async () => {
  await import('@/main')
  await nextTick()

  expect(document.querySelector('.diagnostic__welcome-copy h1')?.textContent).toBe('Привет! Я Орби.')
  document.querySelector<HTMLButtonElement>('.diagnostic__invite .button-secondary')?.click()
  await nextTick()
  expect(document.querySelector('.mission-progress__text')?.textContent).toBe('Карточка 1 из 2')
  const rawSnapshot = localStorage.getItem(PROGRESS_STORAGE_KEY)
  expect(rawSnapshot).not.toBeNull()
  const loaded = parseSnapshot(rawSnapshot!)
  expect(loaded.kind).toBe('saved')
  if (loaded.kind === 'saved') {
    expect(loaded.state.diagnostic?.skipped).toBe(true)
    expect(loaded.state.currentMission?.cardFactIds).toHaveLength(2)
  }
})
