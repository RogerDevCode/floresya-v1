/**
 * FloresYa - Definiciones de Temas
 * Cada tema define sus colores mediante variables CSS
 * Expansión granular para heredar del tema global
 * Siguiendo CLAUDE.md: KISS, fail-fast, const usage, ES6 modules
 */

import { calculateOptimalTextColor, adjustColorBrightness } from './colorUtils.js'

/**
 * Extiende un tema base con todas las variables granulares calculadas
 * @param {Object} baseTheme - Tema base con variables fundamentales
 * @returns {Object} Tema completo con variables granulares
 */
function expandThemeWithGranularVars(baseTheme) {
  const variables = { ...baseTheme.variables }
  const primaryBg = variables['--theme-bg-primary'] || '#ffffff'
  const secondaryBg = variables['--theme-bg-secondary'] || '#f8fafc'
  const primary = variables['--theme-primary'] || '#ec4899'
  const primaryDark = variables['--theme-primary-dark'] || '#db2777'
  const secondary = variables['--theme-secondary'] || '#10b981'
  const textPrimary = variables['--theme-text-primary'] || '#111827'
  const textSecondary = variables['--theme-text-secondary'] || '#374151'

  // ==================== VARIABLES GRANULARES - NAVEGACIÓN ====================
  variables['--nav-bg-primary'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--nav-bg-glass'] =
    `rgba(${parseInt(primaryBg.slice(1, 3), 16)}, ${parseInt(primaryBg.slice(3, 5), 16)}, ${parseInt(primaryBg.slice(5, 7), 16)}, 0.95)`
  variables['--nav-bg-dark'] = variables['--theme-bg-tertiary'] || '#334155'

  // Asegurar contraste WCAG AAA (7.0) para texto de navegación
  variables['--nav-text-primary'] = calculateOptimalTextColor(
    primaryBg,
    [textPrimary],
    7.0 // AAA para máxima legibilidad en elementos de navegación
  )
  variables['--nav-text-secondary'] = calculateOptimalTextColor(
    primaryBg,
    [textSecondary],
    4.5 // AA para texto secundario
  )
  variables['--nav-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--nav-shadow'] = variables['--theme-shadow'] || 'rgba(0, 0, 0, 0.1)'
  variables['--nav-height'] = '4rem'

  // ==================== VARIABLES GRANULARES - BREADCRUMB ====================
  variables['--breadcrumb-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--breadcrumb-text'] = calculateOptimalTextColor(
    primaryBg,
    [textSecondary],
    4.5 // AA para texto secundario
  )
  variables['--breadcrumb-text-active'] = calculateOptimalTextColor(
    primaryBg,
    [variables['--theme-primary'] || primary],
    7.0 // AAA para elementos activos
  )
  variables['--breadcrumb-border'] = variables['--theme-border-light'] || '#e5e7eb'

  // ==================== VARIABLES GRANULARES - HERO ====================
  variables['--hero-bg-primary'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primaryBg, 5)} 0%, ${adjustColorBrightness(secondaryBg, 5)} 100%)`
  variables['--hero-bg-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primary, -20)} 0%, ${adjustColorBrightness(secondary, -20)} 100%)`

  // Asegurar contraste WCAG AAA (7.0) para texto principal del hero
  variables['--hero-text-primary'] = calculateOptimalTextColor(
    variables['--hero-bg-gradient'] || primaryBg,
    ['#ffffff', '#f9fafb'],
    7.0 // AAA para máxima legibilidad en titulares
  )
  variables['--hero-text-secondary'] = calculateOptimalTextColor(
    variables['--hero-bg-gradient'] || primaryBg,
    ['#e5e7eb', '#d1d5db'],
    4.5 // AA para texto secundario
  )
  variables['--hero-text-dark'] = variables['--theme-text-primary'] || textPrimary
  variables['--hero-overlay'] = 'rgba(0, 0, 0, 0.3)'
  variables['--hero-shadow'] = '0 20px 60px rgba(0, 0, 0, 0.1)'

  // ==================== VARIABLES GRANULARES - CAROUSEL ====================
  variables['--carousel-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--carousel-bg-light'] = primaryBg
  variables['--carousel-bg-dark'] = variables['--theme-bg-tertiary'] || '#1f2937'
  variables['--carousel-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--carousel-shadow'] = 'var(--theme-shadow, rgba(0, 0, 0, 0.1))'
  variables['--carousel-control-bg'] = calculateOptimalTextColor(
    primaryBg,
    ['rgba(255, 255, 255, 0.95)', 'rgba(0, 0, 0, 0.7)'],
    3
  )
  variables['--carousel-indicator-active'] = variables['--theme-primary'] || primary

  // ==================== VARIABLES GRANULARES - PRODUCTOS ====================
  variables['--products-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--products-bg-secondary'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--products-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--products-card-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--products-card-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--products-card-hover'] = variables['--theme-primary'] || primary

  // ==================== VARIABLES GRANULARES - PRODUCT DETAIL ====================
  variables['--product-detail-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--product-detail-bg-secondary'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--product-detail-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--product-detail-shadow'] = '0 4px 6px rgba(0, 0, 0, 0.1)'
  variables['--product-detail-image-bg'] = '#ffffff'
  variables['--product-detail-price-bg'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primary, 40)} 0%, ${adjustColorBrightness(secondary, 40)} 100%)`
  variables['--product-detail-badge-bg'] = calculateOptimalTextColor(
    secondaryBg,
    [`${adjustColorBrightness(secondary, 30)}`, `${adjustColorBrightness(secondary, -30)}`],
    3
  )
  variables['--product-detail-badge-text'] = calculateOptimalTextColor(
    variables['--product-detail-badge-bg'],
    ['#059669', '#ffffff'],
    4.5
  )

  // ==================== VARIABLES GRANULARES - CARRITO ====================
  variables['--cart-bg-primary'] = calculateOptimalTextColor(
    primaryBg,
    [`rgba(255, 255, 255, 0.95)`, `rgba(0, 0, 0, 0.8)`],
    3
  )
  variables['--cart-bg-overlay'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primary, 40)} 0%, ${adjustColorBrightness(secondary, 40)} 100%)`
  variables['--cart-bg-card'] = calculateOptimalTextColor(
    primaryBg,
    [`rgba(255, 255, 255, 0.95)`, `rgba(30, 41, 59, 0.95)`],
    3
  )
  variables['--cart-border'] = calculateOptimalTextColor(
    primaryBg,
    ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)'],
    2
  )
  variables['--cart-border-light'] = calculateOptimalTextColor(
    primaryBg,
    ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.4)'],
    2
  )
  variables['--cart-backdrop-blur'] = 'blur(12px)'
  variables['--cart-shadow'] = '0 8px 32px rgba(0, 0, 0, 0.1)'
  variables['--cart-shadow-premium'] = `0 20px 60px ${adjustColorBrightness(primary, -40)} 0.3`

  // ==================== VARIABLES GRANULARES - FORMULARIOS ====================
  variables['--form-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--form-bg-filled'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--form-bg-premium'] =
    `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${adjustColorBrightness(secondaryBg, 5)} 0.95)`.replace(
      secondaryBg,
      `var(--theme-bg-secondary, ${secondaryBg})`
    )
  variables['--form-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--form-border-focus'] = variables['--theme-primary'] || primary
  variables['--form-text'] = variables['--theme-text-primary'] || textPrimary
  variables['--form-placeholder'] = variables['--theme-text-tertiary'] || '#9ca3af'
  variables['--form-shadow'] = '0 4px 12px rgba(0, 0, 0, 0.1)'
  variables['--form-shadow-focus'] = `0 8px 24px ${adjustColorBrightness(primary, 0)} 0.2`

  // ==================== VARIABLES GRANULARES - BOTONES ====================
  variables['--btn-bg-primary'] = variables['--theme-primary'] || primary
  variables['--btn-bg-primary-hover'] = variables['--theme-primary-hover'] || primaryDark
  variables['--btn-bg-secondary'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--btn-bg-success'] = '#10b981'
  variables['--btn-bg-warning'] = '#f59e0b'

  // Asegurar contraste WCAG AAA (7.0) para texto de botones críticos
  variables['--btn-text-primary'] = calculateOptimalTextColor(
    variables['--btn-bg-primary'],
    ['#ffffff', '#000000'],
    7.0 // AAA para máxima legibilidad en elementos interactivos
  )
  variables['--btn-text-secondary'] = variables['--theme-text-primary'] || textPrimary
  variables['--btn-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--btn-shadow'] = '0 4px 12px rgba(0, 0, 0, 0.1)'
  variables['--btn-shadow-hover'] = '0 8px 24px rgba(0, 0, 0, 0.15)'

  // ==================== VARIABLES GRANULARES - ENLACES ====================
  variables['--link-color'] = variables['--theme-primary'] || primary
  variables['--link-color-visited'] = adjustColorBrightness(
    variables['--theme-primary'] || primary,
    -15
  )
  variables['--link-color-hover'] = adjustColorBrightness(
    variables['--theme-primary'] || primary,
    15
  )

  // Asegurar contraste WCAG AAA (7.0) para texto de enlaces
  variables['--link-text-color'] = calculateOptimalTextColor(
    primaryBg,
    [variables['--theme-primary'] || primary],
    7.0 // AAA para máxima legibilidad en texto con enlaces
  )

  // ==================== VARIABLES GRANULARES - FORMULARIOS ====================
  variables['--form-text'] = variables['--theme-text-primary'] || textPrimary
  variables['--form-placeholder'] = variables['--theme-text-tertiary'] || '#9ca3af'
  variables['--form-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--form-border-focus'] = variables['--theme-primary'] || primary
  variables['--form-text-focus'] = calculateOptimalTextColor(
    primaryBg,
    [textPrimary],
    7.0 // AAA para máxima legibilidad en elementos de formulario
  )

  // ==================== VARIABLES GRANULARES - TESTIMONIOS ====================
  variables['--testimonial-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--testimonial-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--testimonial-shadow'] = 'var(--theme-shadow, rgba(0, 0, 0, 0.1))'
  variables['--testimonial-pink'] = '#ec4899'
  variables['--testimonial-green'] = '#10b981'
  variables['--testimonial-yellow'] = '#f59e0b'
  // Gradientes diferenciados para cada testimonial
  variables['--testimonial-pink-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--testimonial-pink'], 35)} 0%, ${adjustColorBrightness(variables['--testimonial-pink'], 15)} 100%)`
  variables['--testimonial-green-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--testimonial-green'], 35)} 0%, ${adjustColorBrightness(variables['--testimonial-green'], 15)} 100%)`
  variables['--testimonial-yellow-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--testimonial-yellow'], 35)} 0%, ${adjustColorBrightness(variables['--testimonial-yellow'], 15)} 100%)`

  // ==================== VARIABLES GRANULARES - FEATURES ====================
  variables['--features-bg'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--features-card-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--features-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--features-icon-primary'] = variables['--theme-primary'] || primary
  variables['--features-icon-secondary'] = variables['--theme-secondary'] || secondary
  variables['--features-shadow'] = 'var(--theme-shadow, rgba(0, 0, 0, 0.1))'

  // ==================== VARIABLES GRANULARES - FOOTER ====================
  variables['--footer-bg'] = variables['--theme-bg-tertiary'] || '#1f2937'
  variables['--footer-bg-light'] = `var(--theme-bg-secondary, ${secondaryBg})`
  // Gradiente dinámico del footer basado en el tema
  variables['--footer-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--theme-bg-tertiary'] || '#1f2937', -10)} 0%, ${adjustColorBrightness(variables['--theme-bg-tertiary'] || '#1f2937', -5)} 50%, ${variables['--theme-primary'] || primary} 100%)`

  // Asegurar contraste WCAG AAA (7.0) para texto principal del footer
  variables['--footer-text'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['#ffffff', '#d1d5db'],
    7.0 // AAA para máxima legibilidad en el pie de página
  )
  variables['--footer-text-light'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'],
    4.5 // AA para texto secundario
  )
  variables['--footer-text-muted'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'],
    3.0 // A para texto terciario
  )
  variables['--footer-border'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'],
    1.5 // A para bordes
  )

  return { ...baseTheme, variables }
}

export const themes = {
  light: {
    id: 'light',
    name: 'Claro Pastel',
    description: 'Diseño suave con colores pasteles vibrantes',
    icon: '☀️',
    category: 'basic',
    variables: {
      '--theme-primary': '#f472b6', // Pink 400 - más visible
      '--theme-primary-dark': '#ec4899', // Pink 500
      '--theme-primary-light': '#fbcfe8', // Pink 200
      '--theme-primary-hover': '#db2777', // Pink 600
      '--theme-secondary': '#60a5fa', // Blue 400 - más vibrante
      '--theme-secondary-dark': '#3b82f6', // Blue 500
      '--theme-secondary-light': '#bfdbfe', // Blue 200
      '--theme-accent': '#a78bfa', // Violet 400 - más intenso
      '--theme-accent-dark': '#8b5cf6', // Violet 500
      '--theme-accent-light': '#ddd6fe', // Violet 200
      '--theme-bg-primary': '#fefbff', // Tinte violeta muy suave
      '--theme-bg-secondary': '#fce7f3', // Pink 100 - MUY visible
      '--theme-bg-tertiary': '#ede9fe', // Violet 100 - MUY visible
      '--theme-text-primary': '#1e293b', // Slate 800 - más contraste
      '--theme-text-secondary': '#475569', // Slate 600
      '--theme-text-tertiary': '#64748b', // Slate 500
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#e2e8f0', // Slate 200
      '--theme-border-medium': '#cbd5e1', // Slate 300
      '--theme-border-dark': '#94a3b8', // Slate 400
      '--navbar-bg': 'rgba(255, 251, 255, 0.98)', // Tinte violeta + opaco
      '--navbar-text': '#1e293b', // Más oscuro
      '--navbar-text-hover': '#ec4899',
      '--navbar-border': '#e2e8f0',
      '--navbar-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
      '--navbar-brand-color': '#ec4899',
      '--navbar-icon-color': '#64748b',
      '--navbar-icon-hover': '#ec4899',
      '--hero-bg-start': '#fce7f3', // Pink 100
      '--hero-bg-end': '#ede9fe', // Violet 100
      '--hero-title-color': '#1e293b',
      '--hero-subtitle-color': '#475569',
      '--hero-accent-color': '#ec4899',
      '--card-bg': '#ffffff',
      '--card-border': '#e5e7eb',
      '--card-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
      '--card-shadow-hover':
        '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.06)',
      '--card-title-color': '#1e293b',
      '--card-text-color': '#475569',
      '--card-price-color': '#ec4899',
      '--btn-primary-bg': '#ec4899',
      '--btn-primary-hover': '#db2777',
      '--btn-secondary-bg': '#ede9fe', // Violet 100 - más visible
      '--btn-secondary-border': '#c4b5fd', // Violet 300
      '--footer-bg': '#0f172a', // Slate 900 - MUY oscuro para contraste
      '--footer-text': '#f1f5f9', // Slate 100 - MUY claro
      '--footer-heading': '#fce7f3', // Pink 100 - más claro
      '--footer-link-hover': '#ffffff', // Blanco puro
      '--carousel-bg': '#faf5ff', // Violet 50 - MÁS SATURADO
      '--carousel-nav-bg': 'rgba(255, 255, 255, 0.9)',
      '--carousel-nav-hover': '#ffffff',
      '--carousel-indicator-inactive': '#cbd5e1',
      '--carousel-indicator-active': '#ec4899'
    }
  },

  dark: {
    id: 'dark',
    name: 'Pro Dark',
    description: 'Elegancia nocturna con alto contraste',
    icon: '🌙',
    category: 'basic',
    variables: {
      '--theme-primary': '#f43f5e', // Rose 500
      '--theme-primary-dark': '#e11d48', // Rose 600
      '--theme-primary-light': '#fb7185', // Rose 400
      '--theme-primary-hover': '#be123c', // Rose 700
      '--theme-secondary': '#94a3b8', // Slate 400
      '--theme-secondary-dark': '#64748b', // Slate 500
      '--theme-secondary-light': '#cbd5e1', // Slate 300
      '--theme-accent': '#38bdf8', // Sky 400
      '--theme-accent-dark': '#0ea5e9', // Sky 500
      '--theme-accent-light': '#7dd3fc', // Sky 300
      '--theme-bg-primary': '#020617', // Slate 950
      '--theme-bg-secondary': '#0f172a', // Slate 900
      '--theme-bg-tertiary': '#1e293b', // Slate 800
      '--theme-text-primary': '#f8fafc', // Slate 50
      '--theme-text-secondary': '#cbd5e1', // Slate 300
      '--theme-text-tertiary': '#94a3b8', // Slate 400
      '--theme-text-inverted': '#020617',
      '--theme-border-light': '#1e293b', // Slate 800
      '--theme-border-medium': '#334155', // Slate 700
      '--theme-border-dark': '#475569', // Slate 600
      '--navbar-bg': 'rgba(2, 6, 23, 0.85)',
      '--navbar-text': '#f8fafc',
      '--navbar-text-hover': '#f43f5e',
      '--navbar-border': '#1e293b',
      '--navbar-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      '--navbar-brand-color': '#f43f5e',
      '--navbar-icon-color': '#94a3b8',
      '--navbar-icon-hover': '#f43f5e',
      '--hero-bg-start': '#020617',
      '--hero-bg-end': '#0f172a',
      '--hero-title-color': '#f8fafc',
      '--hero-subtitle-color': '#cbd5e1',
      '--hero-accent-color': '#f43f5e',
      '--card-bg': '#0f172a',
      '--card-border': '#1e293b',
      '--card-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      '--card-shadow-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
      '--card-title-color': '#f8fafc',
      '--card-text-color': '#cbd5e1',
      '--card-price-color': '#f43f5e',
      '--btn-primary-bg': '#f43f5e',
      '--btn-primary-hover': '#e11d48',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': '#1e293b',
      '--btn-secondary-border': '#334155',
      '--btn-secondary-text': '#f8fafc',
      '--footer-bg': '#020617',
      '--footer-text': '#94a3b8',
      '--footer-heading': '#f43f5e',
      '--footer-link-hover': '#ffffff',
      '--carousel-bg': '#0f172a',
      '--carousel-nav-bg': 'rgba(15, 23, 42, 0.9)',
      '--carousel-nav-hover': '#1e293b',
      '--carousel-indicator-inactive': '#334155',
      '--carousel-indicator-active': '#f43f5e'
    }
  },

  darkula: {
    id: 'darkula',
    name: 'Cyber Gaming',
    description: 'Estilo gamer con neón y alto contraste',
    icon: '🎮',
    category: 'premium',
    variables: {
      '--theme-primary': '#d946ef', // Fuchsia 500 (Neon Purple)
      '--theme-primary-dark': '#c026d3', // Fuchsia 600
      '--theme-primary-light': '#e879f9', // Fuchsia 400
      '--theme-primary-hover': '#a21caf', // Fuchsia 700
      '--theme-secondary': '#22d3ee', // Cyan 400 (Neon Blue)
      '--theme-secondary-dark': '#0891b2', // Cyan 600
      '--theme-secondary-light': '#67e8f9', // Cyan 300
      '--theme-accent': '#facc15', // Yellow 400 (Neon Yellow)
      '--theme-accent-dark': '#eab308', // Yellow 500
      '--theme-accent-light': '#fde047', // Yellow 300
      '--theme-bg-primary': '#09090b', // Zinc 950 (Deep Black)
      '--theme-bg-secondary': '#18181b', // Zinc 900
      '--theme-bg-tertiary': '#27272a', // Zinc 800
      '--theme-text-primary': '#fafafa', // Zinc 50
      '--theme-text-secondary': '#d4d4d8', // Zinc 300
      '--theme-text-tertiary': '#a1a1aa', // Zinc 400
      '--theme-text-inverted': '#09090b',
      '--theme-border-light': '#27272a', // Zinc 800
      '--theme-border-medium': '#3f3f46', // Zinc 700
      '--theme-border-dark': '#52525b', // Zinc 600
      '--navbar-bg': 'rgba(9, 9, 11, 0.9)',
      '--navbar-text': '#fafafa',
      '--navbar-text-hover': '#d946ef',
      '--navbar-border': '#27272a',
      '--navbar-shadow': '0 0 20px rgba(217, 70, 239, 0.15)', // Neon glow
      '--navbar-brand-color': '#d946ef',
      '--navbar-icon-color': '#a1a1aa',
      '--navbar-icon-hover': '#22d3ee',
      '--hero-bg-start': '#09090b',
      '--hero-bg-end': '#18181b',
      '--hero-title-color': '#fafafa',
      '--hero-subtitle-color': '#d4d4d8',
      '--hero-accent-color': '#d946ef',
      '--card-bg': '#18181b',
      '--card-border': '#27272a',
      '--card-shadow': '0 0 15px rgba(0, 0, 0, 0.5)',
      '--card-shadow-hover': '0 0 25px rgba(217, 70, 239, 0.25)', // Neon hover glow
      '--card-title-color': '#fafafa',
      '--card-text-color': '#d4d4d8',
      '--card-price-color': '#22d3ee',
      '--btn-primary-bg': '#d946ef',
      '--btn-primary-hover': '#c026d3',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#22d3ee',
      '--btn-secondary-text': '#22d3ee',
      '--footer-bg': '#000000',
      '--footer-text': '#a1a1aa',
      '--footer-heading': '#d946ef',
      '--footer-link-hover': '#22d3ee',
      '--carousel-bg': '#18181b',
      '--carousel-nav-bg': 'rgba(24, 24, 27, 0.9)',
      '--carousel-nav-hover': '#27272a',
      '--carousel-indicator-inactive': '#3f3f46',
      '--carousel-indicator-active': '#d946ef'
    }
  },

  kids: {
    id: 'kids',
    name: 'Infantil Divertido',
    description: 'Colores alegres y diseño juguetón',
    icon: '🎈',
    category: 'premium',
    variables: {
      '--theme-primary': '#facc15', // Yellow 400
      '--theme-primary-dark': '#eab308', // Yellow 500
      '--theme-primary-light': '#fef08a', // Yellow 200
      '--theme-primary-hover': '#ca8a04', // Yellow 600
      '--theme-secondary': '#38bdf8', // Sky 400
      '--theme-secondary-dark': '#0ea5e9', // Sky 500
      '--theme-secondary-light': '#bae6fd', // Sky 200
      '--theme-accent': '#fb7185', // Rose 400
      '--theme-accent-dark': '#f43f5e', // Rose 500
      '--theme-accent-light': '#fecdd3', // Rose 200
      '--theme-bg-primary': '#fffbeb', // Amber 50
      '--theme-bg-secondary': '#ffffff',
      '--theme-bg-tertiary': '#f0f9ff', // Sky 50
      '--theme-text-primary': '#451a03', // Amber 950
      '--theme-text-secondary': '#78350f', // Amber 900
      '--theme-text-tertiary': '#92400e', // Amber 800
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#fde68a', // Amber 200
      '--theme-border-medium': '#fcd34d', // Amber 300
      '--theme-border-dark': '#fbbf24', // Amber 400
      '--navbar-bg': 'rgba(255, 255, 255, 0.9)',
      '--navbar-text': '#451a03',
      '--navbar-text-hover': '#facc15',
      '--navbar-border': '#fde68a',
      '--navbar-shadow': '0 4px 0 rgba(251, 191, 36, 0.3)', // Chunky shadow
      '--navbar-brand-color': '#facc15',
      '--navbar-icon-color': '#78350f',
      '--navbar-icon-hover': '#38bdf8',
      '--hero-bg-start': '#fffbeb',
      '--hero-bg-end': '#f0f9ff',
      '--hero-title-color': '#451a03',
      '--hero-subtitle-color': '#78350f',
      '--hero-accent-color': '#fb7185',
      '--card-bg': '#ffffff',
      '--card-border': '#fde68a',
      '--card-shadow': '0 4px 0 rgba(0, 0, 0, 0.05)',
      '--card-shadow-hover': '0 8px 0 rgba(251, 191, 36, 0.4)', // Chunky hover shadow
      '--card-title-color': '#451a03',
      '--card-text-color': '#78350f',
      '--card-price-color': '#0ea5e9',
      '--btn-primary-bg': '#facc15',
      '--btn-primary-hover': '#eab308',
      '--btn-primary-text': '#451a03',
      '--btn-secondary-bg': '#ffffff',
      '--btn-secondary-border': '#38bdf8',
      '--btn-secondary-text': '#0ea5e9',
      '--footer-bg': '#451a03',
      '--footer-text': '#fef3c7',
      '--footer-heading': '#facc15',
      '--footer-link-hover': '#38bdf8',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(255, 255, 255, 0.9)',
      '--carousel-nav-hover': '#fffbeb',
      '--carousel-indicator-inactive': '#fde68a',
      '--carousel-indicator-active': '#facc15'
    }
  },

  wood: {
    id: 'wood',
    name: 'Madera',
    description: 'Tonos cálidos de madera natural y terracota',
    icon: '🪵',
    category: 'premium',
    variables: {
      '--theme-primary': '#6d4c41',
      '--theme-primary-dark': '#5d4037',
      '--theme-primary-light': '#8d6e63',
      '--theme-secondary': '#c87941',
      '--theme-secondary-dark': '#b55a23',
      '--theme-secondary-light': '#d99b6f',
      '--theme-accent': '#cd853f',
      '--theme-accent-dark': '#b5722f',
      '--theme-accent-light': '#daa56f',
      '--theme-bg-primary': '#faf6f1',
      '--theme-bg-secondary': '#f5ebe0',
      '--theme-bg-tertiary': '#e8dcc9',
      '--theme-text-primary': '#3e2723',
      '--theme-text-secondary': '#5d4037',
      '--theme-text-tertiary': '#795548',
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#d7ccc8',
      '--theme-border-medium': '#bcaaa4',
      '--theme-border-dark': '#a1887f',
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-text': '#5d4037',
      '--navbar-text-hover': '#6d4c41',
      '--navbar-border': '#d7ccc8',
      '--navbar-shadow': '0 2px 12px rgba(62, 39, 35, 0.08)',
      '--navbar-brand-color': '#6d4c41',
      '--navbar-icon-color': '#795548',
      '--navbar-icon-hover': '#c87941',
      '--hero-bg-start': '#faf6f1',
      '--hero-bg-end': '#f5ebe0',
      '--hero-title-color': '#3e2723',
      '--hero-subtitle-color': '#5d4037',
      '--hero-accent-color': '#6d4c41',
      '--card-bg': '#ffffff',
      '--card-border': '#d7ccc8',
      '--card-shadow': '0 4px 6px rgba(62, 39, 35, 0.08)',
      '--card-shadow-hover': '0 20px 25px rgba(62, 39, 35, 0.15)',
      '--card-title-color': '#3e2723',
      '--card-text-color': '#5d4037',
      '--card-price-color': '#c87941',
      '--btn-primary-bg': '#6d4c41',
      '--btn-primary-hover': '#5d4037',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#c87941',
      '--btn-secondary-text': '#c87941',
      '--footer-bg': '#3e2723',
      '--footer-text': '#d7ccc8',
      '--footer-heading': '#c87941',
      '--footer-link-hover': '#daa56f',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(62, 39, 35, 0.8)',
      '--carousel-nav-hover': 'rgba(62, 39, 35, 0.9)',
      '--carousel-indicator-inactive': 'rgba(62, 39, 35, 0.4)',
      '--carousel-indicator-active': '#3e2723'
    }
  },

  girasol: {
    id: 'girasol',
    name: 'Girasol',
    description: 'Energía brillante con amarillos y naranjas vibrantes',
    icon: '🌻',
    category: 'premium',
    variables: {
      '--theme-primary': '#d97706',
      '--theme-primary-dark': '#b45309',
      '--theme-primary-light': '#f59e0b',
      '--theme-primary-hover': '#92400e',
      '--theme-secondary': '#fb923c',
      '--theme-secondary-dark': '#f97316',
      '--theme-secondary-light': '#fdba74',
      '--theme-accent': '#eab308',
      '--theme-accent-dark': '#ca8a04',
      '--theme-accent-light': '#fde047',
      '--theme-bg-primary': '#fffbeb',
      '--theme-bg-secondary': '#fef9c3',
      '--theme-bg-tertiary': '#fde68a',
      '--theme-text-primary': '#7c2d12',
      '--theme-text-secondary': '#7c2d12',
      '--theme-text-tertiary': '#92400e',
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#fcd34d',
      '--theme-border-medium': '#fbbf24',
      '--theme-border-dark': '#f59e0b',
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-text': '#7c2d12',
      '--navbar-text-hover': '#d97706',
      '--navbar-border': '#fcd34d',
      '--navbar-shadow': '0 2px 12px rgba(120, 53, 15, 0.08)',
      '--navbar-brand-color': '#d97706',
      '--navbar-icon-color': '#7c2d12',
      '--navbar-icon-hover': '#fb923c',
      '--hero-bg-start': '#fffbeb',
      '--hero-bg-end': '#fef9c3',
      '--hero-title-color': '#7c2d12',
      '--hero-subtitle-color': '#7c2d12',
      '--hero-accent-color': '#d97706',
      '--card-bg': '#ffffff',
      '--card-border': '#fcd34d',
      '--card-shadow': '0 4px 6px rgba(120, 53, 15, 0.08)',
      '--card-shadow-hover': '0 20px 25px rgba(120, 53, 15, 0.15)',
      '--card-title-color': '#7c2d12',
      '--card-text-color': '#7c2d12',
      '--card-price-color': '#f97316',
      '--btn-primary-bg': '#d97706',
      '--btn-primary-hover': '#b45309',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#d97706',
      '--btn-secondary-text': '#d97706',
      '--footer-bg': '#7c2d12',
      '--footer-text': '#fef3c7',
      '--footer-heading': '#fbbf24',
      '--footer-link-hover': '#fde68a',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(120, 53, 15, 0.8)',
      '--carousel-nav-hover': 'rgba(120, 53, 15, 0.9)',
      '--carousel-indicator-inactive': 'rgba(120, 53, 15, 0.4)',
      '--carousel-indicator-active': '#7c2d12'
    }
  },

  highContrastLight: {
    id: 'highContrastLight',
    name: 'Alto Contraste Claro',
    description: 'Máxima legibilidad con fondo blanco - WCAG AAA',
    icon: '🔆',
    category: 'accessibility',
    variables: {
      '--theme-primary': '#000000',
      '--theme-primary-dark': '#000000',
      '--theme-primary-light': '#1a1a1a',
      '--theme-primary-hover': '#1a1a1a',
      '--theme-secondary': '#0000ff',
      '--theme-secondary-dark': '#0000cc',
      '--theme-secondary-light': '#3333ff',
      '--theme-accent': '#cc0000',
      '--theme-accent-dark': '#990000',
      '--theme-accent-light': '#ff0000',
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#ffffff',
      '--theme-bg-tertiary': '#f0f0f0',
      '--theme-text-primary': '#000000',
      '--theme-text-secondary': '#000000',
      '--theme-text-tertiary': '#1a1a1a',
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#000000',
      '--theme-border-medium': '#000000',
      '--theme-border-dark': '#000000',
      '--navbar-bg': 'rgba(255, 255, 255, 1)',
      '--navbar-text': '#000000',
      '--navbar-text-hover': '#0000ff',
      '--navbar-border': '#000000',
      '--navbar-shadow': '0 2px 12px rgba(0, 0, 0, 0.3)',
      '--navbar-brand-color': '#000000',
      '--navbar-icon-color': '#000000',
      '--navbar-icon-hover': '#0000ff',
      '--hero-bg-start': '#ffffff',
      '--hero-bg-end': '#ffffff',
      '--hero-title-color': '#000000',
      '--hero-subtitle-color': '#000000',
      '--hero-accent-color': '#0000ff',
      '--card-bg': '#ffffff',
      '--card-border': '#000000',
      '--card-shadow': '0 4px 6px rgba(0, 0, 0, 0.3)',
      '--card-shadow-hover': '0 8px 12px rgba(0, 0, 0, 0.4)',
      '--card-title-color': '#000000',
      '--card-text-color': '#000000',
      '--card-price-color': '#cc0000',
      '--btn-primary-bg': '#000000',
      '--btn-primary-hover': '#1a1a1a',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': '#ffffff',
      '--btn-secondary-border': '#000000',
      '--btn-secondary-text': '#000000',
      '--footer-bg': '#000000',
      '--footer-text': '#ffffff',
      '--footer-heading': '#ffffff',
      '--footer-link-hover': '#cccccc',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(0, 0, 0, 1)',
      '--carousel-nav-hover': 'rgba(26, 26, 26, 1)',
      '--carousel-indicator-inactive': 'rgba(0, 0, 0, 0.5)',
      '--carousel-indicator-active': '#000000'
    }
  },

  corkVampiro: {
    id: 'corkVampiro',
    name: 'Corcho Vampírico',
    description: 'Fondo de corcho oscuro con flores azules etéreas y gotas de sangre',
    icon: '🦇🌹',
    category: 'premium',
    variables: {
      '--theme-primary': '#4c1d95',
      '--theme-primary-dark': '#3730a3',
      '--theme-primary-light': '#6d28d9',
      '--theme-secondary': '#0891b2',
      '--theme-secondary-dark': '#0e7490',
      '--theme-secondary-light': '#06b6d4',
      '--theme-accent': '#dc2626',
      '--theme-accent-dark': '#b91c1c',
      '--theme-accent-light': '#ef4444',
      '--theme-bg-primary': '#1c1612',
      '--theme-bg-secondary': '#2a1f1a',
      '--theme-bg-tertiary': '#3d2f24',
      '--theme-text-primary': '#e0e7ff',
      '--theme-text-secondary': '#c7d2fe',
      '--theme-text-tertiary': '#a5b4fc',
      '--theme-text-inverted': '#1c1612',
      '--theme-border-light': '#3730a3',
      '--theme-border-medium': '#4c1d95',
      '--theme-border-dark': '#6d28d9',
      '--navbar-bg': 'rgba(28, 22, 18, 0.98)',
      '--navbar-text': '#e0e7ff',
      '--navbar-text-hover': '#c7d2fe',
      '--navbar-border': '#4c1d95',
      '--navbar-shadow': '0 2px 12px rgba(220, 38, 38, 0.3)',
      '--navbar-brand-color': '#6d28d9',
      '--navbar-icon-color': '#a5b4fc',
      '--navbar-icon-hover': '#c7d2fe',
      '--hero-bg-start': '#1c1612',
      '--hero-bg-end': '#2a1f1a',
      '--hero-title-color': '#e0e7ff',
      '--hero-subtitle-color': '#c7d2fe',
      '--hero-accent-color': '#dc2626',
      '--card-bg': '#2a1f1a',
      '--card-border': '#4c1d95',
      '--card-shadow': '0 4px 12px rgba(76, 29, 149, 0.3), 0 0 20px rgba(220, 38, 38, 0.15)',
      '--card-shadow-hover': '0 8px 20px rgba(76, 29, 149, 0.4), 0 0 30px rgba(220, 38, 38, 0.25)',
      '--card-title-color': '#ffffff',
      '--card-text-color': '#e0e7ff',
      '--card-price-color': '#ef4444',
      '--btn-primary-bg': '#6d28d9',
      '--btn-primary-hover': '#4c1d95',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#06b6d4',
      '--btn-secondary-text': '#06b6d4',
      '--footer-bg': '#0f0908',
      '--footer-text': '#a5b4fc',
      '--footer-heading': '#e0e7ff',
      '--footer-link-hover': '#c7d2fe',
      '--carousel-bg': '#2a1f1a',
      '--carousel-nav-bg': 'rgba(76, 29, 149, 0.8)',
      '--carousel-nav-hover': 'rgba(109, 40, 217, 0.9)',
      '--carousel-indicator-inactive': 'rgba(224, 231, 255, 0.3)',
      '--carousel-indicator-active': '#e0e7ff'
    }
  },

  neonCyberpunk: {
    id: 'neonCyberpunk',
    name: 'Neon Cyberpunk Mejorado',
    description: 'Futuro cyberpunk con neón vibrante y contraste AAA garantizado',
    icon: '🌃💜',
    category: 'premium',
    variables: {
      '--theme-primary': '#ff006e',
      '--theme-primary-dark': '#d4006a',
      '--theme-primary-light': '#ff1a7f',
      '--theme-secondary': '#00f5ff',
      '--theme-secondary-dark': '#00d4e6',
      '--theme-secondary-light': '#1affff',
      '--theme-accent': '#ffb700',
      '--theme-accent-dark': '#e6a500',
      '--theme-accent-light': '#ffcc1a',
      '--theme-bg-primary': '#0a0a0a',
      '--theme-bg-secondary': '#1a1a1a',
      '--theme-bg-tertiary': '#2a2a2a',
      '--theme-text-primary': '#ffffff', // MANTENIDO: contraste perfecto con fondo negro
      '--theme-text-secondary': '#f1f5f9', // CAMBIADO: mucho más claro para mejor contraste
      '--theme-text-tertiary': '#cbd5e1', // CAMBIADO: mejor contraste que #999999
      '--theme-text-inverted': '#0a0a0a',
      '--theme-border-light': '#6d28d9', // CAMBIADO: morado oscuro para mejor contraste
      '--theme-border-medium': '#8b5cf6', // CAMBIADO: morado medio para mejor contraste
      '--theme-border-dark': '#a78bfa', // CAMBIADO: morado claro para mejor contraste
      '--navbar-bg': 'rgba(10, 10, 10, 0.98)', // AUMENTADO: opacidad para mejor contraste
      '--navbar-text': '#f8fafc', // CAMBIADO: mucho más claro para contraste
      '--navbar-text-hover': '#00f5ff', // MANTENIDO: color neón para hover
      '--navbar-border': '#4c1d95', // CAMBIADO: morado oscuro para borde
      '--navbar-shadow': '0 2px 20px rgba(76, 29, 149, 0.4)', // AJUSTADO: sombra con color de contraste
      '--navbar-brand-color': '#00f5ff', // MANTENIDO: color neón para marca
      '--navbar-icon-color': '#e2e8f0', // CAMBIADO: iconos más claros
      '--navbar-icon-hover': '#00f5ff', // MANTENIDO: hover en color neón
      '--hero-bg-start': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)', // MEJORADO: gradiente para contraste
      '--hero-bg-end': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      '--hero-title-color': '#ffffff', // MANTENIDO: blanco puro para contraste
      '--hero-subtitle-color': '#f1f5f9', // CAMBIADO: mucho más claro
      '--hero-accent-color': '#00f5ff', // MANTENIDO: color neón para acentos
      '--card-bg': '#1a1a1a', // MANTENIDO: contraste con texto
      '--card-border': '#6d28d9', // CAMBIADO: borde morado para mejor contraste
      '--card-shadow': '0 4px 15px rgba(76, 29, 149, 0.4), 0 0 25px rgba(109, 40, 217, 0.2)', // AJUSTADO: sombra con mejor contraste
      '--card-shadow-hover': '0 8px 25px rgba(76, 29, 149, 0.6), 0 0 35px rgba(109, 40, 217, 0.3)',
      '--card-title-color': '#ffffff', // MANTENIDO: blanco puro para contraste
      '--card-text-color': '#e2e8f0', // CAMBIADO: texto más claro
      '--card-price-color': '#00f5ff', // CAMBIADO: color neón para precios
      '--btn-primary-bg': '#ff006e', // MANTENIDO: botón primario neón
      '--btn-primary-hover': '#ff1a7f', // CAMBIADO: hover más claro para mejor contraste
      '--btn-primary-text': '#ffffff', // MANTENIDO: texto blanco para contraste
      '--btn-secondary-bg': 'rgba(0, 245, 255, 0.1)', // AJUSTADO: fondo transparente con tono
      '--btn-secondary-border': '#00f5ff', // MANTENIDO: borde en color neón
      '--btn-secondary-text': '#00f5ff', // MANTENIDO: texto en color neón
      '--footer-bg': '#0f0908', // MANTENIDO: fondo oscuro
      '--footer-text': '#e2e8f0', // CAMBIADO: texto más claro para footer
      '--footer-heading': '#00f5ff', // CAMBIADO: títulos en color neón
      '--footer-link-hover': '#60a5fa', // CAMBIADO: links con mejor contraste
      '--carousel-bg': '#1a1a1a', // MANTENIDO: fondo oscuro para carousel
      '--carousel-nav-bg': 'rgba(109, 40, 217, 0.8)', // CAMBIADO: nav con mejor contraste
      '--carousel-nav-hover': 'rgba(0, 245, 255, 0.9)', // MANTENIDO: hover en color neón
      '--carousel-indicator-inactive': 'rgba(226, 232, 240, 0.3)', // CAMBIADO: indicadores más claros
      '--carousel-indicator-active': '#00f5ff' // CAMBIADO: indicador activo en color neón
    }
  },

  halloween: {
    id: 'halloween',
    name: 'Halloween',
    description: 'Noche de brujas con calabazas terroríficas y telarañas',
    icon: '🎃',
    category: 'seasonal',
    variables: {
      '--theme-primary': '#ff6b35',
      '--theme-primary-dark': '#e55a2b',
      '--theme-primary-light': '#ff8a65',
      '--theme-secondary': '#ff9f1c',
      '--theme-secondary-dark': '#e68900',
      '--theme-secondary-light': '#ffb727',
      '--theme-accent': '#c92a2a',
      '--theme-accent-dark': '#a61e1e',
      '--theme-accent-light': '#e03131',
      '--theme-bg-primary': '#1a0f0a',
      '--theme-bg-secondary': '#2d1810',
      '--theme-bg-tertiary': '#402015',
      '--theme-text-primary': '#ffec99',
      '--theme-text-secondary': '#ffd43b',
      '--theme-text-tertiary': '#fab005',
      '--theme-text-inverted': '#1a0f0a',
      '--theme-border-light': '#ff6b35',
      '--theme-border-medium': '#ff9f1c',
      '--theme-border-dark': '#c92a2a',
      '--navbar-bg': 'rgba(26, 15, 10, 0.98)',
      '--navbar-text': '#ffec99',
      '--navbar-text-hover': '#ffd43b',
      '--navbar-border': '#ff6b35',
      '--navbar-shadow': '0 2px 12px rgba(255, 107, 53, 0.4)',
      '--navbar-brand-color': '#ff9f1c',
      '--navbar-icon-color': '#ffd43b',
      '--navbar-icon-hover': '#ffec99',
      '--hero-bg-start': '#1a0f0a',
      '--hero-bg-end': '#2d1810',
      '--hero-title-color': '#ffec99',
      '--hero-subtitle-color': '#ffd43b',
      '--hero-accent-color': '#c92a2a',
      '--card-bg': '#2d1810',
      '--card-border': '#ff6b35',
      '--card-shadow': '0 4px 12px rgba(255, 107, 53, 0.4), 0 0 20px rgba(255, 159, 28, 0.2)',
      '--card-shadow-hover': '0 8px 20px rgba(255, 107, 53, 0.6), 0 0 30px rgba(255, 159, 28, 0.3)',
      '--card-title-color': '#ffffff',
      '--card-text-color': '#ffec99',
      '--card-price-color': '#c92a2a',
      '--btn-primary-bg': '#ff6b35',
      '--btn-primary-hover': '#e55a2b',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#ff9f1c',
      '--btn-secondary-text': '#ff9f1c',
      '--footer-bg': '#0a0503',
      '--footer-text': '#ffd43b',
      '--footer-heading': '#ffec99',
      '--footer-link-hover': '#ff8a65',
      '--carousel-bg': '#2d1810',
      '--carousel-nav-bg': 'rgba(255, 107, 53, 0.8)',
      '--carousel-nav-hover': 'rgba(255, 159, 28, 0.9)',
      '--carousel-indicator-inactive': 'rgba(255, 236, 153, 0.3)',
      '--carousel-indicator-active': '#ff9f1c'
    }
  },

  navidad: {
    id: 'navidad',
    name: 'Navidad',
    description: 'Espíritu navideño con nieve, árboles y luces festivas',
    icon: '🎄',
    category: 'seasonal',
    variables: {
      '--theme-primary': '#0f5132',
      '--theme-primary-dark': '#0a3622',
      '--theme-primary-light': '#198754',
      '--theme-secondary': '#d63384',
      '--theme-secondary-dark': '#b02a5b',
      '--theme-secondary-light': '#e83e8c',
      '--theme-accent': '#ffc107',
      '--theme-accent-dark': '#e0a800',
      '--theme-accent-light': '#ffcd39',
      '--theme-bg-primary': '#0a192f',
      '--theme-bg-secondary': '#172a46',
      '--theme-bg-tertiary': '#1e3a5f',
      '--theme-text-primary': '#e8f5e8',
      '--theme-text-secondary': '#cfe1c9',
      '--theme-text-tertiary': '#b7d4b0',
      '--theme-text-inverted': '#0a192f',
      '--theme-border-light': '#198754',
      '--theme-border-medium': '#0f5132',
      '--theme-border-dark': '#0a3622',
      '--navbar-bg': 'rgba(10, 25, 47, 0.98)',
      '--navbar-text': '#e8f5e8',
      '--navbar-text-hover': '#ffc107',
      '--navbar-border': '#198754',
      '--navbar-shadow': '0 2px 12px rgba(15, 81, 50, 0.4)',
      '--navbar-brand-color': '#198754',
      '--navbar-icon-color': '#cfe1c9',
      '--navbar-icon-hover': '#ffc107',
      '--hero-bg-start': '#0a192f',
      '--hero-bg-end': '#172a46',
      '--hero-title-color': '#e8f5e8',
      '--hero-subtitle-color': '#cfe1c9',
      '--hero-accent-color': '#d63384',
      '--card-bg': '#172a46',
      '--card-border': '#198754',
      '--card-shadow': '0 4px 12px rgba(15, 81, 50, 0.3), 0 0 20px rgba(214, 51, 132, 0.15)',
      '--card-shadow-hover': '0 8px 20px rgba(15, 81, 50, 0.4), 0 0 30px rgba(214, 51, 132, 0.25)',
      '--card-title-color': '#ffffff',
      '--card-text-color': '#e8f5e8',
      '--card-price-color': '#d63384',
      '--btn-primary-bg': '#198754',
      '--btn-primary-hover': '#0f5132',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#d63384',
      '--btn-secondary-text': '#d63384',
      '--footer-bg': '#050d1a',
      '--footer-text': '#cfe1c9',
      '--footer-heading': '#e8f5e8',
      '--footer-link-hover': '#ffcd39',
      '--carousel-bg': '#172a46',
      '--carousel-nav-bg': 'rgba(15, 81, 50, 0.8)',
      '--carousel-nav-hover': 'rgba(214, 51, 132, 0.9)',
      '--carousel-indicator-inactive': 'rgba(232, 245, 232, 0.3)',
      '--carousel-indicator-active': '#ffc107'
    }
  },

  finDeAno: {
    id: 'finDeAno',
    name: 'Fin de Año',
    description: 'Celebración con fuegos artificiales y brillos dorados',
    icon: '🎊',
    category: 'seasonal',
    variables: {
      '--theme-primary': '#6f42c1',
      '--theme-primary-dark': '#5a2d91',
      '--theme-primary-light': '#805ad5',
      '--theme-secondary': '#ffd700',
      '--theme-secondary-dark': '#e6c200',
      '--theme-secondary-light': '#ffed4e',
      '--theme-accent': '#ff6b6b',
      '--theme-accent-dark': '#fa5252',
      '--theme-accent-light': '#ff8787',
      '--theme-bg-primary': '#0f0e1a',
      '--theme-bg-secondary': '#1a1927',
      '--theme-bg-tertiary': '#2a2844',
      '--theme-text-primary': '#f8f9fa',
      '--theme-text-secondary': '#e9ecef',
      '--theme-text-tertiary': '#dee2e6',
      '--theme-text-inverted': '#0f0e1a',
      '--theme-border-light': '#6f42c1',
      '--theme-border-medium': '#ffd700',
      '--theme-border-dark': '#ff6b6b',
      '--navbar-bg': 'rgba(15, 14, 26, 0.98)',
      '--navbar-text': '#f8f9fa',
      '--navbar-text-hover': '#ffd700',
      '--navbar-border': '#6f42c1',
      '--navbar-shadow': '0 2px 12px rgba(111, 66, 193, 0.4)',
      '--navbar-brand-color': '#ffd700',
      '--navbar-icon-color': '#e9ecef',
      '--navbar-icon-hover': '#ff6b6b',
      '--hero-bg-start': '#0f0e1a',
      '--hero-bg-end': '#1a1927',
      '--hero-title-color': '#f8f9fa',
      '--hero-subtitle-color': '#e9ecef',
      '--hero-accent-color': '#ffd700',
      '--card-bg': '#1a1927',
      '--card-border': '#6f42c1',
      '--card-shadow': '0 4px 12px rgba(111, 66, 193, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)',
      '--card-shadow-hover': '0 8px 20px rgba(111, 66, 193, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)',
      '--card-title-color': '#ffffff',
      '--card-text-color': '#f8f9fa',
      '--card-price-color': '#ffd700',
      '--btn-primary-bg': '#6f42c1',
      '--btn-primary-hover': '#5a2d91',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#ffd700',
      '--btn-secondary-text': '#ffd700',
      '--footer-bg': '#050508',
      '--footer-text': '#e9ecef',
      '--footer-heading': '#f8f9fa',
      '--footer-link-hover': '#ffed4e',
      '--carousel-bg': '#1a1927',
      '--carousel-nav-bg': 'rgba(111, 66, 193, 0.8)',
      '--carousel-nav-hover': 'rgba(255, 215, 0, 0.9)',
      '--carousel-indicator-inactive': 'rgba(248, 249, 250, 0.3)',
      '--carousel-indicator-active': '#ffd700'
    }
  },

  carnaval: {
    id: 'carnaval',
    name: 'Carnaval',
    description: 'Fiesta brasileña con confeti, serpentinas y colores vibrantes',
    icon: '🎉',
    category: 'seasonal',
    variables: {
      '--theme-primary': '#00a8e8',
      '--theme-primary-dark': '#0088c4',
      '--theme-primary-light': '#33b8f0',
      '--theme-secondary': '#ff006e',
      '--theme-secondary-dark': '#e6005f',
      '--theme-secondary-light': '#ff1a7f',
      '--theme-accent': '#ffbe0b',
      '--theme-accent-dark': '#e6a500',
      '--theme-accent-light': '#ffcc33',
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#f8f9fa',
      '--theme-bg-tertiary': '#e9ecef',
      '--theme-text-primary': '#212529',
      '--theme-text-secondary': '#495057',
      '--theme-text-tertiary': '#6c757d',
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#00a8e8',
      '--theme-border-medium': '#ff006e',
      '--theme-border-dark': '#ffbe0b',
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-text': '#212529',
      '--navbar-text-hover': '#00a8e8',
      '--navbar-border': '#00a8e8',
      '--navbar-shadow': '0 2px 12px rgba(0, 168, 232, 0.3)',
      '--navbar-brand-color': '#ff006e',
      '--navbar-icon-color': '#495057',
      '--navbar-icon-hover': '#ffbe0b',
      '--hero-bg-start': '#ffffff',
      '--hero-bg-end': '#f8f9fa',
      '--hero-title-color': '#212529',
      '--hero-subtitle-color': '#495057',
      '--hero-accent-color': '#ff006e',
      '--card-bg': '#ffffff',
      '--card-border': '#00a8e8',
      '--card-shadow': '0 4px 12px rgba(0, 168, 232, 0.3), 0 0 20px rgba(255, 0, 110, 0.15)',
      '--card-shadow-hover': '0 8px 20px rgba(0, 168, 232, 0.4), 0 0 30px rgba(255, 190, 11, 0.25)',
      '--card-title-color': '#212529',
      '--card-text-color': '#495057',
      '--card-price-color': '#ff006e',
      '--btn-primary-bg': '#00a8e8',
      '--btn-primary-hover': '#0088c4',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#ff006e',
      '--btn-secondary-text': '#ff006e',
      '--footer-bg': '#00a8e8',
      '--footer-text': '#ffffff',
      '--footer-heading': '#ffffff',
      '--footer-link-hover': '#ffbe0b',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(0, 168, 232, 0.8)',
      '--carousel-nav-hover': 'rgba(255, 0, 110, 0.9)',
      '--carousel-indicator-inactive': 'rgba(33, 37, 41, 0.3)',
      '--carousel-indicator-active': '#ff006e'
    }
  },

  semanaSanta: {
    id: 'semanaSanta',
    name: 'Semana Santa',
    description: 'Semana Santa con violeta sobrio y símbolos religiosos',
    icon: '✝️',
    category: 'seasonal',
    variables: {
      '--theme-primary': '#4c1d95',
      '--theme-primary-dark': '#3730a3',
      '--theme-primary-light': '#6d28d9',
      '--theme-secondary': '#7c2d12',
      '--theme-secondary-dark': '#5a1f08',
      '--theme-secondary-light': '#9a3412',
      '--theme-accent': '#a21caf',
      '--theme-accent-dark': '#86198f',
      '--theme-accent-light': '#c026d3',
      '--theme-bg-primary': '#faf7ff',
      '--theme-bg-secondary': '#f3e8ff',
      '--theme-bg-tertiary': '#e9d5ff',
      '--theme-text-primary': '#2e1065',
      '--theme-text-secondary': '#4c1d95',
      '--theme-text-tertiary': '#6d28d9',
      '--theme-text-inverted': '#faf7ff',
      '--theme-border-light': '#4c1d95',
      '--theme-border-medium': '#7c2d12',
      '--theme-border-dark': '#a21caf',
      '--navbar-bg': 'rgba(250, 247, 255, 0.98)',
      '--navbar-text': '#2e1065',
      '--navbar-text-hover': '#4c1d95',
      '--navbar-border': '#4c1d95',
      '--navbar-shadow': '0 2px 12px rgba(76, 29, 149, 0.2)',
      '--navbar-brand-color': '#4c1d95',
      '--navbar-icon-color': '#4c1d95',
      '--navbar-icon-hover': '#a21caf',
      '--hero-bg-start': '#faf7ff',
      '--hero-bg-end': '#f3e8ff',
      '--hero-title-color': '#2e1065',
      '--hero-subtitle-color': '#4c1d95',
      '--hero-accent-color': '#7c2d12',
      '--card-bg': '#ffffff',
      '--card-border': '#4c1d95',
      '--card-shadow': '0 4px 12px rgba(76, 29, 149, 0.2), 0 0 20px rgba(162, 28, 175, 0.1)',
      '--card-shadow-hover': '0 8px 20px rgba(76, 29, 149, 0.3), 0 0 30px rgba(124, 45, 18, 0.15)',
      '--card-title-color': '#2e1065',
      '--card-text-color': '#4c1d95',
      '--card-price-color': '#7c2d12',
      '--btn-primary-bg': '#4c1d95',
      '--btn-primary-hover': '#3730a3',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#7c2d12',
      '--btn-secondary-text': '#7c2d12',
      '--footer-bg': '#2e1065',
      '--footer-text': '#e9d5ff',
      '--footer-heading': '#faf7ff',
      '--footer-link-hover': '#c026d3',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(76, 29, 149, 0.8)',
      '--carousel-nav-hover': 'rgba(162, 28, 175, 0.9)',
      '--carousel-indicator-inactive': 'rgba(46, 16, 101, 0.3)',
      '--carousel-indicator-active': '#7c2d12'
    }
  },

  vacaciones: {
    id: 'vacaciones',
    name: 'Vacaciones',
    description: 'Paraíso tropical con palmeras, arena y sol brillante',
    icon: '🏖️',
    category: 'seasonal',
    variables: {
      '--theme-primary': '#0891b2',
      '--theme-primary-dark': '#0c7a89',
      '--theme-primary-light': '#22d3ee',
      '--theme-secondary': '#f97316',
      '--theme-secondary-dark': '#c2410c',
      '--theme-secondary-light': '#fb923c',
      '--theme-accent': '#84cc16',
      '--theme-accent-dark': '#4d7c0f',
      '--theme-accent-light': '#a3e635',
      '--theme-bg-primary': '#fefce8',
      '--theme-bg-secondary': '#fef9c3',
      '--theme-bg-tertiary': '#fde68a',
      '--theme-text-primary': '#0c4a6e',
      '--theme-text-secondary': '#075985',
      '--theme-text-tertiary': '#0284c7',
      '--theme-text-inverted': '#fefce8',
      '--theme-border-light': '#0891b2',
      '--theme-border-medium': '#f97316',
      '--theme-border-dark': '#84cc16',
      '--navbar-bg': 'rgba(254, 252, 232, 0.98)',
      '--navbar-text': '#0c4a6e',
      '--navbar-text-hover': '#f97316',
      '--navbar-border': '#0891b2',
      '--navbar-shadow': '0 2px 12px rgba(8, 145, 178, 0.2)',
      '--navbar-brand-color': '#0891b2',
      '--navbar-icon-color': '#075985',
      '--navbar-icon-hover': '#f97316',
      '--hero-bg-start': '#fefce8',
      '--hero-bg-end': '#fef9c3',
      '--hero-title-color': '#0c4a6e',
      '--hero-subtitle-color': '#075985',
      '--hero-accent-color': '#f97316',
      '--card-bg': '#ffffff',
      '--card-border': '#0891b2',
      '--card-shadow': '0 4px 12px rgba(8, 145, 178, 0.3), 0 0 20px rgba(249, 115, 22, 0.15)',
      '--card-shadow-hover': '0 8px 20px rgba(8, 145, 178, 0.4), 0 0 30px rgba(132, 204, 22, 0.25)',
      '--card-title-color': '#0c4a6e',
      '--card-text-color': '#075985',
      '--card-price-color': '#f97316',
      '--btn-primary-bg': '#0891b2',
      '--btn-primary-hover': '#0c7a89',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#f97316',
      '--btn-secondary-text': '#f97316',
      '--footer-bg': '#0c4a6e',
      '--footer-text': '#fef9c3',
      '--footer-heading': '#fefce8',
      '--footer-link-hover': '#fde68a',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(8, 145, 178, 0.8)',
      '--carousel-nav-hover': 'rgba(249, 115, 22, 0.9)',
      '--carousel-indicator-inactive': 'rgba(12, 74, 110, 0.3)',
      '--carousel-indicator-active': '#f97316'
    }
  },

  highContrastDark: {
    id: 'highContrastDark',
    name: 'Alto Contraste Oscuro',
    description: 'Máxima legibilidad con fondo carbón - WCAG AAA',
    icon: '🔅',
    category: 'accessibility',
    variables: {
      '--theme-primary': '#ffffe0',
      '--theme-primary-dark': '#ffffcc',
      '--theme-primary-light': '#fffff0',
      '--theme-primary-hover': '#ffffd0',
      '--theme-secondary': '#00ff00',
      '--theme-secondary-dark': '#00cc00',
      '--theme-secondary-light': '#33ff33',
      '--theme-accent': '#ffff00',
      '--theme-accent-dark': '#cccc00',
      '--theme-accent-light': '#ffff66',
      '--theme-bg-primary': '#1a1a1a',
      '--theme-bg-secondary': '#1a1a1a',
      '--theme-bg-tertiary': '#2a2a2a',
      '--theme-text-primary': '#ffffe0',
      '--theme-text-secondary': '#ffffe0',
      '--theme-text-tertiary': '#ffffcc',
      '--theme-text-inverted': '#1a1a1a',
      '--theme-border-light': '#ffffe0',
      '--theme-border-medium': '#ffffe0',
      '--theme-border-dark': '#ffffe0',
      '--navbar-bg': 'rgba(26, 26, 26, 1)',
      '--navbar-text': '#ffffe0',
      '--navbar-text-hover': '#ffff00',
      '--navbar-border': '#ffffe0',
      '--navbar-shadow': '0 2px 12px rgba(255, 255, 224, 0.3)',
      '--navbar-brand-color': '#ffffe0',
      '--navbar-icon-color': '#ffffe0',
      '--navbar-icon-hover': '#ffff00',
      '--hero-bg-start': '#1a1a1a',
      '--hero-bg-end': '#1a1a1a',
      '--hero-title-color': '#ffffe0',
      '--hero-subtitle-color': '#ffffe0',
      '--hero-accent-color': '#ffff00',
      '--card-bg': '#1a1a1a',
      '--card-border': '#ffffe0',
      '--card-shadow': '0 4px 6px rgba(255, 255, 224, 0.3)',
      '--card-shadow-hover': '0 8px 12px rgba(255, 255, 224, 0.4)',
      '--card-title-color': '#ffffe0',
      '--card-text-color': '#ffffe0',
      '--card-price-color': '#00ff00',
      '--btn-primary-bg': '#ffffe0',
      '--btn-primary-hover': '#ffffcc',
      '--btn-primary-text': '#1a1a1a',
      '--btn-secondary-bg': '#1a1a1a',
      '--btn-secondary-border': '#ffffe0',
      '--btn-secondary-text': '#ffffe0',
      '--footer-bg': '#ffffe0',
      '--footer-text': '#1a1a1a',
      '--footer-heading': '#1a1a1a',
      '--footer-link-hover': '#2a2a2a',
      '--carousel-bg': '#1a1a1a',
      '--carousel-nav-bg': 'rgba(255, 255, 224, 1)',
      '--carousel-nav-hover': 'rgba(255, 255, 204, 1)',
      '--carousel-indicator-inactive': 'rgba(255, 255, 224, 0.5)',
      '--carousel-indicator-active': '#ffffe0'
    }
  }
}

// Aplicar expansión granular a todos los temas
const expandedThemes = {}
Object.entries(themes).forEach(([key, theme]) => {
  expandedThemes[key] = expandThemeWithGranularVars(theme)
})

// Reemplazar con temas expandidos
Object.keys(themes).forEach(key => {
  delete themes[key]
})
Object.assign(themes, expandedThemes)

// Exportar la función para que otros módulos puedan usarla
export { expandThemeWithGranularVars }

export const DEFAULT_THEME = 'light'
export const THEME_STORAGE_KEY = 'floresya-theme-preference'

/**
 * Obtiene lista de temas por categoría
 * @param {string} category - Categoría del tema
 * @returns {Array} Lista de temas filtrados
 */
export function getThemesByCategory(category) {
  return Object.values(themes).filter(theme => theme.category === category)
}

/**
 * Obtiene información de un tema
 * @param {string} themeId - ID del tema
 * @returns {Object} Objeto del tema o tema por defecto
 */
export function getTheme(themeId) {
  return themes[themeId] || themes[DEFAULT_THEME]
}
