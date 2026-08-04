import {
  extractPinterestPage,
  getDefaultDownloadTargets,
  normalizeDownloadTargets,
  PINTEREST_SELECTORS,
  type DownloadTarget,
  type PinAsset,
} from '../../core'
import { selectorList } from '../../core/extractors/pinterest-selectors'
import { QUICK_DOWNLOAD_STYLES } from './quick-download-styles'

type ControlState = 'idle' | 'loading' | 'success' | 'error'

interface MountedAction {
  button: HTMLButtonElement
  focused: boolean
  hovered: boolean
  message: string
  state: ControlState
  target: DownloadTarget
}

interface MountedControl {
  actions: MountedAction[]
  card: HTMLElement
  host: HTMLElement
  activate: (targetId: string) => void
  destroy: () => void
}

interface ErrorToast {
  show: (message: string) => void
  destroy: () => void
}

interface HoverTooltip {
  destroy: () => void
  hide: (anchor?: HTMLElement) => void
  show: (message: string, anchor: HTMLElement) => void
}

export interface QuickDownloadControllerOptions {
  document: Document
  downloadTargets?: DownloadTarget[]
  onQuickDownload: (pin: PinAsset, target: DownloadTarget) => Promise<void>
  mutationDebounceMs?: number
  feedbackDurationMs?: number
}

export interface QuickDownloadController {
  scan: () => void
  setDownloadTargets: (targets: DownloadTarget[]) => void
  start: () => void
  stop: () => void
}

const ICONS = `
  <svg class="icon icon-download" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
  </svg>
  <svg class="icon icon-loading" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <g class="spinner-graphic"><path d="M21 12a9 9 0 1 1-5.3-8.2" /></g>
  </svg>
  <svg class="icon icon-success" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="m5 12 4 4L19 6" />
  </svg>
  <svg class="icon icon-error" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <path d="M12 8v5m0 4h.01" /><circle cx="12" cy="12" r="9" />
  </svg>
`

const ERROR_TOAST_STYLES = `
  :host { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  *, *::before, *::after { box-sizing: border-box; }
  [role="alert"] {
    align-items: center; background: #111111; border-radius: 16px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28); color: #ffffff;
    display: flex; font-size: 14px; font-weight: 600; gap: 10px;
    justify-content: center; line-height: 1.35; margin: 0 auto;
    max-width: 440px; min-height: 48px; padding: 12px 16px; text-align: left;
  }
  svg { color: #ff4d4f; flex: 0 0 auto; height: 20px; width: 20px; }
  @media (prefers-reduced-motion: no-preference) {
    [role="alert"] { animation: pk-toast-in 160ms ease-out; }
    @keyframes pk-toast-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }
`

const HOVER_TOOLTIP_STYLES = `
  :host { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  *, *::before, *::after { box-sizing: border-box; }
  [role="tooltip"] {
    background: #111111; border-radius: 8px; color: #ffffff;
    font-size: 12px; font-weight: 600; line-height: 1.35; max-width: 260px;
    overflow-wrap: anywhere; padding: 8px 10px; position: fixed; text-align: center;
    width: max-content;
  }
`

function createHoverTooltip(document: Document): HoverTooltip {
  const view = document.defaultView
  const host = document.createElement('span')
  host.setAttribute('data-pinoria-tooltip-host', '')
  Object.assign(host.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    display: 'none',
    zIndex: '2147483647',
  })
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `<style>${HOVER_TOOLTIP_STYLES}</style><span role="tooltip"></span>`
  const bubble = shadow.querySelector<HTMLElement>('[role="tooltip"]')
  document.body.append(host)
  let currentAnchor: HTMLElement | undefined

  return {
    show: (message, anchor) => {
      if (!bubble) return
      currentAnchor = anchor
      bubble.textContent = message
      const rect = anchor.getBoundingClientRect()
      const viewportWidth = view?.innerWidth ?? document.documentElement.clientWidth
      const center = Math.min(Math.max(rect.left + rect.width / 2, 138), Math.max(viewportWidth - 138, 138))
      bubble.style.left = `${center}px`
      if (rect.top >= 64) {
        bubble.style.top = `${rect.top - 8}px`
        bubble.style.transform = 'translate(-50%, -100%)'
      } else {
        bubble.style.top = `${rect.bottom + 8}px`
        bubble.style.transform = 'translate(-50%, 0)'
      }
      host.style.display = 'block'
    },
    hide: (anchor) => {
      if (anchor && currentAnchor !== anchor) return
      currentAnchor = undefined
      host.style.display = 'none'
    },
    destroy: () => host.remove(),
  }
}

function createErrorToast(document: Document, durationMs: number): ErrorToast {
  const view = document.defaultView
  const host = document.createElement('span')
  host.setAttribute('data-pinoria-feedback-host', '')
  Object.assign(host.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    width: 'calc(100vw - 32px)',
    maxWidth: '440px',
    transform: 'translateX(-50%)',
    zIndex: '2147483647',
    pointerEvents: 'none',
    display: 'none',
  })
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>${ERROR_TOAST_STYLES}</style>
    <div role="alert" aria-live="assertive" aria-atomic="true">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M12 8v5m0 4h.01" /><circle cx="12" cy="12" r="9" />
      </svg>
      <span data-message></span>
    </div>
  `
  document.body.append(host)
  const messageElement = shadow.querySelector<HTMLElement>('[data-message]')
  let hideTimer: number | undefined

  return {
    show: (message) => {
      if (hideTimer !== undefined) view?.clearTimeout(hideTimer)
      if (messageElement) messageElement.textContent = message
      host.style.display = 'block'
      hideTimer = view?.setTimeout(() => { host.style.display = 'none' }, Math.max(durationMs, 4000))
    },
    destroy: () => {
      if (hideTimer !== undefined) view?.clearTimeout(hideTimer)
      host.remove()
    },
  }
}

function getPinCards(document: Document): HTMLElement[] {
  const cards = new Set<HTMLElement>()
  const containerSelector = selectorList(PINTEREST_SELECTORS.pinContainers)
  for (const link of document.querySelectorAll<HTMLAnchorElement>(PINTEREST_SELECTORS.pinLinks)) {
    const card = link.closest<HTMLElement>(containerSelector)
    if (card) cards.add(card)
  }
  return Array.from(cards)
}

function getNativeControl(card: HTMLElement): HTMLElement | undefined {
  return card.querySelector<HTMLElement>(selectorList(PINTEREST_SELECTORS.nativeActionControls)) ?? undefined
}

function darkenHexColor(color: string): string {
  const channels = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16))
  return `#${channels.map((channel) => Math.round(channel * 0.78).toString(16).padStart(2, '0')).join('')}`
}

function readableTextColor(color: string): '#111111' | '#ffffff' {
  const channels = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16) / 255)
  const luminance = channels
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
  return luminance > 0.42 ? '#111111' : '#ffffff'
}

function setNativeTokens(
  button: HTMLButtonElement,
  reference: HTMLElement | undefined,
  target: DownloadTarget,
  compact: boolean,
): void {
  const view = button.ownerDocument.defaultView
  const computed = reference && view?.getComputedStyle(reference)
  const computedSize = computed?.width
  const nativeSize = computedSize && Number.parseFloat(computedSize) > 0 ? computedSize : '40px'
  const size = compact ? '36px' : nativeSize

  button.style.setProperty('--pk-control-size', size)
  button.style.setProperty('--pk-control-radius', '12px')
  button.style.setProperty('--pk-control-background', target.color)
  button.style.setProperty('--pk-control-hover-background', darkenHexColor(target.color))
  button.style.setProperty('--pk-control-color', readableTextColor(target.color))
  button.style.setProperty('--pk-control-shadow', computed?.boxShadow || '0 1px 4px rgba(0, 0, 0, 0.16)')
  button.style.setProperty('--pk-control-font', computed?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif')
}

function placeHost(card: HTMLElement, host: HTMLElement): void {
  const view = card.ownerDocument.defaultView
  const mediaSurface = Array.from(card.querySelectorAll<HTMLElement>('a[href*="/pin/"]'))
    .find((link) => link.querySelector('img, picture, video, canvas'))
  const placementSurface = mediaSurface ?? card
  const surfacePosition = view?.getComputedStyle(placementSurface).position
  if (!surfacePosition || surfacePosition === 'static') placementSurface.style.position = 'relative'

  host.dataset.placement = mediaSurface ? 'media-overlay' : 'card-overlay'
  host.style.position = 'absolute'
  host.style.right = '12px'
  host.style.bottom = '12px'
  host.style.zIndex = '2147483647'
  if (host.parentElement !== placementSurface) placementSurface.append(host)
}

function stateLabel(state: ControlState, target: DownloadTarget): string {
  const destination = `Downloads/${target.folder}`
  if (state === 'loading') return `Đang tải vào ${destination}`
  if (state === 'success') return `Đã tải vào ${destination}`
  if (state === 'error') return `Tải vào ${destination} thất bại`
  return `Tải vào ${destination}`
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Không thể bắt đầu tải xuống. Hãy thử lại.'
}

function mountControl(
  card: HTMLElement,
  pin: PinAsset,
  targets: DownloadTarget[],
  onQuickDownload: (pin: PinAsset, target: DownloadTarget) => Promise<void>,
  onError: (message: string) => void,
  hoverTooltip: HoverTooltip,
  feedbackDurationMs: number,
): MountedControl {
  const document = card.ownerDocument
  const view = document.defaultView
  const host = document.createElement('span')
  host.dataset.pinoriaQuickDownloadHost = pin.pinId
  host.setAttribute('data-pinoria-quick-download-host', pin.pinId)
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>${QUICK_DOWNLOAD_STYLES}</style>
    <span class="target-list" role="group" aria-label="Chọn thư mục tải xuống"></span>
    <span class="sr-only" aria-live="polite" aria-atomic="true"></span>
  `
  const targetList = shadow.querySelector<HTMLElement>('.target-list')
  const liveRegion = shadow.querySelector<HTMLElement>('[aria-live="polite"]')
  if (!targetList || !liveRegion) throw new Error('Unable to create quick-download controls')

  const nativeControl = getNativeControl(card)
  const compact = targets.length > 1
  const actions = targets.map((target) => {
    const wrapper = document.createElement('span')
    wrapper.className = 'target-control'
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.state = 'idle'
    button.dataset.targetId = target.id
    button.setAttribute('aria-label', stateLabel('idle', target))
    button.innerHTML = ICONS
    setNativeTokens(button, nativeControl, target, compact)
    wrapper.append(button)
    targetList.append(wrapper)
    return {
      button,
      focused: false,
      hovered: false,
      message: stateLabel('idle', target),
      state: 'idle' as ControlState,
      target,
    }
  })

  placeHost(card, host)
  card.dataset.pinoriaControlMounted = pin.pinId
  const resetTimers = new Map<string, number>()
  const syncTooltip = (action: MountedAction) => {
    if (action.hovered || action.focused || action.state === 'error') {
      hoverTooltip.show(action.message, action.button)
    } else {
      hoverTooltip.hide(action.button)
    }
  }

  const setState = (action: MountedAction, state: ControlState, message = stateLabel(state, action.target)) => {
    action.state = state
    action.message = message
    action.button.dataset.state = state
    action.button.setAttribute('aria-label', stateLabel(state, action.target))
    action.button.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false')
    liveRegion.textContent = message
    syncTooltip(action)
  }

  const activate = (targetId: string) => {
    const action = actions.find(({ target }) => target.id === targetId)
    if (!action || action.button.dataset.state === 'loading') return
    const priorTimer = resetTimers.get(targetId)
    if (priorTimer !== undefined) view?.clearTimeout(priorTimer)
    setState(action, 'loading')
    const currentPageUrl = view?.location.href || pin.context.pageUrl
    const latestPin = extractPinterestPage(card, currentPageUrl).pins
      .find((candidate) => candidate.pinId === pin.pinId) ?? pin

    void onQuickDownload(latestPin, action.target)
      .then(() => setState(action, 'success'))
      .catch((error: unknown) => {
        const message = getErrorMessage(error)
        setState(action, 'error', message)
        onError(message)
      })
      .finally(() => {
        const timer = view?.setTimeout(() => {
          setState(action, 'idle')
          resetTimers.delete(targetId)
        }, feedbackDurationMs)
        if (timer !== undefined) resetTimers.set(targetId, timer)
      })
  }

  for (const action of actions) {
    action.button.addEventListener('pointerenter', () => {
      action.hovered = true
      syncTooltip(action)
    })
    action.button.addEventListener('pointerleave', () => {
      action.hovered = false
      syncTooltip(action)
    })
    action.button.addEventListener('focus', () => {
      action.focused = true
      syncTooltip(action)
    })
    action.button.addEventListener('blur', () => {
      action.focused = false
      syncTooltip(action)
    })
    action.button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      activate(action.target.id)
    })
  }

  return {
    actions,
    card,
    host,
    activate,
    destroy: () => {
      for (const timer of resetTimers.values()) view?.clearTimeout(timer)
      resetTimers.clear()
      for (const action of actions) hoverTooltip.hide(action.button)
      delete card.dataset.pinoriaControlMounted
      host.remove()
    },
  }
}

export function createQuickDownloadController({
  document,
  downloadTargets = getDefaultDownloadTargets(),
  onQuickDownload,
  mutationDebounceMs = 48,
  feedbackDurationMs = 1600,
}: QuickDownloadControllerOptions): QuickDownloadController {
  const controls = new Set<MountedControl>()
  const mountedCards = new WeakMap<HTMLElement, MountedControl>()
  const mountedActions = new WeakMap<EventTarget, { control: MountedControl; targetId: string }>()
  const view = document.defaultView
  const initialTargets = normalizeDownloadTargets(downloadTargets)
  let currentTargets = initialTargets.length > 0 ? initialTargets : getDefaultDownloadTargets()
  let mutationTimer: number | undefined
  let observer: MutationObserver | undefined
  let errorToast: ErrorToast | undefined
  let hoverTooltip: HoverTooltip | undefined
  let started = false

  const showError = (message: string) => {
    if (!document.body) return
    errorToast ??= createErrorToast(document, feedbackDurationMs)
    errorToast.show(message)
  }

  const forgetControl = (control: MountedControl) => {
    for (const action of control.actions) mountedActions.delete(action.button)
    control.destroy()
    controls.delete(control)
  }

  const scan = () => {
    const pageUrl = view?.location.href || 'https://www.pinterest.com/'
    for (const card of getPinCards(document)) {
      const existing = mountedCards.get(card)
      if (existing?.host.isConnected) continue
      if (existing) forgetControl(existing)

      const pin = extractPinterestPage(card, pageUrl).pins[0]
      if (!pin) continue
      const control = mountControl(
        card,
        pin,
        currentTargets,
        onQuickDownload,
        showError,
        hoverTooltip ??= createHoverTooltip(document),
        feedbackDurationMs,
      )
      mountedCards.set(card, control)
      for (const action of control.actions) {
        mountedActions.set(action.button, { control, targetId: action.target.id })
      }
      controls.add(control)
    }
  }

  const guardQuickDownloadEvent = (event: Event) => {
    const mounted = event.composedPath()
      .map((target) => mountedActions.get(target))
      .find((candidate) => candidate !== undefined)
    if (!mounted) return
    event.preventDefault()
    event.stopImmediatePropagation()
    if (event.type === 'click') mounted.control.activate(mounted.targetId)
  }

  const guardedEventNames = [
    'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click',
  ] as const

  const scheduleScan = () => {
    if (mutationTimer !== undefined) view?.clearTimeout(mutationTimer)
    mutationTimer = view?.setTimeout(scan, mutationDebounceMs)
  }

  return {
    setDownloadTargets: (targets) => {
      const normalizedTargets = normalizeDownloadTargets(targets)
      const nextTargets = normalizedTargets.length > 0 ? normalizedTargets : getDefaultDownloadTargets()
      if (JSON.stringify(nextTargets) === JSON.stringify(currentTargets)) return
      currentTargets = nextTargets
      for (const control of Array.from(controls)) forgetControl(control)
      scan()
    },
    start: () => {
      if (started) return
      started = true
      for (const eventName of guardedEventNames) view?.addEventListener(eventName, guardQuickDownloadEvent, true)
      scan()
      const MutationObserverConstructor = view?.MutationObserver
      if (!MutationObserverConstructor || !document.body) return
      observer = new MutationObserverConstructor((records) => {
        const hasExternalMutation = records.some((record) => Array.from(record.addedNodes).some(
          (node) => node.nodeType !== 1 || !(node as Element).matches('[data-pinoria-quick-download-host]'),
        ))
        if (hasExternalMutation) scheduleScan()
      })
      observer.observe(document.body, { childList: true, subtree: true })
    },
    stop: () => {
      started = false
      observer?.disconnect()
      observer = undefined
      for (const eventName of guardedEventNames) view?.removeEventListener(eventName, guardQuickDownloadEvent, true)
      if (mutationTimer !== undefined) view?.clearTimeout(mutationTimer)
      mutationTimer = undefined
      for (const control of Array.from(controls)) forgetControl(control)
      errorToast?.destroy()
      errorToast = undefined
      hoverTooltip?.destroy()
      hoverTooltip = undefined
    },
    scan,
  }
}
