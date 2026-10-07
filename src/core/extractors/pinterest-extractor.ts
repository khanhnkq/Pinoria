import type {
  AudioAvailability,
  MediaCandidate,
  PinAsset,
  PinMediaAsset,
  PinterestExtractionReport,
  PinterestPageContext,
  PinterestPageKind,
} from '../models/pin-asset'
import { PINTEREST_SELECTORS, selectorList } from './pinterest-selectors'

const PIN_PATH_PATTERN = /^\/pin\/(\d+)\/?$/
const RESERVED_ROOT_ROUTES = new Set([
  '_saved',
  'business',
  'ideas',
  'settings',
  'today',
])

function cleanText(value: string | null | undefined): string | undefined {
  const cleaned = value?.replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

function readPositiveNumber(value: string | null | undefined): number | undefined {
  if (!value) return undefined

  const number = Number.parseFloat(value)
  return Number.isFinite(number) && number > 0 ? number : undefined
}

function isPinterestHostname(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

function normalizePageUrl(value: string, baseUrl: string): URL | undefined {
  try {
    const url = new URL(value, baseUrl)
    if (url.protocol !== 'https:' || !isPinterestHostname(url.hostname, 'pinterest.com')) {
      return undefined
    }

    return url
  } catch {
    return undefined
  }
}

function normalizeMediaUrl(
  value: string | null | undefined,
  baseUrl: string,
  allowBlob = false,
): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value, baseUrl)

    if (allowBlob && url.protocol === 'blob:') return url.href
    if (
      url.protocol !== 'https:' ||
      (!isPinterestHostname(url.hostname, 'pinimg.com') && !isPinterestHostname(url.hostname, 'pinterest.com'))
    ) {
      return undefined
    }

    return url.href
  } catch {
    return undefined
  }
}

function inferWidthFromUrl(value: string): number | undefined {
  try {
    const match = new URL(value).pathname.match(/\/(\d+)x(?:\d+)?\//)
    return readPositiveNumber(match?.[1])
  } catch {
    return undefined
  }
}

function parseSrcset(value: string | null, baseUrl: string): MediaCandidate[] {
  if (!value) return []

  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/))
    .flatMap(([rawUrl, descriptor]) => {
      const url = normalizeMediaUrl(rawUrl, baseUrl)
      if (!url) return []

      const candidate: MediaCandidate = {
        url,
        role: 'primary',
      }

      if (descriptor?.endsWith('w')) {
        candidate.width = readPositiveNumber(descriptor.slice(0, -1))
      } else if (descriptor?.endsWith('x')) {
        candidate.density = readPositiveNumber(descriptor.slice(0, -1))
      }

      candidate.width ??= inferWidthFromUrl(url)
      return [candidate]
    })
}

function deduplicateCandidates(candidates: MediaCandidate[]): MediaCandidate[] {
  const seen = new Set<string>()

  return candidates.filter((candidate) => {
    const key = `${candidate.role}:${candidate.url}`
    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

function isIgnoredImage(image: HTMLImageElement): boolean {
  if (image.matches(selectorList(PINTEREST_SELECTORS.ignoredImages))) return true

  const width = readPositiveNumber(image.getAttribute('width'))
  const height = readPositiveNumber(image.getAttribute('height'))

  return width !== undefined && height !== undefined && width <= 80 && height <= 80
}

function extractImageAsset(
  image: HTMLImageElement,
  pinId: string,
  index: number,
  pageUrl: string,
): PinMediaAsset | undefined {
  if (isIgnoredImage(image)) return undefined

  const rawSrc = image.currentSrc || image.getAttribute('src') || image.src
  const sourceUrl = normalizeMediaUrl(rawSrc, pageUrl)
  const elementWidth = readPositiveNumber(image.getAttribute('width'))
  const elementHeight = readPositiveNumber(image.getAttribute('height'))
  const candidates: MediaCandidate[] = []

  if (sourceUrl) {
    candidates.push({
      url: sourceUrl,
      role: 'primary',
      width: inferWidthFromUrl(sourceUrl) ?? elementWidth,
      height: elementHeight,
    })
  }

  const rawSrcset = image.getAttribute('srcset') || image.srcset
  candidates.push(...parseSrcset(rawSrcset, pageUrl))
  const uniqueCandidates = deduplicateCandidates(candidates)
  if (uniqueCandidates.length === 0) return undefined

  const explicitType = image.dataset.mediaType?.toLowerCase()
  const isGif =
    explicitType === 'gif' ||
    uniqueCandidates.some(({ url }) => new URL(url).pathname.toLowerCase().endsWith('.gif'))

  return {
    id: `${pinId}:${index}`,
    type: isGif ? 'gif' : 'image',
    index,
    audio: 'none',
    candidates: uniqueCandidates,
  }
}

function extractVideoAsset(
  video: HTMLVideoElement,
  pinId: string,
  index: number,
  pageUrl: string,
): PinMediaAsset | undefined {
  const width = readPositiveNumber(video.getAttribute('width'))
  const height = readPositiveNumber(video.getAttribute('height'))
  const candidates: MediaCandidate[] = []
  const directSource = normalizeMediaUrl(video.currentSrc || video.getAttribute('src'), pageUrl, true)

  if (directSource) {
    candidates.push({ url: directSource, role: 'primary', width, height })
  }

  for (const source of video.querySelectorAll<HTMLSourceElement>('source')) {
    const mimeType = cleanText(source.getAttribute('type'))
    const role = mimeType?.startsWith('audio/') ? 'audio' : 'primary'
    const url = normalizeMediaUrl(source.getAttribute('src'), pageUrl, role === 'primary')

    if (url) candidates.push({ url, role, mimeType, width, height })
  }

  const posterUrl = normalizeMediaUrl(video.getAttribute('poster'), pageUrl)
  if (posterUrl) {
    candidates.push({ url: posterUrl, role: 'poster', width, height, mimeType: 'image/jpeg' })
  }

  const separateAudioUrl = normalizeMediaUrl(video.dataset.audioUrl, pageUrl)
  const hlsVideoUrl = normalizeMediaUrl(video.dataset.pinoriaHlsVideoUrl, pageUrl)
  const hlsMasterUrl = normalizeMediaUrl(video.dataset.pinoriaHlsMasterUrl, pageUrl)
  const hlsAudioUrl = normalizeMediaUrl(video.dataset.pinoriaHlsAudioUrl, pageUrl)
  if (hlsVideoUrl || hlsMasterUrl) {
    candidates.push({
      url: hlsVideoUrl ?? hlsMasterUrl!,
      role: 'primary',
      mimeType: 'application/vnd.apple.mpegurl',
      width: readPositiveNumber(video.dataset.pinoriaHlsVideoWidth) ?? width,
      height,
    })
  }
  if (separateAudioUrl || hlsAudioUrl) {
    candidates.push({
      url: separateAudioUrl ?? hlsAudioUrl!,
      role: 'audio',
      mimeType: hlsAudioUrl ? 'application/vnd.apple.mpegurl' : undefined,
    })
  }

  const uniqueCandidates = deduplicateCandidates(candidates)
  if (!uniqueCandidates.some(({ role }) => role === 'primary')) return undefined

  let audio: AudioAvailability = 'unknown'
  if (uniqueCandidates.some(({ role }) => role === 'audio')) {
    audio = 'separate'
  } else if (video.dataset.hasAudio === 'true') {
    audio = 'muxed'
  } else if (video.dataset.hasAudio === 'false') {
    audio = 'none'
  }

  const roleOrder = { primary: 0, poster: 1, audio: 2 } as const
  uniqueCandidates.sort((left, right) => roleOrder[left.role] - roleOrder[right.role])

  return {
    id: `${pinId}:${index}`,
    type: 'video',
    index,
    audio,
    candidates: uniqueCandidates,
  }
}

function extractMediaFromScope(
  scope: Element,
  pinId: string,
  startIndex: number,
  pageUrl: string,
): PinMediaAsset[] {
  const videos = Array.from(scope.querySelectorAll<HTMLVideoElement>('video'))
  if (videos.length > 0) {
    return videos.flatMap((video, offset) => {
      const asset = extractVideoAsset(video, pinId, startIndex + offset, pageUrl)
      return asset ? [asset] : []
    })
  }

  return Array.from(scope.querySelectorAll<HTMLImageElement>('img')).flatMap((image, offset) => {
    const asset = extractImageAsset(image, pinId, startIndex + offset, pageUrl)
    return asset ? [asset] : []
  })
}

function extractMedia(link: HTMLAnchorElement, pinId: string, pageUrl: string): PinMediaAsset[] {
  const carouselItems = Array.from(
    link.querySelectorAll(selectorList(PINTEREST_SELECTORS.carouselItems)),
  )
  const scopes = carouselItems.length > 0 ? carouselItems : [link]
  const media: PinMediaAsset[] = []

  for (const scope of scopes) {
    const assets = extractMediaFromScope(scope, pinId, media.length, pageUrl)
    media.push(...assets)
  }

  const seenPrimaryUrls = new Set<string>()
  return media
    .filter((asset) => {
      const primaryUrl = asset.candidates.find(({ role }) => role === 'primary')?.url
      if (!primaryUrl || seenPrimaryUrls.has(primaryUrl)) return false

      seenPrimaryUrls.add(primaryUrl)
      return true
    })
    .map((asset, index) => ({ ...asset, id: `${pinId}:${index}`, index }))
}

function findPinContainer(link: HTMLAnchorElement): Element | null {
  return link.closest(selectorList(PINTEREST_SELECTORS.pinContainers))
}

function isPromotedCard(card: Element): boolean {
  const promotedSelector = selectorList(PINTEREST_SELECTORS.promotedMarkers)
  return card.matches(promotedSelector) || card.querySelector(promotedSelector) !== null
}

function extractPinIdentity(
  link: HTMLAnchorElement,
  pageUrl: string,
): { pinId: string; pinUrl: string } | undefined {
  const url = normalizePageUrl(link.getAttribute('href') ?? '', pageUrl)
  const match = url?.pathname.match(PIN_PATH_PATTERN)
  if (!url || !match?.[1]) return undefined

  url.search = ''
  url.hash = ''
  return { pinId: match[1], pinUrl: url.href }
}

function getDocumentUrl(document: Document): string {
  return document.defaultView?.location.href || 'https://www.pinterest.com/'
}

function getRootDocument(root: Document | Element): Document {
  if (root.nodeType === 9) return root as Document
  if (root.ownerDocument) return root.ownerDocument
  throw new Error('Pinterest extraction root is not attached to a document')
}

function getContextName(document: Document, selector: string): string | undefined {
  return cleanText(document.querySelector(selector)?.textContent)
}

function safeDecodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function parsePinterestPageContext(
  document: Document,
  pageUrl = getDocumentUrl(document),
): PinterestPageContext {
  let url: URL

  try {
    url = new URL(pageUrl)
  } catch {
    return { kind: 'unknown', pageUrl }
  }

  const segments = url.pathname.split('/').filter(Boolean).map(safeDecodeSegment)
  let kind: PinterestPageKind = 'unknown'

  if (segments.length === 0) {
    kind = 'home'
  } else if (segments[0] === 'search') {
    kind = 'search'
  } else if (segments[0] === 'pin' && /^\d+$/.test(segments[1] ?? '')) {
    kind = 'pin'
  } else if (
    segments.length >= 2 &&
    segments[0] !== undefined &&
    !RESERVED_ROOT_ROUTES.has(segments[0])
  ) {
    kind = segments.length >= 3 ? 'section' : 'board'
  }

  const context: PinterestPageContext = { kind, pageUrl: url.href }
  if ((kind === 'board' || kind === 'section') && segments[0] && segments[1]) {
    context.board = {
      ownerSlug: segments[0],
      slug: segments[1],
      name: getContextName(document, PINTEREST_SELECTORS.boardTitle),
    }
  }

  if (kind === 'section' && segments[2]) {
    context.section = {
      slug: segments[2],
      name: getContextName(document, PINTEREST_SELECTORS.sectionTitle),
    }
  }

  return context
}

export function extractPinterestPage(
  root: Document | Element,
  pageUrl = getDocumentUrl(getRootDocument(root)),
): PinterestExtractionReport {
  const document = getRootDocument(root)
  const context = parsePinterestPageContext(document, pageUrl)
  const pins: PinAsset[] = []
  const skipped: PinterestExtractionReport['skipped'] = []
  const seenCards = new WeakSet<Element>()
  const seenPinIds = new Set<string>()

  for (const link of root.querySelectorAll<HTMLAnchorElement>(PINTEREST_SELECTORS.pinLinks)) {
    const card = findPinContainer(link)
    if (!card || seenCards.has(card)) continue

    seenCards.add(card)
    const identity = extractPinIdentity(link, pageUrl)
    if (!identity) continue

    if (isPromotedCard(card)) {
      skipped.push({ ...identity, reason: 'promoted' })
      continue
    }

    if (seenPinIds.has(identity.pinId)) {
      skipped.push({ ...identity, reason: 'duplicate' })
      continue
    }

    const media = extractMedia(link, identity.pinId, pageUrl)
    if (media.length === 0) {
      skipped.push({ ...identity, reason: 'no-media' })
      continue
    }

    const title =
      cleanText(link.getAttribute('aria-label')) ??
      cleanText(link.querySelector<HTMLImageElement>('img[alt]')?.getAttribute('alt'))
    const description = cleanText(card.querySelector(PINTEREST_SELECTORS.pinDescription)?.textContent)

    pins.push({ ...identity, title, description, context, media })
    seenPinIds.add(identity.pinId)
  }

  return { context, pins, skipped }
}
