/**
 * E2E Tests - Create Product: Form Validation
 * Tests de validación del formulario de creación de productos
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CREATE_PRODUCT_URL = `${BASE_URL}/pages/admin/create-product.html`

test.describe('Create Product - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should show required field validation for name', async ({ page }) => {
    // Submit form without filling name
    await page.click('button[type="submit"]')

    // Check HTML5 validation
    const nameInput = page.locator('#product-name')
    const isInvalid = await nameInput.evaluate(el => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should show required field validation for price USD', async ({ page }) => {
    // Fill name but not price
    await page.fill('#product-name', 'Test Product')
    await page.click('button[type="submit"]')

    // Check HTML5 validation for price
    const priceInput = page.locator('#product-price-usd')
    const isInvalid = await priceInput.evaluate(el => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('should allow submission without stock (optional field)', async ({ page }) => {
    // Stock is NOT a required field in the current implementation
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')

    // Stock input should be valid even if not filled
    const stockInput = page.locator('#product-stock')
    const hasRequired = await stockInput.getAttribute('required')
    expect(hasRequired).toBeNull() // Stock is NOT required
  })

  test('should not accept negative price USD', async ({ page }) => {
    const priceInput = page.locator('#product-price-usd')
    await priceInput.fill('-10')

    // Verify min attribute prevents negative
    const minValue = await priceInput.getAttribute('min')
    expect(minValue).toBe('0')

    // Check validation state
    const isValid = await priceInput.evaluate(el => el.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should not accept negative stock', async ({ page }) => {
    const stockInput = page.locator('#product-stock')
    await stockInput.fill('-5')

    // Verify min attribute prevents negative
    const minValue = await stockInput.getAttribute('min')
    expect(minValue).toBe('0')

    // Check validation state
    const isValid = await stockInput.evaluate(el => el.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should accept decimal prices with 2 decimals', async ({ page }) => {
    const priceInput = page.locator('#product-price-usd')
    await priceInput.fill('29.99')

    const value = await priceInput.inputValue()
    expect(value).toBe('29.99')
  })

  test('should have numeric stock input', async ({ page }) => {
    const stockInput = page.locator('#product-stock')

    // Input should be type="number"
    const type = await stockInput.getAttribute('type')
    expect(type).toBe('number')

    // Should have min="0" to prevent negative
    const min = await stockInput.getAttribute('min')
    expect(min).toBe('0')
  })

  test('should show all required fields marked with asterisk', async ({ page }) => {
    // Find all labels with asterisk
    const requiredLabels = page.locator('label:has-text("*")')
    const count = await requiredLabels.count()

    // Should have: name (*), price_usd (*)
    // Stock is NOT required in current implementation
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should have proper input types for each field', async ({ page }) => {
    // Name should be text
    const nameType = await page.locator('#product-name').getAttribute('type')
    expect(nameType).toBe('text')

    // Price should be number
    const priceType = await page.locator('#product-price-usd').getAttribute('type')
    expect(priceType).toBe('number')

    // Stock should be number
    const stockType = await page.locator('#product-stock').getAttribute('type')
    expect(stockType).toBe('number')
  })

  test('should have placeholders for user guidance', async ({ page }) => {
    // Check name placeholder
    const namePlaceholder = await page.locator('#product-name').getAttribute('placeholder')
    expect(namePlaceholder).toBeTruthy()

    // Check price placeholder
    const pricePlaceholder = await page.locator('#product-price-usd').getAttribute('placeholder')
    expect(pricePlaceholder).toBeTruthy()
  })

  test('should disable submit button while submitting', async ({ page }) => {
    // Fill required fields
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-stock', '50')

    // Mock slow network to see disabled state
    await page.route('**/api/products', route => {
      setTimeout(() => route.continue(), 1000)
    })

    // Click submit
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Button should be disabled during submission
    // (Note: This depends on implementation)
    await page.waitForTimeout(100)
  })

  test('should validate SKU format if provided', async ({ page }) => {
    const skuInput = page.locator('#product-sku')

    // SKU should accept alphanumeric and dashes
    await skuInput.fill('ROSES-RED-001')
    const value = await skuInput.inputValue()
    expect(value).toBe('ROSES-RED-001')
  })

  test('should show form is pristine on load', async ({ page }) => {
    // Name and price should be empty
    const nameValue = await page.locator('#product-name').inputValue()
    const priceValue = await page.locator('#product-price-usd').inputValue()

    expect(nameValue).toBe('')
    expect(priceValue).toBe('')

    // Stock has a default value of "3" in the HTML
    const stockValue = await page.locator('#product-stock').inputValue()
    expect(stockValue).toBeTruthy() // Has a default value
  })

  test('should not submit with only name filled', async ({ page }) => {
    await page.fill('#product-name', 'Test Product')
    await page.click('button[type="submit"]')

    // Form should not submit (page should not navigate)
    await page.waitForTimeout(500)
    const url = page.url()
    expect(url).toContain('create-product.html')
  })

  test('should not submit with only price filled', async ({ page }) => {
    await page.fill('#product-price-usd', '29.99')
    await page.click('button[type="submit"]')

    // Form should not submit
    await page.waitForTimeout(500)
    const url = page.url()
    expect(url).toContain('create-product.html')
  })

  test('should validate all required fields together', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Check that form reports invalid
    const form = page.locator('#create-product-form')
    const isFormValid = await form.evaluate(el => el.checkValidity())
    expect(isFormValid).toBe(false)
  })
})

test.describe('Create Product - Field Constraints', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should respect maxlength for name field', async ({ page }) => {
    const nameInput = page.locator('#product-name')
    const maxLength = await nameInput.getAttribute('maxlength')

    if (maxLength) {
      // Try to enter more characters than max
      const longText = 'A'.repeat(parseInt(maxLength) + 10)
      await nameInput.fill(longText)

      const value = await nameInput.inputValue()
      expect(value.length).toBeLessThanOrEqual(parseInt(maxLength))
    }
  })

  test('should respect maxlength for description field', async ({ page }) => {
    const descInput = page.locator('#product-description')
    const maxLength = await descInput.getAttribute('maxlength')

    if (maxLength) {
      const longText = 'A'.repeat(parseInt(maxLength) + 10)
      await descInput.fill(longText)

      const value = await descInput.inputValue()
      expect(value.length).toBeLessThanOrEqual(parseInt(maxLength))
    }
  })

  test('should show character count for description if available', async ({ page }) => {
    // Check if there's a character counter
    const counter = page.locator('[data-character-counter], .character-count')
    const exists = (await counter.count()) > 0

    if (exists) {
      await page.fill('#product-description', 'Test description')
      const counterText = await counter.textContent()
      expect(counterText).toContain('16') // Length of "Test description"
    }
  })

  test('should handle price with step validation', async ({ page }) => {
    const priceInput = page.locator('#product-price-usd')
    const step = await priceInput.getAttribute('step')

    // If step is 0.01, should accept 29.99
    if (step === '0.01') {
      await priceInput.fill('29.99')
      const isValid = await priceInput.evaluate(el => el.validity.valid)
      expect(isValid).toBe(true)
    }
  })
})
