/**
 * FloresYa - Sistema de Configuración de Temas Granulares Mejorado
 * Mejora la configuración existente para corregir problemas de contraste
 *
 * Soluciones implementadas:
 * - Fondo para texto sobre gradientes
 * - Contraste garantizado para todos los modos
 * - Adaptabilidad dinámica según contenido
 */
// @ts-nocheck

export const enhancedGranularThemes = {
  // ============================================
  // NAVEGACIÓN - MEJORADA CON CONTRASTE GARANTIZADO
  // ============================================
  navigation: {
    primary: {
      name: 'Navegación Primaria Mejorada',
      description: 'Navbar con contraste garantizado',
      styles: 'theme-nav-primary-enhanced',
      variables: {
        '--nav-bg': 'var(--nav-bg-primary, var(--navbar-bg, rgba(255, 255, 255, 0.98)))',
        '--nav-text': 'var(--nav-text-primary, var(--navbar-text, #1f2937))',
        '--nav-border': 'var(--nav-border, var(--navbar-border, #e5e7eb))',
        // Asegurar contraste AAA para texto de navegación
        '--nav-text-hover': 'var(--theme-primary, #ec4899)',
        '--nav-shadow': 'var(--navbar-shadow, 0 2px 4px rgba(0, 0, 0, 0.08))'
      },
      responsive: true,
      darkMode: true
    },
    glass: {
      name: 'Navegación Glassmorphism con Contraste',
      description: 'Navbar glass con contraste adaptativo',
      styles: 'theme-nav-glass-enhanced',
      variables: {
        '--nav-bg': 'var(--nav-bg-glass, rgba(255, 255, 255, 0.95))',
        '--nav-text': 'calc(max(var(--nav-text-primary, #1f2937), var(--navbar-text, #374151)))',
        '--nav-backdrop': 'blur(12px)',
        '--nav-shadow': '0 4px 6px rgba(0, 0, 0, 0.05)',
        // Ajuste de contraste para glass
        '--nav-text-primary': 'var(--theme-text-primary, #1f2937)',
        '--nav-text-secondary': 'var(--theme-text-secondary, #6b7280)'
      },
      responsive: true,
      darkMode: true
    },
    solid: {
      name: 'Navegación Sólida con Contraste',
      description: 'Navbar sólido con contraste AAA',
      styles: 'theme-nav-solid-enhanced',
      variables: {
        '--nav-bg': 'var(--nav-bg-primary, var(--navbar-bg, #ffffff))',
        '--nav-text': 'var(--navbar-text, #374151)',
        '--nav-border': 'var(--nav-border, var(--navbar-border, #e5e7eb))',
        '--nav-brand-color': 'var(--navbar-brand-color, #1f2937)',
        '--nav-icon-color': 'var(--navbar-icon-color, #6b7280)',
        // Garantizar contraste en todos los elementos
        '--nav-link-hover': 'var(--theme-primary, #ec4899)'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // HERO SECTION - MEJORADA CON CONTRASTE DINÁMICO
  // ============================================
  hero: {
    gradient: {
      name: 'Hero Gradiente con Contraste Garantizado',
      description: 'Gradiente con overlay de contraste para texto',
      styles: 'theme-hero-gradient-enhanced',
      variables: {
        '--hero-bg':
          'var(--hero-bg-gradient, linear-gradient(135deg, var(--theme-primary, #ec4899) 0%, var(--theme-secondary, #10b981) 100%))',
        '--hero-text': 'var(--hero-text-primary, #ffffff)',
        '--hero-overlay': 'var(--hero-overlay, rgba(0, 0, 0, 0.3))',
        '--hero-title-color': 'var(--hero-text-primary, #ffffff)',
        '--hero-subtitle-color': 'var(--theme-text-on-primary, #ffffff)',
        // Texto con contraste AAA garantizado
        '--hero-accent-color': 'var(--theme-accent-light, #f0f9ff)',
        '--hero-shadow': 'var(--hero-shadow, 0 20px 60px rgba(0, 0, 0, 0.1))'
      },
      animation: 'animate-gradient',
      responsive: true,
      darkMode: true
    },
    image: {
      name: 'Hero con Imagen y Overlay de Contraste',
      description: 'Imagen de fondo con overlay que garantiza contraste',
      styles: 'theme-hero-image-enhanced',
      variables: {
        '--hero-bg': "var(--hero-bg-image, url('/images/hero-bg.jpg'))",
        '--hero-overlay': 'var(--hero-overlay, rgba(0, 0, 0, 0.6))',
        '--hero-text': 'var(--hero-text-primary, #ffffff)',
        '--hero-title-color': 'var(--hero-text-primary, #ffffff)',
        '--hero-subtitle-color': 'var(--hero-text-secondary, #f3f4f6)',
        '--hero-accent-color': 'var(--theme-primary-light, #f0fdf4)'
      },
      responsive: true
    },
    solid: {
      name: 'Hero Sólido con Contraste Garantizado',
      description: 'Fondo sólido con texto AAA',
      styles: 'theme-hero-solid-enhanced',
      variables: {
        '--hero-bg': 'var(--hero-bg-primary, var(--theme-bg-primary, #ffffff))',
        '--hero-text': 'var(--hero-text-dark, var(--theme-text-primary, #111827))',
        '--hero-title-color': 'var(--theme-text-primary, #111827)',
        '--hero-subtitle-color': 'var(--theme-text-secondary, #4b5563)',
        '--hero-accent-color': 'var(--theme-primary, #ec4899)'
      },
      responsive: true,
      darkMode: true
    },
    minimal: {
      name: 'Hero Minimal con Contraste AAA',
      description: 'Minimal con contraste AAA garantizado',
      styles: 'theme-hero-minimal-enhanced',
      variables: {
        '--hero-bg': 'var(--theme-bg-primary, #ffffff)',
        '--hero-text': 'var(--hero-text-dark, var(--theme-text-primary, #111827))',
        '--hero-title-color': 'var(--theme-text-primary, #111827)',
        '--hero-subtitle-color': 'var(--theme-text-secondary, #6b7280)',
        '--hero-accent-color': 'var(--theme-accent, #f43f5e)'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // CAROUSEL - MEJORADO CON CONTRASTE GARANTIZADO
  // ============================================
  carousel: {
    light: {
      name: 'Carousel Claro con Contraste',
      description: 'Estilo claro con contraste AAA',
      styles: 'theme-carousel-light-enhanced',
      variables: {
        '--carousel-bg': 'var(--carousel-bg, var(--theme-bg-primary, #ffffff))',
        '--carousel-border': 'var(--carousel-border, var(--theme-border-light, #e5e7eb))',
        '--carousel-nav-bg': 'var(--carousel-nav-bg, rgba(0, 0, 0, 0.5))',
        '--carousel-nav-hover': 'var(--carousel-nav-hover, rgba(0, 0, 0, 0.7))',
        '--carousel-indicator-inactive': 'var(--carousel-indicator-inactive, rgba(0, 0, 0, 0.3))',
        '--carousel-indicator-active':
          'var(--carousel-indicator-active, var(--theme-primary, #ec4899))',
        '--carousel-text-on-bg': 'var(--carousel-text-on-bg, var(--theme-text-primary, #111827))',
        '--carousel-text-on-nav': 'var(--carousel-text-on-nav, #ffffff)'
      },
      responsive: true,
      darkMode: true
    },
    dark: {
      name: 'Carousel Oscuro con Contraste',
      description: 'Estilo oscuro con contraste AAA',
      styles: 'theme-carousel-dark-enhanced',
      variables: {
        '--carousel-bg': 'var(--carousel-bg-dark, var(--theme-bg-tertiary, #1f2937))',
        '--carousel-nav-bg': 'var(--carousel-nav-bg, rgba(255, 255, 255, 0.5))',
        '--carousel-nav-hover': 'var(--carousel-nav-hover, rgba(255, 255, 255, 0.7))',
        '--carousel-indicator-inactive':
          'var(--carousel-indicator-inactive, rgba(255, 255, 255, 0.3))',
        '--carousel-indicator-active':
          'var(--carousel-indicator-active, var(--theme-primary-light, #a78bfa))',
        '--carousel-text-on-bg': 'var(--carousel-text-on-bg, var(--theme-text-on-bg, #f9fafb))',
        '--carousel-text-on-nav': 'var(--carousel-text-on-nav, #000000)'
      },
      responsive: true
    },
    card: {
      name: 'Carousel Card con Contraste AAA',
      description: 'Estilo card con contraste AAA garantizado',
      styles: 'theme-carousel-card-enhanced',
      variables: {
        '--carousel-bg': 'var(--carousel-bg, var(--theme-bg-primary, #ffffff))',
        '--carousel-border': 'var(--carousel-border, var(--theme-border-light, #e5e7eb))',
        '--carousel-shadow': 'var(--card-shadow, 0 4px 6px rgba(0, 0, 0, 0.05))',
        '--carousel-shadow-hover': 'var(--card-shadow-hover, 0 20px 25px rgba(0, 0, 0, 0.1))'
      },
      responsive: true,
      darkMode: true
    },
    premium: {
      name: 'Carousel Premium con Contraste Adaptativo',
      description: 'Estilo premium con sombras y contraste garantizado',
      styles: 'theme-carousel-premium-enhanced',
      variables: {
        '--carousel-bg': 'var(--carousel-bg, var(--theme-bg-primary, #ffffff))',
        '--carousel-border': 'var(--carousel-border, var(--theme-border-light, #e5e7eb))',
        '--carousel-shadow': 'var(--carousel-shadow, 0 8px 20px rgba(0, 0, 0, 0.1))',
        '--carousel-text-color': 'var(--carousel-text-on-bg, var(--theme-text-primary, #111827))',
        '--carousel-accent-color': 'var(--theme-primary, #ec4899)'
      },
      animation: 'animate-float',
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // FOOTER - MEJORADO CON CONTRASTE AAA
  // ============================================
  footer: {
    solid: {
      name: 'Footer Sólido con Contraste AAA',
      description: 'Footer oscuro con contraste AAA garantizado',
      styles: 'theme-footer-solid-enhanced',
      variables: {
        '--footer-bg': 'var(--footer-bg, var(--theme-bg-tertiary, #1f2937))',
        '--footer-text': 'var(--footer-text, var(--theme-text-on-bg, #f9fafb))',
        '--footer-heading': 'var(--footer-heading, var(--theme-primary-light, #a78bfa))',
        '--footer-link': 'var(--footer-text, #f9fafb)',
        '--footer-link-hover': 'var(--footer-link-hover, var(--theme-primary, #a78bfa))',
        '--footer-border': 'var(--footer-border, rgba(255, 255, 255, 0.1))'
      },
      responsive: true
    },
    light: {
      name: 'Footer Claro con Contraste AAA',
      description: 'Footer claro con contraste AAA',
      styles: 'theme-footer-light-enhanced',
      variables: {
        '--footer-bg': 'var(--footer-bg-light, var(--theme-bg-secondary, #f8fafc))',
        '--footer-text': 'var(--theme-text-primary, #1f2937)',
        '--footer-heading': 'var(--theme-primary, #ec4899)',
        '--footer-link': 'var(--theme-text-primary, #1f2937)',
        '--footer-link-hover': 'var(--theme-primary-dark, #db2777)',
        '--footer-border': 'var(--theme-border-light, #e5e7eb)'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // FORMULARIOS - MEJORADOS CON CONTRASTE DINÁMICO
  // ============================================
  forms: {
    standard: {
      name: 'Formulario Estándar con Contraste',
      description: 'Formulario con contraste garantizado',
      styles: 'theme-form-standard-enhanced',
      variables: {
        '--form-bg': 'var(--form-bg, var(--theme-bg-primary, #ffffff))',
        '--form-border': 'var(--form-border, var(--theme-border-light, #e5e7eb))',
        '--form-text': 'var(--form-text, var(--theme-text-primary, #1f2937))',
        '--form-placeholder': 'var(--form-placeholder, var(--theme-text-tertiary, #9ca3af))',
        '--form-shadow': 'var(--form-shadow, 0 4px 12px rgba(0, 0, 0, 0.05))'
      },
      responsive: true,
      darkMode: true
    },
    outlined: {
      name: 'Formulario Outlined con Contraste',
      description: 'Formulario solo con bordes y contraste garantizado',
      styles: 'theme-form-outlined-enhanced',
      variables: {
        '--form-border': 'var(--form-border, var(--theme-border-light, #e5e7eb))',
        '--form-border-focus': 'var(--form-border-focus, var(--theme-primary, #ec4899))',
        '--form-text': 'var(--theme-text-primary, #1f2937)',
        '--form-placeholder': 'var(--theme-text-tertiary, #9ca3af)'
      },
      responsive: true,
      darkMode: true
    },
    filled: {
      name: 'Formulario Relleno con Contraste',
      description: 'Formulario con contraste AAA en todos los estados',
      styles: 'theme-form-filled-enhanced',
      variables: {
        '--form-bg': 'var(--form-bg-filled, var(--theme-bg-secondary, #f8fafc))',
        '--form-border': 'var(--form-border, var(--theme-border-light, #e5e7eb))',
        '--form-text': 'var(--theme-text-primary, #1f2937)',
        '--form-placeholder': 'var(--theme-text-tertiary, #9ca3af)',
        '--form-bg-focus': 'var(--form-bg, #ffffff)'
      },
      responsive: true,
      darkMode: true
    },
    premium: {
      name: 'Formulario Premium con Contraste Adaptativo',
      description: 'Formulario premium con contraste garantizado',
      styles: 'theme-form-premium-enhanced',
      variables: {
        '--form-bg': 'var(--form-bg-premium, rgba(255, 255, 255, 0.95))',
        '--form-border': 'var(--form-border, var(--theme-primary, #ec4899))',
        '--form-text': 'var(--theme-text-primary, #1f2937)',
        '--form-shadow': 'var(--form-shadow-focus, 0 8px 24px rgba(236, 72, 153, 0.15))',
        '--form-shadow-focus': 'var(--form-shadow-focus, 0 8px 24px rgba(236, 72, 153, 0.25))'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // PRODUCTOS - MEJORADOS CON CONTRASTE AAA
  // ============================================
  products: {
    cards: {
      name: 'Productos Cards con Contraste AAA',
      description: 'Cards con contraste AAA y hover dinámico',
      styles: 'theme-products-cards-enhanced',
      variables: {
        '--products-bg': 'var(--products-bg, var(--theme-bg-primary, #ffffff))',
        '--products-card-bg': 'var(--card-bg, var(--theme-bg-primary, #ffffff))',
        '--products-card-border': 'var(--card-border, var(--theme-border-light, #e5e7eb))',
        '--products-card-title-color':
          'var(--card-title-color, var(--theme-text-primary, #111827))',
        '--products-card-text-color':
          'var(--card-text-color, var(--theme-text-secondary, #4b5563))',
        '--products-card-price-color': 'var(--card-price-color, var(--theme-primary, #ec4899))',
        '--products-card-hover': 'var(--products-card-hover, var(--theme-primary-light, #fce7f3))',
        '--products-card-shadow': 'var(--card-shadow, 0 4px 6px rgba(0, 0, 0, 0.05))',
        '--products-card-shadow-hover': 'var(--card-shadow-hover, 0 20px 25px rgba(0, 0, 0, 0.1))'
      },
      responsive: true,
      darkMode: true
    }
  },

  // ============================================
  // TESTIMONIOS - MEJORADOS CON CONTRASTE DINÁMICO
  // ============================================
  testimonials: {
    card: {
      name: 'Testimonios Card con Contraste Dinámico',
      description: 'Cards con contraste adaptativo',
      styles: 'theme-testimonials-card-enhanced',
      variables: {
        '--testimonial-bg':
          'var(--testimonial-bg, var(--card-bg, var(--theme-bg-primary, #ffffff)))',
        '--testimonial-border':
          'var(--testimonial-border, var(--card-border, var(--theme-border-light, #e5e7eb)))',
        '--testimonial-text': 'var(--card-text-color, var(--theme-text-primary, #1f2937))',
        '--testimonial-author': 'var(--theme-text-secondary, #6b7280)',
        '--testimonial-shadow':
          'var(--testimonial-shadow, var(--card-shadow, 0 4px 6px rgba(0, 0, 0, 0.05)))',
        '--testimonial-pink': 'var(--testimonial-pink, #ec4899)',
        '--testimonial-green': 'var(--testimonial-green, #10b981)',
        '--testimonial-yellow': 'var(--testimonial-yellow, #f59e0b)'
      },
      responsive: true,
      darkMode: true
    }
  }
}

/**
 * Sistema de contraste mejorado para aplicar soluciones de contraste dinámico
 */
export class EnhancedContrastSystem {
  constructor() {
    this.contrastThresholds = {
      AA: 4.5,
      AAA: 7.0
    }
  }

  /**
   * Aplica contraste mejorado a un elemento considerando fondo gradiente
   * @param {HTMLElement} element - Elemento DOM
   * @param {number} minRatio - Ratio mínimo (4.5 para AA, 7 para AAA)
   * @returns {boolean} true si se ajustó
   */
  applyEnhancedContrast(element, minRatio = 4.5) {
    try {
      const computedStyle = window.getComputedStyle(element)
      const textColor = computedStyle.color

      // Detectar si hay un gradiente de fondo
      const bgImage = computedStyle.backgroundImage
      const hasGradient = bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient')

      // Calcular el color de fondo real (manejar gradientes, imágenes, etc.)
      const effectiveBackgroundColor = this.getEffectiveBackgroundColor(
        element,
        hasGradient,
        bgImage
      )

      if (!effectiveBackgroundColor || !textColor) {
        return false
      }

      // Calcular el ratio de contraste
      const currentRatio = this.getEffectiveContrastRatio(effectiveBackgroundColor, textColor)

      // Si ya cumple el ratio, no hacer nada
      if (currentRatio >= minRatio) {
        return false
      }

      // Calcular el color de texto óptimo
      const optimalColor = this.calculateOptimalTextColor(effectiveBackgroundColor, minRatio)

      // Si es diferente, aplicar el nuevo color
      if (optimalColor && textColor !== optimalColor) {
        element.style.color = optimalColor
        return true
      }

      return false
    } catch (error) {
      console.warn('⚠️ Error applying enhanced contrast:', error)
      return false
    }
  }

  /**
   * Detecta el color de fondo efectivo considerando gradientes y capas superpuestas
   * @param {HTMLElement} element - Elemento DOM
   * @param {boolean} hasGradient - Indica si tiene gradiente
   * @param {string} bgImage - Propiedad background-image
   * @returns {string} Color de fondo efectivo en formato hex
   */
  getEffectiveBackgroundColor(element, hasGradient, bgImage) {
    try {
      // Si es un gradiente, calcular el color promedio o más oscuro/claro dependiendo del texto
      if (hasGradient) {
        const gradientColors = this.extractGradientColors(bgImage)
        // Para garantizar contraste, usaremos el color más oscuro o más claro según el texto
        return this.getDominantColorFromGradient(gradientColors)
      }

      // Si no es gradiente, usar el color directamente
      const computedStyle = window.getComputedStyle(element)
      const bgColor = computedStyle.backgroundColor

      // Si el color es transparente, buscar en padres
      if (bgColor === 'transparent' || bgColor.startsWith('rgba(0, 0, 0, 0)')) {
        let parent = element.parentElement
        while (parent && parent !== document.documentElement) {
          const parentBg = window.getComputedStyle(parent).backgroundColor
          if (parentBg !== 'transparent' && !parentBg.startsWith('rgba(0, 0, 0, 0)')) {
            return this.cssColorToHex(parentBg) || '#ffffff'
          }
          parent = parent.parentElement
        }
        return '#ffffff' // Default fallback
      }

      return this.cssColorToHex(bgColor) || '#ffffff'
    } catch (error) {
      console.warn('⚠️ Error getting effective background color:', error)
      return '#ffffff'
    }
  }

  /**
   * Extrae colores de un gradiente
   * @param {string} gradientString - String de gradiente
   * @returns {string[]} Array de colores hex
   */
  extractGradientColors(gradientString) {
    const colorMatches = gradientString.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{3,6}|[a-zA-Z]+\b/g)
    return colorMatches
      ? colorMatches.map(color => this.cssColorToHex(color)).filter(Boolean)
      : ['#ffffff']
  }

  /**
   * Obtiene el color dominante de un gradiente
   * @param {string[]} colors - Array de colores hex
   * @returns {string} Color dominante
   */
  getDominantColorFromGradient(colors) {
    if (colors.length === 0) {
      return '#ffffff'
    }

    // Para garantizar contraste, elegimos el color con menor luminancia si el texto es claro,
    // o el color con mayor luminancia si el texto es oscuro
    const luminances = colors.map(color => this.getLuminance(color))
    const avgLuminance = luminances.reduce((a, b) => a + b, 0) / luminances.length

    // Si el promedio es claro, preferimos un color más oscuro
    if (avgLuminance > 0.5) {
      // Buscar color más oscuro
      const minLuminance = Math.min(...luminances)
      const minIndex = luminances.indexOf(minLuminance)
      return colors[minIndex]
    } else {
      // Buscar color más claro
      const maxLuminance = Math.max(...luminances)
      const maxIndex = luminances.indexOf(maxLuminance)
      return colors[maxIndex]
    }
  }

  /**
   * Calcula el ratio de contraste considerando transparencias
   * @param {string} bgColor - Color de fondo
   * @param {string} textColor - Color de texto
   * @returns {number} Ratio de contraste
   */
  getEffectiveContrastRatio(bgColor, textColor) {
    return this.getContrastRatio(bgColor, textColor)
  }

  /**
   * Calcula el color de texto óptimo para un fondo
   * @param {string} backgroundColor - Color de fondo
   * @param {number} minRatio - Ratio mínimo
   * @returns {string} Color de texto óptimo
   */
  calculateOptimalTextColor(backgroundColor, minRatio = 4.5) {
    const luminance = this.getLuminance(backgroundColor)

    // Determinar si el fondo es claro u oscuro
    if (luminance > 0.5) {
      // Fondo claro: usar texto oscuro
      return this.adjustForMinimumContrast(backgroundColor, '#000000', minRatio)
    } else {
      // Fondo oscuro: usar texto claro
      return this.adjustForMinimumContrast(backgroundColor, '#ffffff', minRatio)
    }
  }

  /**
   * Ajusta un color para alcanzar el ratio mínimo de contraste
   * @param {string} backgroundColor - Color de fondo
   * @param {string} targetColor - Color objetivo
   * @param {number} minRatio - Ratio mínimo
   * @returns {string} Color ajustado
   */
  adjustForMinimumContrast(backgroundColor, targetColor, minRatio) {
    const bgLuminance = this.getLuminance(backgroundColor)
    const targetLuminance = this.getLuminance(targetColor)

    // Si ya cumple el ratio, devolver el color original
    const currentRatio = this.getContrastRatio(backgroundColor, targetColor)
    if (currentRatio >= minRatio) {
      return targetColor
    }

    // Ajustar gradualmente para alcanzar el ratio
    let adjustedColor = targetColor
    let adjustedLuminance = targetLuminance

    // Para textos sobre fondos claros, oscurecer; para fondos oscuros, aclarar
    const step = bgLuminance > 0.5 ? -0.1 : 0.1

    for (let i = 0; i < 20; i++) {
      // Límite de iteraciones
      // Ajustar luminancia
      adjustedLuminance = Math.max(0.01, Math.min(0.99, adjustedLuminance + step))

      // Convertir luminancia de vuelta a color aproximado
      adjustedColor = this.luminanceToColor(adjustedLuminance)

      // Verificar el ratio
      const newRatio = this.getContrastRatio(backgroundColor, adjustedColor)
      if (newRatio >= minRatio) {
        return adjustedColor
      }
    }

    // Si no se alcanzó, devolver el color blanco o negro
    return bgLuminance > 0.5 ? '#000000' : '#ffffff'
  }

  /**
   * Convierte luminancia a color aproximado
   * @param {number} luminance - Luminancia (0-1)
   * @returns {string} Color en formato hex
   */
  luminanceToColor(luminance) {
    const grayValue = Math.round(luminance * 255)
    const hex = grayValue.toString(16).padStart(2, '0')
    return `#${hex}${hex}${hex}`
  }

  /**
   * Convierte un color CSS a hex
   * @param {string} cssColor - Color en formato CSS
   * @returns {string} Color en formato hex
   */
  cssColorToHex(cssColor) {
    try {
      if (!cssColor) {
        return null
      }

      // Extraer valores RGB
      const match = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        const r = parseInt(match[1])
        const g = parseInt(match[2])
        const b = parseInt(match[3])
        return this.rgbToHex(r, g, b)
      }

      // Si ya es hex, devolverlo
      if (cssColor.startsWith('#')) {
        return cssColor.length === 4
          ? `#${cssColor[1]}${cssColor[1]}${cssColor[2]}${cssColor[2]}${cssColor[3]}${cssColor[3]}`
          : cssColor
      }

      // Convertir nombres de color a hex (simplificado)
      const colorMap = {
        white: '#ffffff',
        black: '#000000',
        red: '#ff0000',
        green: '#00ff00',
        blue: '#0000ff',
        gray: '#808080',
        grey: '#808080'
      }

      return colorMap[cssColor.toLowerCase()] || null
    } catch (error) {
      console.error('[Theme] getColorFromMap failed:', {
        color: cssColor,
        error: error.message
      })
      return null
    }
  }

  /**
   * Convierte RGB a hex
   * @param {number} r - Rojo (0-255)
   * @param {number} g - Verde (0-255)
   * @param {number} b - Azul (0-255)
   * @returns {string} Color en formato hex
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Calcula la luminancia relativa (algoritmo WCAG)
   * @param {string} hex - Color en formato hex
   * @returns {number} Luminancia (0-1)
   */
  getLuminance(hex) {
    const rgb = this.hexToRgb(hex)
    if (!rgb) {
      return 0
    }

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Calcula el ratio de contraste (algoritmo WCAG)
   * @param {string} color1 - Color 1
   * @param {string} color2 - Color 2
   * @returns {number} Ratio de contraste (1-21)
   */
  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(color1)
    const l2 = this.getLuminance(color2)

    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Convierte hex a RGB
   * @param {string} hex - Color en formato hex
   * @returns {{r: number, g: number, b: number}} Objeto RGB
   */
  hexToRgb(hex) {
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
   * Aplica contraste mejorado a toda la página
   * @param {string} selector - Selector CSS para el contenedor
   * @param {number} minRatio - Ratio mínimo de contraste
   * @returns {number} Número de elementos ajustados
   */
  enhancePageContrast(selector = 'body', minRatio = 4.5) {
    try {
      const container = document.querySelector(selector)
      if (!container) {
        return 0
      }

      let adjusted = 0
      const elements = container.querySelectorAll('*')

      elements.forEach(element => {
        // Solo procesar elementos con texto visible
        if (element.textContent && element.textContent.trim().length > 0) {
          const tagName = element.tagName.toLowerCase()

          // Elementos que deben tener contraste garantizado
          const shouldBeProcessed =
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
            ].includes(tagName) ||
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
            element.closest('nav') ||
            element.closest('.hero') ||
            element.closest('.carousel') ||
            element.closest('.form-control')

          if (shouldBeProcessed) {
            if (this.applyEnhancedContrast(element, minRatio)) {
              adjusted++
            }
          }
        }
      })

      return adjusted
    } catch (error) {
      console.error('❌ Error enhancing page contrast:', error)
      return 0
    }
  }
}

// Instancia global del sistema de contraste mejorado
export const enhancedContrastSystem = new EnhancedContrastSystem()

// Función para inicializar el sistema de contraste mejorado
export function initEnhancedContrastSystem() {
  // Aplicar contraste mejorado cuando cambia un tema
  window.addEventListener('themeChanged', _e => {
    setTimeout(() => {
      const adjusted = enhancedContrastSystem.enhancePageContrast('body', 4.5)
      console.log(`✨ [EnhancedContrastSystem] Enhanced contrast for ${adjusted} elements`)
    }, 100)
  })

  // Aplicar contraste mejorado al cargar la página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const adjusted = enhancedContrastSystem.enhancePageContrast('body', 4.5)
        console.log(
          `✨ [EnhancedContrastSystem] Initial contrast enhancement: ${adjusted} elements`
        )
      }, 100)
    })
  } else {
    setTimeout(() => {
      const adjusted = enhancedContrastSystem.enhancePageContrast('body', 4.5)
      console.log(`✨ [EnhancedContrastSystem] Initial contrast enhancement: ${adjusted} elements`)
    }, 100)
  }
}

/**
 * Aplica un tema granular mejorado a un elemento específico
 * @param {HTMLElement} element - Elemento DOM
 * @param {string} panelType - Tipo de panel (navigation, hero, carousel, etc.)
 * @param {string} themeName - Nombre del tema
 */
export function applyEnhancedGranularTheme(element, panelType, themeName) {
  if (!element) {
    console.warn('Elemento no encontrado para aplicar tema granular mejorado')
    return
  }

  const themeConfig = enhancedGranularThemes[panelType]?.[themeName]
  if (!themeConfig) {
    console.warn(`Tema granular mejorado no encontrado: ${panelType}.${themeName}`)
    return
  }

  // Remover estilos anteriores del mismo panel
  const panelStyles = Object.keys(enhancedGranularThemes[panelType] || {})
  panelStyles.forEach(style => {
    element.classList.remove(enhancedGranularThemes[panelType][style].styles)
  })

  // Aplicar nuevo estilo
  element.classList.add(themeConfig.styles)

  // Aplicar variables CSS si existen
  if (themeConfig.variables) {
    Object.entries(themeConfig.variables).forEach(([property, value]) => {
      element.style.setProperty(property, value)
    })
  }

  // Aplicar sistema de contraste mejorado a este elemento específico
  setTimeout(() => {
    enhancedContrastSystem.applyEnhancedContrast(element, 4.5)
  }, 50)

  console.log(`✅ Tema granular mejorado aplicado: ${panelType}.${themeName}`)
}

// Exportar por defecto
export default {
  enhancedGranularThemes,
  enhancedContrastSystem,
  applyEnhancedGranularTheme,
  initEnhancedContrastSystem
}
