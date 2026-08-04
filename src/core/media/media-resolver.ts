import type {
  AudioAvailability,
  MediaCandidate,
  MediaCandidateRole,
  PinAsset,
  PinMediaAsset,
  PinMediaType,
} from '../models/pin-asset'

export type ResolvedMediaExtension = 'jpg' | 'png' | 'webp' | 'gif' | 'mp4' | 'm4a' | 'm3u8'
export type ResolvedMediaQuality = 'original' | 'best-available'

export interface VerifiedMediaCandidate extends MediaCandidate {
  extension: ResolvedMediaExtension
  mimeType: string
  url: string
}

interface ResolvedMediaBase {
  audio: AudioAvailability
  mediaId: string
  mediaType: PinMediaType
  quality: ResolvedMediaQuality
}

export interface ResolvedDirectMedia extends ResolvedMediaBase {
  kind: 'direct'
  source: VerifiedMediaCandidate
}

export interface ResolvedMuxedMedia extends ResolvedMediaBase {
  audioSource?: VerifiedMediaCandidate
  extension: 'mp4'
  kind: 'mux'
  mimeType: 'video/mp4'
  videoSource: VerifiedMediaCandidate
}

export type ResolvedMedia = ResolvedDirectMedia | ResolvedMuxedMedia

export type CandidateProbe = (
  candidate: MediaCandidate,
  expectedType: PinMediaType,
  expectedRole: MediaCandidateRole,
) => Promise<VerifiedMediaCandidate | undefined>

export interface ResolveMediaOptions {
  fetcher?: typeof fetch
  probe?: CandidateProbe
}

const MIME_FORMATS = new Map<string, { extension: ResolvedMediaExtension; mimeType: string }>([
  ['image/jpeg', { extension: 'jpg', mimeType: 'image/jpeg' }],
  ['image/jpg', { extension: 'jpg', mimeType: 'image/jpeg' }],
  ['image/pjpeg', { extension: 'jpg', mimeType: 'image/jpeg' }],
  ['image/png', { extension: 'png', mimeType: 'image/png' }],
  ['image/webp', { extension: 'webp', mimeType: 'image/webp' }],
  ['image/gif', { extension: 'gif', mimeType: 'image/gif' }],
  ['video/mp4', { extension: 'mp4', mimeType: 'video/mp4' }],
  ['application/mp4', { extension: 'mp4', mimeType: 'video/mp4' }],
  ['audio/mp4', { extension: 'm4a', mimeType: 'audio/mp4' }],
  ['audio/x-m4a', { extension: 'm4a', mimeType: 'audio/mp4' }],
  ['audio/m4a', { extension: 'm4a', mimeType: 'audio/mp4' }],
  ['application/vnd.apple.mpegurl', { extension: 'm3u8', mimeType: 'application/vnd.apple.mpegurl' }],
  ['application/x-mpegurl', { extension: 'm3u8', mimeType: 'application/vnd.apple.mpegurl' }],
  ['audio/mpegurl', { extension: 'm3u8', mimeType: 'application/vnd.apple.mpegurl' }],
])

export function isPinterestMediaUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'pinimg.com' || url.hostname.endsWith('.pinimg.com'))
    )
  } catch {
    return false
  }
}

function isOriginalUrl(value: string): boolean {
  try {
    return new URL(value).pathname.split('/').includes('originals')
  } catch {
    return false
  }
}

function candidateScore(candidate: MediaCandidate): number {
  const width = candidate.width ?? 0
  const height = candidate.height ?? width
  const pixels = width * height
  const density = (candidate.density ?? 0) * 10_000
  return (isOriginalUrl(candidate.url) ? 1_000_000_000_000 : 0) + pixels + density
}

function rankCandidates(candidates: MediaCandidate[], role: MediaCandidateRole): MediaCandidate[] {
  return candidates
    .filter((candidate) => candidate.role === role && isPinterestMediaUrl(candidate.url))
    .sort((left, right) => candidateScore(right) - candidateScore(left))
}

function normalizeContentType(value: string | null): string | undefined {
  return value?.split(';', 1)[0]?.trim().toLowerCase() || undefined
}

function matchesExpectedFormat(
  extension: ResolvedMediaExtension,
  expectedType: PinMediaType,
  expectedRole: MediaCandidateRole,
): boolean {
  if (expectedRole === 'audio') return extension === 'm4a' || extension === 'm3u8'
  if (expectedType === 'video') return extension === 'mp4' || extension === 'm3u8'
  if (expectedType === 'gif') return extension === 'gif'
  return extension === 'jpg' || extension === 'png' || extension === 'webp'
}

function formatFromMime(
  value: string | null,
  expectedType: PinMediaType,
  expectedRole: MediaCandidateRole,
): { extension: ResolvedMediaExtension; mimeType: string } | undefined {
  const mimeType = normalizeContentType(value)
  const format = mimeType ? MIME_FORMATS.get(mimeType) : undefined
  return format && matchesExpectedFormat(format.extension, expectedType, expectedRole)
    ? format
    : undefined
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte)
}

function asciiAt(bytes: Uint8Array, offset: number, value: string): boolean {
  return Array.from(value).every((character, index) => bytes[offset + index] === character.charCodeAt(0))
}

function formatFromBytes(
  bytes: Uint8Array,
  expectedType: PinMediaType,
  expectedRole: MediaCandidateRole,
): { extension: ResolvedMediaExtension; mimeType: string } | undefined {
  let format: { extension: ResolvedMediaExtension; mimeType: string } | undefined

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    format = { extension: 'jpg', mimeType: 'image/jpeg' }
  } else if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    format = { extension: 'png', mimeType: 'image/png' }
  } else if (asciiAt(bytes, 0, 'GIF87a') || asciiAt(bytes, 0, 'GIF89a')) {
    format = { extension: 'gif', mimeType: 'image/gif' }
  } else if (asciiAt(bytes, 0, 'RIFF') && asciiAt(bytes, 8, 'WEBP')) {
    format = { extension: 'webp', mimeType: 'image/webp' }
  } else if (asciiAt(bytes, 4, 'ftyp')) {
    format = expectedRole === 'audio'
      ? { extension: 'm4a', mimeType: 'audio/mp4' }
      : { extension: 'mp4', mimeType: 'video/mp4' }
  } else if (asciiAt(bytes, 0, '#EXTM3U')) {
    format = { extension: 'm3u8', mimeType: 'application/vnd.apple.mpegurl' }
  }

  return format && matchesExpectedFormat(format.extension, expectedType, expectedRole)
    ? format
    : undefined
}

async function readResponsePrefix(response: Response, limit = 64): Promise<Uint8Array> {
  const reader = response.body?.getReader()
  if (!reader) return new Uint8Array(await response.arrayBuffer()).slice(0, limit)

  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (total < limit) {
      const { done, value } = await reader.read()
      if (done || !value) break
      const chunk = value.slice(0, limit - total)
      chunks.push(chunk)
      total += chunk.byteLength
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }

  const prefix = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    prefix.set(chunk, offset)
    offset += chunk.byteLength
  }
  return prefix
}

function verifiedCandidate(
  candidate: MediaCandidate,
  response: Response,
  format: { extension: ResolvedMediaExtension; mimeType: string },
): VerifiedMediaCandidate | undefined {
  const finalUrl = response.url || candidate.url
  if (!isPinterestMediaUrl(finalUrl)) return undefined

  return {
    ...candidate,
    extension: format.extension,
    mimeType: format.mimeType,
    url: finalUrl,
  }
}

export async function probeMediaCandidate(
  candidate: MediaCandidate,
  expectedType: PinMediaType,
  expectedRole: MediaCandidateRole,
  fetcher: typeof fetch = fetch,
): Promise<VerifiedMediaCandidate | undefined> {
  if (!isPinterestMediaUrl(candidate.url)) return undefined

  // Pinterest HLS playlists are small text manifests. Some CDN edges reject
  // HEAD and ranged GET even though Mediabunny can fetch the playlist normally.
  // The strict HTTPS + pinimg.com allowlist above is sufficient for this URL
  // shape, so avoid turning a probe incompatibility into a false CDN error.
  if (/\.m3u8(?:$|[?#])/i.test(candidate.url)) {
    const format = { extension: 'm3u8', mimeType: 'application/vnd.apple.mpegurl' } as const
    return matchesExpectedFormat(format.extension, expectedType, expectedRole)
      ? { ...candidate, ...format }
      : undefined
  }

  try {
    const headResponse = await fetcher(candidate.url, {
      cache: 'no-store',
      credentials: 'omit',
      method: 'HEAD',
      redirect: 'follow',
    })
    if (headResponse.ok) {
      const format = formatFromMime(
        headResponse.headers.get('content-type'),
        expectedType,
        expectedRole,
      )
      if (format) return verifiedCandidate(candidate, headResponse, format)
    }
  } catch {
    // A ranged GET below is the compatibility fallback for CDNs that reject HEAD.
  }

  try {
    const response = await fetcher(candidate.url, {
      cache: 'no-store',
      credentials: 'omit',
      headers: { Range: 'bytes=0-63' },
      method: 'GET',
      redirect: 'follow',
    })
    if (!response.ok) return undefined

    const bytes = await readResponsePrefix(response)
    const format =
      formatFromBytes(bytes, expectedType, expectedRole) ??
      formatFromMime(response.headers.get('content-type'), expectedType, expectedRole)
    return format ? verifiedCandidate(candidate, response, format) : undefined
  } catch {
    return undefined
  }
}

async function resolveCandidate(
  media: PinMediaAsset,
  role: MediaCandidateRole,
  probe: CandidateProbe,
): Promise<VerifiedMediaCandidate | undefined> {
  for (const candidate of rankCandidates(media.candidates, role)) {
    const verified = await probe(candidate, media.type, role)
    if (verified) return verified
  }
  return undefined
}

export async function resolveMediaAsset(
  media: PinMediaAsset,
  options: ResolveMediaOptions = {},
): Promise<ResolvedMedia> {
  const probe = options.probe ?? ((candidate, expectedType, expectedRole) =>
    probeMediaCandidate(candidate, expectedType, expectedRole, options.fetcher))
  const primary = await resolveCandidate(media, 'primary', probe)
  if (!primary) {
    throw new Error(`Không xác minh được ${media.type} nào từ Pinterest CDN`)
  }

  const quality: ResolvedMediaQuality = isOriginalUrl(primary.url)
    ? 'original'
    : 'best-available'

  if (media.type === 'video' && (media.audio === 'separate' || primary.extension === 'm3u8')) {
    const audioSource = await resolveCandidate(media, 'audio', probe)
    if (media.audio === 'separate' && !audioSource) {
      throw new Error('Video Pinterest dùng audio tách riêng nhưng không xác minh được track audio')
    }

    return {
      kind: 'mux',
      mediaId: media.id,
      mediaType: media.type,
      quality,
      audio: media.audio,
      videoSource: primary,
      ...(audioSource ? { audioSource } : {}),
      extension: 'mp4',
      mimeType: 'video/mp4',
    }
  }

  return {
    kind: 'direct',
    mediaId: media.id,
    mediaType: media.type,
    quality,
    audio: media.audio,
    source: primary,
  }
}

export async function resolveFirstPinMedia(
  pin: PinAsset,
  options: ResolveMediaOptions = {},
): Promise<ResolvedMedia> {
  const media = pin.media[0]
  if (!media) throw new Error('Pin không có media để tải xuống')
  return resolveMediaAsset(media, options)
}
