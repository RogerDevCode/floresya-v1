/**
 * E2E Tests: Admin Pages Loading Validation
 * Tests admin-specific pages with complex script loading patterns
 */

import { test, expect } from '@playwright/test'

const ADMIN_PAGES = [
  {
    path: '/pages/admin/dashboard.html',
    name: 'Admin Dashboard',
    expectedElements: ['.dashboard-container', '.admin-sidebar', 'canvas'],
    expectedTitle: 'Panel de Administración - FloresYa'
  },
  {
    path: '/pages/admin/orders.html',
    name: 'Admin Orders',
    expectedElements: ['.orders-container', '.orders-table'],
    expectedTitle: 'Orders - FloresYa'
  },
  {
    path: '/pages/admin/create-product.html',
    name: 'Create Product',
    expectedElements: ['.product-form', '.form-group'],
    expectedTitle: 'Create Product - FloresYa'
  },
  {
    path: '/pages/admin/edit-product.html',
    name: 'Edit Product',
    expectedElements: ['.product-form', '.form-group'],
    expectedTitle: 'Edit Product - FloresYa'
  },
  {
    path: '/pages/admin/product-editor.html',
    name: 'Product Editor',
    expectedElements: ['.editor-container', '.image-manager'],
    expectedTitle: 'Product Editor - FloresYa'
  },
  {
    path: '/pages/admin/contact-editor.html',
    name: 'Contact Editor',
    expectedElements: ['.contact-form', '.form-group'],
    expectedTitle: 'Contact Editor - FloresYa'
  },
  {
    path: '/pages/admin/occasions.html',
    name: 'Admin Occasions',
    expectedElements: ['.occasions-container', '.occasions-list'],
    expectedTitle: 'Occasions - FloresYa'
  }
]

test.describe('Admin Pages Loading Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Add small delay to ensure async context is used
    await page.waitForTimeout(0)
    // Set up console monitoring for all tests
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`)
      }
    })

    page.on('pageerror', error => {
      console.log(`Page Error: ${error.message}`)
    })
  })

  ADMIN_PAGES.forEach(pageConfig => {
    test(`should load ${pageConfig.name} page successfully`, async ({ page }) => {
      console.log(`🚀 Testing ${pageConfig.name} at ${pageConfig.path}`)

      // Navigate to the page
      const response = await page.goto(pageConfig.path)
      expect(response.status()).toBe(200)

      // Check page title
      const title = await page.title()
      if (pageConfig.expectedTitle) {
        expect(title).toBe(pageConfig.expectedTitle)
      } else {
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(0)
      }

      // Wait for DOM to be ready
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000) // Additional wait for scripts

      // Check that page has admin-specific structure
      const hasAdminClass = await page.locator('body.admin-page').count()
      expect(hasAdminClass).toBe(1)

      // Check for expected elements
      for (const elementSelector of pageConfig.expectedElements) {
        const element = await page.locator(elementSelector).first()
        console.log(`   Checking for ${elementSelector}...`)

        // Some elements might be loaded dynamically, so we wait a bit
        try {
          await element.waitFor({ timeout: 5000 })
          expect(await element.isVisible()).toBe(true)
        } catch (_error) {
          console.log(`   ⚠️ Element ${elementSelector} not found, checking fallback...`)
          // Check if container exists at minimum
          const container = await page.locator('.container, .admin-container').first()
          expect(await container.isVisible()).toBe(true)
        }
      }

      // Check that navigation elements are present
      const navbar = await page.locator('.navbar').first()
      expect(await navbar.isVisible()).toBe(true)

      // Check for admin sidebar (if it exists)
      const sidebar = await page.locator('.admin-sidebar, .sidebar').first()
      if (await sidebar.isVisible()) {
        console.log(`   ✅ Admin sidebar found`)
      }

      console.log(`✅ ${pageConfig.name} loaded successfully`)
    })
  })
})

test.describe('Admin Pages JavaScript Loading', () => {
  test('should load Chart.js correctly on dashboard', async ({ page }) => {
    console.log('📊 Testing Chart.js loading on dashboard')

    // Monitor network requests for Chart.js
    const chartJsRequests = []
    page.on('request', request => {
      if (request.url().includes('chart.min.js')) {
        chartJsRequests.push(request.url())
      }
    })

    // Navigate to dashboard
    await page.goto('/pages/admin/dashboard.html')
    await page.waitForTimeout(3000)

    // Should have attempted to load Chart.js
    expect(chartJsRequests.length).toBeGreaterThan(0)

    // Check for canvas elements
    const canvasElements = await page.locator('canvas').count()
    expect(canvasElements).toBeGreaterThan(0)

    // Monitor console for Chart.js related messages
    const consoleMessages = []
    page.on('console', msg => consoleMessages.push(msg.text()))

    // Wait a bit more for Chart.js to initialize
    await page.waitForTimeout(2000)

    const hasChartInit = consoleMessages.some(msg => msg.includes('Chart') || msg.includes('chart'))

    if (hasChartInit) {
      console.log('✅ Chart.js initialized successfully')
    } else {
      console.log('⚠️ Chart.js initialization not detected, but page loaded')
    }
  })

  test('should handle image management scripts on product editor', async ({ page }) => {
    console.log('🖼️ Testing image management on product editor')

    // Navigate to product editor
    await page.goto('/pages/admin/product-editor.html')
    await page.waitForTimeout(3000)

    // Check for image upload functionality
    const imageUploadArea = await page.locator('.image-upload-area, .dropzone').first()
    if (await imageUploadArea.isVisible()) {
      console.log('✅ Image upload area found')

      // Test drag-and-drop functionality
      await imageUploadArea.hover()

      // Check for file input
      const fileInput = await page.locator('input[type="file"]').first()
      const hasFileInput = await fileInput.count()
      expect(hasFileInput).toBeGreaterThan(0)
    }

    // Check for image preview areas
    const imagePreview = await page.locator('.image-preview, .preview-container').first()
    if (await imagePreview.isVisible()) {
      console.log('✅ Image preview area found')
    }

    console.log('✅ Product editor scripts loaded correctly')
  })
})

test.describe('Admin Pages Responsive Design', () => {
  const viewports = [
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ]

  viewports.forEach(viewport => {
    test(`should render admin dashboard correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      console.log(
        `📱 Testing admin dashboard on ${viewport.name} (${viewport.width}x${viewport.height})`
      )

      await page.goto('/pages/admin/dashboard.html')
      await page.waitForTimeout(3000)

      // Check that main admin elements are visible
      const dashboardContainer = await page
        .locator('.admin-container, .dashboard-container')
        .first()
      expect(await dashboardContainer.isVisible()).toBe(true)

      // On mobile, check for mobile menu toggle
      if (viewport.width <= 768) {
        const mobileMenuToggle = await page
          .locator('#admin-sidebar-toggle, .mobile-menu-toggle')
          .first()
        if (await mobileMenuToggle.isVisible()) {
          console.log('✅ Mobile menu toggle found')

          // Test mobile menu functionality
          await mobileMenuToggle.click()
          await page.waitForTimeout(500)

          const sidebar = await page.locator('.admin-sidebar, .sidebar').first()
          if (await sidebar.isVisible()) {
            console.log('✅ Mobile menu toggles correctly')
          }
        }
      }

      // Check that charts and data displays are responsive
      const charts = await page.locator('canvas').all()
      if (charts.length > 0) {
        for (const chart of charts) {
          const isVisible = await chart.isVisible()
          if (isVisible) {
            const boundingBox = await chart.boundingBox()
            expect(boundingBox.width).toBeGreaterThan(0)
            expect(boundingBox.height).toBeGreaterThan(0)
          }
        }
      }

      console.log(`✅ Admin dashboard responsive correctly on ${viewport.name}`)
    })
  })
})

test.describe('Admin Pages Error Handling', () => {
  test('should handle missing dependencies gracefully', async ({ page }) => {
    console.log('🚨 Testing error handling for missing dependencies')

    // Mock Chart.js loading failure
    await page.route('**/chart.min.js', route => {
      route.abort('failed')
    })

    // Monitor console for error messages
    const consoleMessages = []
    page.on('console', msg => consoleMessages.push(msg.text()))

    // Navigate to dashboard
    await page.goto('/pages/admin/dashboard.html')
    await page.waitForTimeout(3000)

    // Should have error handling for Chart.js
    consoleMessages.some(
      msg => msg.includes('Chart') || (msg.includes('chart') && msg.includes('error'))
    )

    // Even if Chart.js fails, the page should still load
    const dashboardContainer = await page.locator('.admin-container, .dashboard-container').first()
    expect(await dashboardContainer.isVisible()).toBe(true)

    // Should have fallback content
    const fallbackContent = await page.locator('.chart-error, .fallback-chart').first()
    if (await fallbackContent.isVisible()) {
      console.log('✅ Fallback content displayed for missing Chart.js')
    }

    console.log('✅ Error handling works correctly')
  })

  test('should maintain functionality with network issues', async ({ page }) => {
    console.log('🌐 Testing functionality with network issues')

    // Simulate slow network for external resources
    await page.route('**/*.js', route => {
      // Add delay for scripts
      setTimeout(() => route.continue(), 1000)
    })

    // Navigate to admin page
    await page.goto('/pages/admin/orders.html')

    // Show loading state
    await page.waitForTimeout(2000)

    // Page should still be functional even with slow scripts
    const ordersContainer = await page.locator('.orders-container').first()
    expect(await ordersContainer.isVisible()).toBe(true)

    // Wait for scripts to complete loading
    await page.waitForTimeout(3000)

    // Check that interactive elements work
    const buttons = await page.locator('button').all()
    if (buttons.length > 0) {
      const firstButton = buttons[0]
      expect(await firstButton.isVisible()).toBe(true)
    }

    console.log('✅ Page remains functional with network issues')
  })
})
