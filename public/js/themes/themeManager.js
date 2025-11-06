/**
 * FloresYa - Theme Manager
 * Gestor Central de Temas
 * Siguiendo CLAUDE.md: KISS, fail-fast, const, try-catch con console.error + throw
 * Siguiendo ESLint: prefer-const, curly, eqeqeq, no-var
 */

import { themes, DEFAULT_THEME, THEME_STORAGE_KEY } from './themeDefinitions.js'
import { themeStyles } from './themeStyles.js'

/**
 * Theme Manager Class - Gestor Central de Temas
 */
export class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || DEFAULT_THEME
    this.styleElement = null
  }

  /**
   * Inicializa el sistema de temas
   */
  init() {
    console.log('🎨 [ThemeManager] Initializing...')

    try {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init())
        return
      }

      // Crear elemento <style> para CSS inline
      this.createStyleElement()

      // Aplicar tema guardado
      this.applyTheme(this.currentTheme, false)

      // Escuchar cambios en otras pestañas
      window.addEventListener('storage', e => {
        if (e.key === THEME_STORAGE_KEY && e.newValue) {
          console.log('🎨 [ThemeManager] Theme changed in another tab:', e.newValue)
          this.applyTheme(e.newValue, false)
        }
      })

      console.log('✅ [ThemeManager] Initialized with theme:', this.currentTheme)
    } catch (error) {
      console.error('❌ [ThemeManager] Initialization failed:', error)
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
      console.log('✅ [ThemeManager] Style element created')
    } catch (error) {
      console.error('❌ [ThemeManager] Failed to create style element:', error)
      throw error
    }
  }

  /**
   * Obtiene el tema guardado en localStorage
   * @returns {string|null} Tema guardado o null
   */
  getStoredTheme() {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && themes[stored]) {
        return stored
      }
      return null
    } catch (error) {
      console.warn('⚠️ [ThemeManager] Could not read stored theme:', error)
      return null
    }
  }

  /**
   * Guarda el tema en localStorage
   * @param {string} themeId - ID del tema
   */
  saveTheme(themeId) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeId)
      console.log('💾 [ThemeManager] Theme saved:', themeId)
    } catch (error) {
      console.warn('⚠️ [ThemeManager] Could not save theme:', error)
    }
  }

  /**
   * Applies the tema específico
   * @param {string} themeId - ID del tema
   * @param {boolean} save - Si debe guardarse
   * @returns {boolean} Éxito o fallo
   */
  applyTheme(themeId, save = true) {
    const theme = themes[themeId]

    if (!theme) {
      console.error('❌ [ThemeManager] Theme not found:', themeId)
      return false
    }

    try {
      console.log('🎨 [ThemeManager] Applying theme:', theme.name)

      // 1. Aplicar variables CSS
      this.applyThemeVariables(theme.variables)

      // 2. Aplicar CSS inline
      this.applyThemeStyles(themeId)

      // 3. Actualizar data attribute (both html and body for maximum compatibility)
      document.documentElement.setAttribute('data-theme', themeId)
      document.body.setAttribute('data-theme', themeId)

      // 4. Guardar si se solicita
      if (save === true) {
        this.saveTheme(themeId)
      }

      // 5. Actualizar estado interno
      this.currentTheme = themeId

      // 6. Emitir evento
      window.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: {
            themeId,
            themeName: theme.name,
            themeData: theme
          }
        })
      )

      // 7. Adjust contrast for inputs after theme change
      this.adjustInputContrastIfNeeded()

      console.log('✅ [ThemeManager] Theme applied:', theme.name)
      return true
    } catch (error) {
      console.error('❌ [ThemeManager] Failed to apply theme:', error)
      throw error
    }
  }

  /**
   * Adjusts input text colors for better contrast after theme change
   */
  adjustInputContrastIfNeeded() {
    // Check if we're on a page that needs contrast adjustment
    if (window.location.pathname.includes('contact-editor')) {
      const inputs = document.querySelectorAll('.setting-input')

      inputs.forEach(inputElement => {
        // Get the computed background color after theme change
        const computedStyle = window.getComputedStyle(inputElement)
        const bgColor = computedStyle.backgroundColor

        // Parse the background color
        const bgMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)

        if (bgMatch) {
          const r = parseInt(bgMatch[1])
          const g = parseInt(bgMatch[2])
          const b = parseInt(bgMatch[3])

          // Calculate luminance using the relative luminance formula
          const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

          // Choose text color based on contrast
          const textColor = luminance > 0.5 ? '#000000' : '#ffffff'

          // Apply the text color
          inputElement.style.color = textColor

          // Also adjust placeholder text color
          inputElement.style.setProperty(
            '--placeholder-color',
            luminance > 0.5 ? '#6b7280' : '#a3a3a3'
          )
        }
      })
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

      console.log('✅ [ThemeManager] Applied', Object.keys(variables).length, 'CSS variables')
    } catch (error) {
      console.error('❌ [ThemeManager] Failed to apply variables:', error)
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
        console.warn('⚠️ [ThemeManager] Style element not found, creating...')
        this.createStyleElement()
      }

      const styles = themeStyles[themeId] || ''
      this.styleElement.textContent = styles

      console.log('✅ [ThemeManager] Applied inline styles for theme:', themeId)
    } catch (error) {
      console.error('❌ [ThemeManager] Failed to apply styles:', error)
      throw error
    }
  }

  /**
   * Cambia al siguiente tema (ciclado)
   * @returns {boolean} Éxito o fallo
   */
  cycleTheme() {
    try {
      const themeIds = Object.keys(themes)
      const currentIndex = themeIds.indexOf(this.currentTheme)
      const nextIndex = (currentIndex + 1) % themeIds.length
      const nextThemeId = themeIds[nextIndex]

      console.log('🔄 [ThemeManager] Cycling to next theme:', nextThemeId)
      return this.setTheme(nextThemeId)
    } catch (error) {
      console.error('❌ [ThemeManager] Failed to cycle theme:', error)
      throw error
    }
  }

  /**
   * Establece un tema específico
   * @param {string} themeId - ID del tema
   * @returns {boolean} Éxito o fallo
   */
  setTheme(themeId) {
    return this.applyTheme(themeId, true)
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
   * @returns {Object} Objeto del tema
   */
  getCurrentThemeDefinition() {
    return themes[this.currentTheme] || themes[DEFAULT_THEME]
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
   * Obtiene temas por categoría
   * @param {string} category - Categoría
   * @returns {Array} Temas filtrados
   */
  getThemesByCategory(category) {
    return this.getAvailableThemes().filter(theme => theme.category === category)
  }
}

// Instancia global singleton
export const themeManager = new ThemeManager()

// Función de inicialización para compatibilidad
export const initThemeManager = () => {
  themeManager.init()
}

// Export por defecto
export default themeManager
