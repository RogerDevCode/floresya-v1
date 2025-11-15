/**
 * FloresYa - Advanced Theme Manager
 * Gestor mejorado de temas con aplicación automática de contraste
 * Siguiendo principios CLAUDE.md: KISS, fail-fast, try-catch con console.error + throw
 */

import {
  themes,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  expandThemeWithGranularVars
} from './themeDefinitions.js'
import { enhancePageContrastWithFixes } from './enhancedContrastSystem.js'

// Use the enhanced contrast function
const enhancePageContrast = enhancePageContrastWithFixes

/**
 * Advanced Theme Manager Class
 * Mejora el ThemeManager estándar con aplicación automática de contraste
 */
export class AdvancedThemeManager {
  constructor() {
    this.currentTheme = null
    this.themeHistory = []
    this.maxHistorySize = 10
    this.styleElement = null
  }

  /**
   * Inicializa el gestor avanzado de temas
   */
  init() {
    // Increment global initialization counter
    if (typeof window !== 'undefined') {
      window.themeSystemInitCount = (window.themeSystemInitCount || 0) + 1
    }

    console.log(`🎨 [AdvancedThemeManager] Initializing... (init #${window.themeSystemInitCount})`)

    try {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init())
        return
      }

      // Crear elemento <style> para CSS inline
      this.createStyleElement()

      // Obtener tema guardado
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      this.currentTheme = savedTheme && themes[savedTheme] ? savedTheme : DEFAULT_THEME

      // Aplicar tema inicial
      this.applyTheme(this.currentTheme, false)

      console.log('✅ [AdvancedThemeManager] Initialized with theme:', this.currentTheme)
    } catch (error) {
      console.error('❌ [AdvancedThemeManager] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Crea el elemento <style> para CSS inline
   */
  createStyleElement() {
    try {
      this.styleElement = document.createElement('style')
      this.styleElement.id = 'theme-dynamic-styles'
      document.head.appendChild(this.styleElement)
      console.log('✅ [AdvancedThemeManager] Style element created')
    } catch (error) {
      console.error('❌ [AdvancedThemeManager] Failed to create style element:', error)
      throw error
    }
  }

  /**
   * Aplica un tema específico con mejoras de contraste
   * @param {string} themeId - ID del tema
   * @param {boolean} save - Si debe guardarse
   * @returns {boolean} Éxito o fallo
   */
  applyTheme(themeId, save = true) {
    const theme = themes[themeId]

    if (!theme) {
      console.error('❌ [AdvancedThemeManager] Theme not found:', themeId)
      return false
    }

    try {
      console.log('🎨 [AdvancedThemeManager] Applying theme:', theme.name)

      // 1. Expandir el tema con variables granulares
      const expandedTheme = expandThemeWithGranularVars(theme)

      // 2. Aplicar variables CSS
      this.applyThemeVariables(expandedTheme.variables)

      // 3. Aplicar CSS inline (si hay estilos específicos del tema)
      this.applyThemeStyles(themeId)

      // 4. Actualizar atributos de tema
      document.documentElement.setAttribute('data-theme', themeId)
      document.body.setAttribute('data-theme', themeId)

      // 5. Guardar si se solicita
      if (save === true) {
        this.saveTheme(themeId)
      }

      // 6. Actualizar estado interno
      this.currentTheme = themeId
      this.addToHistory(themeId)

      // 7. Emitir evento
      window.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: {
            themeId,
            themeName: theme.name,
            themeData: expandedTheme
          }
        })
      )

      // 8. Aplicar mejora de contraste con un pequeño retraso
      setTimeout(() => {
        try {
          const adjustedCount = enhancePageContrast(5.0)
          console.log(`✨ [AdvancedThemeManager] Enhanced contrast for ${adjustedCount} elements`)
        } catch (error) {
          console.warn('⚠️ [AdvancedThemeManager] Contrast enhancement error:', error)
        }
      }, 100)

      console.log('✅ [AdvancedThemeManager] Theme applied:', theme.name)
      return true
    } catch (error) {
      console.error('❌ [AdvancedThemeManager] Failed to apply theme:', error)
      throw error
    }
  }

  /**
   * Aplica las variables CSS del tema
   * @param {Object} variables - Variables CSS
   */
  applyThemeVariables(variables) {
    try {
      const root = document.documentElement

      Object.entries(variables).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })

      console.log(
        '✅ [AdvancedThemeManager] Applied',
        Object.keys(variables).length,
        'CSS variables'
      )
    } catch (error) {
      console.error('❌ [AdvancedThemeManager] Failed to apply variables:', error)
      throw error
    }
  }

  /**
   * Aplica los estilos inline del tema
   * @param {string} themeId - ID del tema
   */
  applyThemeStyles(themeId) {
    try {
      if (!this.styleElement) {
        console.warn('⚠️ [AdvancedThemeManager] Style element not found, creating...')
        this.createStyleElement()
      }

      // Por ahora, no tenemos estilos específicos por tema
      // En el futuro, esto podría incluir estilos específicos para cada tema
      this.styleElement.textContent = ''

      console.log('✅ [AdvancedThemeManager] Applied inline styles for theme:', themeId)
    } catch (error) {
      console.error('❌ [AdvancedThemeManager] Failed to apply styles:', error)
      throw error
    }
  }

  /**
   * Guarda el tema en localStorage
   * @param {string} themeId - ID del tema
   */
  saveTheme(themeId) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
      console.log('💾 [AdvancedThemeManager] Theme saved:', themeId)
    } catch (error) {
      console.warn('⚠️ [AdvancedThemeManager] Could not save theme:', error)
    }
  }

  /**
   * Añade un tema al historial
   * @param {string} themeId - ID del tema
   */
  addToHistory(themeId) {
    // Evitar duplicados consecutivos
    if (this.themeHistory[this.themeHistory.length - 1] === themeId) {
      return
    }

    this.themeHistory.push(themeId)
    if (this.themeHistory.length > this.maxHistorySize) {
      this.themeHistory.shift()
    }
  }

  /**
   * Regresa al tema anterior
   * @returns {boolean} Éxito o fallo
   */
  goToPreviousTheme() {
    if (this.themeHistory.length < 2) {
      return false
    }

    // El tema actual está al final del historial
    void this.themeHistory.pop()
    const previousTheme = this.themeHistory[this.themeHistory.length - 1]

    return this.applyTheme(previousTheme, false)
  }

  /**
   * Obtiene el ID del tema actual
   * @returns {string} ID del tema
   */
  getCurrentTheme() {
    return this.currentTheme
  }

  /**
   * Obtiene la definición del tema actual
   * @returns {Object} Objeto del tema expandido
   */
  getCurrentThemeDefinition() {
    const theme = themes[this.currentTheme] || themes[DEFAULT_THEME]
    return expandThemeWithGranularVars(theme)
  }

  /**
   * Obtiene lista de todos los temas
   * @returns {Array} Lista de temas
   */
  getAvailableThemes() {
    return Object.values(themes).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      icon: theme.icon,
      category: theme.category
    }))
  }

  /**
   * Aplica automáticamente el contraste a toda la página
   * @param {number} minRatio - Ratio mínimo de contraste
   * @returns {number} Número de elementos ajustados
   */
  applyContrastEnhancement(minRatio = 5.0) {
    try {
      return enhancePageContrast(minRatio)
    } catch (error) {
      console.error('❌ [AdvancedThemeManager] Failed to apply contrast enhancement:', error)
      return 0
    }
  }
}

// Instancia global singleton
export const advancedThemeManager = new AdvancedThemeManager()

// Bandera para prevenir inicializaciones múltiples
let isAdvancedInitialized = false

// Función de inicialización para compatibilidad
export const initAdvancedThemeManager = () => {
  if (!isAdvancedInitialized) {
    isAdvancedInitialized = true
    advancedThemeManager.init()
  } else {
    console.log('🎨 [AdvancedThemeManager] Already initialized, skipping...')
  }
}

// Auto-inicializar si está en el navegador
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAdvancedThemeManager()
    })
  } else {
    // DOM ya está listo
    initAdvancedThemeManager()
  }
}

// Export por defecto
export default advancedThemeManager
