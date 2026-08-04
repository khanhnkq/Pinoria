import { registerQuickDownloadHandler } from './quick-download'
import { registerOffscreenLifecycleHandler } from './offscreen-client'

registerQuickDownloadHandler()
registerOffscreenLifecycleHandler()

chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.set({ installedVersion: chrome.runtime.getManifest().version })
})
