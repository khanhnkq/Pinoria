import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Pinoria/',
  build: {
    outDir: 'dist-pages',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        vi: resolve(import.meta.dirname, 'vi/index.html'),
      },
    },
  },
})
