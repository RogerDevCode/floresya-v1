import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

/**
 * TEST ATÓMICO 7: Verificar que las estadísticas están acorde a los filtros aplicados
 *
 * Objetivo CRÍTICO:
 * - Las estadísticas SIEMPRE deben reflejar los filtros activos
 * - Filtro por año → estadísticas solo de ese año
 * - Filtro por rango de fechas → estadísticas solo de ese rango
 * - Filtro por status → estadísticas reflejan esos pedidos
 * - Combinación de filtros → estadísticas correctas
 * - Suma de estadísticas = total de pedidos filtrados
 *
 * Principio KISS: Solo valida sincronización estadísticas ↔ filtros
 * FUNDAMENTAL: Las estadísticas son la métrica más importante
 */

test.describe('Orders Page - Statistics vs Filters Synchronization', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
  const ORDERS_URL = `${BASE_URL}/pages/admin/orders.html`
  let supabase

  test.beforeAll(() => {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment')
    }

    supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Supabase client initialized')
  })

  /**
   * Helper: Get statistics from page
   */
  async function getStatistics(page) {
    return {
      pending: parseInt(await page.locator('#stats-pending').textContent(), 10),
      processing: parseInt(await page.locator('#stats-processing').textContent(), 10),
      completed: parseInt(await page.locator('#stats-completed').textContent(), 10),
      cancelled: parseInt(await page.locator('#stats-cancelled').textContent(), 10)
    }
  }

  /**
   * Helper: Get total orders from pagination
   */
  async function getTotalOrders(page) {
    return parseInt(await page.locator('#total-orders').textContent(), 10)
  }

  /**
   * Helper: Verify sum of stats equals total
   */
  function verifyStatsSumEqualsTotal(stats, total, label) {
    const sum = stats.pending + stats.processing + stats.completed + stats.cancelled
    expect(sum).toBe(total)
    console.log(`✅ ${label}: Stats sum (${sum}) = Total (${total})`)
  }

  test('statistics should match total orders on initial load', async ({ page }) => {
    console.log('🧪 TEST: Verifying statistics sum equals total on load...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Statistics:', stats)
    console.log(`📊 Total orders: ${total}`)

    verifyStatsSumEqualsTotal(stats, total, 'Initial load')
  })

  test('statistics should update when filtering by year', async ({ page }) => {
    console.log('🧪 TEST: Statistics vs Year filter...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial state (current year)
    const initialStats = await getStatistics(page)
    const initialTotal = await getTotalOrders(page)
    console.log('📊 Initial (current year):', { stats: initialStats, total: initialTotal })
    verifyStatsSumEqualsTotal(initialStats, initialTotal, 'Current year')

    // Change to year 2026
    await page.locator('#year-filter').selectOption('2026')
    await page.waitForTimeout(1000)

    // Get stats after year change
    const year2026Stats = await getStatistics(page)
    const year2026Total = await getTotalOrders(page)
    console.log('📊 Year 2026:', { stats: year2026Stats, total: year2026Total })
    verifyStatsSumEqualsTotal(year2026Stats, year2026Total, 'Year 2026')

    // Verify database
    const { data: dbOrders } = await supabase.from('orders').select('*')
    const orders2026 = dbOrders.filter(o => new Date(o.created_at).getFullYear() === 2026)

    const expectedStats = {
      pending: orders2026.filter(o => o.status === 'pending').length,
      processing: orders2026.filter(
        o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped'
      ).length,
      completed: orders2026.filter(o => o.status === 'delivered').length,
      cancelled: orders2026.filter(o => o.status === 'cancelled').length
    }

    expect(year2026Stats.pending).toBe(expectedStats.pending)
    expect(year2026Stats.processing).toBe(expectedStats.processing)
    expect(year2026Stats.completed).toBe(expectedStats.completed)
    expect(year2026Stats.cancelled).toBe(expectedStats.cancelled)

    console.log('✅ Statistics match database for year 2026')
  })

  test('statistics should update when filtering by date range (30 days)', async ({ page }) => {
    console.log('🧪 TEST: Statistics vs 30 days filter...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Apply 30 days filter
    await page.locator('#date-range-filter').selectOption('30')
    await page.waitForTimeout(1000)

    // Get stats
    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Last 30 days:', { stats, total })
    verifyStatsSumEqualsTotal(stats, total, 'Last 30 days')

    // Verify against database
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: dbOrders } = await supabase.from('orders').select('*')
    const currentYear = new Date().getFullYear()
    const ordersLast30Days = dbOrders.filter(o => {
      const orderDate = new Date(o.created_at)
      const orderYear = orderDate.getFullYear()
      return orderYear === currentYear && orderDate >= thirtyDaysAgo
    })

    expect(total).toBe(ordersLast30Days.length)
    console.log('✅ Total matches database for last 30 days')
  })

  test('statistics should update when filtering by status', async ({ page }) => {
    console.log('🧪 TEST: Statistics vs Status filter...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Filter by delivered status
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(1000)

    // Get stats
    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Delivered only:', { stats, total })

    // When filtering by delivered, only completed stat should match total
    expect(stats.completed).toBe(total)
    expect(stats.pending).toBe(0)
    expect(stats.processing).toBe(0)
    expect(stats.cancelled).toBe(0)

    verifyStatsSumEqualsTotal(stats, total, 'Delivered filter')
    console.log('✅ Only completed stat is non-zero when filtering by delivered')
  })

  test('statistics should update when filtering by pending status', async ({ page }) => {
    console.log('🧪 TEST: Statistics vs Pending status filter...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Filter by pending status
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(1000)

    // Get stats
    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Pending only:', { stats, total })

    // When filtering by pending, only pending stat should match total
    expect(stats.pending).toBe(total)
    expect(stats.processing).toBe(0)
    expect(stats.completed).toBe(0)
    expect(stats.cancelled).toBe(0)

    verifyStatsSumEqualsTotal(stats, total, 'Pending filter')
    console.log('✅ Only pending stat is non-zero when filtering by pending')
  })

  test('statistics should update with combined filters (year + date range)', async ({ page }) => {
    console.log('🧪 TEST: Statistics vs Combined filters (year + date)...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Apply year filter
    await page.locator('#year-filter').selectOption('2025')
    await page.waitForTimeout(800)

    // Apply date range filter
    await page.locator('#date-range-filter').selectOption('60')
    await page.waitForTimeout(800)

    // Get stats
    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Year 2025 + Last 60 days:', { stats, total })
    verifyStatsSumEqualsTotal(stats, total, 'Combined filters')

    // Verify against database
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const { data: dbOrders } = await supabase.from('orders').select('*')
    const filteredOrders = dbOrders.filter(o => {
      const orderDate = new Date(o.created_at)
      const orderYear = orderDate.getFullYear()
      return orderYear === 2025 && orderDate >= sixtyDaysAgo
    })

    expect(total).toBe(filteredOrders.length)
    console.log('✅ Combined filters match database')
  })

  test('statistics should update with triple filter (year + date + status)', async ({ page }) => {
    console.log('🧪 TEST: Statistics vs Triple filter...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Apply three filters
    await page.locator('#year-filter').selectOption('2025')
    await page.waitForTimeout(500)
    await page.locator('#date-range-filter').selectOption('90')
    await page.waitForTimeout(500)
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(1000)

    // Get stats
    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Triple filter (2025 + 90 days + delivered):', { stats, total })

    // With delivered filter, only completed should have value
    expect(stats.completed).toBe(total)
    expect(stats.pending).toBe(0)
    expect(stats.processing).toBe(0)
    expect(stats.cancelled).toBe(0)

    verifyStatsSumEqualsTotal(stats, total, 'Triple filter')
    console.log('✅ Triple filter statistics correct')
  })

  test('statistics should reset when clearing all filters', async ({ page }) => {
    console.log('🧪 TEST: Statistics after clearing filters...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial state
    const initialStats = await getStatistics(page)
    const initialTotal = await getTotalOrders(page)
    console.log('📊 Initial:', { stats: initialStats, total: initialTotal })

    // Apply some filters
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(800)
    await page.locator('#date-range-filter').selectOption('30')
    await page.waitForTimeout(800)

    const filteredStats = await getStatistics(page)
    const filteredTotal = await getTotalOrders(page)
    console.log('📊 Filtered:', { stats: filteredStats, total: filteredTotal })

    // Clear filters
    await page.locator('#clear-all-btn').click()
    await page.waitForTimeout(1000)

    const clearedStats = await getStatistics(page)
    const clearedTotal = await getTotalOrders(page)
    console.log('📊 After clearing:', { stats: clearedStats, total: clearedTotal })

    // Should return to initial state
    expect(clearedStats.pending).toBe(initialStats.pending)
    expect(clearedStats.processing).toBe(initialStats.processing)
    expect(clearedStats.completed).toBe(initialStats.completed)
    expect(clearedStats.cancelled).toBe(initialStats.cancelled)
    expect(clearedTotal).toBe(initialTotal)

    verifyStatsSumEqualsTotal(clearedStats, clearedTotal, 'After clearing')
    console.log('✅ Statistics restored to initial state after clearing filters')
  })

  test('statistics should match table content with filters', async ({ page }) => {
    console.log('🧪 TEST: Statistics match table content...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Apply a filter
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(1000)

    // Get stats
    const stats = await getStatistics(page)
    const total = await getTotalOrders(page)

    console.log('📊 Statistics:', stats)
    console.log(`📊 Total: ${total}`)

    // Count rows in table
    const tableRows = page.locator('#orders-table-body tr')
    const rowCount = await tableRows.count()

    // Row count should be <= total (pagination)
    expect(rowCount).toBeLessThanOrEqual(total)
    console.log(`📊 Table rows: ${rowCount} (showing first page of ${total})`)

    // If there are rows, verify they all match the filter
    if (rowCount > 0) {
      // Check first row's status
      const firstRowStatus = await tableRows
        .first()
        .locator('td')
        .nth(4)
        .locator('select')
        .inputValue()
      expect(firstRowStatus).toBe('pending')
      console.log('✅ Table content matches filter')
    }

    verifyStatsSumEqualsTotal(stats, total, 'Statistics vs table')
  })

  test('statistics should update in real-time when filters change rapidly', async ({ page }) => {
    console.log('🧪 TEST: Real-time statistics update with rapid filter changes...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Rapidly change filters
    const filters = ['pending', 'delivered', 'cancelled', 'all']

    for (const filter of filters) {
      await page.locator('#status-filter').selectOption(filter)
      await page.waitForTimeout(800)

      const stats = await getStatistics(page)
      const total = await getTotalOrders(page)

      console.log(`📊 Filter: ${filter} → Total: ${total}, Stats:`, stats)
      verifyStatsSumEqualsTotal(stats, total, `Filter: ${filter}`)
    }

    console.log('✅ Statistics update correctly with rapid filter changes')
  })

  test('comprehensive statistics vs filters validation', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive statistics vs filters validation...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const currentYear = new Date().getFullYear()

    // Test scenario 1: Default state
    console.log('\n📊 Scenario 1: Default state')
    let stats = await getStatistics(page)
    let total = await getTotalOrders(page)
    console.log(`   Stats: ${JSON.stringify(stats)}, Total: ${total}`)
    verifyStatsSumEqualsTotal(stats, total, 'Default state')

    // Test scenario 2: Year filter
    console.log('\n📊 Scenario 2: Year filter (2025)')
    await page.locator('#year-filter').selectOption('2025')
    await page.waitForTimeout(1000)
    stats = await getStatistics(page)
    total = await getTotalOrders(page)
    console.log(`   Stats: ${JSON.stringify(stats)}, Total: ${total}`)
    verifyStatsSumEqualsTotal(stats, total, 'Year 2025')

    // Test scenario 3: Add date filter
    console.log('\n📊 Scenario 3: Year + Date range (90 days)')
    await page.locator('#date-range-filter').selectOption('90')
    await page.waitForTimeout(1000)
    stats = await getStatistics(page)
    total = await getTotalOrders(page)
    console.log(`   Stats: ${JSON.stringify(stats)}, Total: ${total}`)
    verifyStatsSumEqualsTotal(stats, total, 'Year + 90 days')

    // Test scenario 4: Add status filter
    console.log('\n📊 Scenario 4: Year + Date + Status (delivered)')
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(1000)
    stats = await getStatistics(page)
    total = await getTotalOrders(page)
    console.log(`   Stats: ${JSON.stringify(stats)}, Total: ${total}`)
    expect(stats.completed).toBe(total)
    expect(stats.pending + stats.processing + stats.cancelled).toBe(0)
    console.log('   ✅ Only completed stat matches total')

    // Test scenario 5: Clear all
    console.log('\n📊 Scenario 5: Clear all filters')
    await page.locator('#clear-all-btn').click()
    await page.waitForTimeout(1000)
    stats = await getStatistics(page)
    total = await getTotalOrders(page)
    console.log(`   Stats: ${JSON.stringify(stats)}, Total: ${total}`)
    verifyStatsSumEqualsTotal(stats, total, 'After clearing')

    // Validate against database one final time
    const { data: dbOrders } = await supabase.from('orders').select('*')
    const ordersInCurrentYear = dbOrders.filter(
      o => new Date(o.created_at).getFullYear() === currentYear
    )

    expect(total).toBe(ordersInCurrentYear.length)
    console.log(
      `\n✅ Final validation: Total (${total}) matches DB (${ordersInCurrentYear.length})`
    )

    console.log('\n🎉 Comprehensive validation PASSED!')
  })
})
