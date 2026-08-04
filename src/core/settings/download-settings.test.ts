import { describe, expect, it } from 'vitest'

import {
  buildDownloadFilename,
  getDownloadMediaFolder,
  normalizeDownloadColor,
  normalizeDownloadFolder,
  normalizeDownloadTargets,
} from './download-settings'

describe('download settings', () => {
  it('uses Pinoria when the folder is missing or blank', () => {
    expect(normalizeDownloadFolder(undefined)).toBe('Pinoria')
    expect(normalizeDownloadFolder('   ')).toBe('Pinoria')
  })

  it('accepts nested folders and removes unsafe path segments', () => {
    expect(normalizeDownloadFolder(' Pinterest / Kim:Ji*Won / ../ ')).toBe(
      'Pinterest/Kim-Ji-Won',
    )
  })

  it('normalizes colors and limits the target collection', () => {
    expect(normalizeDownloadColor('#12ABef')).toBe('#12abef')
    expect(normalizeDownloadColor('red')).toBe('#e60023')
    const targets = normalizeDownloadTargets(Array.from({ length: 8 }, (_, index) => ({
      id: `folder-${index}`,
      folder: `Folder ${index}`,
      color: '#0066cc',
    })))
    expect(targets).toHaveLength(6)
  })

  it('removes malformed targets and duplicate identifiers', () => {
    expect(normalizeDownloadTargets([
      { id: 'same', folder: 'Ảnh', color: '#00aa55' },
      { id: 'same', folder: 'Video', color: '#ff6600' },
      null,
    ])).toEqual([
      { id: 'same', folder: 'Ảnh', color: '#00aa55' },
      { id: 'target-2', folder: 'Video', color: '#ff6600' },
    ])
  })

  it('builds a relative path inside the browser Downloads directory', () => {
    expect(buildDownloadFilename('Pinterest', '123', 'jpg')).toBe(
      'Pinterest/Ảnh/pinterest-123.jpg',
    )
  })

  it('automatically groups each resolved media format into a child folder', () => {
    expect(getDownloadMediaFolder('jpg')).toBe('Ảnh')
    expect(getDownloadMediaFolder('.webp')).toBe('Ảnh')
    expect(getDownloadMediaFolder('gif')).toBe('GIF')
    expect(getDownloadMediaFolder('mp4')).toBe('Video')
    expect(getDownloadMediaFolder('m3u8')).toBe('Video')
  })
})
