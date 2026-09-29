import { defineConfig, devices } from '@playwright/test'

/**
 * e2e-прогон на движке Safari (WebKit) в эмуляции iPhone 12 Pro Max.
 * Полный прогон на реальном устройстве — по tests/device-checklist.md.
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
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
})
