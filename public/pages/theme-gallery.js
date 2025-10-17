/**
 * FloresYa - Theme Gallery Page
 * Galería visual para explorar y probar todos los temas disponibles
 * Siguiendo CLAUDE.md: KISS, fail-fast, ES6 modules, onDOMReady pattern
 */

import { onDOMReady } from '../js/shared/dom-ready.js'
// Static SVG icons used - no runtime initialization needed
import { themeManager } from '../js/themes/themeManager.js'
import ThemeSelector from '../js/components/ThemeSelector.js'

/**
 * Renderiza la grilla de temas
 */
function renderThemeGrid(category = 'all') {
  const grid = document.getElementById('theme-grid')
  if (!grid) {
    console.error('❌ [ThemeGallery] Grid container not found')
    return
  }

  const allThemes = themeManager.getAvailableThemes()
  const filteredThemes =
    category === 'all' ? allThemes : allThemes.filter(theme => theme.category === category)

  const currentThemeId = themeManager.getCurrentTheme()

  grid.innerHTML = filteredThemes
    .map(theme => {
      const isActive = theme.id === currentThemeId
      const categoryColors = {
        basic: 'bg-gray-100 text-gray-700',
        premium: 'bg-purple-100 text-purple-700',
        accessibility: 'bg-green-100 text-green-700'
      }

      return `
        <div
          class="theme-card group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${isActive ? 'ring-4 ring-pink-500' : ''}"
          data-theme-id="${theme.id}"
        >
          <!-- Preview Area con Tapete SVG -->
          <div class="preview-area h-48 relative overflow-hidden" data-preview="${theme.id}">
            <div class="absolute inset-0 flex items-center justify-center text-8xl z-10 pointer-events-none" style="text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
              ${theme.icon}
            </div>
            ${
              isActive
                ? `
              <div class="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg z-20">
                <i data-lucide="check-circle" class="h-4 w-4"></i>
                Activo
              </div>
            `
                : ''
            }
          </div>

          <!-- Theme Info -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <span class="text-4xl">${theme.icon}</span>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 mb-1">
                    ${theme.name}
                  </h3>
                  <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${categoryColors[theme.category] || categoryColors.basic}">
                    ${theme.category === 'basic' ? 'Básico' : theme.category === 'premium' ? 'Premium' : 'Accesibilidad'}
                  </span>
                </div>
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-4">
              ${theme.description}
            </p>
            <button 
              class="apply-theme-btn w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              data-theme-id="${theme.id}"
              aria-label="Aplicar tema ${theme.name}"
            >
              <i data-lucide="palette" class="h-4 w-4"></i>
              Aplicar Tema
            </button>
          </div>

          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div class="absolute bottom-6 left-6 right-6 text-white">
              <p class="text-sm font-medium">Haz clic para aplicar</p>
            </div>
          </div>
        </div>
      `
    })
    .join('')

  // Aplicar preview de colores a cada tarjeta
  filteredThemes.forEach(theme => {
    const previewArea = document.querySelector(`[data-preview="${theme.id}"]`)
    if (previewArea) {
      applyThemePreview(previewArea, theme.id)
    }
  })

  // Static SVG icons used - no runtime initialization needed

  // Añadir event listeners
  attachThemeCardListeners()
}

/**
 * Aplica preview visual del tema a un área con textura SVG de tapete
 */
function applyThemePreview(element, themeId) {
  // Patrones SVG específicos para cada tema
  const patterns = {
    light: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-light" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="2" fill="#ec4899" opacity="0.1"/>
            <path d="M30 20 L35 30 L30 40 L25 30 Z" fill="#f472b6" opacity="0.15"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#fdf2f8"/>
        <rect width="100%" height="100%" fill="url(#pattern-light)"/>
      </svg>`,

    dark: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-dark" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="3" fill="#f472b6" opacity="0.15"/>
            <line x1="0" y1="30" x2="60" y2="30" stroke="#334155" opacity="0.3"/>
            <line x1="30" y1="0" x2="30" y2="60" stroke="#334155" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#0f172a"/>
        <rect width="100%" height="100%" fill="url(#pattern-dark)"/>
      </svg>`,

    eleganciaModerna: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-elegancia" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M0 40 Q20 35, 40 40 T80 40" stroke="#3b82f6" fill="none" opacity="0.1" stroke-width="2"/>
            <circle cx="40" cy="40" r="4" fill="#1e293b" opacity="0.08"/>
            <rect x="38" y="10" width="4" height="15" fill="#3b82f6" opacity="0.05"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#f8fafc"/>
        <rect width="100%" height="100%" fill="url(#pattern-elegancia)"/>
      </svg>`,

    vintageRomantico: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-vintage" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
            <path d="M35 15 Q25 25, 35 35 Q45 25, 35 15" fill="#e3b5a4" opacity="0.15"/>
            <circle cx="15" cy="15" r="2" fill="#d4af37" opacity="0.2"/>
            <circle cx="55" cy="55" r="2" fill="#d4af37" opacity="0.2"/>
            <path d="M10 35 L20 35 L15 45 Z" fill="#e3b5a4" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#fef5f7"/>
        <rect width="100%" height="100%" fill="url(#pattern-vintage)"/>
      </svg>`,

    tropicalVibrante: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-tropical" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M40 20 Q30 30, 40 40 Q50 30, 40 20" fill="#10b981" opacity="0.15"/>
            <ellipse cx="40" cy="40" rx="15" ry="8" fill="#14b8a6" opacity="0.1"/>
            <circle cx="20" cy="60" r="3" fill="#f59e0b" opacity="0.2"/>
            <path d="M40 10 L35 25 L45 25 Z" fill="#10b981" opacity="0.12"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#ecfdf5"/>
        <rect width="100%" height="100%" fill="url(#pattern-tropical)"/>
      </svg>`,

    jardinNatural: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-jardin" x="0" y="0" width="75" height="75" patternUnits="userSpaceOnUse">
            <path d="M37.5 15 L32 30 L43 30 Z" fill="#22c55e" opacity="0.15"/>
            <path d="M37.5 30 L32 45 L43 45 Z" fill="#84cc16" opacity="0.12"/>
            <circle cx="20" cy="20" r="2.5" fill="#eab308" opacity="0.2"/>
            <circle cx="55" cy="55" r="2.5" fill="#eab308" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#f7fee7"/>
        <rect width="100%" height="100%" fill="url(#pattern-jardin)"/>
      </svg>`,

    zenMinimalista: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-zen" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
            <circle cx="45" cy="45" r="20" stroke="#78716c" fill="none" opacity="0.08" stroke-width="1"/>
            <circle cx="45" cy="45" r="30" stroke="#78716c" fill="none" opacity="0.06" stroke-width="1"/>
            <line x1="15" y1="45" x2="75" y2="45" stroke="#a8a29e" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#fafaf9"/>
        <rect width="100%" height="100%" fill="url(#pattern-zen)"/>
      </svg>`,

    darkula: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-darkula" x="0" y="0" width="65" height="65" patternUnits="userSpaceOnUse">
            <rect x="28" y="28" width="9" height="9" fill="#9876aa" opacity="0.15"/>
            <circle cx="15" cy="15" r="3" fill="#cc7832" opacity="0.1"/>
            <circle cx="50" cy="50" r="3" fill="#6897bb" opacity="0.1"/>
            <path d="M32.5 10 L28 20 L37 20 Z" fill="#9876aa" opacity="0.12"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#2b2b2b"/>
        <rect width="100%" height="100%" fill="url(#pattern-darkula)"/>
      </svg>`,

    wood: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-wood" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 50 Q25 45, 50 50 T100 50" stroke="#8b5a3c" fill="none" opacity="0.15" stroke-width="3"/>
            <path d="M0 30 Q25 28, 50 30 T100 30" stroke="#c87941" fill="none" opacity="0.1" stroke-width="2"/>
            <ellipse cx="50" cy="50" rx="8" ry="15" fill="#cd853f" opacity="0.08"/>
            <circle cx="20" cy="70" r="4" fill="#8b5a3c" opacity="0.12"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#faf6f1"/>
        <rect width="100%" height="100%" fill="url(#pattern-wood)"/>
      </svg>`,

    girasol: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-girasol" x="0" y="0" width="85" height="85" patternUnits="userSpaceOnUse">
            <circle cx="42.5" cy="42.5" r="15" fill="#f59e0b" opacity="0.1"/>
            <path d="M42.5 27.5 L47 37 L57 37 L49.5 43 L52.5 52.5 L42.5 46.5 L32.5 52.5 L35.5 43 L28 37 L38 37 Z"
                  fill="#fb923c" opacity="0.15"/>
            <circle cx="42.5" cy="42.5" r="6" fill="#eab308" opacity="0.2"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#fffbeb"/>
        <rect width="100%" height="100%" fill="url(#pattern-girasol)"/>
      </svg>`,

    highContrastLight: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-hcl" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="25" height="25" fill="#f0f0f0" opacity="0.5"/>
            <rect x="25" y="25" width="25" height="25" fill="#f0f0f0" opacity="0.5"/>
            <line x1="0" y1="25" x2="25" y2="0" stroke="#000000" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#ffffff"/>
        <rect width="100%" height="100%" fill="url(#pattern-hcl)"/>
      </svg>`,

    highContrastDark: `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pattern-hcd" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="25" height="25" fill="#2a2a2a" opacity="0.5"/>
            <rect x="25" y="25" width="25" height="25" fill="#2a2a2a" opacity="0.5"/>
            <line x1="0" y1="25" x2="25" y2="0" stroke="#ffffe0" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <rect width="100%" height="100%" fill="url(#pattern-hcd)"/>
      </svg>`
  }

  const svgPattern = patterns[themeId] || patterns.light
  element.innerHTML = svgPattern
  element.style.borderRadius = '1rem 1rem 0 0'
}

/**
 * Adjunta event listeners a las tarjetas de temas
 */
function attachThemeCardListeners() {
  const applyButtons = document.querySelectorAll('.apply-theme-btn')

  applyButtons.forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const themeId = btn.dataset.themeId

      try {
        console.log('🎨 [ThemeGallery] Applying theme:', themeId)
        themeManager.setTheme(themeId)
        updateCurrentThemeInfo()
        renderThemeGrid(getCurrentFilter())

        // Visual feedback
        btn.innerHTML = '<i data-lucide="check" class="h-4 w-4"></i> Aplicado'
        setTimeout(() => {
          btn.innerHTML = `<i data-lucide="palette" class="h-4 w-4"></i> Aplicar Tema`
          // Static SVG icons used - no runtime initialization needed
        }, 1500)
      } catch (error) {
        console.error('❌ [ThemeGallery] Failed to apply theme:', error)
        throw error
      }
    })
  })

  // Click en toda la tarjeta también aplica el tema
  const themeCards = document.querySelectorAll('.theme-card')
  themeCards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.apply-theme-btn')) {
        return
      }
      const applyBtn = card.querySelector('.apply-theme-btn')
      if (applyBtn) {
        applyBtn.click()
      }
    })
  })
}

/**
 * Actualiza la información del tema actual
 */
function updateCurrentThemeInfo() {
  const currentTheme = themeManager.getCurrentThemeDefinition()

  const iconEl = document.getElementById('current-theme-icon')
  const nameEl = document.getElementById('current-theme-name')
  const descEl = document.getElementById('current-theme-description')
  const categoryEl = document.getElementById('current-theme-category')

  if (iconEl) {
    iconEl.textContent = currentTheme.icon
  }
  if (nameEl) {
    nameEl.textContent = currentTheme.name
  }
  if (descEl) {
    descEl.textContent = currentTheme.description
  }
  if (categoryEl) {
    const categoryLabels = {
      basic: 'Básico',
      premium: 'Premium',
      accessibility: 'Accesibilidad'
    }
    categoryEl.textContent = categoryLabels[currentTheme.category] || 'Desconocido'

    const categoryColors = {
      basic: 'bg-gray-100 text-gray-700',
      premium: 'bg-purple-100 text-purple-700',
      accessibility: 'bg-green-100 text-green-700'
    }
    categoryEl.className = `inline-block px-3 py-1 rounded-full text-sm font-semibold ${categoryColors[currentTheme.category] || categoryColors.basic}`
  }
}

/**
 * Obtiene el filtro actual
 */
function getCurrentFilter() {
  const activeBtn = document.querySelector('.filter-btn.active')
  return activeBtn ? activeBtn.dataset.category : 'all'
}

/**
 * Inicializa los filtros de categoría
 */
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn')

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category

      // Actualizar estado activo
      filterButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      // Renderizar temas filtrados
      renderThemeGrid(category)

      console.log('🔍 [ThemeGallery] Filter applied:', category)
    })
  })
}

/**
 * Inicializa los botones de acción
 */
function initActionButtons() {
  const resetBtn = document.getElementById('reset-theme-btn')
  const exportBtn = document.getElementById('export-theme-btn')

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      try {
        console.log('🔄 [ThemeGallery] Resetting to default theme')
        themeManager.setTheme('light')
        updateCurrentThemeInfo()
        renderThemeGrid(getCurrentFilter())

        // Visual feedback
        resetBtn.innerHTML = '<i data-lucide="check" class="inline h-4 w-4 mr-2"></i> Restaurado'
        // Static SVG icons used - no runtime initialization needed
        setTimeout(() => {
          resetBtn.innerHTML = `<i data-lucide="refresh-cw" class="inline h-4 w-4 mr-2"></i> Restaurar por Defecto`
          // Static SVG icons used - no runtime initialization needed
        }, 1500)
      } catch (error) {
        console.error('❌ [ThemeGallery] Failed to reset theme:', error)
        throw error
      }
    })
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        const currentTheme = themeManager.getCurrentThemeDefinition()
        const exportData = {
          theme: currentTheme.id,
          name: currentTheme.name,
          timestamp: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `floresya-theme-${currentTheme.id}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        console.log('💾 [ThemeGallery] Theme exported:', currentTheme.id)

        // Visual feedback
        exportBtn.innerHTML = '<i data-lucide="check" class="inline h-4 w-4 mr-2"></i> Exportado'
        // Static SVG icons used - no runtime initialization needed
        setTimeout(() => {
          exportBtn.innerHTML = `<i data-lucide="download" class="inline h-4 w-4 mr-2"></i> Exportar Configuración`
          // Static SVG icons used - no runtime initialization needed
        }, 1500)
      } catch (error) {
        console.error('❌ [ThemeGallery] Failed to export theme:', error)
        throw error
      }
    })
  }
}

/**
 * Inicializa la página
 */
function init() {
  try {
    console.log('🚀 [ThemeGallery] Starting initialization...')

    // Inicializar Theme Manager
    themeManager.init()

    // Inicializar Theme Selector UI
    const themeSelectorContainer = document.getElementById('theme-selector-container')
    if (themeSelectorContainer) {
      new ThemeSelector('theme-selector-container')
    }

    // Static SVG icons used - no runtime initialization needed

    // Renderizar grilla de temas
    renderThemeGrid('all')

    // Actualizar información del tema actual
    updateCurrentThemeInfo()

    // Inicializar filtros
    initCategoryFilters()

    // Inicializar botones de acción
    initActionButtons()

    // Escuchar cambios de tema
    window.addEventListener('themeChanged', () => {
      updateCurrentThemeInfo()
      renderThemeGrid(getCurrentFilter())
    })

    console.log('✅ [ThemeGallery] Initialization complete')
  } catch (error) {
    console.error('❌ [ThemeGallery] Initialization failed:', error)
    throw error
  }
}

// Ejecutar cuando DOM esté listo
onDOMReady(init)
