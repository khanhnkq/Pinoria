import { describe, expect, it, vi } from 'vitest'

import type { BoardScanProgress, BoardScanSnapshot, PinAsset } from '../../core'
import type { BoardScanner, BoardScannerProgressListener } from '../scanner/board-scanner'
import { downloadBoard } from './download-board'

function pin(pinId: string): PinAsset {
  return {
    pinId,
    pinUrl: `https://www.pinterest.com/pin/${pinId}/`,
    context: { kind: 'board', pageUrl: 'https://www.pinterest.com/khanh/design/' },
    media: [],
  }
}

function createScanner(pins: PinAsset[]): BoardScanner {
  const listeners = new Set<BoardScannerProgressListener>()
  const snapshot: BoardScanSnapshot = {
    scanId: 'scan-1',
    status: 'completed',
    reason: 'settled',
    context: { kind: 'board', pageUrl: 'https://www.pinterest.com/khanh/design/' },
    pins,
    pinCount: pins.length,
    duplicateCount: 0,
    skippedCount: 0,
    batchCount: 1,
    scrollTop: 0,
    scrollHeight: 600,
    startedAt: 1,
    updatedAt: 2,
  }
  return {
    destroy: vi.fn(),
    getSnapshot: () => snapshot,
    start: () => {
      const progress = { ...snapshot } as Partial<BoardScanSnapshot>
      delete progress.pins
      for (const listener of listeners) listener(progress as BoardScanProgress, pins)
      return snapshot
    },
    stop: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

describe('downloadBoard', () => {
  it('downloads every discovered Pin sequentially and reports progress', async () => {
    const scanner = createScanner([pin('111'), pin('222')])
    const downloadPin = vi.fn(async (asset: PinAsset) => {
      void asset
    })
    const progress = vi.fn()

    const result = await downloadBoard({ scanner, downloadPin, onProgress: progress })

    expect(result).toEqual({ downloaded: 2, failed: 0, total: 2 })
    expect(downloadPin.mock.calls.map(([asset]) => asset.pinId)).toEqual(['111', '222'])
    expect(progress).toHaveBeenLastCalledWith({
      stage: 'downloading',
      scanned: 2,
      completed: 2,
      failed: 0,
      total: 2,
    })
  })

  it('continues after an individual Pin fails', async () => {
    const scanner = createScanner([pin('111'), pin('222')])
    const downloadPin = vi.fn(async (asset: PinAsset) => {
      if (asset.pinId === '111') throw new Error('failed')
    })

    await expect(downloadBoard({ scanner, downloadPin })).resolves.toEqual({
      downloaded: 1,
      failed: 1,
      total: 2,
    })
  })
})
