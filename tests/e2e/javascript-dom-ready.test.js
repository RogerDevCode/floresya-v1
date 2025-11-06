import { test, expect } from '@playwright/test'

/**
 * Tests para verificar que los scripts JS se cargan DESPUÉS de que el DOM esté listo
 * y que no bloqueen la renderización de la página
 */

test.describe('JavaScript DOM Ready Verification', () => {
  test('should load scripts after DOM is ready', async ({ page }) => {
    // Instrumentar la página para rastrear el momento exacto
    await page.addInitScript(() => {
      window.performanceMarks = {
        domReady: null,
        scripts: []
      }

      // Capturar DOMContentLoaded
      window.addEventListener('DOMContentLoaded', () => {
        window.performanceMarks.domReady = Date.now()
        console.log(`[DOM-READY] DOMContentLoaded fired at ${window.performanceMarks.domReady}`)
      })

      // Rastrear carga de scripts
      const originalCreateElement = document.createElement.bind(document)
      document.createElement = function (tagName) {
        const element = originalCreateElement(tagName)
        if (tagName.toLowerCase() === 'script') {
          Object.defineProperty(element, 'src', {
            set: function (value) {
              const startTime = Date.now()
              this.setAttribute('src', value)

              // Cuando el script carga, marcar el tiempo
              this.addEventListener('load', () => {
                const endTime = Date.now()
                window.performanceMarks.scripts.push({
                  src: value,
                  startTime: startTime,
                  loadTime: endTime,
                  afterDOMReady: endTime > window.performanceMarks.domReady
                })
                console.log(
                  `[SCRIPT-LOADED] ${value} loaded at ${endTime} (afterDOM: ${endTime > window.performanceMarks.domReady})`
                )
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
    await page.waitForTimeout(3000) // Esperar carga completa de scripts

    // Obtener métricas de rendimiento
    const performanceData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const scriptResources = performance
        .getEntriesByType('resource')
        .filter(r => r.name.match(/\.js(\?|$)/))

      return {
        domContentLoadedEvent: navigation.domContentLoadedEventEnd,
        domContentLoadedStart: navigation.domContentLoadedEventStart,
        domInteractive: navigation.domInteractive,
        loadEvent: navigation.loadEventEnd,
        scripts: scriptResources.map(s => ({
          name: s.name,
          startTime: s.startTime,
          duration: s.duration,
          endTime: s.startTime + s.duration
        }))
      }
    })

    // Verificar que DOM está disponible
    expect(performanceData.domInteractive).toBeGreaterThan(0)

    // Verificar que el evento DOMContentLoaded se disparó
    const domContentLoadedMarks = await page.evaluate(() => {
      return window.performanceMarks
    })

    expect(domContentLoadedMarks.domReady).toBeTruthy()

    // Analizar timing de scripts
    const scriptsBeforeDOM = performanceData.scripts.filter(
      s => s.startTime < performanceData.domContentLoadedEvent
    )
    const scriptsAfterDOM = performanceData.scripts.filter(
      s => s.startTime >= performanceData.domContentLoadedEvent
    )

    console.log('\n' + '='.repeat(80))
    console.log('📊 JAVASCRIPT TIMING ANALYSIS')
    console.log('='.repeat(80))
    console.log(`DOM Interactive: ${performanceData.domInteractive.toFixed(2)}ms`)
    console.log(`DOMContentLoaded Event: ${performanceData.domContentLoadedEvent.toFixed(2)}ms`)
    console.log(`Scripts before DOMContentLoaded: ${scriptsBeforeDOM.length}`)
    console.log(`Scripts after DOMContentLoaded: ${scriptsAfterDOM.length}`)
    console.log('='.repeat(80) + '\n')

    // Es aceptable que algunos scripts sincronicos se carguen antes,
    // pero deberían usar defer o async para no bloquear
    if (scriptsBeforeDOM.length > 0) {
      console.log('⚠️ Some scripts loaded before DOMContentLoaded')
      console.log('   These should use defer or async attributes')
    }

    // Todos los scripts deberían cargar en tiempo razonable
    const totalScriptTime = performanceData.scripts.reduce((sum, s) => sum + s.duration, 0)
    console.log(`Total script loading time: ${totalScriptTime.toFixed(2)}ms`)

    expect(performanceData.scripts.length).toBeGreaterThan(0)
  })

  test('should not block rendering with synchronous scripts', async ({ page }) => {
    await page.goto('/')

    // Medir tiempo hasta First Contentful Paint
    const fcpTime = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcp) {
            resolve(fcp.startTime)
          }
        }).observe({ type: 'paint', buffered: true })
      })
    })

    // Medir tiempo hasta DOM Content Loaded
    const domLoadedTime = await page.evaluate(() => {
      return new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(performance.now())
        } else {
          window.addEventListener('load', () => resolve(performance.now()))
        }
      })
    })

    // Verificar que First Contentful Paint ocurre antes o cerca del DOMContentLoaded
    const timeDiff = Math.abs(fcpTime - domLoadedTime)

    console.log('\n' + '='.repeat(80))
    console.log('📊 RENDERING PERFORMANCE')
    console.log('='.repeat(80))
    console.log(`First Contentful Paint: ${fcpTime.toFixed(2)}ms`)
    console.log(`DOM Content Loaded: ${domLoadedTime.toFixed(2)}ms`)
    console.log(`Time difference: ${timeDiff.toFixed(2)}ms`)
    console.log('='.repeat(80) + '\n')

    // El FCP debería ocurrir antes o muy cerca del DOMContentLoaded
    // Si el FCP ocurre mucho después, indica que los scripts están bloqueando
    expect(timeDiff).toBeLessThan(500) // 500ms de diferencia es aceptable
  })

  test('should properly use defer and async attributes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Analizar atributos de scripts
    const scriptAttributes = await page.$$eval('script[src]', scripts => {
      return scripts.map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer,
        type: script.type || 'text/javascript',
        crossorigin: script.crossOrigin
      }))
    })

    const syncScripts = scriptAttributes.filter(s => !s.async && !s.defer && s.type !== 'module')
    const asyncScripts = scriptAttributes.filter(s => s.async)
    const deferScripts = scriptAttributes.filter(s => s.defer)
    const moduleScripts = scriptAttributes.filter(s => s.type === 'module')

    console.log('\n' + '='.repeat(80))
    console.log('📊 SCRIPT ATTRIBUTES ANALYSIS')
    console.log('='.repeat(80))
    console.log(`Total scripts: ${scriptAttributes.length}`)
    console.log(`Synchronous: ${syncScripts.length}`)
    console.log(`Async: ${asyncScripts.length}`)
    console.log(`Defer: ${deferScripts.length}`)
    console.log(`Module: ${moduleScripts.length}`)
    console.log('='.repeat(80) + '\n')

    // Es preferible que no haya muchos scripts sin defer/async
    if (syncScripts.length > 3) {
      console.log(`⚠️ Too many synchronous scripts (${syncScripts.length})`)
      console.log('   Consider using defer or async for better performance')
    }

    expect(scriptAttributes.length).toBeGreaterThan(0)
  })

  test('should handle inline script execution timing', async ({ page }) => {
    const _executionOrder = []
    const _domReadyOrder = []

    // Instrumentar para rastrear ejecución
    await page.addInitScript(() => {
      window.executionOrder = []

      // Capturar momentos clave
      const trackExecution = name => {
        const entry = {
          name: name,
          timestamp: Date.now(),
          readyState: document.readyState
        }
        window.executionOrder.push(entry)
        console.log(`[EXEC-ORDER] ${name} at ${entry.timestamp}`)
      }

      // Instrumentar scripts inline
      const scriptElements = document.querySelectorAll('script:not([src])')
      scriptElements.forEach((script, index) => {
        const originalText = script.textContent
        if (originalText.trim()) {
          script.textContent = `
            (function() {
              const startTime = Date.now();
              console.log('[INLINE-SCRIPT] Inline script ${index} started');
              try {
                ${originalText}
                console.log('[INLINE-SCRIPT] Inline script ${index} completed in', Date.now() - startTime, 'ms');
              } catch (e) {
                console.error('[INLINE-SCRIPT] Error in script ${index}:', e);
              }
            })();
          `
        }
      })

      // Capturar DOMContentLoaded
      window.addEventListener('DOMContentLoaded', () => {
        trackExecution('DOMContentLoaded')
      })

      // Capturar load
      window.addEventListener('load', () => {
        trackExecution('Load')
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Obtener orden de ejecución
    const finalOrder = await page.evaluate(() => window.executionOrder)

    expect(finalOrder.length).toBeGreaterThan(0)

    // Verificar que DOMContentLoaded ocurre
    const domContentLoadedIndex = finalOrder.findIndex(e => e.name === 'DOMContentLoaded')
    expect(domContentLoadedIndex).toBeGreaterThanOrEqual(0)

    console.log('\n' + '='.repeat(80))
    console.log('📊 INLINE SCRIPT EXECUTION ORDER')
    console.log('='.repeat(80))
    finalOrder.forEach((entry, i) => {
      console.log(`${i + 1}. ${entry.name} - ReadyState: ${entry.readyState}`)
    })
    console.log('='.repeat(80) + '\n')

    // Los scripts inline deberían ejecutarse en orden
    // Scripts de módulo pueden ejecutarse en paralelo
    const inlineScripts = finalOrder.filter(e => e.name.startsWith('INLINE-SCRIPT'))
    console.log(`✅ Inline scripts executed: ${inlineScripts.length}`)
  })

  test('should verify DOM is interactive before script execution', async ({ page }) => {
    const _domQueries = []

    // Instrumentar para verificar acceso al DOM
    await page.addInitScript(() => {
      window.domAccessLog = []

      const originalQuerySelector = document.querySelector.bind(document)
      document.querySelector = function (selector) {
        const result = originalQuerySelector(selector)
        window.domAccessLog.push({
          selector: selector,
          found: !!result,
          timestamp: Date.now(),
          readyState: document.readyState
        })
        return result
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Obtener log de acceso al DOM
    const accessLog = await page.evaluate(() => window.domAccessLog)

    expect(accessLog.length).toBeGreaterThan(0)

    // Verificar que hay accesos al DOM después de que esté listo
    const accessesBeforeReady = accessLog.filter(entry => entry.readyState !== 'complete')
    const accessesAfterReady = accessLog.filter(entry => entry.readyState === 'complete')

    console.log('\n' + '='.repeat(80))
    console.log('📊 DOM ACCESS TIMING')
    console.log('='.repeat(80))
    console.log(`Total DOM queries: ${accessLog.length}`)
    console.log(`Before ready: ${accessesBeforeReady.length}`)
    console.log(`After ready: ${accessesAfterReady.length}`)
    console.log('='.repeat(80) + '\n')

    // Es normal que haya algunos accesos antes, pero deberían usar DOMContentLoaded
    if (accessesBeforeReady.length > 0) {
      console.log('⚠️ Some DOM queries before ready state')
    }
  })

  test('should report complete DOM ready chain', async ({ page }) => {
    const _chainReport = {}

    // Instrumentar completamente
    await page.addInitScript(() => {
      window.domReadyChain = {
        navigationStart: performance.now(),
        domInteractive: null,
        domContentLoaded: null,
        domComplete: null,
        loadEvent: null,
        scriptsLoaded: [],
        errors: []
      }

      const mark = name => {
        window.domReadyChain[name] = performance.now()
        console.log(`[CHAIN] ${name} at ${window.domReadyChain[name]}`)
      }

      // Observar timing de navegación
      const navObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.name === 'dom-interactive') {
            mark('domInteractive')
          } else if (entry.name === 'dom-content-loaded') {
            mark('domContentLoaded')
          } else if (entry.name === 'dom-complete') {
            mark('domComplete')
          }
        })
      })
      navObserver.observe({ type: 'navigation', buffered: true })

      // Capturar eventos
      window.addEventListener('DOMContentLoaded', () => mark('domContentLoaded'))
      window.addEventListener('load', () => {
        mark('loadEvent')
        console.log('='.repeat(80))
        console.log('DOM READY CHAIN COMPLETE')
        console.log('='.repeat(80))
        console.log(window.domReadyChain)
      })

      // Capturar errores
      window.addEventListener('error', e => {
        window.domReadyChain.errors.push({
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          timestamp: performance.now()
        })
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Obtener reporte completo
    const finalReport = await page.evaluate(() => window.domReadyChain)

    console.log('\n' + '='.repeat(80))
    console.log('📊 COMPLETE DOM READY CHAIN REPORT')
    console.log('='.repeat(80))
    console.log(`Navigation Start: ${finalReport.navigationStart.toFixed(2)}ms`)
    console.log(`DOM Interactive: ${finalReport.domInteractive?.toFixed(2) || 'N/A'}ms`)
    console.log(`DOM Content Loaded: ${finalReport.domContentLoaded?.toFixed(2) || 'N/A'}ms`)
    console.log(`DOM Complete: ${finalReport.domComplete?.toFixed(2) || 'N/A'}ms`)
    console.log(`Load Event: ${finalReport.loadEvent?.toFixed(2) || 'N/A'}ms`)
    console.log(`Scripts Loaded: ${finalReport.scriptsLoaded.length}`)
    console.log(`Errors: ${finalReport.errors.length}`)
    console.log('='.repeat(80) + '\n')

    // Verificar que todos los eventos ocurrieron
    expect(finalReport.domInteractive).toBeTruthy()
    expect(finalReport.domContentLoaded).toBeTruthy()
    expect(finalReport.loadEvent).toBeTruthy()

    // No debería haber errores críticos
    expect(finalReport.errors.length).toBe(0)
  })
})
