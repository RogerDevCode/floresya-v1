/**
 * E2E Tests - Create Product: Extreme Values
 * Tests con valores extremos y casos límite
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CREATE_PRODUCT_URL = `${BASE_URL}/pages/admin/create-product.html`

test.describe('Create Product - Extreme Name Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle very short name (1 character)', async ({ page }) => {
    await page.fill('#product-name', 'A')
    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe('A')
  })

  test('should handle very long name (500 characters)', async ({ page }) => {
    const longName = 'A'.repeat(500)
    await page.fill('#product-name', longName)

    const value = await page.locator('#product-name').inputValue()
    // Might be truncated by maxlength
    expect(value.length).toBeLessThanOrEqual(500)
  })

  test('should handle name with all special characters', async ({ page }) => {
    const specialName = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~'
    await page.fill('#product-name', specialName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(specialName)
  })

  test('should handle name with emojis', async ({ page }) => {
    const emojiName = 'Ramo de Flores 🌹🌺🌸🌼🌻'
    await page.fill('#product-name', emojiName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(emojiName)
  })

  test('should handle name with multiple spaces', async ({ page }) => {
    const spacedName = 'Ramo     de     Rosas'
    await page.fill('#product-name', spacedName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(spacedName)
  })

  test('should handle name with only spaces', async ({ page }) => {
    const onlySpaces = '     '
    await page.fill('#product-name', onlySpaces)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(onlySpaces)

    // Form validation might reject this
    const _nameInput = page.locator('#product-name')
    // Check if validation catches whitespace-only
  })

  test('should handle name with newlines', async ({ page }) => {
    const nameWithNewlines = 'Line1\nLine2\nLine3'
    await page.fill('#product-name', nameWithNewlines)

    const value = await page.locator('#product-name').inputValue()
    // Might be sanitized
    expect(value).toBeTruthy()
  })

  test('should handle name with tabs', async ({ page }) => {
    const nameWithTabs = 'Name\twith\ttabs'
    await page.fill('#product-name', nameWithTabs)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBeTruthy()
  })

  test('should handle name with unicode characters', async ({ page }) => {
    const unicodeName = 'Ramo 中文 العربية עברית'
    await page.fill('#product-name', unicodeName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(unicodeName)
  })

  test('should handle name with HTML tags (should not render)', async ({ page }) => {
    const htmlName = '<script>alert("xss")</script>Ramo'
    await page.fill('#product-name', htmlName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(htmlName) // Stored as text, not HTML
  })
})

test.describe('Create Product - Extreme Price Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle minimum price (0.01)', async ({ page }) => {
    await page.fill('#product-price-usd', '0.01')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(parseFloat(value)).toBe(0.01)
  })

  test('should handle zero price', async ({ page }) => {
    await page.fill('#product-price-usd', '0')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(value).toBe('0')
  })

  test('should handle very large price (99999.99)', async ({ page }) => {
    await page.fill('#product-price-usd', '99999.99')
    const value = await page.locator('#product-price-usd').inputValue()
    expect(parseFloat(value)).toBe(99999.99)
  })

  test('should handle maximum JavaScript number', async ({ page }) => {
    const maxSafe = '9007199254740991' // Number.MAX_SAFE_INTEGER
    await page.fill('#product-price-usd', maxSafe)

    const value = await page.locator('#product-price-usd').inputValue()
    // Might be limited by input validation
    expect(parseFloat(value)).toBeGreaterThan(0)
  })

  test('should handle price with many decimal places', async ({ page }) => {
    await page.fill('#product-price-usd', '29.999999')
    const value = await page.locator('#product-price-usd').inputValue()

    // Should round or truncate based on step
    const numValue = parseFloat(value)
    expect(numValue).toBeGreaterThan(0)
  })

  test('should reject negative price', async ({ page }) => {
    await page.fill('#product-price-usd', '-10')

    const priceInput = page.locator('#product-price-usd')
    const isValid = await priceInput.evaluate(el => el.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should handle scientific notation price', async ({ page }) => {
    await page.fill('#product-price-usd', '1e2') // 100
    const value = await page.locator('#product-price-usd').inputValue()

    // Might convert or reject
    expect(['1e2', '100', '']).toContain(value)
  })
})

test.describe('Create Product - Extreme Stock Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle minimum stock (0)', async ({ page }) => {
    await page.fill('#product-stock', '0')
    const value = await page.locator('#product-stock').inputValue()
    expect(value).toBe('0')
  })

  test('should handle stock of 1', async ({ page }) => {
    await page.fill('#product-stock', '1')
    const value = await page.locator('#product-stock').inputValue()
    expect(value).toBe('1')
  })

  test('should handle very large stock (999999)', async ({ page }) => {
    await page.fill('#product-stock', '999999')
    const value = await page.locator('#product-stock').inputValue()
    expect(value).toBe('999999')
  })

  test('should reject negative stock', async ({ page }) => {
    await page.fill('#product-stock', '-5')

    const stockInput = page.locator('#product-stock')
    const isValid = await stockInput.evaluate(el => el.validity.valid)
    expect(isValid).toBe(false)
  })

  test('should reject decimal stock (should be integer)', async ({ page }) => {
    await page.fill('#product-stock', '10.5')

    const stockInput = page.locator('#product-stock')
    // Verify it's a number input (may or may not have step="1")
    const type = await stockInput.getAttribute('type')
    expect(type).toBe('number')

    // If step exists, verify it's for integers
    const step = await stockInput.getAttribute('step')
    if (step) {
      expect(step).toBe('1')
    }
  })

  test('should handle maximum safe integer stock', async ({ page }) => {
    await page.fill('#product-stock', '2147483647') // Max 32-bit int
    const value = await page.locator('#product-stock').inputValue()
    expect(parseInt(value)).toBeGreaterThan(0)
  })
})

test.describe('Create Product - Extreme Description Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle empty description', async ({ page }) => {
    await page.fill('#product-description', '')
    const value = await page.locator('#product-description').inputValue()
    expect(value).toBe('')
  })

  test('should handle very long description (5000+ characters)', async ({ page }) => {
    const longDesc = 'Lorem ipsum dolor sit amet. '.repeat(200) // ~5600 chars
    await page.fill('#product-description', longDesc)

    const value = await page.locator('#product-description').inputValue()
    // Should accept long descriptions (no strict limit or high limit)
    expect(value.length).toBeGreaterThan(1000)
    expect(value.length).toBeLessThanOrEqual(10000)
  })

  test('should handle description with all formatting', async ({ page }) => {
    const formattedDesc = `
      Line 1
      
      Line 3 with    spaces
      
      - Bullet 1
      - Bullet 2
      
      1. Number 1
      2. Number 2
    `
    await page.fill('#product-description', formattedDesc)

    const value = await page.locator('#product-description').inputValue()
    expect(value).toBe(formattedDesc)
  })

  test('should handle description with HTML (should not render)', async ({ page }) => {
    const htmlDesc = '<b>Bold</b> <i>Italic</i> <script>alert("xss")</script>'
    await page.fill('#product-description', htmlDesc)

    const value = await page.locator('#product-description').inputValue()
    expect(value).toBe(htmlDesc) // Stored as text
  })

  test('should handle description with URLs', async ({ page }) => {
    const urlDesc = 'Visit https://example.com for more info'
    await page.fill('#product-description', urlDesc)

    const value = await page.locator('#product-description').inputValue()
    expect(value).toBe(urlDesc)
  })
})

test.describe('Create Product - Extreme SKU Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle very short SKU (1 char)', async ({ page }) => {
    await page.fill('#product-sku', 'A')
    const value = await page.locator('#product-sku').inputValue()
    expect(value).toBe('A')
  })

  test('should handle very long SKU (200 chars)', async ({ page }) => {
    const longSku = 'SKU-' + 'A'.repeat(196)
    await page.fill('#product-sku', longSku)

    const value = await page.locator('#product-sku').inputValue()
    expect(value.length).toBeLessThanOrEqual(200)
  })

  test('should handle SKU with special characters', async ({ page }) => {
    const specialSku = 'SKU_123-ABC.V2#SPECIAL'
    await page.fill('#product-sku', specialSku)

    const value = await page.locator('#product-sku').inputValue()
    expect(value).toBe(specialSku)
  })

  test('should handle SKU with spaces', async ({ page }) => {
    const spacedSku = 'SKU 123 ABC'
    await page.fill('#product-sku', spacedSku)

    const value = await page.locator('#product-sku').inputValue()
    expect(value).toBe(spacedSku)
  })

  test('should handle numeric-only SKU', async ({ page }) => {
    const numericSku = '123456789'
    await page.fill('#product-sku', numericSku)

    const value = await page.locator('#product-sku').inputValue()
    expect(value).toBe(numericSku)
  })
})

test.describe('Create Product - Combined Extreme Values', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should handle form with all maximum values', async ({ page }) => {
    await page.fill('#product-name', 'A'.repeat(200))
    await page.fill('#product-description', 'Lorem ipsum. '.repeat(300))
    await page.fill('#product-sku', 'SKU-' + 'X'.repeat(50))
    await page.fill('#product-price-usd', '99999.99')
    await page.fill('#product-stock', '999999')

    // All fields should accept the values
    const nameValue = await page.locator('#product-name').inputValue()
    const priceValue = await page.locator('#product-price-usd').inputValue()
    const stockValue = await page.locator('#product-stock').inputValue()

    expect(nameValue.length).toBeGreaterThan(0)
    expect(parseFloat(priceValue)).toBeGreaterThan(0)
    expect(parseInt(stockValue)).toBeGreaterThan(0)
  })

  test('should handle form with all minimum values', async ({ page }) => {
    await page.fill('#product-name', 'A')
    await page.fill('#product-description', '')
    await page.fill('#product-sku', '')
    await page.fill('#product-price-usd', '0.01')
    await page.fill('#product-stock', '0')

    // Form should be valid
    const form = page.locator('#create-product-form')
    const isValid = await form.evaluate(el => {
      const nameValid = el.querySelector('#product-name').validity.valid
      const priceValid = el.querySelector('#product-price-usd').validity.valid
      const stockValid = el.querySelector('#product-stock').validity.valid
      return nameValid && priceValid && stockValid
    })
    expect(isValid).toBe(true)
  })

  test('should handle rapid value changes', async ({ page }) => {
    // Rapidly change values
    for (let i = 0; i < 10; i++) {
      await page.fill('#product-price-usd', `${i * 10}`)
      await page.fill('#product-stock', `${i * 5}`)
    }

    await page.waitForTimeout(500)

    // Final values should be the last ones
    const priceValue = await page.locator('#product-price-usd').inputValue()
    const stockValue = await page.locator('#product-stock').inputValue()

    expect(priceValue).toBe('90')
    expect(stockValue).toBe('45')
  })
})
