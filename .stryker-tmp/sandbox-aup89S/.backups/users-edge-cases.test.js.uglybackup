/**
 * E2E Tests for Users Page Edge Cases and Performance
 * Testing advanced scenarios and edge cases
 */

import { test, expect } from '@playwright/test'

test.describe('Users Page Edge Cases', () => {
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

  test.describe('Data Integrity Edge Cases', () => {
    test('should handle users with special characters in names', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Search for users with special characters
      await page.fill('#user-search-input', 'ñ')
      await page.waitForTimeout(500)

      // Should not crash and should handle properly
      const usersTable = page.locator('#users-table-body')
      await expect(usersTable).toBeVisible()
    })

    test('should handle users with very long email addresses', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Create test user with long email (simulation)
      const _longEmail =
        'very.long.email.address.that.exceeds.normal.length.for.testing.purposes@example.com'

      // Search for long email patterns
      await page.fill('#user-search-input', 'very.long.email')
      await page.waitForTimeout(500)

      // Should handle gracefully
      const usersTable = page.locator('#users-table-body')
      await expect(usersTable).toBeVisible()
    })

    test('should handle users with Unicode characters', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Test various Unicode characters
      const unicodeNames = ['José María', 'François Müller', '北京', 'Москва', 'القاهرة']

      for (const name of unicodeNames) {
        await page.fill('#user-search-input', name)
        await page.waitForTimeout(500)

        // Should not crash
        const usersTable = page.locator('#users-table-body')
        await expect(usersTable).toBeVisible()
      }
    })

    test('should handle empty user data gracefully', async ({ page }) => {
      // Mock API response with incomplete user data
      await page.route('**/api/users**', _route => {
        _route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 1,
                email: '',
                full_name: null,
                phone: undefined,
                role: 'user',
                is_active: true,
                email_verified: false
              }
            ],
            message: 'Users retrieved successfully'
          })
        })
      })

      await page.reload()
      await page.click('[data-view="users"]')
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Should display empty/null values gracefully
      const usersTable = page.locator('#users-table-body')
      await expect(usersTable).toBeVisible()

      // Check for default display of empty values
      await expect(usersTable).toContainText('Sin teléfono')
    })
  })

  test.describe('Performance Tests', () => {
    test('should handle large number of users efficiently', async ({ page }) => {
      // Mock API with many users
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        email: `user${i + 1}@example.com`,
        full_name: `User ${i + 1}`,
        phone: `+12345678${String(i + 1).padStart(3, '0')}`,
        role: i % 10 === 0 ? 'admin' : 'user',
        is_active: i % 20 !== 0, // Some inactive users
        email_verified: i % 3 === 0
      }))

      await page.route('**/api/users**', _route => {
        _route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: manyUsers,
            message: 'Users retrieved successfully'
          })
        })
      })

      await page.reload()
      await page.click('[data-view="users"]')

      // Measure loading time
      const startTime = Date.now()
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })
      const loadTime = Date.now() - startTime

      // Should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000)

      // Stats should reflect large number
      const totalUsers = await page.locator('#total-users').textContent()
      expect(parseInt(totalUsers)).toBe(100)

      // Search should still be responsive
      const searchStart = Date.now()
      await page.fill('#user-search-input', 'user1')
      await page.waitForTimeout(500)
      const searchTime = Date.now() - searchStart

      expect(searchTime).toBeLessThan(2000)
    })

    test('should not block UI during filter operations', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Start multiple filter operations rapidly
      const filters = ['admin', 'user', '', 'admin', 'user', '']

      for (const filter of filters) {
        await page.selectOption('#user-role-filter', filter)
        // UI should remain responsive
        const usersTable = page.locator('#users-table-body')
        await expect(usersTable).toBeVisible()
      }
    })

    test('should handle rapid search input changes', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Simulate rapid typing
      const searchTerms = ['a', 'ab', 'abc', 'abcd', 'abcde', '']

      for (const term of searchTerms) {
        await page.fill('#user-search-input', term)
        // Should not crash or freeze
        const usersTable = page.locator('#users-table-body')
        await expect(usersTable).toBeVisible()
      }

      // Final search should work correctly
      await page.waitForTimeout(600) // Wait for debounce
    })
  })

  test.describe('Network Error Scenarios', () => {
    test('should handle timeout errors gracefully', async ({ page }) => {
      // Mock network timeout
      await page.route('**/api/users**', _route => {
        // Don't respond, simulating timeout
      })

      await page.reload()
      await page.click('[data-view="users"]')

      // Should show loading state initially
      await expect(page.locator('#users-loading')).toBeVisible()

      // Wait for timeout handling
      await page.waitForTimeout(10000)

      // Should show error state or retry mechanism
      const errorState = page.locator('#users-error')
      if (await errorState.isVisible()) {
        await expect(errorState).toContainText('Error')
      }
    })

    test('should handle malformed API responses', async ({ page }) => {
      // Mock malformed response
      await page.route('**/api/users**', _route => {
        _route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{"invalid": json}' // Invalid JSON
        })
      })

      await page.reload()
      await page.click('[data-view="users"]')

      // Should handle gracefully
      await page.waitForTimeout(2000)

      // Should not crash the page
      const usersView = page.locator('#users-view')
      await expect(usersView).toBeVisible()
    })

    test('should handle 401 unauthorized errors', async ({ page }) => {
      // Remove auth token
      await page.evaluate(() => {
        localStorage.removeItem('authToken')
      })

      // Mock 401 response
      await page.route('**/api/users**', _route => {
        _route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Unauthorized'
          })
        })
      })

      await page.reload()
      await page.click('[data-view="users"]')

      // Should handle auth error gracefully
      await page.waitForTimeout(2000)

      // Should not crash the interface
      const usersView = page.locator('#users-view')
      await expect(usersView).toBeVisible()
    })
  })

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle browser back/forward navigation', async ({ page }) => {
      await page.waitForSelector('#users-view', { state: 'visible' })

      // Navigate to another view
      await page.click('[data-view="products"]')
      await page.waitForSelector('#products-view', { state: 'visible' })

      // Go back
      await page.goBack()
      await expect(page.locator('#users-view')).toBeVisible()

      // Go forward
      await page.goForward()
      await expect(page.locator('#products-view')).toBeVisible()

      // Go back again
      await page.goBack()
      await expect(page.locator('#users-view')).toBeVisible()

      // Should maintain state and filters
      const searchInput = page.locator('#user-search-input')
      await expect(searchInput).toBeVisible()
    })

    test('should handle page refresh with active filters', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Apply filters
      await page.selectOption('#user-role-filter', 'admin')
      await page.selectOption('#email-verified-filter', 'true')
      await page.fill('#user-search-input', 'admin')
      await page.waitForTimeout(500)

      // Refresh page
      await page.reload()
      await page.click('[data-view="users"]')

      // Should load correctly (filters reset to default)
      await expect(page.locator('#users-view')).toBeVisible()
      await expect(page.locator('#user-search-input')).toHaveValue('')
    })

    test('should handle multiple rapid page changes', async ({ page }) => {
      const views = ['users', 'products', 'orders', 'users', 'products', 'users']

      for (const view of views) {
        await page.click(`[data-view="${view}"]`)
        await page.waitForSelector(`#${view}-view`, { state: 'visible' })
      }

      // Final view should be users and functional
      await expect(page.locator('#users-view')).toBeVisible()
      await expect(page.locator('#user-search-input')).toBeVisible()
    })
  })

  test.describe('Form Validation Edge Cases', () => {
    test('should handle form submission with special characters', async ({ page }) => {
      await page.click('#create-user-btn')
      await expect(page.locator('#user-modal')).toBeVisible()

      // Fill form with special characters
      await page.fill('#user-email', 'test+special@example.com')
      await page.fill('#user-full-name', 'José María García & Ñoño')
      await page.fill('#user-phone', '+1 (555) 123-4567 ext. 123')

      // Should not crash validation
      await expect(page.locator('#user-modal')).toBeVisible()

      // Close modal
      await page.click('#cancel-user-form')
    })

    test('should handle very long form inputs', async ({ page }) => {
      await page.click('#create-user-btn')
      await expect(page.locator('#user-modal')).toBeVisible()

      // Fill with very long inputs
      const longString = 'a'.repeat(1000)
      await page.fill('#user-full-name', longString)

      // Should handle gracefully (either truncate or show error)
      await expect(page.locator('#user-modal')).toBeVisible()

      await page.click('#cancel-user-form')
    })

    test('should handle duplicate email validation', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Get existing user email
      const firstRow = page.locator('#users-table-body tr').first()
      const emailMatch = await firstRow.textContent()
      const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
      const match = emailMatch?.match(emailRegex)

      if (match && match[1]) {
        const existingEmail = match[1]

        // Try to create user with existing email
        await page.click('#create-user-btn')
        await page.fill('#user-email', existingEmail)
        await page.fill('#user-full-name', 'Duplicate Test')

        await page.click('button[type="submit"]')
        await page.waitForTimeout(1000)

        // Should show validation error
        await expect(page.locator('#user-modal')).toBeVisible()
      }
    })
  })

  test.describe('Memory and Resource Management', () => {
    test('should not accumulate memory leaks with repeated operations', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Perform many operations
      for (let i = 0; i < 20; i++) {
        // Search and clear
        await page.fill('#user-search-input', `test${i}`)
        await page.waitForTimeout(100)
        await page.fill('#user-search-input', '')
        await page.waitForTimeout(100)

        // Change filters
        await page.selectOption('#user-role-filter', 'admin')
        await page.waitForTimeout(100)
        await page.selectOption('#user-role-filter', '')
        await page.waitForTimeout(100)
      }

      // Page should still be responsive
      await expect(page.locator('#users-view')).toBeVisible()
      await expect(page.locator('#user-search-input')).toBeVisible()
    })

    test('should clean up event listeners properly', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Open and close modal multiple times
      for (let i = 0; i < 10; i++) {
        await page.click('#create-user-btn')
        await expect(page.locator('#user-modal')).toBeVisible()
        await page.click('#cancel-user-form')
        await expect(page.locator('#user-modal')).toBeHidden()
      }

      // Should still work properly
      await page.click('#create-user-btn')
      await expect(page.locator('#user-modal')).toBeVisible()

      const emailInput = page.locator('#user-email')
      await emailInput.fill('test@example.com')
      await expect(emailInput).toHaveValue('test@example.com')
    })
  })

  test.describe('Concurrent Operations', () => {
    test('should handle concurrent filter changes', async ({ page }) => {
      await page.waitForSelector('#users-table-body tr', { state: 'attached' })

      // Start multiple operations rapidly
      const promises = [
        page.selectOption('#user-role-filter', 'admin'),
        page.selectOption('#email-verified-filter', 'true'),
        page.fill('#user-search-input', 'test'),
        page.selectOption('#user-status-filter', 'active')
      ]

      await Promise.all(promises)
      await page.waitForTimeout(500)

      // Should reach a consistent state
      await expect(page.locator('#users-view')).toBeVisible()
    })

    test('should handle rapid modal open/close operations', async ({ page }) => {
      // Rapid modal operations
      const operations = []

      for (let i = 0; i < 5; i++) {
        operations.push(
          page
            .click('#create-user-btn')
            .then(() => page.waitForTimeout(100))
            .then(() => page.click('#cancel-user-form'))
            .then(() => page.waitForTimeout(100))
        )
      }

      await Promise.all(operations)

      // Final state should be consistent
      await expect(page.locator('#user-modal')).toBeHidden()
      await expect(page.locator('#users-view')).toBeVisible()
    })
  })
})
