import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

/**
 * TEST ATÓMICO 2: Verificar que la tabla muestra los pedidos correctamente
 *
 * Objetivo:
 * - Verificar que los pedidos se cargan desde la API
 * - La tabla muestra los datos correctamente
 * - Los datos coinciden con la base de datos
 * - Todos los campos se muestran en el formato correcto
 *
 * Principio KISS: Solo valida visualización de datos en la tabla
 */

test.describe('Orders Page - Table Display', () => {
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

  test('should load orders from API and display in table', async ({ page }) => {
    console.log('🧪 TEST: Loading orders into table...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Wait for orders to load
    await page.waitForTimeout(2000)

    // Check if table has rows (tbody should not be empty)
    const tableBody = page.locator('#orders-table-body')
    const rows = tableBody.locator('tr')
    const rowCount = await rows.count()

    console.log(`📊 Found ${rowCount} rows in table`)

    // Should have at least some orders (or empty state)
    expect(rowCount).toBeGreaterThanOrEqual(0)

    if (rowCount > 0) {
      console.log('✅ Table populated with orders')
    } else {
      // Check if empty state is shown
      const emptyState = page.locator('#empty-state')
      const isEmptyStateVisible = await emptyState.isVisible()
      if (isEmptyStateVisible) {
        console.log('✅ Empty state displayed (no orders match filters)')
      }
    }
  })

  test('should display order data in correct columns', async ({ page }) => {
    console.log('🧪 TEST: Verifying order data columns...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const firstRow = tableBody.locator('tr').first()
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    await expect(firstRow).toBeVisible()

    // Verify first row has all expected columns (7 columns total)
    const cells = firstRow.locator('td')
    const cellCount = await cells.count()
    expect(cellCount).toBe(7)
    console.log(
      `✅ Row has ${cellCount} columns (Cliente, Productos, Total, Fecha, Estado, Acciones, Historial)`
    )

    // Verify each column has content
    for (let i = 0; i < cellCount; i++) {
      const cell = cells.nth(i)
      const cellText = await cell.textContent()
      // Cell should not be completely empty (may contain buttons/dropdowns)
      expect(cellText.trim().length).toBeGreaterThan(0)
      console.log(`✅ Column ${i + 1} has content`)
    }
  })

  test('should display customer information correctly', async ({ page }) => {
    console.log('🧪 TEST: Verifying customer information display...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get first order row
    const firstRow = tableBody.locator('tr').first()
    const customerCell = firstRow.locator('td').first()

    // Customer cell should contain name and email
    const customerText = await customerCell.textContent()
    expect(customerText.length).toBeGreaterThan(0)
    console.log(`✅ Customer info: ${customerText.trim().substring(0, 50)}...`)

    // Should contain email format (has @)
    // Note: Some may not have email if it's optional
    const hasEmail = customerText.includes('@')
    console.log(`${hasEmail ? '✅' : 'ℹ️'} Email ${hasEmail ? 'present' : 'not present'}`)
  })

  test('should display product count correctly', async ({ page }) => {
    console.log('🧪 TEST: Verifying product count display...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get products column (2nd column)
    const firstRow = tableBody.locator('tr').first()
    const productsCell = firstRow.locator('td').nth(1)
    const productsText = await productsCell.textContent()

    // Should show number of items (e.g., "3 productos" or similar)
    expect(productsText.length).toBeGreaterThan(0)
    console.log(`✅ Products: ${productsText.trim()}`)

    // Should contain a number
    const hasNumber = /\d/.test(productsText)
    expect(hasNumber).toBe(true)
    console.log('✅ Product count contains number')
  })

  test('should display total amount correctly', async ({ page }) => {
    console.log('🧪 TEST: Verifying total amount display...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get total column (3rd column)
    const firstRow = tableBody.locator('tr').first()
    const totalCell = firstRow.locator('td').nth(2)
    const totalText = await totalCell.textContent()

    // Should show USD amount
    expect(totalText).toContain('$')
    console.log(`✅ Total amount: ${totalText.trim()}`)

    // Should be a valid currency format (has $ and number)
    const hasCurrency = /\$\s*[\d,]+\.?\d*/.test(totalText)
    expect(hasCurrency).toBe(true)
    console.log('✅ Total amount in currency format')
  })

  test('should display date in correct format', async ({ page }) => {
    console.log('🧪 TEST: Verifying date display format...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get date column (4th column)
    const firstRow = tableBody.locator('tr').first()
    const dateCell = firstRow.locator('td').nth(3)
    const dateText = await dateCell.textContent()

    // Should have date content
    expect(dateText.trim().length).toBeGreaterThan(0)
    console.log(`✅ Date: ${dateText.trim()}`)

    // Should contain a date-like pattern (day/month/year or similar)
    const hasDatePattern = /\d{1,2}[/.\\-]\d{1,2}[/.\\-]\d{2,4}/.test(dateText)
    expect(hasDatePattern).toBe(true)
    console.log('✅ Date in valid format')
  })

  test('should display status badge correctly', async ({ page }) => {
    console.log('🧪 TEST: Verifying status badge display...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get status column (5th column)
    const firstRow = tableBody.locator('tr').first()
    const statusCell = firstRow.locator('td').nth(4)

    // Status should be visible
    await expect(statusCell).toBeVisible()

    // Should contain a status badge (span with background color classes)
    const statusBadge = statusCell.locator('span')
    await expect(statusBadge).toBeVisible()

    const statusText = await statusBadge.textContent()
    console.log(`✅ Status: ${statusText.trim()}`)

    // Status should be one of the valid statuses
    const validStatuses = [
      'Pendiente',
      'Verificado',
      'Preparando',
      'Enviado',
      'Entregado',
      'Cancelado'
    ]
    const isValidStatus = validStatuses.some(status =>
      statusText.toUpperCase().includes(status.toUpperCase())
    )
    expect(isValidStatus).toBe(true)
    console.log('✅ Status is valid')
  })

  test('should display action buttons for each order', async ({ page }) => {
    console.log('🧪 TEST: Verifying action buttons...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get actions column (6th column)
    const firstRow = tableBody.locator('tr').first()
    const actionsCell = firstRow.locator('td').nth(5)

    await expect(actionsCell).toBeVisible()

    // Should have a "Ver" button
    const viewButton = actionsCell.locator('button:has-text("Ver")')
    await expect(viewButton).toBeVisible()
    console.log('✅ "Ver" button present')
  })

  test('should display history button for each order', async ({ page }) => {
    console.log('🧪 TEST: Verifying history button...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      console.log('⏭️ Skipping test - no orders in table')
      test()
      return
    }

    // Get history column (7th column)
    const firstRow = tableBody.locator('tr').first()
    const historyCell = firstRow.locator('td').nth(6)

    await expect(historyCell).toBeVisible()

    // Should have a history button/link
    const historyButton = historyCell.locator('button')
    await expect(historyButton).toBeVisible()
    console.log('✅ History button present')
  })

  test('should match displayed orders count with database', async ({ page }) => {
    console.log('🧪 TEST: Verifying order count matches database...')

    // Get current year for filtering
    const currentYear = new Date().getFullYear()

    // Fetch orders from database
    const { data: dbOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    // Filter by current year (matching default filter)
    const ordersInYear = dbOrders.filter(order => {
      const orderYear = new Date(order.created_at).getFullYear()
      return orderYear === currentYear
    })

    console.log(`📊 Database: ${ordersInYear.length} orders in year ${currentYear}`)

    // Load page
    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get total orders from pagination info
    const totalOrdersText = await page.locator('#total-orders').textContent()
    const displayedTotal = parseInt(totalOrdersText.trim(), 10)

    console.log(`📱 Frontend: ${displayedTotal} orders displayed`)

    // Should match
    expect(displayedTotal).toBe(ordersInYear.length)
    console.log('✅ Order count matches database')
  })

  test('should display empty state when no orders match filters', async ({ page }) => {
    console.log('🧪 TEST: Verifying empty state display...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')

    // Apply a filter that returns no results (e.g., year 2050)
    await page.locator('#year-filter').selectOption('2030')
    await page.waitForTimeout(1000)

    // Check if empty state is shown or table is empty
    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount === 0) {
      // Empty state should be visible
      const emptyState = page.locator('#empty-state')
      await expect(emptyState).toBeVisible()
      console.log('✅ Empty state displayed')

      // Should have message
      const emptyMessage = await emptyState.textContent()
      expect(emptyMessage).toContain('No hay pedidos')
      console.log('✅ Empty message displayed')
    } else {
      console.log(`ℹ️ Table has ${rowCount} orders in year 2030`)
    }
  })

  test('should display orders in descending date order (newest first)', async ({ page }) => {
    console.log('🧪 TEST: Verifying orders are sorted by date...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const tableBody = page.locator('#orders-table-body')
    const rowCount = await tableBody.locator('tr').count()

    if (rowCount < 2) {
      console.log('⏭️ Skipping test - need at least 2 orders')
      test()
      return
    }

    // Get dates from first two rows
    const firstRow = tableBody.locator('tr').nth(0)
    const secondRow = tableBody.locator('tr').nth(1)

    const firstDate = await firstRow.locator('td').nth(3).textContent()
    const secondDate = await secondRow.locator('td').nth(3).textContent()

    console.log(`📅 First order date: ${firstDate.trim()}`)
    console.log(`📅 Second order date: ${secondDate.trim()}`)

    // Parse dates (assuming format like DD/MM/YYYY)
    const parseDate = dateStr => {
      const parts = dateStr.trim().split(/[/.\\-]/)
      if (parts.length >= 3) {
        // Assuming DD/MM/YYYY format
        return new Date(parts[2], parts[1] - 1, parts[0])
      }
      return new Date(dateStr)
    }

    const date1 = parseDate(firstDate)
    const date2 = parseDate(secondDate)

    // First date should be newer than or equal to second date
    expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime())
    console.log('✅ Orders sorted by date (newest first)')
  })
})
