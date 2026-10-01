import { afterEach, describe, expect, it, vi } from 'vitest'

import { supportsOffscreenDocuments } from './extension-api'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('supportsOffscreenDocuments', () => {
  it('returns true when chrome.offscreen.createDocument exists (Chrome)', () => {
    const api = { offscreen: { createDocument: () => undefined } }
    expect(supportsOffscreenDocuments(api as unknown as typeof chrome)).toBe(true)
  })

  it('returns false when offscreen API is missing (Firefox)', () => {
    expect(supportsOffscreenDocuments({} as unknown as typeof chrome)).toBe(false)
    expect(
      supportsOffscreenDocuments({ offscreen: {} } as unknown as typeof chrome),
    ).toBe(false)
  })
})

describe('requestMuxedDownload on Firefox (no offscreen)', () => {
  it('muxes locally in background and downloads the blob URL', async () => {
    const downloadListeners: Array<(delta: { id: number; state?: { current?: string } }) => void> = []
    const download = vi.fn().mockResolvedValue(7)

    vi.stubGlobal('chrome', {
      downloads: {
        download,
        onChanged: { addListener: vi.fn((listener) => downloadListeners.push(listener)) },
      },
      runtime: {
        getURL: vi.fn((path: string) => `moz-extension://pinoria/${path}`),
        onMessage: { addListener: vi.fn() },
        sendMessage: vi.fn(),
      },
    })

    const enqueueMux = vi.fn().mockResolvedValue('blob:moz-extension://pinoria/video-1')
    const releaseObjectUrl = vi.fn().mockResolvedValue(undefined)
    vi.doMock('../background/mux-engine', () => ({
      createMuxEngine: () => ({ enqueueMux, releaseObjectUrl }),
    }))

    const { requestMuxedDownload } = await import('../background/offscreen-client')

    await expect(requestMuxedDownload({
      videoUrl: 'https://v.pinimg.com/videos/video.mp4',
      filename: 'Pinoria/Video/pinterest-123.mp4',
    })).resolves.toBe(7)

    expect(enqueueMux).toHaveBeenCalledTimes(1)
    expect(download).toHaveBeenCalledWith(expect.objectContaining({
      url: 'blob:moz-extension://pinoria/video-1',
      filename: 'Pinoria/Video/pinterest-123.mp4',
    }))

    // Download completion releases the local blob URL (no offscreen message).
    downloadListeners[0]?.({ id: 7, state: { current: 'complete' } })
    await vi.waitFor(() => expect(releaseObjectUrl).toHaveBeenCalledWith(
      'blob:moz-extension://pinoria/video-1',
    ))
    vi.doUnmock('../background/mux-engine')
  })
})
