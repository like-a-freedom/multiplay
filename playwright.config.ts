import { defineConfig, devices } from '@playwright/test'

const configuredBase = process.env.APP_BASE_PATH || '/'
const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`
const previewUrl = `http://localhost:4173${base}`

/**
 * e2e runs on the Safari engine (WebKit) emulating an iPhone 12 Pro Max.
 * The full run on a real device follows tests/device-checklist.md.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: previewUrl,
  },
  projects: [
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 12 Pro Max'] },
      testIgnore: '**/deployment.spec.ts',
    },
    {
      // Playwright's service-worker/offline support is Chromium-only.
      name: 'pwa-chromium',
      testMatch: '**/deployment.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 428, height: 926 } },
    },
  ],
  webServer: {
    command: 'bun run preview -- --port 4173 --strictPort',
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
  },
})
