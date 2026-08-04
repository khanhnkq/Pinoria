export const DOWNLOAD_FOLDER_STORAGE_KEY = 'downloadFolder' as const
export const DOWNLOAD_TARGETS_STORAGE_KEY = 'downloadTargets' as const
export const DEFAULT_DOWNLOAD_FOLDER = 'Pinoria' as const
export const DEFAULT_DOWNLOAD_COLOR = '#e60023' as const
export const MAX_DOWNLOAD_TARGETS = 6 as const

export interface DownloadTarget {
  color: string
  folder: string
  id: string
}

export type DownloadMediaFolder = 'Ảnh' | 'GIF' | 'Video'

const INVALID_FILENAME_CHARACTERS = /[<>:"|?*]/g
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const MAX_SEGMENT_LENGTH = 80
const MAX_FOLDER_LENGTH = 180

function normalizeSegment(value: string): string {
  return Array.from(value, (character) => character.charCodeAt(0) < 32 ? '-' : character)
    .join('')
    .replace(INVALID_FILENAME_CHARACTERS, '-')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, MAX_SEGMENT_LENGTH)
}

export function normalizeDownloadFolder(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_DOWNLOAD_FOLDER

  const folder = value
    .replace(/\\/g, '/')
    .split('/')
    .map(normalizeSegment)
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '..')
    .join('/')
    .slice(0, MAX_FOLDER_LENGTH)

  return folder || DEFAULT_DOWNLOAD_FOLDER
}

export function normalizeDownloadColor(value: unknown): string {
  return typeof value === 'string' && HEX_COLOR_PATTERN.test(value)
    ? value.toLowerCase()
    : DEFAULT_DOWNLOAD_COLOR
}

export function normalizeDownloadTargets(value: unknown): DownloadTarget[] {
  if (!Array.isArray(value)) return []

  const seenIds = new Set<string>()
  return value.slice(0, MAX_DOWNLOAD_TARGETS).flatMap((candidate, index) => {
    if (typeof candidate !== 'object' || candidate === null) return []
    const input = candidate as Partial<DownloadTarget>
    const requestedId = typeof input.id === 'string' ? input.id.trim() : ''
    let id = requestedId && !seenIds.has(requestedId) ? requestedId : `target-${index + 1}`
    let suffix = 2
    while (seenIds.has(id)) {
      id = `target-${index + 1}-${suffix}`
      suffix += 1
    }
    seenIds.add(id)
    return [{
      id,
      folder: normalizeDownloadFolder(input.folder),
      color: normalizeDownloadColor(input.color),
    }]
  })
}

export function createDownloadTarget(
  folder: string = DEFAULT_DOWNLOAD_FOLDER,
  color: string = DEFAULT_DOWNLOAD_COLOR,
): DownloadTarget {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `target-${Date.now()}`,
    folder: normalizeDownloadFolder(folder),
    color: normalizeDownloadColor(color),
  }
}

export function getDefaultDownloadTargets(): DownloadTarget[] {
  return [{ id: 'default', folder: DEFAULT_DOWNLOAD_FOLDER, color: DEFAULT_DOWNLOAD_COLOR }]
}

export function buildDownloadFilename(
  folder: unknown,
  pinId: string,
  extension: string,
): string {
  const mediaFolder = getDownloadMediaFolder(extension)
  return `${normalizeDownloadFolder(folder)}/${mediaFolder}/pinterest-${pinId}.${extension}`
}

export function getDownloadMediaFolder(extension: unknown): DownloadMediaFolder {
  if (typeof extension !== 'string') return 'Ảnh'
  const normalized = extension.toLowerCase().replace(/^\./, '')
  if (normalized === 'gif') return 'GIF'
  if (normalized === 'mp4' || normalized === 'm4a' || normalized === 'm3u8') return 'Video'
  return 'Ảnh'
}

export async function loadDownloadTargets(): Promise<DownloadTarget[]> {
  const stored = await chrome.storage.local.get([
    DOWNLOAD_TARGETS_STORAGE_KEY,
    DOWNLOAD_FOLDER_STORAGE_KEY,
  ])
  const targets = normalizeDownloadTargets(stored[DOWNLOAD_TARGETS_STORAGE_KEY])
  if (targets.length > 0) return targets

  return [{
    id: 'default',
    folder: normalizeDownloadFolder(stored[DOWNLOAD_FOLDER_STORAGE_KEY]),
    color: DEFAULT_DOWNLOAD_COLOR,
  }]
}

export async function saveDownloadTargets(value: unknown): Promise<DownloadTarget[]> {
  const targets = normalizeDownloadTargets(value)
  const normalized = targets.length > 0 ? targets : getDefaultDownloadTargets()
  await chrome.storage.local.set({
    [DOWNLOAD_TARGETS_STORAGE_KEY]: normalized,
    [DOWNLOAD_FOLDER_STORAGE_KEY]: normalized[0]!.folder,
  })
  return normalized
}

export async function loadDownloadFolder(): Promise<string> {
  return (await loadDownloadTargets())[0]!.folder
}

export async function saveDownloadFolder(folder: unknown): Promise<string> {
  const current = await loadDownloadTargets()
  const normalized = normalizeDownloadFolder(folder)
  current[0] = { ...current[0]!, folder: normalized }
  await saveDownloadTargets(current)
  return normalized
}
