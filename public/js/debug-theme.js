/**
 * FloresYa - Theme Debug Script
 * Herramienta de diagnóstico para el sistema de temas
 * Se ejecuta en producción para identificar problemas
 */

;(function () {
  'use strict'

  console.group('🎨 [Theme Debug] Starting diagnosis...')

  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    themeSystem: {
      preload: null,
      manager: null,
      selector: null,
      container: null
    },
    dom: {
      ready: document.readyState,
      containerExists: false,
      containerVisible: false,
      containerPosition: null
    },
    dependencies: {
      themeManager: false,
      themeSelector: false,
      lucideIcons: false,
      domReady: false
    },
    errors: [],
    warnings: []
  }

  // Check DOM readiness
  function checkDOMState() {
    debugInfo.dom.ready = document.readyState
    debugInfo.dom.containerExists = !!document.getElementById('theme-selector-container')

    if (debugInfo.dom.containerExists) {
      const container = document.getElementById('theme-selector-container')
      debugInfo.dom.containerVisible = container.offsetParent !== null
      const rect = container.getBoundingClientRect()
      debugInfo.dom.containerPosition = {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        visible: rect.width > 0 && rect.height > 0
      }
    }
  }

  // Check dependencies
  function checkDependencies() {
    // Check themeManager
    debugInfo.dependencies.themeManager = typeof window.themeManager !== 'undefined'
    if (debugInfo.dependencies.themeManager) {
      try {
        debugInfo.themeSystem.manager = {
          currentTheme: window.themeManager.getCurrentTheme(),
          availableThemes: window.themeManager.getAvailableThemes().length,
          hasStyleElement: !!document.getElementById('theme-dynamic-styles')
        }
      } catch (error) {
        debugInfo.errors.push(`themeManager error: ${error.message}`)
      }
    } else {
      debugInfo.errors.push('themeManager is not available')
    }

    // Check ThemeSelector class
    debugInfo.dependencies.themeSelector = typeof window.ThemeSelector !== 'undefined'

    // Check lucide icons
    debugInfo.dependencies.lucideIcons = typeof window.createIcons !== 'undefined'

    // Check domReady utility
    debugInfo.dependencies.domReady = typeof window.onDOMReady !== 'undefined'
  }

  // Check theme preload
  function checkThemePreload() {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    debugInfo.themeSystem.preload = {
      currentAttribute: currentTheme,
      localStorageTheme: null,
      hasPreloadScript: !!document.querySelector('script[src*="themePreload"]')
    }

    try {
      debugInfo.themeSystem.preload.localStorageTheme = localStorage.getItem(
        'floresya-theme-preference'
      )
    } catch (error) {
      debugInfo.warnings.push(`Could not read localStorage: ${error.message}`)
    }
  }

  // Check script loading order
  function checkScriptOrder() {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const themeScripts = scripts.filter(
      script =>
        script.src.includes('theme') ||
        script.src.includes('ThemeSelector') ||
        script.src.includes('themeManager')
    )

    debugInfo.scriptOrder = themeScripts.map(script => ({
      src: script.src.split('/').pop(),
      loaded: script.complete || script.readyState === 'complete',
      async: script.async,
      defer: script.defer
    }))

    // Check if scripts are in correct order
    const preloadIndex = themeScripts.findIndex(s => s.src.includes('themePreload'))
    const managerIndex = themeScripts.findIndex(s => s.src.includes('themeManager'))
    const selectorIndex = themeScripts.findIndex(s => s.src.includes('ThemeSelector'))

    if (preloadIndex > -1 && managerIndex > -1 && selectorIndex > -1) {
      if (preloadIndex > managerIndex || managerIndex > selectorIndex) {
        debugInfo.warnings.push('Scripts may be loaded in wrong order')
      }
    }
  }

  // Check for CSS conflicts
  function checkCSSConflicts() {
    const container = document.getElementById('theme-selector-container')
    if (container) {
      const computedStyle = window.getComputedStyle(container)
      debugInfo.css = {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        zIndex: computedStyle.zIndex,
        position: computedStyle.position
      }

      if (computedStyle.display === 'none') {
        debugInfo.warnings.push('Container has display: none')
      }
      if (computedStyle.visibility === 'hidden') {
        debugInfo.warnings.push('Container has visibility: hidden')
      }
      if (computedStyle.opacity === '0') {
        debugInfo.warnings.push('Container has opacity: 0')
      }
    }
  }

  // Check for JavaScript errors
  function checkJSErrors() {
    // Override console.error temporarily to catch errors
    const originalError = console.error
    const errors = []

    console.error = function (...args) {
      errors.push(args.join(' '))
      originalError.apply(console, args)
    }

    // Try to initialize theme system
    setTimeout(() => {
      try {
        if (window.themeManager && !window.themeSelectorInstance) {
          if (window.ThemeSelector) {
            new window.ThemeSelector('theme-selector-container')
          }
        }
      } catch (error) {
        errors.push(`ThemeSelector initialization error: ${error.message}`)
      }

      // Restore console.error
      console.error = originalError

      if (errors.length > 0) {
        debugInfo.jsErrors = errors
      }
    }, 100)
  }

  // Generate recommendations
  function generateRecommendations() {
    const recommendations = []

    if (!debugInfo.dom.containerExists) {
      recommendations.push({
        priority: 'high',
        issue: 'Theme selector container not found',
        solution: 'Ensure #theme-selector-container exists in the DOM or is created dynamically'
      })
    }

    if (!debugInfo.dependencies.themeManager) {
      recommendations.push({
        priority: 'high',
        issue: 'themeManager not loaded',
        solution: 'Ensure themeManager.js is loaded before ThemeSelector.js'
      })
    }

    if (!debugInfo.dependencies.lucideIcons) {
      recommendations.push({
        priority: 'medium',
        issue: 'lucide-icons not loaded',
        solution: 'Ensure lucide-icons.js is loaded before ThemeSelector.js'
      })
    }

    if (debugInfo.dom.containerExists && !debugInfo.dom.containerVisible) {
      recommendations.push({
        priority: 'high',
        issue: 'Container exists but is not visible',
        solution: 'Check CSS styles (display, visibility, opacity, position)'
      })
    }

    if (debugInfo.scriptOrder && debugInfo.scriptOrder.length === 0) {
      recommendations.push({
        priority: 'high',
        issue: 'No theme-related scripts found',
        solution: 'Ensure all theme scripts are properly included in the HTML'
      })
    }

    return recommendations
  }

  // Run all checks
  function runDiagnosis() {
    checkDOMState()
    checkDependencies()
    checkThemePreload()
    checkScriptOrder()
    checkCSSConflicts()
    checkJSErrors()

    setTimeout(() => {
      debugInfo.recommendations = generateRecommendations()

      console.group('🎨 [Theme Debug] Diagnosis Results')
      console.log('Debug Info:', debugInfo)

      if (debugInfo.errors.length > 0) {
        console.error('Errors found:', debugInfo.errors)
      }

      if (debugInfo.warnings.length > 0) {
        console.warn('Warnings found:', debugInfo.warnings)
      }

      if (debugInfo.recommendations.length > 0) {
        console.log('Recommendations:', debugInfo.recommendations)
      }

      // Create visual indicator in production
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        createDebugIndicator()
      }

      console.groupEnd()

      // Store results for later reference
      try {
        sessionStorage.setItem('theme-debug-results', JSON.stringify(debugInfo))
      } catch (error) {
        console.warn('Could not store debug results in sessionStorage:', error)
      }
    }, 200)
  }

  // Create visual debug indicator
  function createDebugIndicator() {
    const indicator = document.createElement('div')
    indicator.id = 'theme-debug-indicator'
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: monospace;
      z-index: 9999;
      cursor: pointer;
    `

    const status =
      debugInfo.errors.length > 0 ? 'ERROR' : debugInfo.warnings.length > 0 ? 'WARN' : 'OK'
    const color = status === 'ERROR' ? '#ff4444' : status === 'WARN' ? '#ffaa00' : '#44ff44'

    indicator.style.backgroundColor = color
    indicator.textContent = `Theme Debug: ${status}`

    indicator.addEventListener('click', () => {
      console.clear()
      console.group('🎨 [Theme Debug] Detailed Results')
      console.log('Full debug info:', debugInfo)
      console.groupEnd()
    })

    document.body.appendChild(indicator)

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator)
      }
    }, 10000)
  }

  // Auto-fix common issues
  function attemptAutoFix() {
    try {
      // Try to create container if it doesn't exist
      if (!debugInfo.dom.containerExists) {
        const navActions = document.querySelector('.nav-actions')
        if (navActions) {
          const container = document.createElement('div')
          container.id = 'theme-selector-container'
          container.className = 'theme-selector-wrapper'

          const cartIcon = navActions.querySelector('a[href*="cart"]')
          if (cartIcon) {
            navActions.insertBefore(container, cartIcon)
          } else {
            navActions.appendChild(container)
          }

          debugInfo.warnings.push('Auto-created theme selector container')
        }
      }
    } catch (error) {
      debugInfo.errors.push(`Auto-fix failed: ${error.message}`)
    }
  }

  // Initialize debug system
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnosis)
  } else {
    runDiagnosis()
  }

  // Expose debug functions globally
  window.themeDebug = {
    getInfo: () => debugInfo,
    runDiagnosis,
    attemptAutoFix,
    createDebugIndicator
  }
})()
