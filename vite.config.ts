import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Streaks',
        short_name: 'Streaks',
        description: 'Daily habit tracker with a native look on every platform',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#0057ff',
        background_color: '#ffffff',
        lang: 'en',
        categories: ['productivity', 'lifestyle'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 5_000_000,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Workspace package — aliased to its source so Vite transforms its JSX
      // directly (it is a linked workspace, not a pre-built dependency).
      // Subpaths must come before the bare name: the first match wins.
      '@native-pwa-experiment/ui-kit/design-systems': fileURLToPath(
        new URL('./packages/ui-kit/src/designSystems.ts', import.meta.url),
      ),
      '@native-pwa-experiment/ui-kit': fileURLToPath(
        new URL('./packages/ui-kit/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}', 'packages/**/__tests__/**/*.test.{ts,tsx}'],
  },
});
