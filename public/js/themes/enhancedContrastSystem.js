/**
 * FloresYa - Sistema de Mejora de Contraste Avanzado
 * Versión mejorada que corrige problemas de contraste en temas
 *
 * Características principales:
 * - Detección avanzada de gradientes y fondos complejos
 * - Aplicación de overlay para garantizar contraste
 * - Consideración de transparencias y capas superpuestas
 * - Soluciones específicas para cada tipo de componente
 */

import {
  hexToRgb,
  rgbToHex,
  getLuminance,
  getContrastRatio,
  calculateOptimalTextColor
} from './colorUtils.js'

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
 * Extrae información de gradientes CSS
 * @param {string} gradientString - String de gradiente CSS
 * @returns {Object} Información del gradiente
 */
function extractGradientInfo(gradientString) {
  try {
    // Detectar tipo de gradiente
    const isLinear = gradientString.includes('linear-gradient')
    const isRadial = gradientString.includes('radial-gradient')
    const isConic = gradientString.includes('conic-gradient')

    // Extraer colores del gradiente
    const colorMatches = gradientString.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{3,6}|[a-zA-Z]+\b/g)
    const colors = colorMatches
      ? colorMatches.map(color => cssColorToHex(color)).filter(Boolean)
      : []

    // Extraer ángulo si es linear
    const angleMatch = gradientString.match(/([0-9]+(?:\.[0-9]+)?)deg/)
    const angle = angleMatch ? parseFloat(angleMatch[1]) : 0

    return {
      type: isLinear ? 'linear' : isRadial ? 'radial' : isConic ? 'conic' : 'unknown',
      colors,
      angle,
      hasGradient: colors.length > 0
    }
  } catch (error) {
    console.warn('Error extracting gradient info:', error)
    return { type: 'unknown', colors: [], angle: 0, hasGradient: false }
  }
}

/**
 * Calcula el color promedio de un gradiente
 * @param {string[]} colors - Array de colores hex
 * @returns {string} Color promedio en hex
 */
function getGradientAverageColor(colors) {
  if (colors.length === 0) {
    return '#ffffff'
  }

  let totalR = 0,
    totalG = 0,
    totalB = 0

  colors.forEach(hex => {
    const rgb = hexToRgb(hex)
    if (rgb) {
      totalR += rgb.r
      totalG += rgb.g
      totalB += rgb.b
    }
  })

  const avgR = Math.round(totalR / colors.length)
  const avgG = Math.round(totalG / colors.length)
  const avgB = Math.round(totalB / colors.length)

  return rgbToHex(avgR, avgG, avgB)
}

/**
 * Detecta si un elemento tiene un fondo transparente
 * @param {HTMLElement} element - Elemento DOM
 * @returns {boolean} True si el fondo es transparente
 */
function hasTransparentColor(element) {
  const computedStyle = window.getComputedStyle(element)
  const bgColor = computedStyle.backgroundColor
  return (
    bgColor === 'transparent' ||
    bgColor.startsWith('rgba(0, 0, 0, 0)') ||
    bgColor.startsWith('rgba(255, 255, 255, 0)')
  )
}

/**
 * Busca el color de fondo efectivo considerando capas y transparencias
 * @param {HTMLElement} element - Elemento DOM
 * @returns {string} Color de fondo efectivo en hex
 */
function getEffectiveBackgroundColor(element) {
  try {
    let currentElement = element

    // Buscar hacia arriba en la jerarquía del DOM
    while (currentElement && currentElement !== document.documentElement) {
      const computedStyle = window.getComputedStyle(currentElement)

      // Verificar si este elemento tiene un fondo no transparente
      const bg = computedStyle.backgroundColor
      if (bg && bg !== 'transparent' && !bg.startsWith('rgba(0, 0, 0, 0)')) {
        const bgColor = cssColorToHex(bg)
        if (bgColor) {
          return bgColor
        }
      }

      // Verificar si tiene un gradiente
      const bgImage = computedStyle.backgroundImage
      if (bgImage && bgImage.includes('gradient')) {
        const gradientInfo = extractGradientInfo(bgImage)
        if (gradientInfo.hasGradient) {
          return getGradientAverageColor(gradientInfo.colors)
        }
      }

      currentElement = currentElement.parentElement
    }

    // Si no encontramos un fondo específico, usar el del body
    const bodyStyle = window.getComputedStyle(document.body)
    return cssColorToHex(bodyStyle.backgroundColor) || '#ffffff'
  } catch (error) {
    console.error('Error getting effective background color:', error)
    return '#ffffff'
  }
}

/**
 * Aplica overlay de contraste a un elemento si es necesario
 * @param {HTMLElement} element - Elemento DOM
 * @param {number} minRatio - Ratio mínimo de contraste
 * @returns {boolean} true si se aplicó overlay
 */
function applyContrastOverlayIfNeeded(element, minRatio = 4.5) {
  try {
    const computedStyle = window.getComputedStyle(element)
    const bgColor = computedStyle.backgroundColor
    const textColor = computedStyle.color

    // Si no hay transparencia, no es necesario overlay
    if (!hasTransparentColor(element) && !bgColor.includes('gradient')) {
      return false
    }

    // Calcular ratio actual
    const bgHex = cssColorToHex(bgColor) || getEffectiveBackgroundColor(element)
    const textHex = cssColorToHex(textColor)

    if (!bgHex || !textHex) {
      return false
    }

    const currentRatio = getContrastRatio(bgHex, textHex)

    // Si el ratio ya es suficiente, no necesitamos overlay
    if (currentRatio >= minRatio) {
      return false
    }

    // Determinar si necesitamos un overlay oscuro o claro
    const bgLuminance = getLuminance(bgHex)
    const needDarkOverlay = bgLuminance > 0.5 // Si el fondo es claro, necesitamos overlay oscuro

    // Calcular el overlay necesario
    const overlayOpacity = needDarkOverlay ? 0.3 : 0.2 // Ajustar opacidad según sea necesario

    // Aplicar overlay como pseudo-elemento o transformación
    element.style.position = element.style.position || 'relative'

    // Crear un pseudo-overlay si no existe
    const overlayId = `contrast-overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const overlayColor = needDarkOverlay ? 'rgba(0, 0, 0' : 'rgba(255, 255, 255'

    // Insertar estilo para el overlay
    const style = document.createElement('style')
    style.textContent = `
      #${overlayId} {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${overlayColor}, ${overlayOpacity});
        z-index: -1;
        pointer-events: none;
      }
      
      #${overlayId}::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: inherit;
      }
    `

    document.head.appendChild(style)

    // Añadir el overlay al elemento
    const overlay = document.createElement('div')
    overlay.id = overlayId
    overlay.style.position = 'absolute'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.right = '0'
    overlay.style.bottom = '0'
    overlay.style.zIndex = '-1'
    overlay.style.pointerEvents = 'none'
    overlay.style.backgroundColor = `${overlayColor}, ${overlayOpacity})`

    // Asegurar que el elemento tiene posición relativa
    if (!element.style.position || element.style.position === 'static') {
      element.style.position = 'relative'
    }

    element.appendChild(overlay)

    return true
  } catch (error) {
    console.error('Error applying contrast overlay:', error)
    return false
  }
}

/**
 * Aplica automáticamente el contraste mejorado a un elemento
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} selector - Selector para el contexto
 * @param {number} minRatio - Ratio mínimo de contraste
 * @returns {boolean} true si se ajustó, false si ya era óptimo
 */
export function autoAdjustEnhancedContrast(element, _selector = null, minRatio = 5.0) {
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
        'blockquote',
        'li',
        'td',
        'th'
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
      element.classList.contains('footer-section') ||
      element.classList.contains('hero-title') ||
      element.classList.contains('hero-subtitle') ||
      element.classList.contains('carousel-caption')

    if (!hasVisibleText && !isTextElement) {
      return false
    }

    // Obtener colores de fondo y texto
    let bgColor = ''
    let textColor = ''

    // Buscar el fondo más cercano (mejorado)
    bgColor = getEffectiveBackgroundColor(element)

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
    console.error('Error adjusting enhanced contrast:', error)
    return false
  }
}

/**
 * Ajusta contraste para todos los inputs de un formulario con consideración especial
 * @param {HTMLElement|string} form - Formulario o selector
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustEnhancedFormContrast(form, minRatio = 5.0) {
  try {
    const formElement = typeof form === 'string' ? document.querySelector(form) : form
    if (!formElement) {
      return 0
    }

    let adjusted = 0

    // Ajustar inputs, textareas y selects
    const inputs = formElement.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      // Ajustar color de texto
      if (autoAdjustEnhancedContrast(input, 'form input', minRatio)) {
        adjusted++
      }

      // Ajustar placeholder si es necesario
      const placeholderColor =
        window.getComputedStyle(input).getPropertyValue('--placeholder-color') ||
        window.getComputedStyle(input).color
      const bgColor =
        cssColorToHex(window.getComputedStyle(input).backgroundColor) ||
        getEffectiveBackgroundColor(input)

      if (bgColor && placeholderColor) {
        const currentRatio = getContrastRatio(bgColor, cssColorToHex(placeholderColor))
        if (currentRatio < minRatio) {
          const optimalPlaceholder = calculateOptimalTextColor(
            bgColor,
            [placeholderColor],
            minRatio
          )
          input.style.setProperty('--placeholder-color', optimalPlaceholder)
          adjusted++
        }
      }
    })

    // Ajustar labels
    const labels = formElement.querySelectorAll('label')
    labels.forEach(label => {
      if (autoAdjustEnhancedContrast(label, 'form label', minRatio)) {
        adjusted++
      }
    })

    // Ajustar párrafos y spans
    const texts = formElement.querySelectorAll('span, p, small, .form-text, .help-block')
    texts.forEach(text => {
      if (autoAdjustEnhancedContrast(text, 'form text', minRatio)) {
        adjusted++
      }
    })

    return adjusted
  } catch (error) {
    console.error('Error adjusting enhanced form contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste para toda la página considerando gradientes y capas
 * @param {string} selector - Selector CSS para el contenedor
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustEnhancedPageContrast(selector = 'body', minRatio = 5.0) {
  try {
    let container

    // Si selector es un string, usar querySelector, si es un elemento, usar directamente
    if (typeof selector === 'string') {
      container = document.querySelector(selector)
    } else if (selector instanceof HTMLElement) {
      container = selector
    } else {
      console.error('Invalid selector provided to autoAdjustEnhancedPageContrast:', selector)
      return 0
    }

    if (!container) {
      return 0
    }

    let adjusted = 0

    // Ajustar todos los elementos con texto
    // Si container es un elemento específico (no un query), solo miramos hijos
    const elements = container.querySelectorAll ? container.querySelectorAll('*') : []

    // Ajustar el contenedor mismo si es un HTMLElement y es relevante para contraste
    if (container instanceof HTMLElement) {
      if (autoAdjustEnhancedContrast(container, 'page', minRatio)) {
        adjusted++
      }

      // Aplicar overlay si es necesario para el contenedor mismo
      if (container.classList.contains('hero') || container.classList.contains('carousel')) {
        if (
          container.style.backgroundImage &&
          container.style.backgroundImage.includes('gradient')
        ) {
          applyContrastOverlayIfNeeded(container, minRatio)
        }
      }
    }

    // Ajustar todos los elementos hijos
    elements.forEach(element => {
      if (autoAdjustEnhancedContrast(element, 'page', minRatio)) {
        adjusted++
      }

      // Aplicar overlay si es necesario para elementos problemáticos
      if (element.classList.contains('hero') || element.classList.contains('carousel')) {
        if (element.style.backgroundImage && element.style.backgroundImage.includes('gradient')) {
          applyContrastOverlayIfNeeded(element, minRatio)
        }
      }
    })

    return adjusted
  } catch (error) {
    console.error('Error adjusting enhanced page contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste específicamente para la barra de navegación con consideración especial
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function autoAdjustEnhancedNavbarContrast(minRatio = 5.0) {
  try {
    const navbar = document.querySelector('nav, .navbar, .nav-container')
    if (!navbar) {
      return 0
    }

    let adjusted = 0

    // Ajustar todos los elementos dentro de la navbar
    const elements = navbar.querySelectorAll('*')
    elements.forEach(element => {
      if (autoAdjustEnhancedContrast(element, 'navbar', minRatio)) {
        adjusted++
      }

      // Para elementos de navegación específicos, asegurar contraste AAA
      if (
        element.classList.contains('nav-link') ||
        element.classList.contains('navbar-brand') ||
        element.classList.contains('nav-icon')
      ) {
        // Forzar contraste mínimo más alto para elementos críticos de navegación
        const computedStyle = window.getComputedStyle(element)
        const bgColor = getEffectiveBackgroundColor(element)
        const textColor = cssColorToHex(computedStyle.color)

        if (bgColor && textColor) {
          const currentRatio = getContrastRatio(bgColor, textColor)
          if (currentRatio < 7.0) {
            // AAA para navegación
            const optimalColor = calculateOptimalTextColor(bgColor, [textColor], 7.0)
            element.style.color = optimalColor
            adjusted++
          }
        }
      }
    })

    return adjusted
  } catch (error) {
    console.error('Error adjusting enhanced navbar contrast:', error)
    return 0
  }
}

/**
 * Ajusta contraste para elementos con fondo gradiente
 * @param {HTMLElement} element - Elemento DOM
 * @param {number} minRatio - Ratio mínimo
 * @returns {boolean} true si se ajustó, false si no
 */
export function adjustContrastForGradientBackground(element, minRatio = 5.0) {
  try {
    const computedStyle = window.getComputedStyle(element)
    const backgroundImage = computedStyle.backgroundImage

    // Verificar si tiene un gradiente
    if (backgroundImage && backgroundImage.includes('gradient')) {
      const gradientInfo = extractGradientInfo(backgroundImage)

      if (gradientInfo.hasGradient) {
        // Calcular el color promedio del gradiente
        const avgColor = getGradientAverageColor(gradientInfo.colors)
        const textColor = cssColorToHex(computedStyle.color)

        if (textColor) {
          const currentRatio = getContrastRatio(avgColor, textColor)
          if (currentRatio < minRatio) {
            const optimalColor = calculateOptimalTextColor(avgColor, [textColor], minRatio)

            // Aplicar color óptimo
            element.style.color = optimalColor

            // También considerar aplicar un overlay para garantizar contraste
            applyContrastOverlayIfNeeded(element, minRatio)

            return true
          }
        }
      }
    }

    return false
  } catch (error) {
    console.error('Error adjusting contrast for gradient background:', error)
    return false
  }
}

/**
 * Mejora el contraste para toda la página con enfoque en problemas específicos
 * @param {number} minRatio - Ratio mínimo
 * @returns {number} Número de elementos ajustados
 */
export function enhancePageContrastWithFixes(minRatio = 5.0) {
  try {
    let totalAdjusted = 0

    // 1. Ajustar la barra de navegación (prioridad alta - debe ser clara)
    const navbarAdjusted = autoAdjustEnhancedNavbarContrast(7.0) // AAA para navegación
    totalAdjusted += navbarAdjusted
    console.log(`✨ Enhanced navbar contrast for ${navbarAdjusted} elements (AAA standard)`)

    // 2. Ajustar elementos con gradientes
    const gradientElements = document.querySelectorAll(
      '[style*="linear-gradient"], [style*="radial-gradient"], [class*="gradient"]'
    )
    gradientElements.forEach(element => {
      if (adjustContrastForGradientBackground(element, minRatio)) {
        totalAdjusted++
      }
    })

    // 3. Ajustar formularios
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      const formAdjusted = autoAdjustEnhancedFormContrast(form, minRatio)
      totalAdjusted += formAdjusted
    })
    if (forms.length > 0) {
      console.log(`✨ Enhanced form contrast for ${totalAdjusted - navbarAdjusted} elements`)
    }

    // 4. Ajustar hero sections
    const heroSections = document.querySelectorAll('.hero, .hero-section, [class*="hero"]')
    heroSections.forEach(hero => {
      const heroAdjusted = autoAdjustEnhancedPageContrast(hero, 7.0) // AAA para hero
      totalAdjusted += heroAdjusted
    })

    // 5. Ajustar el resto de la página
    const pageAdjusted = autoAdjustEnhancedPageContrast('body', minRatio)
    totalAdjusted += pageAdjusted
    console.log(`✨ Enhanced page contrast for ${pageAdjusted} elements`)

    // 6. Ajustar elementos específicos que tienden a tener problemas
    const problematicElements = document.querySelectorAll(`
      .carousel-caption, 
      .testimonial-text, 
      .feature-description,
      .product-description,
      .btn-transparent,
      .glass-effect
    `)

    problematicElements.forEach(element => {
      if (autoAdjustEnhancedContrast(element, 'specific', minRatio)) {
        totalAdjusted++
      }
    })

    return totalAdjusted
  } catch (error) {
    console.error('Error enhancing page contrast with fixes:', error)
    return 0
  }
}

/**
 * Función de diagnóstico para identificar problemas de contraste
 * @returns {Object} Reporte de problemas de contraste
 */
export function diagnoseContrastProblems() {
  try {
    const report = {
      elementsChecked: 0,
      elementsWithLowContrast: 0,
      problematicElements: [],
      recommendations: []
    }

    const elements = document.querySelectorAll('*')

    elements.forEach(element => {
      report.elementsChecked++

      const hasText = element.textContent && element.textContent.trim().length > 0
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
        element.classList.contains('nav-link')

      if (hasText && isTextElement) {
        const computedStyle = window.getComputedStyle(element)
        const bgColor = getEffectiveBackgroundColor(element)
        const textColor = cssColorToHex(computedStyle.color)

        if (bgColor && textColor) {
          const ratio = getContrastRatio(bgColor, textColor)

          if (ratio < 4.5) {
            report.elementsWithLowContrast++
            report.problematicElements.push({
              element:
                element.tagName.toLowerCase() +
                (element.id ? `#${element.id}` : '') +
                (element.className ? `.${element.className}`.replace(/\s+/g, '.') : ''),
              contrastRatio: ratio.toFixed(2),
              backgroundColor: bgColor,
              textColor: textColor,
              position: element.getBoundingClientRect().top
            })

            if (ratio < 3.0) {
              report.recommendations.push(
                `CRITICAL: ${element.tagName} element with ratio ${ratio.toFixed(2)} needs immediate attention`
              )
            }
          }
        }
      }
    })

    return report
  } catch (error) {
    console.error('Error diagnosing contrast problems:', error)
    return null
  }
}

/**
 * Inicializa el sistema de contraste mejorado con diagnóstico
 */
export function initEnhancedContrastSystem() {
  // Ajustar contraste cuando cambie el tema
  window.addEventListener('themeChanged', () => {
    setTimeout(() => {
      const totalAdjusted = enhancePageContrastWithFixes(5.0)
      console.log(
        `✨ [EnhancedContrastSystem] Auto-adjusted contrast for ${totalAdjusted} elements`
      )

      // Ejecutar diagnóstico
      const diagnosis = diagnoseContrastProblems()
      if (diagnosis && diagnosis.elementsWithLowContrast > 0) {
        console.warn(
          `⚠️ [EnhancedContrastSystem] Found ${diagnosis.elementsWithLowContrast} elements with low contrast`
        )
        console.log('📋', diagnosis)
      }
    }, 100)
  })

  // Ajustar contraste cuando se cargue la página
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const totalAdjusted = enhancePageContrastWithFixes(5.0)
      console.log(
        `✨ [EnhancedContrastSystem] Initial contrast enhancement: ${totalAdjusted} elements`
      )

      // Ejecutar diagnóstico inicial
      const diagnosis = diagnoseContrastProblems()
      if (diagnosis && diagnosis.elementsWithLowContrast > 0) {
        console.warn(
          `⚠️ [EnhancedContrastSystem] Initial check found ${diagnosis.elementsWithLowContrast} elements with low contrast`
        )
        console.log('📋', diagnosis)
      } else {
        console.log('✅ [EnhancedContrastSystem] All elements meet contrast standards!')
      }
    }, 100)
  })

  // Si el DOM ya está cargado, ejecutar inmediatamente
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    const totalAdjusted = enhancePageContrastWithFixes(5.0)
    console.log(
      `✨ [EnhancedContrastSystem] Immediate contrast enhancement: ${totalAdjusted} elements`
    )

    const diagnosis = diagnoseContrastProblems()
    if (diagnosis && diagnosis.elementsWithLowContrast > 0) {
      console.warn(
        `⚠️ [EnhancedContrastSystem] Immediate check found ${diagnosis.elementsWithLowContrast} elements with low contrast`
      )
      console.log('📋', diagnosis)
    } else {
      console.log('✅ [EnhancedContrastSystem] All elements meet contrast standards!')
    }
  }
}

// Exportar por defecto
export default {
  autoAdjustEnhancedContrast,
  autoAdjustEnhancedFormContrast,
  autoAdjustEnhancedPageContrast,
  autoAdjustEnhancedNavbarContrast,
  adjustContrastForGradientBackground,
  enhancePageContrastWithFixes,
  diagnoseContrastProblems,
  initEnhancedContrastSystem
}
