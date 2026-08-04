export type PinterestPageKind = 'home' | 'search' | 'board' | 'section' | 'pin' | 'unknown'

export interface PinterestBoardContext {
  ownerSlug: string
  slug: string
  name?: string
}

export interface PinterestSectionContext {
  slug: string
  name?: string
}

export interface PinterestPageContext {
  kind: PinterestPageKind
  pageUrl: string
  board?: PinterestBoardContext
  section?: PinterestSectionContext
}

export type PinMediaType = 'image' | 'gif' | 'video'
export type MediaCandidateRole = 'primary' | 'poster' | 'audio'
export type AudioAvailability = 'none' | 'unknown' | 'muxed' | 'separate'

export interface MediaCandidate {
  url: string
  role: MediaCandidateRole
  mimeType?: string
  width?: number
  height?: number
  density?: number
}

export interface PinMediaAsset {
  id: string
  type: PinMediaType
  index: number
  audio: AudioAvailability
  candidates: MediaCandidate[]
}

export interface PinAsset {
  pinId: string
  pinUrl: string
  title?: string
  description?: string
  context: PinterestPageContext
  media: PinMediaAsset[]
}

export type PinSkipReason = 'promoted' | 'no-media' | 'duplicate'

export interface SkippedPin {
  pinId: string
  pinUrl: string
  reason: PinSkipReason
}

export interface PinterestExtractionReport {
  context: PinterestPageContext
  pins: PinAsset[]
  skipped: SkippedPin[]
}
