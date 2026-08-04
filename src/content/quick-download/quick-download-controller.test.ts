import { readFileSync } from 'node:fs'

import { Window } from 'happy-dom'
import { describe, expect, it, vi } from 'vitest'

import { createQuickDownloadController } from './quick-download-controller'

const fixtureUrl = new URL('../../../tests/fixtures/', import.meta.url)

function loadFixture(name: string): { document: Document; window: Window } {
  const window = new Window({ url: 'https://www.pinterest.com/' })
  const html = readFileSync(new URL(name, fixtureUrl), 'utf8')
  window.document.write(html)

  return { document: window.document as unknown as Document, window }
}

function getControl(document: Document) {
  const host = document.querySelector<HTMLElement>('[data-pinoria-quick-download-host]')
  const button = host?.shadowRoot?.querySelector<HTMLButtonElement>('button')

  if (!host || !button) throw new Error('Quick-download control was not mounted')
  return { host, button }
}

async function flush(window: Window, duration = 0): Promise<void> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, duration))
}

describe('createQuickDownloadController', () => {
  it('mounts one square overlay at the bottom-right of the Pin media', () => {
    const { document } = loadFixture('image-pin.html')
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })

    controller.start()
    controller.scan()

    const { host, button } = getControl(document)
    const mediaLink = document.querySelector('a[href*="/pin/"]')
    expect(document.querySelectorAll('[data-pinoria-quick-download-host]')).toHaveLength(1)
    expect(host.parentElement).toBe(mediaLink)
    expect(host.dataset.placement).toBe('media-overlay')
    expect(host.style.right).toBe('12px')
    expect(host.style.bottom).toBe('12px')
    expect(host.style.zIndex).toBe('2147483647')
    expect(button.style.getPropertyValue('--pk-control-size')).toBe('40px')
    expect(button.style.getPropertyValue('--pk-control-radius')).toBe('12px')
    expect(button.style.getPropertyValue('--pk-control-background')).toBe('#e60023')
    expect(button.style.getPropertyValue('--pk-control-color')).toBe('#ffffff')
    controller.stop()
  })

  it('renders hover tooltips in a fixed body portal above every Pin stacking context', () => {
    const { document, window } = loadFixture('image-pin.html')
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })
    controller.start()

    const { button } = getControl(document)
    button.dispatchEvent(new window.PointerEvent('pointerenter') as unknown as Event)
    const tooltipHost = document.querySelector<HTMLElement>('[data-pinoria-tooltip-host]')
    const tooltip = tooltipHost?.shadowRoot?.querySelector<HTMLElement>('[role="tooltip"]')
    expect(tooltipHost?.parentElement).toBe(document.body)
    expect(tooltipHost?.style.position).toBe('fixed')
    expect(tooltipHost?.style.zIndex).toBe('2147483647')
    expect(tooltip?.textContent).toContain('Downloads/Pinoria')

    button.dispatchEvent(new window.PointerEvent('pointerleave') as unknown as Event)
    expect(tooltipHost?.style.display).toBe('none')
    controller.stop()
  })

  it('uses the bottom-right corner when the Pin has no Share action', () => {
    const { document } = loadFixture('image-pin.html')
    document.querySelector('[data-test-id="pointer-events-wrapper"]')?.remove()
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })

    controller.start()

    expect(getControl(document).host.style.right).toBe('12px')
    controller.stop()
  })

  it('keeps the media overlay when Share appears on hover', async () => {
    const { document, window } = loadFixture('image-pin.html')
    const card = document.querySelector('[data-test-id="pin"]')
    const pointerEventsWrapper = document.querySelector('[data-test-id="pointer-events-wrapper"]')
    pointerEventsWrapper?.remove()
    const controller = createQuickDownloadController({
      document,
      mutationDebounceMs: 0,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })

    controller.start()
    expect(getControl(document).host.dataset.placement).toBe('media-overlay')

    if (pointerEventsWrapper) card?.append(pointerEventsWrapper)
    await flush(window, 5)

    const { host } = getControl(document)
    expect(host.dataset.placement).toBe('media-overlay')
    expect(host.parentElement).toBe(document.querySelector('a[href*="/pin/"]'))
    expect(host.style.position).toBe('absolute')
    expect(host.style.right).toBe('12px')
    expect(host.style.bottom).toBe('12px')
    controller.stop()
  })

  it('shows loading immediately and success after the download resolves', async () => {
    const { document, window } = loadFixture('image-pin.html')
    let resolveDownload: (() => void) | undefined
    const onQuickDownload = vi.fn(
      () => new Promise<void>((resolve) => (resolveDownload = resolve)),
    )
    const controller = createQuickDownloadController({ document, onQuickDownload })
    controller.start()

    const { button } = getControl(document)
    button.click()

    expect(button.dataset.state).toBe('loading')
    expect(onQuickDownload).toHaveBeenCalledWith(
      expect.objectContaining({ pinId: '111111111111' }),
      expect.objectContaining({ color: '#e60023', folder: 'Pinoria' }),
    )

    resolveDownload?.()
    await flush(window)
    expect(button.dataset.state).toBe('success')
    controller.stop()
  })

  it('refreshes media at click time when Pinterest replaces a thumbnail with video', async () => {
    const { document, window } = loadFixture('image-pin.html')
    const onQuickDownload = vi.fn().mockResolvedValue(undefined)
    const controller = createQuickDownloadController({ document, onQuickDownload })
    controller.start()

    const image = document.querySelector('a[href*="/pin/"] img')
    const video = document.createElement('video')
    video.dataset.hasAudio = 'true'
    video.setAttribute('width', '720')
    video.setAttribute('height', '1280')
    const source = document.createElement('source')
    source.setAttribute('src', 'https://v.pinimg.com/videos/720p/replaced-video.mp4')
    source.setAttribute('type', 'video/mp4')
    video.append(source)
    image?.replaceWith(video)

    getControl(document).button.click()
    await flush(window)

    expect(onQuickDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        media: [expect.objectContaining({ type: 'video', audio: 'muxed' })],
      }),
      expect.objectContaining({ folder: 'Pinoria' }),
    )
    controller.stop()
  })

  it('renders every download target and sends the folder for the selected color', async () => {
    const { document, window } = loadFixture('image-pin.html')
    const onQuickDownload = vi.fn().mockResolvedValue(undefined)
    const downloadTargets = [
      { id: 'photos', folder: 'Pinoria/Ảnh', color: '#0066cc' },
      { id: 'ideas', folder: 'Pinoria/Ý tưởng', color: '#008753' },
    ]
    const controller = createQuickDownloadController({
      document,
      downloadTargets,
      onQuickDownload,
    })
    controller.start()

    const host = document.querySelector<HTMLElement>('[data-pinoria-quick-download-host]')
    const buttons = host?.shadowRoot?.querySelectorAll<HTMLButtonElement>('button')
    expect(buttons).toHaveLength(2)
    expect(buttons?.item(0).style.getPropertyValue('--pk-control-background')).toBe('#0066cc')
    expect(buttons?.item(1).style.getPropertyValue('--pk-control-background')).toBe('#008753')

    buttons?.item(1).click()
    await flush(window)

    expect(onQuickDownload).toHaveBeenCalledWith(
      expect.objectContaining({ pinId: '111111111111' }),
      downloadTargets[1],
    )
    controller.stop()
  })

  it('shows an accessible error state when the download rejects', async () => {
    const { document, window } = loadFixture('image-pin.html')
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockRejectedValue(new Error('Không thể tải video có audio riêng')),
    })
    controller.start()

    const { button } = getControl(document)
    button.click()
    await flush(window)

    expect(button.dataset.state).toBe('error')
    expect(button.getAttribute('aria-label')).toBe('Tải vào Downloads/Pinoria thất bại')
    const tooltipHost = document.querySelector<HTMLElement>('[data-pinoria-tooltip-host]')
    const tooltip = tooltipHost?.shadowRoot?.querySelector<HTMLElement>('[role="tooltip"]')
    expect(tooltip?.textContent).toBe('Không thể tải video có audio riêng')
    const feedbackHost = document.querySelector<HTMLElement>('[data-pinoria-feedback-host]')
    const alert = feedbackHost?.shadowRoot?.querySelector<HTMLElement>('[role="alert"]')
    expect(feedbackHost?.parentElement).toBe(document.body)
    expect(feedbackHost?.style.position).toBe('fixed')
    expect(feedbackHost?.style.zIndex).toBe('2147483647')
    expect(alert?.textContent).toContain('Không thể tải video có audio riêng')
    controller.stop()
    expect(document.querySelector('[data-pinoria-feedback-host]')).toBeNull()
  })

  it('prevents the download click from opening or selecting the Pin card', async () => {
    const { document, window } = loadFixture('image-pin.html')
    const card = document.querySelector('[data-test-id="pin"]')
    const cardClick = vi.fn()
    card?.addEventListener('click', cardClick)
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })
    controller.start()

    getControl(document).button.click()
    await flush(window)

    expect(cardClick).not.toHaveBeenCalled()
    controller.stop()
  })

  it('blocks Pinterest capture-phase navigation while starting one download', async () => {
    const { document, window } = loadFixture('image-pin.html')
    const card = document.querySelector('[data-test-id="pin"]')
    const pinNavigation = vi.fn()
    document.addEventListener(
      'click',
      (event) => {
        if (card && event.composedPath().includes(card)) pinNavigation()
      },
      true,
    )
    const onQuickDownload = vi.fn().mockResolvedValue(undefined)
    const controller = createQuickDownloadController({ document, onQuickDownload })
    controller.start()

    getControl(document).button.click()
    await flush(window)

    expect(pinNavigation).not.toHaveBeenCalled()
    expect(onQuickDownload).toHaveBeenCalledTimes(1)
    controller.stop()
  })

  it('observes Pins appended by the infinite feed without duplicating controls', async () => {
    const window = new Window({ url: 'https://www.pinterest.com/' })
    const document = window.document as unknown as Document
    document.body.innerHTML = '<main data-test-id="home-feed"></main>'
    const controller = createQuickDownloadController({
      document,
      mutationDebounceMs: 0,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })
    controller.start()

    const wrapper = document.createElement('div')
    wrapper.innerHTML = readFileSync(new URL('image-pin.html', fixtureUrl), 'utf8')
    document.querySelector('main')?.append(...Array.from(wrapper.querySelectorAll('article')))
    await flush(window, 5)

    expect(document.querySelectorAll('[data-pinoria-quick-download-host]')).toHaveLength(1)
    controller.scan()
    expect(document.querySelectorAll('[data-pinoria-quick-download-host]')).toHaveLength(1)
    controller.stop()
  })

  it('ignores promoted and unavailable Pins and includes reduced-motion CSS', () => {
    const { document } = loadFixture('filtering.html')
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })
    controller.start()

    const { host } = getControl(document)
    expect(document.querySelectorAll('[data-pinoria-quick-download-host]')).toHaveLength(1)
    expect(host.shadowRoot?.querySelector('style')?.textContent).toContain('prefers-reduced-motion')
    expect(host.shadowRoot?.querySelector('[aria-live="polite"]')).not.toBeNull()
    controller.stop()
  })

  it('mounts once when Pinterest nests multiple semantic Pin containers', () => {
    const window = new Window({ url: 'https://www.pinterest.com/' })
    const document = window.document as unknown as Document
    document.body.innerHTML = `
      <article data-test-id="pin">
        <div role="listitem">
          <a href="/pin/121212121212/">
            <img width="736" height="980" alt="Nested Pin" src="https://i.pinimg.com/736x/12/12/12/nested.jpg" />
          </a>
        </div>
      </article>
    `
    const controller = createQuickDownloadController({
      document,
      onQuickDownload: vi.fn().mockResolvedValue(undefined),
    })

    controller.start()

    expect(document.querySelectorAll('[data-pinoria-quick-download-host]')).toHaveLength(1)
    controller.stop()
  })
})
