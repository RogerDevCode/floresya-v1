/**
 * FloresYa - Sistema de Configuración de Temas Granulares
 * Fase 1: Infraestructura
 *
 * Define la configuración de temas por panel/componente
 * Permite aplicar estilos granulares a cada sección de la página
 * Expansión para heredar del tema global
 */

import { calculateOptimalTextColor, rgbToHex } from './colorUtils.js'

export const granularThemes = {
  // ============================================
  // NAVEGACIÓN
  // ============================================
  navigation: {
    primary: {
      name: 'Navegación Primaria',
      description: 'Navbar estándar con fondo sólido',
      styles: 'theme-nav-primary',
      variables: {
        '--nav-bg': 'var(--nav-bg-primary, var(--navbar-bg, rgba(255, 255, 255, 0.95)))',
        '--nav-text': 'var(--nav-text-primary, var(--navbar-text, #374151))',
        '--nav-border': 'var(--nav-border, var(--navbar-border, #e5e7eb))'
      },
      responsive: true,
      darkMode: true
    },
    glass: {
      name: 'Navegación Glassmorphism',
      description: 'Navbar con efecto cristal translúcido',
      styles: 'theme-nav-glass',
      variables: {
        '--nav-bg': 'var(--nav-bg-glass, rgba(255, 255, 255, 0.95))',
        '--nav-text': 'var(--nav-text-primary, var(--navbar-text, #374151))'
      },
      responsive: true,
      darkMode: true
    },
    solid: {
      name: 'Navegación Sólida',
      description: 'Navbar con borde inferior marcado',
      styles: 'theme-nav-solid',
      variables: {
        '--nav-bg': 'var(--nav-bg-primary, var(--navbar-bg, rgba(255, 255, 255, 0.95)))',
        '--nav-text': 'var(--nav-text-primary, var(--navbar-text, #374151))',
        '--nav-border': 'var(--nav-border, var(--navbar-border, #e5e7eb))'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // BREADCRUMB
  // ============================================
  breadcrumb: {
    standard: {
      name: 'Breadcrumb Estándar',
      description: 'Breadcrumb con fondo y borde',
      styles: 'theme-breadcrumb-standard',
      variables: {
        '--breadcrumb-bg': 'var(--breadcrumb-bg)',
        '--breadcrumb-border': 'var(--breadcrumb-border)'
      },
      responsive: true
    },
    minimal: {
      name: 'Breadcrumb Minimal',
      description: 'Breadcrumb sin fondo',
      styles: 'theme-breadcrumb-minimal',
      variables: {},
      responsive: true
    }
  },

  // ============================================
  // HERO SECTION
  // ============================================
  hero: {
    gradient: {
      name: 'Hero Gradiente',
      description: 'Fondo con gradiente animado',
      styles: 'theme-hero-gradient',
      variables: {
        '--hero-bg': 'var(--hero-bg-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%))',
        '--hero-text': 'var(--hero-text-primary, #ffffff)'
      },
      animation: 'animate-gradient',
      responsive: true,
      darkMode: true
    },
    image: {
      name: 'Hero con Imagen',
      description: 'Fondo con imagen y overlay',
      styles: 'theme-hero-image',
      variables: {
        '--hero-bg': "var(--hero-bg-image, url('/images/hero-bg.jpg'))",
        '--hero-overlay': 'var(--hero-overlay, rgba(0, 0, 0, 0.3))'
      },
      responsive: true
    },
    solid: {
      name: 'Hero Sólido',
      description: 'Fondo sólido con sombra',
      styles: 'theme-hero-solid',
      variables: {
        '--hero-bg': 'var(--hero-bg-primary, var(--theme-bg-primary, #ffffff))',
        '--hero-text': 'var(--hero-text-dark, var(--theme-text-primary, #111827))'
      },
      responsive: true,
      darkMode: true
    },
    minimal: {
      name: 'Hero Minimal',
      description: 'Estilo minimal con mucho espacio',
      styles: 'theme-hero-minimal',
      variables: {
        '--hero-bg': 'var(--theme-bg-primary, #ffffff)',
        '--hero-text': 'var(--hero-text-dark, var(--theme-text-primary, #111827))'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // CAROUSEL
  // ============================================
  carousel: {
    light: {
      name: 'Carousel Claro',
      description: 'Estilo claro estándar',
      styles: 'theme-carousel-light',
      variables: {
        '--carousel-bg': 'var(--carousel-bg)',
        '--carousel-border': 'var(--carousel-border)'
      },
      responsive: true,
      darkMode: true
    },
    dark: {
      name: 'Carousel Oscuro',
      description: 'Estilo oscuro para contraste',
      styles: 'theme-carousel-dark',
      variables: {
        '--carousel-bg': 'var(--carousel-bg-dark)'
      },
      responsive: true
    },
    card: {
      name: 'Carousel Card',
      description: 'Estilo card con bordes redondeados',
      styles: 'theme-carousel-card',
      variables: {
        '--carousel-bg': 'var(--carousel-bg)',
        '--carousel-border': 'var(--carousel-border)'
      },
      responsive: true,
      darkMode: true
    },
    premium: {
      name: 'Carousel Premium',
      description: 'Estilo premium con sombras y gradiente',
      styles: 'theme-carousel-premium',
      variables: {
        '--carousel-bg': 'var(--carousel-bg)',
        '--carousel-border': 'var(--carousel-border)'
      },
      animation: 'animate-float',
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // PRODUCTOS
  // ============================================
  products: {
    grid: {
      name: 'Productos Grid',
      description: 'Grid estándar de productos',
      styles: 'theme-products-grid',
      variables: {
        '--products-bg': 'var(--products-bg)'
      },
      responsive: true,
      darkMode: true
    },
    cards: {
      name: 'Productos Cards',
      description: 'Cards con hover y elevación',
      styles: 'theme-products-cards',
      variables: {
        '--products-bg': 'var(--products-bg)',
        '--products-card-hover': 'var(--products-card-hover)'
      },
      responsive: true,
      darkMode: true
    },
    masonry: {
      name: 'Productos Masonry',
      description: 'Layout masonry para Pinterest-like',
      styles: 'theme-products-masonry',
      variables: {
        '--products-bg': 'var(--products-bg-secondary)'
      },
      responsive: true
    }
  },

  // ============================================
  // PRODUCT DETAIL
  // ============================================
  productDetail: {
    standard: {
      name: 'Detalle Estándar',
      description: 'Layout estándar de dos columnas',
      styles: 'theme-product-detail',
      variables: {
        '--product-detail-bg': 'var(--product-detail-bg)',
        '--product-detail-border': 'var(--product-detail-border)'
      },
      responsive: true,
      darkMode: true
    },
    premium: {
      name: 'Detalle Premium',
      description: 'Layout premium con sombras y efectos',
      styles: 'theme-product-detail',
      variables: {
        '--product-detail-bg': 'var(--product-detail-bg)',
        '--product-detail-price-bg': 'var(--product-detail-price-bg)',
        '--product-detail-badge-bg': 'var(--product-detail-badge-bg)'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // CARRITO
  // ============================================
  cart: {
    overlay: {
      name: 'Carrito Overlay',
      description: 'Carrito con fondo overlay y gradiente',
      styles: 'theme-cart-overlay',
      variables: {
        '--cart-bg':
          'var(--cart-bg-overlay, linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%))'
      },
      responsive: true
    },
    card: {
      name: 'Carrito Card',
      description: 'Carrito con cards glassmorphism',
      styles: 'theme-cart-card',
      variables: {
        '--cart-bg': 'var(--cart-bg-card, rgba(255, 255, 255, 0.95))',
        '--cart-backdrop': 'var(--cart-backdrop-blur, blur(12px))'
      },
      responsive: true,
      darkMode: true
    },
    premium: {
      name: 'Carrito Premium',
      description: 'Carrito premium con borde gradiente',
      styles: 'theme-cart-premium',
      variables: {
        '--cart-bg': 'var(--cart-bg-card, rgba(255, 255, 255, 0.95))',
        '--cart-shadow': 'var(--cart-shadow-premium, 0 20px 60px rgba(236, 72, 153, 0.3))'
      },
      responsive: true,
      darkMode: true
    },
    minimal: {
      name: 'Carrito Minimal',
      description: 'Carrito minimal sin sombras',
      styles: 'theme-cart-minimal',
      variables: {
        '--cart-bg': 'var(--cart-bg-primary, rgba(255, 255, 255, 0.95))',
        '--cart-border': 'var(--cart-border, rgba(255, 255, 255, 0.2))'
      },
      responsive: true
    }
  },

  // ============================================
  // FORMULARIOS
  // ============================================
  forms: {
    standard: {
      name: 'Formulario Estándar',
      description: 'Formulario con estilo estándar',
      styles: 'theme-form-standard',
      variables: {
        '--form-bg': 'var(--form-bg, var(--theme-bg-primary, #ffffff))',
        '--form-border': 'var(--form-border, var(--theme-border-light, #e5e7eb))'
      },
      responsive: true,
      darkMode: true
    },
    outlined: {
      name: 'Formulario Outlined',
      description: 'Formulario solo con bordes',
      styles: 'theme-form-outlined',
      variables: {
        '--form-border': 'var(--form-border, var(--theme-border-light, #e5e7eb))'
      },
      responsive: true,
      darkMode: true
    },
    filled: {
      name: 'Formulario Relleno',
      description: 'Formulario con fondo de color',
      styles: 'theme-form-filled',
      variables: {
        '--form-bg': 'var(--form-bg-filled, var(--theme-bg-secondary, #f8fafc))',
        '--form-border': 'var(--form-border, var(--theme-border-light, #e5e7eb))'
      },
      responsive: true,
      darkMode: true
    },
    premium: {
      name: 'Formulario Premium',
      description: 'Formulario premium con glassmorphism',
      styles: 'theme-form-premium',
      variables: {
        '--form-bg':
          'var(--form-bg-premium, linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%))',
        '--form-shadow': 'var(--form-shadow-focus, 0 8px 24px rgba(236, 72, 153, 0.2))'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // BOTONES
  // ============================================
  buttons: {
    soft: {
      name: 'Botones Suaves',
      description: 'Bordes redondeados con elevación',
      styles: 'theme-btn-soft',
      variables: {
        '--btn-radius': '9999px',
        '--btn-shadow': 'var(--btn-shadow, 0 4px 12px rgba(0, 0, 0, 0.1))'
      },
      responsive: true
    },
    sharp: {
      name: 'Botones Rectos',
      description: 'Bordes rectos, estilo tech',
      styles: 'theme-btn-sharp',
      variables: {
        '--btn-radius': '0'
      },
      responsive: true
    },
    ghost: {
      name: 'Botones Ghost',
      description: 'Solo texto/icono, fondo transparente',
      styles: 'theme-btn-ghost',
      variables: {
        '--btn-bg': 'transparent'
      },
      responsive: true
    },
    gradient: {
      name: 'Botones Gradiente',
      description: 'Gradiente animado',
      styles: 'theme-btn-gradient',
      variables: {
        '--btn-bg':
          'linear-gradient(135deg, var(--btn-bg-primary, var(--theme-primary, #ec4899)), var(--btn-bg-secondary, var(--theme-secondary, #10b981)))'
      },
      animation: 'animate-gradient',
      responsive: true
    }
  },

  // ============================================
  // TESTIMONIOS
  // ============================================
  testimonials: {
    card: {
      name: 'Testimonios Card',
      description: 'Cards con elevación y bordes coloreados',
      styles: 'theme-testimonials-card',
      variables: {
        '--testimonial-bg': 'var(--testimonial-bg)',
        '--testimonial-pink': 'var(--testimonial-pink)',
        '--testimonial-green': 'var(--testimonial-green)',
        '--testimonial-yellow': 'var(--testimonial-yellow)'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // FEATURES
  // ============================================
  features: {
    standard: {
      name: 'Features Estándar',
      description: 'Features con iconos y hover',
      styles: 'theme-features',
      variables: {
        '--features-bg': 'var(--features-bg)',
        '--features-icon-primary': 'var(--features-icon-primary)',
        '--features-icon-secondary': 'var(--features-icon-secondary)'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // FOOTER
  // ============================================
  footer: {
    solid: {
      name: 'Footer Sólido',
      description: 'Footer oscuro estándar',
      styles: 'theme-footer-solid',
      variables: {
        '--footer-bg': 'var(--footer-bg)',
        '--footer-text': 'var(--footer-text)'
      },
      responsive: true
    },
    light: {
      name: 'Footer Claro',
      description: 'Footer claro para contraste',
      styles: 'theme-footer-light',
      variables: {
        '--footer-bg': 'var(--footer-bg-light)',
        '--footer-text': 'var(--theme-text-primary)'
      },
      responsive: true,
      darkMode: true
    }
  }
}

// ============================================
// PRESETS DE PÁGINA COMPLETA
// ============================================

export const pagePresets = {
  // Preset para página de inicio
  homepage: {
    navigation: 'glass',
    hero: 'gradient',
    carousel: 'premium',
    products: 'cards',
    testimonials: 'card',
    features: 'standard',
    footer: 'solid'
  },

  // Preset para carrito
  cart: {
    navigation: 'glass',
    cart: 'card',
    buttons: 'soft',
    footer: 'solid'
  },

  // Preset para pago
  payment: {
    navigation: 'glass',
    forms: 'premium',
    cart: 'premium',
    buttons: 'gradient',
    footer: 'solid'
  },

  // Preset para detalle de producto
  productDetail: {
    navigation: 'glass',
    breadcrumb: 'standard',
    productDetail: 'premium',
    buttons: 'gradient',
    footer: 'solid'
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Aplica un tema granular a un elemento específico
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} panelType - Tipo de panel (navigation, hero, carousel, etc.)
 * @param {string} themeName - Nombre del tema
 */
export function applyGranularTheme(element, panelType, themeName) {
  if (!element || !element.classList) {
    console.warn('Elemento no encontrado o no válido para aplicar tema granular')
    return
  }

  const themeConfig = granularThemes[panelType]?.[themeName]
  if (!themeConfig) {
    console.warn(`Tema granular no encontrado: ${panelType}.${themeName}`)
    return
  }

  // Remover estilos anteriores del mismo panel
  const panelStyles = Object.keys(granularThemes[panelType] || {})
  panelStyles.forEach(style => {
    const themeStyle = granularThemes[panelType]?.[style]
    if (themeStyle && themeStyle.styles) {
      element.classList.remove(themeStyle.styles)
    }
  })

  // Aplicar nuevo estilo
  element.classList.add(themeConfig.styles)

  // Aplicar variables CSS si existen
  if (themeConfig.variables) {
    Object.entries(themeConfig.variables).forEach(([property, value]) => {
      element.style.setProperty(property, value)
    })
  }

  console.log(`✅ Tema granular aplicado: ${panelType}.${themeName}`)
}

/**
 * Aplica un tema granular a un elemento específico con ajuste de contraste
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} panelType - Tipo de panel (navigation, hero, carousel, etc.)
 * @param {string} themeName - Nombre del tema
 * @param {boolean} applyContrast - Si debe aplicar contraste después de aplicar tema
 */
export function applyGranularThemeWithContrast(
  element,
  panelType,
  themeName,
  applyContrast = true
) {
  // Aplicar tema granular primero
  applyGranularTheme(element, panelType, themeName)

  // Aplicar contraste si se solicitó
  if (applyContrast && element) {
    try {
      // Importar dinámicamente la función de contraste
      import('./enhancedContrastSystem.js')
        .then(({ autoAdjustEnhancedContrast }) => {
          if (autoAdjustEnhancedContrast) {
            autoAdjustEnhancedContrast(element, `${panelType}`, 4.5)
          }
        })
        .catch(() => {
          // Fallback a función básica si enhanced no está disponible
          import('./contrastEnhancer.js').then(({ autoAdjustContrast }) => {
            if (autoAdjustContrast) {
              autoAdjustContrast(element, `${panelType}`, 4.5)
            }
          })
        })
    } catch (error) {
      console.warn('⚠️ No se pudo aplicar contraste automático:', error)
    }
  }
}

/**
 * Cambia el tema general y aplica ajustes granulares si están disponibles
 * @param {string} themeId - ID del tema
 * @param {boolean} save - Si debe guardarse
 */
export function changeThemeWithGranular(themeId, save = true) {
  try {
    // Importar dinámicamente para evitar ciclos de dependencia
    import('./themeManager.js')
      .then(({ themeManager }) => {
        if (themeManager && typeof themeManager.setTheme === 'function') {
          themeManager.setTheme(themeId, save)
        }
      })
      .catch(() => {
        // Fallback simple
        localStorage.setItem('floresya-theme-preference', themeId)
        document.documentElement.setAttribute('data-theme', themeId)
        location.reload() // Recargar para aplicar cambios
      })
  } catch (error) {
    console.error('Error changing theme:', error)
  }
}

/**
 * Aplica un preset completo de página
 * @param {string} presetName - Nombre del preset
 * @param {Object} mappings - Mapeo de elementos DOM
 */
export function applyPagePreset(presetName, mappings) {
  const preset = pagePresets[presetName]
  if (!preset) {
    console.warn(`Preset de página no encontrado: ${presetName}`)
    return
  }

  Object.entries(preset).forEach(([panelType, themeName]) => {
    const element = mappings[panelType]
    if (element) {
      applyGranularTheme(element, panelType, themeName)
    }
  })

  console.log(`✅ Preset de página aplicado: ${presetName}`)
}

/**
 * Obtiene la configuración de un tema granular
 * @param {string} panelType - Tipo de panel
 * @param {string} themeName - Nombre del tema
 * @returns {Object|null} Configuración del tema
 */
export function getGranularThemeConfig(panelType, themeName) {
  return granularThemes[panelType]?.[themeName] || null
}

/**
 * Lista todos los temas disponibles para un panel
 * @param {string} panelType - Tipo de panel
 * @returns {Array} Lista de temas
 */
export function listAvailableThemes(panelType) {
  const panelThemes = granularThemes[panelType]
  if (!panelThemes) {
    return []
  }

  return Object.entries(panelThemes).map(([key, config]) => ({
    key,
    name: config.name,
    description: config.description,
    responsive: config.responsive,
    darkMode: config.darkMode,
    animation: config.animation
  }))
}

// ============================================
// API DE CONTRASTE DINÁMICO
// ============================================

/**
 * Ajusta automáticamente el contraste de texto en un elemento
 * @param {HTMLElement} element - Elemento a ajustar
 * @param {string} property - Propiedad CSS a modificar (default: 'color')
 * @param {number} minRatio - Ratio mínimo de contraste (default: 4.5)
 * @returns {boolean} true si se ajustó, false si ya era óptimo
 */
export function autoAdjustContrast(element, property = 'color', minRatio = 4.5) {
  try {
    const computedStyle = window.getComputedStyle(element)
    const bgColor = computedStyle.backgroundColor
    const textColor = computedStyle[property]

    // Extraer RGB/RGBA - manejar tanto rgb() como rgba()
    const textRgbMatch = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    const bgRgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)

    if (!textRgbMatch || !bgRgbMatch) {
      return false
    }

    // Convertir a hex
    const textHex = rgbToHex(
      parseInt(textRgbMatch[1]),
      parseInt(textRgbMatch[2]),
      parseInt(textRgbMatch[3])
    )
    const bgHex = rgbToHex(
      parseInt(bgRgbMatch[1]),
      parseInt(bgRgbMatch[2]),
      parseInt(bgRgbMatch[3])
    )

    // Calcular color óptimo
    const optimalColor = calculateOptimalTextColor(bgHex, [textHex], minRatio)
    element.style[property] = optimalColor

    return optimalColor !== textHex
  } catch (error) {
    console.warn('⚠️ [GranularThemes] Error adjusting contrast:', error)
    return false
  }
}

/**
 * Ajusta contraste en todos los inputs de un formulario
 * @param {HTMLFormElement|string} form - Formulario o selector
 * @param {number} minRatio - Ratio mínimo (default: 4.5 para AA, 7 para AAA)
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustFormContrast(form, minRatio = 4.5) {
  try {
    const formElement = typeof form === 'string' ? document.querySelector(form) : form
    if (!formElement) {
      console.warn('Formulario no encontrado:', form)
      return 0
    }

    let adjusted = 0

    // Ajustar inputs
    const inputs = formElement.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      if (autoAdjustContrast(input, 'color', minRatio)) {
        adjusted++
      }
      if (autoAdjustContrast(input, 'placeholderColor', minRatio)) {
        adjusted++
      }
    })

    // Ajustar labels
    const labels = formElement.querySelectorAll('label')
    labels.forEach(label => {
      if (autoAdjustContrast(label, 'color', minRatio)) {
        adjusted++
      }
    })

    // Ajustar spans y párrafos
    const texts = formElement.querySelectorAll('span, p, small, .form-text')
    texts.forEach(text => {
      if (autoAdjustContrast(text, 'color', minRatio)) {
        adjusted++
      }
    })

    return adjusted
  } catch (error) {
    console.error('❌ [GranularThemes] Error adjusting form contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste en todos los elementos de una página
 * @param {string} selector - Selector CSS (opcional, por defecto 'body')
 * @param {number} minRatio - Ratio mínimo (default: 5.0 para mejor legibilidad)
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustPageContrast(selector = 'body', minRatio = 5.0) {
  try {
    const container = document.querySelector(selector)
    if (!container) {
      return 0
    }

    let adjusted = 0
    const elements = container.querySelectorAll('*')

    elements.forEach(element => {
      const tagName = element.tagName.toLowerCase()
      const hasText = element.textContent && element.textContent.trim().length > 0

      // Elementos que pueden tener texto visible
      const isTextElement =
        hasText &&
        (tagName === 'p' ||
          tagName === 'span' ||
          tagName === 'div' ||
          tagName === 'a' ||
          tagName === 'h1' ||
          tagName === 'h2' ||
          tagName === 'h3' ||
          tagName === 'h4' ||
          tagName === 'h5' ||
          tagName === 'h6' ||
          tagName === 'label' ||
          tagName === 'small' ||
          tagName === 'strong' ||
          tagName === 'em' ||
          tagName === 'blockquote' ||
          element.classList.contains('btn') ||
          element.classList.contains('card') ||
          element.classList.contains('feature-item') ||
          element.classList.contains('testimonial-card') ||
          element.classList.contains('product-card') ||
          element.classList.contains('nav-link') ||
          element.classList.contains('brand-text') ||
          element.classList.contains('nav-icon') ||
          element.classList.contains('navbar-brand') ||
          element.classList.contains('nav-actions') ||
          element.classList.contains('footer-section') ||
          element.closest('nav'))

      if (isTextElement) {
        // Ajustar color de texto
        if (autoAdjustContrast(element, 'color', minRatio)) {
          adjusted++
        }

        // También ajustar placeholder-color para inputs
        if (tagName === 'input' || tagName === 'textarea') {
          autoAdjustContrast(element, 'placeholderColor', minRatio)
        }
      }
    })

    return adjusted
  } catch (error) {
    console.error('❌ [GranularThemes] Error adjusting page contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste específicamente para la navbar (maneja glass/gradient backgrounds)
 * @param {number} minRatio - Ratio mínimo (default: 5.0)
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustNavbarContrast(minRatio = 5.0) {
  try {
    const navbar = document.querySelector('nav')
    if (!navbar) {
      return 0
    }

    let adjusted = 0
    const elements = navbar.querySelectorAll('*')

    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element)
      const bgColor = computedStyle.backgroundColor
      const textColor = computedStyle.color

      // Solo procesar elementos con texto visible
      if (element.textContent && element.textContent.trim().length > 0) {
        // Extraer RGB/RGBA
        const textRgbMatch = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        const bgRgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)

        if (textRgbMatch && bgRgbMatch) {
          // Convertir a hex
          const textHex = rgbToHex(
            parseInt(textRgbMatch[1]),
            parseInt(textRgbMatch[2]),
            parseInt(textRgbMatch[3])
          )
          const bgHex = rgbToHex(
            parseInt(bgRgbMatch[1]),
            parseInt(bgRgbMatch[2]),
            parseInt(bgRgbMatch[3])
          )

          // Calcular color óptimo
          const optimalColor = calculateOptimalTextColor(bgHex, [textHex], minRatio)
          if (optimalColor !== textHex) {
            element.style.color = optimalColor
            adjusted++
          }
        }
      }
    })

    return adjusted
  } catch (error) {
    console.error('❌ [GranularThemes] Error adjusting navbar contrast:', error)
    return 0
  }
}

/**
 * Listener para aplicar contraste automáticamente cuando cambia un tema
 */
export function initAutoContrastOnThemeChange() {
  // Escuchar evento de cambio de tema
  window.addEventListener('themeChanged', _e => {
    console.log('🎨 [GranularThemes] Theme changed, applying auto contrast...')

    // Esperar un tick para que los estilos se apliquen
    setTimeout(() => {
      const adjusted = autoAdjustPageContrast('body', 5.0)
      console.log(`✅ [GranularThemes] Auto-adjusted contrast for ${adjusted} elements`)
    }, 100)
  })
}

// Exportar configuración completa para debugging
export const granularThemeDebug = {
  themes: granularThemes,
  presets: pagePresets,
  version: '1.0.0',
  lastUpdated: new Date().toISOString()
}
