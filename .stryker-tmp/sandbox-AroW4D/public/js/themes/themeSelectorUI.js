/**
 * FloresYa - Selector Visual de Temas Granulares
 * Componente UI para cambiar temas global y granularmente
 * Inspirado en Google Chrome DevTools Theme Selector
 */
// @ts-nocheck

import { themeManager } from './themeManager.js'

import {
  changeThemeWithGranular,
  applyGranularThemeWithContrast,
  autoAdjustPageContrast
} from './granularThemeConfig.js'

/**
 * Clase principal del Selector de Temas
 */
export class ThemeSelectorUI {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      position: 'top-right', // top-right, top-left, bottom-right, bottom-left
      theme: 'auto', // auto, light, dark
      showAdvanced: false, // Mostrar controles granulares
      persist: true, // Guardar preferencias en localStorage
      ...options
    }
    this.isOpen = false
    this.currentPanel = null
    this.init()
  }

  /**
   * Inicializar el selector
   */
  init() {
    this.createHTML()
    this.attachEventListeners()
    this.loadSavedPreferences()
    this.updateUI()
  }

  /**
   * Crear estructura HTML
   */
  createHTML() {
    this.container.innerHTML = `
      <!-- Theme Selector Toggle Button -->
      <button
        id="theme-selector-toggle"
        class="theme-selector-toggle"
        title="Abrir selector de temas"
        style="
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 9999;
          width: 50px;
          height: 50px;
          background: var(--theme-bg-primary, #ffffff);
          border: 1px solid var(--theme-border-light, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--theme-text-primary, #1f2937);
        "
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-3.5L18 18m-12 0L3 18"></path>
        </svg>
      </button>

      <!-- Theme Selector Panel -->
      <div
        id="theme-selector-panel"
        class="theme-selector-panel"
        style="
          position: fixed;
          top: 140px;
          right: 20px;
          z-index: 9999;
          width: 320px;
          max-height: 80vh;
          overflow-y: auto;
          background: var(--theme-bg-primary, #ffffff);
          border: 1px solid var(--theme-border-light, #e5e7eb);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          display: none;
          opacity: 0;
          transition: all 0.3s ease;
        "
      >
        <!-- Header -->
        <div style="
          padding: 16px;
          border-bottom: 1px solid var(--theme-border-light, #e5e7eb);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--theme-bg-secondary, #f8fafc);
        ">
          <h3 style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--theme-text-primary, #1f2937);
          ">🎨 Selector de Temas</h3>
          <button
            id="theme-selector-close"
            style="
              background: transparent;
              border: none;
              cursor: pointer;
              padding: 4px;
              color: var(--theme-text-secondary, #6b7280);
            "
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div style="padding: 16px;">
          <!-- Tema Global -->
          <div class="section" style="margin-bottom: 20px;">
            <label style="
              display: block;
              font-size: 13px;
              font-weight: 600;
              color: var(--theme-text-primary, #1f2937);
              margin-bottom: 8px;
            ">
              🌍 Tema Global
            </label>
            <select id="global-theme-select" style="
              width: 100%;
              padding: 10px 12px;
              border: 1px solid var(--theme-border-light, #e5e7eb);
              border-radius: 8px;
              background: var(--theme-bg-primary, #ffffff);
              color: var(--theme-text-primary, #1f2937);
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
            ">
              <option value="light">☀️ Claro</option>
              <option value="dark">🌙 Oscuro</option>
              <option value="eleganciaModerna">💎 Elegancia Moderna</option>
              <option value="vintageRomantico">🌸 Vintage Romántico</option>
              <option value="tropicalVibrante">🌺 Tropical Vibrante</option>
              <option value="jardinNatural">🌿 Jardín Natural</option>
              <option value="zenMinimalista">🧘 Zen Minimalista</option>
              <option value="darkula">🦇 Darkula</option>
              <option value="wood">🪵 Madera</option>
              <option value="girasol">🌻 Girasol</option>
              <option value="halloween">🎃 Halloween</option>
              <option value="navidad">🎄 Navidad</option>
              <option value="finDeAno">🎆 Fin de Año</option>
              <option value="carnaval">🎭 Carnaval</option>
              <option value="semanaSanta">⛪ Semana Santa</option>
              <option value="vacaciones">🏖️ Vacaciones</option>
              <option value="highContrastLight">🔆 Alto Contraste Claro</option>
              <option value="highContrastDark">🔅 Alto Contraste Oscuro</option>
            </select>
          </div>

          <!-- Presets de Página -->
          <div class="section" style="margin-bottom: 20px;">
            <label style="
              display: block;
              font-size: 13px;
              font-weight: 600;
              color: var(--theme-text-primary, #1f2937);
              margin-bottom: 8px;
            ">
              📋 Preset de Página
            </label>
            <select id="page-preset-select" style="
              width: 100%;
              padding: 10px 12px;
              border: 1px solid var(--theme-border-light, #e5e7eb);
              border-radius: 8px;
              background: var(--theme-bg-primary, #ffffff);
              color: var(--theme-text-primary, #1f2937);
              font-size: 14px;
              cursor: pointer;
            ">
              <option value="homepage">🏠 Homepage</option>
              <option value="cart">🛒 Carrito</option>
              <option value="payment">💳 Pago</option>
              <option value="productDetail">📦 Detalle de Producto</option>
            </select>
          </div>

          <!-- Temas Granulares -->
          <div class="section" style="margin-bottom: 20px;">
            <div style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;
            ">
              <label style="
                font-size: 13px;
                font-weight: 600;
                color: var(--theme-text-primary, #1f2937);
              ">
                🎯 Temas Granulares
              </label>
              <button
                id="toggle-advanced"
                style="
                  background: var(--theme-primary, #ec4899);
                  color: white;
                  border: none;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  cursor: pointer;
                "
              >
                Mostrar
              </button>
            </div>

            <div id="granular-controls" style="display: none;">
              <div class="panel-control" style="margin-bottom: 12px;">
                <label style="
                  display: block;
                  font-size: 12px;
                  color: var(--theme-text-secondary, #6b7280);
                  margin-bottom: 4px;
                ">
                  Navegación
                </label>
                <select data-panel="navigation" style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid var(--theme-border-light, #e5e7eb);
                  border-radius: 6px;
                  background: var(--theme-bg-primary, #ffffff);
                  color: var(--theme-text-primary, #1f2937);
                  font-size: 13px;
                ">
                  <option value="primary">Primario</option>
                  <option value="glass">Glassmorphism</option>
                  <option value="solid">Sólido</option>
                </select>
              </div>

              <div class="panel-control" style="margin-bottom: 12px;">
                <label style="
                  display: block;
                  font-size: 12px;
                  color: var(--theme-text-secondary, #6b7280);
                  margin-bottom: 4px;
                ">
                  Hero
                </label>
                <select data-panel="hero" style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid var(--theme-border-light, #e5e7eb);
                  border-radius: 6px;
                  background: var(--theme-bg-primary, #ffffff);
                  color: var(--theme-text-primary, #1f2937);
                  font-size: 13px;
                ">
                  <option value="gradient">Gradiente</option>
                  <option value="image">Imagen</option>
                  <option value="solid">Sólido</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div class="panel-control" style="margin-bottom: 12px;">
                <label style="
                  display: block;
                  font-size: 12px;
                  color: var(--theme-text-secondary, #6b7280);
                  margin-bottom: 4px;
                ">
                  Carrito/Form
                </label>
                <select data-panel="cart" style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid var(--theme-border-light, #e5e7eb);
                  border-radius: 6px;
                  background: var(--theme-bg-primary, #ffffff);
                  color: var(--theme-text-primary, #1f2937);
                  font-size: 13px;
                ">
                  <option value="overlay">Overlay</option>
                  <option value="card">Card</option>
                  <option value="premium">Premium</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div class="panel-control" style="margin-bottom: 12px;">
                <label style="
                  display: block;
                  font-size: 12px;
                  color: var(--theme-text-secondary, #6b7280);
                  margin-bottom: 4px;
                ">
                  Formularios
                </label>
                <select data-panel="forms" style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid var(--theme-border-light, #e5e7eb);
                  border-radius: 6px;
                  background: var(--theme-bg-primary, #ffffff);
                  color: var(--theme-text-primary, #1f2937);
                  font-size: 13px;
                ">
                  <option value="standard">Estándar</option>
                  <option value="outlined">Outlined</option>
                  <option value="filled">Filled</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="section" style="margin-bottom: 10px;">
            <button id="auto-contrast-btn" style="
              width: 100%;
              padding: 10px;
              background: var(--theme-primary, #ec4899);
              color: var(--theme-text-on-primary, #ffffff);
              border: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              margin-bottom: 8px;
            " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              🎨 Ajustar Contraste (AA 5.0)
            </button>

            <button id="aaa-contrast-btn" style="
              width: 100%;
              padding: 10px;
              background: var(--theme-secondary, #10b981);
              color: var(--theme-text-on-primary, #ffffff);
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              margin-bottom: 8px;
            " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              🔆 Contraste AAA (7.0)
            </button>

            <button id="reset-btn" style="
              width: 100%;
              padding: 10px;
              background: var(--theme-bg-secondary, #f8fafc);
              color: var(--theme-text-primary, #1f2937);
              border: 1px solid var(--theme-border-light, #e5e7eb);
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            " onmouseover="this.style.background='var(--theme-border-light, #e5e7eb)'" onmouseout="this.style.background='var(--theme-bg-secondary, #f8fafc)'">
              🔄 Resetear a Preset
            </button>
          </div>

          <!-- Status -->
          <div id="theme-status" style="
            padding: 8px 12px;
            background: var(--theme-bg-secondary, #f8fafc);
            border-radius: 6px;
            font-size: 12px;
            color: var(--theme-text-secondary, #6b7280);
            text-align: center;
          ">
            ✅ Selector listo
          </div>
        </div>
      </div>
    `
  }

  /**
   * Adjuntar event listeners
   */
  attachEventListeners() {
    const toggleBtn = document.getElementById('theme-selector-toggle')
    const panel = document.getElementById('theme-selector-panel')
    const closeBtn = document.getElementById('theme-selector-close')
    const globalSelect = document.getElementById('global-theme-select')
    const presetSelect = document.getElementById('page-preset-select')
    const toggleAdvanced = document.getElementById('toggle-advanced')
    const granularControls = document.getElementById('granular-controls')
    const autoContrastBtn = document.getElementById('auto-contrast-btn')
    const aaaContrastBtn = document.getElementById('aaa-contrast-btn')
    const resetBtn = document.getElementById('reset-btn')

    // Toggle panel
    toggleBtn?.addEventListener('click', () => this.toggle())

    // Close panel
    closeBtn?.addEventListener('click', () => this.close())
    document.addEventListener('click', e => {
      if (this.isOpen && !panel.contains(e.target) && !toggleBtn.contains(e.target)) {
        this.close()
      }
    })

    // Cambiar tema global
    globalSelect?.addEventListener('change', e => {
      this.updateStatus('Cambiando tema...')
      changeThemeWithGranular(e.target.value, true)
      this.updateStatus(`✅ Tema: ${e.target.value}`)
      this.savePreferences()
    })

    // Aplicar preset de página
    presetSelect?.addEventListener('change', e => {
      this.updateStatus('Aplicando preset...')
      const path = window.location.pathname
      if (e.target.value === 'homepage' && !path.includes('index')) {
        this.updateStatus('⚠️ Preset homepage aplicado, pero estás en otra página')
      } else {
        // Re-inicializar granular themes para la página actual
        setTimeout(() => {
          location.reload()
        }, 500)
      }
    })

    // Toggle advanced controls
    toggleAdvanced?.addEventListener('click', () => {
      this.options.showAdvanced = !this.options.showAdvanced
      granularControls.style.display = this.options.showAdvanced ? 'block' : 'none'
      toggleAdvanced.textContent = this.options.showAdvanced ? 'Ocultar' : 'Mostrar'
    })

    // Auto contraste AA (ratio 5.0)
    autoContrastBtn?.addEventListener('click', () => {
      this.updateStatus('Ajustando contraste AA 5.0...')
      const adjusted = autoAdjustPageContrast('body', 5.0)
      this.updateStatus(`✅ Contraste AA ajustado en ${adjusted} elementos`)
    })

    // Auto contraste AAA (ratio 7.0)
    aaaContrastBtn?.addEventListener('click', () => {
      this.updateStatus('Ajustando contraste AAA 7.0...')
      const adjusted = autoAdjustPageContrast('body', 7.0)
      this.updateStatus(`✅ Contraste AAA aplicado en ${adjusted} elementos`)
    })

    // Reset
    resetBtn?.addEventListener('click', () => {
      this.updateStatus('Reseteando...')
      setTimeout(() => {
        location.reload()
      }, 300)
    })

    // Granular theme controls
    granularControls?.addEventListener('change', e => {
      if (e.target.tagName === 'SELECT') {
        const panelType = e.target.dataset.panel
        const themeName = e.target.value
        this.updateStatus(`Aplicando ${panelType}:${themeName}...`)
        applyGranularThemeWithContrast(panelType, themeName, true)
        this.updateStatus(`✅ ${panelType}:${themeName}`)
        this.savePreferences()
      }
    })
  }

  /**
   * Alternar visibilidad del panel
   */
  toggle() {
    const panel = document.getElementById('theme-selector-panel')
    this.isOpen = !this.isOpen
    panel.style.display = this.isOpen ? 'block' : 'none'
    setTimeout(() => {
      panel.style.opacity = this.isOpen ? '1' : '0'
    }, 10)
  }

  /**
   * Cerrar panel
   */
  close() {
    const panel = document.getElementById('theme-selector-panel')
    this.isOpen = false
    panel.style.opacity = '0'
    setTimeout(() => {
      panel.style.display = 'none'
    }, 300)
  }

  /**
   * Actualizar UI
   */
  updateUI() {
    // Cargar tema actual
    const currentTheme = themeManager.getCurrentTheme()
    const globalSelect = document.getElementById('global-theme-select')
    if (globalSelect && currentTheme) {
      globalSelect.value = currentTheme
    }

    // Actualizar preset según página
    const path = window.location.pathname
    const presetSelect = document.getElementById('page-preset-select')
    let currentPreset = 'homepage'

    if (path.includes('cart')) {
      currentPreset = 'cart'
    } else if (path.includes('payment')) {
      currentPreset = 'payment'
    } else if (path.includes('product')) {
      currentPreset = 'productDetail'
    }

    if (presetSelect) {
      presetSelect.value = currentPreset
    }
  }

  /**
   * Actualizar mensaje de estado
   */
  updateStatus(message) {
    const status = document.getElementById('theme-status')
    if (status) {
      status.textContent = message
    }
  }

  /**
   * Guardar preferencias en localStorage
   */
  savePreferences() {
    if (!this.options.persist) {
      return
    }

    const globalSelect = document.getElementById('global-theme-select')
    const granularSelects = document.querySelectorAll('#granular-controls select')

    const preferences = {
      globalTheme: globalSelect?.value || 'light',
      granularThemes: {},
      timestamp: Date.now()
    }

    granularSelects.forEach(select => {
      preferences.granularThemes[select.dataset.panel] = select.value
    })

    localStorage.setItem('floresya-theme-preferences', JSON.stringify(preferences))
  }

  /**
   * Cargar preferencias guardadas
   */
  loadSavedPreferences() {
    if (!this.options.persist) {
      return
    }

    const saved = localStorage.getItem('floresya-theme-preferences')
    if (!saved) {
      return
    }

    try {
      const preferences = JSON.parse(saved)

      // Aplicar tema global
      if (preferences.globalTheme) {
        changeThemeWithGranular(preferences.globalTheme, false)
      }

      // Aplicar granular themes después de un delay
      setTimeout(() => {
        Object.entries(preferences.granularThemes || {}).forEach(([panel, theme]) => {
          applyGranularThemeWithContrast(panel, theme, false)
        })
      }, 500)

      this.updateStatus('✅ Preferencias cargadas')
    } catch (error) {
      console.warn('Error loading saved theme preferences:', error)
    }
  }

  /**
   * Destruir selector
   */
  destroy() {
    this.container.innerHTML = ''
  }
}

/**
 * Crear selector de temas
 * @param {HTMLElement|string} container - Container DOM o selector
 * @param {Object} options - Opciones de configuración
 * @returns {ThemeSelectorUI} Instancia del selector
 */
export function createThemeSelector(container, options = {}) {
  let containerElement

  if (typeof container === 'string') {
    containerElement = document.querySelector(container)
  } else {
    containerElement = container
  }

  if (!containerElement) {
    console.error('ThemeSelector: Container not found')
    return null
  }

  return new ThemeSelectorUI(containerElement, options)
}

/**
 * Auto-inicializar en un selector específico
 */
export function initThemeSelectorInContainer(containerId = 'theme-selector-container') {
  const container = document.getElementById(containerId)
  if (!container) {
    console.warn(`ThemeSelector: Container #${containerId} not found`)
    return null
  }

  return createThemeSelector(container, {
    showAdvanced: false,
    persist: true
  })
}

// Auto-inicializar si está en el navegador
if (typeof window !== 'undefined') {
  // Auto-inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Solo auto-inicializar si el container existe
      if (document.getElementById('theme-selector-container')) {
        initThemeSelectorInContainer('theme-selector-container')
      }
    })
  } else {
    // DOM ya está listo
    if (document.getElementById('theme-selector-container')) {
      initThemeSelectorInContainer('theme-selector-container')
    }
  }

  // Exponer al objeto global para acceso manual
  window.createThemeSelector = createThemeSelector
  window.initThemeSelectorInContainer = initThemeSelectorInContainer
}
