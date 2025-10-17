/**
 * FloresYa - Theme Selector Component
 * Dropdown en navbar para seleccionar temas
 * Siguiendo CLAUDE.md: KISS, fail-fast, const, try-catch con console.error + throw
 * Siguiendo ESLint: prefer-const, curly, eqeqeq, no-var
 */

import { themeManager } from '../themes/themeManager.js'

/**
 * Theme Selector Component Class
 */
export class ThemeSelector {
  /**
   * Constructor
   * @param {string} containerId - ID del contenedor
   */
  constructor(containerId) {
    this.containerId = containerId
    this.container = document.getElementById(containerId)
    this.dropdown = null
    this.toggleBtn = null
    this.isOpen = false
    this.initializationAttempts = 0
    this.maxInitializationAttempts = 3

    console.log(`🎨 [ThemeSelector] Constructor called for container: ${containerId}`)

    // Enhanced container validation
    if (!this.container) {
      const error = new Error(`ThemeSelector container not found: ${containerId}`)
      console.error('❌ [ThemeSelector]', error)
      console.error(
        '❌ [ThemeSelector] Available containers:',
        Array.from(document.querySelectorAll('[id]')).map(el => el.id)
      )
      throw error
    }

    this.init()
  }

  /**
   * Inicializa el componente
   */
  init() {
    console.log(`🎨 [ThemeSelector] Initializing... (attempt ${this.initializationAttempts + 1})`)

    try {
      // Add custom CSS for better scrollbars
      this.addCustomStyles()

      // Verify dependencies are loaded
      if (!window.themeManager) {
        throw new Error(
          'themeManager is not available. Make sure themeManager.js is loaded before ThemeSelector.js'
        )
      }

      // Static SVG icons are used - no runtime icon conversion needed
      console.log('🎨 [ThemeSelector] Using static SVG icons from /public/images/lucide/')
      console.log('🔍 [Icon System Debug] ThemeSelector initialized with static SVG icons')

      // Re-check container in case it was dynamically created
      if (!this.container) {
        this.container = document.getElementById(this.containerId)
        if (!this.container) {
          throw new Error(`Container ${this.containerId} still not found during initialization`)
        }
      }

      this.render()
      this.bindEvents()
      this.updateCurrentThemeDisplay()

      // Escuchar cambios de tema
      window.addEventListener('themeChanged', () => {
        console.log('🎨 [ThemeSelector] Theme changed event received')
        this.updateCurrentThemeDisplay()
      })

      console.log('✅ [ThemeSelector] Initialized successfully')
    } catch (error) {
      console.error('❌ [ThemeSelector] Initialization failed:', error)

      this.initializationAttempts++
      if (this.initializationAttempts < this.maxInitializationAttempts) {
        console.log(
          `🔄 [ThemeSelector] Retrying initialization in ${this.initializationAttempts * 200}ms...`
        )
        setTimeout(() => this.init(), this.initializationAttempts * 200)
      } else {
        console.error('❌ [ThemeSelector] Max initialization attempts reached')
        this.createFallbackUI()
      }
    }
  }

  /**
   * Agrega estilos CSS personalizados para el scroll
   */
  addCustomStyles() {
    const styleId = 'theme-selector-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        /* Custom scrollbar styles for theme dropdown */
        .theme-dropdown.custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .theme-dropdown.custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(249 250 251);
          border-radius: 4px;
        }
        
        .theme-dropdown.custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(229 231 235);
          border-radius: 4px;
          border: 1px solid rgb(243 244 246);
        }
        
        .theme-dropdown.custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(209 213 219);
        }
        
        /* Firefox scrollbar styles */
        .theme-dropdown.custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgb(229 231 235) rgb(249 250 251);
        }
        
        /* Better scroll behavior */
        .theme-dropdown.custom-scrollbar {
          scroll-behavior: smooth;
          overscroll-behavior: contain;
        }
        
        /* Enhanced hover states */
        .theme-option {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .theme-option:hover {
          transform: translateX(2px);
        }
        
        /* Active state animation */
        .theme-option.active {
          background: linear-gradient(135deg, rgb(254 242 242) 0%, rgb(254 249 195) 100%);
          border-left: 3px solid rgb(236 72 153);
        }
      `
      document.head.appendChild(style)
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
            class="theme-toggle-btn flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 bg-white"
            type="button"
            aria-label="Cambiar tema"
            aria-haspopup="true"
            aria-expanded="false"
            title="Cambiar tema (actual: ${currentTheme.name})"
          >
            <span class="text-2xl">${currentTheme.icon}</span>
            <i data-lucide="chevron-down" class="h-5 w-5 text-gray-600 theme-chevron transition-transform duration-200"></i>
          </button>

          <!-- Dropdown Menu -->
          <div
            id="theme-dropdown"
            class="theme-dropdown absolute right-0 mt-3 w-[420px] max-h-[500px] overflow-y-auto rounded-xl shadow-2xl bg-white ring-2 ring-gray-200 ring-opacity-50 hidden z-50 border border-gray-200 custom-scrollbar"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-toggle-btn"
            style="scrollbar-width: thin; scrollbar-color: rgb(229 231 235) rgb(249 250 251);"
          >
            <!-- Header -->
            <div class="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-gray-900">
                  Seleccionar Tema
                </h3>
                <a
                  href="/pages/theme-gallery.html"
                  class="text-sm text-pink-600 hover:text-pink-700 flex items-center gap-2 transition-colors font-medium"
                  title="Ver galería de temas"
                >
                  <i data-lucide="layout-grid" class="h-4 w-4"></i>
                  Galería
                </a>
              </div>
            </div>

            <!-- Basic Themes -->
            <div class="py-2">
              <div class="px-5 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Básicos
              </div>
              ${this.renderThemeGroup(themes.filter(t => t.category === 'basic'))}
            </div>

            <!-- Premium Themes -->
            <div class="py-2 border-t border-gray-200">
              <div class="px-5 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Premium
              </div>
              ${this.renderThemeGroup(themes.filter(t => t.category === 'premium'))}
            </div>

            <!-- Accessibility Themes -->
            <div class="py-2 border-t border-gray-200">
              <div class="px-5 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Accesibilidad
              </div>
              ${this.renderThemeGroup(themes.filter(t => t.category === 'accessibility'))}
            </div>

            <!-- Actions -->
            <div class="border-t border-gray-200 py-3">
              <button
                id="cycle-theme-btn"
                class="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-3 transition-all duration-200 rounded-lg mx-3"
                type="button"
                role="menuitem"
                title="Cambiar al siguiente tema"
              >
                <i data-lucide="refresh-ccw" class="h-5 w-5 text-gray-500"></i>
                <span>Cambiar automáticamente</span>
              </button>
            </div>
          </div>
        </div>
      `

      // Static SVG icons are used - no runtime initialization needed
      console.log('🎨 [ThemeSelector] Static SVG icons are already embedded in HTML')
      console.log('🔍 [Icon System Debug] ThemeSelector rendered with static SVG icons')

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
        class="theme-option w-full text-left px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-between transition-all duration-200 group mx-3 my-1 rounded-lg"
        type="button"
        role="menuitem"
        data-theme="${theme.id}"
        title="${theme.description}"
      >
        <div class="flex items-center gap-4">
          <span class="text-2xl">${theme.icon}</span>
          <div>
            <div class="font-semibold text-gray-900">${theme.name}</div>
            <div class="text-xs text-gray-500 mt-0.5">${theme.description}</div>
          </div>
        </div>
        <i data-lucide="check" class="h-5 w-5 text-pink-600 hidden theme-check group-hover:scale-110 transition-transform"></i>
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

      // Actualizar checkmarks y estado activo
      const themeOptions = this.dropdown.querySelectorAll('.theme-option')
      themeOptions.forEach(option => {
        const themeId = option.dataset.theme
        const checkIcon = option.querySelector('.theme-check')

        if (themeId === currentThemeId) {
          option.classList.add('active', 'bg-gray-100')
          if (checkIcon) {
            checkIcon.classList.remove('hidden')
          }
        } else {
          option.classList.remove('active', 'bg-gray-100')
          if (checkIcon) {
            checkIcon.classList.add('hidden')
          }
        }
      })

      // With static icons, no runtime icon re-rendering is needed
      // Icons are already rendered as static SVG in the HTML
      console.log('🔍 [Icon System Debug] ThemeSelector display updated with static SVG icons')

      console.log('✅ [ThemeSelector] Display updated')
    } catch (error) {
      console.error('❌ [ThemeSelector] Failed to update display:', error)
    }
  }

  /**
   * Creates a fallback UI when full initialization fails
   */
  createFallbackUI() {
    try {
      console.log('🔄 [ThemeSelector] Creating fallback UI...')

      if (!this.container) {
        console.error('❌ [ThemeSelector] Cannot create fallback: container not found')
        return
      }

      this.container.innerHTML = `
        <button
          id="fallback-theme-toggle"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 bg-white"
          type="button"
          title="Cambiar tema (básico)"
        >
          <span id="fallback-theme-icon" class="text-2xl">☀️</span>
          <i data-lucide="chevron-down" class="h-5 w-5 text-gray-600"></i>
        </button>
      `

      // With static icons, no runtime icon initialization is needed
      // Icons are already rendered as static SVG in the HTML
      console.log('🔍 [Icon System Debug] Fallback UI created with static SVG icons')

      // Add basic theme switching
      const fallbackBtn = document.getElementById('fallback-theme-toggle')
      const fallbackIcon = document.getElementById('fallback-theme-icon')

      if (fallbackBtn && fallbackIcon) {
        // Set initial icon based on current theme
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
        fallbackIcon.textContent = currentTheme === 'light' ? '☀️' : '🌙'

        fallbackBtn.addEventListener('click', () => {
          const newTheme = currentTheme === 'light' ? 'dark' : 'light'
          document.documentElement.setAttribute('data-theme', newTheme)

          try {
            localStorage.setItem('floresya-theme-preference', newTheme)
          } catch (e) {
            console.warn('⚠️ [ThemeSelector] Could not save theme preference:', e)
          }

          fallbackIcon.textContent = newTheme === 'light' ? '☀️' : '🌙'

          // Emit theme changed event for compatibility
          window.dispatchEvent(
            new CustomEvent('themeChanged', {
              detail: { themeId: newTheme, themeName: newTheme === 'light' ? 'Claro' : 'Oscuro' }
            })
          )
        })
      }

      console.log('✅ [ThemeSelector] Fallback UI created successfully')
    } catch (error) {
      console.error('❌ [ThemeSelector] Failed to create fallback UI:', error)
    }
  }
}

export default ThemeSelector
