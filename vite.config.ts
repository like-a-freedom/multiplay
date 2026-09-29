import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { configDefaults, defineConfig } from 'vitest/config'

// registerType 'prompt' — the update is offered between missions so a lesson is never reloaded (PRD §4).
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Математическая экспедиция',
        short_name: 'Экспедиция',
        description: 'Таблица умножения: короткие миссии с карточками',
        lang: 'ru',
        start_url: '/',
        display: 'standalone',
        background_color: '#0B1020',
        theme_color: '#0B1020',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // e2e specs run under Playwright, not Vitest.
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
})
