import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { configDefaults, defineConfig } from 'vitest/config'

// GitHub Pages uses a repository subpath; root deployments use '/'.
const configuredBase = process.env.APP_BASE_PATH || '/'
const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`

// registerType 'prompt' — the update is offered between missions so a lesson is never reloaded (PRD §4).
export default defineConfig({
  base,
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'Умножайка',
        short_name: 'Умножайка',
        description: 'Таблица умножения: короткие миссии с карточками',
        lang: 'ru',
        id: base,
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#F5F3FF',
        theme_color: '#F5F3FF',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}'],
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
