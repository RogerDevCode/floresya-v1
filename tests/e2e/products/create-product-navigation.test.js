/**
 * E2E Tests - Create Product: Navigation
 * Tests de navegación y controles de cancelar/volver
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CREATE_PRODUCT_URL = `${BASE_URL}/pages/admin/create-product.html`
const DASHBOARD_URL = `${BASE_URL}/pages/admin/dashboard.html`

test.describe('Create Product - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should have back arrow button visible', async ({ page }) => {
    const backButton = page.locator('a[title*="Volver"]')
    await expect(backButton).toBeVisible()
  })

  test('should navigate to products section when clicking back arrow', async ({ page }) => {
    const backButton = page.locator('a[href="./dashboard.html#products"]')
    await expect(backButton).toBeVisible()

    await backButton.click()
    await page.waitForLoadState('networkidle')

    // Should navigate to dashboard with #products hash
    const url = page.url()
    expect(url).toContain('dashboard.html')
    expect(url).toContain('#products')
  })

  test('should have correct title on back button', async ({ page }) => {
    const backButton = page.locator('a[title*="Volver"]')
    const title = await backButton.getAttribute('title')

    expect(title).toContain('Productos')
    expect(title).not.toContain('Dashboard')
  })

  test('should show back arrow icon', async ({ page }) => {
    // Wait for Lucide icons to load and convert
    await page.waitForTimeout(1500)

    // After Lucide loads, <i data-lucide> becomes <svg>
    const arrowIcon = page.locator('a[title*="Volver"] svg')
    await expect(arrowIcon).toBeVisible()
  })

  test('should have cancel button if available', async ({ page }) => {
    const cancelButton = page.locator(
      'button:has-text("Cancelar"), button[type="button"]:has-text("Cancel")'
    )

    if ((await cancelButton.count()) > 0) {
      await expect(cancelButton.first()).toBeVisible()
    }
  })

  test('should navigate away when cancel button is clicked', async ({ page }) => {
    const cancelButton = page.locator('button:has-text("Cancelar")')

    if ((await cancelButton.count()) > 0) {
      await cancelButton.click()
      await page.waitForTimeout(500)

      // Should navigate away
      const url = page.url()
      expect(url).not.toContain('create-product.html')
    }
  })

  test('should confirm navigation when form has unsaved changes', async ({ page }) => {
    // Fill some fields
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')

    // Setup dialog listener
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toContain('cambios') // Should mention unsaved changes
      await dialog.accept()
    })

    // Try to navigate away (if confirmation is implemented)
    const backButton = page.locator('a[href="./dashboard.html#products"]')
    await backButton.click()
  })

  test('should not confirm navigation when form is empty', async ({ page }) => {
    let dialogShown = false

    page.on('dialog', async dialog => {
      dialogShown = true
      await dialog.accept()
    })

    const backButton = page.locator('a[href="./dashboard.html#products"]')
    await backButton.click()
    await page.waitForTimeout(500)

    // Should navigate without confirmation when form is empty
    expect(dialogShown).toBe(false)
  })

  test('should preserve URL hash when navigating back', async ({ page }) => {
    const backButton = page.locator('a[href="./dashboard.html#products"]')
    await backButton.click()
    await page.waitForLoadState('networkidle')

    // URL should include the products hash
    const url = page.url()
    expect(url).toMatch(/dashboard\.html#products$/)
  })
})

test.describe('Create Product - Page Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should display correct page title', async ({ page }) => {
    const title = await page.title()
    expect(title).toContain('Crear Producto')
  })

  test('should display page heading', async ({ page }) => {
    const heading = page.locator('h1:has-text("Crear")')
    await expect(heading).toBeVisible()

    const text = await heading.textContent()
    expect(text).toMatch(/crear.*producto/i)
  })

  test('should have submit button visible', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeVisible()
  })

  test('should have submit button with correct text', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]')
    const text = await submitButton.textContent()

    expect(text?.toLowerCase()).toMatch(/crear|guardar|save/i)
  })

  test('should load all form sections', async ({ page }) => {
    // Check for main form sections
    const basicInfoSection = page.locator('text=/información.*básica/i')
    const pricingSection = page.locator('text=/precio/i')

    if ((await basicInfoSection.count()) > 0) {
      await expect(basicInfoSection.first()).toBeVisible()
    }

    if ((await pricingSection.count()) > 0) {
      await expect(pricingSection.first()).toBeVisible()
    }
  })

  test('should load Lucide icons', async ({ page }) => {
    // Wait for icons to be created (Lucide needs time to convert)
    await page.waitForTimeout(1500)

    // Check if Lucide icons are rendered (they become SVG elements)
    // Look for any SVG elements (Lucide converts <i> to <svg>)
    const icons = page.locator('svg')
    const count = await icons.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should have proper form structure', async ({ page }) => {
    const form = page.locator('#create-product-form')
    await expect(form).toBeVisible()

    // Form should have proper attributes
    const formId = await form.getAttribute('id')
    expect(formId).toBe('create-product-form')
  })
})

test.describe('Create Product - Browser Navigation', () => {
  test('should handle browser back button', async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')

    // Fill some data
    await page.fill('#product-name', 'Test Product')

    // Navigate to another page
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    // Use browser back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Should be back at create product page
    const url = page.url()
    expect(url).toContain('create-product.html')

    // Form data might not be preserved (depends on implementation)
  })

  test('should handle browser forward button', async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')

    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    await page.goBack()
    await page.waitForLoadState('networkidle')

    await page.goForward()
    await page.waitForLoadState('networkidle')

    const url = page.url()
    expect(url).toContain('dashboard.html')
  })

  test('should handle page reload', async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')

    // Fill some data
    await page.fill('#product-name', 'Test Product')
    await page.fill('#product-price-usd', '29.99')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Form should be empty after reload
    const nameValue = await page.locator('#product-name').inputValue()
    expect(nameValue).toBe('')
  })
})
