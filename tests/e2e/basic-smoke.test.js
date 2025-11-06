/**
 * Basic E2E Smoke Test
 * Tests that the application starts and responds
 */

import { test, expect } from '@playwright/test'

test.describe('Basic Smoke Tests', () => {
  test('should load homepage', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/FloresYa/i)
  })

  test('should have basic structure', async ({ page }) => {
    await page.goto('/')

    // Check for common elements (flexible - accepts header or nav, main or body)
    const hasHeaderOrNav = await page.locator('header, nav, .navbar').count()
    const hasMainOrBody = await page.locator('main, body').count()
    const hasFooter = await page.locator('footer').count()

    expect(hasHeaderOrNav).toBeGreaterThan(0) // La página usa nav.navbar
    expect(hasMainOrBody).toBeGreaterThan(0)
    expect(hasFooter).toBeGreaterThan(0)
  })
})
