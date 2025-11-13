/**
 * FloresYa - Carga de Fuentes Optimizada
 * Implementación de fuentes con enfoque en rendimiento y accesibilidad
 * Similar a las estrategias usadas por YouTube, Google, GitHub
 */

// Cargar fuentes críticas de forma asincrónica
export function loadCriticalFonts() {
  // Cargar Inter Font (similar a YouTube/Sistema Google)
  const loadInterFont = () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    link.media = 'print' // Carga inicial como media="print" para no bloquear
    link.onload = () => {
      link.media = 'all'
    } // Cambia a media="all" cuando carga
    document.head.appendChild(link)
  }

  // Cargar Fira Code para código
  const loadFiraCode = () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap'
    link.media = 'print'
    link.onload = () => {
      link.media = 'all'
    }
    document.head.appendChild(link)
  }

  // Preload para mejorar rendimiento
  const preloadCriticalFonts = () => {
    const preloadLink = document.createElement('link')
    preloadLink.rel = 'preload'
    preloadLink.as = 'font'
    preloadLink.href =
      'https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMmhCelef.woff2'
    preloadLink.type = 'font/woff2'
    preloadLink.crossOrigin = 'anonymous'
    document.head.appendChild(preloadLink)
  }

  // Ejecutar carga de fuentes
  preloadCriticalFonts()
  loadInterFont()
  loadFiraCode()

  console.log('✅ Fuentes críticas iniciadas para carga asincrónica')
}

// Carga de fuentes con fallback al sistema
export function initializeSystemFonts() {
  // Asegurar que sistema de fuentes esté optimizado
  const style = document.createElement('style')
  style.textContent = `
    /* Optimización de fuentes del sistema */
    html {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }
    
    /* Font Display Optimizado */
    @font-face {
      font-family: 'InterFallback';
      src: local('Inter'), local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto');
      font-display: swap;
    }
    
    /* Estilos típicos de YouTube para texto */
    body, p, div, span, a {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: "liga" 1, "calt" 1;
    }
  `
  document.head.appendChild(style)
}

// Función para verificar si una fuente está disponible
export function isFontAvailable(fontFamily) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const baseline = 'MiykftuZ'
    const testFont = 'Arial'
    const comparisonWidth = ctx.measureText(baseline).width

    // Establecer la fuente a probar
    ctx.font = `40px "${fontFamily}", ${testFont}`
    const newWidth = ctx.measureText(baseline).width

    // Resolver verdadero si el ancho cambió, indicando que la fuente está disponible
    resolve(newWidth !== comparisonWidth)
  })
}

// Esperar a que las fuentes estén listas
export function waitForFonts(fontFamily = 'Inter') {
  return new Promise((resolve, reject) => {
    let attempts = 0
    const maxAttempts = 20 // 2 segundos

    const checkFont = async () => {
      attempts++
      const isAvailable = await isFontAvailable(fontFamily)

      if (isAvailable) {
        console.log(`✅ Fuente ${fontFamily} disponible`)
        resolve(true)
      } else if (attempts < maxAttempts) {
        setTimeout(checkFont, 100) // Reintentar cada 100ms
      } else {
        console.warn(`⚠️ Fuente ${fontFamily} no disponible después de ${maxAttempts} intentos`)
        resolve(false)
      }
    }

    setTimeout(reject, 5000) // Timeout de 5 segundos
    checkFont()
  })
}

// Función para aplicar tipografía optimizada al DOM
export function applyOptimizedTypography() {
  try {
    // Asegurar que las variables CSS de tipografía estén disponibles
    const root = document.documentElement

    // Aplicar fuentes base optimizadas
    root.style.setProperty(
      '--font-primary',
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', system-ui, sans-serif"
    )
    root.style.setProperty(
      '--font-secondary',
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, system-ui, sans-serif"
    )
    root.style.setProperty(
      '--font-body',
      "'Inter', -apple-system, system-ui, 'Segoe UI', sans-serif"
    )
    root.style.setProperty(
      '--font-display',
      "'Inter', -apple-system, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif"
    )
    root.style.setProperty(
      '--font-heading',
      "'Inter', -apple-system, 'SF Pro Display', 'Roboto', sans-serif"
    )
    root.style.setProperty(
      '--font-monospace',
      "'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', 'Ubuntu Mono', 'Courier New', monospace"
    )

    console.log('✅ Tipografía optimizada aplicada al DOM')
  } catch (error) {
    console.error('❌ Error aplicando tipografía optimizada:', error)
  }
}

// Inicializar sistema de fuentes cuando el DOM esté listo
if (typeof window !== 'undefined' && window.document) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeSystemFonts()
      loadCriticalFonts()
      applyOptimizedTypography()
    })
  } else {
    initializeSystemFonts()
    loadCriticalFonts()
    applyOptimizedTypography()
  }
}

// Export para uso en módulos
export default {
  loadCriticalFonts,
  initializeSystemFonts,
  isFontAvailable,
  waitForFonts,
  applyOptimizedTypography
}
