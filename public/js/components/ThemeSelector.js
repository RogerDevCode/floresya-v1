/**
 * FloresYa - Theme Selector Component
 * Dropdown en navbar para seleccionar temas
 * Siguiendo CLAUDE.md: KISS, fail-fast, const, try-catch con console.error + throw
 * Siguiendo ESLint: prefer-const, curly, eqeqeq, no-var
 */

import { themeManager } from '../themes/themeManager.js'
import { createIcons } from '../lucide-icons.js'

/**
 * Theme Selector Component Class
 */
export class ThemeSelector {
  /**
   * Constructor
   * @param {string} containerId - ID del contenedor
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.dropdown = null
    this.toggleBtn = null
    this.isOpen = false

    if (!this.container) {
      const error = new Error(`ThemeSelector container not found: ${containerId}`)
      console.error('❌ [ThemeSelector]', error)
      throw error
    }

    this.init()
  }

  /**
   * Inicializa el componente
   */
  init() {
    console.log('🎨 [ThemeSelector] Initializing...')

    try {
      this.render()
      this.bindEvents()
      this.updateCurrentThemeDisplay()

      // Escuchar cambios de tema
      window.addEventListener('themeChanged', () => {
        console.log('🎨 [ThemeSelector] Theme changed event received')
        this.updateCurrentThemeDisplay()
      })

      console.log('✅ [ThemeSelector] Initialized')
    } catch (error) {
      console.error('❌ [ThemeSelector] Initialization failed:', error)
      throw error
    }
  }

  /**
   * Renderiza el componente
   */
  render() {
    try {
      const currentTheme = themeManager.getCurrentThemeDefinition()
      const themes = themeManager.getAvailableThemes()

      this.container.innerHTML = `
        <div class="theme-selector relative">
          <!-- Toggle Button -->
          <button
            id="theme-toggle-btn"
            class="theme-toggle-btn flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            type="button"
            aria-label="Cambiar tema"
            aria-haspopup="true"
            aria-expanded="false"
            title="Cambiar tema (actual: ${currentTheme.name})"
          >
            <span class="text-xl">${currentTheme.icon}</span>
            <i data-lucide="chevron-down" class="h-4 w-4 text-gray-600 theme-chevron"></i>
          </button>

          <!-- Dropdown Menu -->
          <div
            id="theme-dropdown"
            class="theme-dropdown absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 hidden z-50 overflow-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-toggle-btn"
          >
            <!-- Header -->
            <div class="px-4 py-3 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-gray-900">
                  Seleccionar Tema
                </h3>
                <a
                  href="/pages/theme-gallery.html"
                  class="text-xs text-pink-600 hover:text-pink-700 flex items-center gap-1 transition-colors"
                  title="Ver galería de temas"
                >
                  <i data-lucide="layout-grid" class="h-3 w-3"></i>
                  Galería
                </a>
              </div>
            </div>

            <!-- Basic Themes -->
            <div class="py-2">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Básicos
              </div>
              ${this.renderThemeGroup(themes.filter(t => t.category === 'basic'))}
            </div>

            <!-- Premium Themes -->
            <div class="py-2 border-t border-gray-200">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Premium
              </div>
              ${this.renderThemeGroup(themes.filter(t => t.category === 'premium'))}
            </div>

            <!-- Accessibility Themes -->
            <div class="py-2 border-t border-gray-200">
              <div class="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accesibilidad
              </div>
              ${this.renderThemeGroup(themes.filter(t => t.category === 'accessibility'))}
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-200 py-2">
              <button
                id="cycle-theme-btn"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                type="button"
                role="menuitem"
                title="Cambiar al siguiente tema"
              >
                <i data-lucide="refresh-ccw" class="h-4 w-4"></i>
                <span>Cambiar automáticamente</span>
              </button>
            </div>
          </div>
        </div>
      `

      // Renderizar iconos
      createIcons()

      // Guardar referencias
      this.toggleBtn = document.getElementById('theme-toggle-btn')
      this.dropdown = document.getElementById('theme-dropdown')

      console.log('✅ [ThemeSelector] Rendered')
    } catch (error) {
      console.error('❌ [ThemeSelector] Render failed:', error)
      throw error
    }
  }

  /**
   * Renderiza un grupo de temas
   * @param {Array} themes - Lista de temas
   * @returns {string} HTML del grupo
   */
  renderThemeGroup(themes) {
    return themes
      .map(
        theme => `
      <button
        class="theme-option w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between transition-colors group"
        type="button"
        role="menuitem"
        data-theme="${theme.id}"
        title="${theme.description}"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">${theme.icon}</span>
          <div>
            <div class="font-medium">${theme.name}</div>
            <div class="text-xs text-gray-500">${theme.description}</div>
          </div>
        </div>
        <i data-lucide="check" class="h-4 w-4 text-pink-600 hidden theme-check"></i>
      </button>
    `
      )
      .join('')
  }

  /**
   * Vincula los eventos
   */
  bindEvents() {
    try {
      if (!this.toggleBtn || !this.dropdown) {
        throw new Error('Toggle button or dropdown not found')
      }

      // Toggle dropdown
      this.toggleBtn.addEventListener('click', e => {
        e.stopPropagation()
        this.toggleDropdown()
      })

      // Seleccionar tema
      const themeOptions = this.dropdown.querySelectorAll('.theme-option')
      themeOptions.forEach(option => {
        option.addEventListener('click', () => {
          const themeId = option.dataset.theme
          console.log('🎨 [ThemeSelector] Theme selected:', themeId)
          themeManager.setTheme(themeId)
          this.closeDropdown()
        })
      })

      // Ciclar temas
      const cycleBtn = document.getElementById('cycle-theme-btn')
      if (cycleBtn) {
        cycleBtn.addEventListener('click', () => {
          console.log('🔄 [ThemeSelector] Cycling theme')
          themeManager.cycleTheme()
          this.closeDropdown()
        })
      }

      // Cerrar al hacer clic fuera
      document.addEventListener('click', e => {
        if (!this.container.contains(e.target)) {
          this.closeDropdown()
        }
      })

      // Cerrar con ESC
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.isOpen === true) {
          this.closeDropdown()
        }
      })

      console.log('✅ [ThemeSelector] Events bound')
    } catch (error) {
      console.error('❌ [ThemeSelector] Failed to bind events:', error)
      throw error
    }
  }

  /**
   * Alterna el dropdown
   */
  toggleDropdown() {
    this.isOpen = !this.isOpen

    if (this.isOpen === true) {
      this.openDropdown()
    } else {
      this.closeDropdown()
    }
  }

  /**
   * Abre el dropdown
   */
  openDropdown() {
    try {
      this.dropdown.classList.remove('hidden')
      this.toggleBtn.setAttribute('aria-expanded', 'true')
      this.isOpen = true

      // Rotar chevron
      const chevron = this.toggleBtn.querySelector('.theme-chevron')
      if (chevron) {
        chevron.style.transform = 'rotate(180deg)'
      }

      this.updateCurrentThemeDisplay()
      console.log('🎨 [ThemeSelector] Dropdown opened')
    } catch (error) {
      console.error('❌ [ThemeSelector] Failed to open dropdown:', error)
      throw error
    }
  }

  /**
   * Cierra el dropdown
   */
  closeDropdown() {
    try {
      this.dropdown.classList.add('hidden')
      this.toggleBtn.setAttribute('aria-expanded', 'false')
      this.isOpen = false

      // Rotar chevron
      const chevron = this.toggleBtn.querySelector('.theme-chevron')
      if (chevron) {
        chevron.style.transform = 'rotate(0deg)'
      }

      console.log('🎨 [ThemeSelector] Dropdown closed')
    } catch (error) {
      console.error('❌ [ThemeSelector] Failed to close dropdown:', error)
    }
  }

  /**
   * Actualiza la visualización del tema actual
   */
  updateCurrentThemeDisplay() {
    try {
      const currentThemeId = themeManager.getCurrentTheme()
      const currentTheme = themeManager.getCurrentThemeDefinition()

      // Actualizar ícono en el botón
      const iconSpan = this.toggleBtn.querySelector('span')
      if (iconSpan) {
        iconSpan.textContent = currentTheme.icon
      }

      // Actualizar title
      this.toggleBtn.title = `Cambiar tema (actual: ${currentTheme.name})`

      // Actualizar checkmarks
      const themeOptions = this.dropdown.querySelectorAll('.theme-option')
      themeOptions.forEach(option => {
        const themeId = option.dataset.theme
        const checkIcon = option.querySelector('.theme-check')

        if (themeId === currentThemeId) {
          option.classList.add('bg-gray-100')
          if (checkIcon) {
            checkIcon.classList.remove('hidden')
          }
        } else {
          option.classList.remove('bg-gray-100')
          if (checkIcon) {
            checkIcon.classList.add('hidden')
          }
        }
      })

      // Re-renderizar iconos
      createIcons()

      console.log('✅ [ThemeSelector] Display updated')
    } catch (error) {
      console.error('❌ [ThemeSelector] Failed to update display:', error)
    }
  }
}

export default ThemeSelector
