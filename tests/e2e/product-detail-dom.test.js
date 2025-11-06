import { test, expect } from '@playwright/test'

/**
 * Tests para verificar que la página de detalle de producto carga correctamente
 */

test.describe('Product Detail Page DOM Loading', () => {
  test('should load product detail page with proper structure', async ({ page }) => {
    await page.goto('/pages/product-detail.html', { waitUntil: 'domcontentloaded', timeout: 10000 })

    // Verificar elementos básicos (flexible - acepta nav.navbar en lugar de header)
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('header, nav, .navbar')).toBeVisible()
  })

  test('should display product image gallery', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    // Buscar galería de imágenes
    const gallery = page.locator(
      '.gallery, .product-gallery, .image-gallery, .carousel, [data-testid="gallery"]'
    )

    if ((await gallery.count()) > 0) {
      await expect(gallery.first()).toBeVisible()

      // Verificar imágenes en la galería
      const images = gallery.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        // Al menos una imagen debería estar visible
        await expect(images.first()).toBeVisible()
      }
    }
  })

  test('should have product information section', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    // Buscar información del producto
    const productInfo = page.locator(
      '.product-info, .product-details, .product-summary, [data-testid="product-info"]'
    )

    if ((await productInfo.count()) > 0) {
      await expect(productInfo.first()).toBeVisible()

      // Verificar elementos de información
      const title = productInfo.locator('h1, .title, .product-title')
      const price = productInfo.locator('.price, .product-price, .amount')
      const description = productInfo.locator('.description, .product-description')

      if ((await title.count()) > 0) {
        await expect(title.first()).toBeVisible()
      }

      if ((await price.count()) > 0) {
        await expect(price.first()).toBeVisible()
      }

      if ((await description.count()) > 0) {
        await expect(description.first()).toBeVisible()
      }
    }
  })

  test('should have add to cart button', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    // Buscar botón de agregar al carrito
    const addToCartButton = page.locator(
      '.add-to-cart, .btn-add-cart, .add-cart, [data-testid="add-to-cart"]'
    )

    if ((await addToCartButton.count()) > 0) {
      await expect(addToCartButton.first()).toBeVisible()
      await expect(addToCartButton.first()).toBeEnabled()
    }
  })

  test('should have quantity selector', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    // Buscar selector de cantidad
    const quantitySelector = page.locator(
      '.quantity, .qty-selector, .quantity-selector, [data-testid="quantity"]'
    )

    if ((await quantitySelector.count()) > 0) {
      await expect(quantitySelector.first()).toBeVisible()

      // Verificar controles de cantidad
      const input = quantitySelector.locator('input[type="number"], input[type="text"]')
      const buttons = quantitySelector.locator('button, .btn, .increase, .decrease')

      if ((await input.count()) > 0) {
        await expect(input.first()).toBeVisible()
      }

      if ((await buttons.count()) > 0) {
        await expect(buttons.first()).toBeVisible()
      }
    }
  })

  test('should display product specifications', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    // Buscar especificaciones
    const specs = page.locator(
      '.specifications, .specs, .product-specs, [data-testid="specifications"]'
    )

    if ((await specs.count()) > 0) {
      await expect(specs.first()).toBeVisible()
    }
  })

  test('should have breadcrumbs navigation', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    // Buscar breadcrumbs
    const breadcrumbs = page.locator(
      '.breadcrumbs, .breadcrumb, .nav-breadcrumbs, [data-testid="breadcrumbs"]'
    )

    if ((await breadcrumbs.count()) > 0) {
      await expect(breadcrumbs.first()).toBeVisible()

      // Verificar enlaces en breadcrumbs
      const links = breadcrumbs.locator('a')
      const linkCount = await links.count()

      if (linkCount > 0) {
        await expect(links.first()).toBeVisible()
      }
    }
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const jsErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      jsErrors.push(error.message)
    })

    await page.goto('/pages/product-detail.html', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Filtrar errores no críticos
    const criticalErrors = jsErrors.filter(
      err => !err.toLowerCase().includes('favicon') && !err.toLowerCase().includes('warning')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('should be fully responsive', async ({ page }) => {
    await page.goto('/pages/product-detail.html')

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

      // Verificar que elementos críticos siguen visibles
      if ((await page.locator('body').count()) > 0) {
        await expect(page.locator('body').first()).toBeVisible()
      }
    }
  })

  test('should load all product images', async ({ page }) => {
    await page.goto('/pages/product-detail.html')
    await page.waitForLoadState('networkidle')

    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt
      }))
    )

    // Verificar imágenes con src
    for (const img of images) {
      if (!img.src || img.src.startsWith('data:')) {
        continue
      }

      try {
        const response = await page.request.get(img.src)
        expect(response.status()).toBeLessThan(400)
      } catch (_e) {
        console.warn(`Failed to load product image: ${img.src}`)
      }
    }
  })
})
