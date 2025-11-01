import { test, expect } from '@playwright/test'

/**
 * TEST ATÓMICO 8: Verificar funcionalidad de paginación
 *
 * Objetivo:
 * - Verificar que la paginación funciona correctamente
 * - Botones de navegación funcionan
 * - Información de páginas es correcta
 * - Cambio de items por página funciona
 * - Paginación refleja filtros aplicados
 *
 * Principio KISS: Solo valida paginación
 */

test.describe('Orders Page - Pagination', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
  const ORDERS_URL = `${BASE_URL}/pages/admin/orders.html`

  /**
   * Helper: Get pagination info
   */
  async function getPaginationInfo(page) {
    return {
      showingFrom: parseInt(await page.locator('#showing-from').textContent(), 10),
      showingTo: parseInt(await page.locator('#showing-to').textContent(), 10),
      totalOrders: parseInt(await page.locator('#total-orders').textContent(), 10),
      currentPage: parseInt(await page.locator('#current-page').textContent(), 10),
      totalPages: parseInt(await page.locator('#total-pages').textContent(), 10)
    }
  }

  test('should display pagination information correctly on load', async ({ page }) => {
    console.log('🧪 TEST: Verifying pagination info on load...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const info = await getPaginationInfo(page)
    console.log('📊 Pagination info:', info)

    // Validate pagination numbers
    expect(info.currentPage).toBeGreaterThan(0)
    expect(info.totalPages).toBeGreaterThan(0)
    expect(info.showingFrom).toBeGreaterThan(0)
    expect(info.showingTo).toBeGreaterThanOrEqual(info.showingFrom)
    expect(info.totalOrders).toBeGreaterThanOrEqual(info.showingTo)

    console.log('✅ Pagination info is valid')
  })

  test('should start on page 1', async ({ page }) => {
    console.log('🧪 TEST: Verifying initial page is 1...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const currentPage = parseInt(await page.locator('#current-page').textContent(), 10)
    expect(currentPage).toBe(1)
    console.log('✅ Starting on page 1')
  })

  test('should disable "First" and "Previous" buttons on first page', async ({ page }) => {
    console.log('🧪 TEST: Verifying first page button states...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const currentPage = parseInt(await page.locator('#current-page').textContent(), 10)

    if (currentPage === 1) {
      const firstBtn = page.locator('#btn-first-page')
      const prevBtn = page.locator('#btn-prev-page')

      await expect(firstBtn).toBeDisabled()
      await expect(prevBtn).toBeDisabled()

      console.log('✅ First and Previous buttons disabled on page 1')
    } else {
      console.log('ℹ️ Not on page 1, skipping test')
    }
  })

  test('should navigate to next page when "Next" button is clicked', async ({ page }) => {
    console.log('🧪 TEST: Navigating to next page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)
    console.log('📊 Initial:', initialInfo)

    if (initialInfo.totalPages <= 1) {
      console.log('⏭️ Skipping - only 1 page available')
      test.skip()
      return
    }

    // Click Next button
    const nextBtn = page.locator('#btn-next-page')
    await nextBtn.click()
    await page.waitForTimeout(1000)

    const afterNext = await getPaginationInfo(page)
    console.log('📊 After next:', afterNext)

    // Should be on page 2
    expect(afterNext.currentPage).toBe(initialInfo.currentPage + 1)
    console.log('✅ Successfully navigated to next page')
  })

  test('should navigate to previous page when "Previous" button is clicked', async ({ page }) => {
    console.log('🧪 TEST: Navigating to previous page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)

    if (initialInfo.totalPages <= 1) {
      console.log('⏭️ Skipping - only 1 page available')
      test.skip()
      return
    }

    // Go to page 2 first
    await page.locator('#btn-next-page').click()
    await page.waitForTimeout(1000)

    const onPage2 = await getPaginationInfo(page)
    expect(onPage2.currentPage).toBe(2)

    // Click Previous
    await page.locator('#btn-prev-page').click()
    await page.waitForTimeout(1000)

    const backToPage1 = await getPaginationInfo(page)
    console.log('📊 Back to page:', backToPage1.currentPage)

    expect(backToPage1.currentPage).toBe(1)
    console.log('✅ Successfully navigated to previous page')
  })

  test('should navigate to last page when "Last" button is clicked', async ({ page }) => {
    console.log('🧪 TEST: Navigating to last page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)
    console.log('📊 Initial:', initialInfo)

    if (initialInfo.totalPages <= 1) {
      console.log('⏭️ Skipping - only 1 page available')
      test.skip()
      return
    }

    // Click Last button
    const lastBtn = page.locator('#btn-last-page')
    await lastBtn.click()
    await page.waitForTimeout(1000)

    const onLastPage = await getPaginationInfo(page)
    console.log('📊 On last page:', onLastPage)

    expect(onLastPage.currentPage).toBe(initialInfo.totalPages)
    console.log('✅ Successfully navigated to last page')
  })

  test('should navigate to first page when "First" button is clicked', async ({ page }) => {
    console.log('🧪 TEST: Navigating to first page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)

    if (initialInfo.totalPages <= 1) {
      console.log('⏭️ Skipping - only 1 page available')
      test.skip()
      return
    }

    // Go to last page first
    await page.locator('#btn-last-page').click()
    await page.waitForTimeout(1000)

    const onLastPage = await getPaginationInfo(page)
    expect(onLastPage.currentPage).toBe(initialInfo.totalPages)

    // Click First
    await page.locator('#btn-first-page').click()
    await page.waitForTimeout(1000)

    const backToFirst = await getPaginationInfo(page)
    console.log('📊 Back to page:', backToFirst.currentPage)

    expect(backToFirst.currentPage).toBe(1)
    console.log('✅ Successfully navigated back to first page')
  })

  test('should disable "Next" and "Last" buttons on last page', async ({ page }) => {
    console.log('🧪 TEST: Verifying last page button states...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const info = await getPaginationInfo(page)

    if (info.totalPages <= 1) {
      console.log('⏭️ Skipping - only 1 page')
      test.skip()
      return
    }

    // Navigate to last page
    await page.locator('#btn-last-page').click()
    await page.waitForTimeout(1000)

    const onLastPage = await getPaginationInfo(page)
    expect(onLastPage.currentPage).toBe(info.totalPages)

    // Next and Last buttons should be disabled
    const nextBtn = page.locator('#btn-next-page')
    const lastBtn = page.locator('#btn-last-page')

    await expect(nextBtn).toBeDisabled()
    await expect(lastBtn).toBeDisabled()

    console.log('✅ Next and Last buttons disabled on last page')
  })

  test('should show correct number of rows per page', async ({ page }) => {
    console.log('🧪 TEST: Verifying rows per page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Get items per page setting (default 50)
    const itemsPerPage = parseInt(await page.locator('#items-per-page').inputValue(), 10)
    console.log(`📊 Items per page setting: ${itemsPerPage}`)

    // Count rows in table
    const tableRows = page.locator('#orders-table-body tr')
    const rowCount = await tableRows.count()
    console.log(`📊 Rows in table: ${rowCount}`)

    // Should show at most itemsPerPage rows
    expect(rowCount).toBeLessThanOrEqual(itemsPerPage)
    console.log('✅ Row count respects items per page setting')
  })

  test('should change items per page and reset to page 1', async ({ page }) => {
    console.log('🧪 TEST: Changing items per page...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)
    console.log('📊 Initial:', initialInfo)

    // Change items per page to 20
    await page.locator('#items-per-page').selectOption('20')
    await page.waitForTimeout(1000)

    const afterChange = await getPaginationInfo(page)
    console.log('📊 After change:', afterChange)

    // Should reset to page 1
    expect(afterChange.currentPage).toBe(1)
    console.log('✅ Reset to page 1 after changing items per page')

    // showingTo should be at most 20 (unless total < 20)
    expect(afterChange.showingTo).toBeLessThanOrEqual(Math.min(20, afterChange.totalOrders))
    console.log('✅ Showing correct number of items')
  })

  test('should update pagination when filters are applied', async ({ page }) => {
    console.log('🧪 TEST: Pagination updates with filters...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)
    console.log('📊 Initial:', initialInfo)

    // Apply a filter
    await page.locator('#status-filter').selectOption('pending')
    await page.waitForTimeout(1000)

    const afterFilter = await getPaginationInfo(page)
    console.log('📊 After filter:', afterFilter)

    // Should reset to page 1
    expect(afterFilter.currentPage).toBe(1)
    console.log('✅ Reset to page 1 after applying filter')

    // Total orders should change (unless all orders are pending)
    expect(afterFilter.totalOrders).toBeLessThanOrEqual(initialInfo.totalOrders)
    console.log('✅ Total orders updated based on filter')
  })

  test('should show correct showing-from and showing-to on different pages', async ({ page }) => {
    console.log('🧪 TEST: Verifying showing-from and showing-to...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const info = await getPaginationInfo(page)

    if (info.totalPages <= 1) {
      console.log('⏭️ Skipping - only 1 page')
      test.skip()
      return
    }

    // Page 1: showing-from should be 1
    expect(info.showingFrom).toBe(1)
    console.log(`✅ Page 1: Showing from ${info.showingFrom}`)

    // Get items per page
    const itemsPerPage = parseInt(await page.locator('#items-per-page').inputValue(), 10)

    // Go to page 2
    await page.locator('#btn-next-page').click()
    await page.waitForTimeout(1000)

    const page2Info = await getPaginationInfo(page)
    console.log('📊 Page 2:', page2Info)

    // Page 2: showing-from should be itemsPerPage + 1
    expect(page2Info.showingFrom).toBe(itemsPerPage + 1)
    console.log(`✅ Page 2: Showing from ${page2Info.showingFrom}`)
  })

  test('should maintain correct pagination after status change', async ({ page }) => {
    console.log('🧪 TEST: Pagination after status change...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const initialInfo = await getPaginationInfo(page)
    console.log('📊 Initial pagination:', initialInfo)

    // Change status of first order
    const firstRow = page.locator('#orders-table-body tr').first()
    const statusDropdown = firstRow.locator('td').nth(4).locator('select')
    const currentStatus = await statusDropdown.inputValue()

    const newStatus = currentStatus === 'pending' ? 'verified' : 'pending'
    await statusDropdown.selectOption(newStatus)
    await page.waitForTimeout(2000)

    const afterChange = await getPaginationInfo(page)
    console.log('📊 After status change:', afterChange)

    // Pagination should remain consistent (total might change if filter applied)
    expect(afterChange.currentPage).toBeGreaterThan(0)
    expect(afterChange.totalPages).toBeGreaterThan(0)
    console.log('✅ Pagination remains valid after status change')
  })

  test('comprehensive pagination validation', async ({ page }) => {
    console.log('🧪 TEST: Comprehensive pagination validation...')

    await page.goto(ORDERS_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Step 1: Verify initial state
    let info = await getPaginationInfo(page)
    console.log('\n📊 Step 1: Initial state:', info)
    expect(info.currentPage).toBe(1)
    expect(info.showingFrom).toBe(1)

    if (info.totalPages <= 1) {
      console.log('⏭️ Only 1 page - skipping multi-page tests')
    } else {
      // Step 2: Navigate to next page
      console.log('\n📊 Step 2: Navigate to next page')
      await page.locator('#btn-next-page').click()
      await page.waitForTimeout(1000)
      info = await getPaginationInfo(page)
      console.log('   Current page:', info.currentPage)
      expect(info.currentPage).toBe(2)

      // Step 3: Navigate to last page
      console.log('\n📊 Step 3: Navigate to last page')
      await page.locator('#btn-last-page').click()
      await page.waitForTimeout(1000)
      info = await getPaginationInfo(page)
      console.log('   Current page:', info.currentPage)
      expect(info.currentPage).toBe(info.totalPages)

      // Step 4: Navigate back to first
      console.log('\n📊 Step 4: Navigate back to first')
      await page.locator('#btn-first-page').click()
      await page.waitForTimeout(1000)
      info = await getPaginationInfo(page)
      console.log('   Current page:', info.currentPage)
      expect(info.currentPage).toBe(1)
    }

    // Step 5: Change items per page
    console.log('\n📊 Step 5: Change items per page')
    await page.locator('#items-per-page').selectOption('20')
    await page.waitForTimeout(1000)
    info = await getPaginationInfo(page)
    console.log('   After change:', info)
    expect(info.currentPage).toBe(1)

    // Step 6: Apply filter
    console.log('\n📊 Step 6: Apply filter')
    await page.locator('#status-filter').selectOption('delivered')
    await page.waitForTimeout(1000)
    info = await getPaginationInfo(page)
    console.log('   After filter:', info)
    expect(info.currentPage).toBe(1)

    console.log('\n🎉 Comprehensive pagination validation PASSED!')
  })
})
