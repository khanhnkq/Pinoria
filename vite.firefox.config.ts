import { crx } from '@crxjs/vite-plugin'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// PINORIA_TARGET=firefox switches manifest.config.ts to the Firefox variant:
// background.scripts (event page, DOM-capable) instead of service_worker,
// no `offscreen` permission, plus gecko strict_min_version 128 for MAIN world.
process.env.PINORIA_TARGET ??= 'firefox'

import manifest from './manifest.config.ts'

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    outDir: 'dist-firefox',
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: fileURLToPath(new URL('./src/popup/index.html', import.meta.url)),
      },
    },
  },
})
