import { crx } from '@crxjs/vite-plugin'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

import manifest from './manifest.config.ts'

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    modulePreload: false,
    rollupOptions: {
      input: {
        offscreen: fileURLToPath(new URL('./src/offscreen/index.html', import.meta.url)),
        popup: fileURLToPath(new URL('./src/popup/index.html', import.meta.url)),
      },
    },
  },
})
