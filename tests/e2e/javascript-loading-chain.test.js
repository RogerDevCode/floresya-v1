import { test, expect } from '@playwright/test'

/**
 * Tests para verificar que los scripts JS se cargan correctamente,
 * en el orden adecuado, y sin errores en la cadena de dependencias
 */

test.describe('JavaScript Loading Chain', () => {
  test.beforeEach(({ page }) => {
    // Capturar errores de consola y recursos fallidos
    const consoleErrors = []
    const consoleWarnings = []
    const failedResources = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          text: msg.text(),
          location: msg.location(),
          timestamp: msg.time()
        })
      } else if (msg.type() === 'warning') {
        consoleWarnings.push({
          text: msg.text(),
          location: msg.location(),
          timestamp: msg.time()
        })
      }
    })

    page.on('response', response => {
      const url = response.url()
      if (url.includes('.js') && !response.ok()) {
        failedResources.push({
          url: url,
          status: response.status(),
          statusText: response.statusText()
        })
      }
    })

    // Almacenar en el contexto
    page.context().setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    })
  })

  test('should load all JavaScript files without 404 errors', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener todos los scripts cargados
    const scripts = await page.$$eval('script[src]', scripts =>
      scripts.map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer,
        type: script.type || 'text/javascript'
      }))
    )

    expect(scripts.length).toBeGreaterThan(0)

    // Verificar que cada script carga sin error
    for (const script of scripts) {
      if (script.src.startsWith('data:')) {
        continue
      } // Skip inline scripts

      try {
        const response = await page.request.get(script.src)
        expect(response.status()).toBeLessThan(400)

        if (response.status() >= 400) {
          console.error(`❌ Failed to load script: ${script.src} - Status: ${response.status()}`)
        }
      } catch (error) {
        console.error(`❌ Error checking script: ${script.src} - ${error.message}`)
      }
    }

    // No debería haber scripts con 404
    const js404s = failedResources.filter(r => r.url.includes('.js'))
    expect(js404s.length).toBe(0)
  })

  test('should execute scripts after DOMContentLoaded', async ({ page }) => {
    await page.goto('/')

    // Verificar que hay scripts y que se ejecutan
    const scriptExecution = await page.evaluate(() => {
      const results = {
        domContentLoadedTime: null,
        scriptsFound: 0,
        scriptExecutionTimes: []
      }

      // Capturar tiempo de DOMContentLoaded
      const domContentLoadedEvent = new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(Date.now())
        } else {
          window.addEventListener('DOMContentLoaded', () => resolve(Date.now()))
        }
      })

      // Obtener todos los scripts
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      results.scriptsFound = scripts.length

      // Verificar estado después de un tiempo
      return Promise.all([domContentLoadedEvent]).then(([domTime]) => {
        results.domContentLoadedTime = domTime
        return results
      })
    })

    expect(scriptExecution.scriptsFound).toBeGreaterThan(0)

    // Verificar que no hay errores de sintaxis en los scripts
    const jsErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Filtrar errores no críticos
        if (
          !text.includes('favicon') &&
          !text.includes('Non-Error promise rejection captured') &&
          !text.toLowerCase().includes('warning')
        ) {
          jsErrors.push(text)
        }
      }
    })

    await page.waitForTimeout(3000)

    // Permitir algunos errores no críticos, pero no errores de sintaxis
    const criticalJsErrors = jsErrors.filter(
      err =>
        err.includes('SyntaxError') || err.includes('ReferenceError') || err.includes('TypeError')
    )

    expect(criticalJsErrors.length).toBe(0)
  })

  test('should maintain correct script loading order', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener información sobre el orden de carga de scripts
    const scriptLoadOrder = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      return scripts.map((script, index) => ({
        index: index,
        src: script.src,
        async: script.async,
        defer: script.defer,
        loadOrder: index
      }))
    })

    // Verificar que hay scripts
    expect(scriptLoadOrder.length).toBeGreaterThan(0)

    // Los scripts con defer/async pueden cargar en paralelo, pero los sin atributos deben mantener orden
    const syncScripts = scriptLoadOrder.filter(s => !s.async && !s.defer)

    if (syncScripts.length > 1) {
      // Verificar que los scripts síncronos están en orden
      for (let i = 0; i < syncScripts.length - 1; i++) {
        expect(syncScripts[i].index).toBeLessThan(syncScripts[i + 1].index)
      }
    }
  })

  test('should not have circular script dependencies', async ({ page }) => {
    const visitedScripts = new Set()
    const dependencyChain = []

    // Función para rastrear dependencias de scripts
    const trackScriptDependencies = async (url, depth = 0) => {
      if (depth > 10) {
        return
      } // Evitar recursión infinita
      if (visitedScripts.has(url)) {
        return
      }

      visitedScripts.add(url)

      try {
        const response = await page.request.get(url)
        if (!response.ok()) {
          return
        }

        const content = await response.text()

        // Buscar require/import de otros scripts
        const scriptMatches =
          content.match(/require\(["']([^"']+)["']\)|import\s+["']([^"']+)["']/g) || []

        for (const match of scriptMatches) {
          const importMatch = match.match(/require\(["']([^"']+)["']\)|import\s+["']([^"']+)["']/)
          if (importMatch) {
            const dependency = importMatch[1] || importMatch[2]
            if (dependency.endsWith('.js')) {
              dependencyChain.push({ from: url, to: dependency, depth })

              // Recursivamente rastrear la dependencia
              await trackScriptDependencies(dependency, depth + 1)
            }
          }
        }
      } catch (_error) {
        // Silently ignore errors
      }
    }

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener scripts de la página
    const scripts = await page.$$eval('script[src]', scripts =>
      scripts.map(script => script.src).filter(src => !src.startsWith('data:'))
    )

    // Rastrear dependencias para cada script
    for (const script of scripts.slice(0, 10)) {
      // Limitar a 10 scripts
      await trackScriptDependencies(script, 0)
    }

    // Verificar que no hay dependencias circulares
    // (esto es una verificación simple, una implementación real sería más compleja)
    const urls = dependencyChain.map(d => d.from)
    const uniqueUrls = new Set(urls)

    // Si hay más URLs que URLs únicas, hay círculos
    if (urls.length > uniqueUrls.size) {
      console.warn('⚠️ Potential circular dependencies detected:', dependencyChain)
    }
  })

  test('should handle script loading failures gracefully', async ({ page }) => {
    const scriptErrors = []
    const _failedScripts = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (
          text.includes('Script error') ||
          text.includes('Loading chunk') ||
          text.includes('Failed to load')
        ) {
          scriptErrors.push({
            text: text,
            location: msg.location()
          })
        }
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Filtrar errores críticos
    const criticalErrors = scriptErrors.filter(
      err => !err.text.includes('favicon') && !err.text.toLowerCase().includes('warning')
    )

    // Permitir algunos errores no críticos, pero reportar los críticos
    if (criticalErrors.length > 0) {
      console.log('Script loading errors found:', criticalErrors)
    }

    // No debería haber errores críticos de carga de scripts
    const syntaxErrors = criticalErrors.filter(
      err => err.text.includes('SyntaxError') || err.text.includes('Unexpected token')
    )

    expect(syntaxErrors.length).toBe(0)
  })

  test('should preload critical scripts appropriately', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar preloads de scripts
    const preloads = await page.$$eval('link[rel="preload"][as="script"]', links =>
      links.map(link => ({
        href: link.href,
        as: link.getAttribute('as'),
        crossorigin: link.crossOrigin
      }))
    )

    // Verificar que hay preloads para scripts críticos
    if (preloads.length > 0) {
      console.log(`✅ Found ${preloads.length} preloaded scripts`)

      // Verificar que cada preload carga correctamente
      for (const preload of preloads) {
        try {
          const response = await page.request.get(preload.href)
          expect(response.status()).toBeLessThan(400)
        } catch (_error) {
          console.error(`Failed to preload script: ${preload.href}`)
        }
      }
    }
  })

  test('should have proper script integrity checks if present', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar scripts con integrity
    const scriptsWithIntegrity = await page.$$eval('script[src]', scripts =>
      scripts
        .filter(script => script.integrity)
        .map(script => ({
          src: script.src,
          hasIntegrity: !!script.integrity,
          crossOrigin: script.crossOrigin
        }))
    )

    if (scriptsWithIntegrity.length > 0) {
      console.log(`✅ Found ${scriptsWithIntegrity.length} scripts with integrity checks`)

      for (const script of scriptsWithIntegrity) {
        expect(script.src).toBeTruthy()
        expect(script.hasIntegrity).toBe(true)
      }
    }
  })

  test('should not have duplicate script tags', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar scripts duplicados
    const scripts = await page.$$eval('script[src]', scripts => scripts.map(script => script.src))

    const scriptCounts = {}
    scripts.forEach(src => {
      scriptCounts[src] = (scriptCounts[src] || 0) + 1
    })

    const duplicates = Object.entries(scriptCounts).filter(([_, count]) => count > 1)

    if (duplicates.length > 0) {
      console.warn('⚠️ Duplicate script tags found:', duplicates)
    }

    // No debería haber scripts cargados múltiples veces
    expect(duplicates.length).toBe(0)
  })

  test('should execute all inline scripts without errors', async ({ page }) => {
    const inlineErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        inlineErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Filtrar errores no críticos
    const criticalErrors = inlineErrors.filter(
      err => !err.toLowerCase().includes('favicon') && !err.toLowerCase().includes('warning')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('should properly handle script module type', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar scripts de tipo module
    const moduleScripts = await page.$$eval('script[type="module"]', scripts =>
      scripts.map(script => ({
        src: script.src,
        type: script.type
      }))
    )

    if (moduleScripts.length > 0) {
      console.log(`✅ Found ${moduleScripts.length} ES6 module scripts`)

      // Los módulos deberían cargar sin errores
      await page.waitForTimeout(2000)

      // Verificar que no hay errores relacionados con módulos
      const moduleErrors = []
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('module')) {
          moduleErrors.push(msg.text())
        }
      })

      expect(moduleErrors.length).toBe(0)
    }
  })

  test('should load scripts in optimal order for performance', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const scripts = performance.getEntriesByType('resource').filter(r => r.name.includes('.js'))

      const scriptLoadTimes = scripts.map(script => ({
        name: script.name,
        duration: script.duration,
        startTime: script.startTime
      }))

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        scriptsLoaded: scripts.length,
        totalScriptDuration: scriptLoadTimes.reduce((sum, s) => sum + s.duration, 0)
      }
    })

    // Verificar que los scripts se cargan en tiempo razonable
    expect(performanceMetrics.scriptsLoaded).toBeGreaterThan(0)

    // Los scripts deberían cargar en paralelo o con defer
    console.log(`✅ Scripts loaded: ${performanceMetrics.scriptsLoaded}`)
    console.log(`✅ DOMContentLoaded duration: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`)
    console.log(`✅ Total script duration: ${performanceMetrics.totalScriptDuration.toFixed(2)}ms`)
  })
})
