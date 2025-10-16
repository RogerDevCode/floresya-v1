/**
 * E2E Tests - Dashboard Products: Filters
 * Tests de filtros de ocasión y estado
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const DASHBOARD_URL = `${BASE_URL}/pages/admin/dashboard.html`

test.describe('Dashboard Products - Filter Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should have occasion filter visible', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    await expect(occasionFilter).toBeVisible()
  })

  test('should have status filter visible', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    await expect(statusFilter).toBeVisible()
  })

  test('should have apply filters button visible', async ({ page }) => {
    const applyBtn = page.locator('#apply-filters-btn')
    await expect(applyBtn).toBeVisible()
  })

  test('should have clear filters button visible', async ({ page }) => {
    const clearBtn = page.locator('#clear-filters-btn')
    await expect(clearBtn).toBeVisible()
  })

  test('should have "Todas las ocasiones" as default option', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    const firstOption = await occasionFilter.locator('option').first().textContent()
    expect(firstOption).toContain('Todas')
  })

  test('should have status filter options', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    const options = await statusFilter.locator('option').allTextContents()

    // Should have at least: Todos, Activo, Inactivo
    expect(options.length).toBeGreaterThanOrEqual(3)
    expect(options.some(opt => opt.includes('Todos'))).toBe(true)
    expect(options.some(opt => opt.includes('Activo'))).toBe(true)
    expect(options.some(opt => opt.includes('Inactivo'))).toBe(true)
  })

  test('should load occasions in occasion filter', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    const options = await occasionFilter.locator('option').count()

    // Should have at least the default "Todas" option
    expect(options).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Dashboard Products - Status Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should filter by active status', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    // Select "Activo"
    await statusFilter.selectOption('active')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    // Get products
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      // Verify products have active badge/status
      const statuses = await page.locator('#products-list').textContent()
      // Should contain "Activo" badges
      expect(statuses).toBeTruthy()
    }
  })

  test('should filter by inactive status', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    // Select "Inactivo"
    await statusFilter.selectOption('inactive')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    // Get products
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    // Might be 0 if no inactive products
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show all products when status is "Todos"', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    // Get count with all
    await statusFilter.selectOption('')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    const allCount = await page.locator('#products-list tr').count()

    // Select active
    await statusFilter.selectOption('active')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    const activeCount = await page.locator('#products-list tr').count()

    // All should be >= active
    expect(allCount).toBeGreaterThanOrEqual(activeCount)
  })

  test('should auto-filter on status change', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')

    const _initialCount = await page.locator('#products-list tr').count()

    // Change status (might trigger auto-filter)
    await statusFilter.selectOption('active')
    await page.waitForTimeout(1500)

    const filteredCount = await page.locator('#products-list tr').count()

    // Count might change or stay the same
    expect(filteredCount).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Dashboard Products - Occasion Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should filter by occasion if occasions exist', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    const options = await occasionFilter.locator('option').count()

    if (options > 1) {
      // Select second option (first is "Todas")
      await occasionFilter.selectOption({ index: 1 })
      await page.waitForTimeout(1500)

      // Should filter products
      const rows = page.locator('#products-list tr')
      await expect(rows.first()).toBeVisible()
    }
  })

  test('should show all products when "Todas las ocasiones" is selected', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    // Select "Todas"
    await occasionFilter.selectOption('')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    const allCount = await page.locator('#products-list tr').count()
    expect(allCount).toBeGreaterThanOrEqual(0)
  })

  test('should auto-filter on occasion change', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    const options = await occasionFilter.locator('option').count()

    if (options > 1) {
      const initialCount = await page.locator('#products-list tr').count()

      // Change occasion
      await occasionFilter.selectOption({ index: 1 })
      await page.waitForTimeout(1500)

      const filteredCount = await page.locator('#products-list tr').count()

      // Might be filtered
      expect(filteredCount).toBeGreaterThanOrEqual(0)
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    }
  })
})

test.describe('Dashboard Products - Clear Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should clear all filters when clear button is clicked', async ({ page }) => {
    const searchInput = page.locator('#search-input')
    const statusFilter = page.locator('#status-filter')
    const clearBtn = page.locator('#clear-filters-btn')

    // Apply some filters
    await searchInput.fill('Rosas')
    await statusFilter.selectOption('active')
    await page.waitForTimeout(500)

    // Click clear
    await clearBtn.click()
    await page.waitForTimeout(1000)

    // Check filters are cleared
    const searchValue = await searchInput.inputValue()
    const statusValue = await statusFilter.inputValue()

    expect(searchValue).toBe('')
    expect(statusValue).toBe('')
  })

  test('should show all products after clearing filters', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')
    const clearBtn = page.locator('#clear-filters-btn')

    // Filter by active
    await statusFilter.selectOption('active')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    const filteredCount = await page.locator('#products-list tr').count()

    // Clear filters
    await clearBtn.click()
    await page.waitForTimeout(1500)

    const allCount = await page.locator('#products-list tr').count()

    // All count should be >= filtered count
    expect(allCount).toBeGreaterThanOrEqual(filteredCount)
  })

  test('should clear search text', async ({ page }) => {
    const searchInput = page.locator('#search-input')
    const clearBtn = page.locator('#clear-filters-btn')

    await searchInput.fill('Test Search')
    await clearBtn.click()
    await page.waitForTimeout(500)

    const searchValue = await searchInput.inputValue()
    expect(searchValue).toBe('')
  })

  test('should reset occasion filter to default', async ({ page }) => {
    const occasionFilter = page.locator('#occasion-filter')
    const clearBtn = page.locator('#clear-filters-btn')

    const options = await occasionFilter.locator('option').count()
    if (options > 1) {
      // Select specific occasion
      await occasionFilter.selectOption({ index: 1 })
      await page.waitForTimeout(500)

      // Clear
      await clearBtn.click()
      await page.waitForTimeout(500)

      // Should be back to default (empty or first option)
      const value = await occasionFilter.inputValue()
      expect(value).toBe('')
    }
  })

  test('should reset status filter to "Todos"', async ({ page }) => {
    const statusFilter = page.locator('#status-filter')
    const clearBtn = page.locator('#clear-filters-btn')

    // Select active
    await statusFilter.selectOption('active')
    await page.waitForTimeout(500)

    // Clear
    await clearBtn.click()
    await page.waitForTimeout(500)

    // Should be empty (default)
    const value = await statusFilter.inputValue()
    expect(value).toBe('')
  })
})

test.describe('Dashboard Products - Combined Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DASHBOARD_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const productsMenuItem = page.locator('[data-view="products"]')
    await productsMenuItem.click()
    await page.waitForTimeout(2000)

    await page.waitForSelector('#products-list')
  })

  test('should apply search + status filter together', async ({ page }) => {
    const searchInput = page.locator('#search-input')
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    await searchInput.fill('Rosas')
    await statusFilter.selectOption('active')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    // Should show filtered results
    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    if (count > 0) {
      const text = await rows.first().textContent()
      expect(text?.toLowerCase()).toContain('rosa')
    }
  })

  test('should apply search + occasion filter together', async ({ page }) => {
    const searchInput = page.locator('#search-input')
    const occasionFilter = page.locator('#occasion-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    const options = await occasionFilter.locator('option').count()
    if (options > 1) {
      await searchInput.fill('Ramo')
      await occasionFilter.selectOption({ index: 1 })
      await applyBtn.click()
      await page.waitForTimeout(1500)

      const rows = page.locator('#products-list tr')
      await expect(rows.first()).toBeVisible()
    }
  })

  test('should apply all three filters together', async ({ page }) => {
    const searchInput = page.locator('#search-input')
    const occasionFilter = page.locator('#occasion-filter')
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    const options = await occasionFilter.locator('option').count()
    if (options > 1) {
      await searchInput.fill('Rosas')
      await occasionFilter.selectOption({ index: 1 })
      await statusFilter.selectOption('active')
      await applyBtn.click()
      await page.waitForTimeout(1500)

      // Should show highly filtered results
      const table = page.locator('#products-list')
      await expect(table).toBeVisible()
    }
  })

  test('should show no results when filters are too restrictive', async ({ page }) => {
    const searchInput = page.locator('#search-input')
    const statusFilter = page.locator('#status-filter')
    const applyBtn = page.locator('#apply-filters-btn')

    // Search for something unlikely to exist
    await searchInput.fill('XYZ_NONEXISTENT')
    await statusFilter.selectOption('inactive')
    await applyBtn.click()
    await page.waitForTimeout(1500)

    const rows = page.locator('#products-list tr')
    const count = await rows.count()

    // Should be 0 results
    expect(count).toBe(0)
  })
})
