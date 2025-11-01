/**
 * E2E Tests for Users Management Page
 * Comprehensive testing of all user management functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Users Management Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard and authenticate
    await page.goto('/admin/dashboard.html')

    // Set up mock authentication
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'admin-token')
      window.authMock = true
    })

    // Navigate to users view
    await page.click('[data-view="users"]')
    await page.waitForSelector('#users-view', { state: 'visible' })
  })

  test.describe('Page Loading and Display', () => {
    test('should display users page with correct elements', async ({ page }) => {
      // Check main sections are visible
      await expect(page.locator('#users-view')).toBeVisible()
      await expect(page.locator('#total-users')).toBeVisible()
      await expect(page.locator('#active-users')).toBeVisible()
      await expect(page.locator('#admin-users')).toBeVisible()
      await expect(page.locator('#verified-users')).toBeVisible()

      // Check filters are present
      await expect(page.locator('#user-search-input')).toBeVisible()
      await expect(page.locator('#user-role-filter')).toBeVisible()
      await expect(page.locator('#user-status-filter')).toBeVisible()
      await expect(page.locator('#email-verified-filter')).toBeVisible()

      // Check create button
      await expect(page.locator('#create-user-btn')).toBeVisible()

      // Check table
      await expect(page.locator('#users-table-body')).toBeVisible()
    })

    test('should display user statistics correctly', async ({ page }) => {
      // Wait for data to load
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Check stats are populated (not empty)
      const totalUsers = await page.locator('#total-users').textContent()
      const activeUsers = await page.locator('#active-users').textContent()
      const adminUsers = await page.locator('#admin-users').textContent()
      const verifiedUsers = await page.locator('#verified-users').textContent()

      expect(parseInt(totalUsers)).toBeGreaterThanOrEqual(0)
      expect(parseInt(activeUsers)).toBeGreaterThanOrEqual(0)
      expect(parseInt(adminUsers)).toBeGreaterThanOrEqual(0)
      expect(parseInt(verifiedUsers)).toBeGreaterThanOrEqual(0)
    })

    test('should display users table with correct columns', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Check table headers
      const headers = page.locator('#users-table-body thead th')
      await expect(headers.nth(0)).toContainText('ID')
      await expect(headers.nth(1)).toContainText('Usuario')
      await expect(headers.nth(2)).toContainText('Contacto')
      await expect(headers.nth(3)).toContainText('Rol')
      await expect(headers.nth(4)).toContainText('Estado')
      await expect(headers.nth(5)).toContainText('Email')
      await expect(headers.nth(6)).toContainText('Acciones')
    })
  })

  test.describe('Search Functionality', () => {
    test('should search users by name with accent normalization', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      const initialCount = await page.locator('#users-table-body tr').count()

      // Search with accent
      await page.fill('#user-search-input', 'María')
      await page.waitForTimeout(500) // Wait for debounce

      const filteredCount = await page.locator('#users-table-body tr').count()
      expect(filteredCount).toBeLessThanOrEqual(initialCount)

      // Search without accent (should find same results)
      await page.fill('#user-search-input', 'Maria')
      await page.waitForTimeout(500)

      const accentLessCount = await page.locator('#users-table-body tr').count()
      expect(accentLessCount).toBe(filteredCount)
    })

    test('should search users by email', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Search by email domain
      await page.fill('#user-search-input', '@example.com')
      await page.waitForTimeout(500)

      const results = page.locator('#users-table-body tr')
      const count = await results.count()

      if (count > 0) {
        // Check that results contain the search term
        const firstRow = results.first()
        await expect(firstRow).toContainText('@example.com')
      }
    })

    test('should clear search and show all users', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      const initialCount = await page.locator('#users-table-body tr').count()

      // Search something
      await page.fill('#user-search-input', 'nonexistent')
      await page.waitForTimeout(500)

      // Clear search
      await page.fill('#user-search-input', '')
      await page.waitForTimeout(500)

      const finalCount = await page.locator('#users-table-body tr').count()
      expect(finalCount).toBe(initialCount)
    })
  })

  test.describe('Filter Functionality', () => {
    test('should filter users by role', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      const totalUsers = await page.locator('#users-table-body tr').count()

      // Filter by admin role
      await page.selectOption('#user-role-filter', 'admin')
      await page.waitForTimeout(300)

      const adminUsers = await page.locator('#users-table-body tr').count()
      expect(adminUsers).toBeLessThanOrEqual(totalUsers)

      // Verify filtered users have admin role
      if (adminUsers > 0) {
        const firstRow = page.locator('#users-table-body tr').first()
        await expect(firstRow).toContainText('Administrador')
      }

      // Filter by user role
      await page.selectOption('#user-role-filter', 'user')
      await page.waitForTimeout(300)

      const regularUsers = await page.locator('#users-table-body tr').count()
      expect(regularUsers).toBeLessThanOrEqual(totalUsers)
    })

    test('should filter users by status', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      const totalUsers = await page.locator('#users-table-body tr').count()

      // Filter by active users
      await page.selectOption('#user-status-filter', 'active')
      await page.waitForTimeout(300)

      const activeUsers = await page.locator('#users-table-body tr').count()
      expect(activeUsers).toBeLessThanOrEqual(totalUsers)

      // Reset filter
      await page.selectOption('#user-status-filter', '')
      await page.waitForTimeout(300)
    })

    test('should filter users by email verification status', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      const totalUsers = await page.locator('#users-table-body tr').count()

      // Filter by verified emails
      await page.selectOption('#email-verified-filter', 'true')
      await page.waitForTimeout(300)

      const verifiedUsers = await page.locator('#users-table-body tr').count()
      expect(verifiedUsers).toBeLessThanOrEqual(totalUsers)

      // Verify filtered users have verified email status
      if (verifiedUsers > 0) {
        const firstRow = page.locator('#users-table-body tr').first()
        await expect(firstRow).toContainText('Verificado')
      }

      // Filter by unverified emails
      await page.selectOption('#email-verified-filter', 'false')
      await page.waitForTimeout(300)

      const unverifiedUsers = await page.locator('#users-table-body tr').count()
      expect(unverifiedUsers).toBeLessThanOrEqual(totalUsers)

      if (unverifiedUsers > 0) {
        const firstRow = page.locator('#users-table-body tr').first()
        await expect(firstRow).toContainText('Pendiente')
      }
    })

    test('should combine multiple filters', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      const totalUsers = await page.locator('#users-table-body tr').count()

      // Apply multiple filters
      await page.selectOption('#user-role-filter', 'user')
      await page.selectOption('#email-verified-filter', 'true')
      await page.fill('#user-search-input', 'test')
      await page.waitForTimeout(500)

      const filteredUsers = await page.locator('#users-table-body tr').count()
      expect(filteredUsers).toBeLessThanOrEqual(totalUsers)
    })
  })

  test.describe('User Role Management', () => {
    test('should toggle user role between admin and user', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find a non-admin user (skip first row which might be admin)
      const userRows = page.locator('#users-table-body tr')
      const rowCount = await userRows.count()

      if (rowCount > 1) {
        // Find a user row (not admin)
        let targetRow = null
        for (let i = 1; i < rowCount; i++) {
          const row = userRows.nth(i)
          const text = await row.textContent()
          if (text && text.includes('Cliente')) {
            targetRow = row
            break
          }
        }

        if (targetRow) {
          const initialText = await targetRow.textContent()
          const isClient = initialText.includes('Cliente')

          // Click role toggle button
          const roleButton = targetRow.locator('button[onclick*="toggleUserRole"]').first()
          await roleButton.click()

          // Handle confirmation dialog
          await page
            .waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 })
            .catch(() => page.waitForSelector('text="¿Estás seguro"', { state: 'visible' }))

          // Find and click confirm button
          const confirmButton = page
            .locator('button')
            .filter({ hasText: /confirmar|aceptar|continuar/i })
            .first()
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }

          // Wait for update
          await page.waitForTimeout(1000)

          // Verify role changed
          const newText = await targetRow.textContent()
          if (isClient) {
            expect(newText).toContain('Administrador')
          } else {
            expect(newText).toContain('Cliente')
          }
        }
      }
    })

    test('should prevent role change for admin user (ID 1)', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find admin user (usually first row with ID 1)
      const firstRow = page.locator('#users-table-body tr').first()
      const text = await firstRow.textContent()

      if (text && text.includes('Administrador')) {
        // Check that admin role is not clickable (should be a span, not button)
        const adminRoleElement = firstRow.locator('.bg-blue-100').first()
        const tagName = await adminRoleElement.evaluate(el => el.tagName.toLowerCase())
        expect(tagName).toBe('span')
      }
    })
  })

  test.describe('User Status Management', () => {
    test('should toggle user active status', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find an active non-admin user
      const userRows = page.locator('#users-table-body tr')
      const rowCount = await userRows.count()

      if (rowCount > 1) {
        let targetRow = null
        for (let i = 1; i < rowCount; i++) {
          const row = userRows.nth(i)
          const text = await row.textContent()
          if (text && text.includes('Activo') && !text.includes('Administrador')) {
            targetRow = row
            break
          }
        }

        if (targetRow) {
          const initialText = await targetRow.textContent()
          const isActive = initialText.includes('Activo')

          // Click status toggle button
          const statusButton = targetRow.locator('button[onclick*="toggleUserStatus"]').first()
          await statusButton.click()

          // Handle confirmation dialog
          await page
            .waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 })
            .catch(() => page.waitForSelector('text="¿Estás seguro"', { state: 'visible' }))

          // Find and click confirm button
          const confirmButton = page
            .locator('button')
            .filter({ hasText: /confirmar|aceptar|continuar/i })
            .first()
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }

          // Wait for update
          await page.waitForTimeout(1000)

          // Verify status changed
          const newText = await targetRow.textContent()
          if (isActive) {
            expect(newText).toContain('Inactivo')
          } else {
            expect(newText).toContain('Activo')
          }
        }
      }
    })

    test('should prevent status change for admin user (ID 1)', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find admin user
      const firstRow = page.locator('#users-table-body tr').first()
      const text = await firstRow.textContent()

      if (text && text.includes('Administrador')) {
        // Check that admin status is not clickable (should be a span, not button)
        const adminStatusElement = firstRow.locator('.bg-green-100').first()
        const tagName = await adminStatusElement.evaluate(el => el.tagName.toLowerCase())
        expect(tagName).toBe('span')
      }
    })
  })

  test.describe('Email Verification Management', () => {
    test('should toggle email verification status', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find a non-admin user
      const userRows = page.locator('#users-table-body tr')
      const rowCount = await userRows.count()

      if (rowCount > 1) {
        let targetRow = null
        for (let i = 1; i < rowCount; i++) {
          const row = userRows.nth(i)
          const text = await row.textContent()
          if (text && !text.includes('Administrador')) {
            targetRow = row
            break
          }
        }

        if (targetRow) {
          const initialText = await targetRow.textContent()
          const isVerified = initialText.includes('Verificado')

          // Click email verification toggle button
          const emailButton = targetRow
            .locator('button[onclick*="toggleEmailVerification"]')
            .first()
          await emailButton.click()

          // Handle confirmation dialog
          await page
            .waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 })
            .catch(() => page.waitForSelector('text="¿Estás seguro"', { state: 'visible' }))

          // Find and click confirm button
          const confirmButton = page
            .locator('button')
            .filter({ hasText: /confirmar|aceptar|continuar/i })
            .first()
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
          }

          // Wait for update
          await page.waitForTimeout(1000)

          // Verify email verification status changed
          const newText = await targetRow.textContent()
          if (isVerified) {
            expect(newText).toContain('Pendiente')
          } else {
            expect(newText).toContain('Verificado')
          }
        }
      }
    })

    test('should prevent email verification change for admin user (ID 1)', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find admin user
      const firstRow = page.locator('#users-table-body tr').first()
      const text = await firstRow.textContent()

      if (text && text.includes('Administrador')) {
        // Check that admin email verification is not clickable
        const adminEmailElement = firstRow
          .locator('.bg-green-100')
          .filter({ hasText: 'Verificado' })
          .first()
        const tagName = await adminEmailElement.evaluate(el => el.tagName.toLowerCase())
        expect(tagName).toBe('span')
      }
    })
  })

  test.describe('User Creation', () => {
    test('should open create user modal', async ({ page }) => {
      // Click create user button
      await page.click('#create-user-btn')

      // Check modal opens
      await expect(page.locator('#user-modal')).toBeVisible()
      await expect(page.locator('#user-modal-title')).toContainText('Crear Usuario')

      // Check form fields are present
      await expect(page.locator('#user-email')).toBeVisible()
      await expect(page.locator('#user-full-name')).toBeVisible()
      await expect(page.locator('#user-phone')).toBeVisible()
      await expect(page.locator('#user-role')).toBeVisible()

      // Check buttons
      await expect(page.locator('button[type="submit"]')).toBeVisible()
      await expect(page.locator('#cancel-user-form')).toBeVisible()
    })

    test('should close modal when cancel is clicked', async ({ page }) => {
      // Open modal
      await page.click('#create-user-btn')
      await expect(page.locator('#user-modal')).toBeVisible()

      // Click cancel
      await page.click('#cancel-user-form')

      // Check modal closes
      await expect(page.locator('#user-modal')).toBeHidden()
    })

    test('should validate email format in create form', async ({ page }) => {
      await page.click('#create-user-btn')

      // Fill with invalid email
      await page.fill('#user-email', 'invalid-email')
      await page.fill('#user-full-name', 'Test User')

      // Try to submit
      await page.click('button[type="submit"]')

      // Should show validation error or prevent submission
      await page.waitForTimeout(1000)

      // Modal should still be open (validation failed)
      await expect(page.locator('#user-modal')).toBeVisible()
    })

    test('should create new user successfully', async ({ page }) => {
      await page.click('#create-user-btn')

      // Fill form with valid data
      const timestamp = Date.now()
      await page.fill('#user-email', `test${timestamp}@example.com`)
      await page.fill('#user-full-name', 'Test User E2E')
      await page.fill('#user-phone', '+1234567890')
      await page.selectOption('#user-role', 'user')

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for success
      await page.waitForTimeout(2000)

      // Check modal closes
      await expect(page.locator('#user-modal')).toBeHidden()

      // Refresh data
      await page.waitForTimeout(1000)

      // Check if new user appears (may need to search)
      await page.fill('#user-search-input', `test${timestamp}`)
      await page.waitForTimeout(500)

      // Verify new user appears
      const usersTable = page.locator('#users-table-body')
      await expect(usersTable).toContainText(`test${timestamp}@example.com`)
    })
  })

  test.describe('User Actions (Edit, Delete)', () => {
    test('should open edit modal for user', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find edit button (not on admin user)
      const userRows = page.locator('#users-table-body tr')
      const rowCount = await userRows.count()

      if (rowCount > 1) {
        const nonAdminRow = userRows.nth(1) // Skip potential admin user
        const editButton = nonAdminRow.locator('button[onclick*="editUser"]').first()

        if (await editButton.isVisible()) {
          await editButton.click()

          // Check edit modal opens
          await expect(page.locator('#user-modal')).toBeVisible()
          await expect(page.locator('#user-modal-title')).toContainText('Editar Usuario')

          // Form should be populated with existing data
          const emailInput = page.locator('#user-email')
          const emailValue = await emailInput.inputValue()
          expect(emailValue).toBeTruthy()
        }
      }
    })

    test('should show delete confirmation for non-admin users', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Find delete button (not on admin user)
      const userRows = page.locator('#users-table-body tr')
      const rowCount = await userRows.count()

      if (rowCount > 1) {
        const nonAdminRow = userRows.nth(1)
        const deleteButton = nonAdminRow.locator('button[onclick*="deleteUser"]').first()

        if (await deleteButton.isVisible()) {
          await deleteButton.click()

          // Check delete modal opens
          await expect(page.locator('#delete-modal')).toBeVisible()
          await expect(page.locator('#delete-modal')).toContainText('¿Estás seguro')

          // Should show user information
          await expect(page.locator('#delete-modal')).toContainText('Importante')
        }
      }
    })

    test('should not show delete button for admin user', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Check admin user row (usually first)
      const firstRow = page.locator('#users-table-body tr').first()
      const text = await firstRow.textContent()

      if (text && text.includes('Administrador')) {
        // Admin user should not have delete button
        const deleteButton = firstRow.locator('button[onclick*="deleteUser"]')
        await expect(deleteButton).not.toBeVisible()
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Check main elements are still visible
      await expect(page.locator('#users-view')).toBeVisible()
      await expect(page.locator('#user-search-input')).toBeVisible()

      // Check table adapts to mobile
      await expect(page.locator('#users-table-body')).toBeVisible()

      // Check filters stack vertically on mobile
      const filterContainer = page.locator('.flex-col.lg\\:flex-row, .filters-container')
      await expect(filterContainer).toBeVisible()

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })
      expect(hasHorizontalScroll).toBe(false)

      console.log('✅ Mobile layout renders correctly')
    })

    test('should show mobile navigation', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Check hamburger menu is visible
      const hamburgerMenu = page.locator('#admin-sidebar-toggle, .mobile-menu-toggle')
      await expect(hamburgerMenu).toBeVisible()

      // Test hamburger menu functionality
      await hamburgerMenu.click()
      await page.waitForTimeout(300)

      // Sidebar should toggle
      const sidebar = page.locator('#admin-sidebar')
      if (await sidebar.isVisible()) {
        // Toggle again
        await hamburgerMenu.click()
        await page.waitForTimeout(300)
        console.log('✅ Mobile navigation works correctly')
      }
    })

    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Test scrolling
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForTimeout(300)

      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(300)

      // Verify page is still functional
      await expect(page.locator('#users-view')).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should show empty state when no users found', async ({ page }) => {
      // Search for non-existent user
      await page.fill('#user-search-input', 'nonexistentuser12345')
      await page.waitForTimeout(500)

      // Check empty state is shown
      const emptyState = page.locator('#users-empty')
      if (await emptyState.isVisible()) {
        await expect(emptyState).toContainText('No se encontraron usuarios')
      }
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/users**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Server Error' })
        })
      })

      // Reload page
      await page.reload()
      await page.click('[data-view="users"]')

      // Check error handling
      await page.waitForTimeout(2000)

      // Should show error state or message
      const errorState = page.locator('#users-error')
      if (await errorState.isVisible()) {
        await expect(errorState).toContainText('Error')
      }
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Check main landmarks
      await expect(page.locator('main, [role="main"]')).toBeVisible()

      // Check form labels
      await expect(page.locator('label[for="user-search-input"]')).toBeVisible()
      await expect(page.locator('label[for="user-role-filter"]')).toBeVisible()

      // Check button accessibility
      const createButton = page.locator('#create-user-btn')
      await expect(createButton).toHaveAttribute('aria-label')
    })

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through interactive elements
      await page.keyboard.press('Tab')

      // First element should be focusable (hamburger menu on mobile or search)
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()

      // Continue tabbing to verify keyboard navigation works
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
    })
  })
})
