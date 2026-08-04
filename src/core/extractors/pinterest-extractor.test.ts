import { readFileSync } from 'node:fs'

import { Window } from 'happy-dom'
import { describe, expect, it } from 'vitest'

import { extractPinterestPage, parsePinterestPageContext } from './pinterest-extractor'

const fixtureUrl = new URL('../../../tests/fixtures/', import.meta.url)

function loadFixture(name: string, pageUrl = 'https://www.pinterest.com/'): Document {
  const window = new Window({ url: pageUrl })
  const html = readFileSync(new URL(name, fixtureUrl), 'utf8')

  window.document.write(html)

  return window.document as unknown as Document
}

describe('extractPinterestPage', () => {
  it('extracts an image Pin and all responsive image candidates', () => {
    const report = extractPinterestPage(loadFixture('image-pin.html'))

    expect(report.pins).toHaveLength(1)
    expect(report.pins[0]).toMatchObject({
      pinId: '111111111111',
      title: 'Warm minimal workspace',
      description: 'A workspace reference',
      media: [
        {
          type: 'image',
          index: 0,
        },
      ],
    })
    expect(report.pins[0]?.media[0]?.candidates.map(({ width }) => width)).toEqual([
      236,
      474,
      736,
    ])
  })

  it('distinguishes animated GIF media from a static image', () => {
    const report = extractPinterestPage(loadFixture('gif-pin.html'))

    expect(report.pins[0]?.media[0]).toMatchObject({
      type: 'gif',
      audio: 'none',
    })
  })

  it('extracts video, poster, and separate audio candidates', () => {
    const report = extractPinterestPage(loadFixture('video-pin.html'))
    const media = report.pins[0]?.media[0]

    expect(media).toMatchObject({
      type: 'video',
      audio: 'separate',
    })
    expect(media?.candidates.map(({ role }) => role)).toEqual(['primary', 'poster', 'audio'])
  })

  it('extracts HLS video and audio URLs captured by the main-world bridge', () => {
    const report = extractPinterestPage(loadFixture('hls-video-pin.html'))
    const media = report.pins[0]?.media[0]

    expect(media).toMatchObject({ type: 'video', audio: 'separate' })
    expect(media?.candidates).toEqual(expect.arrayContaining([
      expect.objectContaining({
        role: 'primary',
        url: expect.stringContaining('_720w.m3u8'),
        mimeType: 'application/vnd.apple.mpegurl',
      }),
      expect.objectContaining({
        role: 'audio',
        url: expect.stringContaining('_audio.m3u8'),
        mimeType: 'application/vnd.apple.mpegurl',
      }),
    ]))
  })

  it('preserves each carousel item in source order', () => {
    const report = extractPinterestPage(loadFixture('carousel-pin.html'))

    expect(report.pins[0]?.media.map(({ index, candidates }) => [index, candidates[0]?.url])).toEqual([
      [0, 'https://i.pinimg.com/736x/11/22/33/one.jpg'],
      [1, 'https://i.pinimg.com/736x/11/22/33/two.jpg'],
    ])
  })

  it('skips promoted cards, media outside the Pin link, and Pins without media', () => {
    const report = extractPinterestPage(loadFixture('filtering.html'))

    expect(report.pins.map(({ pinId }) => pinId)).toEqual(['666666666666'])
    expect(report.pins[0]?.media).toHaveLength(1)
    expect(report.skipped.map(({ reason }) => reason)).toEqual(['promoted', 'no-media'])
  })

  it('attaches board and section context to extracted Pins', () => {
    const pageUrl = 'https://www.pinterest.com/kim/design-inspiration/mobile-ui/'
    const report = extractPinterestPage(loadFixture('section-page.html', pageUrl), pageUrl)

    expect(report.context).toEqual({
      kind: 'section',
      pageUrl,
      board: {
        ownerSlug: 'kim',
        slug: 'design-inspiration',
        name: 'Design inspiration',
      },
      section: {
        slug: 'mobile-ui',
        name: 'Mobile UI',
      },
    })
    expect(report.pins[0]?.context).toEqual(report.context)
  })
})

describe('parsePinterestPageContext', () => {
  it.each([
    ['https://www.pinterest.com/', 'home'],
    ['https://www.pinterest.com/search/pins/?q=chairs', 'search'],
    ['https://www.pinterest.com/kim/design-inspiration/', 'board'],
    ['https://www.pinterest.com/pin/111111111111/', 'pin'],
    ['https://www.pinterest.com/settings/profile/', 'unknown'],
  ] as const)('classifies %s as %s', (pageUrl, kind) => {
    const window = new Window({ url: pageUrl })

    expect(parsePinterestPageContext(window.document as unknown as Document, pageUrl).kind).toBe(kind)
  })
})
