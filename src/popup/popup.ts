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
  if (!element) throw new Error('Unable to initialize Pinoria settings')
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
  delete status.dataset.state
}

function showStatus(message: string, state: 'success' | 'error' = 'success') {
  clearStatus()
  status.textContent = message
  status.dataset.state = state
  statusTimer = window.setTimeout(() => { status.textContent = '' }, 3200)
}

function getFolderInitial(folder: string, index: number): string {
  const lastSegment = folder.split('/').filter(Boolean).at(-1)?.trim()
  return lastSegment?.charAt(0).toUpperCase() || String(index + 1)
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
    colorLabel.title = `Select color for ${target.folder}`
    colorLabel.style.setProperty('--target-color', target.color)
    const colorText = document.createElement('span')
    colorText.className = 'sr-only'
    colorText.textContent = `Button color ${index + 1}`
    const folderInitial = document.createElement('span')
    folderInitial.className = 'folder-initial'
    folderInitial.setAttribute('aria-hidden', 'true')
    folderInitial.textContent = getFolderInitial(target.folder, index)
    const colorInput = document.createElement('input')
    colorInput.type = 'color'
    colorInput.value = target.color
    colorInput.setAttribute('aria-label', `Button color ${index + 1}`)
    colorInput.addEventListener('input', () => {
      target.color = colorInput.value
      colorLabel.style.setProperty('--target-color', colorInput.value)
      clearStatus()
    })
    colorLabel.append(colorText, folderInitial, colorInput)

    const folderField = document.createElement('label')
    folderField.className = 'folder-field'
    const folderLabel = document.createElement('span')
    folderLabel.className = 'sr-only'
    folderLabel.textContent = `Folder path ${index + 1}`
    const folderCopy = document.createElement('span')
    folderCopy.className = 'folder-copy'
    const folderInput = document.createElement('input')
    folderInput.type = 'text'
    folderInput.name = `folder-${target.id}`
    folderInput.value = target.folder
    folderInput.maxLength = 180
    folderInput.autocomplete = 'off'
    folderInput.spellcheck = false
    folderInput.setAttribute('aria-label', `Folder path ${index + 1}`)
    const pathPreview = document.createElement('span')
    pathPreview.className = 'folder-path-preview'
    pathPreview.id = `folder-path-${target.id}`
    pathPreview.textContent = `Downloads/${target.folder}`
    folderInput.setAttribute('aria-describedby', pathPreview.id)
    folderInput.addEventListener('input', () => {
      target.folder = folderInput.value
      colorLabel.title = `Select color for ${folderInput.value || `folder ${index + 1}`}`
      folderInitial.textContent = getFolderInitial(folderInput.value, index)
      pathPreview.textContent = `Downloads/${folderInput.value}`
      clearStatus()
    })
    folderCopy.append(folderInput, pathPreview)
    folderField.append(folderLabel, folderCopy)

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'delete-button'
    deleteButton.disabled = disableDelete
    deleteButton.setAttribute('aria-label', `Delete folder ${target.folder}`)
    deleteButton.append(createDeleteIcon())
    deleteButton.addEventListener('click', () => {
      targets = targets.filter(({ id }) => id !== target.id)
      renderTargets()
      clearStatus()
    })

    item.append(colorLabel, folderField, deleteButton)
    list.append(item)
  })

  limit.textContent = `${targets.length} active`
  limit.title = `Maximum ${MAX_DOWNLOAD_TARGETS} folders`
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
  const buttonLabel = button?.querySelector<HTMLElement>('.button-label')
  if (button) button.disabled = true
  if (buttonLabel) buttonLabel.textContent = 'Saving…'
  status.textContent = 'Saving your download folders…'
  delete status.dataset.state

  void saveDownloadTargets(targets)
    .then((savedTargets) => {
      targets = savedTargets
      renderTargets()
      showStatus('Download buttons updated on Pinterest.')
    })
    .catch(() => { showStatus('Could not save. Please try again.', 'error') })
    .finally(() => {
      if (button) button.disabled = false
      if (buttonLabel) buttonLabel.textContent = 'Save settings'
    })
})

void loadDownloadTargets()
  .then((storedTargets) => {
    targets = storedTargets
    renderTargets()
  })
  .catch(() => { showStatus('Could not load your current settings.', 'error') })
