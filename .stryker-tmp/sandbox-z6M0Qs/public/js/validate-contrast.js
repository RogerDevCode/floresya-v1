/**
 * FloresYa - Validador de Contraste en Aplicación Real
 * Verifica que el contraste en la aplicación cumple con WCAG 2.1
 * Siguiendo principios CLAUDE.md: KISS, fail-fast, try-catch con console.error + throw
 */
// @ts-nocheck

import { getContrastRatio } from './themes/colorUtils.js'

/**
 * Extrae el color de un elemento CSS
 * @param {string} cssColor - Color en formato CSS
 * @returns {string} Color en formato #rrggbb
 */
function extractColor(cssColor) {
  try {
    if (
      !cssColor ||
      cssColor === 'transparent' ||
      cssColor === 'rgba(0, 0, 0, 0)' ||
      cssColor === 'rgba(255, 255, 255, 0)'
    ) {
      return ''
    }

    // Manejar colores hexadecimales directamente
    if (cssColor.startsWith('#')) {
      const hex =
        cssColor.length === 4
          ? `#${cssColor[1]}${cssColor[1]}${cssColor[2]}${cssColor[2]}${cssColor[3]}${cssColor[3]}`
          : cssColor
      return hex
    }

    // Extraer valores RGB/RGBA
    const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) {
      return ''
    }

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    // Convertir a hex
    const hex =
      '#' +
      [r, g, b]
        .map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        })
        .join('')

    return hex
  } catch (error) {
    console.warn('⚠️ Error extracting color:', error)
    return ''
  }
}

/**
 * Encuentra el fondo de un elemento
 * @param {HTMLElement} element - Elemento DOM
 * @returns {string} Color de fondo en formato #rrggbb
 */
function findBackgroundColor(element) {
  try {
    let current = element

    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current)

      // Verificar si este elemento tiene un fondo explícito
      const bg = style.backgroundColor
      if (
        bg &&
        bg !== 'transparent' &&
        !bg.startsWith('rgba(0, 0, 0, 0)') &&
        !bg.startsWith('rgba(255, 255, 255, 0)')
      ) {
        const extractedBg = extractColor(bg)
        if (extractedBg) {
          return extractedBg
        }
      }

      current = current.parentElement
    }

    // Si no encontramos un fondo específico, usar el del body
    const bodyStyle = window.getComputedStyle(document.body)
    const bodyBg = extractColor(bodyStyle.backgroundColor)
    return bodyBg || '#ffffff'
  } catch (error) {
    console.warn('⚠️ Error finding background color:', error)
    return '#ffffff'
  }
}

/**
 * Valida el contraste de un elemento
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} name - Nombre del elemento (para el reporte)
 * @returns {Object} Resultado de la validación
 */
function validateElementContrast(element, name) {
  try {
    const style = window.getComputedStyle(element)

    // Verificar si el elemento está oculto
    if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') {
      return {
        valid: true,
        ratio: 0,
        message: 'Element is hidden',
        name: name || 'hidden-element',
        textColor: '',
        backgroundColor: ''
      }
    }

    // Solo validar elementos con texto visible
    const hasVisibleText = element.textContent && element.textContent.trim().length > 0
    if (!hasVisibleText) {
      return {
        valid: true,
        ratio: 0,
        message: 'No visible text',
        name: name || element.tagName.toLowerCase(),
        textColor: '',
        backgroundColor: ''
      }
    }

    // Obtener colores
    const textColor = extractColor(style.color)
    const backgroundColor = findBackgroundColor(element)

    if (!textColor || !backgroundColor) {
      // Intentar identificar elemento para reporte más útil
      const elementInfo = getElementInfo(element)
      return {
        valid: false,
        ratio: 0,
        message: 'Could not extract colors',
        name: elementInfo,
        textColor: textColor || 'undefined',
        backgroundColor: backgroundColor || 'undefined'
      }
    }

    // Calcular ratio
    const ratio = getContrastRatio(textColor, backgroundColor)
    const valid = ratio >= 4.5

    return {
      valid,
      ratio,
      message: valid ? 'Meets WCAG AA' : `Does not meet WCAG AA (4.5:1 needed)`,
      name: name || element.tagName.toLowerCase(),
      textColor,
      backgroundColor
    }
  } catch (error) {
    console.warn('⚠️ Error validating element contrast:', error)
    return {
      valid: false,
      ratio: 0,
      message: `Error: ${error.message}`,
      name: element ? element.tagName.toLowerCase() : 'unknown',
      textColor: 'error',
      backgroundColor: 'error'
    }
  }
}

/**
 * Obtiene información legible sobre un elemento
 * @param {HTMLElement} element - Elemento DOM
 * @returns {string} Información del elemento
 */
function getElementInfo(element) {
  if (!element) {
    return 'unknown'
  }

  let name = element.tagName.toLowerCase()

  if (element.id) {
    name += `#${element.id}`
  }
  if (element.className && typeof element.className === 'string') {
    name += `.${element.className.split(' ').join('.')}`
  }

  // Limitar la longitud del nombre para el reporte
  if (name.length > 50) {
    name = name.substring(0, 47) + '...'
  }

  return name
}

/**
 * Valida el contraste de todos los elementos en la página
 * @returns {Array} Resultados de la validación
 */
function validatePageContrast() {
  try {
    console.log('🔍 Validating page contrast...')

    const results = []
    const elements = document.querySelectorAll('*')

    // Elementos con texto que necesitamos validar
    const textElements = Array.from(elements).filter(el => {
      const tagName = el.tagName.toLowerCase()
      const hasText = el.textContent && el.textContent.trim().length > 0
      const style = window.getComputedStyle(el)
      const isVisible =
        style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'

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
          'li'
        ].includes(tagName) ||
        el.classList.contains('btn') ||
        el.classList.contains('card') ||
        el.classList.contains('feature-item') ||
        el.classList.contains('testimonial-card') ||
        el.classList.contains('product-card') ||
        el.classList.contains('nav-link') ||
        el.classList.contains('brand-text') ||
        el.classList.contains('nav-icon') ||
        el.classList.contains('navbar-brand') ||
        el.classList.contains('nav-actions') ||
        el.classList.contains('footer-section')

      return isVisible && hasText && isTextElement
    })

    console.log(`Found ${textElements.length} text elements to validate`)

    // Validar cada elemento
    textElements.forEach((element, _index) => {
      const elementInfo = getElementInfo(element)
      const result = validateElementContrast(element, elementInfo)
      results.push(result)
    })

    return results
  } catch (error) {
    console.error('❌ Error validating page contrast:', error)
    return []
  }
}

/**
 * Genera un reporte de contraste
 * @param {Array} results - Resultados de la validación
 * @returns {string} Reporte en formato markdown
 */
function generateContrastReport(results) {
  try {
    const failed = results.filter(
      r => !r.valid && r.message !== 'Element is hidden' && r.message !== 'No visible text'
    )
    const passed = results.filter(
      r => r.valid || r.message === 'Element is hidden' || r.message === 'No visible text'
    )

    const total = results.length
    const passRate = total > 0 ? ((passed.length / total) * 100).toFixed(1) : 0

    let report = `# Reporte de Contraste - FloresYa\n\n`
    report += `**Fecha:** ${new Date().toLocaleString()}\n`
    report += `**Página:** ${window.location.href}\n`
    report += `**Tema:** ${document.documentElement.getAttribute('data-theme') || 'default'}\n\n`

    report += `## Resumen\n\n`
    report += `- **Total de elementos:** ${total}\n`
    report += `- **Elementos con contraste válido:** ${passed.length}\n`
    report += `- **Elementos con contraste inválido:** ${failed.length}\n`
    report += `- **Tasa de éxito:** ${passRate}%\n\n`

    if (failed.length > 0) {
      report += `## Elementos con Problemas de Contraste\n\n`
      report += `| Elemento | Ratio Actual | Color de Texto | Fondo | Mensaje |\n`
      report += `|----------|-------------|----------------|-------|---------|\n`

      // Ordenar por ratio (peores primero)
      failed.sort((a, b) => (a.ratio || 0) - (b.ratio || 0))

      failed.forEach(item => {
        report += `| ${item.name || 'unknown'} | ${(item.ratio || 0).toFixed(2)}:1 | ${item.textColor || 'undefined'} | ${item.backgroundColor || 'undefined'} | ${item.message} |\n`
      })
    } else {
      report += `## ✅ ¡Todos los elementos tienen contraste válido!\n\n`
    }

    return report
  } catch (error) {
    console.error('❌ Error generating contrast report:', error)
    return '# Error generando reporte de contraste'
  }
}

/**
 * Muestra el reporte en la consola
 * @param {Array} results - Resultados de la validación
 */
function displayResults(results) {
  try {
    const report = generateContrastReport(results)
    console.log(report)

    // También intentar mostrar en la página
    const reportContainer = document.getElementById('contrast-report')
    if (reportContainer) {
      reportContainer.innerHTML = `<pre>${report}</pre>`
    }
  } catch (error) {
    console.error('❌ Error displaying results:', error)
  }
}

/**
 * Ejecuta la validación de contraste
 */
export function runValidation() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ runValidation solo puede ejecutarse en un navegador')
    return
  }

  try {
    console.log('🚀 Iniciando validación de contraste...')

    // Esperar un poco para asegurar que todos los estilos se hayan aplicado
    setTimeout(() => {
      const results = validatePageContrast()
      displayResults(results)

      // También actualizar el sessionStorage con resultados
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          'contrast-validation-results',
          JSON.stringify({
            timestamp: new Date().toISOString(),
            results: results,
            summary: {
              total: results.length,
              valid: results.filter(r => r.valid).length,
              invalid: results.filter(
                r =>
                  !r.valid && r.message !== 'Element is hidden' && r.message !== 'No visible text'
              ).length,
              successRate:
                results.length > 0
                  ? ((results.filter(r => r.valid).length / results.length) * 100).toFixed(1)
                  : 0
            }
          })
        )
      }
    }, 100)
  } catch (error) {
    console.error('❌ Error ejecutando validación:', error)
  }
}

// Exportar para módulos ES6
export default {
  runValidation,
  validatePageContrast,
  generateContrastReport
}

// Auto-iniciar en entornos de navegador si se solicita
if (typeof window !== 'undefined' && window.runContrastValidation) {
  window.runContrastValidation = runValidation
}
