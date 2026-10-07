import {
  BufferTarget,
  Conversion,
  HLS_FORMATS,
  Input,
  Mp4OutputFormat,
  Output,
  StreamTarget,
  UrlSource,
  type StreamTargetChunk,
} from 'mediabunny'

import { isPinterestMediaUrl } from '../core'
import {
  MUX_IDLE_MESSAGE,
  isMuxDownloadRequest,
  isMuxReadyRequest,
  isMuxReleaseRequest,
  type MuxDownloadRequest,
  type MuxDownloadResponse,
  type MuxReadyResponse,
} from '../core/messaging/mux-download'

const OBJECT_URL_TTL_MS = 30 * 60 * 1000
const OPFS_DIRECTORY = 'pinoria-media-cache'
const STREAM_CHUNK_SIZE = 4 * 1024 * 1024

interface MuxTargetContext {
  cleanup: () => Promise<void>
  getBlob: () => Promise<Blob>
  target: BufferTarget | StreamTarget
}

interface ActiveObjectUrl {
  cleanup: () => Promise<void>
  cleanupTimer: ReturnType<typeof setTimeout>
}

const activeObjectUrls = new Map<string, ActiveObjectUrl>()
let pendingConversions = 0
let muxQueue: Promise<void> = Promise.resolve()

async function cleanupStaleOpfsFiles(): Promise<void> {
  try {
    const root = await navigator.storage.getDirectory()
    const directory = await root.getDirectoryHandle(OPFS_DIRECTORY)
    for await (const name of directory.keys()) {
      await directory.removeEntry(name).catch(() => undefined)
    }
  } catch {
    // The directory does not exist yet or OPFS is unavailable; both are safe.
  }
}

const staleFileCleanup = cleanupStaleOpfsFiles()

function notifyIdleIfPossible(): void {
  if (pendingConversions > 0 || activeObjectUrls.size > 0) return
  void chrome.runtime.sendMessage({ type: MUX_IDLE_MESSAGE }).catch(() => undefined)
}

async function releaseObjectUrl(objectUrl: string): Promise<void> {
  const activeUrl = activeObjectUrls.get(objectUrl)
  if (!activeUrl) return
  clearTimeout(activeUrl.cleanupTimer)
  URL.revokeObjectURL(objectUrl)
  activeObjectUrls.delete(objectUrl)
  await activeUrl.cleanup()
  notifyIdleIfPossible()
}

async function createMuxTarget(): Promise<MuxTargetContext> {
  await staleFileCleanup

  let directory: FileSystemDirectoryHandle | undefined
  let filename: string | undefined
  let writable: FileSystemWritableFileStream | undefined
  try {
    const root = await navigator.storage.getDirectory()
    directory = await root.getDirectoryHandle(OPFS_DIRECTORY, { create: true })
    filename = `pinoria-${crypto.randomUUID()}.mp4`
    const fileHandle = await directory.getFileHandle(filename, { create: true })
    writable = await fileHandle.createWritable()
    const cacheDirectory = directory
    const cacheFilename = filename
    let cleaned = false

    return {
      target: new StreamTarget(
        writable as unknown as WritableStream<StreamTargetChunk>,
        { chunked: true, chunkSize: STREAM_CHUNK_SIZE },
      ),
      getBlob: async () => fileHandle.getFile(),
      cleanup: async () => {
        if (cleaned) return
        cleaned = true
        await cacheDirectory.removeEntry(cacheFilename).catch(() => undefined)
      },
    }
  } catch {
    await writable?.abort().catch(() => undefined)
    if (directory && filename) await directory.removeEntry(filename).catch(() => undefined)
    const target = new BufferTarget()
    return {
      target,
      getBlob: async () => {
        if (!target.buffer) throw new Error('Muxed MP4 contains no data')
        return new Blob([target.buffer], { type: 'video/mp4' })
      },
      cleanup: async () => undefined,
    }
  }
}

function validateRequest(request: MuxDownloadRequest): void {
  if (
    !isPinterestMediaUrl(request.videoUrl) ||
    (request.audioUrl !== undefined && !isPinterestMediaUrl(request.audioUrl))
  ) {
    throw new Error('Media mux source does not belong to Pinterest CDN')
  }
  if (!/^Pinoria\/[^/]+\.mp4$/i.test(request.filename)) {
    throw new Error('Invalid MP4 filename')
  }
}

async function muxMedia(request: MuxDownloadRequest): Promise<{
  blob: Blob
  cleanup: () => Promise<void>
}> {
  validateRequest(request)
  const targetContext = await createMuxTarget()
  const videoInput = new Input({
    formats: HLS_FORMATS,
    source: new UrlSource(request.videoUrl, { maxCacheSize: 16 * 1024 * 1024 }),
  })
  const audioInput = request.audioUrl
    ? new Input({
        formats: HLS_FORMATS,
        source: new UrlSource(request.audioUrl, { maxCacheSize: 4 * 1024 * 1024 }),
      })
    : undefined
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: false }),
    target: targetContext.target,
  })

  try {
    const [videoTracks, audioTracks] = await Promise.all([
      videoInput.getVideoTracks(),
      audioInput?.getAudioTracks() ?? [],
    ])
    if (videoTracks.length === 0) throw new Error('Media source has no video track')
    if (audioInput && audioTracks.length === 0) throw new Error('Media source has no audio track')

    const videoConversion = await Conversion.init({
      input: videoInput,
      output,
      composable: true,
      tracks: 'primary',
      ...(audioInput ? { audio: { discard: true } } : {}),
      showWarnings: false,
    })
    const audioConversion = audioInput
      ? await Conversion.init({
          input: audioInput,
          output,
          composable: true,
          tracks: 'primary',
          video: { discard: true },
          showWarnings: false,
        })
      : undefined
    const conversions = [videoConversion, ...(audioConversion ? [audioConversion] : [])]
    if (!output.hasEnoughTracks()) throw new Error('Unable to create MP4 from Pinterest source')

    await output.start()
    for (let until = 5; ; until += 5) {
      await Promise.all(conversions.map((conversion) =>
        conversion.state === 'done' ? undefined : conversion.execute({ until })))
      if (conversions.every((conversion) => conversion.state === 'done')) break
    }
    await output.finalize()
    return {
      blob: await targetContext.getBlob(),
      cleanup: targetContext.cleanup,
    }
  } catch (error) {
    if (output.state === 'started') await output.cancel().catch(() => undefined)
    await targetContext.cleanup()
    throw error
  } finally {
    videoInput.dispose()
    audioInput?.dispose()
  }
}

async function muxToObjectUrl(request: MuxDownloadRequest): Promise<string> {
  const artifact = await muxMedia(request)
  try {
    const objectUrl = URL.createObjectURL(artifact.blob)
    const cleanupTimer = setTimeout(() => {
      void releaseObjectUrl(objectUrl)
    }, OBJECT_URL_TTL_MS)
    activeObjectUrls.set(objectUrl, { cleanup: artifact.cleanup, cleanupTimer })
    return objectUrl
  } catch (error) {
    await artifact.cleanup()
    throw error
  }
}

function enqueueMux(request: MuxDownloadRequest): Promise<string> {
  pendingConversions += 1
  const task = muxQueue.then(() => muxToObjectUrl(request))
  muxQueue = task.then(() => undefined, () => undefined)
  return task.finally(() => {
    pendingConversions -= 1
    notifyIdleIfPossible()
  })
}

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  if (isMuxReadyRequest(message)) {
    sendResponse({ ready: true } satisfies MuxReadyResponse)
    return false
  }
  if (isMuxReleaseRequest(message)) {
    void releaseObjectUrl(message.objectUrl)
    return false
  }
  if (!isMuxDownloadRequest(message)) return false
  if (sender.id !== chrome.runtime.id) {
    sendResponse({ ok: false, error: 'Mux request does not belong to Pinoria' } satisfies MuxDownloadResponse)
    return false
  }

  void enqueueMux(message)
    .then((objectUrl) => sendResponse({ ok: true, objectUrl } satisfies MuxDownloadResponse))
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unable to mux video and audio'
      sendResponse({ ok: false, error: errorMessage } satisfies MuxDownloadResponse)
    })
  return true
})
