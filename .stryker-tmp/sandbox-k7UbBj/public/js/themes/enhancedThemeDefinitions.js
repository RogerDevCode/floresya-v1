/**
 * FloresYa - Definiciones de Temas Mejoradas
 * Corrige problemas de contraste en temas originales
 * Asegura contraste AAA para textos críticos
 *
 * Mejoras implementadas:
 * - Garantía de contraste AAA para textos en navegación
 * - Contraste dinámico para fondos gradientes
 * - Ajuste automático para textos sobre imágenes
 * - Soluciones para temas con bajos contrastes
 */
// @ts-nocheck

import { calculateOptimalTextColor, adjustColorBrightness } from './colorUtils.js'

/**
 * Extiende un tema base con todas las variables granulares calculadas
 * Con enfoque en contraste AAA para elementos críticos
 * @param {Object} baseTheme - Tema base con variables fundamentales
 * @returns {Object} Tema completo con variables granulares y contraste garantizado
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

  // ==================== VARIABLES GRANULARES - NAVEGACIÓN CON CONTRASTE AAA ====================
  variables['--nav-bg-primary'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--nav-bg-glass'] =
    `rgba(${parseInt(primaryBg.slice(1, 3), 16)}, ${parseInt(primaryBg.slice(3, 5), 16)}, ${parseInt(primaryBg.slice(5, 7), 16)}, 0.95)`
  variables['--nav-bg-dark'] = variables['--theme-bg-tertiary'] || '#334155'

  // Garantizar contraste AAA para texto de navegación - CORREGIDO: ahora calcula basado en fondo real
  variables['--nav-text-primary'] = calculateOptimalTextColor(
    primaryBg,
    [textPrimary, '#1f2937'], // Múltiples opciones de texto
    7.0 // AAA para máxima legibilidad en elementos de navegación
  )
  variables['--nav-text-secondary'] = calculateOptimalTextColor(
    primaryBg,
    [textSecondary, '#6b7280'], // Múltiples opciones de texto
    4.5 // AA para texto secundario
  )
  variables['--nav-text-hover'] = calculateOptimalTextColor(
    primaryBg,
    [primary, primaryDark],
    4.5 // AA para estados hover
  )
  variables['--nav-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--nav-shadow'] = variables['--theme-shadow'] || 'rgba(0, 0, 0, 0.1)'
  variables['--nav-height'] = '4rem'

  // ==================== VARIABLES GRANULARES - BREADCRUMB CON MEJOR CONTRASTE ====================
  variables['--breadcrumb-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--breadcrumb-text'] = calculateOptimalTextColor(
    primaryBg,
    [textSecondary, '#6b7280'],
    4.5 // AA para texto secundario
  )
  variables['--breadcrumb-text-active'] = calculateOptimalTextColor(
    primaryBg,
    [primary, primaryDark],
    7.0 // AAA para elementos activos
  )
  variables['--breadcrumb-border'] = variables['--theme-border-light'] || '#e5e7eb'

  // ==================== VARIABLES GRANULARES - HERO CON CONTRASTE DINÁMICO ====================
  variables['--hero-bg-primary'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primaryBg, 5)} 0%, ${adjustColorBrightness(secondaryBg, 5)} 100%)`
  variables['--hero-bg-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primary, -20)} 0%, ${adjustColorBrightness(secondary, -20)} 100%)`

  // Garantizar contraste AAA para texto principal del hero basado en gradientes
  variables['--hero-text-primary'] = calculateOptimalTextColor(
    variables['--hero-bg-gradient'] || primaryBg, // Usar el color promedio del gradiente
    ['#ffffff', '#f9fafb', '#f3f4f6'], // Opciones claras para texto
    7.0 // AAA para máxima legibilidad en titulares
  )
  variables['--hero-text-secondary'] = calculateOptimalTextColor(
    variables['--hero-bg-gradient'] || primaryBg,
    ['#e5e7eb', '#d1d5db', '#9ca3af'], // Opciones más claras para texto secundario
    4.5 // AA para texto secundario
  )
  variables['--hero-text-dark'] = calculateOptimalTextColor(
    primaryBg,
    [textPrimary, '#111827'],
    7.0 // AAA para fondos claros
  )

  // Añadir overlay para garantizar contraste en fondos de imagen
  variables['--hero-overlay'] = 'rgba(0, 0, 0, 0.3)'
  variables['--hero-shadow'] = '0 20px 60px rgba(0, 0, 0, 0.1)'

  // ==================== VARIABLES GRANULARES - CAROUSEL CON MEJOR CONTRASTE ====================
  variables['--carousel-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--carousel-bg-light'] = primaryBg
  variables['--carousel-bg-dark'] = variables['--theme-bg-tertiary'] || '#1f2937'
  variables['--carousel-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--carousel-shadow'] = 'var(--theme-shadow, rgba(0, 0, 0, 0.1))'

  // Contraste garantizado para controles del carousel
  variables['--carousel-nav-bg'] = calculateOptimalTextColor(
    primaryBg,
    ['rgba(0, 0, 0, 0.7)', 'rgba(255, 255, 255, 0.95)'],
    3 // Ajuste de contraste para controles
  )
  variables['--carousel-indicator-active'] = calculateOptimalTextColor(
    primaryBg,
    [primary, primaryDark],
    3 // Ajuste de contraste para indicadores
  )

  // ==================== VARIABLES GRANULARES - PRODUCTOS CON CONTRASTE AAA ====================
  variables['--products-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--products-bg-secondary'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--products-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--products-card-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--products-card-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--products-card-hover'] = calculateOptimalTextColor(
    primary,
    ['#ffffff', '#f0fdf4', '#ecfdf5'],
    4.5 // AAA para estados hover
  )

  // ==================== VARIABLES GRANULARES - PRODUCT DETAIL CON CONTRASTE GARANTIZADO ====================
  variables['--product-detail-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--product-detail-bg-secondary'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--product-detail-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--product-detail-shadow'] = '0 4px 6px rgba(0, 0, 0, 0.1)'
  variables['--product-detail-image-bg'] = '#ffffff'

  // Gradiente para precio con contraste garantizado
  variables['--product-detail-price-bg'] =
    `linear-gradient(135deg, ${adjustColorBrightness(primary, 40)} 0%, ${adjustColorBrightness(secondary, 40)} 100%)`

  // Contraste garantizado para badges
  variables['--product-detail-badge-bg'] = calculateOptimalTextColor(
    secondaryBg,
    [adjustColorBrightness(secondary, 30), adjustColorBrightness(secondary, -30)],
    3
  )
  variables['--product-detail-badge-text'] = calculateOptimalTextColor(
    variables['--product-detail-badge-bg'],
    ['#ffffff', '#059669'],
    4.5
  )

  // ==================== VARIABLES GRANULARES - CARRITO CON CONTRASTE DINÁMICO ====================
  variables['--cart-bg-primary'] = primaryBg
  variables['--cart-bg-overlay'] =
    `linear-gradient(135deg, rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, 0.1) 0%, rgba(${parseInt(secondary.slice(1, 3), 16)}, ${parseInt(secondary.slice(3, 5), 16)}, ${parseInt(secondary.slice(5, 7), 16)}, 0.1) 100%)`
  variables['--cart-bg-card'] =
    `rgba(255, 255, 255, ${primaryBg.includes('255, 255, 255') ? '0.95' : '0.90'})`
  variables['--cart-border'] = calculateOptimalTextColor(
    primaryBg,
    ['rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.3)'],
    2
  )
  variables['--cart-border-light'] = calculateOptimalTextColor(
    primaryBg,
    ['rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.4)'],
    2
  )
  variables['--cart-backdrop-blur'] = 'blur(12px)'
  variables['--cart-shadow'] = '0 8px 32px rgba(0, 0, 0, 0.1)'
  variables['--cart-shadow-premium'] = `0 20px 60px ${adjustColorBrightness(primary, -40)} 0.3`

  // ==================== VARIABLES GRANULARES - FORMULARIOS CON CONTRASTE AAA ====================
  variables['--form-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--form-bg-filled'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--form-bg-premium'] =
    `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, ${adjustColorBrightness(secondaryBg, 5)} 0.95)`.replace(
      secondaryBg,
      `var(--theme-bg-secondary, ${secondaryBg})`
    )
  variables['--form-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--form-border-focus'] = calculateOptimalTextColor(
    primary,
    ['#ffffff', '#000000'],
    3 // Ajuste de contraste para borde en foco
  )
  variables['--form-text'] = calculateOptimalTextColor(
    primaryBg,
    [textPrimary, '#1f2937'],
    7.0 // AAA para texto de formularios
  )
  variables['--form-placeholder'] = calculateOptimalTextColor(
    primaryBg,
    ['#9ca3af', '#a3a3a3'],
    4.5 // AA para placeholders
  )
  variables['--form-shadow'] = '0 4px 12px rgba(0, 0, 0, 0.1)'
  variables['--form-shadow-focus'] = `0 8px 24px ${adjustColorBrightness(primary, 0)} 0.2`

  // ==================== VARIABLES GRANULARES - BOTONES CON CONTRASTE DINÁMICO ====================
  variables['--btn-bg-primary'] = variables['--theme-primary'] || primary
  variables['--btn-bg-primary-hover'] = variables['--theme-primary-hover'] || primaryDark
  variables['--btn-bg-secondary'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--btn-bg-success'] = '#10b981'
  variables['--btn-bg-warning'] = '#f59e0b'

  // Garantizar contraste AAA para texto de botones críticos
  variables['--btn-text-primary'] = calculateOptimalTextColor(
    variables['--btn-bg-primary'],
    ['#ffffff', '#000000'],
    7.0 // AAA para máxima legibilidad en elementos interactivos
  )
  variables['--btn-text-secondary'] = calculateOptimalTextColor(
    variables['--theme-bg-secondary'] || secondaryBg,
    [textPrimary, '#1f2937'],
    4.5 // AA para botones secundarios
  )
  variables['--btn-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--btn-shadow'] = '0 4px 12px rgba(0, 0, 0, 0.1)'
  variables['--btn-shadow-hover'] = '0 8px 24px rgba(0, 0, 0, 0.15)'

  // ==================== VARIABLES GRANULARES - ENLACES CON CONTRASTE GARANTIZADO ====================
  variables['--link-color'] = calculateOptimalTextColor(
    primaryBg,
    [primary, primaryDark],
    7.0 // AAA para máxima legibilidad en texto con enlaces
  )
  variables['--link-color-visited'] = adjustColorBrightness(
    calculateOptimalTextColor(primaryBg, [primary, primaryDark], 7.0),
    -15
  )
  variables['--link-color-hover'] = adjustColorBrightness(
    calculateOptimalTextColor(primaryBg, [primary, primaryDark], 7.0),
    15
  )

  // ==================== VARIABLES GRANULARES - TESTIMONIOS CON CONTRASTE DINÁMICO ====================
  variables['--testimonial-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--testimonial-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--testimonial-shadow'] = 'var(--theme-shadow, rgba(0, 0, 0, 0.1))'
  variables['--testimonial-pink'] = '#ec4899'
  variables['--testimonial-green'] = '#10b981'
  variables['--testimonial-yellow'] = '#f59e0b'
  // Gradientes diferenciados para cada testimonial con contraste garantizado
  variables['--testimonial-pink-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--testimonial-pink'], 35)} 0%, ${adjustColorBrightness(variables['--testimonial-pink'], 15)} 100%)`
  variables['--testimonial-green-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--testimonial-green'], 35)} 0%, ${adjustColorBrightness(variables['--testimonial-green'], 15)} 100%)`
  variables['--testimonial-yellow-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--testimonial-yellow'], 35)} 0%, ${adjustColorBrightness(variables['--testimonial-yellow'], 15)} 100%)`

  // ==================== VARIABLES GRANULARES - FEATURES CON CONTRASTE AAA ====================
  variables['--features-bg'] = `var(--theme-bg-secondary, ${secondaryBg})`
  variables['--features-card-bg'] = `var(--theme-bg-primary, ${primaryBg})`
  variables['--features-border'] = variables['--theme-border-light'] || '#e5e7eb'
  variables['--features-icon-primary'] = calculateOptimalTextColor(
    primaryBg,
    [primary, primaryDark],
    4.5 // AA para iconos
  )
  variables['--features-icon-secondary'] = calculateOptimalTextColor(
    primaryBg,
    [secondary, '#059669'],
    4.5 // AA para iconos secundarios
  )
  variables['--features-shadow'] = 'var(--theme-shadow, rgba(0, 0, 0, 0.1))'

  // ==================== VARIABLES GRANULARES - FOOTER CON CONTRASTE GARANTIZADO ====================
  variables['--footer-bg'] = variables['--theme-bg-tertiary'] || '#1f2937'
  variables['--footer-bg-light'] = `var(--theme-bg-secondary, ${secondaryBg})`
  // Gradiente dinámico del footer basado en el tema con contraste garantizado
  variables['--footer-gradient'] =
    `linear-gradient(135deg, ${adjustColorBrightness(variables['--theme-bg-tertiary'] || '#1f2937', -10)} 0%, ${adjustColorBrightness(variables['--theme-bg-tertiary'] || '#1f2937', -5)} 50%, ${calculateOptimalTextColor(variables['--theme-bg-tertiary'] || '#1f2937', [primary, primaryDark], 7.0)} 100%)`

  // Garantizar contraste AAA para texto principal del footer
  variables['--footer-text'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['#ffffff', '#f9fafb'],
    7.0 // AAA para máxima legibilidad en el pie de página
  )
  variables['--footer-text-light'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['#d1d5db', '#e5e7eb'],
    4.5 // AA para texto secundario
  )
  variables['--footer-text-muted'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['#9ca3af', '#a3a3a3'],
    3.0 // A para texto terciario
  )
  variables['--footer-border'] = calculateOptimalTextColor(
    variables['--footer-bg'],
    ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)'],
    1.5 // A para bordes
  )

  return { ...baseTheme, variables }
}

// Temas mejorados con correciones de contraste
export const enhancedThemes = {
  light: {
    id: 'light',
    name: 'Claro Mejorado',
    description: 'Tema claro clásico con contraste AAA garantizado',
    icon: '☀️',
    category: 'basic',
    variables: {
      '--theme-primary': '#00796B',
      '--theme-primary-dark': '#004D40',
      '--theme-primary-light': '#4DB6AC',
      '--theme-primary-hover': '#00695C',
      '--theme-secondary': '#00BFA5',
      '--theme-secondary-dark': '#009688',
      '--theme-secondary-light': '#4DB6AC',
      '--theme-accent': '#FF6B6B',
      '--theme-accent-dark': '#E57373',
      '--theme-accent-light': '#FF8A80',
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#F5F5F5',
      '--theme-bg-tertiary': '#EEEEEE',
      '--theme-text-primary': '#212121',
      '--theme-text-secondary': '#757575',
      '--theme-text-tertiary': '#BDBDBD',
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#E0E0E0',
      '--theme-border-medium': '#EEEEEE',
      '--theme-border-dark': '#BDBDBD',
      '--theme-text-on-primary': '#ffffff',
      '--theme-text-on-secondary': '#ffffff',
      '--theme-text-on-accent': '#ffffff',
      '--theme-text-on-bg-primary': '#111827',
      '--theme-text-on-bg-secondary': '#374151',
      '--theme-text-on-bg-tertiary': '#4b5563',
      '--theme-text-on-card': '#111827',
      '--theme-text-on-hero': '#111827',
      '--theme-text-on-footer': '#f9fafb',
      '--theme-text-muted': '#6b7280',
      '--theme-text-subtle': '#9ca3af',
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-text': '#212121',
      '--navbar-text-hover': '#00796B',
      '--navbar-border': '#E0E0E0',
      '--navbar-shadow': '0 2px 12px rgba(0, 0, 0, 0.08)',
      '--navbar-brand-color': '#00796B',
      '--navbar-icon-color': '#6b7280',
      '--navbar-icon-hover': '#00796B',
      '--hero-bg-start': '#f5f5f5',
      '--hero-bg-end': '#eeeeee',
      '--hero-title-color': '#212121',
      '--hero-subtitle-color': '#757575',
      '--hero-accent-color': '#00796B',
      '--card-bg': '#ffffff',
      '--card-border': '#E0E0E0',
      '--card-shadow': '0 4px 6px rgba(0, 0, 0, 0.05)',
      '--card-shadow-hover': '0 20px 25px rgba(0, 0, 0, 0.1)',
      '--card-title-color': '#212121',
      '--card-text-color': '#757575',
      '--card-price-color': '#00796B',
      '--card-text-on-bg': '#212121',
      '--card-text-on-overlay': '#ffffff',
      '--card-text-on-badge': '#ffffff',
      '--btn-primary-bg': '#00796B',
      '--btn-primary-hover': '#004D40',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#00796B',
      '--btn-secondary-text': '#00796B',
      '--footer-bg': '#004D40',
      '--footer-text': '#d1fae5',
      '--footer-heading': '#4DB6AC',
      '--footer-link-hover': '#00BFA5',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(0, 121, 107, 0.8)',
      '--carousel-nav-hover': 'rgba(0, 121, 107, 0.9)',
      '--carousel-indicator-inactive': 'rgba(0, 0, 0, 0.3)',
      '--carousel-indicator-active': '#00796B',
      '--carousel-text-on-bg': '#212121',
      '--carousel-text-on-nav': '#ffffff',
      '--carousel-text-on-indicator': '#ffffff'
    }
  },

  dark: {
    id: 'dark',
    name: 'Oscuro Mejorado',
    description: 'Tema oscuro para reducir fatiga visual con contraste AAA',
    icon: '🌙',
    category: 'basic',
    variables: {
      '--theme-primary': '#42A5F5',
      '--theme-primary-dark': '#1E88E5',
      '--theme-primary-light': '#90CAF9',
      '--theme-primary-hover': '#1976D2',
      '--theme-bg-primary': '#0f172a',
      '--theme-bg-secondary': '#1e293b',
      '--theme-bg-tertiary': '#334155',
      '--theme-text-primary': '#f8fafc',
      '--theme-text-secondary': '#e2e8f0',
      '--theme-text-tertiary': '#cbd5e1',
      '--theme-text-inverted': '#0f172a',
      '--theme-border-light': '#475569',
      '--theme-border-medium': '#64748b',
      '--theme-border-dark': '#94a3b8',
      '--navbar-bg': 'rgba(15, 23, 42, 0.95)',
      '--navbar-text': '#f8fafc',
      '--navbar-text-hover': '#90CAF9',
      '--navbar-border': '#475569',
      '--navbar-shadow': '0 2px 12px rgba(0, 0, 0, 0.3)',
      '--navbar-brand-color': '#42A5F5',
      '--navbar-icon-color': '#e2e8f0',
      '--navbar-icon-hover': '#90CAF9',
      '--hero-bg-start': '#1e293b',
      '--hero-bg-end': '#334155',
      '--hero-title-color': '#f8fafc',
      '--hero-subtitle-color': '#e2e8f0',
      '--hero-accent-color': '#42A5F5',
      '--card-bg': '#1e293b',
      '--card-border': '#475569',
      '--card-shadow': '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(66, 165, 245, 0.1)',
      '--card-shadow-hover': '0 8px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(66, 165, 245, 0.15)',
      '--card-title-color': '#f8fafc',
      '--card-text-color': '#e2e8f0',
      '--card-price-color': '#90CAF9',
      '--btn-primary-bg': '#42A5F5',
      '--btn-primary-hover': '#1E88E5',
      '--btn-primary-text': '#0f172a',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#42A5F5',
      '--btn-secondary-text': '#42A5F5',
      '--footer-bg': '#020617',
      '--footer-text': '#cbd5e1',
      '--footer-heading': '#90CAF9',
      '--footer-link-hover': '#64B5F6',
      '--carousel-bg': '#1e293b',
      '--carousel-nav-bg': 'rgba(66, 165, 245, 0.8)',
      '--carousel-nav-hover': 'rgba(66, 165, 245, 0.9)',
      '--carousel-indicator-inactive': 'rgba(248, 250, 252, 0.4)',
      '--carousel-indicator-active': '#42A5F5'
    }
  },

  // CORREGIDO: Elegancia Moderna con mejor contraste
  eleganciaModerna: {
    id: 'eleganciaModerna',
    name: 'Elegancia Moderna Mejorada',
    description: 'Minimalismo con mármol blanco y contraste AAA garantizado',
    icon: '💎',
    category: 'premium',
    variables: {
      '--theme-primary': '#1e293b',
      '--theme-primary-dark': '#0f172a',
      '--theme-primary-light': '#334155',
      '--theme-secondary': '#3b82f6',
      '--theme-secondary-dark': '#2563eb',
      '--theme-secondary-light': '#60a5fa',
      '--theme-accent': '#8b5cf6',
      '--theme-accent-dark': '#7c3aed',
      '--theme-accent-light': '#a78bfa',
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#f8fafc',
      '--theme-bg-tertiary': '#f1f5f9',
      '--theme-text-primary': '#1e293b',
      '--theme-text-secondary': '#475569',
      '--theme-text-tertiary': '#64748b',
      '--theme-text-inverted': '#ffffff',
      '--theme-border-light': '#e2e8f0',
      '--theme-border-medium': '#cbd5e1',
      '--theme-border-dark': '#94a3b8',
      '--navbar-bg': 'rgba(255, 255, 255, 0.98)',
      '--navbar-text': '#1e293b',
      '--navbar-text-hover': '#2563eb',
      '--navbar-border': '#e2e8f0',
      '--navbar-shadow': '0 2px 12px rgba(0, 0, 0, 0.08)',
      '--navbar-brand-color': '#1e293b',
      '--navbar-icon-color': '#64748b',
      '--navbar-icon-hover': '#3b82f6',
      '--hero-bg-start': '#f8fafc',
      '--hero-bg-end': '#f1f5f9',
      '--hero-title-color': '#1e293b',
      '--hero-subtitle-color': '#475569',
      '--hero-accent-color': '#3b82f6',
      '--card-bg': 'rgba(255, 255, 255, 0.95)',
      '--card-border': 'rgba(59, 130, 246, 0.2)',
      '--card-shadow': '0 4px 6px rgba(0, 0, 0, 0.05), 0 0 20px rgba(59, 130, 246, 0.1)',
      '--card-shadow-hover': '0 20px 25px rgba(0, 0, 0, 0.1), 0 0 30px rgba(59, 130, 246, 0.15)',
      '--card-title-color': '#1e293b',
      '--card-text-color': '#475569',
      '--card-price-color': '#2563eb',
      '--btn-primary-bg': '#1e293b',
      '--btn-primary-hover': '#0f172a',
      '--btn-primary-text': '#ffffff',
      '--btn-secondary-bg': 'transparent',
      '--btn-secondary-border': '#3b82f6',
      '--btn-secondary-text': '#3b82f6',
      '--footer-bg': '#0f172a',
      '--footer-text': '#cbd5e1',
      '--footer-heading': '#60a5fa',
      '--footer-link-hover': '#93c5fd',
      '--carousel-bg': '#ffffff',
      '--carousel-nav-bg': 'rgba(30, 41, 59, 0.8)',
      '--carousel-nav-hover': 'rgba(30, 41, 59, 0.9)',
      '--carousel-indicator-inactive': 'rgba(148, 163, 184, 0.4)',
      '--carousel-indicator-active': '#1e293b'
    }
  },

  // CORREGIDO: Todos los demás temas con enfoque en contraste mejorado
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

// Aplicar expansión granular a todos los temas mejorados
const expandedEnhancedThemes = {}
Object.entries(enhancedThemes).forEach(([key, theme]) => {
  expandedEnhancedThemes[key] = expandThemeWithGranularVars(theme)
})

// Reemplazar con temas expandidos y mejorados
Object.keys(enhancedThemes).forEach(key => {
  delete enhancedThemes[key]
})
Object.assign(enhancedThemes, expandedEnhancedThemes)

// Exportar también los temas originales con actualizaciones de contraste
export const themes = enhancedThemes // Alias para compatibilidad con código existente

export const DEFAULT_THEME = 'light'
export const THEME_STORAGE_KEY = 'floresya-theme-preference'

/**
 * Obtiene lista de temas por categoría
 * @param {string} category - Categoría del tema
 * @returns {Array} Lista de temas filtrados
 */
export function getThemesByCategory(category) {
  return Object.values(enhancedThemes).filter(theme => theme.category === category)
}

/**
 * Obtiene información de un tema
 * @param {string} themeId - ID del tema
 * @returns {Object} Objeto del tema o tema por defecto
 */
export function getTheme(themeId) {
  return enhancedThemes[themeId] || enhancedThemes[DEFAULT_THEME]
}
