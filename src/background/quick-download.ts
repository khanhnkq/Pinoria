import {
  buildDownloadFilename,
  DEFAULT_DOWNLOAD_FOLDER,
  loadDownloadFolder,
  resolveFirstPinMedia,
  type PinAsset,
  type ResolveMediaOptions,
  type ResolvedMediaQuality,
} from '../core'
import {
  isQuickDownloadRequest,
  type QuickDownloadResponse,
} from '../core/messaging/quick-download'
import { requestMuxedDownload } from './offscreen-client'

export interface PreparedDirectDownload {
  kind: 'direct'
  url: string
  filename: string
  mimeType: string
  quality: ResolvedMediaQuality
}

export interface PreparedMuxDownload {
  kind: 'mux'
  audioUrl?: string
  filename: string
  mimeType: 'video/mp4'
  quality: ResolvedMediaQuality
  videoUrl: string
}

export type PreparedDownload = PreparedDirectDownload | PreparedMuxDownload

export async function prepareQuickDownload(
  pin: PinAsset,
  options: ResolveMediaOptions = {},
  downloadFolder: unknown = DEFAULT_DOWNLOAD_FOLDER,
): Promise<PreparedDownload> {
  const resolved = await resolveFirstPinMedia(pin, options)
  const filename = buildDownloadFilename(downloadFolder, pin.pinId, resolved.kind === 'mux'
    ? resolved.extension
    : resolved.source.extension)

  if (resolved.kind === 'mux') {
    return {
      kind: 'mux',
      videoUrl: resolved.videoSource.url,
      ...(resolved.audioSource ? { audioUrl: resolved.audioSource.url } : {}),
      filename,
      mimeType: resolved.mimeType,
      quality: resolved.quality,
    }
  }

  return {
    kind: 'direct',
    url: resolved.source.url,
    filename,
    mimeType: resolved.source.mimeType,
    quality: resolved.quality,
  }
}

function isPinterestPage(value: string | undefined): boolean {
  if (!value) return false

  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'pinterest.com' || url.hostname.endsWith('.pinterest.com'))
    )
  } catch {
    return false
  }
}

export function registerQuickDownloadHandler(): void {
  chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    if (!isQuickDownloadRequest(message)) return false

    const sourceUrl = sender.url ?? sender.tab?.url
    if (!isPinterestPage(sourceUrl)) {
      sendResponse({ ok: false, error: 'Download request must originate from Pinterest' } satisfies QuickDownloadResponse)
      return false
    }

    void (async () => {
      try {
        const prepared = await prepareQuickDownload(
          message.pin,
          {},
          message.folder ?? await loadDownloadFolder(),
        )
        const downloadId = prepared.kind === 'mux'
          ? await requestMuxedDownload({
              videoUrl: prepared.videoUrl,
              ...(prepared.audioUrl ? { audioUrl: prepared.audioUrl } : {}),
              filename: prepared.filename,
            })
          : await chrome.downloads.download({
              url: prepared.url,
              filename: prepared.filename,
              conflictAction: 'uniquify',
              saveAs: false,
            })
        sendResponse({ ok: true, downloadId } satisfies QuickDownloadResponse)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unable to download'
        sendResponse({ ok: false, error: errorMessage } satisfies QuickDownloadResponse)
      }
    })()

    return true
  })
}
