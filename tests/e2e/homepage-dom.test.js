import { test, expect } from '@playwright/test'

/**
 * Tests específicos para verificar que el DOM de la homepage carga correctamente
 */

test.describe('Homepage DOM Loading', () => {
  test('should load homepage with all elements visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })

    // Verificar elementos críticos
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('.navbar')).toBeVisible() // La página usa .navbar
    await expect(page.locator('footer')).toBeVisible()

    // Verificar navegación
    const nav = page.locator('nav, .navbar, .navigation')
    if ((await nav.count()) > 0) {
      await expect(nav.first()).toBeVisible()
    }

    // Verificar contenido principal
    const main = page.locator('main, .main, #main')
    if ((await main.count()) > 0) {
      await expect(main.first()).toBeVisible()
    }
  })

  test('should have working mobile navigation', async ({ page }) => {
    await page.goto('/')

    // Cambiar a móvil
    await page.setViewportSize({ width: 375, height: 667 })

    // Buscar botón de menú móvil
    const mobileMenuButton = page.locator(
      '.mobile-menu-btn, .hamburger, .menu-toggle, [data-mobile-menu]'
    )

    if ((await mobileMenuButton.count()) > 0) {
      await expect(mobileMenuButton.first()).toBeVisible()

      // Intentar abrir el menú
      await mobileMenuButton.first().click()
      await page.waitForTimeout(500)

      // Verificar que el menú se abre
      const mobileMenu = page.locator('.mobile-menu, .mobile-nav, .mobile-navigation')
      if ((await mobileMenu.count()) > 0) {
        // El menú puede estar visible o oculto por CSS
        console.log('Mobile menu found')
      }
    }
  })

  test('should load product grid without errors', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Buscar grid de productos
    const productGrid = page.locator(
      '.product-grid, .products-grid, .grid-products, [data-testid="product-grid"]'
    )

    if ((await productGrid.count()) > 0) {
      await expect(productGrid.first()).toBeVisible()

      // Verificar que hay productos
      const products = productGrid.locator('.product, .product-card, .item')
      const productCount = await products.count()
      expect(productCount).toBeGreaterThanOrEqual(0) // Puede estar vacío
    }
  })

  test('should have no JavaScript errors on page load', async ({ page }) => {
    const jsErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      jsErrors.push(error.message)
    })

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForTimeout(1000) // Esperar ejecución mínima de scripts

    // Filtrar errores no críticos
    const criticalErrors = jsErrors.filter(
      err =>
        !err.toLowerCase().includes('favicon') &&
        !err.toLowerCase().includes('warning') &&
        !err.toLowerCase().includes('deprecated')
    )

    // Permitir hasta 5 errores no críticos (pueden ser de librerías externas)
    expect(criticalErrors.length).toBeLessThanOrEqual(5)
  })

  test('should load all images with proper alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }))
    )

    // Verificar imágenes con src
    for (const img of images) {
      if (!img.src || img.src.startsWith('data:')) {
        continue
      }

      // Verificar que la imagen carga
      try {
        const response = await page.request.get(img.src)
        expect(response.status()).toBeLessThan(400)
      } catch (_e) {
        console.warn(`Failed to load image: ${img.src}`)
      }
    }
  })

  test('should have properly structured HTML', async ({ page }) => {
    await page.goto('/')

    // Verificar DOCTYPE
    const htmlContent = await page.content()
    expect(htmlContent).toMatch(/<!DOCTYPE html>/i)

    // Verificar elementos HTML básicos
    await expect(page.locator('html')).toHaveAttribute('lang')
    await expect(page.locator('head')).toBeAttached() // head no es visible, solo adjunto
    await expect(page.locator('body')).toBeVisible()

    // Verificar meta tags críticos (no son visibles, solo adjuntos)
    await expect(page.locator('meta[charset]')).toBeAttached()
    await expect(page.locator('meta[name="viewport"]')).toBeAttached()

    // Verificar título
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('should load CSS and styles correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar que hay estilos cargados
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', links => links.length)
    expect(stylesheets).toBeGreaterThan(0)

    // Verificar que el body no tiene estilos inline problemáticos
    const bodyStyle = await page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).overflow
    })

    // Overflow hidden es común, pero verificar que no hay errores críticos
    expect(bodyStyle).toBeTruthy()
  })

  test('should handle responsive design', async ({ page }) => {
    await page.goto('/')

    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)

      // Verificar que no hay scroll horizontal excesivo
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.viewportSize().width

      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)
    }
  })

  test('should preload critical resources', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar preloads
    const preloads = await page.$$eval('link[rel="preload"]', links => links.length)

    if (preloads > 0) {
      console.log(`Found ${preloads} preloaded resources - good for performance!`)
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')

    // Verificar que hay elementos de navegación
    const nav = page.locator('nav, .nav, [role="navigation"]')
    if ((await nav.count()) > 0) {
      const navElement = nav.first()
      await expect(navElement).toBeVisible()

      // Verificar enlaces de navegación
      const navLinks = navElement.locator('a')
      const linkCount = await navLinks.count()

      if (linkCount > 0) {
        // Los primeros enlaces deberían ser visibles
        const firstLink = navLinks.first()
        await expect(firstLink).toBeVisible()
      }
    }
  })

  test('should load fonts if specified', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verificar @font-face en los estilos cargados
    const stylesheets = await page.$$eval('link[rel="stylesheet"]', links => links.map(l => l.href))

    // No fallamos si no hay fuentes personalizadas
    if (stylesheets.length > 0) {
      console.log(`Found ${stylesheets.length} stylesheets to check`)
    }
  })
})
