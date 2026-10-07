export const QUICK_DOWNLOAD_STYLES = `
  :host {
    display: inline-flex;
    position: relative;
    box-sizing: border-box;
    font-family: var(--pk-control-font, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    line-height: 1;
    z-index: 2147483647;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .target-list {
    align-items: center;
    display: inline-flex;
    gap: 6px;
  }

  .target-control {
    display: inline-flex;
    position: relative;
  }

  button {
    all: unset;
    align-items: center;
    background: var(--pk-control-background, rgba(255, 255, 255, 0.96));
    border-radius: var(--pk-control-radius, 12px);
    box-shadow: var(--pk-control-shadow, 0 1px 4px rgba(0, 0, 0, 0.16));
    color: var(--pk-control-color, #111111);
    cursor: pointer;
    display: inline-flex;
    height: var(--pk-control-size, 40px);
    justify-content: center;
    min-height: var(--pk-control-size, 40px);
    min-width: var(--pk-control-size, 40px);
    opacity: 0;
    position: relative;
    transform: scale(0.96);
    transition: opacity 140ms ease-out, transform 140ms ease-out, background-color 140ms ease-out;
    touch-action: manipulation;
    width: var(--pk-control-size, 40px);
    -webkit-tap-highlight-color: transparent;
  }

  :host([data-hovered]) button,
  :host(:hover) button,
  :host(:focus-within) button,
  :host-context([data-test-id="pin"]:hover) button,
  :host-context([data-grid-item="true"]:hover) button,
  :host-context([role="listitem"]:hover) button,
  button:hover,
  button:focus-visible,
  button[data-state="loading"],
  button[data-state="success"],
  button[data-state="error"] {
    opacity: 1;
    transform: scale(1);
  }

  button:hover {
    background: var(--pk-control-hover-background, #e9e9e9);
  }

  button:active {
    transform: scale(0.92);
  }

  button:focus-visible {
    outline: 3px solid var(--pk-control-focus, #4a90e2);
    outline-offset: 2px;
  }

  button[aria-busy="true"] {
    cursor: progress;
  }

  .icon {
    display: none;
    height: calc(var(--pk-control-size, 40px) * 0.5);
    width: calc(var(--pk-control-size, 40px) * 0.5);
  }

  button[data-state="idle"] .icon-download,
  button[data-state="loading"] .icon-loading,
  button[data-state="success"] .icon-success,
  button[data-state="error"] .icon-error {
    display: block;
  }

  .spinner-graphic {
    animation: pk-spin 700ms linear infinite;
    transform-box: fill-box;
    transform-origin: center;
  }

  .sr-only {
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  @keyframes pk-spin {
    to { transform: rotate(360deg); }
  }

  @media (hover: none) {
    button { opacity: 1; transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    button { transition: none; }
    .spinner-graphic { animation: none; }
  }
`
