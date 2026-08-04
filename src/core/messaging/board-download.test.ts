import { describe, expect, it } from 'vitest'

import {
  BOARD_DOWNLOAD_START_MESSAGE,
  isBoardDownloadStartMessage,
} from './board-download'

describe('isBoardDownloadStartMessage', () => {
  it('accepts only the board download command', () => {
    expect(isBoardDownloadStartMessage({ type: BOARD_DOWNLOAD_START_MESSAGE })).toBe(true)
    expect(isBoardDownloadStartMessage({ type: 'OTHER' })).toBe(false)
    expect(isBoardDownloadStartMessage(null)).toBe(false)
  })
})
