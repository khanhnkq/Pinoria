import { supportsOffscreenDocuments } from '../core/extension-api'
import {
  MUX_DOWNLOAD_MESSAGE,
  MUX_RELEASE_MESSAGE,
  MUX_READY_MESSAGE,
  isMuxIdleRequest,
  type MuxDownloadRequest,
  type MuxDownloadResponse,
  type MuxReleaseRequest,
  type MuxReadyRequest,
  type MuxReadyResponse,
} from '../core/messaging/mux-download'
import { createMuxEngine, type MuxEngine } from './mux-engine'

const OFFSCREEN_PAGE = 'src/offscreen/index.html'
let creatingOffscreenDocument: Promise<void> | undefined
let recreatingOffscreenDocument: Promise<void> | undefined
const OFFSCREEN_READY_ATTEMPTS = 20
const OFFSCREEN_READY_DELAY_MS = 50
const OFFSCREEN_IDLE_CLOSE_DELAY_MS = 1000
const activeMuxDownloads = new Map<number, string>()
let downloadLifecycleListenerInstalled = false
let lifecycleMessageListenerInstalled = false
let pendingMuxRequests = 0
let idleCloseTimer: ReturnType<typeof setTimeout> | undefined
let localEngine: MuxEngine | undefined

function hasOffscreenSupport(): boolean {
  try {
    return supportsOffscreenDocuments(chrome)
  } catch {
    return false
  }
}

function getLocalEngine(): MuxEngine {
  // Firefox MV3 background is an event page with full DOM/OPFS access,
  // so mux directly here instead of using chrome.offscreen (Chrome-only).
  localEngine ??= createMuxEngine()
  return localEngine
}

async function releaseObjectUrl(objectUrl: string): Promise<void> {
  if (!hasOffscreenSupport()) {
    await getLocalEngine().releaseObjectUrl(objectUrl).catch(() => undefined)
    return
  }
  await chrome.runtime.sendMessage<MuxReleaseRequest>({
    type: MUX_RELEASE_MESSAGE,
    objectUrl,
  }).catch(() => undefined)
}

function cancelScheduledOffscreenClose(): void {
  if (idleCloseTimer === undefined) return
  clearTimeout(idleCloseTimer)
  idleCloseTimer = undefined
}

function scheduleOffscreenClose(): void {
  if (!hasOffscreenSupport()) return
  cancelScheduledOffscreenClose()
  if (pendingMuxRequests > 0 || activeMuxDownloads.size > 0) return

  idleCloseTimer = setTimeout(() => {
    idleCloseTimer = undefined
    if (pendingMuxRequests > 0 || activeMuxDownloads.size > 0) return
    void hasOffscreenDocument().then((hasDocument) => {
      if (hasDocument && pendingMuxRequests === 0 && activeMuxDownloads.size === 0) {
        return chrome.offscreen.closeDocument()
      }
    }).catch(() => undefined)
  }, OFFSCREEN_IDLE_CLOSE_DELAY_MS)
}

function ensureDownloadLifecycleListener(): void {
  if (downloadLifecycleListenerInstalled) return
  downloadLifecycleListenerInstalled = true
  chrome.downloads.onChanged.addListener((delta) => {
    if (delta.state?.current !== 'complete' && delta.state?.current !== 'interrupted') return
    const objectUrl = activeMuxDownloads.get(delta.id)
    if (!objectUrl) return
    activeMuxDownloads.delete(delta.id)
    void releaseObjectUrl(objectUrl).finally(scheduleOffscreenClose)
  })
}

export function registerOffscreenLifecycleHandler(): void {
  ensureDownloadLifecycleListener()
  if (lifecycleMessageListenerInstalled) return
  lifecycleMessageListenerInstalled = true
  chrome.runtime.onMessage.addListener((message: unknown, sender) => {
    if (!isMuxIdleRequest(message) || sender.id !== chrome.runtime.id) return false
    scheduleOffscreenClose()
    return false
  })
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs))
}

async function waitForOffscreenReady(): Promise<void> {
  let lastError: unknown

  for (let attempt = 0; attempt < OFFSCREEN_READY_ATTEMPTS; attempt += 1) {
    try {
      const response = await chrome.runtime.sendMessage<MuxReadyRequest, MuxReadyResponse>({
        type: MUX_READY_MESSAGE,
      })
      if (response?.ready) return
    } catch (error) {
      lastError = error
    }
    await delay(OFFSCREEN_READY_DELAY_MS)
  }

  const reason = lastError instanceof Error ? `: ${lastError.message}` : ''
  throw new Error(`Bộ xử lý video Pinoria chưa sẵn sàng${reason}`)
}

async function hasOffscreenDocument(): Promise<boolean> {
  if (typeof chrome.offscreen?.hasDocument === 'function') {
    return chrome.offscreen.hasDocument()
  }

  if (typeof chrome.runtime.getContexts === 'function') {
    const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_PAGE)
    const contexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
      documentUrls: [offscreenUrl],
    })
    return contexts.length > 0
  }

  return false
}

async function createOffscreenDocument(): Promise<void> {
  creatingOffscreenDocument ??= chrome.offscreen.createDocument({
    url: OFFSCREEN_PAGE,
    reasons: [chrome.offscreen.Reason.BLOBS],
    justification: 'Mux Pinterest video and audio tracks into a local MP4 file.',
  }).finally(() => {
    creatingOffscreenDocument = undefined
  })

  await creatingOffscreenDocument
}

async function recreateOffscreenDocument(): Promise<void> {
  recreatingOffscreenDocument ??= (async () => {
    if (await hasOffscreenDocument()) {
      await chrome.offscreen.closeDocument().catch(() => undefined)
    }
    await createOffscreenDocument()
  })().finally(() => {
    recreatingOffscreenDocument = undefined
  })

  await recreatingOffscreenDocument
}

async function ensureOffscreenDocument(): Promise<void> {
  if (!hasOffscreenSupport()) return
  if (!(await hasOffscreenDocument())) {
    await createOffscreenDocument()
  }

  try {
    await waitForOffscreenReady()
  } catch {
    // Chrome can retain an offscreen document from the previous unpacked build.
    // Recreate it once so the current bundle installs the matching listener.
    await recreateOffscreenDocument()
    await waitForOffscreenReady()
  }
}

async function requestMuxedDownloadViaOffscreen(
  request: Omit<MuxDownloadRequest, 'type'>,
): Promise<number> {
  const response = await chrome.runtime.sendMessage<MuxDownloadRequest, MuxDownloadResponse>({
    type: MUX_DOWNLOAD_MESSAGE,
    ...request,
  })
  if (!response?.ok) {
    throw new Error(response?.error ?? 'Không thể ghép video và audio Pinterest')
  }

  ensureDownloadLifecycleListener()
  try {
    const downloadId = await chrome.downloads.download({
      url: response.objectUrl,
      filename: request.filename,
      conflictAction: 'uniquify',
      saveAs: false,
    })
    activeMuxDownloads.set(downloadId, response.objectUrl)
    return downloadId
  } catch (error) {
    await releaseObjectUrl(response.objectUrl)
    throw error
  }
}

async function requestMuxedDownloadLocal(
  request: Omit<MuxDownloadRequest, 'type'>,
): Promise<number> {
  const objectUrl = await getLocalEngine().enqueueMux({
    type: MUX_DOWNLOAD_MESSAGE,
    ...request,
  })

  ensureDownloadLifecycleListener()
  try {
    const downloadId = await chrome.downloads.download({
      url: objectUrl,
      filename: request.filename,
      conflictAction: 'uniquify',
      saveAs: false,
    })
    activeMuxDownloads.set(downloadId, objectUrl)
    return downloadId
  } catch (error) {
    await releaseObjectUrl(objectUrl)
    throw error
  }
}

export async function requestMuxedDownload(
  request: Omit<MuxDownloadRequest, 'type'>,
): Promise<number> {
  pendingMuxRequests += 1
  cancelScheduledOffscreenClose()

  try {
    if (!hasOffscreenSupport()) {
      return await requestMuxedDownloadLocal(request)
    }
    await ensureOffscreenDocument()
    return await requestMuxedDownloadViaOffscreen(request)
  } finally {
    pendingMuxRequests -= 1
    scheduleOffscreenClose()
  }
}
