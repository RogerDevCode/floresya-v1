/**
 * FloresYa - Utilidades de Color y Contraste
 * Algoritmo similar a Dark Reader para cálculo automático de contraste
 * Siguiendo principios CLAUDE.md: KISS, fail-fast, funciones puras
 */

/**
 * Convierte color hexadecimal a RGB
 * @param {string} hex - Color en formato #rrggbb
 * @returns {{r: number, g: number, b: number}} Objeto RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * Convierte RGB a hexadecimal
 * @param {number} r - Componente rojo (0-255)
 * @param {number} g - Componente verde (0-255)
 * @param {number} b - Componente azul (0-255)
 * @returns {string} Color en formato #rrggbb
 */
export function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

/**
 * Calcula la luminancia relativa de un color (algoritmo WCAG)
 * @param {string} hex - Color en formato #rrggbb
 * @returns {number} Luminancia (0-1)
 */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return 0
  }

  const { r, g, b } = rgb

  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calcula el ratio de contraste entre dos colores
 * @param {string} color1 - Color 1 en formato #rrggbb
 * @param {string} color2 - Color 2 en formato #rrggbb
 * @returns {number} Ratio de contraste (1-21)
 */
export function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Ajusta un color para alcanzar un ratio de contraste mínimo
 * Similar a Dark Reader - busca el color más cercano que cumpla el ratio
 * @param {string} backgroundColor - Color de fondo #rrggbb
 * @param {string} textColor - Color de texto inicial #rrggbb
 * @param {number} minRatio - Ratio mínimo (4.5 para AA, 7 para AAA)
 * @returns {string} Color ajustado #rrggbb
 */
export function adjustColorForContrast(backgroundColor, textColor, minRatio = 4.5) {
  const currentRatio = getContrastRatio(backgroundColor, textColor)

  // Si ya cumple el ratio, devolver el color original
  if (currentRatio >= minRatio) {
    return textColor
  }

  const bgRgb = hexToRgb(backgroundColor)
  const textRgb = hexToRgb(textColor)

  if (!bgRgb || !textRgb) {
    return textColor
  }

  // Determinar si necesitamos oscurecer o aclarar el texto
  const bgLuminance = getLuminance(backgroundColor)
  const textLuminance = getLuminance(textColor)

  // Si el fondo es claro, oscurecer el texto
  // Si el fondo es oscuro, aclarar el texto
  const shouldDarken = bgLuminance > textLuminance

  // Ajustar gradualmente hasta alcanzar el ratio mínimo
  const adjustedRgb = { ...textRgb }
  const step = 5
  const maxIterations = 51

  for (let i = 0; i < maxIterations; i++) {
    if (shouldDarken) {
      adjustedRgb.r = Math.max(0, adjustedRgb.r - step)
      adjustedRgb.g = Math.max(0, adjustedRgb.g - step)
      adjustedRgb.b = Math.max(0, adjustedRgb.b - step)
    } else {
      adjustedRgb.r = Math.min(255, adjustedRgb.r + step)
      adjustedRgb.g = Math.min(255, adjustedRgb.g + step)
      adjustedRgb.b = Math.min(255, adjustedRgb.b + step)
    }

    const adjustedHex = rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b)
    const ratio = getContrastRatio(backgroundColor, adjustedHex)

    if (ratio >= minRatio) {
      return adjustedHex
    }
  }

  // Si no pudimos alcanzar el ratio, devolver el color más extremo
  return shouldDarken ? '#000000' : '#ffffff'
}

/**
 * Calcula automáticamente el color de texto óptimo para un fondo
 * @param {string} backgroundColor - Color de fondo
 * @param {string[]} preferredColors - Colores preferidos (prioridad)
 * @param {number} minRatio - Ratio mínimo
 * @returns {string} Color de texto óptimo
 */
export function calculateOptimalTextColor(
  backgroundColor,
  preferredColors = ['#ffffff', '#000000'],
  minRatio = 4.5
) {
  // Probar colores preferidos en orden
  for (const color of preferredColors) {
    const ratio = getContrastRatio(backgroundColor, color)
    if (ratio >= minRatio) {
      return color
    }
  }

  // Si ningún color preferido funciona, ajustar el mejor
  const bestColor = preferredColors[0]
  return adjustColorForContrast(backgroundColor, bestColor, minRatio)
}

/**
 * Genera una variación de color con la misma tonalidad pero diferente luminosidad
 * @param {string} color - Color base
 * @param {number} percent - Porcentaje de cambio (-100 a 100)
 * @returns {string} Color ajustado
 */
export function adjustColorBrightness(color, percent) {
  const rgb = hexToRgb(color)
  if (!rgb) {
    return color
  }

  const { r, g, b } = rgb
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100

  const newRgb = {
    r: Math.round((t - r) * p) + r,
    g: Math.round((t - g) * p) + g,
    b: Math.round((t - b) * p) + b
  }

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Mezcla dos colores en proporción
 * @param {string} color1 - Color 1
 * @param {string} color2 - Color 2
 * @param {number} percent - Porcentaje del color 1 (0-100)
 * @returns {string} Color mezclado
 */
export function blendColors(color1, color2, percent) {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  if (!rgb1 || !rgb2) {
    return color1
  }

  const p = percent / 100

  const blended = {
    r: Math.round(rgb1.r * p + rgb2.r * (1 - p)),
    g: Math.round(rgb1.g * p + rgb2.g * (1 - p)),
    b: Math.round(rgb1.b * p + rgb2.b * (1 - p))
  }

  return rgbToHex(blended.r, blended.g, blended.b)
}

/**
 * Verifica si un color es claro u oscuro
 * @param {string} color - Color a verificar
 * @returns {boolean} true si es claro, false si es oscuro
 */
export function isLightColor(color) {
  return getLuminance(color) > 0.5
}

/**
 * Calcula todas las variables de texto para un tema basado en su fondo
 * Útil para generar automáticamente --theme-text-on-*
 * @param {string} primaryBg - Color de fondo primario
 * @param {string} secondaryBg - Color de fondo secundario
 * @param {string} primaryColor - Color primario del tema
 * @returns {Object} Objeto con todas las variables de texto
 */
export function calculateTextVariables(primaryBg, secondaryBg, primaryColor) {
  const isPrimaryLight = isLightColor(primaryBg)

  return {
    '--theme-text-primary': calculateOptimalTextColor(primaryBg, ['#1f2937', '#f9fafb']),
    '--theme-text-secondary': calculateOptimalTextColor(
      primaryBg,
      isPrimaryLight ? ['#6b7280', '#374151'] : ['#cbd5e1', '#e2e8f0']
    ),
    '--theme-text-on-primary': calculateOptimalTextColor(primaryColor, ['#ffffff', '#000000']),
    '--theme-text-on-bg-primary': calculateOptimalTextColor(primaryBg, ['#1f2937', '#f9fafb']),
    '--theme-text-on-bg-secondary': calculateOptimalTextColor(secondaryBg, ['#374151', '#e2e8f0'])
  }
}

/**
 * Aplica automáticamente contraste a un elemento del DOM
 * @param {HTMLElement} element - Elemento a procesar
 * @param {string} property - Propiedad CSS a ajustar
 * @param {string} backgroundProperty - Propiedad CSS del fondo de referencia
 * @param {number} minRatio - Ratio mínimo
 */
export function applyAutoContrast(element, property, backgroundProperty, minRatio = 4.5) {
  try {
    const computedStyle = window.getComputedStyle(element)
    const textColor = computedStyle.color
    const bgColor = computedStyle.backgroundColor

    // Extraer RGB de rgb(r, g, b)
    const textRgb = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    const bgRgb = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)

    if (!textRgb || !bgRgb) {
      return
    }

    const textHex = rgbToHex(parseInt(textRgb[1]), parseInt(textRgb[2]), parseInt(textRgb[3]))
    const bgHex = rgbToHex(parseInt(bgRgb[1]), parseInt(bgRgb[2]), parseInt(bgRgb[3]))

    const optimalColor = calculateOptimalTextColor(bgHex, [textHex], minRatio)
    element.style.setProperty(property, optimalColor)
  } catch (error) {
    console.warn('⚠️ [ColorUtils] Error applying auto contrast:', error)
  }
}

/**
 * Extiende un tema con variables granulares calculadas automáticamente
 * @param {Object} theme - Objeto del tema
 * @returns {Object} Tema extendido con variables granulares
 */
export function extendThemeWithGranularVariables(theme) {
  const variables = { ...theme.variables }

  // Calcular variables granulares basadas en el tema
  const primaryBg = variables['--theme-bg-primary'] || '#ffffff'
  const secondaryBg = variables['--theme-bg-secondary'] || '#f8fafc'
  const primaryColor = variables['--theme-primary'] || '#ec4899'

  // Variables de texto granulares
  const textVars = calculateTextVariables(primaryBg, secondaryBg, primaryColor)
  Object.assign(variables, textVars)

  return { ...theme, variables }
}
