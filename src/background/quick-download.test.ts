import { describe, expect, it } from 'vitest'

import type {
  CandidateProbe,
  MediaCandidate,
  PinAsset,
  ResolvedMediaExtension,
} from '../core'
import { prepareQuickDownload } from './quick-download'

function verified(
  candidate: MediaCandidate,
  extension: ResolvedMediaExtension,
  mimeType: string,
) {
  return { ...candidate, extension, mimeType }
}

const imageProbe: CandidateProbe = async (candidate) =>
  verified(candidate, 'jpg', 'image/jpeg')

function createImagePin(overrides: Partial<PinAsset> = {}): PinAsset {
  return {
    pinId: '111111111111',
    pinUrl: 'https://www.pinterest.com/pin/111111111111/',
    context: { kind: 'home', pageUrl: 'https://www.pinterest.com/' },
    media: [
      {
        id: '111111111111:0',
        type: 'image',
        index: 0,
        audio: 'none',
        candidates: [
          { url: 'https://i.pinimg.com/236x/a.jpg', role: 'primary', width: 236 },
          { url: 'https://i.pinimg.com/736x/a.jpg', role: 'primary', width: 736 },
        ],
      },
    ],
    ...overrides,
  }
}

describe('prepareQuickDownload', () => {
  it('selects the largest verified primary candidate', async () => {
    await expect(prepareQuickDownload(createImagePin(), { probe: imageProbe })).resolves.toEqual({
      kind: 'direct',
      url: 'https://i.pinimg.com/736x/a.jpg',
      filename: 'Pinoria/Ảnh/pinterest-111111111111.jpg',
      mimeType: 'image/jpeg',
      quality: 'best-available',
    })
  })

  it('rejects media candidates outside the Pinterest CDN', async () => {
    const pin = createImagePin()
    pin.media[0]!.candidates = [{ url: 'https://example.com/a.jpg', role: 'primary' }]

    await expect(prepareQuickDownload(pin, { probe: imageProbe })).rejects.toThrow('Pinterest CDN')
  })

  it('prepares separately streamed video and audio for local muxing', async () => {
    const pin = createImagePin({
      media: [
        {
          id: '111111111111:0',
          type: 'video',
          index: 0,
          audio: 'separate',
          candidates: [
            { url: 'https://v.pinimg.com/videos/video.mp4', role: 'primary' },
            { url: 'https://v.pinimg.com/videos/audio.m4a', role: 'audio' },
          ],
        },
      ],
    })
    const probe: CandidateProbe = async (candidate, _type, role) => role === 'audio'
      ? verified(candidate, 'm4a', 'audio/mp4')
      : verified(candidate, 'mp4', 'video/mp4')

    await expect(prepareQuickDownload(pin, { probe })).resolves.toEqual({
      kind: 'mux',
      videoUrl: 'https://v.pinimg.com/videos/video.mp4',
      audioUrl: 'https://v.pinimg.com/videos/audio.m4a',
      filename: 'Pinoria/Video/pinterest-111111111111.mp4',
      mimeType: 'video/mp4',
      quality: 'best-available',
    })
  })

  it('uses the verified MIME extension instead of guessing from the URL', async () => {
    const pin = createImagePin()
    pin.media[0]!.candidates = [{
      url: 'https://i.pinimg.com/resource?id=111',
      role: 'primary',
      width: 736,
    }]
    const probe: CandidateProbe = async (candidate) =>
      verified(candidate, 'webp', 'image/webp')

    await expect(prepareQuickDownload(pin, { probe })).resolves.toMatchObject({
      filename: 'Pinoria/Ảnh/pinterest-111111111111.webp',
      mimeType: 'image/webp',
    })
  })

  it('places downloads in the configured folder', async () => {
    await expect(
      prepareQuickDownload(createImagePin(), { probe: imageProbe }, 'Pinterest/Kim Ji Won'),
    ).resolves.toMatchObject({
      filename: 'Pinterest/Kim Ji Won/Ảnh/pinterest-111111111111.jpg',
    })
  })
})
