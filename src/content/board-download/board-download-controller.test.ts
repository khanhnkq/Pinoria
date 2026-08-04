import { Window } from 'happy-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createBoardDownloadController } from './board-download-controller'

function createWindow(url: string) {
  const window = new Window({ url })
  const document = window.document as unknown as Document
  return { document, window }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('createBoardDownloadController', () => {
  it('mounts the download button only on a board or section', () => {
    const board = createWindow('https://www.pinterest.com/khanh/design/')
    board.document.body.innerHTML = `
      <main>
        <div data-test-id="board-title"><h1>Design</h1></div>
        <div data-test-id="board-search-row">
          <div data-test-id="board-search"><input placeholder="Search this board" /></div>
          <button aria-label="Filter"></button>
        </div>
      </main>
    `
    const boardController = createBoardDownloadController({
      document: board.document,
      onDownloadBoard: async () => ({ downloaded: 1, failed: 0, total: 1 }),
    })

    boardController.start()
    const boardHost = board.document.querySelector<HTMLElement>('[data-pinoria-board-download-host]')
    expect(boardHost?.shadowRoot?.querySelector('button')?.textContent).toContain('Tải board')
    boardController.stop()

    const home = createWindow('https://www.pinterest.com/')
    home.document.body.innerHTML = '<main><h1>Home</h1></main>'
    const homeController = createBoardDownloadController({
      document: home.document,
      onDownloadBoard: async () => ({ downloaded: 1, failed: 0, total: 1 }),
    })
    homeController.start()

    expect(home.document.querySelector('[data-pinoria-board-download-host]')).toBeNull()
    homeController.stop()
  })

  it('places the button after the search bar and before the filter action', () => {
    const { document } = createWindow('https://www.pinterest.com/khanh/design/')
    document.body.innerHTML = `
      <main>
        <h1>Design</h1>
        <div data-test-id="board-search-row">
          <div class="search-shell"><input placeholder="Search this board" /></div>
          <div class="filter-shell"><button aria-label="Filter"></button></div>
        </div>
      </main>
    `
    const controller = createBoardDownloadController({
      document,
      onDownloadBoard: async () => ({ downloaded: 1, failed: 0, total: 1 }),
    })

    controller.start()

    const row = document.querySelector('[data-test-id="board-search-row"]')
    const children = Array.from(row?.children ?? [])
    expect(children[1]?.hasAttribute('data-pinoria-board-download-host')).toBe(true)
    expect(children[2]?.classList.contains('filter-shell')).toBe(true)
    controller.stop()
  })

  it('downloads directly and displays live progress on the button', async () => {
    const { document } = createWindow('https://www.pinterest.com/khanh/design/')
    document.body.innerHTML = `
      <main>
        <div data-test-id="board-search-row">
          <div><input placeholder="Search this board" /></div>
          <button aria-label="Filter"></button>
        </div>
      </main>
    `
    let reportProgress: ((progress: {
      stage: 'scanning' | 'downloading'
      scanned: number
      completed: number
      failed: number
      total: number
    }) => void) | undefined
    let finish: ((value: { downloaded: number; failed: number; total: number }) => void) | undefined
    const onDownloadBoard = vi.fn((onProgress: typeof reportProgress) => new Promise<{
      downloaded: number
      failed: number
      total: number
    }>((resolve) => {
      reportProgress = onProgress
      finish = resolve
    }))
    const controller = createBoardDownloadController({ document, onDownloadBoard })
    controller.start()
    const button = document
      .querySelector<HTMLElement>('[data-pinoria-board-download-host]')
      ?.shadowRoot
      ?.querySelector<HTMLButtonElement>('button')

    button?.click()
    reportProgress?.({ stage: 'scanning', scanned: 5, completed: 0, failed: 0, total: 5 })
    expect(button?.textContent).toContain('Đang quét 5')
    reportProgress?.({ stage: 'downloading', scanned: 5, completed: 3, failed: 0, total: 5 })
    expect(button?.textContent).toContain('Đang tải 3/5')
    finish?.({ downloaded: 5, failed: 0, total: 5 })
    await Promise.resolve()

    expect(onDownloadBoard).toHaveBeenCalledTimes(1)
    expect(button?.textContent).toContain('Đã tải 5')
    controller.stop()
  })

  it('removes the board control after navigating away', () => {
    const { document, window } = createWindow('https://www.pinterest.com/khanh/design/')
    document.body.innerHTML = `
      <main>
        <div data-test-id="board-search-row">
          <div><input placeholder="Search this board" /></div>
          <button aria-label="Filter"></button>
        </div>
      </main>
    `
    const controller = createBoardDownloadController({
      document,
      onDownloadBoard: async () => ({ downloaded: 1, failed: 0, total: 1 }),
    })
    controller.start()

    window.history.pushState({}, '', '/')
    controller.scan()

    expect(document.querySelector('[data-pinoria-board-download-host]')).toBeNull()
    controller.stop()
  })
})
