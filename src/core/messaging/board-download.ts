export const BOARD_DOWNLOAD_START_MESSAGE = 'PINORIA_BOARD_DOWNLOAD_START' as const

export interface BoardDownloadStartMessage {
  type: typeof BOARD_DOWNLOAD_START_MESSAGE
}

export function isBoardDownloadStartMessage(value: unknown): value is BoardDownloadStartMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<BoardDownloadStartMessage>).type === BOARD_DOWNLOAD_START_MESSAGE
  )
}
