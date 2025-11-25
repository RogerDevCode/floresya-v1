/**
 * Navigation System UI - E2E Tests with Playwright
 * Migrated from Cypress
 * 
 * Purpose: Verify Navigation System UI components functionality
 * Risk Level: HIGH - Critical for user navigation and accessibility
 * Expected Outcome: 100% Success Rate
 */

import { test, expect } from '@playwright/test'

test.describe('🧭 Navigation System UI', () => {
  test.beforeEach(async ({ context }) => {
    // Clear cookies and storage before each test
    await context.clearCookies()
    await context.clearPermissions()
  })

  test('✅ should render desktop navigation correctly', async ({ page }) => {
    await page.goto('/')

    // Verify main navigation bar exists
    const navbar = page.locator('nav.navbar')
    await expect(navbar).toBeVisible()
    await expect(navbar).toHaveAttribute('role', 'navigation')
    await expect(navbar).toHaveAttribute('aria-label', 'Navegación principal')

    // Verify navbar container
    await expect(page.locator('.navbar .container')).toBeVisible()

    // Verify navbar content layout
    await expect(page.locator('.navbar-content')).toBeVisible()

    // Verify logo/brand
    const navbarBrand = page.locator('.navbar-brand')
    await expect(navbarBrand).toBeVisible()
    await expect(navbarBrand).toHaveAttribute('aria-label')
    await expect(page.locator('.brand-logo')).toBeVisible()
    await expect(page.locator('.brand-text')).toContainText('FloresYa')

    // Verify desktop navigation links
    await expect(page.locator('.desktop-nav')).toBeVisible()
    const navLinks = page.locator('.nav-links')
    await expect(navLinks).toBeVisible()
    await expect(navLinks).toHaveAttribute('role', 'menubar')

    // Verify navigation links exist and have href
    const navLinkElements = page.locator('.nav-link')
    const count = await navLinkElements.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      await expect(navLinkElements.nth(i)).toHaveAttribute('href')
    }

    // Verify specific navigation items
    await expect(page.locator('.nav-link', { hasText: 'Inicio' })).toBeVisible()
    await expect(page.locator('.nav-link', { hasText: 'Productos' })).toBeVisible()
    await expect(page.locator('.nav-link', { hasText: 'Contacto' })).toBeVisible()
    await expect(page.locator('.nav-link', { hasText: 'Admin' })).toBeVisible()
  })

  test('✅ should render mobile navigation correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForSelector('html.loaded', { timeout: 20000 })

    // Verify mobile menu toggle button exists
    const mobileMenuBtn = page.locator('#mobile-menu-btn')
    await expect(mobileMenuBtn).toHaveAttribute('aria-label')

    // Initial state: button should not be expanded
    await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false')

    // Verify mobile menu button is visible
    await expect(mobileMenuBtn).toBeAttached()

    // Verify mobile menu container exists
    await expect(page.locator('#mobile-menu')).toBeAttached()

    // Test mobile menu toggle functionality
    await page.waitForTimeout(500) // Wait for CSS to apply
    
    // Click to open menu
    await mobileMenuBtn.click()

    // Wait for drawer to be created and animation to start
    const mobileNavDrawer = page.locator('#mobile-nav-drawer')
    await expect(mobileNavDrawer).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500) // Wait for animation

    // Verify drawer is open
    await expect(mobileNavDrawer).toHaveClass(/mobile-nav-drawer-open/)
    await expect(mobileNavDrawer).toHaveAttribute('aria-hidden', 'false')

    // Verify overlay is open
    const overlay = page.locator('#mobile-nav-overlay')
    await expect(overlay).toBeVisible()
    await expect(overlay).toHaveClass(/mobile-nav-overlay-open/)

    // Verify button state
    await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true')

    // Test closing menu
    await mobileMenuBtn.click()
    await page.waitForTimeout(500)

    // Verify drawer is closed
    await expect(mobileNavDrawer).toHaveAttribute('aria-hidden', 'true')
    await expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false')
  })

  test('✅ should integrate with theme system', async ({ page }) => {
    await page.goto('/')

    // Verify light theme (default)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    // Navbar should have proper theme classes
    const navbar = page.locator('nav.navbar')
    await expect(navbar).toHaveClass(/bg-base-100/)
  })

  test('✅ should display cart icon and login button', async ({ page }) => {
    await page.goto('/')

    // Cart icon should exist
    const cartBtn = page.locator('#cart-btn')
    await expect(cartBtn).toBeVisible()
    await expect(cartBtn).toHaveAttribute('aria-label')

    // Login button should exist
    const loginBtn = page.locator('a[href="login.html"]')
    await expect(loginBtn).toBeVisible()
  })

  test('✅ should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/')

    // Main navigation should have role
    await expect(page.locator('nav.navbar')).toHaveAttribute('role', 'navigation')

    // Navigation links should have role menubar
    await expect(page.locator('.nav-links')).toHaveAttribute('role', 'menubar')

    // Brand should have aria-label
    await expect(page.locator('.navbar-brand')).toHaveAttribute('aria-label')

    // Mobile menu button should have aria-expanded
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    const mobileBtn = page.locator('#mobile-menu-btn')
    await expect(mobileBtn).toHaveAttribute('aria-expanded')
    await expect(mobileBtn).toHaveAttribute('aria-label')
  })
})
