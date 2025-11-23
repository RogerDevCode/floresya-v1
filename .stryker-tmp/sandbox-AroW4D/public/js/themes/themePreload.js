/**
 * FloresYa - Theme Preload
 * Evita Flash of Unstyled Content (FOUC)
 * Se ejecuta ANTES de que el DOM cargue completamente
 * Este archivo NO es un módulo ES6 - se ejecuta inmediatamente
 */
// @ts-nocheck

;(function () {
  const THEME_STORAGE_KEY = 'floresya-theme-preference'
  const DEFAULT_THEME = 'light'

  // Leer tema guardado
  let savedTheme = DEFAULT_THEME
  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME
  } catch (error) {
    console.warn('⚠️ [ThemePreload] Could not read saved theme:', error)
  }

  // Aplicar data-theme inmediatamente
  document.documentElement.setAttribute('data-theme', savedTheme)

  console.log('⚡ [ThemePreload] Applied theme:', savedTheme)
})()
