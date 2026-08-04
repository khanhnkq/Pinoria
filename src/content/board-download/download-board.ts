import type { BoardScanProgress, PinAsset } from '../../core'
import type { BoardScanner } from '../scanner/board-scanner'

export type BoardDownloadStage = 'scanning' | 'downloading'

export interface BoardDownloadProgress {
  completed: number
  failed: number
  scanned: number
  stage: BoardDownloadStage
  total: number
}

export interface BoardDownloadResult {
  downloaded: number
  failed: number
  total: number
}

export interface DownloadBoardOptions {
  downloadPin: (pin: PinAsset) => Promise<void>
  onProgress?: (progress: BoardDownloadProgress) => void
  scanner: BoardScanner
}

function scanError(progress: BoardScanProgress): Error {
  if (progress.status === 'error') {
    return new Error(progress.error ?? 'Không thể quét board Pinterest')
  }
  if (progress.reason === 'page-changed') {
    return new Error('Board đã thay đổi trong lúc quét')
  }
  return new Error('Quá trình quét board đã dừng')
}

export async function downloadBoard({
  downloadPin,
  onProgress,
  scanner,
}: DownloadBoardOptions): Promise<BoardDownloadResult> {
  const pinsById = new Map<string, PinAsset>()

  const pins = await new Promise<PinAsset[]>((resolve, reject) => {
    let settled = false
    let unsubscribe: () => void = () => undefined

    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      unsubscribe()
      callback()
    }

    unsubscribe = scanner.subscribe((progress, newPins) => {
      for (const pin of newPins) pinsById.set(pin.pinId, pin)
      onProgress?.({
        stage: 'scanning',
        scanned: progress.pinCount,
        completed: 0,
        failed: 0,
        total: progress.pinCount,
      })

      if (progress.status === 'completed') {
        for (const pin of scanner.getSnapshot().pins) pinsById.set(pin.pinId, pin)
        finish(() => resolve(Array.from(pinsById.values())))
      } else if (progress.status === 'error' || progress.status === 'stopped') {
        finish(() => reject(scanError(progress)))
      }
    })

    const snapshot = scanner.start()
    for (const pin of snapshot.pins) pinsById.set(pin.pinId, pin)

    onProgress?.({
      stage: 'scanning',
      scanned: snapshot.pinCount,
      completed: 0,
      failed: 0,
      total: snapshot.pinCount,
    })

    if (snapshot.status === 'completed') {
      finish(() => resolve(Array.from(pinsById.values())))
    } else if (snapshot.status === 'error' || snapshot.status === 'stopped') {
      finish(() => reject(scanError(snapshot)))
    }
  })

  if (pins.length === 0) throw new Error('Không tìm thấy Pin nào để tải')

  let completed = 0
  let failed = 0
  for (const pin of pins) {
    try {
      await downloadPin(pin)
      completed += 1
    } catch {
      failed += 1
    }

    onProgress?.({
      stage: 'downloading',
      scanned: pins.length,
      completed,
      failed,
      total: pins.length,
    })
  }

  if (completed === 0) throw new Error('Không thể tải Pin nào trong board')
  return { downloaded: completed, failed, total: pins.length }
}
