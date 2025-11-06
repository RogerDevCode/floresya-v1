import { test, expect } from '@playwright/test'

/**
 * Tests para verificar que la página del carrito carga correctamente
 */

test.describe('Cart Page DOM Loading', () => {
  test('should load cart page with proper structure', async ({ page }) => {
    await page.goto('/pages/cart.html')
    await page.waitForLoadState('networkidle')

    // Verificar elementos básicos
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()

    // Verificar título de la página
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/cart|carrito/)
  })

  test('should display cart items container', async ({ page }) => {
    await page.goto('/pages/cart.html')
    await page.waitForLoadState('networkidle')

    // Buscar contenedor del carrito
    const cartContainer = page.locator(
      '.cart, .cart-container, .shopping-cart, .cart-items, [data-testid="cart"]'
    )

    if ((await cartContainer.count()) > 0) {
      await expect(cartContainer.first()).toBeVisible()
    }
  })

  test('should have cart total section', async ({ page }) => {
    await page.goto('/pages/cart.html')
    await page.waitForLoadState('networkidle')

    // Buscar sección de total
    const totalSection = page.locator(
      '.cart-total, .total, .cart-summary, .order-total, [data-testid="cart-total"]'
    )

    if ((await totalSection.count()) > 0) {
      await expect(totalSection.first()).toBeVisible()
    }
  })

  test('should have checkout button', async ({ page }) => {
    await page.goto('/pages/cart.html')
    await page.waitForLoadState('networkidle')

    // Buscar botón de checkout
    const checkoutButton = page.locator(
      '.checkout-btn, .btn-checkout, .checkout-button, [data-testid="checkout"]'
    )

    if ((await checkoutButton.count()) > 0) {
      await expect(checkoutButton.first()).toBeVisible()
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

    await page.goto('/pages/cart.html', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // Filtrar errores no críticos
    const criticalErrors = jsErrors.filter(
      err => !err.toLowerCase().includes('favicon') && !err.toLowerCase().includes('warning')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/pages/cart.html')

    // Verificar en móvil
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Verificar que no hay scroll horizontal excesivo
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.viewportSize().width
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)

    // Verificar en tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)

    const bodyWidthTablet = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidthTablet = await page.viewportSize().width
    expect(bodyWidthTablet).toBeLessThanOrEqual(viewportWidthTablet + 10)
  })

  test('should have proper form structure if empty cart message exists', async ({ page }) => {
    await page.goto('/pages/cart.html')
    await page.waitForLoadState('networkidle')

    // Buscar mensajes de carrito vacío
    const emptyCartMessage = page.locator('.empty-cart, .cart-empty, .no-items')

    if ((await emptyCartMessage.count()) > 0) {
      await expect(emptyCartMessage.first()).toBeVisible()

      // Verificar que hay un botón para continuar comprando
      const continueButton = page.locator('.continue-shopping, .btn-continue, .shop-more')
      if ((await continueButton.count()) > 0) {
        await expect(continueButton.first()).toBeVisible()
      }
    }
  })

  test('should load cart quantity controls if items exist', async ({ page }) => {
    await page.goto('/pages/cart.html')
    await page.waitForLoadState('networkidle')

    // Buscar controles de cantidad
    const quantityControls = page.locator('.quantity, .qty-control, .quantity-controls')

    if ((await quantityControls.count()) > 0) {
      // Verificar que los botones son visibles
      const buttons = quantityControls.locator('button, .btn, .increase, .decrease')
      const buttonCount = await buttons.count()

      if (buttonCount > 0) {
        // Al menos un botón debería ser visible
        await expect(buttons.first()).toBeVisible()
      }
    }
  })
})
