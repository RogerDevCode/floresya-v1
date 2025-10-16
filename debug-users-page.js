/**
 * Debug script to identify specific issues with users page
 */

import { chromium } from 'playwright'

async function debugUsersPage() {
  console.log('🔍 Starting Users Page Debug...\n')

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    // Navigate to admin dashboard
    console.log('1. Navigating to admin dashboard...')
    await page.goto('http://localhost:3000/admin/dashboard.html')

    // Set up mock authentication
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'admin-token')
      window.authMock = true
    })

    // Navigate to users view
    console.log('2. Navigating to users view...')
    await page.click('[data-view="users"]')
    await page.waitForSelector('#users-view', { state: 'visible', timeout: 10000 })

    console.log('✅ Users page loaded successfully\n')

    // Check if users data loads
    console.log('3. Checking users data loading...')
    await page.waitForTimeout(2000) // Wait for data to load

    const usersTableBody = page.locator('#users-table-body')
    const tableRows = usersTableBody.locator('tr')
    const rowCount = await tableRows.count()

    console.log(`📊 Found ${rowCount} user rows in table`)

    if (rowCount === 0) {
      console.log('❌ No users found in table - investigating...')

      // Check loading states
      const loadingElement = page.locator('#users-loading')
      const errorElement = page.locator('#users-error')
      const emptyElement = page.locator('#users-empty')

      if (await loadingElement.isVisible()) {
        console.log('⏳ Still loading users...')
      }

      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent()
        console.log(`🚨 Error loading users: ${errorText}`)
      }

      if (await emptyElement.isVisible()) {
        console.log('📭 No users available (empty state)')
      }

      // Check API call
      console.log('4. Checking API calls...')

      // Listen to network requests
      const apiRequests = []
      page.on('request', request => {
        if (request.url().includes('/api/users')) {
          apiRequests.push({
            url: request.url(),
            method: request.method(),
            timestamp: new Date().toISOString()
          })
        }
      })

      // Reload and wait for API
      await page.reload()
      await page.click('[data-view="users"]')
      await page.waitForTimeout(3000)

      console.log(`📡 Made ${apiRequests.length} API calls to /api/users`)
      apiRequests.forEach(req => {
        console.log(`   - ${req.method} ${req.url}`)
      })

      // Check console errors
      console.log('5. Checking console errors...')
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`🚨 Console Error: ${msg.text()}`)
        }
      })

      // Check if user-search-input exists and works
      console.log('6. Checking filter elements...')
      const searchInput = page.locator('#user-search-input')
      const roleFilter = page.locator('#user-role-filter')
      const statusFilter = page.locator('#user-status-filter')
      const emailFilter = page.locator('#email-verified-filter')

      console.log(`   - Search input visible: ${await searchInput.isVisible()}`)
      console.log(`   - Role filter visible: ${await roleFilter.isVisible()}`)
      console.log(`   - Status filter visible: ${await statusFilter.isVisible()}`)
      console.log(`   - Email filter visible: ${await emailFilter.isVisible()}`)

      // Try to trigger filter
      console.log('7. Testing filter functionality...')
      await searchInput.fill('test')
      await page.waitForTimeout(1000)

      const filteredRows = await tableRows.count()
      console.log(`📊 After search filter: ${filteredRows} rows`)
    } else {
      console.log('✅ Users loaded successfully!')

      // Check first user row content
      const firstRow = tableRows.first()
      const rowContent = await firstRow.textContent()
      console.log(`📝 First row content: ${rowContent.substring(0, 200)}...`)

      // Check if columns are visible
      const cells = firstRow.locator('td')
      const cellCount = await cells.count()
      console.log(`📋 First row has ${cellCount} cells`)

      // Check if buttons work
      console.log('8. Testing user management buttons...')

      // Look for toggle buttons (not on admin user)
      let testRow = null
      for (let i = 1; i < Math.min(rowCount, 5); i++) {
        const row = tableRows.nth(i)
        const text = await row.textContent()
        if (text && !text.includes('Administrador')) {
          testRow = row
          break
        }
      }

      if (testRow) {
        const roleButton = testRow.locator('button[onclick*="toggleUserRole"]')
        const statusButton = testRow.locator('button[onclick*="toggleUserStatus"]')
        const emailButton = testRow.locator('button[onclick*="toggleEmailVerification"]')

        console.log(`   - Role button visible: ${await roleButton.isVisible()}`)
        console.log(`   - Status button visible: ${await statusButton.isVisible()}`)
        console.log(`   - Email button visible: ${await emailButton.isVisible()}`)

        if (await roleButton.isVisible()) {
          console.log('   - Testing role button click...')
          await roleButton.click()
          await page.waitForTimeout(500)

          // Check for modal or confirmation
          const modal = page.locator('#user-modal, .swal2-popup')
          if (await modal.isVisible()) {
            console.log('✅ Modal appeared after role button click')
          } else {
            console.log('❌ No modal appeared after role button click')
          }
        }
      }

      // Test filters
      console.log('9. Testing all filters...')

      // Test role filter
      await page.selectOption('#user-role-filter', 'admin')
      await page.waitForTimeout(1000)
      const adminRows = await tableRows.count()
      console.log(`📊 After admin filter: ${adminRows} rows`)

      await page.selectOption('#user-role-filter', 'user')
      await page.waitForTimeout(1000)
      const userRows = await tableRows.count()
      console.log(`📊 After user filter: ${userRows} rows`)

      // Test email verification filter
      await page.selectOption('#email-verified-filter', 'true')
      await page.waitForTimeout(1000)
      const verifiedRows = await tableRows.count()
      console.log(`📊 After verified filter: ${verifiedRows} rows`)

      await page.selectOption('#email-verified-filter', 'false')
      await page.waitForTimeout(1000)
      const unverifiedRows = await tableRows.count()
      console.log(`📊 After unverified filter: ${unverifiedRows} rows`)

      // Test search
      await page.selectOption('#user-role-filter', '') // Reset
      await page.fill('#user-search-input', '')
      await page.waitForTimeout(500)

      console.log('10. Checking statistics...')
      const totalUsers = await page.locator('#total-users').textContent()
      const activeUsers = await page.locator('#active-users').textContent()
      const adminUsers = await page.locator('#admin-users').textContent()
      const verifiedUsers = await page.locator('#verified-users').textContent()

      console.log(`📈 Statistics:`)
      console.log(`   - Total users: ${totalUsers}`)
      console.log(`   - Active users: ${activeUsers}`)
      console.log(`   - Admin users: ${adminUsers}`)
      console.log(`   - Verified users: ${verifiedUsers}`)
    }
  } catch (error) {
    console.error('❌ Error during debugging:', error.message)
  } finally {
    // Keep browser open for manual inspection
    console.log('\n🔍 Debug complete. Browser will stay open for manual inspection...')
    console.log('Press Ctrl+C to close')

    // Wait for manual interaction
    await page.waitForTimeout(30000)

    await browser.close()
  }
}

debugUsersPage().catch(console.error)
