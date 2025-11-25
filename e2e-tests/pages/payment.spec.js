import { test, expect } from '@playwright/test'
import * as cartHelpers from '../utils/cart-helpers.js'

test.describe('Payment Page', () => {
  test.beforeEach(async ({ page }) => {
    await cartHelpers.mockSettings(page)
    await cartHelpers.mockCreateOrder(page)
    await cartHelpers.mockConfirmPayment(page)
  })

  test.describe('Empty Cart Redirect', () => {
    test.use({ storageState: 'e2e-tests/fixtures/empty-cart.json' })

    test('should redirect to cart if empty', async ({ page }) => {
      await page.goto('/pages/payment.html')
      await expect(page).toHaveURL(/\/pages\/cart\.html/)
    })
  })

  test.describe('With Cart Items', () => {
    test.use({ storageState: 'e2e-tests/fixtures/cart-two-items.json' })

    test.beforeEach(async ({ page }) => {
      await page.goto('/pages/payment.html')
    })

    test('should load successfully', async ({ page }) => {
      await expect(page).toHaveURL(/\/pages\/payment\.html/)
      await expect(page.locator('h1')).toContainText('Pago')
    })

    test('should display cart summary', async ({ page }) => {
      await expect(page.locator('#total-items')).toBeVisible()
      await expect(page.locator('#subtotal')).toBeVisible()
    })

    test('should show required form fields', async ({ page }) => {
      await expect(page.locator('#customer-name')).toBeVisible()
      await expect(page.locator('#customer-email')).toBeVisible()
      await expect(page.locator('#customer-phone')).toBeVisible()
    })

    test('should default to pickup method', async ({ page }) => {
      await expect(page.locator('input[name="delivery"][value="pickup"]')).toBeChecked()
    })

    test('should default to cash payment', async ({ page }) => {
      await expect(page.locator('input[name="payment-method"][value="cash"]')).toBeChecked()
    })
  })
})
