/**
 * Cross-browser WebExtension API helpers.
 *
 * Firefox supports the `chrome` namespace for the APIs Pinoria uses
 * (runtime, storage, downloads), but it does not implement
 * `chrome.offscreen` — MV3 background in Firefox is an event page with full
 * DOM access, so muxing can run directly in the background context.
 * Feature-detect offscreen support instead of UA sniffing.
 */

export function getExtensionApi(): typeof chrome {
  const candidate = (globalThis as unknown as {
    chrome?: typeof chrome
    browser?: typeof chrome
  }).chrome ?? (globalThis as unknown as { browser?: typeof chrome }).browser
  if (!candidate) throw new Error('WebExtension API không khả dụng')
  return candidate
}

export function supportsOffscreenDocuments(api: typeof chrome = getExtensionApi()): boolean {
  try {
    return typeof (api as unknown as {
      offscreen?: { createDocument?: unknown }
    }).offscreen?.createDocument === 'function'
  } catch {
    return false
  }
}
