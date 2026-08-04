export const PINTEREST_SELECTORS = Object.freeze({
  pinLinks: 'a[href*="/pin/"]',
  pinContainers: [
    '[data-test-id="pin"]',
    '[data-test-id="promoted-pin"]',
    '[data-grid-item="true"]',
    '[role="listitem"]',
    'article',
  ],
  promotedMarkers: [
    '[data-test-id*="promoted" i]',
    '[data-ad-preview]',
    '[aria-label*="promoted" i]',
  ],
  carouselItems: ['[data-test-id="carousel-item"]', '[data-media-slot]'],
  ignoredImages: [
    '[data-test-id*="avatar" i]',
    '[data-test-id*="thumbnail" i]',
    '[data-media-role="thumbnail"]',
  ],
  nativeActionControls: [
    '[data-test-id="send-pin-button"]',
    '[data-test-id="more-options-button"]',
    '[data-test-id="pin-action-button"]',
  ],
  boardTitle: '[data-test-id="board-title"]',
  sectionTitle: '[data-test-id="section-title"]',
  boardSearchInputs: [
    '[data-test-id*="board-search" i] input',
    'input[placeholder="Search this board"]',
    'input[aria-label="Search this board"]',
    '[role="searchbox"][placeholder="Search this board"]',
  ],
  pinDescription: '[data-test-id="pin-description"]',
})

export function selectorList(selectors: readonly string[]): string {
  return selectors.join(',')
}
