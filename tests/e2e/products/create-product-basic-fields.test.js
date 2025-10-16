/**
 * E2E Tests - Create Product: Basic Fields
 * Tests de campos básicos del formulario
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CREATE_PRODUCT_URL = `${BASE_URL}/pages/admin/create-product.html`

test.describe('Create Product - Basic Fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should fill product name successfully', async ({ page }) => {
    const productName = 'Ramo de Rosas Rojas Premium'
    await page.fill('#product-name', productName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(productName)
  })

  test('should fill product description successfully', async ({ page }) => {
    const description = 'Hermoso ramo de 12 rosas rojas frescas, ideal para expresar amor y pasión.'
    await page.fill('#product-description', description)

    const value = await page.locator('#product-description').inputValue()
    expect(value).toBe(description)
  })

  test('should fill SKU successfully', async ({ page }) => {
    const sku = 'ROSES-RED-001'
    await page.fill('#product-sku', sku)

    const value = await page.locator('#product-sku').inputValue()
    expect(value).toBe(sku)
  })

  test('should fill stock successfully', async ({ page }) => {
    await page.fill('#product-stock', '50')

    const value = await page.locator('#product-stock').inputValue()
    expect(value).toBe('50')
  })

  test('should handle empty description (optional field)', async ({ page }) => {
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-stock', '50')
    // Don't fill description

    // Form should still be valid
    const form = page.locator('#create-product-form')
    const isValid = await form.evaluate(el => {
      const nameValid = el.querySelector('#product-name').validity.valid
      const priceValid = el.querySelector('#product-price-usd').validity.valid
      const stockValid = el.querySelector('#product-stock').validity.valid
      return nameValid && priceValid && stockValid
    })
    expect(isValid).toBe(true)
  })

  test('should handle empty SKU (optional field)', async ({ page }) => {
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-stock', '50')
    // Don't fill SKU

    // Form should still be valid
    const form = page.locator('#create-product-form')
    const isValid = await form.evaluate(el => {
      const nameValid = el.querySelector('#product-name').validity.valid
      const priceValid = el.querySelector('#product-price-usd').validity.valid
      const stockValid = el.querySelector('#product-stock').validity.valid
      return nameValid && priceValid && stockValid
    })
    expect(isValid).toBe(true)
  })

  test('should preserve filled values on focus loss', async ({ page }) => {
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')

    // Click elsewhere to lose focus
    await page.click('body')

    // Values should be preserved
    const nameValue = await page.locator('#product-name').inputValue()
    const priceValue = await page.locator('#product-price-usd').inputValue()

    expect(nameValue).toBe('Test Product')
    expect(priceValue).toBe('29.99')
  })

  test('should handle name with special characters', async ({ page }) => {
    const specialName = 'Ramo "Premium" - Rosas & Lirios (Especial)'
    await page.fill('#product-name', specialName)

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe(specialName)
  })

  test('should handle description with line breaks', async ({ page }) => {
    const multilineDesc = `Línea 1: Rosas rojas
Línea 2: Frescas del día
Línea 3: Entrega inmediata`

    await page.fill('#product-description', multilineDesc)

    const value = await page.locator('#product-description').inputValue()
    expect(value).toBe(multilineDesc)
  })

  test('should handle SKU with various formats', async ({ page }) => {
    const skuFormats = ['SIMPLE', 'WITH-DASHES', 'WITH_UNDERSCORES', 'MIX-123_ABC', 'lowercase-sku']

    for (const sku of skuFormats) {
      await page.fill('#product-sku', sku)
      const value = await page.locator('#product-sku').inputValue()
      expect(value).toBe(sku)
    }
  })

  test('should fill all basic fields together', async ({ page }) => {
    const productData = {
      name: 'Ramo de Rosas Rojas',
      description: 'Hermoso ramo de 12 rosas rojas frescas',
      sku: 'ROSES-RED-001',
      stock: '50'
    }

    await page.fill('#product-name', productData.name)
    await page.fill('#product-description', productData.description)
    await page.fill('#product-sku', productData.sku)
    await page.fill('#product-stock', productData.stock)

    // Verify all values
    expect(await page.locator('#product-name').inputValue()).toBe(productData.name)
    expect(await page.locator('#product-description').inputValue()).toBe(productData.description)
    expect(await page.locator('#product-sku').inputValue()).toBe(productData.sku)
    expect(await page.locator('#product-stock').inputValue()).toBe(productData.stock)
  })

  test('should toggle featured checkbox', async ({ page }) => {
    const featuredCheckbox = page.locator('#product-featured')

    if ((await featuredCheckbox.count()) > 0) {
      // Initially unchecked
      const initiallyChecked = await featuredCheckbox.isChecked()
      expect(initiallyChecked).toBe(false)

      // Check it
      await featuredCheckbox.check()
      expect(await featuredCheckbox.isChecked()).toBe(true)

      // Uncheck it
      await featuredCheckbox.uncheck()
      expect(await featuredCheckbox.isChecked()).toBe(false)
    }
  })

  test('should toggle active checkbox', async ({ page }) => {
    const activeCheckbox = page.locator('#product-active')

    if ((await activeCheckbox.count()) > 0) {
      // Check initial state
      const initiallyChecked = await activeCheckbox.isChecked()

      // Toggle it
      await activeCheckbox.click()
      const afterClick = await activeCheckbox.isChecked()
      expect(afterClick).toBe(!initiallyChecked)
    }
  })
})

test.describe('Create Product - Field Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should clear name field', async ({ page }) => {
    await page.fill('#product-name', 'Initial Name')
    await page.fill('#product-name', '')

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe('')
  })

  test('should update name field value', async ({ page }) => {
    await page.fill('#product-name', 'Initial Name')
    await page.fill('#product-name', 'Updated Name')

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe('Updated Name')
  })

  test('should handle rapid field changes', async ({ page }) => {
    // Fill fields rapidly
    await page.fill('#product-name', 'Test')
    await page.fill('#product-price-usd', '10')
    await page.fill('#product-stock', '5')
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-stock', '50')

    // Final values should be the last ones
    expect(await page.locator('#product-name').inputValue()).toBe('Test Product')
    expect(await page.locator('#product-price-usd').inputValue()).toBe('29.99')
    expect(await page.locator('#product-stock').inputValue()).toBe('50')
  })

  test('should handle tab navigation between fields', async ({ page }) => {
    await page.focus('#product-name')
    await page.keyboard.type('Test Product')

    // Tab to next field
    await page.keyboard.press('Tab')

    // Should focus description
    const focusedElement = await page.evaluate(() => document.activeElement.id)
    expect(focusedElement).toBe('product-description')
  })

  test('should support keyboard shortcuts (if any)', async ({ page }) => {
    // Test Ctrl+A to select all in name field
    await page.fill('#product-name', 'Test Product')
    await page.focus('#product-name')
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Delete')

    const value = await page.locator('#product-name').inputValue()
    expect(value).toBe('')
  })
})
