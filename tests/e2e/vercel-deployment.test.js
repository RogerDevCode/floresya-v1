import { test, expect } from '@playwright/test'

test.describe('FloresYa Vercel Deployment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Using baseURL from config, but could be overridden if necessary
    await page.goto('/')
  })

  test('should load the homepage with correct title from Vercel deployment', async ({ page }) => {
    // Check if the page has the correct title
    await expect(page).toHaveTitle(/FloresYa - Tu Floristería en Línea/)

    // Additional verification that we're on the Vercel deployment
    expect(page.url()).toContain('floresya-v1.vercel.app')
  })

  test('should display the main navigation elements on Vercel deployment', async ({ page }) => {
    // Check for main navigation elements
    await expect(page.locator('nav.navbar')).toBeVisible()
    await expect(page.locator('a:has-text("Inicio")')).toBeVisible()
    await expect(page.locator('a:has-text("Productos")')).toBeVisible()
    await expect(page.locator('a:has-text("Contacto")')).toBeVisible()
  })

  test('should display the hero section with correct content on Vercel deployment', async ({
    page
  }) => {
    // Check for the hero section
    await expect(page.locator('section.hero-section')).toBeVisible()
    await expect(page.locator('h1.hero-title')).toContainText('Flores frescas para cada ocasión')
  })

  test('should display product listings section on Vercel deployment', async ({ page }) => {
    // Check for product listings section
    await expect(page.locator('section#productos')).toBeVisible()
    await expect(page.locator('h2:has-text("Productos Destacados")')).toBeVisible()
  })

  test('should load all critical resources on Vercel deployment', async ({ page }) => {
    const requests = []
    page.on('request', request => requests.push(request))

    await page.goto('/')

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')

    // Verify no failed requests
    const failedRequests = requests.filter(req => {
      const response = req.response()
      return response && response.status() >= 400
    })

    expect(failedRequests.length).toBe(0)
  })

  test('should display the theme selector on Vercel deployment', async ({ page }) => {
    // Check that theme selector is present and functional
    await expect(page.locator('#theme-selector-container')).toBeVisible()

    // Verify theme functionality by checking for the toggle button
    const themeToggle = page.locator('button[aria-label="Cambiar tema"]')
    if ((await themeToggle.count()) > 0) {
      await expect(themeToggle).toBeVisible()
    }
  })

  test('should load all product images without errors on Vercel deployment', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Get all product images
    const productImages = page.locator('.product-card img')
    const count = await productImages.count()

    // Verify that all product images loaded successfully
    for (let i = 0; i < count; i++) {
      const img = productImages.nth(i)
      await expect(img).toBeVisible()

      // Check that image has proper src attribute
      const src = await img.getAttribute('src')
      expect(src).not.toBeNull()
      expect(src).not.toBe('')
    }
  })

  test('should have working contact form on Vercel deployment', async ({ page }) => {
    // Go to the contact page
    await page.locator('a:has-text("Contacto")').click()
    await page.waitForURL('**/pages/contacto.html')

    // Verify contact form is present
    await expect(page.locator('form#contact-form')).toBeVisible()

    // Check form fields
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#message')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
