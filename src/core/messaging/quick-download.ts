import type { PinAsset } from '../models/pin-asset'

export const QUICK_DOWNLOAD_MESSAGE = 'PINORIA_QUICK_DOWNLOAD' as const

export interface QuickDownloadRequest {
  type: typeof QUICK_DOWNLOAD_MESSAGE
  pin: PinAsset
  folder?: string
}

export type QuickDownloadResponse =
  | { ok: true; downloadId: number }
  | { ok: false; error: string }

export function isQuickDownloadRequest(value: unknown): value is QuickDownloadRequest {
  if (typeof value !== 'object' || value === null) return false

  const request = value as Partial<QuickDownloadRequest>
  return (
    request.type === QUICK_DOWNLOAD_MESSAGE &&
    typeof request.pin === 'object' &&
    request.pin !== null &&
    typeof request.pin.pinId === 'string' &&
    Array.isArray(request.pin.media) &&
    (request.folder === undefined || typeof request.folder === 'string')
  )
}

export async function sendQuickDownloadRequest(pin: PinAsset, folder?: string): Promise<void> {
  const request: QuickDownloadRequest = {
    type: QUICK_DOWNLOAD_MESSAGE,
    pin,
    ...(folder ? { folder } : {}),
  }
  const response = (await chrome.runtime.sendMessage(request)) as QuickDownloadResponse | undefined

  if (!response?.ok) {
    throw new Error(response?.error ?? 'Unable to start download')
  }
}
