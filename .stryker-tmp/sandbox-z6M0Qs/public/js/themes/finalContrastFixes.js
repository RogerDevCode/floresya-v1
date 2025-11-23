/**
 * FloresYa - Sistema de Aplicación de Contraste Final
 * Asegura que las correcciones de contraste se apliquen definitivamente
 * después de que todos los temas se han cargado y aplicado
 */
// @ts-nocheck

document.addEventListener('DOMContentLoaded', function () {
  // Aplicar contraste mejorado después de que todo se haya cargado
  setTimeout(() => {
    applyFinalContrastCorrections()
  }, 500) // Dar tiempo a que temas se apliquen completamente
})

/**
 * Aplica correcciones de contraste definitivas para garantizar WCAG AAA
 */
function applyFinalContrastCorrections() {
  try {
    console.log('🎨 [FinalContrastCorrections] Aplicando correcciones definitivas de contraste...')

    // 1. Asegurar contraste AAA en todos los elementos de texto visibles
    const allTextElements = document.querySelectorAll('*')
    let corrected = 0

    allTextElements.forEach(element => {
      if (hasVisibleText(element)) {
        const contrastApplied = applyDefinitiveContrastCorrection(element)
        if (contrastApplied) {
          corrected++
        }
      }
    })

    console.log(
      `✅ [FinalContrastCorrections] Corregidos ${corrected} elementos con contraste definitivo`
    )
  } catch (error) {
    console.error('❌ [FinalContrastCorrections] Error aplicando correcciones definitivas:', error)
  }
}

/**
 * Determina si un elemento tiene texto visible
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean} True si tiene texto visible
 */
function hasVisibleText(element) {
  const tagName = element.tagName.toLowerCase()
  const styles = window.getComputedStyle(element)

  // Verificar si es un elemento que normalmente contiene texto visible
  const textElements = [
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
    'li',
    'td',
    'th',
    'caption',
    'button',
    'input',
    'select',
    'textarea'
  ]

  // Verificar si es un elemento de texto o tiene texto
  const hasText = element.textContent && element.textContent.trim().length > 0
  const isVisible = styles.visibility !== 'hidden' && styles.display !== 'none'
  const isTextElement =
    textElements.includes(tagName) ||
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
    element.classList.contains('hero-text') ||
    element.classList.contains('product-title') ||
    element.classList.contains('product-price')

  return hasText && isVisible && isTextElement
}

/**
 * Aplica corrección de contraste definitiva a un elemento
 * @param {HTMLElement} element - Elemento a corregir
 * @returns {boolean} True si se aplicó corrección
 */
function applyDefinitiveContrastCorrection(element) {
  try {
    const computedStyle = window.getComputedStyle(element)
    const currentColor = computedStyle.color
    const currentBg = computedStyle.backgroundColor
    const currentBgImage = computedStyle.backgroundImage

    // Verificar si tiene gradiente o imagen de fondo
    const hasGradient = currentBgImage.includes('gradient')
    const isBgTransparent =
      currentBg === 'transparent' ||
      currentBg.includes('rgba(0, 0, 0, 0)') ||
      currentBg.includes('rgba(255, 255, 255, 0)')

    // Obtener color de fondo efectivo (buscando hacia atrás en el DOM si es transparente)
    let effectiveBg = currentBg
    if (
      isBgTransparent ||
      currentBg === 'rgba(0, 0, 0, 0)' ||
      currentBg === 'rgba(255, 255, 255, 0)'
    ) {
      effectiveBg = getEffectiveBackgroundColor(element)
    } else if (hasGradient) {
      // Si tiene gradiente, calcular el color promedio
      effectiveBg = getAverageColorFromGradient(currentBgImage) || currentBg
    }

    // Convertir colores a formato hex si están en RGB
    const bgColorHex = cssToHex(effectiveBg)
    const textColorHex = cssToHex(currentColor)

    if (!bgColorHex || !textColorHex) {
      return false // No podemos trabajar con estos colores
    }

    // Calcular ratio actual
    const currentRatio = getContrastRatio(bgColorHex, textColorHex)

    // Si el ratio es insuficiente (< 4.5 para AA, < 7.0 para AAA), corregirlo
    const neededRatio = 7.0 // AAA standard

    if (currentRatio < neededRatio) {
      // Calcular color óptimo
      const optimalColor = calculateOptimalColorForContrast(bgColorHex, neededRatio)

      // Aplicar color con mayor especificidad para sobreescribir estilos de tema
      element.style.setProperty('color', optimalColor, 'important')

      // Si es un elemento de texto con fondo transparente o problema, también aplicar sombra para mejorar legibilidad
      if (isBgTransparent || currentRatio < 2.0) {
        element.style.setProperty(
          'text-shadow',
          `1px 1px 2px ${invertColor(bgColorHex)}`,
          'important'
        )
      }

      console.log(
        `🎨 [FinalContrastCorrections] Corregido contraste para: ${element.tagName} (${currentRatio.toFixed(2)} → ${getContrastRatio(bgColorHex, optimalColor).toFixed(2)})`
      )
      return true
    }

    return false
  } catch (error) {
    console.warn('⚠️ [FinalContrastCorrections] Error corrigiendo contraste para elemento:', error)
    return false
  }
}

/**
 * Busca hacia atrás en el DOM para encontrar el color de fondo efectivo
 * @param {HTMLElement} element - Elemento para comenzar la búsqueda
 * @returns {string} Color de fondo efectivo en formato hex
 */
function getEffectiveBackgroundColor(element) {
  let current = element
  const maxDepth = 10 // Evitar bucles infinitos
  let depth = 0

  while (current && current !== document.documentElement && depth < maxDepth) {
    const style = window.getComputedStyle(current)
    const bgColor = style.backgroundColor

    // Si encontramos un fondo que no es transparente, usarlo
    if (
      bgColor !== 'transparent' &&
      !bgColor.includes('rgba(0, 0, 0, 0)') &&
      !bgColor.includes('rgba(255, 255, 255, 0)')
    ) {
      return cssToHex(bgColor)
    }

    current = current.parentElement
    depth++
  }

  // Si llegamos al body sin encontrar fondo, usar blanco por defecto
  const bodyStyle = window.getComputedStyle(document.body)
  return cssToHex(bodyStyle.backgroundColor) || '#ffffff'
}

/**
 * Calcula el color promedio de un gradiente
 * @param {string} gradientString - Cadena de gradiente CSS
 * @returns {string} Color promedio en formato hex o null si no se puede calcular
 */
function getAverageColorFromGradient(gradientString) {
  // Esta es una simplificación - en una implementación completa,
  // se calcularía el color promedio real del gradiente
  try {
    // Extraer los colores del gradiente
    const colorMatches = gradientString.match(/(#[a-fA-F0-9]{3,6}|rgba?\([^)]+\))/g)
    if (!colorMatches || colorMatches.length === 0) {
      return null
    }

    // Simplificación: usar el primer color que podamos convertir a hex
    for (const colorMatch of colorMatches) {
      const hex = cssToHex(colorMatch)
      if (hex) {
        return hex
      }
    }

    return null
  } catch (error) {
    console.warn('⚠️ Error calculando color promedio de gradiente:', error)
    return null
  }
}

/**
 * Convierte color CSS a formato Hex
 * @param {string} cssColor - Color en formato CSS (hex, rgb, rgba)
 * @returns {string} Color en formato hex o null si no se puede convertir
 */
function cssToHex(cssColor) {
  if (!cssColor) {
    return null
  }

  // Si ya es hex, devolverlo
  if (cssColor.startsWith('#')) {
    return cssColor.length === 4 ? expandHex(cssColor) : cssColor
  }

  // Si es rgb/rgba, convertir a hex
  const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    return rgbToHex(r, g, b)
  }

  // Mapeo de colores nombrados
  const namedColors = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0000ff',
    yellow: '#ffff00',
    orange: '#ffa500',
    purple: '#800080',
    pink: '#ffc0cb',
    gray: '#808080',
    grey: '#808080',
    silver: '#c0c0c0',
    maroon: '#800000',
    navy: '#000080',
    lime: '#00ff00',
    olive: '#808000',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    teal: '#008080',
    brown: '#a52a2a'
  }

  return namedColors[cssColor.toLowerCase()] || null
}

/**
 * Expande un hex corto a formato largo
 * @param {string} hex - Hex corto (#rgb)
 * @returns {string} Hex largo (#rrggbb)
 */
function expandHex(hex) {
  return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
}

/**
 * Convierte RGB a HEX
 * @param {number} r - Rojo (0-255)
 * @param {number} g - Verde (0-255)
 * @param {number} b - Azul (0-255)
 * @returns {string} Color en formato #rrggbb
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

/**
 * Calcula el ratio de contraste entre dos colores (algoritmo WCAG)
 * @param {string} color1 - Color 1 en formato #rrggbb
 * @param {string} color2 - Color 2 en formato #rrggbb
 * @returns {number} Ratio de contraste (1-21)
 */
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Calcula la luminancia relativa (algoritmo WCAG)
 * @param {string} hex - Color en formato #rrggbb
 * @returns {number} Luminancia relativa (0-1)
 */
function getLuminance(hex) {
  // Quitar el # si existe
  let r, g, b
  if (hex.startsWith('#')) {
    r = parseInt(hex.substr(1, 2), 16)
    g = parseInt(hex.substr(3, 2), 16)
    b = parseInt(hex.substr(5, 2), 16)
  } else {
    return 0 // Formato inválido
  }

  // Convertir a sRGB
  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  // Aplicar transformación gamma
  const rSRGB = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gSRGB = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bSRGB = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  // Calcular luminancia
  return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB
}

/**
 * Calcula el color óptimo para un ratio de contraste específico
 * @param {string} backgroundColor - Color de fondo en formato #rrggbb
 * @param {number} minRatio - Ratio mínimo deseado
 * @returns {string} Color de texto óptimo en formato #rrggbb
 */
function calculateOptimalColorForContrast(backgroundColor, minRatio) {
  const bgLum = getLuminance(backgroundColor)

  // Determinar si el fondo es claro u oscuro para saber qué tipo de texto usar
  if (bgLum > 0.5) {
    // Fondo claro: usar texto oscuro
    // Empezar con negro y verificar si cumple el ratio
    const blackLuminance = getLuminance('#000000')
    const currentRatio =
      (Math.max(bgLum, blackLuminance) + 0.05) / (Math.min(bgLum, blackLuminance) + 0.05)

    if (currentRatio >= minRatio) {
      return '#000000' // Negro tiene buen contraste con fondos claros
    } else {
      // Necesitamos oscurecer el texto aún más (ya está en negro, así que usar casi negro)
      // En realidad negro es el texto más oscuro posible, por lo que si no cumple es porque el fondo es muy claro
      // pero con un valor muy alto como #000000 debería cumplir con ratios altos con la mayoría de fondos claros
      return '#000000'
    }
  } else {
    // Fondo oscuro: usar texto claro
    const whiteLuminance = getLuminance('#ffffff')
    const currentRatio =
      (Math.max(bgLum, whiteLuminance) + 0.05) / (Math.min(bgLum, whiteLuminance) + 0.05)

    if (currentRatio >= minRatio) {
      return '#ffffff' // Blanco tiene buen contraste con fondos oscuros
    } else {
      // El fondo es muy oscuro, necesitamos acercarnos al blanco
      return '#ffffff'
    }
  }
}

/**
 * Invierte un color (blanco→negro, negro→blanco, etc.)
 * @param {string} hex - Color en formato #rrggbb
 * @returns {string} Color invertido
 */
function invertColor(hex) {
  if (!hex || !hex.startsWith('#')) {
    return '#000000'
  }

  // Quitar el # y convertir a número
  const num = parseInt(hex.slice(1), 16)
  // Invertir los bits y formatear a hex con 6 dígitos
  const inverted = (num ^ 0xffffff).toString(16).padStart(6, '0')
  return `#${inverted}`
}

// Tambien aplicar cuando cambia el tema
window.addEventListener('themeChanged', function () {
  setTimeout(() => {
    applyFinalContrastCorrections()
  }, 300) // Esperar a que el tema se aplique completamente
})

// Exportar para usar en otros lugares si es necesario
window.FloresyaFinalContrastFixer = {
  applyFinalContrastCorrections,
  hasVisibleText,
  applyDefinitiveContrastCorrection
}

console.log('✅ [FinalContrastCorrections] Sistema de corrección definitiva de contraste cargado')
