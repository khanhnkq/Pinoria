import {
  DOWNLOAD_FOLDER_STORAGE_KEY,
  DOWNLOAD_TARGETS_STORAGE_KEY,
  getDefaultDownloadTargets,
  isBoardDownloadStartMessage,
  loadDownloadTargets,
} from '../core'
import { sendQuickDownloadRequest } from '../core/messaging/quick-download'
import { createBoardDownloadController } from './board-download/board-download-controller'
import { downloadBoard } from './board-download/download-board'
import { createQuickDownloadController } from './quick-download/quick-download-controller'
import { createBoardScanner } from './scanner/board-scanner'

declare global {
  interface Window {
    __pinoriaQuickDownloadController?: ReturnType<typeof createQuickDownloadController>
    __pinoriaRemoveDownloadTargetsListener?: () => void
    __pinoriaBoardScanner?: ReturnType<typeof createBoardScanner>
    __pinoriaBoardDownloadController?: ReturnType<typeof createBoardDownloadController>
    __pinoriaRemoveBoardDownloadMessageHandler?: () => void
  }
}

if (!window.__pinoriaBoardScanner) {
  window.__pinoriaBoardScanner = createBoardScanner({ document })
}

if (!window.__pinoriaBoardDownloadController) {
  const scanner = window.__pinoriaBoardScanner
  const controller = createBoardDownloadController({
    document,
    onDownloadBoard: (onProgress) => downloadBoard({
      scanner,
      downloadPin: sendQuickDownloadRequest,
      onProgress,
    }),
  })
  const listener = (message: unknown) => {
    if (isBoardDownloadStartMessage(message)) void controller.download()
  }
  chrome.runtime.onMessage.addListener(listener)
  controller.start()
  window.__pinoriaBoardDownloadController = controller
  window.__pinoriaRemoveBoardDownloadMessageHandler = () => chrome.runtime.onMessage.removeListener(listener)
} else {
  window.__pinoriaBoardDownloadController.scan()
}

if (!window.__pinoriaQuickDownloadController) {
  const controller = createQuickDownloadController({
    document,
    downloadTargets: getDefaultDownloadTargets(),
    onQuickDownload: (pin, target) => sendQuickDownloadRequest(pin, target.folder),
  })
  controller.start()
  window.__pinoriaQuickDownloadController = controller

  const refreshTargets = () => {
    void loadDownloadTargets()
      .then((targets) => controller.setDownloadTargets(targets))
      .catch(() => undefined)
  }
  const storageListener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (
      areaName === 'local' &&
      (changes[DOWNLOAD_TARGETS_STORAGE_KEY] || changes[DOWNLOAD_FOLDER_STORAGE_KEY])
    ) {
      refreshTargets()
    }
  }
  chrome.storage.onChanged.addListener(storageListener)
  window.__pinoriaRemoveDownloadTargetsListener = () => {
    chrome.storage.onChanged.removeListener(storageListener)
  }
  refreshTargets()
} else {
  window.__pinoriaQuickDownloadController.scan()
}
