import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

/**
 * TEST ATÓMICO 5: Verificar cambio de estado y actualización de estadísticas
 *
 * Objetivo:
 * - Verificar que el cambio de estado funciona
 * - Las estadísticas se actualizan inmediatamente después del cambio
 * - El cambio se refleja en la base de datos
 * - Probar múltiples transiciones de estado
 * - Verificar que la tabla se actualiza correctamente
 *
 * Principio KISS: Solo valida cambios de estado y sus efectos
 * CRÍTICO: Siempre verificar que las estadísticas concuerdan después de cada cambio
 */

test.describe('Orders Page - Status Change & Statistics Update', () => {
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
  async function getDisplayedStatistics(page) {
    return {
      pending: parseInt(await page.locator('#stats-pending').textContent(), 10),
      processing: parseInt(await page.locator('#stats-processing').textContent(), 10),
      completed: parseInt(await page.locator('#stats-completed').textContent(), 10),
      cancelled: parseInt(await page.locator('#stats-cancelled').textContent(), 10)
    }
  }

  /**
   * Helper: Get statistics from database
   */
  async function getDatabaseStatistics(year) {
    const { data: allOrders, error } = await supabase.from('orders').select('*')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    const ordersInYear = allOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === year
    })

    return {
      pending: ordersInYear.filter(o => o.status === 'pending').length,
      processing: ordersInYear.filter(
        o => o.status === 'verified' || o.status === 'preparing' || o.status === 'shipped'
      ).length,
      completed: ordersInYear.filter(o => o.status === 'delivered').length,
      cancelled: ordersInYear.filter(o => o.status === 'cancelled').length
    }
  }

  /**
   * Helper: Verify statistics match
   */
  function verifyStatistics(displayed, expected, label) {
    expect(displayed.pending).toBe(expected.pending)
    expect(displayed.processing).toBe(expected.processing)
    expect(displayed.completed).toBe(expected.completed)
    expect(displayed.cancelled).toBe(expected.cancelled)
    console.log(`✅ ${label} - Statistics match:`, displayed)
  }

  test('should display status dropdown for each order', async ({ page }) => {
    console.log('🧪 TEST: Verifying status dropdown presence...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders')
      test.skip()
      return
    }

    // Get first row status cell (5th column)
    const firstRow = tableBody.locator('tr').first()
    const statusCell = firstRow.locator('td').nth(4)

    // Should have a dropdown/select element
    const statusDropdown = statusCell.locator('select')
    await expect(statusDropdown).toBeVisible()
    console.log('✅ Status dropdown present')

    // Should have multiple options
    const options = statusDropdown.locator('option')
    const optionCount = await options.count()
    expect(optionCount).toBeGreaterThanOrEqual(6) // 6 statuses
    console.log(`✅ Status dropdown has ${optionCount} options`)
  })

  test('should change order status from pending to verified and update statistics', async ({
    page
  }) => {
    console.log('🧪 TEST: Changing status from pending → verified...')

    const currentYear = new Date().getFullYear()

    // Get initial statistics from database
    const initialDbStats = await getDatabaseStatistics(currentYear)
    console.log('📊 Initial DB statistics:', initialDbStats)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get initial displayed statistics
    const initialDisplayedStats = await getDisplayedStatistics(page)
    console.log('📱 Initial displayed statistics:', initialDisplayedStats)

    // Verify initial statistics match
    verifyStatistics(initialDisplayedStats, initialDbStats, 'Initial state')

    // Find a pending order
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    let foundPendingOrder = false
    const _orderId = null

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus === 'pending') {
        foundPendingOrder = true
        // Extract order ID from the row
        const customerCell = await row.locator('td').first().textContent()
        console.log(`🎯 Found pending order: ${customerCell.substring(0, 30)}...`)

        // Change status to verified
        console.log('🔄 Changing status to verified...')
        await statusDropdown.selectOption('verified')
        await page.waitForTimeout(2000) // Wait for API call and stats update

        break
      }
    }

    if (!foundPendingOrder) {
      console.log('⏭️ Skipping test - no pending orders found')
      test.skip()
      return
    }

    // Get updated statistics
    const updatedDisplayedStats = await getDisplayedStatistics(page)
    console.log('📱 Updated displayed statistics:', updatedDisplayedStats)

    // Verify statistics changed correctly
    // Pending should decrease by 1, processing should increase by 1
    expect(updatedDisplayedStats.pending).toBe(initialDisplayedStats.pending - 1)
    expect(updatedDisplayedStats.processing).toBe(initialDisplayedStats.processing + 1)
    expect(updatedDisplayedStats.completed).toBe(initialDisplayedStats.completed)
    expect(updatedDisplayedStats.cancelled).toBe(initialDisplayedStats.cancelled)

    console.log('✅ Statistics updated correctly after status change')

    // Verify against database (reload to get fresh data)
    await page.waitForTimeout(1000)
    const finalDbStats = await getDatabaseStatistics(currentYear)
    console.log('📊 Final DB statistics:', finalDbStats)

    verifyStatistics(updatedDisplayedStats, finalDbStats, 'After status change')

    console.log('🎉 Status change from pending → verified validated successfully!')
  })

  test('should change order status from verified to preparing and update statistics', async ({
    page
  }) => {
    console.log('🧪 TEST: Changing status from verified → preparing...')

    const currentYear = new Date().getFullYear()

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialStats = await getDisplayedStatistics(page)
    console.log('📱 Initial statistics:', initialStats)

    // Find a verified order
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    let foundVerifiedOrder = false

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus === 'verified') {
        foundVerifiedOrder = true
        console.log('🎯 Found verified order')

        // Change to preparing
        console.log('🔄 Changing status to preparing...')
        await statusDropdown.selectOption('preparing')
        await page.waitForTimeout(2000)

        break
      }
    }

    if (!foundVerifiedOrder) {
      console.log('⏭️ Skipping test - no verified orders found')
      test.skip()
      return
    }

    // Get updated statistics
    const updatedStats = await getDisplayedStatistics(page)
    console.log('📱 Updated statistics:', updatedStats)

    // Processing count should stay the same (verified and preparing are both "processing")
    expect(updatedStats.processing).toBe(initialStats.processing)
    console.log('✅ Processing count unchanged (verified→preparing both in processing)')

    // Verify against database
    const dbStats = await getDatabaseStatistics(currentYear)
    verifyStatistics(updatedStats, dbStats, 'After verified→preparing')

    console.log('🎉 Status change verified → preparing validated!')
  })

  test('should change order status from preparing to shipped and update statistics', async ({
    page
  }) => {
    console.log('🧪 TEST: Changing status from preparing → shipped...')

    const currentYear = new Date().getFullYear()

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialStats = await getDisplayedStatistics(page)
    console.log('📱 Initial statistics:', initialStats)

    // Find a preparing order
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    let foundPreparingOrder = false

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus === 'preparing') {
        foundPreparingOrder = true
        console.log('🎯 Found preparing order')

        // Change to shipped
        console.log('🔄 Changing status to shipped...')
        await statusDropdown.selectOption('shipped')
        await page.waitForTimeout(2000)

        break
      }
    }

    if (!foundPreparingOrder) {
      console.log('⏭️ Skipping test - no preparing orders found')
      test.skip()
      return
    }

    // Get updated statistics
    const updatedStats = await getDisplayedStatistics(page)
    console.log('📱 Updated statistics:', updatedStats)

    // Processing should stay the same (both are processing)
    expect(updatedStats.processing).toBe(initialStats.processing)
    console.log('✅ Processing count unchanged (preparing→shipped both in processing)')

    // Verify against database
    const dbStats = await getDatabaseStatistics(currentYear)
    verifyStatistics(updatedStats, dbStats, 'After preparing→shipped')

    console.log('🎉 Status change preparing → shipped validated!')
  })

  test('should change order status from shipped to delivered and update statistics', async ({
    page
  }) => {
    console.log('🧪 TEST: Changing status from shipped → delivered...')

    const currentYear = new Date().getFullYear()

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialStats = await getDisplayedStatistics(page)
    console.log('📱 Initial statistics:', initialStats)

    // Find a shipped order
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    let foundShippedOrder = false

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus === 'shipped') {
        foundShippedOrder = true
        console.log('🎯 Found shipped order')

        // Change to delivered
        console.log('🔄 Changing status to delivered...')
        await statusDropdown.selectOption('delivered')
        await page.waitForTimeout(2000)

        break
      }
    }

    if (!foundShippedOrder) {
      console.log('⏭️ Skipping test - no shipped orders found')
      test.skip()
      return
    }

    // Get updated statistics
    const updatedStats = await getDisplayedStatistics(page)
    console.log('📱 Updated statistics:', updatedStats)

    // Processing should decrease by 1, completed should increase by 1
    expect(updatedStats.processing).toBe(initialStats.processing - 1)
    expect(updatedStats.completed).toBe(initialStats.completed + 1)
    console.log('✅ Processing decreased, Completed increased')

    // Verify against database
    const dbStats = await getDatabaseStatistics(currentYear)
    verifyStatistics(updatedStats, dbStats, 'After shipped→delivered')

    console.log('🎉 Status change shipped → delivered validated!')
  })

  test('should change order status to cancelled and update statistics', async ({ page }) => {
    console.log('🧪 TEST: Changing status to cancelled...')

    const currentYear = new Date().getFullYear()

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialStats = await getDisplayedStatistics(page)
    console.log('📱 Initial statistics:', initialStats)

    // Find a non-cancelled order (any status except cancelled)
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    let foundNonCancelledOrder = false
    let originalStatus = null

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
        foundNonCancelledOrder = true
        originalStatus = currentStatus
        console.log(`🎯 Found ${currentStatus} order`)

        // Change to cancelled
        console.log('🔄 Changing status to cancelled...')
        await statusDropdown.selectOption('cancelled')
        await page.waitForTimeout(2000)

        break
      }
    }

    if (!foundNonCancelledOrder) {
      console.log('⏭️ Skipping test - no non-cancelled orders found')
      test.skip()
      return
    }

    // Get updated statistics
    const updatedStats = await getDisplayedStatistics(page)
    console.log('📱 Updated statistics:', updatedStats)

    // Cancelled should increase by 1
    expect(updatedStats.cancelled).toBe(initialStats.cancelled + 1)
    console.log('✅ Cancelled count increased')

    // Original status category should decrease
    if (originalStatus === 'pending') {
      expect(updatedStats.pending).toBe(initialStats.pending - 1)
      console.log('✅ Pending count decreased')
    } else if (['verified', 'preparing', 'shipped'].includes(originalStatus)) {
      expect(updatedStats.processing).toBe(initialStats.processing - 1)
      console.log('✅ Processing count decreased')
    }

    // Verify against database
    const dbStats = await getDatabaseStatistics(currentYear)
    verifyStatistics(updatedStats, dbStats, 'After cancellation')

    console.log('🎉 Status change to cancelled validated!')
  })

  test('should update status badge color after status change', async ({ page }) => {
    console.log('🧪 TEST: Verifying status badge color updates...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Find a pending order
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders')
      test.skip()
      return
    }

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus === 'pending') {
        console.log('🎯 Found pending order')

        // Get initial badge
        const statusBadge = statusCell.locator('span')
        const initialBadgeClass = await statusBadge.getAttribute('class')
        console.log(`📋 Initial badge class: ${initialBadgeClass}`)

        // Change to delivered
        console.log('🔄 Changing to delivered...')
        await statusDropdown.selectOption('delivered')
        await page.waitForTimeout(2000)

        // Get updated badge
        const updatedBadgeClass = await statusBadge.getAttribute('class')
        console.log(`📋 Updated badge class: ${updatedBadgeClass}`)

        // Badge class should change
        expect(updatedBadgeClass).not.toBe(initialBadgeClass)
        console.log('✅ Badge color changed after status update')

        break
      }
    }
  })

  test('should preserve other order data when changing status', async ({ page }) => {
    console.log('🧪 TEST: Verifying other data preserved after status change...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const firstRow = tableBody.locator('tr').first()

    // Get initial data
    const initialCustomer = await firstRow.locator('td').nth(0).textContent()
    const initialProducts = await firstRow.locator('td').nth(1).textContent()
    const initialTotal = await firstRow.locator('td').nth(2).textContent()
    const initialDate = await firstRow.locator('td').nth(3).textContent()

    console.log('📊 Initial order data captured')

    // Change status
    const statusCell = firstRow.locator('td').nth(4)
    const statusDropdown = statusCell.locator('select')
    const currentStatus = await statusDropdown.inputValue()

    // Toggle to a different status
    const newStatus = currentStatus === 'pending' ? 'verified' : 'pending'
    console.log(`🔄 Changing status from ${currentStatus} to ${newStatus}`)

    await statusDropdown.selectOption(newStatus)
    await page.waitForTimeout(2000)

    // Get data after change
    const afterCustomer = await firstRow.locator('td').nth(0).textContent()
    const afterProducts = await firstRow.locator('td').nth(1).textContent()
    const afterTotal = await firstRow.locator('td').nth(2).textContent()
    const afterDate = await firstRow.locator('td').nth(3).textContent()

    // All other data should remain the same
    expect(afterCustomer).toBe(initialCustomer)
    expect(afterProducts).toBe(initialProducts)
    expect(afterTotal).toBe(initialTotal)
    expect(afterDate).toBe(initialDate)

    console.log('✅ Other order data preserved after status change')
  })

  test('comprehensive status change validation with statistics verification', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive status change validation...')

    const currentYear = new Date().getFullYear()

    // 1. Get initial database state
    const initialDbStats = await getDatabaseStatistics(currentYear)
    console.log('\n📊 Step 1: Initial DB statistics:', initialDbStats)

    // 2. Load page and verify initial display matches DB
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialDisplayedStats = await getDisplayedStatistics(page)
    console.log('📱 Step 2: Initial displayed statistics:', initialDisplayedStats)
    verifyStatistics(initialDisplayedStats, initialDbStats, 'Initial state')

    // 3. Perform a status change
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping - no orders')
      test.skip()
      return
    }

    // Find first non-cancelled, non-delivered order
    let statusChanged = false
    let originalStatus = null
    let newStatus = null

    for (let i = 0; i < rowCount && !statusChanged; i++) {
      const row = rows.nth(i)
      const statusCell = row.locator('td').nth(4)
      const statusDropdown = statusCell.locator('select')
      const currentStatus = await statusDropdown.inputValue()

      if (currentStatus !== 'cancelled' && currentStatus !== 'delivered') {
        originalStatus = currentStatus

        // Determine next status in workflow
        const statusFlow = {
          pending: 'verified',
          verified: 'preparing',
          preparing: 'shipped',
          shipped: 'delivered'
        }

        newStatus = statusFlow[currentStatus]

        console.log(`\n🔄 Step 3: Changing status from ${originalStatus} to ${newStatus}`)
        await statusDropdown.selectOption(newStatus)
        await page.waitForTimeout(2000)
        statusChanged = true
      }
    }

    if (!statusChanged) {
      console.log('⏭️ No suitable order found for status change')
      test.skip()
      return
    }

    // 4. Verify displayed statistics updated
    const afterChangeStats = await getDisplayedStatistics(page)
    console.log('📱 Step 4: Statistics after change:', afterChangeStats)

    // 5. Verify against database
    const finalDbStats = await getDatabaseStatistics(currentYear)
    console.log('📊 Step 5: Final DB statistics:', finalDbStats)
    verifyStatistics(afterChangeStats, finalDbStats, 'After status change')

    // 6. Verify the total is preserved
    const initialTotal =
      initialDisplayedStats.pending +
      initialDisplayedStats.processing +
      initialDisplayedStats.completed +
      initialDisplayedStats.cancelled

    const finalTotal =
      afterChangeStats.pending +
      afterChangeStats.processing +
      afterChangeStats.completed +
      afterChangeStats.cancelled

    expect(finalTotal).toBe(initialTotal)
    console.log('✅ Step 6: Total order count preserved')

    console.log('🎉 Comprehensive validation PASSED!')
  })
})
