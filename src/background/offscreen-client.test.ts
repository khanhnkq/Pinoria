import { afterEach, describe, expect, it, vi } from 'vitest'

import { MUX_DOWNLOAD_MESSAGE, MUX_READY_MESSAGE } from '../core/messaging/mux-download'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('requestMuxedDownload', () => {
  it('waits until the new offscreen document has installed its message listener', async () => {
    const sendMessage = vi.fn()
      .mockRejectedValueOnce(new Error('Could not establish connection. Receiving end does not exist.'))
      .mockRejectedValueOnce(new Error('Could not establish connection. Receiving end does not exist.'))
      .mockResolvedValueOnce({ ready: true })
      .mockResolvedValueOnce({ ok: true, objectUrl: 'blob:chrome-extension://pinoria/video-1' })
    const createDocument = vi.fn().mockResolvedValue(undefined)
    const download = vi.fn().mockResolvedValue(42)

    vi.stubGlobal('chrome', {
      offscreen: {
        Reason: { BLOBS: 'BLOBS' },
        createDocument,
        hasDocument: vi.fn().mockResolvedValue(false),
      },
      downloads: {
        download,
        onChanged: { addListener: vi.fn() },
      },
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://pinoria/${path}`),
        sendMessage,
      },
    })
    const { requestMuxedDownload } = await import('./offscreen-client')

    await expect(requestMuxedDownload({
      videoUrl: 'https://v1.pinimg.com/videos/video_540w.m3u8',
      filename: 'Pinoria/pinterest-123.mp4',
    })).resolves.toBe(42)

    expect(createDocument).toHaveBeenCalledTimes(1)
    expect(sendMessage.mock.calls.slice(0, 3).map(([message]) => message.type)).toEqual([
      MUX_READY_MESSAGE,
      MUX_READY_MESSAGE,
      MUX_READY_MESSAGE,
    ])
    expect(sendMessage.mock.calls[3]?.[0]).toMatchObject({ type: MUX_DOWNLOAD_MESSAGE })
    expect(download).toHaveBeenCalledWith(expect.objectContaining({
      url: 'blob:chrome-extension://pinoria/video-1',
      filename: 'Pinoria/pinterest-123.mp4',
    }))
  })

  it('recreates a stale offscreen document that never answers the readiness handshake', async () => {
    vi.useFakeTimers()
    let readinessAttempts = 0
    const sendMessage = vi.fn(async (message: { type: string }) => {
      if (message.type === MUX_READY_MESSAGE) {
        readinessAttempts += 1
        if (readinessAttempts <= 20) {
          throw new Error('Could not establish connection. Receiving end does not exist.')
        }
        return { ready: true }
      }
      return { ok: true, objectUrl: 'blob:chrome-extension://pinoria/video-2' }
    })
    const closeDocument = vi.fn().mockResolvedValue(undefined)
    const createDocument = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('chrome', {
      offscreen: {
        Reason: { BLOBS: 'BLOBS' },
        closeDocument,
        createDocument,
        hasDocument: vi.fn().mockResolvedValue(true),
      },
      downloads: {
        download: vi.fn().mockResolvedValue(84),
        onChanged: { addListener: vi.fn() },
      },
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://pinoria/${path}`),
        sendMessage,
      },
    })
    const { requestMuxedDownload } = await import('./offscreen-client')

    const download = requestMuxedDownload({
      videoUrl: 'https://v1.pinimg.com/videos/video_540w.m3u8',
      filename: 'Pinoria/pinterest-456.mp4',
    })
    await vi.runAllTimersAsync()

    await expect(download).resolves.toBe(84)
    expect(closeDocument).toHaveBeenCalledTimes(1)
    expect(createDocument).toHaveBeenCalledTimes(1)
    expect(readinessAttempts).toBe(21)
  })

  it('releases the Blob URL and closes the offscreen document after the download completes', async () => {
    vi.useFakeTimers()
    const downloadListeners: Array<(delta: chrome.downloads.DownloadDelta) => void> = []
    const sendMessage = vi.fn(async (message: { type: string }) => {
      if (message.type === MUX_READY_MESSAGE) return { ready: true }
      if (message.type === MUX_DOWNLOAD_MESSAGE) {
        return { ok: true, objectUrl: 'blob:chrome-extension://pinoria/video-3' }
      }
      return undefined
    })
    const closeDocument = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('chrome', {
      offscreen: {
        Reason: { BLOBS: 'BLOBS' },
        closeDocument,
        createDocument: vi.fn().mockResolvedValue(undefined),
        hasDocument: vi.fn().mockResolvedValue(true),
      },
      downloads: {
        download: vi.fn().mockResolvedValue(126),
        onChanged: {
          addListener: vi.fn((listener) => downloadListeners.push(listener)),
        },
      },
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://pinoria/${path}`),
        onMessage: { addListener: vi.fn() },
        sendMessage,
      },
    })
    const {
      registerOffscreenLifecycleHandler,
      requestMuxedDownload,
    } = await import('./offscreen-client')
    registerOffscreenLifecycleHandler()

    await expect(requestMuxedDownload({
      videoUrl: 'https://v1.pinimg.com/videos/video_540w.m3u8',
      filename: 'Pinoria/pinterest-789.mp4',
    })).resolves.toBe(126)

    downloadListeners[0]?.({ id: 126, state: { current: 'complete' } })
    await vi.runAllTimersAsync()

    expect(sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'PINORIA_MUX_RELEASE',
      objectUrl: 'blob:chrome-extension://pinoria/video-3',
    }))
    expect(closeDocument).toHaveBeenCalledTimes(1)
  })
})
