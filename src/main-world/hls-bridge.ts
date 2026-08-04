export interface PinterestHlsResource {
  key: string
  kind: 'master' | 'video' | 'audio'
  url: string
  width?: number
}

const HLS_PATH_PATTERN = /\/([a-f\d]{32})(?:_(?:(\d+)w|(audio)))?\.m3u8$/i

export function parsePinterestHlsUrl(value: string): PinterestHlsResource | undefined {
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:' ||
      (url.hostname !== 'pinimg.com' && !url.hostname.endsWith('.pinimg.com'))
    ) {
      return undefined
    }

    const match = url.pathname.match(HLS_PATH_PATTERN)
    const key = match?.[1]
    if (!key) return undefined

    const width = match[2] ? Number.parseInt(match[2], 10) : undefined
    return {
      key,
      kind: match[3] === 'audio' ? 'audio' : width ? 'video' : 'master',
      url: url.href,
      ...(width ? { width } : {}),
    }
  } catch {
    return undefined
  }
}

function visibleArea(element: Element): number {
  const rect = element.getBoundingClientRect()
  const visibleWidth = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0))
  const visibleHeight = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0))
  return visibleWidth * visibleHeight
}

function selectActiveHlsVideo(): HTMLVideoElement | undefined {
  return Array.from(
    document.querySelectorAll<HTMLVideoElement>('video[data-test-id="duplo-hls-video"]'),
  )
    .filter((video) => video.isConnected)
    .sort((left, right) => {
      const score = (video: HTMLVideoElement) =>
        (!video.paused ? 1_000_000_000 : 0) +
        (video.closest(':hover') ? 100_000_000 : 0) +
        visibleArea(video)
      return score(right) - score(left)
    })[0]
}

function installHlsBridge(): void {
  if (typeof PerformanceObserver === 'undefined') return
  const videosByResourceKey = new Map<string, HTMLVideoElement>()

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = parsePinterestHlsUrl(entry.name)
      if (!resource) continue

      let video = videosByResourceKey.get(resource.key)
      if (!video?.isConnected) {
        video = selectActiveHlsVideo()
        if (!video) continue
        videosByResourceKey.set(resource.key, video)
      }

      if (resource.kind === 'audio') {
        video.dataset.pinoriaHlsAudioUrl = resource.url
      } else if (resource.kind === 'master') {
        video.dataset.pinoriaHlsMasterUrl = resource.url
      } else {
        const currentWidth = Number.parseInt(video.dataset.pinoriaHlsVideoWidth ?? '0', 10)
        if ((resource.width ?? 0) >= currentWidth) {
          video.dataset.pinoriaHlsVideoUrl = resource.url
          video.dataset.pinoriaHlsVideoWidth = String(resource.width ?? 0)
        }
      }
    }
  })

  observer.observe({ type: 'resource', buffered: true })
}

if (typeof document !== 'undefined') installHlsBridge()
