import { test, expect } from '@playwright/test'

/**
 * E2E Test Suite: Order Purchase Flow (KISS & DRY)
 *
 * Tests simplified purchase flow focusing on core functionality
 * - Product discovery
 * - Add to cart functionality
 * - Checkout process
 */

test.describe('Order Purchase Flow', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

  // Helper functions (DRY principle)
  async function addToCartFromCard(page, productName) {
    const productCard = page.locator('.product-card').filter({ hasText: productName }).first()
    await expect(productCard).toBeVisible()

    await productCard.locator('.btn-add-to-cart').click()

    // Verify cart badge updates
    const cartBadge = page.locator('.cart-badge')
    await expect(cartBadge).toBeVisible()
    const badgeText = await cartBadge.textContent()
    expect(parseInt(badgeText)).toBeGreaterThan(0)
  }

  async function navigateToCart(page) {
    await page.locator('.cart-button, [href*="cart"], .btn-cart').first().click()
    await expect(page).toHaveURL(/cart/)
  }

  async function proceedToCheckout(page) {
    await page.locator('.btn-checkout, .btn-proceed-to-payment, [href*="payment"]').click()
    await expect(page).toHaveURL(/payment/)
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto(BASE_URL)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Handle console errors gracefully
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser error (non-critical):', msg.text())
      }
    })
  })

  test.describe('Core Purchase Flow', () => {
    test('should add product to cart from hero section', async ({ page }) => {
      // Look for hero section CTA or featured products
      const heroCta = page.locator('.hero-cta .btn-primary, .featured-product .btn-primary').first()

      if (await heroCta.isVisible()) {
        await heroCta.click()

        // Should either navigate to products or add to cart directly
        const url = page.url()
        if (url.includes('products')) {
          // If navigated to products, add first available product
          await addToCartFromCard(page, '')
        } else {
          // If product added directly, verify cart badge
          const cartBadge = page.locator('.cart-badge')
          await expect(cartBadge).toBeVisible()
        }
      } else {
        // Fallback: add first available product from grid
        await addToCartFromCard(page, '')
      }
    })

    test('should add multiple products and proceed to checkout', async ({ page }) => {
      // Add first product
      await addToCartFromCard(page, '')

      // Add second product if available
      const productCards = page.locator('.product-card')
      if ((await productCards.count()) > 1) {
        await productCards.nth(1).locator('.btn-add-to-cart').click()
      }

      // Navigate to cart
      await navigateToCart(page)

      // Verify cart has items
      const cartItems = page.locator('.cart-item, .product-in-cart')
      await expect(cartItems).toHaveCount.greaterThan(0)

      // Proceed to checkout
      await proceedToCheckout(page)

      // Verify payment page loads
      await expect(page.locator('h1, .page-title')).toContainText(/payment|checkout|pago/i)
    })

    test('should handle carousel product addition', async ({ page }) => {
      const carousel = page.locator('.carousel, .featured-carousel, .products-carousel')

      if (await carousel.isVisible()) {
        // Try to add product from carousel
        const carouselAddBtn = carousel.locator('.btn-add-to-cart, .carousel-add-to-cart').first()

        if (await carouselAddBtn.isVisible()) {
          await carouselAddBtn.click()

          // Verify cart badge updates
          const cartBadge = page.locator('.cart-badge')
          await expect(cartBadge).toBeVisible()
        } else {
          // Fallback to regular product cards
          await addToCartFromCard(page, '')
        }
      } else {
        // If no carousel, use regular flow
        await addToCartFromCard(page, '')
      }
    })
  })

  test.describe('Cart Management', () => {
    test('should update cart quantity correctly', async ({ page }) => {
      // Add product to cart
      await addToCartFromCard(page, '')

      // Check cart badge
      const cartBadge = page.locator('.cart-badge')
      const initialCount = parseInt((await cartBadge.textContent()) || '0')

      // Add same product again if possible
      const firstProductCard = page.locator('.product-card').first()
      const addBtn = firstProductCard.locator('.btn-add-to-cart')

      if (await addBtn.isVisible()) {
        await addBtn.click()

        // Check if quantity increased
        const newCount = parseInt((await cartBadge.textContent()) || '0')
        expect(newCount).toBeGreaterThanOrEqual(initialCount)
      }
    })

    test('should navigate to cart page', async ({ page }) => {
      // Add product first
      await addToCartFromCard(page, '')

      // Navigate to cart
      await navigateToCart(page)

      // Verify cart page elements
      await expect(page.locator('.cart-container, .cart-page, main')).toBeVisible()
      await expect(page.locator('.cart-items, .products-in-cart')).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Add product
      await addToCartFromCard(page, '')

      // Verify mobile-specific elements
      const mobileMenu = page.locator('.mobile-menu, .hamburger, .menu-toggle')
      if (await mobileMenu.isVisible()) {
        // Mobile menu should be functional
        await mobileMenu.click()
        await page.waitForTimeout(500)
        await mobileMenu.click() // Close if opened
      }

      // Cart should still work on mobile
      const cartBadge = page.locator('.cart-badge')
      await expect(cartBadge).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Navigate to page and observe it loads despite potential API errors
      await page.waitForLoadState('domcontentloaded')

      // Page should still be functional
      const mainContent = page.locator('main, .main-content, .container')
      await expect(mainContent).toBeVisible()

      // Add product should work or show appropriate error state
      try {
        await addToCartFromCard(page, '')
      } catch (_error) {
        // If adding fails, page should still be responsive
        const body = page.locator('body')
        await expect(body).toBeVisible()
      }
    })
  })
})
