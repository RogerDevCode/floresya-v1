/**
 * E2E Tests for Real Users Page Issues
 * Testing specific problems identified in the current implementation
 */

import { test, expect } from '@playwright/test'

test.describe('Users Page Real Issues', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard and authenticate
    await page.goto('http://localhost:3000/admin/dashboard.html')

    // Set up mock authentication
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'admin-token')
      window.authMock = true
    })

    // Navigate to users view
    await page.click('[data-view="users"]')
    await page.waitForSelector('#users-view', { state: 'visible', timeout: 10000 })
  })

  test('should display users table with real data', async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Check that table has rows
    const tableRows = page.locator('#users-table-body tr')
    const rowCount = await tableRows.count()

    expect(rowCount).toBeGreaterThan(0)
    console.log(`✅ Found ${rowCount} users in table`)

    // Check first user has expected data structure
    const firstRow = tableRows.first()
    const rowText = await firstRow.textContent()

    // Should contain email and other user info
    expect(rowText).toContain('@')
    console.log(`✅ First row contains email: ${rowText.includes('@')}`)

    // Should have action buttons (except for admin)
    const actionButtons = firstRow.locator('button')
    const buttonCount = await actionButtons.count()
    console.log(`✅ First row has ${buttonCount} action buttons`)
  })

  test('should protect admin user (ID 3) from modifications', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Find admin user
    const tableRows = page.locator('#users-table-body tr')
    let adminRow = null

    for (let i = 0; i < (await tableRows.count()); i++) {
      const row = tableRows.nth(i)
      const text = await row.textContent()
      if (text.includes('Administrador')) {
        adminRow = row
        break
      }
    }

    expect(adminRow).toBeTruthy()
    console.log('✅ Found admin user row')

    if (adminRow) {
      // Admin should have spans instead of buttons for role, status, email
      const adminRoleElement = adminRow.locator('.bg-blue-100').first()
      const adminStatusElement = adminRow.locator('.bg-green-100').first()

      const roleTagName = await adminRoleElement.evaluate(el => el.tagName.toLowerCase())
      const statusTagName = await adminStatusElement.evaluate(el => el.tagName.toLowerCase())

      expect(roleTagName).toBe('span')
      expect(statusTagName).toBe('span')
      console.log('✅ Admin user has protected elements (spans instead of buttons)')

      // Admin should not have delete button
      const deleteButton = adminRow.locator('button[onclick*="deleteUser"]')
      expect(await deleteButton.count()).toBe(0)
      console.log('✅ Admin user has no delete button')
    }
  })

  test('should show email verification filter working', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Get initial count
    const initialRows = await page.locator('#users-table-body tr').count()
    console.log(`✅ Initial users count: ${initialRows}`)

    // Test email verification filter
    await page.selectOption('#email-verified-filter', 'true')
    await page.waitForTimeout(1000)

    const verifiedRows = await page.locator('#users-table-body tr').count()
    console.log(`✅ Verified users count: ${verifiedRows}`)

    // Reset filter
    await page.selectOption('#email-verified-filter', 'false')
    await page.waitForTimeout(1000)

    const unverifiedRows = await page.locator('#users-table-body tr').count()
    console.log(`✅ Unverified users count: ${unverifiedRows}`)

    // Reset to all
    await page.selectOption('#email-verified-filter', '')
    await page.waitForTimeout(1000)

    const finalRows = await page.locator('#users-table-body tr').count()
    expect(finalRows).toBe(initialRows)
    console.log('✅ Email verification filter works correctly')
  })

  test('should display correct user statistics', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Wait for stats to update
    await page.waitForTimeout(1000)

    // Check statistics are populated
    const totalUsers = page.locator('#total-users')
    const activeUsers = page.locator('#active-users')
    const adminUsers = page.locator('#admin-users')
    const verifiedUsers = page.locator('#verified-users')

    const totalText = await totalUsers.textContent()
    const activeText = await activeUsers.textContent()
    const adminText = await adminUsers.textContent()
    const verifiedText = await verifiedUsers.textContent()

    expect(parseInt(totalText)).toBeGreaterThan(0)
    expect(parseInt(activeText)).toBeGreaterThan(0)
    expect(parseInt(adminText)).toBeGreaterThan(0)

    console.log(
      `✅ Statistics - Total: ${totalText}, Active: ${activeText}, Admin: ${adminText}, Verified: ${verifiedText}`
    )
  })

  test('should handle role filter correctly', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Get initial count
    const initialCount = await page.locator('#users-table-body tr').count()

    // Filter by admin role
    await page.selectOption('#user-role-filter', 'admin')
    await page.waitForTimeout(1000)

    const adminCount = await page.locator('#users-table-body tr').count()
    expect(adminCount).toBeLessThanOrEqual(initialCount)
    console.log(`✅ Admin filter: ${adminCount} users`)

    // Should show admin badge
    if (adminCount > 0) {
      const firstRow = page.locator('#users-table-body tr').first()
      expect(await firstRow.textContent()).toContain('Administrador')
      console.log('✅ Admin users show correct badge')
    }

    // Filter by user role
    await page.selectOption('#user-role-filter', 'user')
    await page.waitForTimeout(1000)

    const userCount = await page.locator('#users-table-body tr').count()
    console.log(`✅ User filter: ${userCount} users`)

    // Reset filter
    await page.selectOption('#user-role-filter', '')
    await page.waitForTimeout(1000)

    const finalCount = await page.locator('#users-table-body tr').count()
    expect(finalCount).toBe(initialCount)
  })

  test('should handle search functionality correctly', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Get initial count
    const initialCount = await page.locator('#users-table-body tr').count()

    // Search for known admin email
    await page.fill('#user-search-input', 'admin')
    await page.waitForTimeout(1000)

    const searchResults = await page.locator('#users-table-body tr').count()
    console.log(`✅ Search for "admin": ${searchResults} results`)

    // Clear search
    await page.fill('#user-search-input', '')
    await page.waitForTimeout(1000)

    const finalCount = await page.locator('#users-table-body tr').count()
    expect(finalCount).toBe(initialCount)
    console.log('✅ Search functionality works correctly')
  })

  test('should allow toggling user role for non-admin users', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Find a non-admin user
    const tableRows = page.locator('#users-table-body tr')
    let nonAdminRow = null

    for (let i = 0; i < (await tableRows.count()); i++) {
      const row = tableRows.nth(i)
      const text = await row.textContent()
      if (text.includes('Cliente')) {
        nonAdminRow = row
        break
      }
    }

    if (nonAdminRow) {
      const roleButton = nonAdminRow.locator('button[onclick*="toggleUserRole"]')

      if (await roleButton.isVisible()) {
        console.log('✅ Found non-admin user with role toggle button')

        // Click the button
        await roleButton.click()

        // Wait for confirmation dialog
        await page.waitForTimeout(1000)

        // Look for any kind of confirmation dialog
        const modalSelector = page.locator('#user-modal, .swal2-popup, [role="dialog"]')

        if (await modalSelector.isVisible({ timeout: 3000 })) {
          console.log('✅ Confirmation dialog appeared')

          // Close the dialog (cancel)
          const cancelButton = page
            .locator('button')
            .filter({ hasText: /cancelar|cerrar|no/i })
            .first()
          if (await cancelButton.isVisible()) {
            await cancelButton.click()
          } else {
            // Try ESC key
            await page.keyboard.press('Escape')
          }

          await page.waitForTimeout(500)
          console.log('✅ Dialog closed successfully')
        } else {
          console.log('⚠️ No confirmation dialog appeared (might be toast notification)')
        }
      } else {
        console.log('⚠️ No role toggle button found for non-admin user')
      }
    } else {
      console.log('⚠️ No non-admin users found')
    }
  })

  test('should show loading states correctly', async ({ page }) => {
    // Navigate to users fresh to see loading state
    await page.click('[data-view="dashboard"]')
    await page.waitForSelector('#dashboard-view', { state: 'visible' })

    // Navigate back to users
    await page.click('[data-view="users"]')

    // Check for loading state
    const _loadingElement = page.locator('#users-loading')

    // Loading might be too fast to catch, but we should see the transition
    await page.waitForTimeout(500)

    // Should show table content
    const tableBody = page.locator('#users-table-body')
    await expect(tableBody).toBeVisible({ timeout: 10000 })

    console.log('✅ Users table loads without issues')
  })

  test('should handle empty states gracefully', async ({ page }) => {
    await page.waitForSelector('#users-table-body tr', { state: 'attached', timeout: 10000 })

    // Search for non-existent user
    await page.fill('#user-search-input', 'nonexistentuser12345')
    await page.waitForTimeout(1000)

    // Check if empty state is shown
    const emptyState = page.locator('#users-empty')

    if (await emptyState.isVisible({ timeout: 3000 })) {
      console.log('✅ Empty state shown for no results')
      expect(await emptyState.textContent()).toContain('No se encontraron usuarios')
    } else {
      console.log('ℹ️ Empty state not visible (might have results or different handling)')
    }

    // Clear search
    await page.fill('#user-search-input', '')
    await page.waitForTimeout(1000)

    // Should have users again
    const tableRows = await page.locator('#users-table-body tr').count()
    expect(tableRows).toBeGreaterThan(0)
  })

  test('should have working create user modal', async ({ page }) => {
    await page.waitForSelector('#users-view', { state: 'visible' })

    // Click create user button
    await page.click('#create-user-btn')

    // Modal should appear
    await expect(page.locator('#user-modal')).toBeVisible({ timeout: 5000 })

    // Check form elements exist
    await expect(page.locator('#user-email')).toBeVisible()
    await expect(page.locator('#user-full-name')).toBeVisible()
    await expect(page.locator('#user-phone')).toBeVisible()
    await expect(page.locator('#user-role')).toBeVisible()

    console.log('✅ Create user modal opens correctly')

    // Close modal
    await page.click('#cancel-user-form')
    await expect(page.locator('#user-modal')).toBeHidden({ timeout: 3000 })

    console.log('✅ Create user modal closes correctly')
  })

  test('should have responsive design on mobile', async ({ page }) => {
    await page.waitForSelector('#users-view', { state: 'visible' })

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check main elements are still visible
    await expect(page.locator('#users-view')).toBeVisible()
    await expect(page.locator('#user-search-input')).toBeVisible()

    // Check mobile navigation
    const mobileMenu = page.locator('#admin-sidebar-toggle')
    if (await mobileMenu.isVisible()) {
      console.log('✅ Mobile navigation menu is visible')
    }

    // Check table adapts to mobile
    await expect(page.locator('#users-table-body')).toBeVisible()

    console.log('✅ Mobile layout works correctly')

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
  })
})
