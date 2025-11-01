/**
 * Mobile and Responsive Design Tests
 * Comprehensive testing for mobile devices and responsive behavior
 */

import { test, expect } from '@playwright/test'

// Test data for different viewport sizes
const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'Mobile' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  desktop: { width: 1280, height: 720, name: 'Desktop' },
  largeDesktop: { width: 1920, height: 1080, name: 'Large Desktop' }
}

test.describe('Mobile and Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock authentication for admin pages
    await page.goto('/admin/dashboard.html')
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'admin-token')
      window.authMock = true
    })
  })

  test.describe('Viewport Responsiveness', () => {
    Object.entries(VIEWPORTS).forEach(([_key, viewport]) => {
      test(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })

        await page.goto('/admin/dashboard.html')
        await page.waitForLoadState('domcontentloaded')

        // Check main container is visible
        await expect(page.locator('.admin-container, #admin-dashboard')).toBeVisible()

        // Check navigation adapts
        if (viewport.width <= 768) {
          // Mobile: hamburger menu should be visible
          const hamburgerMenu = page.locator(
            '#sidebar-toggle, .mobile-menu-toggle, .hamburger-menu'
          )
          await expect(hamburgerMenu).toBeVisible({ timeout: 5000 })
        } else {
          // Desktop: sidebar should be visible
          const sidebar = page.locator('#admin-sidebar, .admin-sidebar')
          await expect(sidebar).toBeVisible({ timeout: 5000 })
        }

        // Check content adapts to viewport
        const mainContent = page.locator('.admin-main, main')
        await expect(mainContent).toBeVisible()

        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth
        })
        expect(hasHorizontalScroll).toBe(false)
      })
    })
  })

  test.describe('Mobile Navigation', () => {
    test('should toggle mobile navigation menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Find and click mobile menu toggle
      const menuToggle = page.locator('#sidebar-toggle, .mobile-menu-toggle, .hamburger-menu')
      await expect(menuToggle).toBeVisible()

      // Check sidebar is hidden initially
      const sidebar = page.locator('#admin-sidebar, .admin-sidebar')
      const isSidebarVisibleInitially = await sidebar.isVisible()

      if (isSidebarVisibleInitially) {
        // Click to hide
        await menuToggle.click()
        await page.waitForTimeout(300)
        await expect(sidebar).not.toBeVisible()

        // Click to show again
        await menuToggle.click()
        await page.waitForTimeout(300)
        await expect(sidebar).toBeVisible()
      }
    })

    test('should allow navigation through mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Open mobile menu
      const menuToggle = page.locator('#sidebar-toggle, .mobile-menu-toggle')
      await menuToggle.click()
      await page.waitForTimeout(300)

      // Click on a menu item
      const menuItem = page.locator('.sidebar-menu a, .mobile-menu a').first()
      if (await menuItem.isVisible()) {
        await menuItem.click()
        await page.waitForTimeout(500)

        // Verify navigation occurred
        const currentUrl = page.url()
        expect(currentUrl).not.toContain('/admin/dashboard.html')
      }
    })
  })

  test.describe('Touch Interactions', () => {
    test('should support touch scrolling', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Scroll down
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })

      await page.waitForTimeout(500)

      // Scroll back up
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })

      await page.waitForTimeout(500)

      // Verify we can still interact with the page
      const header = page.locator('h1, .page-title')
      await expect(header).toBeVisible()
    })

    test('should handle touch gestures on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Test swipe gesture (if carousel exists)
      const carousel = page.locator('.carousel, .image-carousel, .slider')
      if (await carousel.isVisible()) {
        // Swipe left
        const box = await carousel.boundingBox()
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
          await page.mouse.down()
          await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2)
          await page.mouse.up()

          await page.waitForTimeout(300)
        }
      }
    })
  })

  test.describe('Responsive Tables', () => {
    test('should adapt table to mobile view', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Go to users management page
      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Navigate to users view if needed
      const usersViewLink = page.locator('[data-view="users"]')
      if (await usersViewLink.isVisible()) {
        await usersViewLink.click()
        await page.waitForTimeout(500)
      }

      // Check table is visible
      const table = page.locator('table, .data-table')
      await expect(table).toBeVisible({ timeout: 10000 })

      // On mobile, table should either:
      // 1. Be horizontally scrollable, OR
      // 2. Be converted to cards/list view
      const tableWrapper = page.locator('.table-wrapper, .table-responsive, table').first()
      const wrapperBox = await tableWrapper.boundingBox()

      if (wrapperBox) {
        // Check table doesn't overflow viewport too much
        const overflows = await page.evaluate(
          wrapper => {
            const rect = wrapper.getBoundingClientRect()
            return rect.width > window.innerWidth + 50 // Allow some margin
          },
          await tableWrapper.elementHandle()
        )

        // If table overflows, it should be scrollable
        if (overflows) {
          const hasHorizontalScroll = await page.evaluate(() => {
            const wrapper = document.querySelector('.table-wrapper, .table-responsive, table')
            return wrapper.scrollWidth > wrapper.clientWidth
          })
          expect(hasHorizontalScroll).toBe(true)
        }
      }
    })
  })

  test.describe('Form Responsiveness', () => {
    test('should adapt forms to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Navigate to users to find form
      const usersViewLink = page.locator('[data-view="users"]')
      if (await usersViewLink.isVisible()) {
        await usersViewLink.click()
        await page.waitForTimeout(500)
      }

      // Look for create/edit form
      const createButton = page.locator('#create-user-btn, .btn-create, .add-button')
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForTimeout(500)

        // Check form fields are accessible
        const form = page.locator('form, .modal-content')
        if (await form.isVisible()) {
          const inputs = form.locator('input, select, textarea')
          const inputCount = await inputs.count()
          expect(inputCount).toBeGreaterThan(0)

          // Check form is not wider than viewport
          const formBox = await form.boundingBox()
          if (formBox) {
            expect(formBox.width).toBeLessThanOrEqual(375)
          }
        }
      }
    })

    test('should have touch-friendly form controls', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      const input = page.locator('input[type="text"], input[type="search"]').first()
      if (await input.isVisible()) {
        await input.click()

        // Check input is focused
        const isFocused = await input.evaluate(el => document.activeElement === el)
        expect(isFocused).toBe(true)

        // Input should have reasonable size for touch
        const box = await input.boundingBox()
        if (box) {
          // Minimum touch target size is typically 44px
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Performance on Mobile', () => {
    test('should load page efficiently on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const startTime = Date.now()
      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime

      // Page should load within reasonable time on mobile (adjust as needed)
      expect(loadTime).toBeLessThan(5000) // 5 seconds

      // Verify critical elements are visible
      await expect(page.locator('.admin-container, #admin-dashboard')).toBeVisible()
    })

    test('should handle mobile scroll performance', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Perform multiple scrolls to test performance
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 200)
        })
        await page.waitForTimeout(100)
      }

      // Page should still be responsive
      const title = page.locator('h1, .page-title')
      await expect(title).toBeVisible()
    })
  })

  test.describe('Media Queries and CSS', () => {
    test('should apply mobile-specific styles', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Check that mobile styles are applied
      // On small screens, check that layout uses mobile-friendly classes
      const layout = page.locator('.admin-layout, .dashboard-layout')
      if (await layout.isVisible()) {
        const layoutClasses = await layout.getAttribute('class')
        // Should have responsive classes
        expect(layoutClasses).toMatch(/md:|lg:|xl:|responsive|mobile/)
      }
    })

    test('should not have horizontal overflow on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/admin/dashboard.html')
      await page.waitForLoadState('domcontentloaded')

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth
        const viewportWidth = window.innerWidth
        return docWidth > viewportWidth + 20 // Allow small margin
      })

      expect(hasOverflow).toBe(false)
    })
  })

  test.describe('Cross-Device Compatibility', () => {
    test('should work consistently across different mobile viewports', async ({ page }) => {
      const mobileViewports = [VIEWPORTS.mobile, VIEWPORTS.tablet]

      for (const viewport of mobileViewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })

        await page.goto('/admin/dashboard.html')
        await page.waitForLoadState('domcontentloaded')

        // Check navigation works
        const isMobile = viewport.width <= 768
        if (isMobile) {
          await expect(page.locator('#sidebar-toggle, .mobile-menu-toggle')).toBeVisible()
        } else {
          await expect(page.locator('#admin-sidebar, .admin-sidebar')).toBeVisible()
        }

        // Check content is accessible
        await expect(page.locator('.admin-main, main')).toBeVisible()
      }
    })
  })
})
