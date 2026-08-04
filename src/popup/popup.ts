import {
  createDownloadTarget,
  loadDownloadTargets,
  MAX_DOWNLOAD_TARGETS,
  saveDownloadTargets,
  type DownloadTarget,
} from '../core/settings/download-settings'

const TARGET_COLORS = [
  '#e60023',
  '#0066cc',
  '#008753',
  '#d65a00',
  '#7b2cbf',
  '#d62976',
] as const

function requiredElement<ElementType extends Element>(selector: string): ElementType {
  const element = document.querySelector<ElementType>(selector)
  if (!element) throw new Error('Không thể khởi tạo cài đặt Pinoria')
  return element
}

const form = requiredElement<HTMLFormElement>('#settings-form')
const list = requiredElement<HTMLUListElement>('#targets-list')
const addButton = requiredElement<HTMLButtonElement>('#add-target')
const limit = requiredElement<HTMLElement>('#target-limit')
const status = requiredElement<HTMLElement>('#status')

let targets: DownloadTarget[] = []
let statusTimer: number | undefined

function clearStatus() {
  if (statusTimer !== undefined) window.clearTimeout(statusTimer)
  status.textContent = ''
}

function showStatus(message: string) {
  clearStatus()
  status.textContent = message
  statusTimer = window.setTimeout(() => { status.textContent = '' }, 3200)
}

function createDeleteIcon(): SVGSVGElement {
  const namespace = 'http://www.w3.org/2000/svg'
  const icon = document.createElementNS(namespace, 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('aria-hidden', 'true')
  const path = document.createElementNS(namespace, 'path')
  path.setAttribute('d', 'M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5')
  icon.append(path)
  return icon
}

function renderTargets() {
  list.replaceChildren()
  const disableDelete = targets.length <= 1

  targets.forEach((target, index) => {
    const item = document.createElement('li')
    item.className = 'target-row'

    const colorLabel = document.createElement('label')
    colorLabel.className = 'color-picker'
    colorLabel.title = `Chọn màu cho ${target.folder}`
    const colorText = document.createElement('span')
    colorText.className = 'sr-only'
    colorText.textContent = `Màu nút tải ${index + 1}`
    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = target.color
    colorInput.setAttribute('aria-label', `Màu nút tải ${index + 1}`)
    colorInput.addEventListener('input', () => {
      target.color = colorInput.value
      clearStatus()
    })
    colorLabel.append(colorText, colorInput)

    const folderField = document.createElement('label')
    folderField.className = 'folder-field'
    const folderLabel = document.createElement('span')
    folderLabel.className = 'sr-only'
    folderLabel.textContent = `Đường dẫn folder ${index + 1}`
    const prefix = document.createElement('span')
    prefix.className = 'folder-prefix'
    prefix.setAttribute('aria-hidden', 'true')
    prefix.textContent = 'Downloads/'
    const folderInput = document.createElement('input')
    folderInput.type = 'text'
    folderInput.name = `folder-${target.id}`
    folderInput.value = target.folder
    folderInput.maxLength = 180
    folderInput.autocomplete = 'off'
    folderInput.spellcheck = false
    folderInput.setAttribute('aria-label', `Đường dẫn folder ${index + 1}`)
    folderInput.addEventListener('input', () => {
      target.folder = folderInput.value
      colorLabel.title = `Chọn màu cho ${folderInput.value || `folder ${index + 1}`}`
      clearStatus()
    })
    folderField.append(folderLabel, prefix, folderInput)

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'delete-button'
    deleteButton.disabled = disableDelete
    deleteButton.setAttribute('aria-label', `Xóa folder ${target.folder}`)
    deleteButton.append(createDeleteIcon())
    deleteButton.addEventListener('click', () => {
      targets = targets.filter(({ id }) => id !== target.id)
      renderTargets()
      clearStatus()
    })

    item.append(colorLabel, folderField, deleteButton)
    list.append(item)
  })

  limit.textContent = `${targets.length}/${MAX_DOWNLOAD_TARGETS}`
  addButton.disabled = targets.length >= MAX_DOWNLOAD_TARGETS
}

addButton.addEventListener('click', () => {
  if (targets.length >= MAX_DOWNLOAD_TARGETS) return
  const color = TARGET_COLORS[targets.length % TARGET_COLORS.length]
  targets.push(createDownloadTarget(`Folder ${targets.length + 1}`, color))
  renderTargets()
  const inputs = list.querySelectorAll<HTMLInputElement>('input[type="text"]')
  inputs.item(inputs.length - 1).select()
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  if (button) button.disabled = true
  status.textContent = 'Đang lưu…'

  void saveDownloadTargets(targets)
    .then((savedTargets) => {
      targets = savedTargets
      renderTargets()
      showStatus('Đã cập nhật các nút tải trên Pinterest.')
    })
    .catch(() => { status.textContent = 'Không thể lưu. Hãy thử lại.' })
    .finally(() => { if (button) button.disabled = false })
})

void loadDownloadTargets()
  .then((storedTargets) => {
    targets = storedTargets
    renderTargets()
  })
  .catch(() => { status.textContent = 'Không thể đọc cài đặt hiện tại.' })
