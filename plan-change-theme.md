# Plan Atómico: Implementación de Sistema de Temas Dinámicos

## Objetivo

Implementar un sistema de temas dinámicos que permita cambiar entre diferentes temas (dark, ocean, dracula, etc.) desde la navbar con persistencia en localStorage.

## Paso 1: Crear el sistema de gestión de temas

### 1.1 Crear archivo de definición de temas

`/public/js/themes/themeDefinitions.js`

```javascript
// Definiciones de temas con sus variables CSS personalizadas
export const themes = {
  light: {
    name: 'Claro',
    class: 'theme-light',
    variables: {
      '--color-primary': '#ec4899',
      '--color-primary-dark': '#db2777',
      '--color-primary-light': '#f9a8d4',
      '--color-background': '#ffffff',
      '--color-surface': '#f8fafc',
      '--color-text-primary': '#1e293b',
      '--color-text-secondary': '#64748b',
      '--color-border': '#e2e8f0',
      '--color-accent': '#0ea5e9',
      '--color-success': '#10b981',
      '--color-warning': '#f59e0b',
      '--color-error': '#ef4444',
      '--shadow-default': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      '--shadow-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    name: 'Oscuro',
    class: 'theme-dark',
    variables: {
      '--color-primary': '#ec4899',
      '--color-primary-dark': '#db2777',
      '--color-primary-light': '#f9a8d4',
      '--color-background': '#0f172a',
      '--color-surface': '#1e293b',
      '--color-text-primary': '#f1f5f9',
      '--color-text-secondary': '#94a3b8',
      '--color-border': '#334155',
      '--color-accent': '#0ea5e9',
      '--color-success': '#10b981',
      '--color-warning': '#f59e0b',
      '--color-error': '#ef4444',
      '--shadow-default': '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
      '--shadow-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.4)'
    }
  },
  ocean: {
    name: 'Océano',
    class: 'theme-ocean',
    variables: {
      '--color-primary': '#0ea5e9',
      '--color-primary-dark': '#0284c7',
      '--color-primary-light': '#7dd3fc',
      '--color-background': '#0c4a6e',
      '--color-surface': '#0369a1',
      '--color-text-primary': '#e0f2fe',
      '--color-text-secondary': '#bae6fd',
      '--color-border': '#0284c7',
      '--color-accent': '#f97316',
      '--color-success': '#10b981',
      '--color-warning': '#fbbf24',
      '--color-error': '#f87171',
      '--shadow-default': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      '--shadow-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
    }
  },
  dracula: {
    name: 'Drácula',
    class: 'theme-dracula',
    variables: {
      '--color-primary': '#bd93f9',
      '--color-primary-dark': '#a077f7',
      '--color-primary-light': '#d6c1fa',
      '--color-background': '#282a36',
      '--color-surface': '#44475a',
      '--color-text-primary': '#f8f8f2',
      '--color-text-secondary': '#6272a4',
      '--color-border': '#44475a',
      '--color-accent': '#ff79c6',
      '--color-success': '#50fa7b',
      '--color-warning': '#ffb86c',
      '--color-error': '#ff5555',
      '--shadow-default': '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
      '--shadow-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.6)'
    }
  },
  forest: {
    name: 'Bosque',
    class: 'theme-forest',
    variables: {
      '--color-primary': '#10b981',
      '--color-primary-dark': '#059669',
      '--color-primary-light': '#6ee7b7',
      '--color-background': '#064e3b',
      '--color-surface': '#047857',
      '--color-text-primary': '#d1fae5',
      '--color-text-secondary': '#6ee7b7',
      '--color-border': '#059669',
      '--color-accent': '#fbbf24',
      '--color-success': '#34d399',
      '--color-warning': '#fbbf24',
      '--color-error': '#f87171',
      '--shadow-default': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      '--shadow-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
    }
  }
}

export const DEFAULT_THEME = 'light'
export const THEME_STORAGE_KEY = 'floresya-theme-preference'
```

### 1.2 Crear el gestor de temas

`/public/js/themes/themeManager.js`

```javascript
import { themes, DEFAULT_THEME, THEME_STORAGE_KEY } from './themeDefinitions.js'

/**
 * Theme Manager - Gestiona los temas de la aplicación
 */
export class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || DEFAULT_THEME
    this.init()
  }

  /**
   * Inicializa el sistema de temas
   */
  init() {
    // Aplicar tema guardado o por defecto
    this.applyTheme(this.currentTheme)

    // Escuchar cambios en otras pestañas
    window.addEventListener('storage', e => {
      if (e.key === THEME_STORAGE_KEY) {
        this.applyTheme(e.newValue)
      }
    })
  }

  /**
   * Obtiene el tema guardado en localStorage
   * @returns {string|null} Nombre del tema guardado
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY)
    } catch (error) {
      console.warn('No se pudo leer el tema guardado:', error)
      return null
    }
  }

  /**
   * Guarda el tema en localStorage
   * @param {string} themeName - Nombre del tema a guardar
   */
  saveTheme(themeName) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeName)
    } catch (error) {
      console.warn('No se pudo guardar el tema:', error)
    }
  }

  /**
   * Aplica un tema específico a la aplicación
   * @param {string} themeName - Nombre del tema a aplicar
   */
  applyTheme(themeName) {
    const theme = themes[themeName] || themes[DEFAULT_THEME]

    if (!theme) {
      console.error(`Tema "${themeName}" no encontrado`)
      return
    }

    // Remover clases de temas anteriores
    Object.values(themes).forEach(t => {
      document.body.classList.remove(t.class)
    })

    // Aplicar clase del nuevo tema
    document.body.classList.add(theme.class)

    // Aplicar variables CSS del tema
    Object.entries(theme.variables).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value)
    })

    // Actualizar estado interno
    this.currentTheme = themeName

    // Disparar evento personalizado
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { theme: themeName, themeDefinition: theme }
      })
    )

    console.log(`✅ Tema aplicado: ${theme.name}`)
  }

  /**
   * Cambia al siguiente tema disponible
   */
  cycleTheme() {
    const themeNames = Object.keys(themes)
    const currentIndex = themeNames.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themeNames.length
    const nextTheme = themeNames[nextIndex]

    this.setTheme(nextTheme)
  }

  /**
   * Establece un tema específico
   * @param {string} themeName - Nombre del tema a establecer
   */
  setTheme(themeName) {
    if (!themes[themeName]) {
      console.error(`Tema "${themeName}" no disponible`)
      return
    }

    this.applyTheme(themeName)
    this.saveTheme(themeName)
  }

  /**
   * Obtiene el tema actual
   * @returns {string} Nombre del tema actual
   */
  getCurrentTheme() {
    return this.currentTheme
  }

  /**
   * Obtiene información del tema actual
   * @returns {Object} Definición del tema actual
   */
  getCurrentThemeDefinition() {
    return themes[this.currentTheme] || themes[DEFAULT_THEME]
  }

  /**
   * Obtiene lista de todos los temas disponibles
   * @returns {Array} Lista de temas disponibles
   */
  getAvailableThemes() {
    return Object.entries(themes).map(([key, theme]) => ({
      key,
      name: theme.name,
      class: theme.class
    }))
  }
}

// Instancia global del ThemeManager
export const themeManager = new ThemeManager()

export default themeManager
```

## Paso 2: Integrar el sistema de temas en la aplicación

### 2.1 Modificar el punto de entrada principal

`/public/index.js` (modificaciones)

```javascript
// Añadir después de otros imports
import { themeManager } from './js/themes/themeManager.js'

// Añadir en la función init() después de otras inicializaciones
function init() {
  try {
    // ... código existente ...

    // Inicializar el sistema de temas
    themeManager.init()
    console.log('✅ Theme manager initialized')

    // ... resto del código ...
  } catch (error) {
    console.error('❌ [index.js] Initialization failed:', error)
    throw error
  }
}
```

## Paso 3: Crear componente de selector de temas para la navbar

### 3.1 Crear el componente de selector de temas

`/public/js/components/themeSelector.js`

```javascript
import { themeManager } from '../themes/themeManager.js'
import { createIcons } from '../'

/**
 * Theme Selector Component - Selector de temas para la navbar
 */
export class ThemeSelector {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.isOpen = false
    this.init()
  }

  /**
   * Inicializa el selector de temas
   */
  init() {
    if (!this.container) {
      console.warn('ThemeSelector: Container not found')
      return
    }

    this.render()
    this.bindEvents()
    this.updateCurrentThemeDisplay()

    // Escuchar cambios de tema
    window.addEventListener('themeChanged', () => {
      this.updateCurrentThemeDisplay()
    })
  }

  /**
   * Renderiza el selector de temas
   */
  render() {
    this.container.innerHTML = `
      <div class="theme-selector relative">
        <button 
          id="theme-toggle-btn"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
          type="button"
          aria-label="Cambiar tema"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i data-lucide="palette" class="h-5 w-5 text-gray-600 dark:text-gray-300"></i>
        </button>
        
        <div 
          id="theme-dropdown"
          class="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 hidden z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="theme-toggle-btn"
        >
          <div class="py-1">
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Temas
            </div>
            
            ${themeManager
              .getAvailableThemes()
              .map(
                theme => `
              <button
                class="theme-option w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                type="button"
                role="menuitem"
                data-theme="${theme.key}"
              >
                <span>${theme.name}</span>
                <i data-lucide="check" class="h-4 w-4 text-pink-600 hidden theme-check"></i>
              </button>
            `
              )
              .join('')}
            
            <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            <button
              class="cycle-theme-option w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              type="button"
              role="menuitem"
            >
              <i data-lucide="refresh-ccw" class="h-4 w-4 mr-2"></i>
              <span>Cambiar automáticamente</span>
            </button>
          </div>
        </div>
      </div>
    `

    createIcons()
  }

  /**
   * Vincula los eventos del selector
   */
  bindEvents() {
    const toggleBtn = document.getElementById('theme-toggle-btn')
    const dropdown = document.getElementById('theme-dropdown')
    const themeOptions = document.querySelectorAll('.theme-option')
    const cycleBtn = document.querySelector('.cycle-theme-option')

    if (!toggleBtn || !dropdown) return

    // Toggle dropdown
    toggleBtn.addEventListener('click', e => {
      e.stopPropagation()
      this.toggleDropdown()
    })

    // Seleccionar tema
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const themeName = option.dataset.theme
        themeManager.setTheme(themeName)
        this.closeDropdown()
      })
    })

    // Ciclar temas
    if (cycleBtn) {
      cycleBtn.addEventListener('click', () => {
        themeManager.cycleTheme()
        this.closeDropdown()
      })
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', e => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown()
      }
    })

    // Cerrar con ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeDropdown()
      }
    })
  }

  /**
   * Alterna la visibilidad del dropdown
   */
  toggleDropdown() {
    const dropdown = document.getElementById('theme-dropdown')
    const toggleBtn = document.getElementById('theme-toggle-btn')

    if (!dropdown || !toggleBtn) return

    this.isOpen = !this.isOpen

    if (this.isOpen) {
      dropdown.classList.remove('hidden')
      toggleBtn.setAttribute('aria-expanded', 'true')
      this.updateCheckmarks()
    } else {
      dropdown.classList.add('hidden')
      toggleBtn.setAttribute('aria-expanded', 'false')
    }
  }

  /**
   * Cierra el dropdown
   */
  closeDropdown() {
    const dropdown = document.getElementById('theme-dropdown')
    const toggleBtn = document.getElementById('theme-toggle-btn')

    if (!dropdown || !toggleBtn) return

    dropdown.classList.add('hidden')
    toggleBtn.setAttribute('aria-expanded', 'false')
    this.isOpen = false
  }

  /**
   * Actualiza la visualización del tema actual
   */
  updateCurrentThemeDisplay() {
    const currentTheme = themeManager.getCurrentTheme()
    const themeOptions = document.querySelectorAll('.theme-option')

    // Actualizar checkmarks
    themeOptions.forEach(option => {
      const themeName = option.dataset.theme
      const checkIcon = option.querySelector('.theme-check')

      if (themeName === currentTheme) {
        option.classList.add('bg-gray-100', 'dark:bg-gray-700')
        if (checkIcon) checkIcon.classList.remove('hidden')
      } else {
        option.classList.remove('bg-gray-100', 'dark:bg-gray-700')
        if (checkIcon) checkIcon.classList.add('hidden')
      }
    })
  }

  /**
   * Actualiza los checkmarks de selección
   */
  updateCheckmarks() {
    const currentTheme = themeManager.getCurrentTheme()
    const themeOptions = document.querySelectorAll('.theme-option')

    themeOptions.forEach(option => {
      const themeName = option.dataset.theme
      const checkIcon = option.querySelector('.theme-check')

      if (checkIcon) {
        if (themeName === currentTheme) {
          checkIcon.classList.remove('hidden')
        } else {
          checkIcon.classList.add('hidden')
        }
      }
    })
  }
}

export default ThemeSelector
```

## Paso 4: Integrar el selector de temas en la navbar

### 4.1 Modificar la navbar existente

`/public/index.html` (modificaciones)

```html
<!-- En la sección de acciones de la navbar, añadir antes del botón de menú móvil -->
<div class="nav-actions">
  <!-- Añadir el contenedor del selector de temas -->
  <div id="theme-selector-container"></div>

  <!-- Resto del contenido existente -->
  <a href="/pages/cart.html" class="nav-icon" aria-label="Carrito de compras (0 productos)">
    <i data-lucide="shopping-cart" class="icon"></i>
    <span class="cart-badge" aria-label="0 productos">0</span>
  </a>
  <a href="#login" class="btn btn-login">Iniciar Sesión</a>
  <button
    class="mobile-menu-toggle"
    aria-label="Abrir menú móvil"
    aria-expanded="false"
    id="mobile-menu-btn"
  >
    <i data-lucide="menu" class="icon"></i>
  </button>
</div>
```

### 4.2 Inicializar el selector de temas

`/public/index.js` (añadir a la función init)

```javascript
// Añadir después de otras inicializaciones
import ThemeSelector from './js/components/themeSelector.js'

// En la función init()
function init() {
  try {
    // ... código existente ...

    // Inicializar selector de temas
    const themeSelectorContainer = document.getElementById('theme-selector-container')
    if (themeSelectorContainer) {
      new ThemeSelector('theme-selector-container')
      console.log('✅ Theme selector initialized')
    }

    // ... resto del código ...
  } catch (error) {
    console.error('❌ [index.js] Initialization failed:', error)
    throw error
  }
}
```

## Paso 5: Añadir estilos CSS para los temas

### 5.1 Actualizar los estilos base

`/public/css/input.css` (añadir al final del archivo)

```css
/* ==================== THEMING SYSTEM ==================== */

/* Variables CSS base - serán sobrescritas por los temas */
:root {
  /* Colores principales */
  --color-primary: #ec4899;
  --color-primary-dark: #db2777;
  --color-primary-light: #f9a8d4;

  /* Fondos */
  --color-background: #ffffff;
  --color-surface: #f8fafc;

  /* Textos */
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;

  /* Bordes */
  --color-border: #e2e8f0;

  /* Colores de estado */
  --color-accent: #0ea5e9;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Sombras */
  --shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  /* Transiciones */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Clases de temas - aplicadas al body */
.theme-light {
  /* El tema claro usa los valores base */
}

.theme-dark {
  --color-primary: #ec4899;
  --color-primary-dark: #db2777;
  --color-primary-light: #f9a8d4;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-accent: #0ea5e9;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}

.theme-ocean {
  --color-primary: #0ea5e9;
  --color-primary-dark: #0284c7;
  --color-primary-light: #7dd3fc;
  --color-background: #0c4a6e;
  --color-surface: #0369a1;
  --color-text-primary: #e0f2fe;
  --color-text-secondary: #bae6fd;
  --color-border: #0284c7;
  --color-accent: #f97316;
  --color-success: #10b981;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

.theme-dracula {
  --color-primary: #bd93f9;
  --color-primary-dark: #a077f7;
  --color-primary-light: #d6c1fa;
  --color-background: #282a36;
  --color-surface: #44475a;
  --color-text-primary: #f8f8f2;
  --color-text-secondary: #6272a4;
  --color-border: #44475a;
  --color-accent: #ff79c6;
  --color-success: #50fa7b;
  --color-warning: #ffb86c;
  --color-error: #ff5555;
  --shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.5);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.6);
}

.theme-forest {
  --color-primary: #10b981;
  --color-primary-dark: #059669;
  --color-primary-light: #6ee7b7;
  --color-background: #064e3b;
  --color-surface: #047857;
  --color-text-primary: #d1fae5;
  --color-text-secondary: #6ee7b7;
  --color-border: #059669;
  --color-accent: #fbbf24;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
  --shadow-default: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
  --shadow-hover: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

/* Aplicar colores a elementos según el tema */
body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  transition:
    background-color var(--transition-normal),
    color var(--transition-normal);
}

/* Navbar */
.navbar {
  background-color: var(--color-surface);
  box-shadow: var(--shadow-default);
}

.navbar-brand {
  color: var(--color-primary);
}

.nav-link {
  color: var(--color-text-secondary);
}

.nav-link:hover {
  color: var(--color-primary);
}

/* Botones */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-background);
}

/* Cards */
.bg-white {
  background-color: var(--color-surface);
}

.text-gray-900 {
  color: var(--color-text-primary);
}

.text-gray-600 {
  color: var(--color-text-secondary);
}

.border-gray-200 {
  border-color: var(--color-border);
}

.shadow-lg {
  box-shadow: var(--shadow-hover);
}

/* Inputs */
.border-gray-300 {
  border-color: var(--color-border);
}

.focus\:ring-pink-500:focus {
  --tw-ring-color: var(--color-primary);
}

.focus\:border-pink-500:focus {
  border-color: var(--color-primary);
}

/* Dropdowns */
.bg-white.dark\:bg-gray-800 {
  background-color: var(--color-surface);
}

.text-gray-700.dark\:text-gray-300 {
  color: var(--color-text-primary);
}

.hover\:bg-gray-100.dark\:hover\:bg-gray-700:hover {
  background-color: var(--color-background);
}

.border-gray-200.dark\:border-gray-700 {
  border-color: var(--color-border);
}

/* Otros elementos que necesiten adaptarse al tema */
```

## Paso 6: Probar y validar la implementación

### 6.1 Verificar que todos los componentes funcionen correctamente

1. Ejecutar la aplicación: `npm run dev`
2. Abrir en el navegador: `http://localhost:3000`
3. Verificar que el ícono de paleta aparezca en la navbar
4. Hacer clic en el ícono y probar cambiar entre temas
5. Verificar que el tema se mantenga después de recargar la página
6. Verificar que funcione en diferentes dispositivos/resoluciones

### 6.2 Validar la persistencia del tema

1. Cambiar a un tema diferente (por ejemplo, "Oscuro")
2. Recargar la página
3. Verificar que se mantenga el tema seleccionado
4. Abrir otra pestaña del mismo sitio
5. Verificar que ambas pestañas sincronicen el tema

### 6.3 Probar la funcionalidad de ciclado automático

1. Hacer clic en "Cambiar automáticamente"
2. Verificar que cambie al siguiente tema disponible
3. Repetir varias veces para asegurar que cicla correctamente

## Paso 7: Documentar y limpiar

### 7.1 Actualizar documentación técnica

- Añadir documentación sobre el sistema de temas en README.md
- Documentar las variables CSS utilizadas
- Explicar cómo añadir nuevos temas

### 7.2 Optimizar rendimiento

- Verificar que no haya flickering al cargar temas
- Asegurar transiciones suaves entre temas
- Validar compatibilidad con todos los navegadores soportados

Este plan atómico proporciona una implementación completa y escalable del sistema de temas dinámicos para la aplicación FloresYa, siguiendo las mejores prácticas de desarrollo frontend y manteniendo la coherencia con la arquitectura existente.
