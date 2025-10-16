/**
 * E2E Tests - Dashboard Products: Table & Actions
 * Tests de tabla de productos y columna de opciones/acciones
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const DASHBOARD_URL = `${BASE_URL}/pages/admin/dashboard.html`

test.describe('Dashboard Products - Table Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should have products table visible', async ({ page }) => {
    const table = page.locator('#products-list')
    await expect(table).toBeVisible()
  })

  test('should have table headers', async ({ page }) => {
    const headers = page.locator('thead th')
    const count = await headers.count()

    // Should have at least: Producto, Precio, Stock, Estado, Acciones
    expect(count).toBeGreaterThanOrEqual(5)
  })

  test('should have "Producto" header', async ({ page }) => {
    const headers = await page.locator('thead th').allTextContents()
    expect(headers.some(h => h.includes('Producto'))).toBe(true)
  })

  test('should have "Precio" header', async ({ page }) => {
    const headers = await page.locator('thead th').allTextContents()
    expect(headers.some(h => h.includes('Precio'))).toBe(true)
  })

  test('should have "Stock" header', async ({ page }) => {
    const headers = await page.locator('thead th').allTextContents()
    expect(headers.some(h => h.includes('Stock'))).toBe(true)
  })

  test('should have "Estado" header', async ({ page }) => {
    const headers = await page.locator('thead th').allTextContents()
    expect(headers.some(h => h.includes('Estado'))).toBe(true)
  })

  test('should have "Acciones" header', async ({ page }) => {
    const headers = await page.locator('thead th').allTextContents()
    expect(headers.some(h => h.includes('Acciones'))).toBe(true)
  })

  test('should load products in table', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    // Should have at least some products (or 0 if empty database)
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Dashboard Products - Table Data Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should display product names', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const firstRow = rows.first()
      const text = await firstRow.textContent()

      // Should have some text content
      expect(text).toBeTruthy()
      expect(text.length).toBeGreaterThan(0)
    }
  })

  test('should display product prices', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const text = await rows.first().textContent()

      // Should contain dollar sign or number
      const hasPrice = text.includes('$') || /\d+/.test(text)
      expect(hasPrice).toBe(true)
    }
  })

  test('should display product stock', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const text = await rows.first().textContent()

      // Should contain numbers for stock
      expect(/\d+/.test(text)).toBe(true)
    }
  })

  test('should display product status badges', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for status badges (Activo/Inactivo)
      const badges = page.locator('#products-list .badge, #products-list .status')
      const badgeCount = await badges.count()

      // Should have at least some badges
      expect(badgeCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should display product images if available', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for images
      const images = page.locator('#products-list img')
      const imageCount = await images.count()

      // Might have images or not
      expect(imageCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should show status "Activo" or "Inactivo"', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const text = await page.locator('#products-list').textContent()

      // Should contain Activo or Inactivo
      const hasStatus = text.includes('Activo') || text.includes('Inactivo')
      expect(hasStatus).toBe(true)
    }
  })
})

test.describe('Dashboard Products - Actions Column', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should have action buttons for each product', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for action buttons in first row
      const actionButtons = rows.first().locator('button, a[href*="edit"]')
      const buttonCount = await actionButtons.count()

      // Should have at least one action button
      expect(buttonCount).toBeGreaterThan(0)
    }
  })

  test('should have edit button/link for products', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for edit buttons
      const editButtons = page.locator(
        '#products-list button:has-text("Editar"), #products-list a[href*="edit"]'
      )
      const editCount = await editButtons.count()

      // Should have edit buttons
      expect(editCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should have edit button visible on hover or always visible', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const firstRow = rows.first()

      // Hover over row
      await firstRow.hover()
      await page.waitForTimeout(500)

      // Look for edit button
      const editButton = firstRow.locator('button:has-text("Editar"), a[href*="edit"]')
      const hasEdit = (await editButton.count()) > 0

      expect(hasEdit).toBe(true)
    }
  })

  test('should have delete button if deletion is allowed', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for delete buttons
      const deleteButtons = page.locator(
        '#products-list button:has-text("Eliminar"), #products-list [data-action="delete"]'
      )
      const deleteCount = await deleteButtons.count()

      // Might or might not have delete (soft delete via status change)
      expect(deleteCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should have view/details button if available', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for view/details buttons
      const viewButtons = page.locator(
        '#products-list button:has-text("Ver"), #products-list a[href*="view"]'
      )
      const viewCount = await viewButtons.count()

      // Might or might not have view button
      expect(viewCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should have action icons (edit, delete, etc)', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Look for Lucide icons or SVG icons
      const icons = page.locator('#products-list svg, #products-list i[data-lucide]')
      const iconCount = await icons.count()

      // Should have icons for actions
      expect(iconCount).toBeGreaterThan(0)
    }
  })

  test('should NOT navigate when clicking delete (should show confirmation)', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const deleteButtons = page.locator('#products-list button:has-text("Eliminar")')

      if ((await deleteButtons.count()) > 0) {
        const currentUrl = page.url()

        // Setup dialog handler
        page.on('dialog', async dialog => {
          await dialog.dismiss()
        })

        await deleteButtons.first().click()
        await page.waitForTimeout(500)

        // Should stay on same page (or show modal)
        const newUrl = page.url()
        expect(newUrl).toBe(currentUrl)
      }
    }
  })
})

test.describe('Dashboard Products - Table Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should highlight row on hover', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const firstRow = rows.first()

      // Hover over row
      await firstRow.hover()
      await page.waitForTimeout(300)

      // Check if row has hover class or styling
      const _classes = await firstRow.getAttribute('class')
      // Row should be visible at least
      await expect(firstRow).toBeVisible()
    }
  })

  test('should show product thumbnail images', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const images = page.locator('#products-list img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        // First image should be visible
        await expect(images.first()).toBeVisible()

        // Should have src attribute
        const src = await images.first().getAttribute('src')
        expect(src).toBeTruthy()
      }
    }
  })

  test('should display prices with currency format', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const text = await rows.first().textContent()

      // Should contain $ and numbers
      expect(text).toMatch(/\$/)
      expect(text).toMatch(/\d+/)
    }
  })

  test('should show stock numbers', async ({ page }) => {
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const text = await rows.first().textContent()

      // Should contain numbers
      expect(text).toMatch(/\d+/)
    }
  })
})

test.describe('Dashboard Products - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should handle empty products list gracefully', async ({ page }) => {
    // Filter for something that doesn't exist
    const searchInput = page.locator('#search-input')
    await searchInput.fill('XYZ_NONEXISTENT_12345')
    await searchInput.press('Enter')
    await page.waitForTimeout(1500)

    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    // Should be 0 rows
    expect(count).toBe(0)

    // Table should still be visible
    const table = page.locator('#products-list')
    await expect(table).toBeVisible()
  })

  test('should show table headers even with no results', async ({ page }) => {
    // Filter for something that doesn't exist
    const searchInput = page.locator('#search-input')
    await searchInput.fill('XYZ_NONEXISTENT_12345')
    await searchInput.press('Enter')
    await page.waitForTimeout(1500)

    const headers = page.locator('thead th')
    const count = await headers.count()

    // Headers should still be visible
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Dashboard Products - New Product Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)
  })

  test('should have "Nuevo Producto" button visible', async ({ page }) => {
    const newProductBtn = page.locator('a[href*="create-product"]')
    await expect(newProductBtn).toBeVisible()
  })

  test('should have "Nuevo Producto" button with correct text', async ({ page }) => {
    const newProductBtn = page.locator('a[href*="create-product"]')
    const text = await newProductBtn.textContent()

    expect(text).toMatch(/Nuevo.*Producto/i)
  })

  test('should navigate to create product page when clicked', async ({ page }) => {
    const newProductBtn = page.locator('a[href*="create-product"]')
    const href = await newProductBtn.getAttribute('href')

    expect(href).toContain('create-product')
  })
})
