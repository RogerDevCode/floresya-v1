import { test, expect } from '@playwright/test'

/**
 * TEST ATÓMICO 1: Verificar que la página de pedidos carga sin errores
 *
 * Objetivo:
 * - Verificar que la página carga correctamente
 * - No hay errores JavaScript en consola
 * - No hay warnings críticos
 * - Todos los elementos principales están visibles
 *
 * Principio KISS: Un solo objetivo - carga exitosa de la página
 */

test.describe('Orders Page - Load Without Errors', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
  const ORDERS_URL = `${BASE_URL}/pages/admin/orders.html`

  test.beforeEach(({ page }) => {
    // Track console messages
    page.consoleMessages = {
      errors: [],
      warnings: []
    }

    page.on('console', msg => {
      if (msg.type() === 'error') {
        page.consoleMessages.errors.push(msg.text())
        console.error('❌ Browser Console Error:', msg.text())
      } else if (msg.type() === 'warning') {
        page.consoleMessages.warnings.push(msg.text())
      }
    })

    page.on('pageerror', error => {
      page.consoleMessages.errors.push(error.message)
      console.error('❌ Page Error:', error.message)
    })
  })

  test('should load orders page without JavaScript errors', async ({ page }) => {
    console.log('🧪 TEST: Loading orders page...')

    // Navigate to orders page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for main content to be visible
    await page.waitForSelector('h1:has-text("Gestión de Pedidos")', {
      state: 'visible',
      timeout: 10000
    })

    // Verify no JavaScript errors
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ No JavaScript errors detected')

    // Verify no critical warnings
    const criticalWarnings = page.consoleMessages.warnings.filter(
      warning => !warning.includes('DevTools') && !warning.includes('extension')
    )
    expect(criticalWarnings.length).toBe(0)
    console.log('✅ No critical warnings detected')
  })

  test('should display main page elements', async ({ page }) => {
    console.log('🧪 TEST: Verifying main page elements...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for page to initialize
    await page.waitForSelector('h1', { state: 'visible' })

    // Verify page title
    const pageTitle = await page.locator('h1').first().textContent()
    expect(pageTitle).toContain('Gestión de Pedidos')
    console.log('✅ Page title present')

    // Verify navigation bar
    const navbar = page.locator('nav.navbar')
    await expect(navbar).toBeVisible()
    console.log('✅ Navbar visible')

    // Verify back button to dashboard
    const backButton = page.locator('a[href="./dashboard.html"]')
    await expect(backButton).toBeVisible()
    console.log('✅ Back button visible')

    // Verify stats cards container
    const statsCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-4')
    await expect(statsCards).toBeVisible()
    console.log('✅ Stats cards container visible')

    // Verify filters section
    const filtersSection = page.locator('#search-input')
    await expect(filtersSection).toBeVisible()
    console.log('✅ Filters section visible')

    // Verify orders table
    const ordersTable = page.locator('table')
    await expect(ordersTable).toBeVisible()
    console.log('✅ Orders table visible')

    // Verify pagination
    const paginationContainer = page.locator('#pagination-container')
    await expect(paginationContainer).toBeVisible()
    console.log('✅ Pagination visible')
  })

  test('should display all 4 statistics cards', async ({ page }) => {
    console.log('🧪 TEST: Verifying statistics cards...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for stats to load
    await page.waitForSelector('#stats-pending', { state: 'visible' })

    // Verify all 4 stat cards are present
    const statCards = [
      { id: '#stats-pending', label: 'Pendientes' },
      { id: '#stats-processing', label: 'En Proceso' },
      { id: '#stats-completed', label: 'Completados' },
      { id: '#stats-cancelled', label: 'Cancelados' }
    ]

    for (const card of statCards) {
      const element = page.locator(card.id)
      await expect(element).toBeVisible()
      console.log(`✅ ${card.label} card visible`)
    }

    console.log('✅ All 4 statistics cards present')
  })

  test('should display all filter controls', async ({ page }) => {
    console.log('🧪 TEST: Verifying filter controls...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Verify all filter elements are present
    const filterElements = [
      { selector: '#search-input', name: 'Search input' },
      { selector: '#status-filter', name: 'Status filter' },
      { selector: '#year-filter', name: 'Year filter' },
      { selector: '#date-range-filter', name: 'Date range filter' },
      { selector: '#items-per-page', name: 'Items per page selector' },
      { selector: '#clear-all-btn', name: 'Clear filters button' },
      { selector: '#export-csv-btn', name: 'Export CSV button' }
    ]

    for (const filter of filterElements) {
      const element = page.locator(filter.selector)
      await expect(element).toBeVisible()
      console.log(`✅ ${filter.name} present`)
    }

    console.log('✅ All filter controls present')
  })

  test('should display table headers correctly', async ({ page }) => {
    console.log('🧪 TEST: Verifying table headers...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for table to be visible
    await page.waitForSelector('table', { state: 'visible' })

    // Verify all table headers
    const expectedHeaders = [
      'Cliente',
      'Productos',
      'Total',
      'Fecha',
      'Estado',
      'Acciones',
      'Historial'
    ]

    const headers = page.locator('thead th')
    const headerCount = await headers.count()
    expect(headerCount).toBe(expectedHeaders.length)

    for (let i = 0; i < expectedHeaders.length; i++) {
      const headerText = await headers.nth(i).textContent()
      expect(headerText.trim().toUpperCase()).toContain(expectedHeaders[i].toUpperCase())
      console.log(`✅ Header "${expectedHeaders[i]}" present`)
    }

    console.log('✅ All table headers correct')
  })

  test('should have responsive navigation elements', async ({ page }) => {
    console.log('🧪 TEST: Verifying navigation elements...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Verify logo
    const logo = page.locator('img[alt="Logo FloresYa Admin"]')
    await expect(logo).toBeVisible()
    console.log('✅ Logo visible')

    // Verify logout button
    const logoutBtn = page.locator('#logout-btn')
    await expect(logoutBtn).toBeVisible()
    console.log('✅ Logout button visible')

    // Verify breadcrumb/title
    const breadcrumb = page.locator('text=/ Pedidos')
    await expect(breadcrumb).toBeVisible()
    console.log('✅ Breadcrumb visible')
  })

  test('should load Lucide icons without errors', async ({ page }) => {
    console.log('🧪 TEST: Verifying icon rendering...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for icons to be processed
    await page.waitForTimeout(1000)

    // Check for SVG icons (Lucide converts data-lucide to SVG)
    const svgIcons = page.locator('svg')
    const iconCount = await svgIcons.count()
    expect(iconCount).toBeGreaterThan(5)
    console.log(`✅ Found ${iconCount} SVG icons`)

    // Verify no icon-related errors
    const iconErrors = page.consoleMessages.errors.filter(
      error => error.includes('lucide') || error.includes('icon') || error.includes('data-lucide')
    )
    expect(iconErrors.length).toBe(0)
    console.log('✅ No icon-related errors')
  })

  test('should have correct page title in browser tab', async ({ page }) => {
    console.log('🧪 TEST: Verifying browser page title...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Verify page title
    const title = await page.title()
    expect(title).toContain('Gestión de Pedidos')
    expect(title).toContain('FloresYa Admin')
    console.log(`✅ Page title: "${title}"`)
  })

  test('should initialize with default filter values', async ({ page }) => {
    console.log('🧪 TEST: Verifying default filter values...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Verify default status filter
    const statusFilter = page.locator('#status-filter')
    const statusValue = await statusFilter.inputValue()
    expect(statusValue).toBe('all')
    console.log('✅ Default status filter: all')

    // Verify default year filter (current year)
    const yearFilter = page.locator('#year-filter')
    const yearValue = await yearFilter.inputValue()
    const currentYear = new Date().getFullYear().toString()
    expect(yearValue).toBe(currentYear)
    console.log(`✅ Default year filter: ${yearValue}`)

    // Verify default items per page
    const itemsPerPage = page.locator('#items-per-page')
    const itemsValue = await itemsPerPage.inputValue()
    expect(itemsValue).toBe('50')
    console.log('✅ Default items per page: 50')
  })

  test('should not display modals on page load', async ({ page }) => {
    console.log('🧪 TEST: Verifying modals are hidden on load...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Verify order detail modal is hidden
    const orderModal = page.locator('#order-modal')
    await expect(orderModal).toHaveClass(/hidden/)
    console.log('✅ Order detail modal hidden')

    // Verify history modal is hidden
    const historyModal = page.locator('#history-modal')
    await expect(historyModal).toHaveClass(/hidden/)
    console.log('✅ History modal hidden')
  })

  test('comprehensive load test - all elements present, no errors', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive page load validation...')

    // Navigate to page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for main content
    await page.waitForSelector('h1', { state: 'visible', timeout: 10000 })

    // Verify no errors
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ No errors')

    // Verify main sections
    const sections = [
      { selector: 'nav.navbar', name: 'Navigation bar' },
      { selector: 'h1:has-text("Gestión de Pedidos")', name: 'Page title' },
      { selector: '.grid.grid-cols-1.md\\:grid-cols-4', name: 'Stats grid' },
      { selector: '#search-input', name: 'Search input' },
      { selector: 'table', name: 'Orders table' },
      { selector: '#pagination-container', name: 'Pagination' }
    ]

    for (const section of sections) {
      const element = page.locator(section.selector)
      await expect(element).toBeVisible()
      console.log(`✅ ${section.name} visible`)
    }

    console.log('🎉 Comprehensive load test PASSED!')
  })
})
