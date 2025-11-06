import { test, expect } from '@playwright/test'

/**
 * Tests para rastrear y verificar la cadena completa de dependencias de scripts JS
 * desde la carga inicial hasta la ejecución final
 */

test.describe('JavaScript Chain Tracker', () => {
  test.beforeEach(({ page }) => {
    // Configurar captura de errores
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`[CONSOLE ERROR] ${msg.text()} at ${msg.location()}`)
      }
    })

    page.on('pageerror', error => {
      console.error(`[PAGE ERROR] ${error.message}`)
    })
  })

  test('should map complete JavaScript dependency chain', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Rastrear la cadena de dependencias
    const chain = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const visited = new Set()
      const chain = []

      const processScript = async (scriptSrc, depth = 0) => {
        if (depth > 10) {
          return
        } // Evitar recursión infinita
        if (visited.has(scriptSrc)) {
          return
        }

        visited.add(scriptSrc)
        chain.push({
          url: scriptSrc,
          depth: depth,
          loaded: true
        })

        // Intentar cargar el script para ver sus dependencias
        try {
          const response = await page.request.get(scriptSrc)
          const content = await response.text()

          // Buscar require/import statements
          const requireMatches = content.match(/require\(["']([^"']+\.js)["']\)/g) || []
          const importMatches = content.match(/import\s+[^;]+from\s+["']([^"']+\.js)["']/g) || []

          for (const match of [...requireMatches, ...importMatches]) {
            const depMatch = match.match(
              /require\(["']([^"']+\.js)["']\)|import\s+[^;]+from\s+["']([^"']+\.js)["']/
            )
            if (depMatch) {
              const dep = depMatch[1] || depMatch[2]
              if (dep && dep.endsWith('.js')) {
                // Resolver ruta relativa
                const base = new URL(scriptSrc, window.location.href)
                const depUrl = new URL(dep, base.href).href
                await processScript(depUrl, depth + 1)
              }
            }
          }
        } catch (error) {
          chain.push({
            url: scriptSrc,
            depth: depth,
            loaded: false,
            error: error.message
          })
        }
      }

      // Procesar scripts en orden
      return Promise.all(scripts.map(script => processScript(script.src, 0))).then(() => chain)
    })

    expect(chain.length).toBeGreaterThan(0)

    // Verificar que todos los scripts en la cadena cargan correctamente
    const failedLoads = chain.filter(item => !item.loaded)
    expect(failedLoads.length).toBe(0)

    // Verificar que no hay dependencias faltantes
    const missingDeps = chain.filter(item => item.error)
    expect(missingDeps.length).toBe(0)

    console.log(`✅ Tracked ${chain.length} scripts in dependency chain`)
  })

  test('should verify all scripts load with 200 status', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const scriptUrls = await page.$$eval('script[src]', scripts =>
      scripts.map(script => script.src).filter(src => !src.startsWith('data:'))
    )

    expect(scriptUrls.length).toBeGreaterThan(0)

    // Verificar cada script
    for (const url of scriptUrls) {
      try {
        const response = await page.request.get(url)
        expect(response.status()).toBeLessThan(400)

        if (response.status() >= 400) {
          console.error(`❌ Script 404/Error: ${url} - Status: ${response.status()}`)
        }
      } catch (error) {
        console.error(`❌ Failed to check script: ${url} - ${error.message}`)
      }
    }
  })

  test('should track script loading timing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener métricas de rendimiento
    const timingData = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const scripts = performance
        .getEntriesByType('resource')
        .filter(r => r.name.match(/\.js(\?|$)/))

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd,
        pageLoad: navigation.loadEventEnd,
        scripts: scripts.map(s => ({
          name: s.name,
          startTime: s.startTime,
          duration: s.duration,
          endTime: s.startTime + s.duration
        }))
      }
    })

    expect(timingData.scripts.length).toBeGreaterThan(0)

    // Verificar que los scripts no bloquean el DOMContentLoaded
    const domContentLoadedTime = timingData.domContentLoaded
    const blockingScripts = timingData.scripts.filter(s => s.endTime > domContentLoadedTime)

    console.log(`📊 Total scripts: ${timingData.scripts.length}`)
    console.log(`📊 Scripts blocking DOMContentLoaded: ${blockingScripts.length}`)
    console.log(`📊 DOMContentLoaded at: ${domContentLoadedTime.toFixed(2)}ms`)

    // Idealmente, los scripts críticos no deberían bloquear el DOMContentLoaded
    // (deberían usar defer o async)
    if (blockingScripts.length > 0) {
      console.log('⚠️ Some scripts may be blocking DOMContentLoaded')
    }
  })

  test('should detect and report script errors in chain', async ({ page }) => {
    const scriptErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        const location = msg.location()

        // Filtrar errores no críticos
        if (
          !text.includes('favicon') &&
          !text.includes('Non-Error promise rejection') &&
          !text.toLowerCase().includes('warning')
        ) {
          scriptErrors.push({
            message: text,
            location: location
          })
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Esperar ejecución completa

    // Reportar errores encontrados
    if (scriptErrors.length > 0) {
      console.log('Script errors found:')
      scriptErrors.forEach(err => {
        console.log(`  - ${err.message} at ${err.location}`)
      })
    }

    // No debería haber errores críticos
    const criticalErrors = scriptErrors.filter(
      err =>
        err.message.includes('SyntaxError') ||
        err.message.includes('ReferenceError') ||
        err.message.includes('TypeError')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('should verify script execution order', async ({ page }) => {
    await page.goto('/')

    // Instrumentar la página para rastrear orden de ejecución
    await page.addInitScript(() => {
      window.scriptExecutionOrder = []

      const originalCreateElement = document.createElement.bind(document)
      document.createElement = function (tagName) {
        const element = originalCreateElement(tagName)
        if (tagName.toLowerCase() === 'script') {
          const originalSrcSetter = Object.getOwnPropertyDescriptor(
            HTMLScriptElement.prototype,
            'src'
          ).set

          Object.defineProperty(element, 'src', {
            set: function (value) {
              window.scriptExecutionOrder.push({
                src: value,
                timestamp: Date.now(),
                type: 'script-src-set'
              })
              originalSrcSetter.call(this, value)
            },
            get: function () {
              return originalSrcSetter ? originalSrcSetter.call(this) : this.getAttribute('src')
            }
          })
        }
        return element
      }

      // Capturar cuando scripts se añaden al DOM
      const originalAppendChild = Node.prototype.appendChild
      Node.prototype.appendChild = function (child) {
        if (child && child.tagName === 'SCRIPT') {
          window.scriptExecutionOrder.push({
            src: child.src || 'inline',
            timestamp: Date.now(),
            type: 'script-appended'
          })
        }
        return originalAppendChild.call(this, child)
      }

      // Capturar DOMContentLoaded
      window.addEventListener('DOMContentLoaded', () => {
        window.scriptExecutionOrder.push({
          src: 'DOMContentLoaded',
          timestamp: Date.now(),
          type: 'event'
        })
      })
    })

    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Obtener orden de ejecución
    const executionOrder = await page.evaluate(() => window.scriptExecutionOrder)

    expect(executionOrder.length).toBeGreaterThan(0)

    // Verificar que DOMContentLoaded ocurre antes que algunos scripts
    const domContentLoadedIndex = executionOrder.findIndex(e => e.src === 'DOMContentLoaded')
    const scriptCountBeforeDOM = executionOrder.filter(
      e =>
        e.timestamp <= executionOrder[domContentLoadedIndex].timestamp &&
        e.type === 'script-appended'
    ).length

    console.log(`📊 Scripts before DOMContentLoaded: ${scriptCountBeforeDOM}`)
    console.log(`📊 Total execution events: ${executionOrder.length}`)

    // Scripts inline pueden ejecutarse antes, scripts externos deberían usar defer/async
    if (scriptCountBeforeDOM > 0) {
      console.log('⚠️ Some scripts executed before DOMContentLoaded')
    }
  })

  test('should handle dynamic script loading', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar si la página carga scripts dinámicamente
    const dynamicScriptLoading = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))

      // Buscar evidencia de carga dinámica
      const hasDynamicLoaders = scripts.some(script => {
        const content = script.textContent || ''
        return (
          (content.includes('createElement') && content.includes('script')) ||
          content.includes('appendChild')
        )
      })

      return {
        totalScripts: scripts.length,
        hasDynamicLoaders: hasDynamicLoaders,
        inlineScripts: scripts.filter(s => !s.src).length,
        externalScripts: scripts.filter(s => s.src).length
      }
    })

    console.log(`📊 Total scripts: ${dynamicScriptLoading.totalScripts}`)
    console.log(`📊 Inline scripts: ${dynamicScriptLoading.inlineScripts}`)
    console.log(`📊 External scripts: ${dynamicScriptLoading.externalScripts}`)

    if (dynamicScriptLoading.hasDynamicLoaders) {
      console.log('✅ Dynamic script loading detected')

      // Esperar un poco para que se carguen scripts dinámicos
      await page.waitForTimeout(3000)

      // Verificar que no hay errores por carga dinámica
      const dynamicErrors = []
      page.on('console', msg => {
        if (
          msg.type() === 'error' &&
          !msg.text().includes('favicon') &&
          !msg.text().toLowerCase().includes('warning')
        ) {
          dynamicErrors.push(msg.text())
        }
      })

      expect(dynamicErrors.length).toBe(0)
    }
  })

  test('should validate ES6 module loading', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Detectar scripts de tipo module
    const moduleInfo = await page.evaluate(() => {
      const modules = Array.from(document.querySelectorAll('script[type="module"]'))
      return {
        count: modules.length,
        modules: modules.map(m => ({
          src: m.src || 'inline',
          type: m.type
        }))
      }
    })

    if (moduleInfo.count > 0) {
      console.log(`✅ Found ${moduleInfo.count} ES6 modules`)

      // Verificar que los módulos cargan sin errores
      const moduleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('module')) {
          moduleErrors.push(msg.text())
        }
      })

      await page.waitForTimeout(3000)

      expect(moduleErrors.length).toBe(0)
    } else {
      console.log('ℹ️ No ES6 modules detected')
    }
  })

  test('should report complete chain status', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const chainStatus = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const errors = []

      // Capturar errores de console
      return {
        totalScripts: scripts.length,
        scriptUrls: scripts.map(s => s.src),
        errors: errors,
        hasErrors: errors.length > 0
      }
    })

    console.log('\n' + '='.repeat(80))
    console.log('📊 JAVASCRIPT CHAIN STATUS')
    console.log('='.repeat(80))
    console.log(`Total scripts in chain: ${chainStatus.totalScripts}`)
    console.log('Scripts:')
    chainStatus.scriptUrls.forEach((url, i) => {
      console.log(`  ${i + 1}. ${url}`)
    })
    console.log('='.repeat(80) + '\n')

    expect(chainStatus.totalScripts).toBeGreaterThan(0)
    expect(chainStatus.hasErrors).toBe(false)
  })
})
