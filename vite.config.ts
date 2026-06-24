import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Static SPA served from GitHub Pages at /PermitPrep/.
export default defineConfig({
  base: '/PermitPrep/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon-180.png'],
      manifest: {
        name: 'PermitPrep: Learner Permit Practice',
        short_name: 'PermitPrep',
        description:
          "Free learner's permit practice exams, flashcards, and the driver's manual for your state. Works offline.",
        theme_color: '#16202e',
        background_color: '#f4f6fa',
        display: 'standalone',
        orientation: 'portrait',
        // Relative so they resolve under the GitHub Pages /PermitPrep/ base.
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the shell, the shared (federal MUTCD) sign bank + images, and
        // the states index so the app installs lean. Per-state content lives in
        // data/{state}/ and is runtime-cached on first visit (below), so adding
        // states doesn't bloat every install — only the state you actually use
        // is stored for offline.
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        // Skip per-state content (data/{state}/*) — it's runtime-cached below.
        // The shared signs bank + states index live at data/ root and stay
        // precached. (Pattern needs the extra segment so it doesn't also match
        // the root-level data/*.json files.)
        globIgnores: ['data/*/*'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Per-state manual / questions / config: cache the active state for
            // offline use, revalidate in the background when online.
            urlPattern: ({ url }) => /\/data\/[^/]+\/.*\.json$/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'permitprep-state-data',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts'],
  },
})
