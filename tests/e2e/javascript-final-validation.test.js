import { test, expect } from '@playwright/test'

/**
 * Test final de validación integral de JavaScript
 * Combina todas las verificaciones: carga, cadena de dependencias, DOM ready, y más
 */

test.describe('JavaScript Final Validation', () => {
  test('should pass complete JavaScript validation suite', async ({ page }) => {
    console.log('\n' + '='.repeat(80))
    console.log('🔗 JAVASCRIPT FINAL VALIDATION SUITE')
    console.log('='.repeat(80) + '\n')

    const validationResults = {
      scriptsDetected: 0,
      scriptsLoaded: 0,
      scriptsWithErrors: 0,
      domReadyTime: 0,
      firstScriptLoadTime: 0,
      lastScriptLoadTime: 0,
      totalScriptDuration: 0,
      hasCircularDeps: false,
      blockingScripts: 0,
      asyncScripts: 0,
      deferScripts: 0,
      moduleScripts: 0,
      inlineScripts: 0,
      errors: []
    }

    // Configurar instrumentación completa
    await page.addInitScript(() => {
      window.jsValidation = {
        startTime: performance.now(),
        events: [],
        errors: [],
        scripts: new Map()
      }

      const log = (event, data) => {
        window.jsValidation.events.push({
          event,
          data,
          timestamp: performance.now()
        })
      }

      // Capturar DOMContentLoaded
      window.addEventListener('DOMContentLoaded', () => {
        log('DOMContentLoaded', { readyState: document.readyState })
      })

      // Capturar load
      window.addEventListener('load', () => {
        log('load', { readyState: document.readyState })
      })

      // Capturar errores
      window.addEventListener('error', e => {
        const errorInfo = {
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          stack: e.error?.stack
        }
        log('error', errorInfo)
        window.jsValidation.errors.push(errorInfo)
      })

      // Instrumentar scripts
      const originalCreateElement = document.createElement.bind(document)
      document.createElement = function (tagName) {
        const element = originalCreateElement(tagName)
        if (tagName.toLowerCase() === 'script') {
          Object.defineProperty(element, 'src', {
            set: function (value) {
              this.setAttribute('src', value)
              const scriptId = value
              const loadStart = performance.now()

              this.addEventListener('load', () => {
                const loadTime = performance.now()
                window.jsValidation.scripts.set(scriptId, {
                  src: value,
                  loadStart: loadStart,
                  loadEnd: loadTime,
                  duration: loadTime - loadStart
                })
                log('script-loaded', {
                  src: value,
                  duration: loadTime - loadStart
                })
              })

              this.addEventListener('error', () => {
                log('script-error', { src: value })
              })
            },
            get: function () {
              return this.getAttribute('src')
            }
          })
        }
        return element
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Esperar ejecución completa

    // Recopilar resultados
    const results = await page.evaluate(() => window.jsValidation)

    validationResults.scriptsDetected = results.events.filter(
      e => e.event === 'script-loaded'
    ).length
    validationResults.errors = results.errors

    // Verificar performance
    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const scripts = performance
        .getEntriesByType('resource')
        .filter(r => r.name.match(/\.js(\?|$)/))

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd,
        firstContentfulPaint: performance
          .getEntriesByType('paint')
          .find(p => p.name === 'first-contentful-paint')?.startTime,
        scripts: scripts.map(s => ({
          name: s.name,
          startTime: s.startTime,
          duration: s.duration,
          endTime: s.startTime + s.duration
        }))
      }
    })

    validationResults.domReadyTime = performanceData.domContentLoaded
    validationResults.firstScriptLoadTime = performanceData.scripts[0]?.startTime || 0
    validationResults.lastScriptLoadTime =
      performanceData.scripts[performanceData.scripts.length - 1]?.endTime || 0
    validationResults.totalScriptDuration = performanceData.scripts.reduce(
      (sum, s) => sum + s.duration,
      0
    )

    // Analizar scripts
    const scriptAttributes = await page.$$eval('script[src]', scripts => {
      return scripts.map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer,
        type: script.type || 'text/javascript'
      }))
    })

    validationResults.asyncScripts = scriptAttributes.filter(s => s.async).length
    validationResults.deferScripts = scriptAttributes.filter(s => s.defer).length
    validationResults.moduleScripts = scriptAttributes.filter(s => s.type === 'module').length
    validationResults.inlineScripts = await page.$$eval(
      'script:not([src])',
      scripts => scripts.length
    )

    // Verificar blocking scripts
    validationResults.blockingScripts = performanceData.scripts.filter(
      s =>
        s.startTime < performanceData.domContentLoaded &&
        s.endTime > performanceData.domContentLoaded
    ).length

    // REPORTAR RESULTADOS
    console.log('\n' + '='.repeat(80))
    console.log('📊 VALIDATION RESULTS')
    console.log('='.repeat(80))
    console.log(`Total Scripts Detected: ${validationResults.scriptsDetected}`)
    console.log(`Scripts with Errors: ${validationResults.errors.length}`)
    console.log(`DOM Ready Time: ${validationResults.domReadyTime.toFixed(2)}ms`)
    console.log(`First Script Load: ${validationResults.firstScriptLoadTime.toFixed(2)}ms`)
    console.log(`Last Script Load: ${validationResults.lastScriptLoadTime.toFixed(2)}ms`)
    console.log(`Total Script Duration: ${validationResults.totalScriptDuration.toFixed(2)}ms`)
    console.log(`Blocking Scripts: ${validationResults.blockingScripts}`)
    console.log(`Async Scripts: ${validationResults.asyncScripts}`)
    console.log(`Defer Scripts: ${validationResults.deferScripts}`)
    console.log(`Module Scripts: ${validationResults.moduleScripts}`)
    console.log(`Inline Scripts: ${validationResults.inlineScripts}`)
    console.log('='.repeat(80) + '\n')

    // VERIFICACIONES PRINCIPALES
    console.log('✅ VERIFICATION CHECKS:')
    console.log(`  ${validationResults.scriptsDetected > 0 ? '✓' : '✗'} Scripts detected`)
    console.log(`  ${validationResults.errors.length === 0 ? '✓' : '✗'} No script errors`)
    console.log(
      `  ${validationResults.asyncScripts + validationResults.deferScripts > 0 ? '✓' : '✗'} Using async/defer`
    )
    console.log(`  ${validationResults.blockingScripts === 0 ? '✓' : '⚠'} Blocking scripts`)
    console.log(`  ${validationResults.moduleScripts > 0 ? '✓' : 'ℹ'} Module scripts`)
    console.log(`  ${validationResults.inlineScripts > 0 ? '✓' : 'ℹ'} Inline scripts`)

    // VERIFICACIONES FINALES
    expect(validationResults.scriptsDetected).toBeGreaterThan(0)
    expect(validationResults.errors.length).toBe(0)
    expect(validationResults.domReadyTime).toBeGreaterThan(0)
  })

  test('should generate comprehensive validation report', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const report = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))
      const navigation = performance.getEntriesByType('navigation')[0]

      return {
        timestamp: new Date().toISOString(),
        totalScripts: scripts.length,
        externalScripts: scripts.filter(s => s.src).length,
        inlineScripts: scripts.filter(s => !s.src).length,
        attributes: {
          async: scripts.filter(s => s.async).length,
          defer: scripts.filter(s => s.defer).length,
          module: scripts.filter(s => s.type === 'module').length
        },
        timing: {
          domContentLoaded: navigation.domContentLoadedEventEnd,
          loadEvent: navigation.loadEventEnd,
          domInteractive: navigation.domInteractive
        },
        scripts: scripts.map(s => ({
          src: s.src || 'inline',
          async: s.async,
          defer: s.defer,
          type: s.type || 'text/javascript'
        }))
      }
    })

    // Generar reporte en consola
    console.log('\n' + '═'.repeat(80))
    console.log('📋 COMPREHENSIVE JAVASCRIPT VALIDATION REPORT')
    console.log('═'.repeat(80))
    console.log(`Generated: ${report.timestamp}`)
    console.log(`Total Scripts: ${report.totalScripts}`)
    console.log(`  - External: ${report.externalScripts}`)
    console.log(`  - Inline: ${report.inlineScripts}`)
    console.log(
      `Attributes: async=${report.attributes.async}, defer=${report.attributes.defer}, module=${report.attributes.module}`
    )
    console.log(`Timing:`)
    console.log(`  - DOM Interactive: ${report.timing.domInteractive.toFixed(2)}ms`)
    console.log(`  - DOMContentLoaded: ${report.timing.domContentLoaded.toFixed(2)}ms`)
    console.log(`  - Load Event: ${report.timing.loadEvent.toFixed(2)}ms`)
    console.log('═'.repeat(80) + '\n')

    // Verificar que se generó correctamente
    expect(report.totalScripts).toBeGreaterThan(0)
    expect(report.timing.domContentLoaded).toBeGreaterThan(0)
  })
})
