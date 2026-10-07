import { describe, expect, it, vi } from 'vitest'

import type { MediaCandidate, PinMediaAsset } from '../models/pin-asset'
import {
  isPinterestMediaUrl,
  probeMediaCandidate,
  resolveMediaAsset,
  type CandidateProbe,
  type ResolvedMediaExtension,
} from './media-resolver'

function imageMedia(candidates: MediaCandidate[]): PinMediaAsset {
  return {
    id: 'pin:0',
    type: 'image',
    index: 0,
    audio: 'none',
    candidates,
  }
}

function verified(
  candidate: MediaCandidate,
  extension: ResolvedMediaExtension,
  mimeType: string,
) {
  return { ...candidate, extension, mimeType }
}

describe('resolveMediaAsset', () => {
  it('prefers a verified originals candidate', async () => {
    const candidates: MediaCandidate[] = [
      { url: 'https://i.pinimg.com/736x/a.jpg', role: 'primary', width: 736 },
      { url: 'https://i.pinimg.com/originals/a.jpg', role: 'primary' },
    ]
    const probe: CandidateProbe = vi.fn(async (candidate) =>
      verified(candidate, 'jpg', 'image/jpeg'))

    await expect(resolveMediaAsset(imageMedia(candidates), { probe })).resolves.toMatchObject({
      kind: 'direct',
      quality: 'original',
      source: { url: 'https://i.pinimg.com/originals/a.jpg', extension: 'jpg' },
    })
  })

  it('falls back to the largest verified variant when originals is unavailable', async () => {
    const candidates: MediaCandidate[] = [
      { url: 'https://i.pinimg.com/474x/a.webp', role: 'primary', width: 474 },
      { url: 'https://i.pinimg.com/736x/a.webp', role: 'primary', width: 736 },
      { url: 'https://i.pinimg.com/originals/a.webp', role: 'primary' },
    ]
    const probe: CandidateProbe = vi.fn(async (candidate) =>
      candidate.url.includes('originals') ? undefined : verified(candidate, 'webp', 'image/webp'))

    await expect(resolveMediaAsset(imageMedia(candidates), { probe })).resolves.toMatchObject({
      quality: 'best-available',
      source: { url: 'https://i.pinimg.com/736x/a.webp', extension: 'webp' },
    })
  })

  it('preserves a verified animated GIF source', async () => {
    const media: PinMediaAsset = {
      ...imageMedia([{ url: 'https://i.pinimg.com/originals/animation.gif', role: 'primary' }]),
      type: 'gif',
    }
    const probe: CandidateProbe = async (candidate) => verified(candidate, 'gif', 'image/gif')

    await expect(resolveMediaAsset(media, { probe })).resolves.toMatchObject({
      kind: 'direct',
      source: { extension: 'gif', mimeType: 'image/gif' },
    })
  })

  it('returns a direct MP4 when audio is already muxed', async () => {
    const media: PinMediaAsset = {
      id: 'pin:0',
      type: 'video',
      index: 0,
      audio: 'muxed',
      candidates: [{ url: 'https://v.pinimg.com/video.mp4', role: 'primary' }],
    }
    const probe: CandidateProbe = async (candidate) => verified(candidate, 'mp4', 'video/mp4')

    await expect(resolveMediaAsset(media, { probe })).resolves.toMatchObject({
      kind: 'direct',
      audio: 'muxed',
      source: { extension: 'mp4' },
    })
  })

  it('returns verified video and audio sources for local muxing', async () => {
    const media: PinMediaAsset = {
      id: 'pin:0',
      type: 'video',
      index: 0,
      audio: 'separate',
      candidates: [
        { url: 'https://v.pinimg.com/video.mp4', role: 'primary' },
        { url: 'https://v.pinimg.com/audio.m4a', role: 'audio' },
      ],
    }
    const probe: CandidateProbe = async (candidate, _type, role) => role === 'audio'
      ? verified(candidate, 'm4a', 'audio/mp4')
      : verified(candidate, 'mp4', 'video/mp4')

    await expect(resolveMediaAsset(media, { probe })).resolves.toMatchObject({
      kind: 'mux',
      videoSource: { extension: 'mp4' },
      audioSource: { extension: 'm4a' },
    })
  })

  it('routes separate HLS video and audio playlists through the MP4 processor', async () => {
    const media: PinMediaAsset = {
      id: 'pin:0',
      type: 'video',
      index: 0,
      audio: 'separate',
      candidates: [
        { url: 'https://v1.pinimg.com/video_720w.m3u8', role: 'primary', width: 720 },
        { url: 'https://v1.pinimg.com/video_audio.m3u8', role: 'audio' },
      ],
    }
    const probe: CandidateProbe = async (candidate) =>
      verified(candidate, 'm3u8', 'application/vnd.apple.mpegurl')

    await expect(resolveMediaAsset(media, { probe })).resolves.toMatchObject({
      kind: 'mux',
      extension: 'mp4',
      videoSource: { extension: 'm3u8' },
      audioSource: { extension: 'm3u8' },
    })
  })

  it('reports a clear error when a separate audio track cannot be verified', async () => {
    const media: PinMediaAsset = {
      id: 'pin:0',
      type: 'video',
      index: 0,
      audio: 'separate',
      candidates: [
        { url: 'https://v.pinimg.com/video.mp4', role: 'primary' },
        { url: 'https://v.pinimg.com/audio.m4a', role: 'audio' },
      ],
    }
    const probe: CandidateProbe = async (candidate, _type, role) => role === 'audio'
      ? undefined
      : verified(candidate, 'mp4', 'video/mp4')

    await expect(resolveMediaAsset(media, { probe })).rejects.toThrow('audio track')
  })
})

describe('probeMediaCandidate', () => {
  it('validates Pinterest CDN and MIME with a HEAD request', async () => {
    const fetcher = vi.fn(async () => new Response(null, {
      status: 200,
      headers: { 'Content-Type': 'image/webp; charset=binary' },
    })) as unknown as typeof fetch
    const candidate: MediaCandidate = {
      url: 'https://i.pinimg.com/736x/a.webp',
      role: 'primary',
    }

    await expect(probeMediaCandidate(candidate, 'image', 'primary', fetcher)).resolves.toMatchObject({
      extension: 'webp',
      mimeType: 'image/webp',
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('sniffs GIF bytes when HEAD is unavailable', async () => {
    const responses = [
      new Response(null, { status: 405 }),
      new Response(new TextEncoder().encode('GIF89a payload'), { status: 206 }),
    ]
    const fetcher = vi.fn(async () => responses.shift()!) as unknown as typeof fetch
    const candidate: MediaCandidate = {
      url: 'https://i.pinimg.com/originals/a.gif',
      role: 'primary',
    }

    await expect(probeMediaCandidate(candidate, 'gif', 'primary', fetcher)).resolves.toMatchObject({
      extension: 'gif',
      mimeType: 'image/gif',
    })
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('accepts an allowlisted Pinterest HLS playlist without an incompatible CDN probe', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch
    const candidate: MediaCandidate = {
      url: 'https://v1.pinimg.com/videos/video_720w.m3u8',
      role: 'primary',
    }

    await expect(probeMediaCandidate(candidate, 'video', 'primary', fetcher)).resolves.toMatchObject({
      extension: 'm3u8',
      mimeType: 'application/vnd.apple.mpegurl',
    })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('rejects external URLs without making a request', async () => {
    const fetcher = vi.fn() as unknown as typeof fetch
    const candidate: MediaCandidate = { url: 'https://example.com/a.jpg', role: 'primary' }

    await expect(probeMediaCandidate(candidate, 'image', 'primary', fetcher)).resolves.toBeUndefined()
    expect(fetcher).not.toHaveBeenCalled()
    expect(isPinterestMediaUrl(candidate.url)).toBe(false)
  })
})
