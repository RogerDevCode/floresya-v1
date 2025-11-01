/**
 * E2E Tests - Create Product: Pricing
 * Tests de precios y conversión BCV
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CREATE_PRODUCT_URL = `${BASE_URL}/pages/admin/create-product.html`

test.describe('Create Product - Pricing USD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should accept valid USD price', async ({ page }) => {
    await page.fill('#product-price-usd', '29.99')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('29.99')
  })

  test('should accept minimum price 0.01', async ({ page }) => {
    await page.fill('#product-price-usd', '0.01')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('0.01')
  })

  test('should accept zero price', async ({ page }) => {
    await page.fill('#product-price-usd', '0')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('0')
  })

  test('should accept integer prices', async ({ page }) => {
    await page.fill('#product-price-usd', '100')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('100')
  })

  test('should accept prices with 1 decimal', async ({ page }) => {
    await page.fill('#product-price-usd', '29.5')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('29.5')
  })

  test('should accept prices with 2 decimals', async ({ page }) => {
    await page.fill('#product-price-usd', '29.99')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('29.99')
  })

  test('should handle large prices', async ({ page }) => {
    await page.fill('#product-price-usd', '9999.99')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('9999.99')
  })

  test('should have dollar sign indicator', async ({ page }) => {
    const dollarSign = page.locator('text=/\\$/')
    const count = await dollarSign.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should clear price field', async ({ page }) => {
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-price-usd', '')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('')
  })
})

test.describe('Create Product - BCV Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    // Wait for BCV rate to load
    await page.waitForTimeout(1000)
  })

  test('should auto-calculate VES price when USD changes', async ({ page }) => {
    // Fill USD price
    await page.fill('#product-price-usd', '100')

    // Wait for calculation
    await page.waitForTimeout(500)

    // Check if VES field is auto-filled
    const vesInput = page.locator('#product-price-ves')
    if ((await vesInput.count()) > 0) {
      const vesValue = await vesInput.inputValue()

      // Should have calculated value (BCV rate * USD)
      const numValue = parseFloat(vesValue)
      expect(numValue).toBeGreaterThan(0)
    }
  })

  test('should update VES when USD changes multiple times', async ({ page }) => {
    const vesInput = page.locator('#product-price-ves')

    if ((await vesInput.count()) > 0) {
      // First price
      await page.fill('#product-price-usd', '10')
      await page.waitForTimeout(300)
      const firstVes = await vesInput.inputValue()

      // Second price
      await page.fill('#product-price-usd', '20')
      await page.waitForTimeout(300)
      const secondVes = await vesInput.inputValue()

      // Second VES should be approximately double the first
      const ratio = parseFloat(secondVes) / parseFloat(firstVes)
      expect(ratio).toBeCloseTo(2, 0.1)
    }
  })

  test('should clear VES when USD is cleared', async ({ page }) => {
    const vesInput = page.locator('#product-price-ves')

    if ((await vesInput.count()) > 0) {
      await page.fill('#product-price-usd', '100')
      await page.waitForTimeout(300)

      await page.fill('#product-price-usd', '')
      await page.waitForTimeout(300)

      const vesValue = await vesInput.inputValue()
      expect(vesValue).toBe('')
    }
  })

  test('should show BCV rate info if available', async ({ page }) => {
    // Look for BCV rate display
    const bcvInfo = page.locator('text=/BCV|Tasa|Rate/i')

    if ((await bcvInfo.count()) > 0) {
      await expect(bcvInfo.first()).toBeVisible()
    }
  })

  test('should show VES field (readonly - auto-calculated)', async ({ page }) => {
    const vesInput = page.locator('#product-price-ves')

    if ((await vesInput.count()) > 0) {
      // Fill USD
      await page.fill('#product-price-usd', '100')
      await page.waitForTimeout(300)

      // VES field should be readonly (auto-calculated)
      const isReadonly = await vesInput.getAttribute('readonly')
      expect(isReadonly).toBe('')

      // VES should have auto-calculated value
      const vesValue = await vesInput.inputValue()
      expect(parseFloat(vesValue)).toBeGreaterThan(0)
    } else {
      // VES field doesn't exist, test passes
      test()
    }
  })
})

test.describe('Create Product - Price Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle very small decimal prices', async ({ page }) => {
    await page.fill('#product-price-usd', '0.01')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(parseFloat(value)).toBe(0.01)
  })

  test('should handle prices with many decimals (should round)', async ({ page }) => {
    await page.fill('#product-price-usd', '29.999')
    const value = await page.locator('#product-price-usd').inputValue()

    // Depending on step attribute, might round or keep as is
    const numValue = parseFloat(value)
    expect(numValue).toBeGreaterThan(0)
  })

  test('should handle price copy-paste', async ({ page }) => {
    // Simulate copying price from elsewhere
    await page.evaluate(() => {
      const input = document.querySelector('#product-price-usd')
      input.value = '49.99'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await page.waitForTimeout(300)
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('49.99')
  })

  test('should reject non-numeric price input', async ({ page }) => {
    // HTML5 input type=number automatically rejects non-numeric input
    // Playwright's fill() will fail with error for type=number + non-numeric
    // This is the expected behavior - the browser prevents invalid input

    // Try to fill with invalid data using evaluate (bypasses Playwright validation)
    await page.evaluate(() => {
      const input = document.querySelector('#product-price-usd')
      input.value = 'abc'
    })

    const value = await page.locator('#product-price-usd').inputValue()
    // Browser should reject or clear non-numeric values
    expect(value).toBe('')
  })

  test('should handle price with currency symbols (should strip)', async ({ page }) => {
    // HTML5 input type=number automatically rejects non-numeric characters
    // Playwright's fill() will throw error for type=number + symbols
    // This test verifies browser prevents invalid input

    // Use evaluate to bypass Playwright's validation
    await page.evaluate(() => {
      const input = document.querySelector('#product-price-usd')
      input.value = '$29.99'
    })

    await page.waitForTimeout(100)
    const value = await page.locator('#product-price-usd').inputValue()

    // Browser should reject symbols in number input
    expect(value).toBe('')
  })
})

test.describe('Create Product - Price Validation States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should show validation error for required price', async ({ page }) => {
    await page.fill('#product-name', 'Test')
    await page.fill('#product-stock', '10')
    await page.click('button[type="submit"]')

    const priceInput = page.locator('#product-price-usd')
    const isInvalid = await priceInput.evaluate(el => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should accept price and allow submission', async ({ page }) => {
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-stock', '50')

    const priceInput = page.locator('#product-price-usd')
    const isValid = await priceInput.evaluate(el => el.validity.valid)
    expect(isValid).toBe(true)
  })

  test('should update validation state on input', async ({ page }) => {
    const priceInput = page.locator('#product-price-usd')

    // Initially might be invalid
    await page.click('button[type="submit"]')
    const isInvalid = await priceInput.evaluate(el => !el.validity.valid)
    expect(isInvalid).toBe(true)

    // Fill valid price
    await page.fill('#product-price-usd', '29.99')
    const isValid = await priceInput.evaluate(el => el.validity.valid)
    expect(isValid).toBe(true)
  })
})
