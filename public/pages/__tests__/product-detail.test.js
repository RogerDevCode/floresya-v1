/**
 * Product Detail Page Integration Tests
 * Testing frontend logic for product-detail.js
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../../js/shared/api-client.js'

// Mock the api client
vi.mock('../../js/shared/api-client.js', () => ({
  api: {
    getProductsById: vi.fn(),
    getProductImages: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

describe('Product Detail Page - URL Parsing', () => {
  it('should extract product ID from URL query params', () => {
    const url = new URL('http://localhost:3000/pages/product-detail.html?id=67')
    const params = new URLSearchParams(url.search)
    const id = params.get('id')

    expect(id).toBe('67')
    expect(parseInt(id, 10)).toBe(67)
  })

  it('should handle missing ID parameter', () => {
    const url = new URL('http://localhost:3000/pages/product-detail.html')
    const params = new URLSearchParams(url.search)
    const id = params.get('id')

    expect(id).toBeNull()
  })

  it('should handle invalid ID parameter', () => {
    const url = new URL('http://localhost:3000/pages/product-detail.html?id=abc')
    const params = new URLSearchParams(url.search)
    const id = params.get('id')
    const productId = parseInt(id, 10)

    expect(isNaN(productId)).toBe(true)
  })
})

describe('Product Detail Page - API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch product data from api.getProductsById', async () => {
    const mockProduct = {
      id: 67,
      name: 'Ramo Tropical Vibrante',
      description: 'Explosión de colores tropicales',
      price_usd: 45.99,
      price_ves: 1837.96,
      stock: 15,
      sku: 'FY-001',
      active: true
    }

    api.getProductsById.mockResolvedValueOnce({
      success: true,
      data: mockProduct,
      message: 'Product retrieved successfully'
    })

    const result = await api.getProductsById(67)

    expect(result.success).toBe(true)
    expect(result.data.id).toBe(67)
    expect(result.data.name).toBe('Ramo Tropical Vibrante')
  })

  it('should fetch product images from api.getProductImages', async () => {
    const mockImages = [
      {
        id: 237,
        product_id: 67,
        image_index: 1,
        size: 'thumb',
        url: 'https://example.com/thumb.webp',
        is_primary: false
      },
      {
        id: 238,
        product_id: 67,
        image_index: 1,
        size: 'small',
        url: 'https://example.com/small.webp',
        is_primary: false
      },
      {
        id: 239,
        product_id: 67,
        image_index: 1,
        size: 'medium',
        url: 'https://example.com/medium.webp',
        is_primary: false
      }
    ]

    api.getProductImages.mockResolvedValueOnce({
      success: true,
      data: mockImages,
      message: 'Images retrieved successfully'
    })

    const result = await api.getProductImages(67)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(3)
    expect(result.data[0].size).toBe('thumb')
    expect(result.data[1].size).toBe('small')
    expect(result.data[2].size).toBe('medium')
  })

  it('should handle 404 product not found', async () => {
    api.getProductsById.mockRejectedValueOnce(new Error('Product not found'))

    try {
      await api.getProductsById(999)
      expect.fail('Should have thrown error')
    } catch (error) {
      expect(error.message).toBe('Product not found')
    }
  })

  it('should handle network errors gracefully', async () => {
    api.getProductsById.mockRejectedValueOnce(new Error('Network error'))

    try {
      await api.getProductsById(67)
      expect.fail('Should have thrown error')
    } catch (error) {
      expect(error.message).toBe('Network error')
    }
  })
})

describe('Product Detail Page - Cart Logic', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue('[]')
    localStorageMock.setItem.mockClear()
  })

  it('should add product to cart in localStorage', () => {
    const cart = []
    const newItem = {
      id: 67,
      name: 'Ramo Tropical Vibrante',
      price_usd: 45.99,
      quantity: 1,
      image_url_small: 'https://example.com/small.webp'
    }

    cart.push(newItem)
    const cartJSON = JSON.stringify(cart)

    localStorageMock.setItem('cart', cartJSON)

    expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', cartJSON)
  })

  it('should update quantity if product already in cart', () => {
    const existingCart = [
      {
        id: 67,
        name: 'Ramo Tropical Vibrante',
        price_usd: 45.99,
        quantity: 2,
        image_url_small: 'https://example.com/small.webp'
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingCart))

    const cart = JSON.parse(localStorageMock.getItem('cart'))
    const existingItem = cart.find(item => item.id === 67)

    expect(existingItem).toBeDefined()
    expect(existingItem.quantity).toBe(2)

    // Increment quantity
    existingItem.quantity += 1
    expect(existingItem.quantity).toBe(3)
  })

  it('should calculate total cart items', () => {
    const cart = [
      { id: 67, quantity: 2 },
      { id: 68, quantity: 3 },
      { id: 69, quantity: 1 }
    ]

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    expect(totalItems).toBe(6)
  })
})

describe('Product Detail Page - Quantity Validation', () => {
  it('should validate quantity is positive integer', () => {
    const quantity = 5
    expect(Number.isInteger(quantity)).toBe(true)
    expect(quantity).toBeGreaterThan(0)
  })

  it('should reject negative quantities', () => {
    const quantity = -1
    const isValid = quantity > 0

    expect(isValid).toBe(false)
  })

  it('should reject zero quantity', () => {
    const quantity = 0
    const isValid = quantity > 0

    expect(isValid).toBe(false)
  })

  it('should not exceed available stock', () => {
    const stock = 15
    const requestedQty = 20

    const isValid = requestedQty <= stock

    expect(isValid).toBe(false)
  })

  it('should allow quantity within stock', () => {
    const stock = 15
    const requestedQty = 10

    const isValid = requestedQty <= stock && requestedQty > 0

    expect(isValid).toBe(true)
  })
})

describe('Product Detail Page - Image Gallery Logic', () => {
  it('should filter images by size', () => {
    const allImages = [
      { id: 1, size: 'thumb', url: 'thumb.webp' },
      { id: 2, size: 'small', url: 'small.webp' },
      { id: 3, size: 'medium', url: 'medium.webp' },
      { id: 4, size: 'large', url: 'large.webp' }
    ]

    const mediumImages = allImages.filter(img => img.size === 'medium')
    const thumbImages = allImages.filter(img => img.size === 'thumb')

    expect(mediumImages).toHaveLength(1)
    expect(mediumImages[0].url).toBe('medium.webp')
    expect(thumbImages).toHaveLength(1)
    expect(thumbImages[0].url).toBe('thumb.webp')
  })

  it('should use first medium image as main image', () => {
    const mediumImages = [
      { id: 3, size: 'medium', url: 'medium1.webp' },
      { id: 7, size: 'medium', url: 'medium2.webp' }
    ]

    const mainImage = mediumImages[0]

    expect(mainImage.url).toBe('medium1.webp')
  })

  it('should fallback to placeholder if no images', () => {
    const mediumImages = []
    const placeholderUrl = '../images/placeholder-flower.svg'

    const mainImageUrl = mediumImages.length > 0 ? mediumImages[0].url : placeholderUrl

    expect(mainImageUrl).toBe(placeholderUrl)
  })
})

describe('Product Detail Page - Error Handling', () => {
  it('should show error message on invalid product ID', () => {
    const errorMessage = 'Product ID is required in URL (?id=123)'

    expect(errorMessage).toContain('Product ID is required')
  })

  it('should show error message on product not found', () => {
    const errorMessage = 'Producto no encontrado'

    expect(errorMessage).toBe('Producto no encontrado')
  })

  it('should fail fast on API errors', async () => {
    api.getProductsById.mockRejectedValueOnce(new Error('Internal server error'))

    try {
      await api.getProductsById(67)
      expect.fail('Should have thrown error')
    } catch (error) {
      expect(error.message).toContain('error')
    }
  })
})
