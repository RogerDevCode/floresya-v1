/**
 * Unit Tests: Cart Utility
 * Tests core functionality for shopping cart operations
 * Following MANDATORY_RULES.md and ESLint compliance
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCartItemCount,
  getCartTotal,
  clearCart,
  isInCart,
  getCartItem,
  updateCartBadge,
  initCartBadge,
  forceUpdateCartBadge,
  initCartEventListeners,
  testCart
} from '../../../public/js/shared/cart.js'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

// Mock CustomEvent for window.dispatchEvent
const mockDispatchEvent = vi.fn()
const mockCustomEvent = vi.fn((type, options) => ({
  type,
  detail: options?.detail || {}
}))

describe('Cart Utility', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorageMock.clear()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    })

    // Reset window.dispatchEvent
    Object.defineProperty(window, 'dispatchEvent', {
      value: mockDispatchEvent,
      writable: true
    })

    // Reset CustomEvent
    Object.defineProperty(window, 'CustomEvent', {
      value: mockCustomEvent,
      writable: true
    })

    // Reset DOM
    document.body.innerHTML = ''

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockProduct = {
    id: 1,
    name: 'Test Flower',
    price_usd: 10.99,
    stock: 5,
    image_url_small: '/test-image.jpg'
  }

  describe('getCartItems', () => {
    test('should return empty array when cart is empty', () => {
      const items = getCartItems()
      expect(items).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('floresya_cart')
    })

    test('should return parsed items when cart has items', () => {
      const testItems = [mockProduct]
      localStorageMock.setItem('floresya_cart', JSON.stringify(testItems))

      const items = getCartItems()
      expect(items).toEqual(testItems)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('floresya_cart')
    })

    test('should return empty array on JSON parse error', () => {
      localStorageMock.setItem('floresya_cart', 'invalid-json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const items = getCartItems()
      expect(items).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load cart from localStorage:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('addToCart', () => {
    test('should throw error for invalid product', () => {
      expect(() => {
        addToCart(null)
      }).toThrow('Invalid product data')

      expect(() => {
        addToCart({})
      }).toThrow('Invalid product data')
    })

    test('should add new product to cart', () => {
      const result = addToCart(mockProduct, 2)

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test Flower',
          price_usd: 10.99,
          quantity: 2,
          stock: 5,
          image_thumb: '/test-image.jpg'
        })
      )

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'floresya_cart',
        JSON.stringify([result])
      )

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cart:updated'
        })
      )

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cart:itemAdded'
        })
      )
    })

    test('should update quantity for existing product', () => {
      // First add product
      addToCart(mockProduct, 1)
      vi.clearAllMocks()

      // Add same product again
      const result = addToCart(mockProduct, 2)

      expect(result.quantity).toBe(3)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'floresya_cart',
        expect.stringContaining('"quantity":3')
      )
    })

    test('should use default quantity of 1', () => {
      const result = addToCart(mockProduct)
      expect(result.quantity).toBe(1)
    })

    test('should use placeholder image when product has no image', () => {
      const productWithoutImage = { ...mockProduct }
      delete productWithoutImage.image_url_small
      delete productWithoutImage.image_thumb

      const result = addToCart(productWithoutImage)
      expect(result.image_thumb).toBe('/images/placeholder-flower.svg')
    })

    test('should use default stock when not provided', () => {
      const productWithoutStock = { ...mockProduct }
      delete productWithoutStock.stock

      const result = addToCart(productWithoutStock)
      expect(result.stock).toBe(999)
    })
  })

  describe('removeFromCart', () => {
    test('should return false when product not found', () => {
      const result = removeFromCart(999)
      expect(result).toBe(false)
      expect(mockDispatchEvent).not.toHaveBeenCalled()
    })

    test('should remove existing product and return true', () => {
      // Add product first
      addToCart(mockProduct)
      vi.clearAllMocks()

      const result = removeFromCart(1)

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('floresya_cart', JSON.stringify([]))

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cart:itemRemoved',
          detail: { productId: 1, items: [] }
        })
      )
    })
  })

  describe('updateCartItemQuantity', () => {
    beforeEach(() => {
      addToCart(mockProduct, 2)
      vi.clearAllMocks()
    })

    test('should throw error for negative quantity', () => {
      expect(() => {
        updateCartItemQuantity(1, -1)
      }).toThrow('Quantity cannot be negative')
    })

    test('should return null for non-existent product', () => {
      const result = updateCartItemQuantity(999, 5)
      expect(result).toBeNull()
    })

    test('should update quantity successfully', () => {
      const result = updateCartItemQuantity(1, 3)
      expect(result.quantity).toBe(3)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('should not exceed stock limit', () => {
      const result = updateCartItemQuantity(1, 10)
      expect(result.quantity).toBe(5) // Limited by stock
    })

    test('should remove item when quantity is 0', () => {
      const result = updateCartItemQuantity(1, 0)
      expect(result).toBeNull()
      expect(localStorageMock.setItem).toHaveBeenCalledWith('floresya_cart', JSON.stringify([]))
    })
  })

  describe('getCartItemCount', () => {
    test('should return 0 for empty cart', () => {
      const count = getCartItemCount()
      expect(count).toBe(0)
    })

    test('should return number of unique items', () => {
      addToCart(mockProduct, 3)
      const mockProduct2 = { ...mockProduct, id: 2, name: 'Test Flower 2' }
      addToCart(mockProduct2, 2)

      const count = getCartItemCount()
      expect(count).toBe(2) // 2 unique items, not total quantity
    })
  })

  describe('getCartTotal', () => {
    test('should return 0 for empty cart', () => {
      const total = getCartTotal()
      expect(total).toBe(0)
    })

    test('should calculate total correctly', () => {
      addToCart(mockProduct, 2) // 10.99 * 2 = 21.98
      const mockProduct2 = { ...mockProduct, id: 2, price_usd: 5.0 }
      addToCart(mockProduct2, 1) // 5.00 * 1 = 5.00

      const total = getCartTotal()
      expect(total).toBe(26.98) // 21.98 + 5.00
    })

    test('should handle floating point precision', () => {
      const productWithFloat = { ...mockProduct, price_usd: 0.99 }
      addToCart(productWithFloat, 3)

      const total = getCartTotal()
      expect(total).toBeCloseTo(2.97, 2)
    })
  })

  describe('clearCart', () => {
    beforeEach(() => {
      addToCart(mockProduct)
      vi.clearAllMocks()
    })

    test('should return false for already empty cart', () => {
      // Clear cart first
      clearCart()
      vi.clearAllMocks()

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const result = clearCart()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Cart is already empty')

      consoleSpy.mockRestore()
    })

    test('should clear cart and return true', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const result = clearCart()

      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('floresya_cart', JSON.stringify([]))

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cart:cleared'
        })
      )

      expect(consoleSpy).toHaveBeenCalledWith('Cart cleared: 1 items removed')

      consoleSpy.mockRestore()
    })

    test('should handle errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage read error')
      })

      const result = clearCart()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load cart from localStorage:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('isInCart', () => {
    test('should return false for non-existent product', () => {
      const result = isInCart(999)
      expect(result).toBe(false)
    })

    test('should return true for existing product', () => {
      addToCart(mockProduct)
      const result = isInCart(1)
      expect(result).toBe(true)
    })
  })

  describe('getCartItem', () => {
    test('should return null for non-existent product', () => {
      const result = getCartItem(999)
      expect(result).toBeNull()
    })

    test('should return item for existing product', () => {
      addToCart(mockProduct)
      const result = getCartItem(1)
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Test Flower',
          price_usd: 10.99,
          quantity: 1
        })
      )
    })
  })

  describe('updateCartBadge', () => {
    test('should not fail when no badge exists', () => {
      // No badge in DOM
      expect(() => {
        updateCartBadge(5)
      }).not.toThrow()
    })

    test('should update badge with class name', () => {
      const badge = document.createElement('span')
      badge.className = 'cart-badge'
      document.body.appendChild(badge)

      updateCartBadge(3)

      expect(badge.textContent).toBe('3')
      expect(badge.getAttribute('aria-label')).toBe('3 productos')
      expect(badge.style.display).toBe('inline-flex')
    })

    test('should update badge with ID', () => {
      const badge = document.createElement('span')
      badge.id = 'cart-count-badge'
      document.body.appendChild(badge)

      updateCartBadge(2)

      expect(badge.textContent).toBe('2')
      expect(badge.style.display).toBe('inline-flex')
    })

    test('should hide badge when count is 0', () => {
      const badge = document.createElement('span')
      badge.className = 'cart-badge'
      document.body.appendChild(badge)

      updateCartBadge(0)

      expect(badge.style.display).toBe('none')
    })

    test('should add pulse animation when count increases', () => {
      const badge = document.createElement('span')
      badge.className = 'cart-badge'
      badge.textContent = '2'
      document.body.appendChild(badge)

      updateCartBadge(5)

      expect(badge.classList.contains('cart-badge--pulse')).toBe(true)
    })

    test('should add shake animation when count decreases', () => {
      const badge = document.createElement('span')
      badge.className = 'cart-badge'
      badge.textContent = '5'
      document.body.appendChild(badge)

      updateCartBadge(2)

      expect(badge.classList.contains('cart-badge--shake')).toBe(true)
    })
  })

  describe('initCartBadge', () => {
    test('should initialize badge with current cart count', () => {
      const badge = document.createElement('span')
      badge.className = 'cart-badge'
      document.body.appendChild(badge)

      addToCart(mockProduct)
      vi.clearAllMocks()

      initCartBadge()

      expect(badge.textContent).toBe('1')
    })
  })

  describe('forceUpdateCartBadge', () => {
    test('should update badge and return count', () => {
      const badge = document.createElement('span')
      badge.className = 'cart-badge'
      document.body.appendChild(badge)

      addToCart(mockProduct)
      vi.clearAllMocks()

      const count = forceUpdateCartBadge()

      expect(count).toBe(1)
      expect(badge.textContent).toBe('1')
    })
  })

  describe('initCartEventListeners', () => {
    test('should set up event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      initCartEventListeners()

      expect(addEventListenerSpy).toHaveBeenCalledWith('cart:updated', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('cart:itemAdded', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('cart:itemRemoved', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('cart:cleared', expect.any(Function))

      consoleSpy.mockRestore()
    })
  })

  describe('testCart', () => {
    test('should run cart test and return results', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = testCart()

      expect(result).toEqual(
        expect.objectContaining({
          initialCount: 0,
          finalCount: 0,
          success: true
        })
      )

      expect(consoleSpy).toHaveBeenCalledWith('🧪 Testing cart functionality...')
      expect(consoleSpy).toHaveBeenCalledWith('✅ Cart test completed!')

      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    test('should handle malformed localStorage data gracefully', () => {
      localStorageMock.setItem('floresya_cart', '{ malformed json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const items = getCartItems()
      expect(items).toEqual([])

      consoleSpy.mockRestore()
    })

    test('should handle localStorage quota exceeded', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      addToCart(mockProduct)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save cart to localStorage:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})
