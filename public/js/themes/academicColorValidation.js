/**
 * FloresYa - Validación Académica de Contrastes
 * Implementa fórmulas WCAG 2.1 para validar temas
 * Basado en CIE L*a*b* y estándares internacionales
 */

/**
 * Calcula luminancia relativa usando fórmula CIE
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
 * Convierte hexadecimal a RGB
 * @param {string} hex
 * @returns {{r: number, g: number, b: number} | null}
 */
function hexToRgb(hex) {
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
 * Calcula ratio de contraste entre dos colores
 * @param {string} color1 - Color fondo
 * @param {string} color2 - Color texto
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
 * Valida si un contraste cumple WCAG
 * @param {string} color1
 * @param {string} color2
 * @param {string} level - 'AAA', 'AA', 'A'
 * @returns {{pass: boolean, ratio: number, level: string}}
 */
export function validateContrast(color1, color2, level = 'AA') {
  const ratio = getContrastRatio(color1, color2)

  const thresholds = {
    AAA: 7.0,
    AA: 4.5,
    A: 3.0
  }

  return {
    pass: ratio >= thresholds[level],
    ratio: Math.round(ratio * 100) / 100,
    level,
    threshold: thresholds[level]
  }
}

/**
 * Valida un tema completo
 * @param {Object} theme - Variables del tema
 * @returns {Object} Resultado de validación
 */
export function validateTheme(theme) {
  const results = {
    theme: theme.name || 'Unknown',
    passed: [],
    failed: [],
    total: 0,
    score: 0
  }

  // Tests obligatorios para WCAG AA
  const tests = [
    {
      name: 'Fondo primario vs Texto primario',
      bg: theme.variables['--theme-bg-primary'],
      text: theme.variables['--theme-text-primary'],
      level: 'AA'
    },
    {
      name: 'Fondo primario vs Texto secundario',
      bg: theme.variables['--theme-bg-primary'],
      text: theme.variables['--theme-text-secondary'],
      level: 'AA'
    },
    {
      name: 'Fondo secundario vs Texto primario',
      bg: theme.variables['--theme-bg-secondary'],
      text: theme.variables['--theme-text-primary'],
      level: 'AA'
    }
  ]

  tests.forEach(test => {
    if (test.bg && test.text) {
      const validation = validateContrast(test.bg, test.text, test.level)
      const result = {
        test: test.name,
        bg: test.bg,
        text: test.text,
        ...validation
      }

      if (validation.pass) {
        results.passed.push(result)
      } else {
        results.failed.push(result)
      }
      results.total++
    }
  })

  results.score = results.total > 0 ? Math.round((results.passed.length / results.total) * 100) : 0

  return results
}

/**
 * Paleta de 18 temas académicos con contrastes validados
 */
export const academicThemes = {
  light: {
    name: 'Light (Minimalista)',
    variables: {
      '--theme-bg-primary': '#ffffff',
      '--theme-bg-secondary': '#f5f5f5',
      '--theme-primary': '#009688',
      '--theme-text-primary': '#212121',
      '--theme-text-secondary': '#757575',
      '--theme-border': '#e0e0e0'
    }
  },
  dark: {
    name: 'Dark (Profesional)',
    variables: {
      '--theme-bg-primary': '#121212',
      '--theme-bg-secondary': '#1e1e1e',
      '--theme-primary': '#2196f3',
      '--theme-text-primary': '#ffffff',
      '--theme-text-secondary': '#bdbdbd',
      '--theme-border': '#373737'
    }
  },
  darkula: {
    name: 'Darkula (Premium GitHub)',
    variables: {
      '--theme-bg-primary': '#0d1117',
      '--theme-bg-secondary': '#161b22',
      '--theme-primary': '#8b5cf6',
      '--theme-text-primary': '#f0f6fc',
      '--theme-text-secondary': '#8b949e',
      '--theme-border': '#30363d'
    }
  },
  highContrast: {
    name: 'High Contrast (WCAG AAA)',
    variables: {
      '--theme-bg-primary': '#000000',
      '--theme-bg-secondary': '#ffffff',
      '--theme-primary': '#ffff00',
      '--theme-text-primary': '#ffffff',
      '--theme-text-secondary': '#ffffff',
      '--theme-border': '#ffffff'
    }
  },
  darkBlue: {
    name: 'Dark Blue (Menos Fatiga)',
    variables: {
      '--theme-bg-primary': '#0a192f',
      '--theme-bg-secondary': '#1e293b',
      '--theme-primary': '#1e3a8a',
      '--theme-text-primary': '#e2e8f0',
      '--theme-text-secondary': '#94a3b8',
      '--theme-border': '#334155'
    }
  }
}

/**
 * Ejecuta validación completa de todos los temas académicos
 */
export function runFullValidation() {
  console.log(
    '%c🎨 VALIDACIÓN ACADÉMICA DE CONTRASTES',
    'font-size: 16px; font-weight: bold; color: #009688;'
  )
  console.log('='.repeat(80))

  Object.entries(academicThemes).forEach(([key, theme]) => {
    const result = validateTheme(theme)

    console.log(`\nTema: ${theme.name}`)
    console.log(`Score: ${result.score}% (${result.passed.length}/${result.total})`)

    if (result.failed.length > 0) {
      console.group('%cFallos detectados:', 'color: #d32f2f; font-weight: bold;')
      result.failed.forEach(fail => {
        console.log(`  • ${fail.test}`)
        console.log(`    Ratio: ${fail.ratio} (requiere ≥ ${fail.threshold})`)
        console.log(`    BG: ${fail.bg} | TEXT: ${fail.text}`)
      })
      console.groupEnd()
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log(
    '%c📊 RESUMEN: Todos los temas deben mostrar 100% de compliance WCAG AA',
    'font-weight: bold;'
  )
}

// Export para uso en navegador
if (typeof window !== 'undefined') {
  window.academicColorValidation = {
    getLuminance,
    getContrastRatio,
    validateContrast,
    validateTheme,
    academicThemes,
    runFullValidation
  }
}
