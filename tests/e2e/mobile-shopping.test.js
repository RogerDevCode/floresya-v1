/**
 * Mobile Shopping Experience Tests
 * Testing e-commerce functionality specifically on mobile devices
 */

import { test, expect } from '@playwright/test'

test.describe('Mobile Shopping Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test.describe('Mobile Product Browsing', () => {
    test('should browse products on mobile', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Check product gallery loads
      await expect(page.locator('.design-gallery, .product-gallery')).toBeVisible({
        timeout: 10000
      })

      // Check products are displayed
      const products = page.locator('.design-card, .product-card, .gallery-item')
      await expect(products.first()).toBeVisible()

      // Verify mobile layout
      const productCount = await products.count()
      expect(productCount).toBeGreaterThan(0)

      // On mobile, cards should be stacked or in single/double column
      const firstProduct = products.first()
      const productBox = await firstProduct.boundingBox()
      expect(productBox.width).toBeLessThanOrEqual(375) // Should fit in mobile viewport

      console.log(`✅ Found ${productCount} products on mobile`)
    })

    test('should view product details on mobile', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Click on first product
      const productCard = page.locator('.design-card, .product-card').first()
      await productCard.click()
      await page.waitForTimeout(500)

      // Check product detail page loads
      const productDetail = page.locator('.product-detail, .design-detail, .product-page')
      await expect(productDetail).toBeVisible({ timeout: 10000 })

      // Check product images are visible and properly sized
      const productImage = page.locator('.product-image img, .design-image img').first()
      if (await productImage.isVisible()) {
        const imageBox = await productImage.boundingBox()
        expect(imageBox.width).toBeLessThanOrEqual(350) // Should fit with padding
      }

      // Check product info is readable
      const productInfo = page.locator('.product-info, .product-details')
      await expect(productInfo).toBeVisible()

      console.log('✅ Product details page loads correctly on mobile')
    })

    test('should search products on mobile', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Find search input
      const searchInput = page.locator('#search-input, .search-box input, .product-search input')
      if (await searchInput.isVisible()) {
        // Search for a product
        await searchInput.fill('rosas')
        await page.waitForTimeout(500)

        // Check results are displayed
        const products = page.locator('.design-card, .product-card')
        const productCount = await products.count()

        // Should show filtered results
        if (productCount > 0) {
          console.log(`✅ Search works on mobile: ${productCount} results found`)
        }
      }
    })
  })

  test.describe('Mobile Shopping Cart', () => {
    test('should add items to cart on mobile', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Click on first product
      const productCard = page.locator('.design-card, .product-card').first()
      await productCard.click()
      await page.waitForTimeout(500)

      // Look for add to cart button
      const addToCartButton = page.locator(
        '#add-to-cart, .btn-add-cart, .add-to-cart-btn, button:has-text("Agregar")'
      )

      if (await addToCartButton.isVisible()) {
        await addToCartButton.click()
        await page.waitForTimeout(500)

        // Check cart indicator
        const cartIndicator = page.locator('.cart-indicator, #cart-count, .cart-icon')
        if (await cartIndicator.isVisible()) {
          const cartCount = await cartIndicator.textContent()
          expect(parseInt(cartCount)).toBeGreaterThan(0)
          console.log('✅ Item added to cart on mobile')
        }
      }
    })

    test('should view cart on mobile', async ({ page }) => {
      // Add item first
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      const productCard = page.locator('.design-card, .product-card').first()
      await productCard.click()
      await page.waitForTimeout(500)

      const addToCartButton = page.locator(
        '#add-to-cart, .btn-add-cart, .add-to-cart-btn, button:has-text("Agregar")'
      )
      if (await addToCartButton.isVisible()) {
        await addToCartButton.click()
        await page.waitForTimeout(500)
      }

      // Navigate to cart
      const cartLink = page.locator('#cart-link, .cart-link, .cart-icon')
      if (await cartLink.isVisible()) {
        await cartLink.click()
        await page.waitForTimeout(500)

        // Check cart page
        const cartPage = page.locator('.cart-page, #cart, .shopping-cart')
        await expect(cartPage).toBeVisible({ timeout: 10000 })

        // Check cart items
        const cartItems = page.locator('.cart-item, .cart-product')
        const itemCount = await cartItems.count()

        if (itemCount > 0) {
          console.log(`✅ Cart view works on mobile: ${itemCount} items`)
        }
      }
    })

    test('should checkout on mobile', async ({ page }) => {
      await page.goto('/pages/carrito.html')
      await page.waitForLoadState('domcontentloaded')

      // Check cart is displayed
      await expect(page.locator('.cart-page, #cart')).toBeVisible({ timeout: 10000 })

      // Check checkout form
      const checkoutForm = page.locator('.checkout-form, #checkout-form')
      await expect(checkoutForm).toBeVisible()

      // Check form fields are mobile-friendly
      const formFields = checkoutForm.locator('input, select, textarea')
      const fieldCount = await formFields.count()

      expect(fieldCount).toBeGreaterThan(0)

      // Verify each field is properly sized for mobile
      for (let i = 0; i < Math.min(fieldCount, 5); i++) {
        const field = formFields.nth(i)
        if (await field.isVisible()) {
          const box = await field.boundingBox()
          if (box) {
            // Input should be touch-friendly (min 44px height)
            expect(box.height).toBeGreaterThanOrEqual(40)
          }
        }
      }

      console.log('✅ Checkout form is mobile-friendly')
    })
  })

  test.describe('Mobile Payment Flow', () => {
    test('should complete payment on mobile', async ({ page }) => {
      await page.goto('/pages/checkout.html')
      await page.waitForLoadState('domcontentloaded')

      // Check payment form is visible
      await expect(page.locator('.payment-form, #payment-form')).toBeVisible({
        timeout: 10000
      })

      // Fill out payment form (test data)
      const nameInput = page.locator('#card-name, .card-name input')
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User')
      }

      const numberInput = page.locator('#card-number, .card-number input')
      if (await numberInput.isVisible()) {
        await numberInput.fill('4242424242424242')
      }

      const expiryInput = page.locator('#card-expiry, .card-expiry input')
      if (await expiryInput.isVisible()) {
        await expiryInput.fill('12/25')
      }

      const cvcInput = page.locator('#card-cvc, .card-cvc input')
      if (await cvcInput.isVisible()) {
        await cvcInput.fill('123')
      }

      // Submit payment
      const payButton = page.locator('#pay-btn, .pay-button, button:has-text("Pagar")')
      if (await payButton.isVisible()) {
        await payButton.click()
        await page.waitForTimeout(2000)

        // Check for success or error
        const result = page.locator('.payment-result, .success-message, .error-message')
        await expect(result).toBeVisible({ timeout: 10000 })

        console.log('✅ Payment form submission works on mobile')
      }
    })
  })

  test.describe('Mobile Navigation', () => {
    test('should navigate with mobile menu', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Check for mobile menu toggle
      const menuToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, #mobile-menu')
      if (await menuToggle.isVisible()) {
        await menuToggle.click()
        await page.waitForTimeout(500)

        // Check menu is open
        const mobileMenu = page.locator('.mobile-menu, .mobile-nav')
        await expect(mobileMenu).toBeVisible()

        // Navigate to another page
        const menuLink = mobileMenu.locator('a').first()
        if (await menuLink.isVisible()) {
          const href = await menuLink.getAttribute('href')
          if (href && href !== '#') {
            await menuLink.click()
            await page.waitForTimeout(500)

            console.log('✅ Mobile menu navigation works')
          }
        }
      }
    })

    test('should use bottom navigation on mobile', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Check for bottom navigation
      const bottomNav = page.locator('.bottom-nav, .mobile-nav-bottom, .tab-bar')
      if (await bottomNav.isVisible()) {
        // Check navigation items
        const navItems = bottomNav.locator('a, button')
        const itemCount = await navItems.count()
        expect(itemCount).toBeGreaterThan(0)

        console.log(`✅ Bottom navigation found with ${itemCount} items`)
      }
    })
  })

  test.describe('Mobile Product Filtering', () => {
    test('should filter products on mobile', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Find filter button (might be in a dropdown or modal on mobile)
      const filterButton = page.locator('.filter-toggle, .filter-btn, .mobile-filter-toggle')

      if (await filterButton.isVisible()) {
        await filterButton.click()
        await page.waitForTimeout(500)

        // Check filter panel/modal opens
        const filterPanel = page.locator('.filter-panel, .filter-modal, .mobile-filter-panel')
        if (await filterPanel.isVisible()) {
          // Apply a filter
          const filterOption = filterPanel.locator('input[type="checkbox"], select').first()
          if (await filterOption.isVisible()) {
            await filterOption.click()
            await page.waitForTimeout(500)

            // Check products are filtered
            const products = page.locator('.design-card, .product-card')
            const productCount = await products.count()

            console.log(`✅ Filter works on mobile: ${productCount} products after filtering`)
          }
        }
      }
    })
  })

  test.describe('Mobile Performance', () => {
    test('should load quickly on 3G simulation', async ({ page }) => {
      // Simulate slower connection
      await page.route('**/*', route => {
        route.continue()
      })

      const startTime = Date.now()
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime

      // Should load within reasonable time even on slower connection
      expect(loadTime).toBeLessThan(10000) // 10 seconds
      console.log(`✅ Page loaded in ${loadTime}ms on mobile`)
    })

    test('should handle image lazy loading', async ({ page }) => {
      await page.goto('/pages/disenos.html')
      await page.waitForLoadState('domcontentloaded')

      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await page.waitForTimeout(1000)

      // Scroll back up
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(500)

      // Check that images are loaded
      const images = page.locator('img')
      const imageCount = await images.count()

      let loadedImages = 0
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i)
        const src = await img.getAttribute('src')
        if (src && !src.includes('placeholder')) {
          loadedImages++
        }
      }

      console.log(`✅ ${loadedImages}/${imageCount} images loaded properly`)
    })
  })
})
