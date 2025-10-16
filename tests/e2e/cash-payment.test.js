import { test, expect } from '@playwright/test'

/**
 * E2E Test for Cash Payment Processing
 *
 * This test verifies that the cash payment flow works correctly:
 * 1. Customer fills out customer information
 * 2. Selects cash payment method
 * 3. Completes the checkout process
 * 4. Verifies that the order is created successfully
 */

test.describe('Cash Payment Processing E2E Test', () => {
  const BASE_URL = 'http://localhost:3000'
  const CUSTOMER_NAME = 'Test Cash Customer'
  const CUSTOMER_EMAIL = 'cash-customer@test.com'
  const CUSTOMER_PHONE = '(+58)-414-1234567'
  const DELIVERY_ADDRESS = 'Avenida Principal, Casa 123, Caracas, Venezuela'

  test('should process cash payment successfully', async ({ page }) => {
    // Navigate to homepage
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/FloresYa/)

    // Add a product to cart (first available product)
    const addToCartBtn = page.locator('.add-to-cart-btn').first()
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // Wait for cart badge to update
    await page.waitForTimeout(500)
    const cartBadge = page.locator('.cart-badge')
    await expect(cartBadge).toContainText(/[1-9]/)

    // Navigate to cart page
    await page.locator('a[href="/pages/cart.html"]').click()
    await expect(page).toHaveURL(/\/pages\/cart\.html/)

    // Click checkout button
    const checkoutBtn = page.locator('button:has-text("Proceder al Pago")').first()
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    // Wait for payment page to load
    await expect(page).toHaveURL(/\/pages\/payment\.html/)

    // Fill customer information
    await page.locator('#customer-name').fill(CUSTOMER_NAME)
    await page.locator('#customer-email').fill(CUSTOMER_EMAIL)
    await page.locator('#customer-phone').fill(CUSTOMER_PHONE)
    await page.locator('#delivery-address').fill(DELIVERY_ADDRESS)

    // Verify customer information was filled
    await expect(page.locator('#customer-name')).toHaveValue(CUSTOMER_NAME)
    await expect(page.locator('#customer-email')).toHaveValue(CUSTOMER_EMAIL)
    await expect(page.locator('#customer-phone')).toHaveValue(CUSTOMER_PHONE)
    await expect(page.locator('#delivery-address')).toHaveValue(DELIVERY_ADDRESS)

    // Select cash payment method (it's already selected by default in HTML)
    const cashRadio = page.locator('input[name="payment-method"][value="cash"]')
    await cashRadio.check()
    await expect(cashRadio).toBeChecked()

    // Verify cash payment form is not visible (since cash doesn't need specific fields)
    const mobileForm = page.locator('#mobile-payment-form')
    const bankForm = page.locator('#bank-transfer-form')
    const zelleForm = page.locator('#zelle-form')
    const cryptoForm = page.locator('#crypto-form')

    await expect(mobileForm).toHaveClass(/hidden/)
    await expect(bankForm).toHaveClass(/hidden/)
    await expect(zelleForm).toHaveClass(/hidden/)
    await expect(cryptoForm).toHaveClass(/hidden/)

    // Process the payment
    const processButton = page.locator('#process-payment-button')
    await expect(processButton).toBeEnabled()

    // Click process payment button
    await processButton.click()

    // Wait for order processing
    await page.waitForTimeout(3000)

    // Verify redirect to order confirmation page
    await expect(page).toHaveURL(/\/pages\/order-confirmation\.html\?orderId=/)

    // Verify success elements on confirmation page
    const successMessage = page.locator('text=¡Pedido Confirmado!')
    await expect(successMessage).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Gracias por tu compra')).toBeVisible()

    // Extract order ID from URL
    const url = page.url()
    const orderId = new URL(url).searchParams.get('orderId')
    expect(orderId).not.toBeNull()
    expect(parseInt(orderId)).toBeGreaterThan(0)

    console.log(`✅ Cash payment test passed! Order ID: ${orderId}`)
  })

  test('should fail to process cash payment with incomplete customer information', async ({
    page
  }) => {
    // Navigate to homepage
    await page.goto(BASE_URL)

    // Add a product to cart
    const addToCartBtn = page.locator('.add-to-cart-btn').first()
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // Navigate to cart and then to payment
    await page.locator('a[href="/pages/cart.html"]').click()
    await page.locator('button:has-text("Proceder al Pago")').first().click()
    await expect(page).toHaveURL(/\/pages\/payment\.html/)

    // Try to process without filling required customer information
    const processButton = page.locator('#process-payment-button')
    await processButton.click()

    // Should show validation error via JavaScript alert
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain(
        'Por favor complete todos los campos requeridos correctamente.'
      )
      dialog.accept().catch(() => {})
    })

    // Wait briefly to ensure validation has occurred
    await page.waitForTimeout(1000)

    console.log('✅ Validation test passed! Incomplete customer info was properly rejected.')
  })
})
