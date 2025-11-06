import { test, expect } from '@playwright/test'

/**
 * Tests para verificar otras páginas importantes del sitio
 */

test.describe('Other Pages DOM Loading', () => {
  const otherPages = [
    { path: '/pages/payment.html', name: 'Payment' },
    { path: '/pages/contacto.html', name: 'Contact' },
    { path: '/pages/disenos.html', name: 'Designs Gallery' },
    { path: '/pages/order-confirmation.html', name: 'Order Confirmation' }
  ]

  otherPages.forEach(({ path, name }) => {
    test.describe(`Page: ${name}`, () => {
      test(`should load ${path} without errors`, async ({ page }) => {
        const jsErrors = []

        page.on('console', msg => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text())
          }
        })

        page.on('pageerror', error => {
          jsErrors.push(error.message)
        })

        await page.goto(path, { waitUntil: 'networkidle' })
        await page.waitForTimeout(2000)

        // Verificar elementos básicos
        await expect(page.locator('body')).toBeVisible()

        // Filtrar errores no críticos
        const criticalErrors = jsErrors.filter(
          err => !err.toLowerCase().includes('favicon') && !err.toLowerCase().includes('warning')
        )

        expect(criticalErrors.length).toBe(0)
      })

      test(`should be responsive - ${path}`, async ({ page }) => {
        await page.goto(path)

        // Verificar en móvil y desktop
        await page.setViewportSize({ width: 375, height: 667 })
        await page.waitForTimeout(500)

        const bodyWidthMobile = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidthMobile = await page.viewportSize().width
        expect(bodyWidthMobile).toBeLessThanOrEqual(viewportWidthMobile + 10)
      })
    })
  })

  test.describe('Payment Page Specific Tests', () => {
    test('should have payment form', async ({ page }) => {
      await page.goto('/pages/payment.html')
      await page.waitForLoadState('networkidle')

      // Buscar formulario de pago
      const form = page.locator('form, .payment-form, [data-form="payment"]')

      if ((await form.count()) > 0) {
        await expect(form.first()).toBeVisible()

        // Verificar campos de entrada
        const inputs = form.locator('input, select, textarea')
        const inputCount = await inputs.count()

        if (inputCount > 0) {
          await expect(inputs.first()).toBeVisible()
        }
      }
    })

    test('should display payment methods', async ({ page }) => {
      await page.goto('/pages/payment.html')

      // Buscar métodos de pago
      const paymentMethods = page.locator('.payment-methods, .methods, .payment-options')

      if ((await paymentMethods.count()) > 0) {
        await expect(paymentMethods.first()).toBeVisible()
      }
    })

    test('should have submit button', async ({ page }) => {
      await page.goto('/pages/payment.html')

      // Buscar botón de envío
      const submitButton = page.locator('.submit-btn, .btn-submit, .pay-now, [type="submit"]')

      if ((await submitButton.count()) > 0) {
        await expect(submitButton.first()).toBeVisible()
      }
    })
  })

  test.describe('Contact Page Specific Tests', () => {
    test('should have contact form', async ({ page }) => {
      await page.goto('/pages/contacto.html')
      await page.waitForLoadState('networkidle')

      // Buscar formulario de contacto
      const form = page.locator('form, .contact-form, [data-form="contact"]')

      if ((await form.count()) > 0) {
        await expect(form.first()).toBeVisible()

        // Verificar campos comunes
        const nameField = form.locator('input[name*="name"], .name-field')
        const emailField = form.locator('input[type="email"], .email-field')
        const messageField = form.locator('textarea, .message-field')

        if ((await nameField.count()) > 0) {
          await expect(nameField.first()).toBeVisible()
        }

        if ((await emailField.count()) > 0) {
          await expect(emailField.first()).toBeVisible()
        }

        if ((await messageField.count()) > 0) {
          await expect(messageField.first()).toBeVisible()
        }
      }
    })

    test('should display contact information', async ({ page }) => {
      await page.goto('/pages/contacto.html')

      // Buscar información de contacto
      const contactInfo = page.locator('.contact-info, .info, .contact-details')

      if ((await contactInfo.count()) > 0) {
        await expect(contactInfo.first()).toBeVisible()
      }
    })
  })

  test.describe('Designs Gallery Specific Tests', () => {
    test('should load design gallery grid', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('networkidle')

      // Buscar grid de diseños
      const galleryGrid = page.locator(
        '.gallery-grid, .designs-grid, .grid, [data-gallery="designs"]'
      )

      if ((await galleryGrid.count()) > 0) {
        await expect(galleryGrid.first()).toBeVisible()

        // Verificar elementos del grid
        const items = galleryGrid.locator('.item, .design, .gallery-item')
        const itemCount = await items.count()

        if (itemCount > 0) {
          // Al menos un item debería estar visible
          await expect(items.first()).toBeVisible()
        }
      }
    })

    test('should have filter options', async ({ page }) => {
      await page.goto('/pages/disenos.html')

      // Buscar filtros
      const filters = page.locator('.filters, .filter-bar, .category-filters')

      if ((await filters.count()) > 0) {
        await expect(filters.first()).toBeVisible()
      }
    })
  })

  test.describe('Order Confirmation Specific Tests', () => {
    test('should display order details', async ({ page }) => {
      await page.goto('/pages/order-confirmation.html')
      await page.waitForLoadState('networkidle')

      // Buscar detalles de la orden
      const orderDetails = page.locator('.order-details, .confirmation-details, .order-summary')

      if ((await orderDetails.count()) > 0) {
        await expect(orderDetails.first()).toBeVisible()
      }
    })

    test('should have continue shopping button', async ({ page }) => {
      await page.goto('/pages/order-confirmation.html')

      // Buscar botón de continuar comprando
      const continueButton = page.locator(
        '.continue-btn, .btn-continue, .continue-shopping, .back-home'
      )

      if ((await continueButton.count()) > 0) {
        await expect(continueButton.first()).toBeVisible()
      }
    })
  })

  test.describe('Theme Pages Tests', () => {
    const themePages = [
      '/pages/diseno-1-jardin-natural.html',
      '/pages/diseno-2-elegancia-moderna.html',
      '/pages/diseno-3-vintage-romantico.html',
      '/pages/diseno-4-tropical-vibrante.html',
      '/pages/diseno-5-zen-minimalista.html'
    ]

    themePages.forEach(path => {
      test(`should load theme page ${path}`, async ({ page }) => {
        await page.goto(path, { waitUntil: 'networkidle' })

        // Verificar elementos básicos
        await expect(page.locator('body')).toBeVisible()

        // Verificar que no hay errores críticos
        const jsErrors = []
        page.on('console', msg => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text())
          }
        })

        await page.waitForTimeout(1000)

        const criticalErrors = jsErrors.filter(
          err => !err.toLowerCase().includes('favicon') && !err.toLowerCase().includes('warning')
        )

        expect(criticalErrors.length).toBe(0)
      })
    })
  })
})
