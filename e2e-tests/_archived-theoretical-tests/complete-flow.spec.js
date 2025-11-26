import { test, expect } from '@playwright/test'
import { setupPages } from '../utils/page-setup.js'

// Fixtures realistas para testing de carrito completo
const REAL_PRODUCTS = [
  {
    id: 1,
    name: 'Ramo de Rosas Premium',
    price_usd: 25000,
    stock: 15,
    image_thumb: '/images/products/rosas-premium-thumb.jpg'
  },
  {
    id: 2,
    name: 'Girasol Blanco Elegante',
    price_usd: 18000,
    stock: 8,
    image_thumb: '/images/products/girasol-blanco-thumb.jpg'
  },
  {
    id: 3,
    name: 'Orquídea Real',
    price_usd: 32000,
    stock: 5,
    image_thumb: '/images/products/orquidea-real-thumb.jpg'
  }
]

test.describe('Shopping Cart - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupPages(page)
    // Mock API responses for consistent testing
    await page.route('**/api/products**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: REAL_PRODUCTS,
          pagination: {
            page: 1,
            totalPages: 1,
            totalItems: 3
          }
        })
      })
    })

    await page.goto('/pages/cart.html')
    await page.waitForLoad()
  })

  test.describe('Phase 1: Empty Cart State', () => {
    test('should display empty cart message initially', async ({ page }) => {
      const emptyMessage = page.locator('[data-testid="empty-cart-message"]')
      await expect(emptyMessage).toBeVisible()
      await expect(emptyMessage).toContainText('Tu carrito está vacío')
    })

    test('should disable checkout button when cart is empty', async ({ page }) => {
      const checkoutBtn = page.locator('[data-testid="checkout-button"]')
      await expect(checkoutBtn).toBeDisabled()
    })

    test('should show products link when cart is empty', async ({ page }) => {
      const productsLink = page.locator('[data-testid="empty-cart-products-link"]')
      await expect(productsLink).toBeVisible()
      await expect(productsLink).toHaveAttribute('href', '/#productos')
    })
  })

  test.describe('Phase 2: Adding Products to Cart', () => {
    test('should add single product to cart', async ({ page }) => {
      // Navegar a productos primero
      await page.goto('/#productos')
      await page.waitForLoad()

      // Buscar primer producto
      const searchInput = page.locator('[data-testid="search-input"]')
      await searchInput.fill(REAL_PRODUCTS[0].name)

      // Click en producto
      const productCard = page.locator(`[data-testid="product-card-${REAL_PRODUCTS[0].id}"]`)
      await expect(productCard).toBeVisible()

      await productCard.click()

      // Esperar a que se cargue la página de detalle
      await page.waitForURL(/product-detail\.html/)
      await page.waitForLoad()

      // Agregar al carrito
      const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
      await expect(addToCartBtn).toBeVisible()
      await addToCartBtn.click()

      // Verificar toast de éxito
      const toast = page.locator('[data-testid="cart-toast"]')
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('agregado al carrito')
    })

    test('should add multiple products sequentially', async ({ page }) => {
      // Volver a productos
      await page.goto('/#productos')
      await page.waitForLoad()

      // Agregar productos 1, 2, 3
      for (const product of REAL_PRODUCTS) {
        const productCard = page.locator(`[data-testid="product-card-${product.id}"]`)
        await productCard.scrollIntoViewIfNeeded()
        await productCard.click()

        await page.waitForURL(/product-detail\.html/)
        await page.waitForLoad()

        const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
        await addToCartBtn.click()

        // Esperar toast
        const toast = page.locator('[data-testid="cart-toast"]')
        await expect(toast).toBeVisible()
        await toast.waitFor({ state: 'hidden' })
      }

      // Ir al carrito
      const cartLink = page.locator('[data-testid="cart-button"]')
      await cartLink.click()
      await page.waitForURL(/cart\.html/)
      await page.waitForLoad()
    })

    test('should update product quantities', async ({ page }) => {
      await page.goto('/pages/cart.html')
      await page.waitForLoad()

      // Modificar cantidad del primer producto
      const quantityInput = page.locator('[data-testid="cart-item-quantity-1"]')
      await quantityInput.fill('3')

      // Verificar que se actualiza el subtotal
      const subtotalElement = page.locator('[data-testid="cart-subtotal"]')
      const expectedSubtotal = (REAL_PRODUCTS[0].price_usd * 3).toFixed(2)
      await expect(subtotalElement).toContainText(expectedSubtotal)
    })
  })

  test.describe('Phase 3: Cart Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Setup carrito con 3 productos
      await page.goto('/#productos')

      for (const product of REAL_PRODUCTS.slice(0, 2)) {
        const productCard = page.locator(`[data-testid="product-card-${product.id}"]`)
        await productCard.scrollIntoViewIfNeeded()
        await productCard.click()

        await page.waitForURL(/product-detail\.html/)
        await page.waitForLoad()

        const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
        await addToCartBtn.click()

        const toast = page.locator('[data-testid="cart-toast"]')
        await toast.waitFor({ state: 'hidden' })
      }

      await page.goto('/pages/cart.html')
      await page.waitForLoad()
    })

    test('should remove product from cart', async ({ page }) => {
      const initialItemCount = page.locator('[data-testid="cart-item-count"]').count()

      const removeBtn = page.locator('[data-testid="remove-item-1"]')
      await removeBtn.click()

      // Verificar toast de eliminación
      const toast = page.locator('[data-testid="cart-toast"]')
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('eliminado del carrito')

      // Verificar que se reduce el contador
      await expect(page.locator('[data-testid="cart-item-count"]')).toHaveCount(
        initialItemCount - 1
      )
    })

    test('should clear entire cart', async ({ page }) => {
      const clearBtn = page.locator('[data-testid="clear-cart-button"]')
      await expect(clearBtn).toBeVisible()

      await clearBtn.click()

      // Verificar toast
      const toast = page.locator('[data-testid="cart-toast"]')
      await expect(toast).toBeVisible()
      await expect(toast).toContainText('carrito vaciado')

      // Verificar estado de carrito vacío
      await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="checkout-button"]')).toBeDisabled()
    })
  })

  test.describe('Phase 4: Cart Persistence', () => {
    test('should persist cart items across page reloads', async ({ page }) => {
      // Setup carrito
      await page.goto('/#productos')
      const firstProduct = page.locator(`[data-testid="product-card-${REAL_PRODUCTS[0].id}"]`)
      await firstProduct.click()

      await page.waitForURL(/product-detail\.html/)
      await page.waitForLoad()

      await page.locator('[data-testid="add-to-cart-button"]').click()

      // Recargar página
      await page.reload()
      await page.waitForLoad()

      // Verificar que el producto sigue en el carrito
      const cartBadge = page.locator('[data-testid="cart-count-badge"]')
      await expect(cartBadge).toContainText('1')
    })

    test('should handle localStorage corruption gracefully', async ({ page }) => {
      // Simular localStorage corrupto
      await page.addInitScript({
        content: `
          localStorage.setItem('floresya_cart', 'corrupted_data');
          window.dispatchEvent(new CustomEvent('storage'));
        `
      })

      await page.goto('/pages/cart.html')
      await page.waitForLoad()

      // Verificar que se muestra estado de error y se recupera
      await expect(page.locator('[data-testid="cart-error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="cart-recovery-button"]')).toBeVisible()
    })
  })

  test.describe('Phase 5: Checkout Preparation', () => {
    test.beforeEach(async ({ page }) => {
      // Setup carrito con items
      await page.goto('/#productos')

      for (const product of REAL_PRODUCTS) {
        const productCard = page.locator(`[data-testid="product-card-${product.id}"]`)
        await productCard.scrollIntoViewIfNeeded()
        await productCard.click()

        await page.waitForURL(/product-detail\.html/)
        await page.waitForLoad()

        const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
        await addToCartBtn.click()

        const toast = page.locator('[data-testid="cart-toast"]')
        await toast.waitFor({ state: 'hidden' })
      }

      await page.goto('/pages/cart.html')
      await page.waitForLoad()
    })

    test('should enable checkout button when cart has items', async ({ page }) => {
      const checkoutBtn = page.locator('[data-testid="checkout-button"]')
      await expect(checkoutBtn).toBeEnabled()
    })

    test('should display correct total with multiple items', async ({ page }) => {
      const expectedTotal = REAL_PRODUCTS.reduce((sum, p) => sum + p.price_usd, 0).toFixed(2)

      const totalElement = page.locator('[data-testid="cart-total"]')
      await expect(totalElement).toContainText(expectedTotal)
    })

    test('should show item count badge correctly', async ({ page }) => {
      const expectedCount = REAL_PRODUCTS.length.toString()

      const cartBadge = page.locator('[data-testid="cart-count-badge"]')
      await expect(cartBadge).toContainText(expectedCount)
    })
  })

  test.describe('Performance and Accessibility', () => {
    test('should load cart page within performance budget', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/pages/cart.html')
      await page.waitForLoad()

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // 3 seconds max load time
    })

    test('should be accessible with keyboard navigation', async ({ page }) => {
      await page.goto('/pages/cart.html')
      await page.waitForLoad()

      // Tab navigation through cart items
      await page.keyboard.press('Tab')

      const firstInteractiveElement = page.locator('[data-testid="cart-item-quantity-1"]')
      await expect(firstInteractiveElement).toBeFocused()

      // Tab through all interactive elements
      const interactiveElements = [
        '[data-testid="cart-item-quantity-1"]',
        '[data-testid="cart-item-quantity-2"]',
        '[data-testid="cart-item-quantity-3"]',
        '[data-testid="remove-item-1"]',
        '[data-testid="remove-item-2"]',
        '[data-testid="remove-item-3"]',
        '[data-testid="clear-cart-button"]',
        '[data-testid="checkout-button"]'
      ]

      for (const element of interactiveElements) {
        await page.keyboard.press('Tab')
        await expect(page.locator(element)).toBeFocused()
        await page.keyboard.press('Tab') // Move to next
      }
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/pages/cart.html')
      await page.waitForLoad()

      // Verificar ARIA labels
      await expect(page.locator('[data-testid="cart-section"]')).toHaveAttribute('role', 'region')
      await expect(page.locator('[data-testid="cart-section"]')).toHaveAttribute(
        'aria-label',
        'Carrito de compras'
      )

      // Verificar ARIA en botones
      await expect(page.locator('[data-testid="remove-item-1"]')).toHaveAttribute(
        'aria-label',
        'Remover Ramo de Rosas Premium del carrito'
      )
      await expect(page.locator('[data-testid="clear-cart-button"]')).toHaveAttribute(
        'aria-label',
        'Vaciar carrito completamente'
      )
      await expect(page.locator('[data-testid="checkout-button"]')).toHaveAttribute(
        'aria-label',
        'Proceder al checkout'
      )
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error for API
      await page.route('**/api/products**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        })
      })

      await page.goto('/#productos')
      await page.waitForLoad()

      // Buscar producto
      const searchInput = page.locator('[data-testid="search-input"]')
      await searchInput.fill(REAL_PRODUCTS[0].name)

      const productCard = page.locator(`[data-testid="product-card-${REAL_PRODUCTS[0].id}"]`)
      await productCard.click()

      await page.waitForURL(/product-detail\.html/)
      await page.waitForLoad()

      // Intentar agregar al carrito
      const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
      await addToCartBtn.click()

      // Verificar mensaje de error
      await expect(page.locator('[data-testid="api-error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="add-to-cart-button"]')).toBeDisabled()
    })

    test('should handle maximum stock limits', async ({ page }) => {
      // Mock API con stock limitado
      await page.route('**/api/products**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              {
                ...REAL_PRODUCTS[0],
                stock: 2 // Solo 2 disponibles
              }
            ]
          })
        })
      })

      await page.goto('/#productos')
      await page.waitForLoad()

      // Agregar 3 unidades del producto (debería fallar en la 3ra)
      const searchInput = page.locator('[data-testid="search-input"]')
      await searchInput.fill(REAL_PRODUCTS[0].name)

      const productCard = page.locator(`[data-testid="product-card-${REAL_PRODUCTS[0].id}"]`)
      await productCard.click()

      await page.waitForURL(/product-detail\.html/)
      await page.waitForLoad()

      // Intentar agregar 3
      const quantityInput = page.locator('[data-testid="quantity-input"]')
      await quantityInput.fill('3')

      const addToCartBtn = page.locator('[data-testid="add-to-cart-button"]')
      await addToCartBtn.click()

      // Verificar error de stock
      await expect(page.locator('[data-testid="stock-error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="stock-available"]')).toContainText(
        'Solo 2 disponibles'
      )
    })
  })
})
