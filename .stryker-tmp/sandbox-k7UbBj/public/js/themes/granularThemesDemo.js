/**
 * FloresYa - Ejemplo de Implementación de Temas Granulares
 * Fase 1: Ejemplo Práctico
 *
 * Este archivo muestra cómo aplicar temas granulares a las páginas reales
 */
// @ts-nocheck

import {
  applyPagePreset,
  applyGranularTheme,
  listAvailableThemes,
  pagePresets,
  autoAdjustFormContrast
} from './granularThemeConfig.js'

/**
 * Aplica temas granulares a la página de inicio (index.html)
 */
export function initHomepageGranularThemes() {
  console.log('🎨 Inicializando temas granulares para Homepage...')

  // Mapeo de elementos DOM de la página de inicio
  const mappings = {
    navigation: document.querySelector('nav.navbar'),
    hero: document.querySelector('.hero-section'),
    carousel: document.querySelector('.theme-carousel-premium, .carousel'),
    products: document.querySelector('.products-section'),
    testimonials: document.querySelector('.testimonials-section'),
    features: document.querySelector('.features-section'),
    footer: document.querySelector('footer')
  }

  // Verificar que los elementos existen
  Object.entries(mappings).forEach(([key, element]) => {
    if (!element) {
      console.warn(`⚠️ Elemento no encontrado para: ${key}`)
    }
  })

  // Aplicar preset de página de inicio
  applyPagePreset('homepage', mappings)

  // Ejemplo: Aplicar tema personalizado a elementos específicos
  // applyGranularTheme(mappings.navigation, 'navigation', 'glass')
  // applyGranularTheme(mappings.hero, 'hero', 'gradient')
  // applyGranularTheme(mappings.carousel, 'carousel', 'premium')
  // applyGranularTheme(mappings.products, 'products', 'cards')
  // applyGranularTheme(mappings.testimonials, 'testimonials', 'card')
  // applyGranularTheme(mappings.features, 'features', 'standard')
  // applyGranularTheme(mappings.footer, 'footer', 'solid')

  console.log('✅ Temas granulares de Homepage aplicados')
}

/**
 * Aplica temas granulares al carrito (cart.html)
 */
export function initCartGranularThemes() {
  console.log('🎨 Inicializando temas granulares para Cart...')

  const mappings = {
    navigation: document.querySelector('nav.navbar'),
    cart: document.querySelector('.theme-cart-overlay, .cart-container'),
    buttons: document.querySelectorAll('button'),
    footer: document.querySelector('footer')
  }

  // Verificar elementos
  if (!mappings.cart) {
    console.warn('⚠️ Contenedor del carrito no encontrado')
    return
  }

  // Aplicar preset del carrito
  applyPagePreset('cart', mappings)

  console.log('✅ Temas granulares de Cart aplicados')
}

/**
 * Aplica temas granulares a la página de pago (payment.html)
 */
export function initPaymentGranularThemes() {
  console.log('🎨 Inicializando temas granulares para Payment...')

  const mappings = {
    navigation: document.querySelector('nav.navbar'),
    forms: document.querySelector('#customer-form, .theme-form-premium'),
    cart: document.querySelector('.theme-cart-overlay, .payment-container'),
    buttons: document.querySelectorAll('button'),
    footer: document.querySelector('footer')
  }

  // Verificar elementos
  if (!mappings.forms) {
    console.warn('⚠️ Formulario de cliente no encontrado')
  }
  if (!mappings.cart) {
    console.warn('⚠️ Contenedor de pago no encontrado')
  }

  // Aplicar preset de pago
  applyPagePreset('payment', mappings)

  console.log('✅ Temas granulares de Payment aplicados')
}

/**
 * Aplica temas granulares al detalle de producto (product-detail.html)
 */
export function initProductDetailGranularThemes() {
  console.log('🎨 Inicializando temas granulares para Product Detail...')

  const mappings = {
    navigation: document.querySelector('nav.navbar'),
    breadcrumb: document.querySelector('nav[aria-label="Breadcrumb"]'),
    productDetail: document.querySelector('#product-content'),
    buttons: document.querySelectorAll('button'),
    footer: document.querySelector('footer')
  }

  // Verificar elementos
  if (!mappings.breadcrumb) {
    console.warn('⚠️ Breadcrumb no encontrado')
  }
  if (!mappings.productDetail) {
    console.warn('⚠️ Contenido del producto no encontrado')
  }

  // Aplicar preset de detalle de producto
  applyPagePreset('productDetail', mappings)

  console.log('✅ Temas granulares de Product Detail aplicados')
}

/**
 * Ejemplo: Cambiar tema dinámicamente (para tema selector)
 */
export function switchGranularTheme(panelType, newThemeName) {
  const elementMap = {
    navigation: document.querySelector('nav.navbar'),
    hero: document.querySelector('.hero-section'),
    carousel: document.querySelector('#featuredCarousel'),
    products: document.querySelector('#productos'),
    cart: document.querySelector('.cart-container'),
    forms: document.querySelector('#customer-form')
  }

  const element = elementMap[panelType]
  if (!element) {
    console.warn(`⚠️ Elemento no encontrado para panel: ${panelType}`)
    return
  }

  applyGranularTheme(element, panelType, newThemeName)
  console.log(`✅ Tema cambiado: ${panelType} → ${newThemeName}`)
}

/**
 * Ejemplo: Toggle entre temas (para debugging)
 */
export function toggleThemeDemo(panelType) {
  const availableThemes = listAvailableThemes(panelType)
  if (availableThemes.length < 2) {
    console.warn(`⚠️ No hay suficientes temas para toggle: ${panelType}`)
    return
  }

  // Obtener tema actual (simplificado)
  const elementMap = {
    navigation: document.querySelector('nav.navbar'),
    hero: document.querySelector('.hero-section'),
    carousel: document.querySelector('#featuredCarousel'),
    products: document.querySelector('#productos'),
    cart: document.querySelector('.cart-container'),
    forms: document.querySelector('#customer-form')
  }

  const element = elementMap[panelType]
  if (!element) {
    console.warn(`⚠️ Elemento no encontrado para: ${panelType}`)
    return
  }

  // Toggle simple entre primer y segundo tema
  const currentTheme = availableThemes[0].key
  const nextTheme = availableThemes[1].key

  applyGranularTheme(element, panelType, nextTheme)
  console.log(`✅ Toggle aplicado: ${panelType} ${currentTheme} → ${nextTheme}`)
}

/**
 * Inicializar todos los temas granulares (auto-detección de página)
 */
export function initAllGranularThemes() {
  console.log('🔍 Detectando página actual...')

  const path = window.location.pathname
  console.log(`📍 Ruta actual: ${path}`)

  if (path.includes('/pages/cart.html')) {
    initCartGranularThemes()
  } else if (path.includes('/pages/payment.html')) {
    initPaymentGranularThemes()
  } else if (path.includes('/pages/product-detail.html')) {
    initProductDetailGranularThemes()
  } else if (path === '/' || path.includes('/index.html')) {
    initHomepageGranularThemes()
  } else {
    console.log('ℹ️ Página no reconocida, aplicando temas por defecto')
    initHomepageGranularThemes()
  }
}

/**
 * Debug: Listar todos los temas disponibles
 */
export function debugListAllThemes() {
  console.group('🎨 Debug: Temas Granulares Disponibles')

  const panelTypes = [
    'navigation',
    'breadcrumb',
    'hero',
    'carousel',
    'products',
    'productDetail',
    'cart',
    'forms',
    'buttons',
    'testimonials',
    'features',
    'footer'
  ]

  panelTypes.forEach(panelType => {
    const themes = listAvailableThemes(panelType)
    console.group(`📦 ${panelType}`)
    console.table(themes)
    console.groupEnd()
  })

  console.group('📋 Presets de Página')
  console.table(Object.keys(pagePresets))
  console.groupEnd()

  console.groupEnd()
}

/**
 * Auto-ajuste de contraste para formularios (crítico para WCAG)
 * Usa las funciones de granularThemeConfig.js para mayor eficiencia
 */
function autoAdjustContrastForForms() {
  // Usar la función importada de granularThemeConfig
  const forms = document.querySelectorAll('form')
  let totalAdjusted = 0

  forms.forEach((form, _index) => {
    const adjusted = autoAdjustFormContrast(form, 4.5)
    totalAdjusted += adjusted
  })

  return totalAdjusted
}

/**
 * Interfaz pública extendida
 */
export const GranularThemesDemo = {
  // Inicialización por página
  initHomepage: initHomepageGranularThemes,
  initCart: initCartGranularThemes,
  initPayment: initPaymentGranularThemes,
  initProductDetail: initProductDetailGranularThemes,
  initAll: initAllGranularThemes,

  // Utilidades
  switch: switchGranularTheme,
  toggle: toggleThemeDemo,
  debug: debugListAllThemes,

  // Contraste automático
  fixFormContrast: autoAdjustContrastForForms
}

// Auto-inicializar si está en el navegador
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAllGranularThemes()
    })
  } else {
    initAllGranularThemes()
  }

  // Exponer al objeto global para debugging
  window.GranularThemesDemo = GranularThemesDemo
}

// Exportar para módulos ES6
export default GranularThemesDemo
