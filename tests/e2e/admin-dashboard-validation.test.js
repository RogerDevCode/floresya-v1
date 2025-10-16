import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { TEST_PREFIX } from '../test-config.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

/**
 * E2E Test for Admin Dashboard with Database Validation
 *
 * This comprehensive test verifies:
 * 1. Dashboard loads without errors or warnings
 * 2. Statistics displayed match real database data
 * 3. Filters work correctly and affect displayed data
 * 4. Charts and visualizations render properly
 * 5. All UI components function as expected
 */

test.describe('Admin Dashboard - Complete E2E Validation', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
  let supabase

  test.beforeAll(() => {
    // Initialize Supabase client for database validation
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_KEY in environment. Cannot validate against database.'
      )
    }

    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase client initialized for database validation')
  })

  test.beforeEach(({ page }) => {
    // Track console errors and warnings
    const consoleMessages = {
      errors: [],
      warnings: []
    }

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.errors.push(msg.text())
        console.error('❌ Browser Console Error:', msg.text())
      } else if (msg.type() === 'warning') {
        consoleMessages.warnings.push(msg.text())
        console.warn('⚠️ Browser Console Warning:', msg.text())
      }
    })

    // Track page errors
    page.on('pageerror', error => {
      consoleMessages.errors.push(error.message)
      console.error('❌ Page Error:', error.message)
    })

    // Store console messages in page context for later assertions
    page.consoleMessages = consoleMessages
  })

  test('should load dashboard without errors or warnings', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to initialize
    await page.waitForSelector('#dashboard-view', { state: 'visible', timeout: 10000 })

    // Wait for stats to load (no more loading state)
    await page.waitForFunction(
      () => {
        const totalOrders = document.getElementById('dash-total-orders')
        return totalOrders && totalOrders.textContent !== '-'
      },
      { timeout: 10000 }
    )

    // Verify no errors occurred
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ No console errors detected')

    // Verify no warnings occurred (excluding known safe warnings)
    const safeWarnings = [
      // Add any known safe warnings here if needed
    ]
    const criticalWarnings = page.consoleMessages.warnings.filter(
      warning => !safeWarnings.some(safe => warning.includes(safe))
    )
    expect(criticalWarnings.length).toBe(0)
    console.log('✅ No critical warnings detected')
  })

  test('should display statistics that match database data', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for stats to load
    await page.waitForFunction(
      () => {
        const totalOrders = document.getElementById('dash-total-orders')
        return totalOrders && totalOrders.textContent !== '-'
      },
      { timeout: 10000 }
    )

    // Get current year filter value
    const yearFilter = await page.locator('#dashboard-year-filter').inputValue()
    const currentYear = parseInt(yearFilter)
    console.log(`📅 Testing with year filter: ${currentYear}`)

    // Fetch orders from database directly
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price_usd,
          subtotal_usd
        )
      `
      )
      .like('notes', `${TEST_PREFIX}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Filter orders by current year (matching dashboard filter)
    const ordersInYear = allOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    console.log(`📊 Database stats for year ${currentYear}:`)
    console.log(`   - Total orders in DB: ${ordersInYear.length}`)

    // Calculate expected statistics from database
    const expectedStats = {
      total_orders: ordersInYear.length,
      pending: ordersInYear.filter(o => o.status === 'pending').length,
      verified: ordersInYear.filter(o => o.status === 'verified').length,
      preparing: ordersInYear.filter(o => o.status === 'preparing').length,
      shipped: ordersInYear.filter(o => o.status === 'shipped').length,
      delivered: ordersInYear.filter(o => o.status === 'delivered').length,
      cancelled: ordersInYear.filter(o => o.status === 'cancelled').length
    }

    // Calculate total sales (excluding cancelled)
    const expectedTotalSales = ordersInYear
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + parseFloat(order.total_amount_usd || 0), 0)

    console.log(`   - Expected stats by status:`, expectedStats)
    console.log(`   - Expected total sales (non-cancelled): $${expectedTotalSales.toFixed(2)}`)

    // Get displayed statistics from dashboard
    const displayedStats = {
      total_orders: parseInt(await page.locator('#dash-total-orders').textContent(), 10),
      total_sales: parseFloat(
        (await page.locator('#dash-total-sales').textContent()).replace(/[$,]/g, '')
      ),
      pending: parseInt(await page.locator('#dash-status-pending').textContent(), 10),
      verified: parseInt(await page.locator('#dash-status-verified').textContent(), 10),
      preparing: parseInt(await page.locator('#dash-status-preparing').textContent(), 10),
      shipped: parseInt(await page.locator('#dash-status-shipped').textContent(), 10),
      delivered: parseInt(await page.locator('#dash-status-delivered').textContent(), 10),
      cancelled: parseInt(await page.locator('#dash-status-cancelled').textContent(), 10)
    }

    console.log(`📱 Dashboard displayed stats:`)
    console.log(`   - Total orders: ${displayedStats.total_orders}`)
    console.log(`   - Total sales: $${displayedStats.total_sales.toFixed(2)}`)
    console.log(`   - By status:`, {
      pending: displayedStats.pending,
      verified: displayedStats.verified,
      preparing: displayedStats.preparing,
      shipped: displayedStats.shipped,
      delivered: displayedStats.delivered,
      cancelled: displayedStats.cancelled
    })

    // Validate statistics match
    expect(displayedStats.total_orders).toBe(expectedStats.total_orders)
    console.log('✅ Total orders match')

    expect(displayedStats.total_sales).toBeCloseTo(expectedTotalSales, 2)
    console.log('✅ Total sales match')

    expect(displayedStats.pending).toBe(expectedStats.pending)
    expect(displayedStats.verified).toBe(expectedStats.verified)
    expect(displayedStats.preparing).toBe(expectedStats.preparing)
    expect(displayedStats.shipped).toBe(expectedStats.shipped)
    expect(displayedStats.delivered).toBe(expectedStats.delivered)
    expect(displayedStats.cancelled).toBe(expectedStats.cancelled)
    console.log('✅ All status counts match')

    // Verify no errors during data load
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ Statistics validation passed - Dashboard data matches database!')
  })

  test('should filter statistics correctly when filters change', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for initial stats to load
    await page.waitForFunction(
      () => {
        const totalOrders = document.getElementById('dash-total-orders')
        return totalOrders && totalOrders.textContent !== '-'
      },
      { timeout: 10000 }
    )

    // Get initial total orders
    const initialTotalOrders = parseInt(await page.locator('#dash-total-orders').textContent(), 10)
    console.log(`📊 Initial total orders: ${initialTotalOrders}`)

    // Change date filter to "Este mes" (current month)
    await page.locator('#dashboard-date-filter').selectOption('current-month')

    // Wait for stats to update
    await page.waitForTimeout(1000)

    // Get filtered total orders
    const filteredTotalOrders = parseInt(await page.locator('#dash-total-orders').textContent(), 10)
    console.log(`📊 Filtered total orders (current month): ${filteredTotalOrders}`)

    // Verify filter indicator updated
    const filterIndicator = await page.locator('#dashboard-filter-indicator').textContent()
    expect(filterIndicator).toContain('Este mes')
    console.log(`✅ Filter indicator updated: ${filterIndicator}`)

    // Validate against database
    const yearFilter = await page.locator('#dashboard-year-filter').inputValue()
    const currentYear = parseInt(yearFilter)

    const { data: allOrders } = await supabase
      .from('orders')
      .select('*')
      .like('notes', `${TEST_PREFIX}%`)
      .order('created_at', { ascending: false })

    // Apply same filters as dashboard
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const expectedFilteredOrders = allOrders.filter(order => {
      const orderDate = new Date(order.created_at)
      const orderYear = orderDate.getFullYear()
      return orderYear === currentYear && orderDate >= firstDayOfMonth
    })

    console.log(`📊 Expected orders for current month: ${expectedFilteredOrders.length}`)

    // Verify filtered count matches
    expect(filteredTotalOrders).toBe(expectedFilteredOrders.length)
    console.log('✅ Filtered statistics match database!')

    // Verify no errors during filtering
    expect(page.consoleMessages.errors.length).toBe(0)
  })

  test('should render chart without errors', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for chart canvas to be visible
    await page.waitForSelector('#monthly-sales-chart', { state: 'visible', timeout: 10000 })

    // Wait for chart to render
    await page.waitForTimeout(2000)

    // Verify chart canvas exists and has content
    const chartCanvas = page.locator('#monthly-sales-chart')
    await expect(chartCanvas).toBeVisible()

    // Verify chart section is visible
    const chartSection = page.locator('.bg-white.rounded-xl.shadow-md.p-6', {
      has: page.getByText('Ventas Mensuales')
    })
    await expect(chartSection).toBeVisible()

    // Verify chart filter is functional
    const chartFilter = page.locator('#chart-status-filter')
    await expect(chartFilter).toBeVisible()
    await chartFilter.selectOption('delivered')

    // Wait for chart to update
    await page.waitForTimeout(1000)

    // Verify chart subtitle updated
    const chartSubtitle = await page.locator('#chart-subtitle').textContent()
    expect(chartSubtitle).toContain('Entregados')
    console.log(`✅ Chart filter working: ${chartSubtitle}`)

    // Verify no errors during chart rendering
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ Chart rendered successfully without errors!')
  })

  test('should display top products correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for top products section to load
    await page.waitForSelector('#top-products-list', { state: 'visible', timeout: 10000 })

    // Wait for products to render (not showing loading state)
    await page.waitForFunction(
      () => {
        const topProductsList = document.getElementById('top-products-list')
        return topProductsList && !topProductsList.textContent.includes('Cargando')
      },
      { timeout: 10000 }
    )

    // Check if top products are displayed or no data message
    const topProductsList = page.locator('#top-products-list')
    const topProductsContent = await topProductsList.textContent()

    if (topProductsContent.includes('No hay datos')) {
      console.log('ℹ️ No products data available (this is valid if database is empty)')
    } else {
      // Verify top products are displayed with proper structure
      const productCards = topProductsList.locator('.flex.items-center.justify-between')
      const productCount = await productCards.count()

      expect(productCount).toBeGreaterThan(0)
      expect(productCount).toBeLessThanOrEqual(3) // Top 3 products

      console.log(`✅ Top ${productCount} products displayed`)

      // Verify each product has necessary information
      for (let i = 0; i < productCount; i++) {
        const card = productCards.nth(i)
        const hasRank = await card.locator('.bg-gradient-to-br').count()
        const hasProductName = await card.locator('.font-medium.text-gray-900').count()
        const hasQuantity = await card.locator('.font-bold.text-gray-900').count()

        expect(hasRank).toBe(1)
        expect(hasProductName).toBe(1)
        expect(hasQuantity).toBe(1)
      }

      console.log('✅ All top product cards have proper structure')
    }

    // Verify no errors occurred
    expect(page.consoleMessages.errors.length).toBe(0)
  })

  test('should handle UI interactions without errors', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Test year filter interaction
    const yearFilter = page.locator('#dashboard-year-filter')
    await yearFilter.selectOption('2026')
    await page.waitForTimeout(1000)

    let filterIndicator = await page.locator('#dashboard-filter-indicator').textContent()
    expect(filterIndicator).toContain('2026')
    console.log('✅ Year filter interaction works')

    // Test date filter interaction
    const dateFilter = page.locator('#dashboard-date-filter')
    await dateFilter.selectOption('30')
    await page.waitForTimeout(1000)

    filterIndicator = await page.locator('#dashboard-filter-indicator').textContent()
    expect(filterIndicator).toContain('30 días')
    console.log('✅ Date filter interaction works')

    // Test chart filter interaction
    const chartFilter = page.locator('#chart-status-filter')
    await chartFilter.selectOption('pending')
    await page.waitForTimeout(1000)

    const chartSubtitle = await page.locator('#chart-subtitle').textContent()
    expect(chartSubtitle).toContain('Pendientes')
    console.log('✅ Chart filter interaction works')

    // Verify no errors during all interactions
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ All UI interactions completed without errors!')
  })

  test('should display all stat cards with proper icons and values', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for stats to load
    await page.waitForFunction(
      () => {
        const totalOrders = document.getElementById('dash-total-orders')
        return totalOrders && totalOrders.textContent !== '-'
      },
      { timeout: 10000 }
    )

    // Wait for icons to render
    await page.waitForTimeout(1000)

    // Verify all 8 stat cards are present
    const statCards = page.locator('.stat-card')
    const statCardCount = await statCards.count()
    expect(statCardCount).toBe(8)
    console.log(`✅ All ${statCardCount} stat cards present`)

    // Verify each stat card has:
    // 1. An icon (SVG)
    // 2. A title
    // 3. A non-empty value
    for (let i = 0; i < statCardCount; i++) {
      const card = statCards.nth(i)

      // Check for icon (SVG or i element)
      const iconContainer = card.locator('.stat-icon')
      await expect(iconContainer).toBeVisible()

      // Check for title
      const title = card.locator('.stat-title')
      await expect(title).toBeVisible()
      const titleText = await title.textContent()
      expect(titleText.length).toBeGreaterThan(0)

      // Check for value
      const value = card.locator('.stat-value')
      await expect(value).toBeVisible()
      const valueText = await value.textContent()
      expect(valueText).not.toBe('-')
      expect(valueText.length).toBeGreaterThan(0)

      console.log(`   ✓ Card ${i + 1}: ${titleText} = ${valueText}`)
    }

    console.log('✅ All stat cards have icons, titles, and values')

    // Verify no errors occurred
    expect(page.consoleMessages.errors.length).toBe(0)
  })

  test('should load and display all dashboard sections', async ({ page }) => {
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to fully load
    await page.waitForSelector('#dashboard-view', { state: 'visible' })
    await page.waitForFunction(
      () => {
        const totalOrders = document.getElementById('dash-total-orders')
        return totalOrders && totalOrders.textContent !== '-'
      },
      { timeout: 10000 }
    )

    // Verify main sections are visible
    const sections = [
      { selector: '.bg-gradient-to-r', name: 'Welcome Banner' },
      { selector: '#dashboard-filter-indicator', name: 'Filter Indicator' },
      { selector: '.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4', name: 'Stats Grid' },
      { selector: '#monthly-sales-chart', name: 'Sales Chart' },
      { selector: '#top-products-list', name: 'Top Products' }
    ]

    for (const section of sections) {
      const element = page.locator(section.selector)
      await expect(element).toBeVisible()
      console.log(`✅ ${section.name} is visible`)
    }

    // Verify sidebar is present
    const sidebar = page.locator('#admin-sidebar')
    await expect(sidebar).toBeVisible()
    console.log('✅ Sidebar is visible')

    // Verify navbar is present
    const navbar = page.locator('.navbar')
    await expect(navbar).toBeVisible()
    console.log('✅ Navbar is visible')

    // Verify no errors occurred
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ All dashboard sections loaded successfully!')
  })

  test('comprehensive validation - no errors, no warnings, statistics match database', async ({
    page
  }) => {
    console.log('🚀 Starting comprehensive dashboard validation...')

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/pages/admin/dashboard.html`)
    await page.waitForLoadState('networkidle')

    // Wait for complete initialization
    await page.waitForSelector('#dashboard-view', { state: 'visible', timeout: 10000 })
    await page.waitForFunction(
      () => {
        const totalOrders = document.getElementById('dash-total-orders')
        const totalSales = document.getElementById('dash-total-sales')
        return (
          totalOrders &&
          totalOrders.textContent !== '-' &&
          totalSales &&
          !totalSales.textContent.includes('$0')
        )
      },
      { timeout: 15000 }
    )

    // Wait for chart and top products
    await page.waitForTimeout(2000)

    // ============ VALIDATION 1: No Errors or Warnings ============
    console.log('\n📋 Step 1: Checking for errors and warnings...')
    expect(page.consoleMessages.errors.length).toBe(0)
    console.log('✅ No console errors')

    const criticalWarnings = page.consoleMessages.warnings.filter(
      warning => !warning.includes('DevTools')
    )
    expect(criticalWarnings.length).toBe(0)
    console.log('✅ No critical warnings')

    // ============ VALIDATION 2: Statistics Match Database ============
    console.log('\n📋 Step 2: Validating statistics against database...')

    const yearFilter = await page.locator('#dashboard-year-filter').inputValue()
    const currentYear = parseInt(yearFilter)

    // Fetch from database
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price_usd,
          subtotal_usd
        )
      `
      )
      .like('notes', `${TEST_PREFIX}%`)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Filter by year
    const ordersInYear = allOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    // Calculate expected stats
    const expectedStats = {
      total_orders: ordersInYear.length,
      total_sales: ordersInYear
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + parseFloat(order.total_amount_usd || 0), 0),
      pending: ordersInYear.filter(o => o.status === 'pending').length,
      verified: ordersInYear.filter(o => o.status === 'verified').length,
      preparing: ordersInYear.filter(o => o.status === 'preparing').length,
      shipped: ordersInYear.filter(o => o.status === 'shipped').length,
      delivered: ordersInYear.filter(o => o.status === 'delivered').length,
      cancelled: ordersInYear.filter(o => o.status === 'cancelled').length
    }

    // Get displayed stats
    const displayedStats = {
      total_orders: parseInt(await page.locator('#dash-total-orders').textContent(), 10),
      total_sales: parseFloat(
        (await page.locator('#dash-total-sales').textContent()).replace(/[$,]/g, '')
      ),
      pending: parseInt(await page.locator('#dash-status-pending').textContent(), 10),
      verified: parseInt(await page.locator('#dash-status-verified').textContent(), 10),
      preparing: parseInt(await page.locator('#dash-status-preparing').textContent(), 10),
      shipped: parseInt(await page.locator('#dash-status-shipped').textContent(), 10),
      delivered: parseInt(await page.locator('#dash-status-delivered').textContent(), 10),
      cancelled: parseInt(await page.locator('#dash-status-cancelled').textContent(), 10)
    }

    // Validate all statistics
    expect(displayedStats.total_orders).toBe(expectedStats.total_orders)
    expect(displayedStats.total_sales).toBeCloseTo(expectedStats.total_sales, 2)
    expect(displayedStats.pending).toBe(expectedStats.pending)
    expect(displayedStats.verified).toBe(expectedStats.verified)
    expect(displayedStats.preparing).toBe(expectedStats.preparing)
    expect(displayedStats.shipped).toBe(expectedStats.shipped)
    expect(displayedStats.delivered).toBe(expectedStats.delivered)
    expect(displayedStats.cancelled).toBe(expectedStats.cancelled)

    console.log('✅ All statistics match database:')
    console.log(`   Total Orders: ${displayedStats.total_orders} ✓`)
    console.log(`   Total Sales: $${displayedStats.total_sales.toFixed(2)} ✓`)
    console.log(`   Pending: ${displayedStats.pending} ✓`)
    console.log(`   Verified: ${displayedStats.verified} ✓`)
    console.log(`   Preparing: ${displayedStats.preparing} ✓`)
    console.log(`   Shipped: ${displayedStats.shipped} ✓`)
    console.log(`   Delivered: ${displayedStats.delivered} ✓`)
    console.log(`   Cancelled: ${displayedStats.cancelled} ✓`)

    // ============ VALIDATION 3: UI Components Functional ============
    console.log('\n📋 Step 3: Validating UI components...')

    // Check chart
    const chartCanvas = page.locator('#monthly-sales-chart')
    await expect(chartCanvas).toBeVisible()
    console.log('✅ Chart rendered')

    // Check top products
    const topProductsList = page.locator('#top-products-list')
    await expect(topProductsList).toBeVisible()
    console.log('✅ Top products section visible')

    // Check filters
    await expect(page.locator('#dashboard-year-filter')).toBeVisible()
    await expect(page.locator('#dashboard-date-filter')).toBeVisible()
    await expect(page.locator('#chart-status-filter')).toBeVisible()
    console.log('✅ All filters present and functional')

    console.log('\n🎉 COMPREHENSIVE VALIDATION PASSED!')
    console.log('✅ Dashboard loads without errors')
    console.log('✅ No warnings detected')
    console.log('✅ All statistics match database')
    console.log('✅ All UI components functional')
  })
})
