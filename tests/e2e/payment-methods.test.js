import { test, expect } from '@playwright/test'

/**
 * E2E Tests for All Payment Methods
 *
 * This test suite verifies that all payment methods work correctly:
 * 1. Cash payment
 * 2. Mobile payment (Pago Móvil)
 * 3. Bank transfer
 * 4. Zelle
 * 5. Crypto
 */

test.describe('All Payment Methods E2E Tests', () => {
  const BASE_URL = 'http://localhost:3000'
  const BASE_CUSTOMER_NAME = 'Test Customer'
  const BASE_CUSTOMER_EMAIL = 'test-customer@test.com'
  const BASE_CUSTOMER_PHONE = '(+58)-414-1234567'
  const BASE_DELIVERY_ADDRESS = 'Avenida Principal, Casa 123, Caracas, Venezuela'

  test.beforeEach(({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })
  })

  test('should process cash payment successfully', async ({ page }) => {
    const CUSTOMER_NAME = BASE_CUSTOMER_NAME + '-Cash'
    const CUSTOMER_EMAIL = 'cash-' + BASE_CUSTOMER_EMAIL

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
    await page.locator('#customer-phone').fill(BASE_CUSTOMER_PHONE)
    await page.locator('#delivery-address').fill(BASE_DELIVERY_ADDRESS)

    // Select cash payment method (it's already selected by default in HTML)
    const cashRadio = page.locator('input[name="payment-method"][value="cash"]')
    await cashRadio.check()
    await expect(cashRadio).toBeChecked()

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
    await expect(page.locator('text=¡Pedido Confirmado!')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Gracias por tu compra')).toBeVisible()

    // Extract order ID from URL
    const url = page.url()
    const orderId = new URL(url).searchParams.get('orderId')
    expect(orderId).not.toBeNull()
    expect(parseInt(orderId)).toBeGreaterThan(0)

    console.log(`✅ Cash payment test passed! Order ID: ${orderId}`)
  })

  test('should process mobile payment (Pago Móvil) successfully', async ({ page }) => {
    const CUSTOMER_NAME = BASE_CUSTOMER_NAME + '-Mobile'
    const CUSTOMER_EMAIL = 'mobile-' + BASE_CUSTOMER_EMAIL
    const MOBILE_PHONE = '(+58)-412-1234567'
    const MOBILE_BANK = 'Banesco'

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

    // Fill customer information
    await page.locator('#customer-name').fill(CUSTOMER_NAME)
    await page.locator('#customer-email').fill(CUSTOMER_EMAIL)
    await page.locator('#customer-phone').fill(BASE_CUSTOMER_PHONE)
    await page.locator('#delivery-address').fill(BASE_DELIVERY_ADDRESS)

    // Select mobile payment method
    const mobileRadio = page.locator('input[name="payment-method"][value="mobile_payment"]')
    await mobileRadio.click() // Use click instead of check to trigger event handlers
    await expect(mobileRadio).toBeChecked()

    // Wait for the form to become visible (allowing time for event handlers)
    await page.waitForTimeout(500)

    // Verify mobile payment form is visible
    const mobileForm = page.locator('#mobile-payment-form')
    await expect(mobileForm).not.toHaveClass(/hidden/)

    // Fill mobile payment details
    await page.locator('#mobile-phone').fill(MOBILE_PHONE)
    await page.locator('#mobile-bank').selectOption(MOBILE_BANK)

    // Process the payment
    const processButton = page.locator('#process-payment-button')
    await processButton.click()

    // Wait for order processing
    await page.waitForTimeout(3000)

    // Verify redirect to order confirmation page
    await expect(page).toHaveURL(/\/pages\/order-confirmation\.html\?orderId=/)

    // Verify success elements on confirmation page
    await expect(page.locator('text=¡Pedido Confirmado!')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Gracias por tu compra')).toBeVisible()

    // Extract order ID from URL
    const url = page.url()
    const orderId = new URL(url).searchParams.get('orderId')
    expect(orderId).not.toBeNull()
    expect(parseInt(orderId)).toBeGreaterThan(0)

    console.log(`✅ Mobile payment test passed! Order ID: ${orderId}`)
  })

  test('should process bank transfer successfully', async ({ page }) => {
    const CUSTOMER_NAME = BASE_CUSTOMER_NAME + '-Transfer'
    const CUSTOMER_EMAIL = 'transfer-' + BASE_CUSTOMER_EMAIL
    const BANK_NAME = 'Banesco'
    const ACCOUNT_NUMBER = '0102-1234-5678-9012-3456'
    const ACCOUNT_HOLDER = 'Juan Pérez'

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

    // Fill customer information
    await page.locator('#customer-name').fill(CUSTOMER_NAME)
    await page.locator('#customer-email').fill(CUSTOMER_EMAIL)
    await page.locator('#customer-phone').fill(BASE_CUSTOMER_PHONE)
    await page.locator('#delivery-address').fill(BASE_DELIVERY_ADDRESS)

    // Select bank transfer method
    const transferRadio = page.locator('input[name="payment-method"][value="bank_transfer"]')
    await transferRadio.check()
    await expect(transferRadio).toBeChecked()

    // Verify bank transfer form is visible
    const bankForm = page.locator('#bank-transfer-form')
    await expect(bankForm).not.toHaveClass(/hidden/)

    // Fill bank transfer details
    await page.locator('#bank-name').selectOption(BANK_NAME)
    await page.locator('#account-number').fill(ACCOUNT_NUMBER)
    await page.locator('#account-holder').fill(ACCOUNT_HOLDER)

    // Process the payment
    const processButton = page.locator('#process-payment-button')
    await processButton.click()

    // Wait for order processing
    await page.waitForTimeout(3000)

    // Verify redirect to order confirmation page
    await expect(page).toHaveURL(/\/pages\/order-confirmation\.html\?orderId=/)

    // Verify success elements on confirmation page
    await expect(page.locator('text=¡Pedido Confirmado!')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Gracias por tu compra')).toBeVisible()

    // Extract order ID from URL
    const url = page.url()
    const orderId = new URL(url).searchParams.get('orderId')
    expect(orderId).not.toBeNull()
    expect(parseInt(orderId)).toBeGreaterThan(0)

    console.log(`✅ Bank transfer test passed! Order ID: ${orderId}`)
  })

  test('should process Zelle payment successfully', async ({ page }) => {
    const CUSTOMER_NAME = BASE_CUSTOMER_NAME + '-Zelle'
    const CUSTOMER_EMAIL = 'zelle-' + BASE_CUSTOMER_EMAIL
    const ZELLE_EMAIL = 'zelle-test@example.com'

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

    // Fill customer information
    await page.locator('#customer-name').fill(CUSTOMER_NAME)
    await page.locator('#customer-email').fill(CUSTOMER_EMAIL)
    await page.locator('#customer-phone').fill(BASE_CUSTOMER_PHONE)
    await page.locator('#delivery-address').fill(BASE_DELIVERY_ADDRESS)

    // Select Zelle payment method
    const zelleRadio = page.locator('input[name="payment-method"][value="zelle"]')
    await zelleRadio.check()
    await expect(zelleRadio).toBeChecked()

    // Verify Zelle form is visible
    const zelleForm = page.locator('#zelle-form')
    await expect(zelleForm).not.toHaveClass(/hidden/)

    // Fill Zelle details
    await page.locator('#zelle-email').fill(ZELLE_EMAIL)

    // Process the payment
    const processButton = page.locator('#process-payment-button')
    await processButton.click()

    // Wait for order processing
    await page.waitForTimeout(3000)

    // Verify redirect to order confirmation page
    await expect(page).toHaveURL(/\/pages\/order-confirmation\.html\?orderId=/)

    // Verify success elements on confirmation page
    await expect(page.locator('text=¡Pedido Confirmado!')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Gracias por tu compra')).toBeVisible()

    // Extract order ID from URL
    const url = page.url()
    const orderId = new URL(url).searchParams.get('orderId')
    expect(orderId).not.toBeNull()
    expect(parseInt(orderId)).toBeGreaterThan(0)

    console.log(`✅ Zelle payment test passed! Order ID: ${orderId}`)
  })

  test('should process crypto payment successfully', async ({ page }) => {
    const CUSTOMER_NAME = BASE_CUSTOMER_NAME + '-Crypto'
    const CUSTOMER_EMAIL = 'crypto-' + BASE_CUSTOMER_EMAIL
    const CRYPTO_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'

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

    // Fill customer information
    await page.locator('#customer-name').fill(CUSTOMER_NAME)
    await page.locator('#customer-email').fill(CUSTOMER_EMAIL)
    await page.locator('#customer-phone').fill(BASE_CUSTOMER_PHONE)
    await page.locator('#delivery-address').fill(BASE_DELIVERY_ADDRESS)

    // Select crypto payment method
    const cryptoRadio = page.locator('input[name="payment-method"][value="crypto"]')
    await cryptoRadio.click() // Use click instead of check to trigger event handlers
    await expect(cryptoRadio).toBeChecked()

    // Wait for the form to become visible (allowing time for event handlers)
    await page.waitForTimeout(500)

    // Verify crypto form is visible
    const cryptoForm = page.locator('#crypto-form')
    await expect(cryptoForm).not.toHaveClass(/hidden/)

    // Fill crypto details
    await page.locator('#crypto-address').fill(CRYPTO_ADDRESS)

    // Process the payment
    const processButton = page.locator('#process-payment-button')
    await processButton.click()

    // Wait for order processing
    await page.waitForTimeout(3000)

    // Verify redirect to order confirmation page
    await expect(page).toHaveURL(/\/pages\/order-confirmation\.html\?orderId=/)

    // Verify success elements on confirmation page
    await expect(page.locator('text=¡Pedido Confirmado!')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Gracias por tu compra')).toBeVisible()

    // Extract order ID from URL
    const url = page.url()
    const orderId = new URL(url).searchParams.get('orderId')
    expect(orderId).not.toBeNull()
    expect(parseInt(orderId)).toBeGreaterThan(0)

    console.log(`✅ Crypto payment test passed! Order ID: ${orderId}`)
  })
})
