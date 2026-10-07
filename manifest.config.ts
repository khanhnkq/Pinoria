import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Pinoria',
  short_name: 'Pinoria',
  description: 'Download Pinterest media locally with native-feeling controls.',
  version: '0.3.0',
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  action: {
    default_icon: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
    },
    default_title: 'Pinoria Settings',
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://*.pinterest.com/*', 'https://pinterest.com/*'],
      js: ['src/main-world/hls-bridge.ts'],
      run_at: 'document_start',
      world: 'MAIN',
    },
    {
      matches: ['https://*.pinterest.com/*', 'https://pinterest.com/*'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['activeTab', 'downloads', 'offscreen', 'storage'],
  host_permissions: [
    'https://*.pinterest.com/*',
    'https://pinterest.com/*',
    'https://*.pinimg.com/*',
  ],
})
