import { parsePinterestPageContext } from '../../core'
import { PINTEREST_SELECTORS } from '../../core/extractors/pinterest-selectors'
import type { BoardDownloadProgress, BoardDownloadResult } from './download-board'

export interface BoardDownloadControllerOptions {
  document: Document
  mutationDebounceMs?: number
  onDownloadBoard: (
    onProgress: (progress: BoardDownloadProgress) => void,
  ) => Promise<BoardDownloadResult>
}

export interface BoardDownloadController {
  download: () => Promise<void>
  scan: () => void
  start: () => void
  stop: () => void
}

const BOARD_BUTTON_STYLES = `
  :host {
    display: inline-flex;
    margin-inline-start: 12px;
    align-self: center;
    flex: 0 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; }

  button {
    all: unset;
    min-height: 48px;
    min-width: 132px;
    padding: 0 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 16px;
    background: #e60023;
    color: #ffffff;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    transition: background-color 140ms ease, transform 140ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  button:hover { background: #ad081b; }
  button:active { transform: scale(0.96); }
  button:focus-visible { outline: 3px solid #4a90e2; outline-offset: 2px; }
  button:disabled { cursor: progress; opacity: 0.92; }

  svg {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .spinner, .check { display: none; }
  button[data-state="working"] .download,
  button[data-state="success"] .download { display: none; }
  button[data-state="working"] .spinner { display: block; animation: pk-spin 700ms linear infinite; }
  button[data-state="success"] .check { display: block; }

  @keyframes pk-spin { to { transform: rotate(360deg); } }

  @media (prefers-reduced-motion: reduce) {
    button { transition: none; }
    button[data-state="working"] .spinner { animation: none; }
  }
`

function getContext(document: Document) {
  return parsePinterestPageContext(document, document.defaultView?.location.href)
}

function isSupportedBoard(document: Document): boolean {
  const context = getContext(document)
  return context.kind === 'board' || context.kind === 'section'
}

function hasBoardFilterControl(element: Element): boolean {
  return (
    element.matches(
      '[data-test-id*="filter" i], button[aria-label*="filter" i], [role="button"][aria-label*="filter" i]',
    ) ||
    element.querySelector(
      '[data-test-id*="filter" i], button[aria-label*="filter" i], [role="button"][aria-label*="filter" i]',
    ) !== null
  )
}

function getBoardSearchAnchor(document: Document): HTMLElement | undefined {
  const input = document.querySelector<HTMLElement>(
    PINTEREST_SELECTORS.boardSearchInputs.join(','),
  )
  if (!input) return undefined

  let current: HTMLElement = input
  let semanticFallback = input.parentElement ?? input
  for (let depth = 0; depth < 8; depth += 1) {
    if (
      current.matches(
        'form, [role="search"], [data-test-id*="board-search" i], [data-test-id*="search-box" i]',
      )
    ) {
      semanticFallback = current
    }

    const parent = current.parentElement
    if (!parent) break
    const siblings = Array.from(parent.children).filter((child) => child !== current)
    if (siblings.some(hasBoardFilterControl)) return current
    current = parent
  }

  return semanticFallback
}

function progressLabel(progress: BoardDownloadProgress): string {
  if (progress.stage === 'scanning') return `Đang quét ${progress.scanned}`
  return `Đang tải ${progress.completed + progress.failed}/${progress.total}`
}

export function createBoardDownloadController({
  document,
  mutationDebounceMs = 80,
  onDownloadBoard,
}: BoardDownloadControllerOptions): BoardDownloadController {
  const view = document.defaultView
  let buttonHost: HTMLElement | undefined
  let button: HTMLButtonElement | undefined
  let buttonLabel: HTMLElement | undefined
  let observer: MutationObserver | undefined
  let mutationTimer: number | undefined
  let resetTimer: number | undefined
  let started = false
  let downloading = false

  const setButtonState = (
    state: 'idle' | 'working' | 'success' | 'error',
    label = state === 'error' ? 'Thử lại' : 'Tải board',
  ) => {
    if (!button || !buttonLabel) return
    button.dataset.state = state
    button.disabled = state === 'working'
    button.setAttribute('aria-busy', state === 'working' ? 'true' : 'false')
    buttonLabel.textContent = label
  }

  const scheduleReset = () => {
    if (resetTimer !== undefined) view?.clearTimeout(resetTimer)
    resetTimer = view?.setTimeout(() => setButtonState('idle'), 3000)
  }

  const download = async () => {
    if (downloading || !isSupportedBoard(document)) return
    downloading = true
    if (resetTimer !== undefined) view?.clearTimeout(resetTimer)
    setButtonState('working', 'Đang quét 0')
    try {
      const result = await onDownloadBoard((progress) => {
        setButtonState('working', progressLabel(progress))
      })
      const suffix = result.failed > 0 ? ` (${result.failed} lỗi)` : ''
      setButtonState('success', `Đã tải ${result.downloaded}${suffix}`)
      scheduleReset()
    } catch {
      setButtonState('error')
      scheduleReset()
    } finally {
      downloading = false
    }
  }

  const handleButtonClick = (event: Event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
    event.stopPropagation()
    void download()
  }

  const unmountButton = () => {
    button?.removeEventListener('click', handleButtonClick, true)
    buttonHost?.remove()
    button = undefined
    buttonHost = undefined
    buttonLabel = undefined
  }

  const mountButton = (searchAnchor: HTMLElement) => {
    const host = document.createElement('span')
    host.setAttribute('data-pinoria-board-download-host', '')
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>${BOARD_BUTTON_STYLES}</style>
      <button type="button" aria-label="Tải toàn bộ board bằng Pinoria" aria-busy="false" data-state="idle">
        <svg class="download" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" /></svg>
        <svg class="spinner" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-8-8" /></svg>
        <svg class="check" aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>
        <span aria-live="polite">Tải board</span>
      </button>
    `
    button = shadow.querySelector<HTMLButtonElement>('button') ?? undefined
    buttonLabel = shadow.querySelector<HTMLElement>('button span') ?? undefined
    if (!button || !buttonLabel) throw new Error('Không thể tạo nút tải board')
    button.addEventListener('click', handleButtonClick, true)
    buttonHost = host
    searchAnchor.insertAdjacentElement('afterend', host)
  }

  const scan = () => {
    if (!isSupportedBoard(document)) {
      unmountButton()
      return
    }
    if (buttonHost?.isConnected) return
    const searchAnchor = getBoardSearchAnchor(document)
    if (searchAnchor) mountButton(searchAnchor)
  }

  const scheduleScan = () => {
    if (mutationTimer !== undefined) view?.clearTimeout(mutationTimer)
    mutationTimer = view?.setTimeout(scan, mutationDebounceMs)
  }

  return {
    download,
    scan,
    start: () => {
      if (started) return
      started = true
      scan()
      view?.addEventListener('popstate', scheduleScan)
      const MutationObserverConstructor = view?.MutationObserver
      if (!MutationObserverConstructor || !document.body) return
      observer = new MutationObserverConstructor(scheduleScan)
      observer.observe(document.body, { childList: true, subtree: true })
    },
    stop: () => {
      started = false
      observer?.disconnect()
      observer = undefined
      view?.removeEventListener('popstate', scheduleScan)
      if (mutationTimer !== undefined) view?.clearTimeout(mutationTimer)
      if (resetTimer !== undefined) view?.clearTimeout(resetTimer)
      mutationTimer = undefined
      resetTimer = undefined
      unmountButton()
    },
  }
}
