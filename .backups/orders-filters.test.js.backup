import { test, expect } from '@playwright/test'

/**
 * TEST ATÓMICO 4: Verificar que los filtros funcionan correctamente
 *
 * Objetivo:
 * - Verificar que cada filtro reduce/filtra los pedidos mostrados
 * - Los filtros se pueden combinar
 * - El botón "Limpiar Filtros" restaura el estado inicial
 * - El indicador de filtros se actualiza correctamente
 *
 * Principio KISS: Solo valida funcionalidad de filtros
 */

test.describe('Orders Page - Filters Functionality', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
  const ORDERS_URL = `${BASE_URL}/pages/admin/orders.html`

  test('should filter orders by status', async ({ page }) => {
    console.log('🧪 TEST: Filtering by status...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total orders
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Initial total orders: ${initialTotal}`)

    // Apply status filter (pending)
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(1000)

    // Get filtered total
    const filteredTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Filtered total (pending): ${filteredTotal}`)

    // Filtered total should be less than or equal to initial
    expect(filteredTotal).toBeLessThanOrEqual(initialTotal)
    console.log('✅ Status filter reduces results')

    // Check if stats reflect filter (only pending should be non-zero in ideal case)
    const pendingStat = parseInt(await page.locator('#stats-pending').textContent(), 10)
    console.log(`📊 Pending stat after filter: ${pendingStat}`)

    // Filtered total should match pending stat
    expect(filteredTotal).toBe(pendingStat)
    console.log('✅ Filtered orders match pending stat')
  })

  test('should filter orders by year', async ({ page }) => {
    console.log('🧪 TEST: Filtering by year...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total (current year)
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    const currentYear = new Date().getFullYear().toString()
    console.log(`📊 Initial total (year ${currentYear}): ${initialTotal}`)

    // Change to a different year
    await page.locator('#year-filter').selectOption('2026')
    await page.waitForTimeout(1000)

    // Get new total
    const filteredTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Filtered total (year 2026): ${filteredTotal}`)

    // Year filter should change results (unless 2026 has same count)
    // Just verify it doesn't error and shows a number
    expect(filteredTotal).toBeGreaterThanOrEqual(0)
    console.log('✅ Year filter works')

    // Switch back to current year
    await page.locator('#year-filter').selectOption(currentYear)
    await page.waitForTimeout(1000)

    const backToInitial = parseInt(await page.locator('#total-orders').textContent(), 10)
    expect(backToInitial).toBe(initialTotal)
    console.log('✅ Switching back to current year restores original count')
  })

  test('should filter orders by date range (30 days)', async ({ page }) => {
    console.log('🧪 TEST: Filtering by date range (30 days)...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Initial total: ${initialTotal}`)

    // Apply 30 days filter
    await page.locator('#date-range-filter').selectOption('30')
    await page.waitForTimeout(1000)

    // Get filtered total
    const filteredTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Filtered total (last 30 days): ${filteredTotal}`)

    // 30 days filter should reduce or equal initial
    expect(filteredTotal).toBeLessThanOrEqual(initialTotal)
    console.log('✅ Date range filter works')
  })

  test('should filter orders by search query', async ({ page }) => {
    console.log('🧪 TEST: Filtering by search query...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Initial total: ${initialTotal}`)

    if (initialTotal === 0) {
      console.log('⏭️ Skipping test - no orders to search')
      test.skip()
      return
    }

    // Get first order's customer name from table
    const firstRow = page.locator('#orders-table-body tr').first()
    const customerCell = await firstRow.locator('td').first().textContent()
    const customerName = customerCell.trim().split('\n')[0].trim()

    console.log(`🔍 Searching for: "${customerName.substring(0, 5)}"`)

    // Type search query (first few letters)
    const searchInput = page.locator('#search-input')
    await searchInput.fill(customerName.substring(0, 5))
    await page.waitForTimeout(1000)

    // Get filtered total
    const filteredTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Filtered total: ${filteredTotal}`)

    // Search should reduce results
    expect(filteredTotal).toBeLessThanOrEqual(initialTotal)
    expect(filteredTotal).toBeGreaterThan(0) // Should find at least the one we searched for
    console.log('✅ Search filter works')
  })

  test('should combine multiple filters', async ({ page }) => {
    console.log('🧪 TEST: Combining multiple filters...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Initial total: ${initialTotal}`)

    // Apply status filter
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(800)
    const afterStatus = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 After status filter: ${afterStatus}`)

    // Apply date range filter on top
    await page.locator('#date-range-filter').selectOption('60')
    await page.waitForTimeout(800)
    const afterBothFilters = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 After status + date range: ${afterBothFilters}`)

    // Combined filters should reduce results further (or stay same)
    expect(afterBothFilters).toBeLessThanOrEqual(afterStatus)
    console.log('✅ Multiple filters work together')
  })

  test('should clear all filters when "Limpiar Filtros" is clicked', async ({ page }) => {
    console.log('🧪 TEST: Clearing all filters...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Initial total: ${initialTotal}`)

    // Apply several filters
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(500)
    await page.locator('#date-range-filter').selectOption('30')
    await page.waitForTimeout(500)
    await page.locator('#search-input').fill('test')
    await page.waitForTimeout(500)

    const afterFilters = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 After applying filters: ${afterFilters}`)

    // Click clear filters
    await page.locator('#clear-all-btn').click()
    await page.waitForTimeout(1000)

    // Get total after clearing
    const afterClear = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 After clearing filters: ${afterClear}`)

    // Should return to initial total
    expect(afterClear).toBe(initialTotal)
    console.log('✅ Clear filters restores initial state')

    // Verify filters are reset
    const statusValue = await page.locator('#status-filter').inputValue()
    expect(statusValue).toBe('all')
    console.log('✅ Status filter reset to "all"')

    const searchValue = await page.locator('#search-input').inputValue()
    expect(searchValue).toBe('')
    console.log('✅ Search input cleared')
  })

  test('should update filter indicator when filters are applied', async ({ page }) => {
    console.log('🧪 TEST: Filter indicator updates...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial indicator text
    const initialIndicator = await page.locator('#active-filters-text').textContent()
    console.log(`📋 Initial indicator: ${initialIndicator.trim()}`)

    // Apply a filter
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(1000)

    // Get updated indicator
    const updatedIndicator = await page.locator('#active-filters-text').textContent()
    console.log(`📋 Updated indicator: ${updatedIndicator.trim()}`)

    // Indicator should change
    expect(updatedIndicator).not.toBe(initialIndicator)
    console.log('✅ Filter indicator updates')
  })

  test('should filter by "today" date range', async ({ page }) => {
    console.log('🧪 TEST: Filtering by "today"...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Apply "today" filter
    await page.locator('#date-range-filter').selectOption('today')
    await page.waitForTimeout(1000)

    // Get filtered total
    const todayTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Orders today: ${todayTotal}`)

    // Should be 0 or more
    expect(todayTotal).toBeGreaterThanOrEqual(0)
    console.log('✅ "Today" filter works')
  })

  test('should filter by "current month" date range', async ({ page }) => {
    console.log('🧪 TEST: Filtering by "current month"...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial total
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)

    // Apply "current month" filter
    await page.locator('#date-range-filter').selectOption('current-month')
    await page.waitForTimeout(1000)

    // Get filtered total
    const currentMonthTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Orders this month: ${currentMonthTotal}`)

    // Current month should be <= total for year
    expect(currentMonthTotal).toBeLessThanOrEqual(initialTotal)
    console.log('✅ "Current month" filter works')
  })

  test('should show custom date range inputs when "Personalizado" is selected', async ({
    page
  }) => {
    console.log('🧪 TEST: Custom date range UI...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Custom date row should be hidden initially
    const customDateRow = page.locator('#custom-date-row')
    await expect(customDateRow).toHaveClass(/hidden/)
    console.log('✅ Custom date row hidden initially')

    // Select "Personalizado"
    await page.locator('#date-range-filter').selectOption('custom')
    await page.waitForTimeout(500)

    // Custom date row should be visible
    await expect(customDateRow).not.toHaveClass(/hidden/)
    console.log('✅ Custom date row visible after selecting "Personalizado"')

    // Should have date inputs and apply button
    await expect(page.locator('#date-from')).toBeVisible()
    await expect(page.locator('#date-to')).toBeVisible()
    await expect(page.locator('#apply-custom-date')).toBeVisible()
    console.log('✅ Custom date inputs and apply button visible')
  })

  test('should apply custom date range filter', async ({ page }) => {
    console.log('🧪 TEST: Applying custom date range...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Select "Personalizado"
    await page.locator('#date-range-filter').selectOption('custom')
    await page.waitForTimeout(500)

    // Set date range (last month)
    const today = new Date()
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const fromDate = lastMonth.toISOString().split('T')[0]
    const toDate = today.toISOString().split('T')[0]

    await page.locator('#date-from').fill(fromDate)
    await page.locator('#date-to').fill(toDate)
    console.log(`📅 Date range: ${fromDate} to ${toDate}`)

    // Click apply
    await page.locator('#apply-custom-date').click()
    await page.waitForTimeout(1000)

    // Should filter orders
    const filteredTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Filtered orders: ${filteredTotal}`)

    expect(filteredTotal).toBeGreaterThanOrEqual(0)
    console.log('✅ Custom date range applied')
  })

  test('should change items per page', async ({ page }) => {
    console.log('🧪 TEST: Changing items per page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const totalOrders = parseInt(await page.locator('#total-orders').textContent(), 10)

    if (totalOrders < 20) {
      console.log('⏭️ Skipping test - need at least 20 orders')
      test.skip()
      return
    }

    // Default is 50 items per page
    const initialItemsPerPage = await page.locator('#items-per-page').inputValue()
    expect(initialItemsPerPage).toBe('50')
    console.log('✅ Default items per page: 50')

    // Get initial pagination info
    const initialShowingTo = parseInt(await page.locator('#showing-to').textContent(), 10)
    console.log(`📊 Initially showing up to: ${initialShowingTo}`)

    // Change to 20 items per page
    await page.locator('#items-per-page').selectOption('20')
    await page.waitForTimeout(1000)

    // Get new pagination info
    const newShowingTo = parseInt(await page.locator('#showing-to').textContent(), 10)
    console.log(`📊 Now showing up to: ${newShowingTo}`)

    // Should show max 20 items (or less if total < 20)
    expect(newShowingTo).toBeLessThanOrEqual(20)
    console.log('✅ Items per page changed successfully')
  })

  test('should show correct pagination info with filters', async ({ page }) => {
    console.log('🧪 TEST: Pagination info with filters...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Apply a filter
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(1000)

    // Get pagination info
    const showingFrom = parseInt(await page.locator('#showing-from').textContent(), 10)
    const showingTo = parseInt(await page.locator('#showing-to').textContent(), 10)
    const totalOrders = parseInt(await page.locator('#total-orders').textContent(), 10)

    console.log(`📊 Showing ${showingFrom} to ${showingTo} of ${totalOrders} orders`)

    // Validate pagination numbers
    expect(showingFrom).toBeGreaterThan(0)
    expect(showingTo).toBeGreaterThanOrEqual(showingFrom)
    expect(totalOrders).toBeGreaterThanOrEqual(showingTo)
    console.log('✅ Pagination info correct with filters')
  })

  test('comprehensive filter validation', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive filter validation...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 1. Get initial state
    const initialTotal = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`\n📊 Step 1: Initial total = ${initialTotal}`)

    // 2. Apply status filter
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(800)
    const afterStatus = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Step 2: After status filter = ${afterStatus}`)
    expect(afterStatus).toBeLessThanOrEqual(initialTotal)

    // 3. Apply date range
    await page.locator('#date-range-filter').selectOption('90')
    await page.waitForTimeout(800)
    const afterDate = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Step 3: After date filter = ${afterDate}`)
    expect(afterDate).toBeLessThanOrEqual(afterStatus)

    // 4. Clear filters
    await page.locator('#clear-all-btn').click()
    await page.waitForTimeout(1000)
    const afterClear = parseInt(await page.locator('#total-orders').textContent(), 10)
    console.log(`📊 Step 4: After clear = ${afterClear}`)
    expect(afterClear).toBe(initialTotal)

    console.log('🎉 Comprehensive filter validation passed!')
  })
})
