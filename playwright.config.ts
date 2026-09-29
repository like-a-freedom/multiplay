import { defineConfig, devices } from '@playwright/test'

/**
 * e2e runs on the Safari engine (WebKit) emulating an iPhone 12 Pro Max.
 * The full run on a real device follows tests/device-checklist.md.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:4173',
  },
  projects: [
    {
      name: 'iphone-safari',
      use: { ...devices['iPhone 12 Pro Max'] },
    },
  ],
  webServer: {
    command: 'bun run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
})
