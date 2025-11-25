import { test, expect } from '@playwright/test'
import * as cartHelpers from '../utils/cart-helpers.js'

// Cart page tests using proper storage state isolation
test.describe('Shopping Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    await cartHelpers.mockSettings(page)
  })

  test.describe('Empty Cart State', () => {
    test.use({ storageState: 'e2e-tests/fixtures/empty-cart.json' })

    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/cart.html')
    })

    test('should display empty cart message', async ({ page }) => {
      await expect(page.locator('#empty-cart')).toBeVisible()
      await expect(page.locator('#empty-cart')).toContainText('Tu carrito está vacío')
    })

    test('should disable checkout button', async ({ page }) => {
      await expect(page.locator('#checkout-button')).toBeDisabled()
    })

    test('should hide clear cart section', async ({ page }) => {
      await expect(page.locator('#clear-cart-section')).toHaveClass(/hidden/)
    })

    test('should show zero in summary', async ({ page }) => {
      await expect(page.locator('#total-items')).toContainText('0')
      await expect(page.locator('#subtotal')).toContainText('$0.00')
      await expect(page.locator('#total')).toContainText('$0.00')
    })

    test('should display cart badge as 0', async ({ page }) => {
      await expect(page.locator('#cart-count-badge')).toContainText('0')
    })

    test('should show products link', async ({ page }) => {
      const link = page.locator('#empty-cart a')
      await expect(link).toHaveAttribute('href', '/#productos')
    })
  })

  test.describe('Cart with Items', () => {
    test.use({ storageState: 'e2e-tests/fixtures/cart-with-items.json' })

    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/cart.html')
    })

    test('should display cart items', async ({ page }) => {
      await expect(page.locator('.cart-item')).toHaveCount(2)
    })

    test('should hide empty message', async ({ page }) => {
      await expect(page.locator('#empty-cart')).toHaveClass(/hidden/)
    })

    test('should enable checkout button', async ({ page }) => {
      await expect(page.locator('#checkout-button')).not.toBeDisabled()
    })

    test('should show clear cart section', async ({ page }) => {
      await expect(page.locator('#clear-cart-section')).not.toHaveClass(/hidden/)
    })

    test('should display correct item details', async ({ page }) => {
      const firstItem = page.locator('.cart-item').first()
      await expect(firstItem).toContainText('Ramo de Rosas Rojas')
      await expect(firstItem).toContainText('$25.99')
    })

    test('should display correct totals', async ({ page }) => {
      await expect(page.locator('#total-items')).toContainText('3')
      await expect(page.locator('#subtotal')).toContainText('$70.48')
    })

    test('should update cart badge', async ({ page }) => {
      await expect(page.locator('#cart-count-badge')).toContainText('3')
    })
  })

  test.describe('Delivery Selection', () => {
    test.use({ storageState: 'e2e-tests/fixtures/cart-single-item.json' })

    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/cart.html')
    })

    test('should default to pickup (free)', async ({ page }) => {
      await expect(page.locator('input[name="delivery"][value="pickup"]')).toBeChecked()
      await expect(page.locator('#shipping-cost')).toContainText('Gratis')
    })

    test('should show delivery cost when selected', async ({ page }) => {
      await page.locator('input[name="delivery"][value="delivery"]').check()
      await expect(page.locator('#shipping-cost')).toContainText('$5.00')
    })
  })

  test.describe('Checkout Navigation', () => {
    test.use({ storageState: 'e2e-tests/fixtures/cart-two-items.json' })

    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/cart.html')
    })

    test('should navigate to payment page', async ({ page }) => {
      await page.locator('#checkout-button').click()
      await expect(page).toHaveURL(/\/pages\/payment\.html/)
    })
  })
})
