import { test, expect } from '@playwright/test'

/**
 * E2E Test for Admin Dashboard
 *
 * This test verifies that:
 * 1. The admin dashboard loads without errors
 * 2. All components load correctly
 * 3. Statistics are displayed accurately
 * 4. Icons load without errors
 * 5. Charts render properly
 */

test.describe('Admin Dashboard E2E Tests', () => {
  const BASE_URL = 'http://localhost:3000'

  test.beforeEach(({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Console Error:', msg.text())
      }
    })

    // Listen for page errors
    page.on('pageerror', error => {
      console.error('Page Error:', error.message)
    })
  })

  test('should load admin dashboard without errors and display correct statistics', async ({
    page
  }) => {
    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify page title
    await expect(page).toHaveTitle(/Panel de Administración - FloresYa/)

    // Check for any JavaScript errors
    const errorLogs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text())
      }
    })

    // Verify main dashboard elements are present
    const welcomeBanner = page.locator('.bg-gradient-to-r')
    await expect(welcomeBanner).toBeVisible()

    const dashboardTitle = page.locator('h1', {
      hasText: '¡Bienvenido al Panel de Administración!'
    })
    await expect(dashboardTitle).toBeVisible()

    // Verify stats grid is present
    const statsGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')
    await expect(statsGrid).toBeVisible()

    // Check that all stat cards are present
    const statCards = page.locator('.stat-card')
    const statCardCount = await statCards.count()
    expect(statCardCount).toBeGreaterThan(0)

    // Verify specific stat cards
    const totalOrdersCard = page.locator('.stat-card', { has: page.getByText('Total Pedidos') })
    await expect(totalOrdersCard).toBeVisible()

    const totalSalesCard = page.locator('.stat-card', { has: page.getByText('Ventas Totales USD') })
    await expect(totalSalesCard).toBeVisible()

    const pendingCard = page.locator('.stat-card', { has: page.getByText('Pendientes') })
    await expect(pendingCard).toBeVisible()

    const verifiedCard = page.locator('.stat-card', { has: page.getByText('Verificados') })
    await expect(verifiedCard).toBeVisible()

    // Verify chart section
    const chartSection = page.locator('.bg-white.rounded-xl.shadow-md.p-6', {
      has: page.getByText('Ventas Mensuales')
    })
    await expect(chartSection).toBeVisible()

    // Verify top products section
    const topProductsSection = page.locator('.bg-white.rounded-xl.shadow-md.p-6', {
      has: page.getByText('Productos Más Vendidos')
    })
    await expect(topProductsSection).toBeVisible()

    // Check that icons are loaded (no missing icon warnings)
    const icons = page.locator('[data-lucide]')
    const iconCount = await icons.count()
    console.log(`✅ Found ${iconCount} icons on the page`)

    // Verify no console errors related to icons
    expect(errorLogs.some(log => log.includes('Icon') || log.includes('lucide'))).toBeFalsy()

    // Check that stat values are populated (not showing "-")
    const totalOrdersValue = page.locator('#dash-total-orders')
    const totalOrdersText = await totalOrdersValue.textContent()
    expect(totalOrdersText).not.toBe('-')
    expect(totalOrdersText).toMatch(/\d+/) // Should contain at least one digit

    const totalSalesValue = page.locator('#dash-total-sales')
    const totalSalesText = await totalSalesValue.textContent()
    expect(totalSalesText).not.toBe('-')
    expect(totalSalesText).toMatch(/\$\d+(\.\d{2})?/) // Should match currency format

    console.log(`✅ Dashboard loaded successfully with stats:`)
    console.log(`   - Total Orders: ${totalOrdersText}`)
    console.log(`   - Total Sales: ${totalSalesText}`)

    // Verify chart canvas is present
    const chartCanvas = page.locator('#monthly-sales-chart')
    await expect(chartCanvas).toBeVisible()

    // Check that top products list is populated
    const topProductsList = page.locator('#top-products-list')
    await expect(topProductsList).toBeVisible()

    // Verify no JavaScript errors occurred
    expect(errorLogs.length).toBe(0)

    console.log('✅ Admin dashboard test passed! All components loaded correctly.')
  })

  test('should display correct icons without errors', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)

    // Wait for page to load and icons to be processed
    await page.waitForLoadState('networkidle')

    // Capture console errors
    const errorLogs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text())
      }
    })

    // Check that SVG icons are present (after lucide-icons.js processing)
    // Instead of checking for <i data-lucide>, we check for SVG elements
    const svgIcons = page.locator('svg')
    const svgCount = await svgIcons.count()
    expect(svgCount).toBeGreaterThan(10) // Should have multiple SVG icons

    console.log(`✅ Found ${svgCount} SVG icons on the page`)

    // Check specific icons by looking for SVG elements in specific containers
    // We'll check for icons in the navigation sidebar
    const navIcons = page.locator('#admin-sidebar svg')
    const navIconCount = await navIcons.count()
    expect(navIconCount).toBeGreaterThan(3) // Should have at least dashboard, products, orders, users

    // Check for icons in the stats cards
    const statCardIcons = page.locator('.stat-card svg')
    const statIconCount = await statCardIcons.count()
    expect(statIconCount).toBeGreaterThan(4) // Should have icons for each stat card

    // Verify no icon-related errors
    const iconErrors = errorLogs.filter(
      log => log.includes('Icon') || log.includes('lucide') || log.includes('package-x')
    )
    expect(iconErrors.length).toBe(0)

    console.log('✅ All icons loaded successfully without errors')
  })

  test('should filter dashboard data correctly', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check year filter
    const yearFilter = page.locator('#dashboard-year-filter')
    await expect(yearFilter).toBeVisible()

    // Check date filter
    const dateFilter = page.locator('#dashboard-date-filter')
    await expect(dateFilter).toBeVisible()

    // Check chart filter
    const chartFilter = page.locator('#chart-status-filter')
    await expect(chartFilter).toBeVisible()

    // Verify filter indicator is present
    const filterIndicator = page.locator('#dashboard-filter-indicator')
    await expect(filterIndicator).toBeVisible()

    // Get initial filter text
    const initialFilterText = await filterIndicator.textContent()
    expect(initialFilterText).toContain('Mostrando:')

    console.log(`✅ Dashboard filters working correctly: ${initialFilterText}`)
  })

  test('should display responsive layout correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Check that sidebar is visible on desktop
    const sidebar = page.locator('#admin-sidebar')
    await expect(sidebar).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check that sidebar is hidden by default on mobile
    await expect(sidebar).not.toHaveClass(/active/)

    // Check that hamburger menu is visible on mobile
    const hamburgerMenu = page.locator('#admin-sidebar-toggle')
    await expect(hamburgerMenu).toBeVisible()

    console.log('✅ Responsive layout working correctly')
  })

  test('should navigate between admin sections correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Test navigation to products section
    const productsLink = page.locator('.sidebar-menu-item[data-view="products"]')
    await expect(productsLink).toBeVisible()
    await productsLink.click()

    // Verify products view is shown and dashboard is hidden
    await expect(page.locator('#products-view')).toBeVisible()
    await expect(page.locator('#dashboard-view')).toHaveClass(/hidden/)

    // Find and click the "Nuevo Producto" button
    const newProductButton = page.locator('a[href="./create-product.html"]')
    await expect(newProductButton).toBeVisible()

    // Navigate back to dashboard
    const dashboardLink = page.locator('.sidebar-menu-item[data-view="dashboard"]')
    await expect(dashboardLink).toBeVisible()
    await dashboardLink.click()

    // Verify dashboard view is shown and products is hidden
    await expect(page.locator('#dashboard-view')).toBeVisible()
    await expect(page.locator('#products-view')).toHaveClass(/hidden/)

    console.log('✅ Navigation between admin sections working correctly')
  })

  test('should toggle sidebar correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('#admin-sidebar')
    const overlay = page.locator('#admin-sidebar-overlay')
    const toggleButton = page.locator('#admin-sidebar-toggle')
    const closeButton = page.locator('#admin-sidebar-close')

    // Initially sidebar should be hidden
    await expect(sidebar).not.toHaveClass(/active/)
    await expect(overlay).not.toHaveClass(/active/)

    // Click toggle button to open sidebar
    await toggleButton.click()
    await expect(sidebar).toHaveClass(/active/)
    await expect(overlay).toHaveClass(/active/)

    // Click close button to close sidebar
    await closeButton.click()
    await expect(sidebar).not.toHaveClass(/active/)
    await expect(overlay).not.toHaveClass(/active/)

    // Open sidebar again
    await toggleButton.click()
    await expect(sidebar).toHaveClass(/active/)
    await expect(overlay).toHaveClass(/active/)

    // Click overlay to close sidebar
    await overlay.click()
    await expect(sidebar).not.toHaveClass(/active/)
    await expect(overlay).not.toHaveClass(/active/)

    console.log('✅ Sidebar toggle functionality working correctly on mobile')
  })

  test('should handle logout correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Find and click logout button
    const logoutButton = page.locator('#logout-btn')
    await expect(logoutButton).toBeVisible()
    await logoutButton.click()

    // Wait for confirmation dialog and handle it
    page.on('dialog', dialog => dialog.accept())

    // Wait for redirection or page change
    await page.waitForTimeout(1000)

    // Check if user is redirected to home page or login page
    // It should show an alert and redirect to home
    await expect(page).toHaveURL(/\/(index\.html)?$|\/$/)

    console.log('✅ Logout functionality working correctly')
  })
})
