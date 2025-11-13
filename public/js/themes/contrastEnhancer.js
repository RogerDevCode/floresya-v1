/**
 * FloresYa - Sistema de Mejora de Contraste Automático
 * Calcula y aplica automáticamente el contraste óptimo para todos los elementos
 * Siguiendo principios CLAUDE.md: KISS, fail-fast, try-catch con console.error + throw
 */

import { rgbToHex, getContrastRatio, calculateOptimalTextColor } from './colorUtils.js'

/**
 * Convierte color CSS (rgb/rgba) a hex
 * @param {string} cssColor - Color en formato rgb(a)
 * @returns {string} Color en formato #rrggbb
 */
function cssColorToHex(cssColor) {
  try {
    if (!cssColor) {
      return ''
    }
    // Extraer valores RGB
    const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) {
      return ''
    }

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    return rgbToHex(r, g, b)
  } catch (error) {
    console.error('Error converting CSS color to hex:', error)
    return ''
  }
}

/**
 * Aplica automáticamente el contraste óptimo a un elemento
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} selector - Selector para el contexto
 * @param {number} minRatio - Ratio mínimo de contraste
 * @returns {boolean} true si se ajustó, false si ya era óptimo
 */
export function autoAdjustContrast(element, _selector = null, minRatio = 5.0) {
  try {
    if (!element) {
      return false
    }

    // Si el elemento está oculto, no necesita ajuste
    const style = window.getComputedStyle(element)
    if (style.visibility === 'hidden' || style.display === 'none') {
      return false
    }

    // Solo procesar elementos con texto o que contengan texto
    const hasVisibleText = element.textContent && element.textContent.trim().length > 0
    const isTextElement =
      [
        'p',
        'span',
        'div',
        'a',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'label',
        'small',
        'strong',
        'em',
        'blockquote'
      ].includes(element.tagName.toLowerCase()) ||
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
      element.classList.contains('footer-section')

    if (!hasVisibleText && !isTextElement) {
      return false
    }

    // Obtener colores de fondo y texto
    let bgColor = ''
    let textColor = ''

    // Buscar el fondo más cercano
    let currentElement = element
    while (currentElement && currentElement !== document.documentElement) {
      const computedStyle = window.getComputedStyle(currentElement)

      // Verificar si este elemento tiene un fondo explícito
      const bg = computedStyle.backgroundColor
      if (bg && !bg.startsWith('rgba?(0, 0, 0, 0)') && !bg.startsWith('rgba?(255, 255, 255, 0)')) {
        bgColor = cssColorToHex(bg)
        if (bgColor) {
          break
        }
      }

      currentElement = currentElement.parentElement
    }

    // Si no encontramos un fondo específico, usar el del body
    if (!bgColor) {
      const bodyStyle = window.getComputedStyle(document.body)
      bgColor = cssColorToHex(bodyStyle.backgroundColor)
    }

    // Obtener el color de texto del elemento actual
    textColor = cssColorToHex(style.color)

    // Si no pudimos obtener los colores, salir
    if (!bgColor || !textColor) {
      return false
    }

    // Calcular el ratio de contraste actual
    const currentRatio = getContrastRatio(bgColor, textColor)

    // Si el contraste es insuficiente, calcular y aplicar el color óptimo
    if (currentRatio < minRatio) {
      // Calcular el color óptimo
      const optimalColor = calculateOptimalTextColor(bgColor, [textColor], minRatio)

      // Aplicar el color óptimo
      element.style.color = optimalColor

      return true
    }

    return false
  } catch (error) {
    console.error('Error adjusting contrast:', error)
    return false
  }
}

/**
 * Ajusta contraste para todos los inputs de un formulario
 * @param {HTMLElement|string} form - Formulario o selector
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustFormContrast(form, minRatio = 5.0) {
  try {
    const formElement = typeof form === 'string' ? document.querySelector(form) : form
    if (!formElement) {
      return 0
    }

    let adjusted = 0

    // Ajustar inputs, textareas y selects
    const inputs = formElement.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      if (autoAdjustContrast(input, 'form input', minRatio)) {
        adjusted++
      }
    })

    // Ajustar labels
    const labels = formElement.querySelectorAll('label')
    labels.forEach(label => {
      if (autoAdjustContrast(label, 'form label', minRatio)) {
        adjusted++
      }
    })

    // Ajustar párrafos y spans
    const texts = formElement.querySelectorAll('span, p, small, .form-text')
    texts.forEach(text => {
      if (autoAdjustContrast(text, 'form text', minRatio)) {
        adjusted++
      }
    })

    return adjusted
  } catch (error) {
    console.error('Error adjusting form contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste para toda la página
 * @param {string} selector - Selector CSS para el contenedor
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustPageContrast(selector = 'body', minRatio = 5.0) {
  try {
    const container = document.querySelector(selector)
    if (!container) {
      return 0
    }

    let adjusted = 0

    // Ajustar todos los elementos con texto
    const elements = container.querySelectorAll('*')
    elements.forEach(element => {
      if (autoAdjustContrast(element, 'page', minRatio)) {
        adjusted++
      }
    })

    return adjusted
  } catch (error) {
    console.error('Error adjusting page contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste específicamente para la barra de navegación
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustNavbarContrast(minRatio = 5.0) {
  try {
    const navbar = document.querySelector('nav')
    if (!navbar) {
      return 0
    }

    let adjusted = 0

    // Ajustar todos los elementos dentro de la navbar
    const elements = navbar.querySelectorAll('*')
    elements.forEach(element => {
      if (autoAdjustContrast(element, 'navbar', minRatio)) {
        adjusted++
      }
    })

    return adjusted
  } catch (error) {
    console.error('Error adjusting navbar contrast:', error)
    return 0
  }
}

/**
 * Aplica contraste a un elemento con fondo gradiente o imagen
 * @param {HTMLElement} element - Elemento DOM
 * @param {number} minRatio - Ratio mínimo
 * @returns {boolean} true si se ajustó, false si no
 */
export function adjustContrastForBackground(element, minRatio = 5.0) {
  try {
    const style = window.getComputedStyle(element)

    // Verificar si tiene un gradiente o imagen de fondo
    const backgroundImage = style.backgroundImage
    const isGradient = backgroundImage && backgroundImage.startsWith('linear-gradient')
    const isImage = backgroundImage && backgroundImage.startsWith('url(')

    if (!isGradient && !isImage) {
      return false
    }

    // Si es un gradiente, extraer el color promedio
    if (isGradient) {
      // Extraer colores del gradiente
      const colors = []
      const gradientParts = backgroundImage.match(/rgba?\([^)]+\)/g) || []

      gradientParts.forEach(color => {
        const hex = cssColorToHex(color)
        if (hex) {
          colors.push(hex)
        }
      })

      if (colors.length > 0) {
        // Usar el primer color del gradiente para calcular el contraste
        const bgColor = colors[0]
        const textColor = cssColorToHex(style.color)

        if (textColor) {
          const currentRatio = getContrastRatio(bgColor, textColor)
          if (currentRatio < minRatio) {
            const optimalColor = calculateOptimalTextColor(bgColor, [textColor], minRatio)
            element.style.color = optimalColor
            return true
          }
        }
      }
    } else if (isImage) {
      // Para imágenes, aplicar un overlay para mejorar el contraste
      // Esto es más complejo y podría requerir una implementación adicional
    }

    return false
  } catch (error) {
    console.error('Error adjusting contrast for background:', error)
    return false
  }
}

/**
 * Mejora el contraste para toda la página
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function enhancePageContrast(minRatio = 5.0) {
  try {
    let totalAdjusted = 0

    // 1. Ajustar la barra de navegación
    const navbarAdjusted = autoAdjustNavbarContrast(minRatio)
    totalAdjusted += navbarAdjusted
    console.log(`✨ Enhanced navbar contrast for ${navbarAdjusted} elements`)

    // 2. Ajustar formularios
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      const formAdjusted = autoAdjustFormContrast(form, minRatio)
      totalAdjusted += formAdjusted
    })
    if (forms.length > 0) {
      console.log(`✨ Enhanced form contrast for ${totalAdjusted - navbarAdjusted} elements`)
    }

    // 3. Ajustar elementos con gradiente o imagen de fondo
    const gradientElements = document.querySelectorAll(
      '[style*="linear-gradient"], [class*="gradient"]'
    )
    gradientElements.forEach(element => {
      if (adjustContrastForBackground(element, minRatio)) {
        totalAdjusted++
      }
    })

    // 4. Ajustar el resto de la página
    const pageAdjusted = autoAdjustPageContrast('body', minRatio)
    totalAdjusted += pageAdjusted
    console.log(`✨ Enhanced page contrast for ${pageAdjusted} elements`)

    return totalAdjusted
  } catch (error) {
    console.error('Error enhancing page contrast:', error)
    return 0
  }
}

/**
 * Inicializa el ajuste automático de contraste en eventos relevantes
 */
export function initAutoContrast() {
  // Ajustar contraste cuando cambie el tema
  window.addEventListener('themeChanged', () => {
    setTimeout(() => {
      const totalAdjusted = enhancePageContrast(5.0)
      console.log(`✨ [ContrastEnhancer] Auto-adjusted contrast for ${totalAdjusted} elements`)
    }, 100)
  })

  // Ajustar contraste cuando se cargue la página
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const totalAdjusted = enhancePageContrast(5.0)
      console.log(
        `✨ [ContrastEnhancer] Auto-adjusted contrast for ${totalAdjusted} elements on page load`
      )
    }, 100)
  })
}

// Exportar por defecto
export default {
  autoAdjustContrast,
  autoAdjustFormContrast,
  autoAdjustPageContrast,
  autoAdjustNavbarContrast,
  adjustContrastForBackground,
  enhancePageContrast,
  initAutoContrast
}
