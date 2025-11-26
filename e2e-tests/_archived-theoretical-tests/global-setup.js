/**
 * Global Setup for Playwright Tests
 * Configura el ambiente de testing para todas las suites
 */

const { chromium } = require('@playwright/test')
const path = require('path')

async function globalSetup(config) {
  console.log('🚀 [GlobalSetup] Iniciando configuración global de tests E2E')

  const startTime = Date.now()

  try {
    // 1. Configurar variables de entorno para testing
    process.env.NODE_ENV = 'test'
    process.env.PLAYWRIGHT_TESTING = 'true'
    process.env.TEST_MEMORY_LIMIT = '512MB'
    process.env.TEST_BROWSER = 'chrome'

    // 2. Limpiar cualquier estado residual de tests anteriores
    console.log('🧹 [GlobalSetup] Limpiando estado residual...')
    await cleanupTestEnvironment()

    // 3. Inicializar base de datos de testing si es necesario
    console.log('📊 [GlobalSetup] Configurando fixtures de testing...')
    await setupTestFixtures()

    // 4. Iniciar servidor de desarrollo si no está corriendo
    console.log('🌐 [GlobalSetup] Verificando servidor de desarrollo...')
    await ensureDevServer()

    // 5. Configurar directorio de screenshots y traces
    console.log('📸 [GlobalSetup] Configurando directorios de salida...')
    await setupOutputDirectories(config)

    // 6. Verificar permisos y configuración del sistema
    console.log('🔍 [GlobalSetup] Verificando configuración del sistema...')
    await verifySystemConfiguration()

    const setupTime = Date.now() - startTime
    console.log(`✅ [GlobalSetup] Configuración completada en ${setupTime}ms`)
  } catch (error) {
    console.error('❌ [GlobalSetup] Error en configuración global:', error)
    throw error
  }
}

/**
 * Limpia el ambiente de testing
 */
async function cleanupTestEnvironment() {
  try {
    // Limpiar directorio de resultados de tests
    const fs = require('fs')
    const path = require('path')
    const resultsDir = path.join(__dirname, '..', 'e2e-test-results')

    if (fs.existsSync(resultsDir)) {
      fs.rmSync(resultsDir, { recursive: true, force: true })
      console.log('🧹 Directorio de resultados limpiado')
    }

    // Limpiar localStorage y sessionStorage por si acaso
    // Esto se hará por cada test individualmente, pero aseguramos limpieza inicial
  } catch (error) {
    console.warn('⚠️ [GlobalSetup] Error en limpieza:', error.message)
  }
}

/**
 * Configura fixtures para testing
 */
async function setupTestFixtures() {
  try {
    const fs = require('fs')
    const path = require('path')

    // Crear directorio de fixtures si no existe
    const fixturesDir = path.join(__dirname, 'fixtures')
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true })
      console.log('📁 Directorio de fixtures creado')
    }

    // Crear fixtures estándar
    const fixtures = {
      'empty-cart.json': JSON.stringify({ items: [], total: 0 }),
      'cart-with-items.json': JSON.stringify({
        items: [
          {
            id: 1,
            name: 'Ramo de Rosas Premium',
            price_usd: 89.99,
            quantity: 1,
            image_thumb: '/images/products/rosas-premium-thumb.jpg'
          }
        ],
        total: 89.99
      }),
      'theme-data.json': JSON.stringify({
        currentTheme: 'default',
        availableThemes: ['default', 'theme-1', 'theme-2', 'theme-3', 'theme-4'],
        customColors: ['#ec4899', '#10b981', '#f59e0b', '#3b82f6']
      }),
      'user-settings.json': JSON.stringify({
        preferences: {
          currency: 'VES',
          language: 'es',
          notifications: true,
          darkMode: false
        }
      })
    }

    // Guardar fixtures
    for (const [filename, content] of Object.entries(fixtures)) {
      const filePath = path.join(fixturesDir, filename)
      fs.writeFileSync(filePath, content, 'utf8')
    }

    console.log('📦 Fixtures configurados')
  } catch (error) {
    console.warn('⚠️ [GlobalSetup] Error configurando fixtures:', error.message)
  }
}

/**
 * Asegura que el servidor de desarrollo esté corriendo
 */
async function ensureDevServer() {
  try {
    const { exec } = require('child_process')

    return new Promise((resolve, reject) => {
      const serverProcess = exec('npm run dev', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error iniciando servidor de desarrollo:', error)
          reject(error)
          return
        }

        console.log('🌐 Servidor de desarrollo iniciado')
        resolve(stdout)
      })

      // Guardar referencia del proceso para poder detenerlo después
      global.devServerProcess = serverProcess

      // Esperar un poco para que el servidor inicie
      setTimeout(() => {
        console.log('⏳ Esperando que el servidor esté disponible...')
        resolve()
      }, 3000)
    })
  } catch (error) {
    console.warn('⚠️ [GlobalSetup] Error verificando servidor:', error.message)
  }
}

/**
 * Configura directorios de salida para tests
 */
async function setupOutputDirectories(config) {
  try {
    const fs = require('fs')
    const path = require('path')

    // Directorio para screenshots
    const screenshotsDir = path.join(__dirname, '..', 'e2e-test-results', 'screenshots')
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true })
    }

    // Directorio para traces
    const tracesDir = path.join(__dirname, '..', 'e2e-test-results', 'traces')
    if (!fs.existsSync(tracesDir)) {
      fs.mkdirSync(tracesDir, { recursive: true })
    }

    // Directorio para videos
    const videosDir = path.join(__dirname, '..', 'e2e-test-results', 'videos')
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
    }

    console.log('📂 Directorios de salida configurados')
  } catch (error) {
    console.warn('⚠️ [GlobalSetup] Error configurando directorios:', error.message)
  }
}

/**
 * Verifica la configuración del sistema
 */
async function verifySystemConfiguration() {
  try {
    const os = require('os')
    const { exec } = require('child_process')

    // Verificar memoria disponible
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsagePercent = (usedMemory / totalMemory) * 100

    console.log(`💾 Memoria del sistema: ${memoryUsagePercent.toFixed(1)}% usada`)

    if (memoryUsagePercent > 80) {
      console.warn('⚠️ [GlobalSetup] Uso de memoria elevado, los tests podrían ser más lentos')
    }

    // Verificar espacio en disco
    const stats = await new Promise(resolve => {
      exec('df -h .', (error, stdout) => {
        if (error) {
          resolve(null)
          return
        }
        const lines = stdout.split('\n')
        const line = lines.find(l => l.includes('/dev/'))
        if (line) {
          const parts = line.trim().split(/\s+/)
          const used = parts[2]
          const available = parts[3]
          resolve({ used, available })
        } else {
          resolve(null)
        }
      })
    })

    if (stats) {
      console.log(`💾 Espacio en disco: ${stats.used} usado, ${stats.available} disponible`)
    }

    // Verificar Chrome/Chromium disponible
    try {
      const chromeVersion = await new Promise(resolve => {
        exec('google-chrome --version', (error, stdout) => {
          if (error) {
            exec('chromium-browser --version', (error, stdout) => {
              if (error) {
                resolve('Not found')
              } else {
                resolve(stdout.trim())
              }
            })
          } else {
            resolve(stdout.trim())
          }
        })
      })

      console.log(`🌐 Chrome/Chromium: ${chromeVersion}`)
    } catch (error) {
      console.warn('⚠️ [GlobalSetup] No se pudo verificar Chrome:', error.message)
    }
  } catch (error) {
    console.warn('⚠️ [GlobalSetup] Error verificando configuración:', error.message)
  }
}

module.exports = globalSetup
