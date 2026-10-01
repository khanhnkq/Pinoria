import { createMuxEngine } from '../background/mux-engine'
import {
  MUX_IDLE_MESSAGE,
  isMuxDownloadRequest,
  isMuxReadyRequest,
  isMuxReleaseRequest,
  type MuxDownloadResponse,
  type MuxReadyResponse,
} from '../core/messaging/mux-download'

const engine = createMuxEngine({
  onIdle: () => {
    void chrome.runtime.sendMessage({ type: MUX_IDLE_MESSAGE }).catch(() => undefined)
  },
})

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (isMuxReadyRequest(message)) {
    sendResponse({ ready: true } satisfies MuxReadyResponse)
    return false
  }
  if (isMuxReleaseRequest(message)) {
    void engine.releaseObjectUrl(message.objectUrl)
    return false
  }
  if (!isMuxDownloadRequest(message)) return false
  if (sender.id !== chrome.runtime.id) {
    sendResponse({ ok: false, error: 'Yêu cầu ghép media không thuộc Pinoria' } satisfies MuxDownloadResponse)
    return false
  }

  void engine.enqueueMux(message)
    .then((objectUrl) => sendResponse({ ok: true, objectUrl } satisfies MuxDownloadResponse))
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Không thể ghép video và audio'
      sendResponse({ ok: false, error: errorMessage } satisfies MuxDownloadResponse)
    })
  return true
})
