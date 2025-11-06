import { test, expect } from '@playwright/test'

/**
 * Test suite completo para verificar carga de DOM en todas las páginas
 * Verifica que no hay errores de JavaScript, recursos faltantes, o referencias rotas
 */

const PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/pages/product-detail.html', name: 'Product Detail' },
  { path: '/pages/cart.html', name: 'Cart' },
  { path: '/pages/payment.html', name: 'Payment' },
  { path: '/pages/order-confirmation.html', name: 'Order Confirmation' },
  { path: '/pages/contacto.html', name: 'Contact' },
  { path: '/pages/disenos.html', name: 'Designs Gallery' },
  { path: '/pages/admin/dashboard.html', name: 'Admin Dashboard' },
  { path: '/pages/admin/create-product.html', name: 'Create Product' },
  { path: '/pages/admin/edit-product.html', name: 'Edit Product' },
  { path: '/pages/admin/orders.html', name: 'Orders Management' },
  { path: '/pages/admin/occasions.html', name: 'Occasions Management' }
]

test.describe('DOM Loading - Comprehensive Page Tests', () => {
  test.beforeEach(({ page }) => {
    // Capturar errores de consola y recursos fallidos
    const errors = []
    const failedResources = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    page.on('response', response => {
      if (!response.ok()) {
        failedResources.push({
          url: response.url(),
          status: response.status()
        })
      }
    })

    // Almacenar en el contexto del test
    page.context().setExtraHTTPHeaders({
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
    })
  })

  PAGES.forEach(({ path, name }) => {
    test.describe(`Page: ${name}`, () => {
      test(`should load DOM without errors - ${path}`, async ({ page }) => {
        const consoleErrors = []
        const jsErrors = []

        page.on('console', msg => {
          consoleErrors.push({
            type: msg.type(),
            text: msg.text()
          })
          if (msg.type() === 'error') {
            jsErrors.push(msg.text())
          }
        })

        page.on('pageerror', error => {
          jsErrors.push(error.message)
        })

        // Navegar a la página
        await page.goto(path, {
          waitUntil: 'networkidle',
          timeout: 30000
        })

        // Verificar que la página tiene contenido básico
        await expect(page.locator('body')).toBeVisible()

        // Verificar que no hay errores críticos de JavaScript
        const criticalErrors = jsErrors.filter(
          err =>
            !err.includes('favicon') &&
            !err.includes('warning') &&
            !err.toLowerCase().includes('dev')
        )

        if (criticalErrors.length > 0) {
          console.log('JavaScript Errors found:', criticalErrors)
        }

        // No fallar por advertencias o favicon
        expect(criticalErrors.length).toBeLessThanOrEqual(0)

        // Verificar elementos críticos según la página
        if (path.includes('admin')) {
          // Páginas de admin deben tener navegación
          await expect(page.locator('nav, .nav, header')).toBeVisible()
        } else {
          // Páginas públicas deben tener header o nav
          await expect(page.locator('header, nav, .navbar')).toBeVisible()
        }

        // Verificar que el título está presente
        const title = await page.title()
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(0)
      })

      test(`should have valid DOM structure - ${path}`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'networkidle' })

        // Verificar estructura HTML básica
        const html = await page.locator('html').first()
        await expect(html).toBeVisible()

        const head = await page.locator('head').first()
        await expect(head).toBeVisible()

        const body = await page.locator('body').first()
        await expect(body).toBeVisible()

        // Verificar que no hay elementos vacíos críticos
        const mainContent = page.locator('main, .main, #main, .container, .content').first()
        if ((await mainContent.count()) > 0) {
          await expect(mainContent).toBeVisible()
        }
      })

      test(`should load without 404 errors for resources - ${path}`, async ({ page }) => {
        const failedRequests = []

        page.on('response', response => {
          if (response.status() === 404) {
            failedRequests.push({
              url: response.url(),
              status: response.status()
            })
          }
        })

        await page.goto(path, { waitUntil: 'networkidle' })

        // Esperar un poco para que se carguen todos los recursos
        await page.waitForTimeout(2000)

        if (failedRequests.length > 0) {
          console.log(`404 errors on ${path}:`, failedRequests)
        }

        // Permitir algunos 404s de favicon o recursos opcionales
        const critical404s = failedRequests.filter(
          req =>
            !req.url.includes('favicon') &&
            !req.url.includes('manifest') &&
            !req.url.includes('robots')
        )

        expect(critical404s.length).toBe(0)
      })

      test(`should have proper meta tags - ${path}`, async ({ page }) => {
        await page.goto(path)

        // Verificar meta charset
        const charset = await page.locator('meta[charset]').count()
        expect(charset).toBeGreaterThanOrEqual(1)

        // Verificar meta viewport para responsive
        const viewport = await page.locator('meta[name="viewport"]').count()
        expect(viewport).toBeGreaterThanOrEqual(1)

        // Verificar que hay un título
        const title = await page.title()
        expect(title).toBeTruthy()
      })

      test(`should be responsive and mobile-friendly - ${path}`, async ({ page }) => {
        await page.goto(path)

        // Verificar viewport meta tag
        const viewportMeta = await page.locator('meta[name="viewport"]')
        const viewportContent = await viewportMeta.getAttribute('content')
        expect(viewportContent).toContain('width=device-width')

        // Cambiar a vista móvil y verificar que no hay overflow horizontal
        await page.setViewportSize({ width: 375, height: 667 })
        await page.waitForTimeout(500)

        const bodyWidth = await page.evaluate(() => {
          return document.body.scrollWidth
        })

        const viewportWidth = await page.viewportSize().width

        // Permitir una pequeña tolerancia
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)
      })
    })
  })
})
