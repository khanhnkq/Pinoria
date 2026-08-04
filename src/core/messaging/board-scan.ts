import type { PinAsset, PinterestPageContext } from '../models/pin-asset'

export type BoardScanStatus =
  | 'idle'
  | 'scanning'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'error'

export type BoardScanCompletionReason =
  | 'settled'
  | 'stopped'
  | 'timeout'
  | 'page-changed'
  | 'unsupported-page'
  | 'error'

export interface BoardScanSnapshot {
  scanId: string
  status: BoardScanStatus
  reason?: BoardScanCompletionReason
  error?: string
  context?: PinterestPageContext
  pins: PinAsset[]
  pinCount: number
  duplicateCount: number
  skippedCount: number
  batchCount: number
  scrollTop: number
  scrollHeight: number
  startedAt?: number
  updatedAt: number
}

export type BoardScanProgress = Omit<BoardScanSnapshot, 'pins'>
