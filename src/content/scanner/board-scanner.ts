import { extractPinterestPage, parsePinterestPageContext } from '../../core'
import type {
  BoardScanCompletionReason,
  BoardScanProgress,
  BoardScanSnapshot,
  PinAsset,
  PinterestPageContext,
} from '../../core'

export interface BoardScannerConfig {
  batchIntervalMs?: number
  interactionPauseMs?: number
  maxDurationMs?: number
  settleBatchCount?: number
  scrollStepRatio?: number
}

export interface BoardScannerOptions extends BoardScannerConfig {
  document: Document
  onProgress?: (progress: BoardScanProgress, newPins: PinAsset[]) => void
}

export interface BoardScanner {
  destroy: () => void
  getSnapshot: () => BoardScanSnapshot
  start: () => BoardScanSnapshot
  stop: () => BoardScanSnapshot
  subscribe: (listener: BoardScannerProgressListener) => () => void
}

export type BoardScannerProgressListener = (
  progress: BoardScanProgress,
  newPins: PinAsset[],
) => void

interface ScrollMetrics {
  top: number
  height: number
  viewport: number
}

const DEFAULT_BATCH_INTERVAL_MS = 400
const DEFAULT_INTERACTION_PAUSE_MS = 1400
const DEFAULT_MAX_DURATION_MS = 10 * 60 * 1000
const DEFAULT_SETTLE_BATCH_COUNT = 4
const DEFAULT_SCROLL_STEP_RATIO = 0.85

function createScanId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `scan-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function contextIdentity(context: PinterestPageContext): string {
  return [
    context.kind,
    context.board?.ownerSlug ?? '',
    context.board?.slug ?? '',
    context.section?.slug ?? '',
  ].join(':')
}

function isSupportedContext(context: PinterestPageContext): boolean {
  return context.kind === 'board' || context.kind === 'section'
}

function getScrollMetrics(document: Document): ScrollMetrics {
  const view = document.defaultView
  const root = document.scrollingElement ?? document.documentElement
  return {
    top: Math.max(0, view?.scrollY ?? root.scrollTop),
    height: Math.max(root.scrollHeight, document.body?.scrollHeight ?? 0),
    viewport: Math.max(1, view?.innerHeight ?? root.clientHeight),
  }
}

function createInitialSnapshot(now: number): BoardScanSnapshot {
  return {
    scanId: '',
    status: 'idle',
    pins: [],
    pinCount: 0,
    duplicateCount: 0,
    skippedCount: 0,
    batchCount: 0,
    scrollTop: 0,
    scrollHeight: 0,
    updatedAt: now,
  }
}

function createProgress(snapshot: BoardScanSnapshot): BoardScanProgress {
  const value = { ...snapshot } as Partial<BoardScanSnapshot>
  delete value.pins
  return value as BoardScanProgress
}

export function createBoardScanner({
  document,
  onProgress,
  batchIntervalMs = DEFAULT_BATCH_INTERVAL_MS,
  interactionPauseMs = DEFAULT_INTERACTION_PAUSE_MS,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  settleBatchCount = DEFAULT_SETTLE_BATCH_COUNT,
  scrollStepRatio = DEFAULT_SCROLL_STEP_RATIO,
}: BoardScannerOptions): BoardScanner {
  const view = document.defaultView
  const pinsById = new Map<string, PinAsset>()
  const repeatedPinIds = new Set<string>()
  const skippedKeys = new Set<string>()
  const progressListeners = new Set<BoardScannerProgressListener>()
  let snapshot = createInitialSnapshot(Date.now())
  let scanContextIdentity = ''
  let timer: ReturnType<typeof setTimeout> | undefined
  let userActiveUntil = 0
  let pointerActive = false
  let touchActive = false
  let idleAtBottomBatches = 0
  let destroyed = false

  const cloneSnapshot = (): BoardScanSnapshot => ({
    ...snapshot,
    pins: Array.from(pinsById.values()),
  })

  const emit = (newPins: PinAsset[] = []) => {
    snapshot.updatedAt = Date.now()
    snapshot.pinCount = pinsById.size
    const progress = createProgress(snapshot)
    onProgress?.(progress, newPins)
    for (const listener of progressListeners) listener(progress, newPins)
  }

  const clearTimer = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  const finish = (status: 'completed' | 'stopped' | 'error', reason: BoardScanCompletionReason, error?: string) => {
    clearTimer()
    snapshot.status = status
    snapshot.reason = reason
    snapshot.error = error
    emit()
  }

  const scheduleBatch = () => {
    clearTimer()
    if (destroyed || (snapshot.status !== 'scanning' && snapshot.status !== 'paused')) return
    timer = setTimeout(runBatch, batchIntervalMs)
  }

  const runBatch = () => {
    if (destroyed || (snapshot.status !== 'scanning' && snapshot.status !== 'paused')) return

    const pageUrl = view?.location.href ?? snapshot.context?.pageUrl ?? ''
    const currentContext = parsePinterestPageContext(document, pageUrl)
    if (contextIdentity(currentContext) !== scanContextIdentity) {
      finish('stopped', 'page-changed')
      return
    }

    const report = extractPinterestPage(document, pageUrl)
    const newPins: PinAsset[] = []
    for (const pin of report.pins) {
      if (pinsById.has(pin.pinId)) {
        repeatedPinIds.add(pin.pinId)
      } else {
        pinsById.set(pin.pinId, pin)
        newPins.push(pin)
      }
    }
    for (const skipped of report.skipped) {
      skippedKeys.add(`${skipped.pinId}:${skipped.reason}`)
    }

    const metrics = getScrollMetrics(document)
    snapshot.batchCount += 1
    snapshot.duplicateCount = repeatedPinIds.size
    snapshot.skippedCount = skippedKeys.size
    snapshot.scrollTop = metrics.top
    snapshot.scrollHeight = metrics.height

    if (Date.now() - (snapshot.startedAt ?? 0) >= maxDurationMs) {
      finish('completed', 'timeout')
      return
    }

    if (pointerActive || touchActive || Date.now() < userActiveUntil || document.visibilityState === 'hidden') {
      snapshot.status = 'paused'
      emit(newPins)
      scheduleBatch()
      return
    }

    snapshot.status = 'scanning'
    const maxTop = Math.max(0, metrics.height - metrics.viewport)
    const atBottom = metrics.top >= maxTop - 2
    if (atBottom && newPins.length === 0) {
      idleAtBottomBatches += 1
      if (idleAtBottomBatches >= settleBatchCount) {
        finish('completed', 'settled')
        return
      }
    } else {
      idleAtBottomBatches = 0
    }

    if (!atBottom) {
      const nextTop = Math.min(maxTop, metrics.top + metrics.viewport * scrollStepRatio)
      view?.scrollTo({ top: nextTop, behavior: 'auto' })
      snapshot.scrollTop = nextTop
    }

    emit(newPins)
    scheduleBatch()
  }

  const markUserInteraction = () => {
    if (snapshot.status !== 'scanning' && snapshot.status !== 'paused') return
    userActiveUntil = Date.now() + interactionPauseMs
    snapshot.status = 'paused'
    emit()
  }

  const beginPointerInteraction = () => {
    pointerActive = true
    markUserInteraction()
  }
  const endPointerInteraction = () => {
    pointerActive = false
    markUserInteraction()
  }
  const beginTouchInteraction = () => {
    touchActive = true
    markUserInteraction()
  }
  const endTouchInteraction = () => {
    touchActive = false
    markUserInteraction()
  }

  view?.addEventListener('pointerdown', beginPointerInteraction, { capture: true, passive: true })
  view?.addEventListener('pointerup', endPointerInteraction, { capture: true, passive: true })
  view?.addEventListener('pointercancel', endPointerInteraction, { capture: true, passive: true })
  view?.addEventListener('touchstart', beginTouchInteraction, { capture: true, passive: true })
  view?.addEventListener('touchend', endTouchInteraction, { capture: true, passive: true })
  view?.addEventListener('touchcancel', endTouchInteraction, { capture: true, passive: true })
  view?.addEventListener('wheel', markUserInteraction, { capture: true, passive: true })
  view?.addEventListener('keydown', markUserInteraction, { capture: true, passive: true })

  return {
    subscribe: (listener) => {
      if (destroyed) return () => undefined
      progressListeners.add(listener)
      return () => progressListeners.delete(listener)
    },
    start: () => {
      if (snapshot.status === 'scanning' || snapshot.status === 'paused') return cloneSnapshot()

      const pageUrl = view?.location.href ?? ''
      const context = parsePinterestPageContext(document, pageUrl)
      pinsById.clear()
      repeatedPinIds.clear()
      skippedKeys.clear()
      idleAtBottomBatches = 0
      userActiveUntil = 0
      pointerActive = false
      touchActive = false
      snapshot = {
        ...createInitialSnapshot(Date.now()),
        scanId: createScanId(),
        context,
        status: 'scanning',
        startedAt: Date.now(),
      }

      if (!isSupportedContext(context)) {
        finish('error', 'unsupported-page', 'Chỉ có thể quét trang board hoặc section Pinterest.')
        return cloneSnapshot()
      }

      scanContextIdentity = contextIdentity(context)
      runBatch()
      return cloneSnapshot()
    },
    stop: () => {
      if (snapshot.status === 'scanning' || snapshot.status === 'paused') {
        finish('stopped', 'stopped')
      }
      return cloneSnapshot()
    },
    getSnapshot: cloneSnapshot,
    destroy: () => {
      destroyed = true
      clearTimer()
      progressListeners.clear()
      view?.removeEventListener('pointerdown', beginPointerInteraction, true)
      view?.removeEventListener('pointerup', endPointerInteraction, true)
      view?.removeEventListener('pointercancel', endPointerInteraction, true)
      view?.removeEventListener('touchstart', beginTouchInteraction, true)
      view?.removeEventListener('touchend', endTouchInteraction, true)
      view?.removeEventListener('touchcancel', endTouchInteraction, true)
      view?.removeEventListener('wheel', markUserInteraction, true)
      view?.removeEventListener('keydown', markUserInteraction, true)
    },
  }
}
