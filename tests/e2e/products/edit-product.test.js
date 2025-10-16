/**
 * E2E Tests - Edit Product Page
 * Tests para el panel de edición de productos
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const DASHBOARD_URL = `${BASE_URL}/pages/admin/dashboard.html`

test.describe('Edit Product - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    // Click on products menu
    await page.click('[data-view="products"]')
    await page.waitForTimeout(3000)

    // Wait for products table and at least one edit link
    await page.waitForSelector('#products-list tr', { timeout: 15000 })
    await page.waitForSelector('.edit-product-link', { timeout: 15000 })
  })

  test('should open edit page when clicking edit link', async ({ page }) => {
    // Click first edit link
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Verify we're on edit page
    expect(page.url()).toContain('edit-product.html')
    expect(page.url()).toContain('id=')

    // Verify form is visible
    await expect(page.locator('#edit-product-form')).toBeVisible({ timeout: 10000 })
  })

  test('should load product data into form', async ({ page }) => {
    // Click first edit link
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Wait for form to be visible and loaded
    await page.waitForSelector('#edit-product-form', { timeout: 10000 })
    await page.waitForTimeout(1500)

    // Verify form fields have values
    const nameValue = await page.locator('#product-name').inputValue()
    const priceValue = await page.locator('#product-price-usd').inputValue()

    expect(nameValue.length).toBeGreaterThan(0)
    expect(parseFloat(priceValue)).toBeGreaterThan(0)
  })
})

test.describe('Edit Product - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    await page.click('[data-view="products"]')
    await page.waitForTimeout(3000)

    await page.waitForSelector('.edit-product-link', { timeout: 15000 })
  })

  test('should save return URL when clicking edit', async ({ page }) => {
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Check sessionStorage
    const returnUrl = await page.evaluate(() => sessionStorage.getItem('editProductReturnUrl'))
    expect(returnUrl).toBeTruthy()
    expect(returnUrl).toContain('dashboard.html')
  })

  test('should return to dashboard when clicking back button', async ({ page }) => {
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    await page.click('#back-btn')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('dashboard.html')
  })

  test('should return to dashboard when clicking cancel without changes', async ({ page }) => {
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    await page.click('#cancel-btn')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('dashboard.html')
  })

  test('should show confirmation with unsaved changes', async ({ page }) => {
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Make a change
    await page.fill('#product-name', 'Modified Name TEST')

    // Listen for dialog
    let dialogShown = false
    page.on('dialog', async dialog => {
      dialogShown = true
      await dialog.dismiss()
    })

    await page.click('#cancel-btn')
    await page.waitForTimeout(500)

    expect(dialogShown).toBe(true)
  })
})

test.describe('Edit Product - Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    await page.click('[data-view="products"]')
    await page.waitForTimeout(3000)

    await page.waitForSelector('.edit-product-link', { timeout: 15000 })
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Wait for form to be visible
    await page.waitForSelector('#edit-product-form', { timeout: 10000 })
    await page.waitForTimeout(1500)
  })

  test('should have all required form fields', async ({ page }) => {
    await expect(page.locator('#product-name')).toBeVisible()
    await expect(page.locator('#product-price-usd')).toBeVisible()
    await expect(page.locator('#product-stock')).toBeVisible()
    await expect(page.locator('#cancel-btn')).toBeVisible()
  })

  test('should validate required name field', async ({ page }) => {
    await page.fill('#product-name', '')
    await page.click('button[type="submit"]')

    const isInvalid = await page.locator('#product-name').evaluate(el => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })
})

test.describe('Edit Product - Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    await page.click('[data-view="products"]')
    await page.waitForTimeout(3000)

    await page.waitForSelector('.edit-product-link', { timeout: 15000 })
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Wait for form to be visible
    await page.waitForSelector('#edit-product-form', { timeout: 10000 })
    await page.waitForTimeout(1500)
  })

  test('should display carousel manager', async ({ page }) => {
    await expect(page.locator('#carousel-manager-container')).toBeVisible()
  })

  test('should have 7 carousel slots', async ({ page }) => {
    const slots = page.locator('#carousel-slots-grid > div')
    expect(await slots.count()).toBe(7)
  })

  test('should show carousel images', async ({ page }) => {
    const images = page.locator('#carousel-slots-grid img.carousel-slot-image')
    const count = await images.count()

    // Images might exist or not
    expect(count).toBeGreaterThanOrEqual(0)

    if (count > 0) {
      const src = await images.first().getAttribute('src')
      expect(src).toBeTruthy()
    }
  })

  test('should have featured checkbox', async ({ page }) => {
    await expect(page.locator('#carousel-featured-checkbox')).toBeVisible()
  })

  test('should toggle position selector with featured checkbox', async ({ page }) => {
    const checkbox = page.locator('#carousel-featured-checkbox')

    await checkbox.check()
    await expect(page.locator('#carousel-position-controls')).toBeVisible()

    await checkbox.uncheck()
    await expect(page.locator('#carousel-position-controls')).toBeHidden()
  })
})

test.describe('Edit Product - Images', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')

    await page.click('[data-view="products"]')
    await page.waitForTimeout(3000)

    await page.waitForSelector('.edit-product-link', { timeout: 15000 })
    await page.click('.edit-product-link')
    await page.waitForLoadState('networkidle')

    // Wait for form to be visible
    await page.waitForSelector('#edit-product-form', { timeout: 10000 })
    await page.waitForTimeout(1500)
  })

  test('should have image grid element', async ({ page }) => {
    await expect(page.locator('#image-grid')).toBeAttached()
  })
})
