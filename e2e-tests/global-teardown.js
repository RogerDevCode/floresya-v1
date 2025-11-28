/**
 * Global Teardown para Playwright Tests
 * Limpia el ambiente después de todos los tests
 */

async function globalTeardown(config) {
  console.log('🧹 [GlobalTeardown] Iniciando limpieza global...')

  const startTime = Date.now()

  try {
    // 1. Detener servidor de desarrollo si se inició desde aquí
    if (global.devServerProcess) {
      console.log('🛑 [GlobalTeardown] Deteniendo servidor de desarrollo...')
      global.devServerProcess.kill('SIGTERM')

      // Esperar un poco para que el proceso termine
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // 2. Limpiar procesos residuales
    console.log('🧹 [GlobalTeardown] Limpiando procesos residuales...')
    await cleanupResidualProcesses()

    // 3. Generar reporte de resumen si es necesario
    if (process.env.GENERATE_SUMMARY_REPORT === 'true') {
      console.log('📊 [GlobalTeardown] Generando reporte de resumen...')
      await generateSummaryReport(config)
    }

    // 4. Limpiar archivos temporales si están en CI
    if (process.env.CI === 'true') {
      console.log('🧹 [GlobalTeardown] Limpiando archivos temporales de CI...')
      await cleanupCITemporaryFiles()
    }

    // 5. Liberar recursos
    console.log('🗑️ [GlobalTeardown] Liberando recursos...')
    await releaseResources()

    const teardownTime = Date.now() - startTime
    console.log(`✅ [GlobalTeardown] Limpieza completada en ${teardownTime}ms`)
  } catch (error) {
    console.error('❌ [GlobalTeardown] Error en limpieza global:', error)
  }
}

/**
 * Limpia procesos residuales de testing
 */
function cleanupResidualProcesses() {
  try {
    const { exec } = require('child_process')
    const os = require('os')

    return new Promise(resolve => {
      const platform = os.platform()
      let command = ''

      if (platform === 'darwin') {
        command = 'pkill -f "chromium|google-chrome|playwright"'
      } else if (platform === 'linux') {
        command = 'pkill -f chromium || pkill -f google-chrome || pkill -f playwright'
      } else if (platform === 'win32') {
        command = 'taskkill /F /IM chromium.exe 2>NUL || taskkill /F /IM chrome.exe 2>NUL'
      }

      if (command) {
        exec(command, error => {
          if (error) {
            console.log('⚠️ No se encontraron procesos para limpiar')
          } else {
            console.log('🧹 Procesos de testing limpiados')
          }
          resolve()
        })
      } else {
        resolve()
      }
    })
  } catch (error) {
    console.warn('⚠️ [GlobalTeardown] Error limpiando procesos:', error.message)
  }
}

/**
 * Genera reporte de resumen de ejecución
 */
function generateSummaryReport(config) {
  try {
    const fs = require('fs')
    const path = require('path')

    // Leer resultados de tests si existen
    const resultsPath = path.join(config.configDir, 'e2e-test-results', 'results.json')

    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))

      const summary = {
        timestamp: new Date().toISOString(),
        total: results.suites?.reduce((sum, suite) => sum + (suite.specs?.length || 0), 0) || 0,
        passed:
          results.suites?.reduce(
            (sum, suite) => sum + (suite.specs?.filter(spec => spec.ok === true)?.length || 0),
            0
          ) || 0,
        failed:
          results.suites?.reduce(
            (sum, suite) => sum + (suite.specs?.filter(spec => spec.ok === false)?.length || 0),
            0
          ) || 0,
        skipped:
          results.suites?.reduce(
            (sum, suite) => sum + (suite.specs?.filter(spec => spec.ok === null)?.length || 0),
            0
          ) || 0,
        duration:
          results.suites?.reduce(
            (sum, suite) =>
              sum +
              (suite.specs?.reduce((specSum, spec) => specSum + (spec.duration || 0), 0) || 0),
            0
          ) || 0
      }

      const summaryPath = path.join(config.configDir, 'e2e-test-results', 'summary.json')
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8')

      console.log('📊 Reporte de resumen generado')
    }
  } catch (error) {
    console.warn('⚠️ [GlobalTeardown] Error generando reporte:', error.message)
  }
}

/**
 * Limpia archivos temporales de CI
 */
function cleanupCITemporaryFiles() {
  try {
    const fs = require('fs')
    const path = require('path')

    const tempDirs = [
      path.join(process.env.TEMP || '/tmp', 'playwright*'),
      path.join(process.env.HOME || process.env.USERPROFILE, '.cache', 'ms-playwright*'),
      path.join(process.cwd(), 'test-results'),
      path.join(process.cwd(), 'coverage')
    ]

    for (const dir of tempDirs) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 })
          console.log(`🧹 Directorio temporal limpiado: ${dir}`)
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo limpiar ${dir}:`, error.message)
      }
    }
  } catch (error) {
    console.warn('⚠️ [GlobalTeardown] Error en limpieza de CI:', error.message)
  }
}

/**
 * Libera recursos del sistema
 */
function releaseResources() {
  try {
    // Forzar garbage collection si está disponible
    if (global.gc) {
      console.log('🗑️ Ejecutando garbage collection...')
      global.gc()
    }

    // Limpiar variables globales
    delete global.devServerProcess
    delete global.testResults

    // Limpiar módulos cacheados si estamos en modo de test
    if (process.env.NODE_ENV === 'test') {
      const modules = Object.keys(require.cache)
      for (const module of modules) {
        if (module.includes('node_modules')) {
          continue
        }
        delete require.cache[module]
      }
      console.log('🗑️ Módulos cacheados liberados')
    }
  } catch (error) {
    console.warn('⚠️ [GlobalTeardown] Error liberando recursos:', error.message)
  }
}

module.exports = globalTeardown
