export const MUX_DOWNLOAD_MESSAGE = 'PINORIA_MUX_DOWNLOAD' as const
export const MUX_IDLE_MESSAGE = 'PINORIA_MUX_IDLE' as const
export const MUX_READY_MESSAGE = 'PINORIA_MUX_READY' as const
export const MUX_RELEASE_MESSAGE = 'PINORIA_MUX_RELEASE' as const

export interface MuxReadyRequest {
  type: typeof MUX_READY_MESSAGE
}

export interface MuxReadyResponse {
  ready: true
}

export interface MuxIdleRequest {
  type: typeof MUX_IDLE_MESSAGE
}

export interface MuxReleaseRequest {
  objectUrl: string
  type: typeof MUX_RELEASE_MESSAGE
}

export interface MuxDownloadRequest {
  type: typeof MUX_DOWNLOAD_MESSAGE
  audioUrl?: string
  filename: string
  videoUrl: string
}

export type MuxDownloadResponse =
  | { ok: true; objectUrl: string }
  | { ok: false; error: string }

export function isMuxDownloadRequest(value: unknown): value is MuxDownloadRequest {
  if (typeof value !== 'object' || value === null) return false
  const request = value as Partial<MuxDownloadRequest>

  return (
    request.type === MUX_DOWNLOAD_MESSAGE &&
    typeof request.videoUrl === 'string' &&
    (request.audioUrl === undefined || typeof request.audioUrl === 'string') &&
    typeof request.filename === 'string'
  )
}

export function isMuxReadyRequest(value: unknown): value is MuxReadyRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<MuxReadyRequest>).type === MUX_READY_MESSAGE
  )
}

export function isMuxIdleRequest(value: unknown): value is MuxIdleRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<MuxIdleRequest>).type === MUX_IDLE_MESSAGE
  )
}

export function isMuxReleaseRequest(value: unknown): value is MuxReleaseRequest {
  if (typeof value !== 'object' || value === null) return false
  const request = value as Partial<MuxReleaseRequest>
  return request.type === MUX_RELEASE_MESSAGE && typeof request.objectUrl === 'string'
}
