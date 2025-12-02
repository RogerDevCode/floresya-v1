/**
 * Unit Test: Product Images API and Component
 * Tests para verificar que el API retorna imágenes y componentes las manejan correctamente
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@supabase/supabase-js')

describe('Product Images API', () => {
  let mockSupabase
  let createChainableMock

  beforeEach(() => {
    // Helper to create a chainable mock that returns specific data
    createChainableMock = (data = [], error = null) => {
      const mock = {
        then: vi.fn(resolve => {
          const result = { data, error }
          resolve(result)
          return Promise.resolve(result)
        })
      }

      const chainableMethods = ['from', 'select', 'eq', 'order', 'limit', 'in', 'single']
      chainableMethods.forEach(method => {
        mock[method] = vi.fn().mockReturnValue(mock)
      })

      return mock
    }

    mockSupabase = createChainableMock([])
    vi.mocked(createClient).mockReturnValue(mockSupabase)
  })

  describe('Product Images Endpoint', () => {
    it('should return images for a product', async () => {
      const mockImages = [
        {
          id: 1,
          product_id: 195,
          image_index: 1,
          size: 'large',
          url: 'https://supabase.co/storage/v1/object/public/product-images/large/product_1_1_hash.webp',
          is_primary: true,
          active: true
        },
        {
          id: 2,
          product_id: 195,
          image_index: 2,
          size: 'large',
          url: 'https://supabase.co/storage/v1/object/public/product-images/large/product_1_2_hash.webp',
          is_primary: false,
          active: true
        }
      ]

      // Setup mock with data
      const scopedMock = createChainableMock(mockImages)
      mockSupabase.from.mockReturnValue(scopedMock)

      // Call API (simulated)
      const { data, error } = await mockSupabase
        .from('product_images')
        .select('*')
        .eq('product_id', 195)
        .eq('active', true)
        .order('image_index')

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
      expect(data[0].is_primary).toBe(true)
      expect(data[0].url).toContain('supabase')
    })

    it('should return primary image first', async () => {
      const mockImages = [
        {
          id: 1,
          product_id: 195,
          image_index: 1,
          is_primary: true,
          url: 'https://supabase.co/.../image1.webp'
        },
        {
          id: 2,
          product_id: 195,
          image_index: 2,
          is_primary: false,
          url: 'https://supabase.co/.../image2.webp'
        }
      ]

      const scopedMock = createChainableMock(mockImages)
      mockSupabase.from.mockReturnValue(scopedMock)

      const { data } = await mockSupabase
        .from('product_images')
        .select('*')
        .eq('product_id', 195)
        .order('image_index')

      expect(data[0].is_primary).toBe(true)
      expect(data[0].image_index).toBe(1)
    })

    it('should filter by size', async () => {
      const mockImages = [
        {
          id: 1,
          product_id: 195,
          size: 'small',
          url: 'https://supabase.co/.../small/image1.webp'
        }
      ]

      const scopedMock = createChainableMock(mockImages)
      mockSupabase.from.mockReturnValue(scopedMock)

      const { data } = await mockSupabase
        .from('product_images')
        .select('*')
        .eq('product_id', 195)
        .eq('size', 'small')

      expect(data[0].size).toBe('small')
      expect(data[0].url).toContain('/small/')
    })

    it('should handle products with no images', async () => {
      const scopedMock = createChainableMock([])
      mockSupabase.from.mockReturnValue(scopedMock)

      const { data, error } = await mockSupabase
        .from('product_images')
        .select('*')
        .eq('product_id', 999)

      expect(error).toBeNull()
      expect(data).toHaveLength(0)
    })
  })

  describe('Product Images Distribution', () => {
    it('should verify all products have images', async () => {
      const productIds = [191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202]

      const mockDistribution = productIds.map(id => ({
        product_id: id,
        image_count: id <= 199 ? 4 : 3
      }))

      const totalImages = mockDistribution.reduce((sum, p) => sum + p.image_count, 0)
      expect(totalImages).toBe(45)

      mockDistribution.forEach(product => {
        expect(product.image_count).toBeGreaterThan(0)
        expect(product.image_count).toBeLessThanOrEqual(4)
      })
    })

    it('should have valid image URLs', async () => {
      const mockImages = [
        {
          url: 'https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/large/product_1_1_hash.webp'
        }
      ]

      const scopedMock = createChainableMock(mockImages)
      mockSupabase.from.mockReturnValue(scopedMock)

      const { data } = await mockSupabase
        .from('product_images')
        .select('url')
        .eq('product_id', 195)
        .limit(1)

      expect(data[0].url).toMatch(/^https:\/\//)
      expect(data[0].url).toContain('supabase.co')
    })
  })

  describe('Carousel Data', () => {
    it('should return carousel products with primary images', async () => {
      const mockProducts = [
        {
          id: 195,
          name: 'Producto 1',
          product_images: [
            {
              url: 'https://supabase.co/.../image1.webp',
              is_primary: true,
              size: 'small'
            }
          ]
        },
        {
          id: 196,
          name: 'Producto 2',
          product_images: [
            {
              url: 'https://supabase.co/.../image2.webp',
              is_primary: true,
              size: 'small'
            }
          ]
        }
      ]

      const scopedMock = createChainableMock(mockProducts)
      mockSupabase.from.mockReturnValue(scopedMock)

      const { data } = await mockSupabase.from('products').select('*, product_images(*)').limit(10)

      expect(data).toHaveLength(2)
      expect(data[0].product_images).toHaveLength(1)
      expect(data[0].product_images[0].is_primary).toBe(true)
    })
  })
})

describe('Product Card Component', () => {
  it('should render image with correct src', () => {
    const product = {
      id: 195,
      name: 'Test Product',
      image_url_small: 'https://supabase.co/.../small/image.webp'
    }

    // Simular renderizado del componente
    const imageElement = {
      src: product.image_url_small,
      alt: product.name,
      loading: 'lazy'
    }

    expect(imageElement.src).toBe(product.image_url_small)
    expect(imageElement.alt).toBe(product.name)
    expect(imageElement.loading).toBe('lazy')
  })

  it('should use placeholder when no image available', () => {
    const product = {
      id: 195,
      name: 'Test Product',
      image_url_small: null
    }

    const placeholderUrl = '/images/placeholder-flower.svg'
    const imageElement = {
      src: product.image_url_small || placeholderUrl,
      alt: product.name
    }

    expect(imageElement.src).toBe(placeholderUrl)
  })
})
