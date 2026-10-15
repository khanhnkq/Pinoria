/**
 * Design Tokens — Inspired by "New Eridu Archives / Astra Yao" (Zenless Zone Zero Aesthetic)
 */

export const designTokens = {
  colors: {
    // 1. Primary Crimson / Vermilion Red
    crimson: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      400: '#f04438',
      500: '#e22622', // Core Hero Red ("NEW ERIDU ARCHIVES" banner)
      600: '#c71b17', // Hover state
      700: '#9e1410', // Deep Shadow
      900: '#570705',
      glow: 'rgba(226, 38, 34, 0.45)',
    },

    // 2. Hardware Chassis Obsidian & Grays (Player shell, buttons, grooves)
    chassis: {
      950: '#0d0e10', // Deepest recess
      900: '#141518', // Matte plastic hardware body
      850: '#1a1c20', // Disc slot / card surface
      800: '#22242a', // PLAY / pause buttons
      700: '#2d3038', // Bevels & mechanical seams
      600: '#3f424c', // Metallic accents & separator lines
      400: '#717582', // Technical text print ("AGENT RECORD")
    },

    // 3. Industrial Label Canvas (Cassette label off-white)
    paper: {
      0: '#ffffff',   // Crisp bold white cutout text
      50: '#f8f9fa',
      100: '#f1f2f5', // Label surface off-white
      200: '#e2e4e9', // Watermark grid / sub-branding
      300: '#caced8', // Subtle border
    },

    // 4. Character & Hardware Accents
    accent: {
      goldBrass: '#d8a854',      // CD inner ring & tassel gold
      goldBrassDark: '#a97b28',
      viridianTeal: '#183332',   // Astra Yao hair dark viridian
      ledPower: '#ff2d37',       // Hardware power indicator LED
      ledGlow: 'rgba(255, 45, 55, 0.65)',
    },
  },

  typography: {
    display: "'Impact', 'DIN Condensed', 'Arial Black', sans-serif",
    mono: "'SF Mono', 'Roboto Mono', 'Fira Code', monospace",
    body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  shadows: {
    hardware: '0 10px 30px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
    crimsonGlow: '0 0 24px rgba(226, 38, 34, 0.45)',
    ledGlow: '0 0 10px rgba(255, 45, 55, 0.65)',
  },
} as const
