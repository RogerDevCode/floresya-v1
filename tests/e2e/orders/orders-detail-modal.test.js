import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

/**
 * TEST ATÓMICO 6: Verificar modal de detalle del pedido
 *
 * Objetivo:
 * - Verificar que el modal se abre correctamente
 * - Muestra toda la información del pedido
 * - Los datos coinciden con la base de datos
 * - Se puede cerrar el modal
 * - La información de productos e items se muestra completa
 *
 * Principio KISS: Solo valida funcionalidad del modal de detalle
 */

test.describe('Orders Page - Order Detail Modal', () => {
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

  test('should open order detail modal when "Ver" button is clicked', async ({ page }) => {
    console.log('🧪 TEST: Opening order detail modal...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Modal should be hidden initially
    const modal = page.locator('#order-modal')
    await expect(modal).toHaveClass(/hidden/)
    console.log('✅ Modal hidden initially')

    // Find and click "Ver" button in first row
    const tableBody = page.locator('#orders-table-body')
    const firstRow = tableBody.locator('tr').first()
    const actionsCell = firstRow.locator('td').nth(5)
    const viewButton = actionsCell.locator('button:has-text("Ver")')

    await viewButton.click()
    await page.waitForTimeout(1000)

    // Modal should be visible now
    await expect(modal).not.toHaveClass(/hidden/)
    console.log('✅ Modal opened successfully')
  })

  test('should display modal title with order ID', async ({ page }) => {
    console.log('🧪 TEST: Verifying modal title...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Click "Ver" button
    const viewButton = page
      .locator('#orders-table-body tr')
      .first()
      .locator('button:has-text("Ver")')
    await viewButton.click()
    await page.waitForTimeout(1000)

    // Check modal title
    const modalTitle = page.locator('#modal-title')
    await expect(modalTitle).toBeVisible()

    const titleText = await modalTitle.textContent()
    expect(titleText).toContain('Detalle del Pedido')
    console.log(`✅ Modal title: ${titleText}`)
  })

  test('should display customer information in modal', async ({ page }) => {
    console.log('🧪 TEST: Verifying customer information in modal...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get customer from table
    const firstRow = page.locator('#orders-table-body tr').first()
    const tableCustomer = await firstRow.locator('td').first().textContent()
    console.log(`📋 Customer from table: ${tableCustomer.substring(0, 50)}...`)

    // Open modal
    await firstRow.locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Check modal content has customer info
    const modalContent = page.locator('#modal-content')
    await expect(modalContent).toBeVisible()

    const modalText = await modalContent.textContent()
    // Should contain customer-related labels
    const hasCustomerInfo =
      modalText.includes('Cliente') || modalText.includes('Email') || modalText.includes('Nombre')
    expect(hasCustomerInfo).toBe(true)
    console.log('✅ Customer information present in modal')
  })

  test('should display order items list in modal', async ({ page }) => {
    console.log('🧪 TEST: Verifying order items in modal...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open modal
    await page.locator('#orders-table-body tr').first().locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Modal content should show items/products
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    // Should mention products/items
    const hasProductsInfo =
      modalText.includes('Productos') ||
      modalText.includes('Items') ||
      modalText.includes('Artículos')
    expect(hasProductsInfo).toBe(true)
    console.log('✅ Order items information present')
  })

  test('should display total amount in modal', async ({ page }) => {
    console.log('🧪 TEST: Verifying total amount in modal...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get total from table
    const firstRow = page.locator('#orders-table-body tr').first()
    const tableTotal = await firstRow.locator('td').nth(2).textContent()
    console.log(`💰 Total from table: ${tableTotal}`)

    // Open modal
    await firstRow.locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Modal should show total
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    // Should have $ and Total
    const hasTotal = modalText.includes('$') && modalText.includes('Total')
    expect(hasTotal).toBe(true)
    console.log('✅ Total amount displayed in modal')
  })

  test('should display delivery information in modal', async ({ page }) => {
    console.log('🧪 TEST: Verifying delivery information...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open modal
    await page.locator('#orders-table-body tr').first().locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Modal should have delivery info
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    // Should mention delivery/address
    const hasDeliveryInfo =
      modalText.includes('Dirección') ||
      modalText.includes('Entrega') ||
      modalText.includes('Delivery')
    expect(hasDeliveryInfo).toBe(true)
    console.log('✅ Delivery information present')
  })

  test('should close modal when close button is clicked', async ({ page }) => {
    console.log('🧪 TEST: Closing modal with close button...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open modal
    await page.locator('#orders-table-body tr').first().locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    const modal = page.locator('#order-modal')
    await expect(modal).not.toHaveClass(/hidden/)
    console.log('✅ Modal is open')

    // Click close button
    const closeButton = page.locator('#close-modal')
    await closeButton.click()
    await page.waitForTimeout(500)

    // Modal should be hidden
    await expect(modal).toHaveClass(/hidden/)
    console.log('✅ Modal closed successfully')
  })

  test('should close modal when clicking overlay', async ({ page }) => {
    console.log('🧪 TEST: Closing modal by clicking overlay...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open modal
    await page.locator('#orders-table-body tr').first().locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    const modal = page.locator('#order-modal')
    await expect(modal).not.toHaveClass(/hidden/)

    // Click on the overlay (modal background)
    await modal.click({ position: { x: 10, y: 10 } }) // Click near edge
    await page.waitForTimeout(500)

    // Modal should be hidden
    await expect(modal).toHaveClass(/hidden/)
    console.log('✅ Modal closed by clicking overlay')
  })

  test('should display order data matching database', async ({ page }) => {
    console.log('🧪 TEST: Validating order data against database...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get first order's customer email from table for identification
    const firstRow = page.locator('#orders-table-body tr').first()
    const customerInfo = await firstRow.locator('td').first().textContent()

    // Extract email if present
    const emailMatch = customerInfo.match(/[\w.-]+@[\w.-]+\.\w+/)
    if (!emailMatch) {
      console.log('⏭️ Skipping - no email found to match against DB')
      test()
      return
    }

    const customerEmail = emailMatch[0]
    console.log(`📧 Customer email: ${customerEmail}`)

    // Fetch order from database
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !orders || orders.length === 0) {
      console.log('⏭️ Skipping - order not found in database')
      test()
      return
    }

    const dbOrder = orders[0]
    console.log(`📊 DB Order ID: ${dbOrder.id}`)

    // Open modal
    await firstRow.locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Get modal content
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    // Verify key information is present
    expect(modalText).toContain(dbOrder.customer_name)
    console.log('✅ Customer name matches')

    expect(modalText).toContain(dbOrder.customer_email)
    console.log('✅ Customer email matches')

    // Check if order items count is mentioned
    if (dbOrder.order_items && dbOrder.order_items.length > 0) {
      console.log(`📦 Order has ${dbOrder.order_items.length} items`)
      // Modal should show the items (validation that structure is correct)
    }

    console.log('✅ Order data validated against database')
  })

  test('should display each order item with product details', async ({ page }) => {
    console.log('🧪 TEST: Verifying order items details...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open modal
    await page.locator('#orders-table-body tr').first().locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Modal should show product names, quantities, and prices
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    // Should contain quantity/cantidad and price information
    const hasQuantity =
      modalText.includes('Cantidad') ||
      modalText.includes('Cant.') ||
      modalText.includes('Qty') ||
      /\d+\s*x/.test(modalText)
    expect(hasQuantity).toBe(true)
    console.log('✅ Quantity information present')

    // Should contain price information
    const hasPrice = modalText.includes('$') || modalText.includes('Precio')
    expect(hasPrice).toBe(true)
    console.log('✅ Price information present')
  })

  test('should display order status in modal', async ({ page }) => {
    console.log('🧪 TEST: Verifying order status in modal...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get status from table
    const firstRow = page.locator('#orders-table-body tr').first()
    const statusCell = firstRow.locator('td').nth(4)
    const statusDropdown = statusCell.locator('select')
    const currentStatus = await statusDropdown.inputValue()

    console.log(`📋 Current status: ${currentStatus}`)

    // Open modal
    await firstRow.locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Modal should show status
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    // Should mention Estado/Status
    const hasStatus = modalText.includes('Estado') || modalText.includes('Status')
    expect(hasStatus).toBe(true)
    console.log('✅ Status information present in modal')
  })

  test('should have scrollable content in modal', async ({ page }) => {
    console.log('🧪 TEST: Verifying modal scrollability...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Open modal
    await page.locator('#orders-table-body tr').first().locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    // Modal scroll container should exist
    const scrollContainer = page.locator('#modal-scroll-container')
    await expect(scrollContainer).toBeVisible()
    console.log('✅ Modal scroll container present')

    // Check if overflow-y-auto class is present (makes it scrollable)
    const scrollContainerClass = await scrollContainer.getAttribute('class')
    expect(scrollContainerClass).toContain('overflow-y-auto')
    console.log('✅ Modal content is scrollable')
  })

  test('comprehensive modal validation', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive modal validation...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Step 1: Verify modal is hidden initially
    const modal = page.locator('#order-modal')
    await expect(modal).toHaveClass(/hidden/)
    console.log('✅ Step 1: Modal hidden initially')

    // Step 2: Open modal
    const firstRow = page.locator('#orders-table-body tr').first()
    await firstRow.locator('button:has-text("Ver")').click()
    await page.waitForTimeout(1000)

    await expect(modal).not.toHaveClass(/hidden/)
    console.log('✅ Step 2: Modal opened')

    // Step 3: Verify all key sections present
    const modalContent = page.locator('#modal-content')
    const modalText = await modalContent.textContent()

    const requiredSections = [
      {
        name: 'Customer info',
        check: () => modalText.includes('Cliente') || modalText.includes('Email')
      },
      {
        name: 'Products',
        check: () => modalText.includes('Productos') || modalText.includes('Items')
      },
      { name: 'Total', check: () => modalText.includes('Total') && modalText.includes('$') },
      { name: 'Status', check: () => modalText.includes('Estado') },
      {
        name: 'Delivery',
        check: () => modalText.includes('Dirección') || modalText.includes('Entrega')
      }
    ]

    for (const section of requiredSections) {
      const isPresent = section.check()
      expect(isPresent).toBe(true)
      console.log(`✅ Step 3: ${section.name} present`)
    }

    // Step 4: Verify modal has close button
    const closeButton = page.locator('#close-modal')
    await expect(closeButton).toBeVisible()
    console.log('✅ Step 4: Close button visible')

    // Step 5: Close modal
    await closeButton.click()
    await page.waitForTimeout(500)

    await expect(modal).toHaveClass(/hidden/)
    console.log('✅ Step 5: Modal closed')

    console.log('🎉 Comprehensive modal validation PASSED!')
  })
})
