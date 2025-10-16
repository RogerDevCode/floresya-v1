import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

/**
 * TEST ATÓMICO 3: Verificar que las estadísticas son correctas
 *
 * Objetivo:
 * - Verificar que las estadísticas se calculan correctamente
 * - Los números coinciden con la base de datos
 * - Las estadísticas reflejan los filtros aplicados
 *
 * Principio KISS: Solo valida cálculos de estadísticas
 */

test.describe('Orders Page - Statistics', () => {
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

  test('should display all 4 statistics cards with values', async ({ page }) => {
    console.log('🧪 TEST: Verifying statistics cards have values...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check all 4 stat cards
    const statElements = [
      { id: '#stats-pending', name: 'Pendientes' },
      { id: '#stats-processing', name: 'En Proceso' },
      { id: '#stats-completed', name: 'Completados' },
      { id: '#stats-cancelled', name: 'Cancelados' }
    ]

    for (const stat of statElements) {
      const element = page.locator(stat.id)
      const value = await element.textContent()
      const numValue = parseInt(value.trim(), 10)

      expect(numValue).toBeGreaterThanOrEqual(0)
      console.log(`✅ ${stat.name}: ${numValue}`)
    }

    console.log('✅ All statistics have valid values')
  })

  test('should match statistics with database counts', async ({ page }) => {
    console.log('🧪 TEST: Validating statistics against database...')

    // Get current year (default filter)
    const currentYear = new Date().getFullYear()

    // Fetch orders from database
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Filter by current year
    const ordersInYear = allOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    // Calculate expected statistics
    const expectedStats = {
      pending: ordersInYear.filter(o => o.status === 'pending').length,
      // "En Proceso" includes: verified, preparing, shipped
      processing: ordersInYear.filter(
        o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped'
      ).length,
      // "Completados" is delivered
      completed: ordersInYear.filter(o => o.status === 'delivered').length,
      cancelled: ordersInYear.filter(o => o.status === 'cancelled').length
    }

    console.log(`📊 Expected statistics for year ${currentYear}:`)
    console.log(`   - Pendientes: ${expectedStats.pending}`)
    console.log(`   - En Proceso: ${expectedStats.processing}`)
    console.log(`   - Completados: ${expectedStats.completed}`)
    console.log(`   - Cancelados: ${expectedStats.cancelled}`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get displayed statistics
    const displayedStats = {
      pending: parseInt(await page.locator('#stats-pending').textContent(), 10),
      processing: parseInt(await page.locator('#stats-processing').textContent(), 10),
      completed: parseInt(await page.locator('#stats-completed').textContent(), 10),
      cancelled: parseInt(await page.locator('#stats-cancelled').textContent(), 10)
    }

    console.log(`📱 Displayed statistics:`)
    console.log(`   - Pendientes: ${displayedStats.pending}`)
    console.log(`   - En Proceso: ${displayedStats.processing}`)
    console.log(`   - Completados: ${displayedStats.completed}`)
    console.log(`   - Cancelados: ${displayedStats.cancelled}`)

    // Validate each statistic
    expect(displayedStats.pending).toBe(expectedStats.pending)
    console.log('✅ Pendientes matches database')

    expect(displayedStats.processing).toBe(expectedStats.processing)
    console.log('✅ En Proceso matches database')

    expect(displayedStats.completed).toBe(expectedStats.completed)
    console.log('✅ Completados matches database')

    expect(displayedStats.cancelled).toBe(expectedStats.cancelled)
    console.log('✅ Cancelados matches database')

    console.log('🎉 All statistics match database!')
  })

  test('should update statistics when all orders are displayed', async ({ page }) => {
    console.log('🧪 TEST: Verifying statistics reflect all orders...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get statistics
    const pending = parseInt(await page.locator('#stats-pending').textContent(), 10)
    const processing = parseInt(await page.locator('#stats-processing').textContent(), 10)
    const completed = parseInt(await page.locator('#stats-completed').textContent(), 10)
    const cancelled = parseInt(await page.locator('#stats-cancelled').textContent(), 10)

    const totalStats = pending + processing + completed + cancelled

    // Get total orders from pagination
    const totalOrdersText = await page.locator('#total-orders').textContent()
    const totalOrders = parseInt(totalOrdersText.trim(), 10)

    console.log(`📊 Sum of statistics: ${totalStats}`)
    console.log(`📊 Total orders: ${totalOrders}`)

    // Sum of statistics should equal total orders
    expect(totalStats).toBe(totalOrders)
    console.log('✅ Statistics sum equals total orders')
  })

  test('should show correct pending orders count', async ({ page }) => {
    console.log('🧪 TEST: Verifying pending orders count...')

    const currentYear = new Date().getFullYear()

    // Get pending orders from database
    const { data: pendingOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Filter by current year
    const pendingInYear = pendingOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    console.log(`📊 Database: ${pendingInYear.length} pending orders`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const displayedPending = parseInt(await page.locator('#stats-pending').textContent(), 10)
    console.log(`📱 Displayed: ${displayedPending} pending orders`)

    expect(displayedPending).toBe(pendingInYear.length)
    console.log('✅ Pending count matches database')
  })

  test('should show correct processing orders count', async ({ page }) => {
    console.log('🧪 TEST: Verifying processing orders count...')

    const currentYear = new Date().getFullYear()

    // Get processing orders from database (verified + preparing + shipped)
    const { data: allOrders, error } = await supabase.from('orders').select('*')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    const processingInYear = allOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      const isProcessing =
        order.status === 'verified' || order.status === 'preparing' || order.status === 'shipped'
      return orderYear === currentYear && isProcessing
    })

    console.log(`📊 Database: ${processingInYear.length} processing orders`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const displayedProcessing = parseInt(await page.locator('#stats-processing').textContent(), 10)
    console.log(`📱 Displayed: ${displayedProcessing} processing orders`)

    expect(displayedProcessing).toBe(processingInYear.length)
    console.log('✅ Processing count matches database')
  })

  test('should show correct completed orders count', async ({ page }) => {
    console.log('🧪 TEST: Verifying completed orders count...')

    const currentYear = new Date().getFullYear()

    // Get completed orders from database (delivered status)
    const { data: completedOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'delivered')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    const completedInYear = completedOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    console.log(`📊 Database: ${completedInYear.length} completed orders`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const displayedCompleted = parseInt(await page.locator('#stats-completed').textContent(), 10)
    console.log(`📱 Displayed: ${displayedCompleted} completed orders`)

    expect(displayedCompleted).toBe(completedInYear.length)
    console.log('✅ Completed count matches database')
  })

  test('should show correct cancelled orders count', async ({ page }) => {
    console.log('🧪 TEST: Verifying cancelled orders count...')

    const currentYear = new Date().getFullYear()

    // Get cancelled orders from database
    const { data: cancelledOrders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'cancelled')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    const cancelledInYear = cancelledOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    console.log(`📊 Database: ${cancelledInYear.length} cancelled orders`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const displayedCancelled = parseInt(await page.locator('#stats-cancelled').textContent(), 10)
    console.log(`📱 Displayed: ${displayedCancelled} cancelled orders`)

    expect(displayedCancelled).toBe(cancelledInYear.length)
    console.log('✅ Cancelled count matches database')
  })

  test('should display statistics cards with correct styling', async ({ page }) => {
    console.log('🧪 TEST: Verifying statistics card styling...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Verify each stat card has correct border color
    const statCards = [
      { selector: '.border-blue-500', name: 'Pendientes (blue)' },
      { selector: '.border-yellow-500', name: 'En Proceso (yellow)' },
      { selector: '.border-green-500', name: 'Completados (green)' },
      { selector: '.border-red-500', name: 'Cancelados (red)' }
    ]

    for (const card of statCards) {
      const element = page.locator(card.selector)
      await expect(element).toBeVisible()
      console.log(`✅ ${card.name} card styled correctly`)
    }
  })

  test('should have icons for each statistics card', async ({ page }) => {
    console.log('🧪 TEST: Verifying statistics card icons...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Each stat card should have an icon
    const iconSelectors = [
      { selector: 'i[data-lucide="clock"]', name: 'Pendientes icon' },
      { selector: 'i[data-lucide="package"]', name: 'En Proceso icon' },
      { selector: 'i[data-lucide="check-circle"]', name: 'Completados icon' },
      { selector: 'i[data-lucide="x-circle"]', name: 'Cancelados icon' }
    ]

    for (const icon of iconSelectors) {
      const element = page.locator(icon.selector)
      await expect(element).toBeVisible()
      console.log(`✅ ${icon.name} present`)
    }
  })

  test('should display filter indicator text', async ({ page }) => {
    console.log('🧪 TEST: Verifying filter indicator...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Filter indicator should be visible
    const filterIndicator = page.locator('#active-filters-text')
    await expect(filterIndicator).toBeVisible()

    const indicatorText = await filterIndicator.textContent()
    console.log(`📋 Filter indicator: ${indicatorText.trim()}`)

    // Should contain some information about applied filters
    expect(indicatorText.length).toBeGreaterThan(0)
    console.log('✅ Filter indicator present')
  })

  test('comprehensive statistics validation', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive statistics validation...')

    // Get current year
    const currentYear = new Date().getFullYear()

    // Fetch all orders from database
    const { data: allOrders, error } = await supabase.from('orders').select('*')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Filter by current year
    const ordersInYear = allOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    // Calculate all statistics
    const dbStats = {
      pending: ordersInYear.filter(o => o.status === 'pending').length,
      processing: ordersInYear.filter(
        o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped'
      ).length,
      completed: ordersInYear.filter(o => o.status === 'delivered').length,
      cancelled: ordersInYear.filter(o => o.status === 'cancelled').length
    }

    const dbTotal = dbStats.pending + dbStats.processing + dbStats.completed + dbStats.cancelled

    console.log(`📊 Database statistics (year ${currentYear}):`)
    console.log(`   Pendientes: ${dbStats.pending}`)
    console.log(`   En Proceso: ${dbStats.processing}`)
    console.log(`   Completados: ${dbStats.completed}`)
    console.log(`   Cancelados: ${dbStats.cancelled}`)
    console.log(`   TOTAL: ${dbTotal}`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get all displayed statistics
    const displayedStats = {
      pending: parseInt(await page.locator('#stats-pending').textContent(), 10),
      processing: parseInt(await page.locator('#stats-processing').textContent(), 10),
      completed: parseInt(await page.locator('#stats-completed').textContent(), 10),
      cancelled: parseInt(await page.locator('#stats-cancelled').textContent(), 10)
    }

    const displayedTotal =
      displayedStats.pending +
      displayedStats.processing +
      displayedStats.completed +
      displayedStats.cancelled

    console.log(`📱 Displayed statistics:`)
    console.log(`   Pendientes: ${displayedStats.pending}`)
    console.log(`   En Proceso: ${displayedStats.processing}`)
    console.log(`   Completados: ${displayedStats.completed}`)
    console.log(`   Cancelados: ${displayedStats.cancelled}`)
    console.log(`   TOTAL: ${displayedTotal}`)

    // Validate all statistics
    expect(displayedStats.pending).toBe(dbStats.pending)
    expect(displayedStats.processing).toBe(dbStats.processing)
    expect(displayedStats.completed).toBe(dbStats.completed)
    expect(displayedStats.cancelled).toBe(dbStats.cancelled)
    expect(displayedTotal).toBe(dbTotal)

    console.log('🎉 All statistics validated successfully!')
  })
})
