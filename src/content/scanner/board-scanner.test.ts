import { Window } from 'happy-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createBoardScanner } from './board-scanner'

function pinMarkup(pinId: string): string {
  return `
    <article data-test-id="pin">
      <a href="/pin/${pinId}/" aria-label="Pin ${pinId}">
        <img width="736" height="980" alt="Pin ${pinId}" src="https://i.pinimg.com/736x/${pinId}.jpg" />
      </a>
    </article>
  `
}

function createBoardWindow() {
  const window = new Window({ url: 'https://www.pinterest.com/khanh/design/' })
  const document = window.document as unknown as Document
  document.body.innerHTML = `
    <main data-test-id="board-feed">
      <h1 data-test-id="board-title">Design</h1>
      ${pinMarkup('111111111111')}
    </main>
  `
  let scrollTop = 0
  let scrollHeight = 1200
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 })
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollTop })
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  })
  Object.defineProperty(document.documentElement, 'clientHeight', {
    configurable: true,
    value: 600,
  })
  const scrollTo = vi.fn((options: ScrollToOptions) => {
    scrollTop = Number(options.top ?? 0)
  })
  Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo })

  return {
    document,
    scrollTo,
    setScrollHeight: (value: number) => { scrollHeight = value },
    setScrollTop: (value: number) => { scrollTop = value },
    window,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('createBoardScanner', () => {
  it('scans lazy batches, deduplicates Pin IDs, and completes after the board settles', async () => {
    vi.useFakeTimers()
    const { document, scrollTo, setScrollTop } = createBoardWindow()
    scrollTo.mockImplementationOnce((options: ScrollToOptions) => {
      const root = document.querySelector('main')
      root?.insertAdjacentHTML('beforeend', pinMarkup('222222222222'))
      setScrollTop(Number(options.top ?? 0))
    })
    const progress = vi.fn()
    const scanner = createBoardScanner({
      document,
      onProgress: progress,
      batchIntervalMs: 10,
      settleBatchCount: 2,
    })

    scanner.start()
    await vi.advanceTimersByTimeAsync(80)

    const snapshot = scanner.getSnapshot()
    expect(snapshot.status).toBe('completed')
    expect(snapshot.reason).toBe('settled')
    expect(snapshot.pins.map(({ pinId }) => pinId)).toEqual([
      '111111111111',
      '222222222222',
    ])
    expect(snapshot.duplicateCount).toBe(2)
    expect(progress).toHaveBeenCalled()
    scanner.destroy()
  })

  it('stops immediately without discarding Pins already collected', async () => {
    vi.useFakeTimers()
    const { document, scrollTo, setScrollHeight } = createBoardWindow()
    setScrollHeight(6000)
    const scanner = createBoardScanner({ document, batchIntervalMs: 10 })

    scanner.start()
    const stopped = scanner.stop()
    await vi.advanceTimersByTimeAsync(100)

    expect(stopped.status).toBe('stopped')
    expect(stopped.reason).toBe('stopped')
    expect(stopped.pins.map(({ pinId }) => pinId)).toEqual(['111111111111'])
    expect(scrollTo).toHaveBeenCalledTimes(1)
    scanner.destroy()
  })

  it('pauses auto-scroll while the user interacts and resumes after the quiet period', async () => {
    vi.useFakeTimers()
    const { document, scrollTo, setScrollHeight, window } = createBoardWindow()
    setScrollHeight(6000)
    const scanner = createBoardScanner({
      document,
      batchIntervalMs: 10,
      interactionPauseMs: 50,
    })

    scanner.start()
    const callsBeforeInteraction = scrollTo.mock.calls.length
    window.dispatchEvent(new window.Event('wheel'))
    await vi.advanceTimersByTimeAsync(40)

    expect(scanner.getSnapshot().status).toBe('paused')
    expect(scrollTo).toHaveBeenCalledTimes(callsBeforeInteraction)

    await vi.advanceTimersByTimeAsync(30)
    expect(scanner.getSnapshot().status).toBe('scanning')
    expect(scrollTo.mock.calls.length).toBeGreaterThan(callsBeforeInteraction)
    scanner.destroy()
  })

  it('rejects scanning outside a Pinterest board or section', () => {
    const window = new Window({ url: 'https://www.pinterest.com/' })
    const scanner = createBoardScanner({ document: window.document as unknown as Document })

    expect(scanner.start()).toMatchObject({
      status: 'error',
      reason: 'unsupported-page',
      pinCount: 0,
    })
    scanner.destroy()
  })
})
