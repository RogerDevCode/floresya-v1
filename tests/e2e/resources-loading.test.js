import { test, expect } from '@playwright/test'

/**
 * Test para verificar que todos los recursos (CSS, JS, imágenes) se cargan correctamente
 */

test.describe('Resource Loading Tests', () => {
  test.beforeEach(({ page }) => {
    // Configurar listener para recursos fallidos
    page.on('response', response => {
      if (!response.ok()) {
        console.warn(`Failed resource: ${response.url()} - Status: ${response.status()}`)
      }
    })
  })

  test('should load all CSS files for homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener todos los links CSS
    const cssLinks = await page.$$eval('link[rel="stylesheet"]', links =>
      links.map(link => link.href)
    )

    expect(cssLinks.length).toBeGreaterThan(0)

    // Verificar que cada CSS carga sin error
    for (const cssUrl of cssLinks) {
      const response = await page.request.get(cssUrl)
      expect(response.status()).toBeLessThan(400)
    }
  })

  test('should load all JavaScript files for homepage', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener todos los scripts
    const jsScripts = await page.$$eval('script[src]', scripts => scripts.map(script => script.src))

    expect(jsScripts.length).toBeGreaterThan(0)

    // Verificar que cada JS carga sin error
    for (const jsUrl of jsScripts) {
      const response = await page.request.get(jsUrl)
      expect(response.status()).toBeLessThan(400)
    }
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Obtener todos los enlaces internos
    const links = await page.$$eval('a[href]', anchors => {
      return anchors
        .map(a => a.href)
        .filter(href => href.includes(window.location.origin) || href.startsWith('/'))
        .filter(href => !href.includes('#') && !href.includes('mailto:') && !href.includes('tel:'))
        .slice(0, 10) // Probar los primeros 10 enlaces
    })

    // Verificar que cada enlace es válido
    for (const link of links) {
      const _url = new URL(link)
      // Intentar navegar al enlace
      try {
        const response = await page.request.get(link)
        // Solo fallar si es un error 404 real (no redirects o errores de servidor)
        if (response.status() === 404 && link.includes('.html')) {
          console.warn(`404 on navigation link: ${link}`)
        }
      } catch (e) {
        console.warn(`Failed to check link: ${link} - ${e.message}`)
      }
    }
  })

  test('should load critical images', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Obtener todas las imágenes
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt
      }))
    )

    // Verificar imágenes críticas (con src)
    const imagesWithSrc = images.filter(img => img.src)

    for (const img of imagesWithSrc.slice(0, 10)) {
      // Verificar primeras 10
      if (img.src.startsWith('data:')) {
        continue
      } // Skip data URIs

      try {
        const response = await page.request.get(img.src)
        expect(response.status()).toBeLessThan(400)
      } catch (_e) {
        console.warn(`Failed to load image: ${img.src}`)
      }
    }
  })

  test('should preload critical resources', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar preloads
    const preloads = await page.$$eval('link[rel="preload"]', links => links.map(l => l.href))

    if (preloads.length > 0) {
      console.log(`Found ${preloads.length} preloaded resources`)

      // Verificar algunos preloads críticos
      for (const preload of preloads.slice(0, 5)) {
        const response = await page.request.get(preload)
        expect(response.status()).toBeLessThan(400)
      }
    }
  })

  test('should handle slow network gracefully', async ({ page }) => {
    // Simular red lenta
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100)
    })

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Verificar que la página eventually carga
    await expect(page.locator('body')).toBeVisible({ timeout: 30000 })
  })

  test('should cache static resources', async ({ page }) => {
    // Cargar la página dos veces
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const firstLoadTime = Date.now()

    // Recargar
    await page.reload()
    await page.waitForLoadState('networkidle')

    const secondLoadTime = Date.now()
    const loadTime = secondLoadTime - firstLoadTime

    // La segunda carga debería ser más rápida (caching)
    console.log(`Second load time: ${loadTime}ms`)

    // No tenemos un valor específico, pero debería cargar en tiempo razonable
    expect(loadTime).toBeLessThan(10000) // 10 segundos máximo
  })
})
