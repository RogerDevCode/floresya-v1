import { test, expect } from '@playwright/test'

/**
 * @vitest-environment node
 */

test.describe('FloresYa Homepage Tests', () => {
  test('should load the homepage with correct title', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Check if the page has the correct title
    await expect(page).toHaveTitle(/FloresYa - Tu Floristería en Línea/)
  })

  test('should display the main navigation elements', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation elements
    await expect(page.locator('nav.navbar')).toBeVisible()
    await expect(page.locator('a.nav-link:has-text("Inicio")')).toBeVisible()
    await expect(page.locator('a.nav-link:has-text("Productos")')).toBeVisible()
    await expect(page.locator('a.nav-link:has-text("Contacto")')).toBeVisible()
  })

  test('should display the hero section with correct content', async ({ page }) => {
    await page.goto('/')

    // Check for the hero section
    await expect(page.locator('section.hero-section')).toBeVisible()
    await expect(page.locator('h1.hero-title')).toContainText('Flores frescas para cada ocasión')
  })

  test('should display product listings section', async ({ page }) => {
    await page.goto('/')

    // Check for product listings section
    await expect(page.locator('section#productos')).toBeVisible()
    await expect(page.locator('h2:has-text("Productos Destacados")')).toBeVisible()
  })
})
