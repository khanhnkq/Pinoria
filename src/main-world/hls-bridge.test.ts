import { describe, expect, it } from 'vitest'

import { parsePinterestHlsUrl } from './hls-bridge'

describe('parsePinterestHlsUrl', () => {
  it.each([
    [
      'https://v1.pinimg.com/videos/iht/hls/cc/f7/23/ccf723116991d3fa1555b978963bf7ce.m3u8',
      { key: 'ccf723116991d3fa1555b978963bf7ce', kind: 'master' },
    ],
    [
      'https://v1.pinimg.com/videos/iht/hls/cc/f7/23/ccf723116991d3fa1555b978963bf7ce_480w.m3u8',
      { key: 'ccf723116991d3fa1555b978963bf7ce', kind: 'video', width: 480 },
    ],
    [
      'https://v1.pinimg.com/videos/iht/hls/cc/f7/23/ccf723116991d3fa1555b978963bf7ce_audio.m3u8',
      { key: 'ccf723116991d3fa1555b978963bf7ce', kind: 'audio' },
    ],
  ] as const)('classifies %s', (url, expected) => {
    expect(parsePinterestHlsUrl(url)).toMatchObject({ url, ...expected })
  })

  it('rejects non-Pinterest playlists', () => {
    expect(parsePinterestHlsUrl('https://example.com/video.m3u8')).toBeUndefined()
  })
})
