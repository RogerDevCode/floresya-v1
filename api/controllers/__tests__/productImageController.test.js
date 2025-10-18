/**
 * Product Image Controller Tests
 * Testing HTTP endpoints for product images
 */

import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

// Mock productImageService
vi.mock('../../services/productImageService.js', () => ({
  getProductImages: vi.fn((productId, filters) => {
    if (productId === 67) {
      return Promise.resolve([
        {
          id: 1,
          product_id: 67,
          image_index: 1,
          size: filters?.size || 'small',
          url: 'https://example.com/image1_small.webp',
          file_hash: 'hash1',
          mime_type: 'image/webp',
          is_primary: false,
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 2,
          product_id: 67,
          image_index: 2,
          size: filters?.size || 'small',
          url: 'https://example.com/image2_small.webp',
          file_hash: 'hash2',
          mime_type: 'image/webp',
          is_primary: false,
          created_at: '2025-01-01T00:01:00Z'
        }
      ])
    }
    throw new Error('No images found')
  }),
  getPrimaryImage: vi.fn(productId => {
    if (productId === 67) {
      return Promise.resolve({
        id: 1,
        product_id: 67,
        image_index: 1,
        size: 'medium',
        url: 'https://example.com/image1_medium.webp',
        file_hash: 'hash1',
        mime_type: 'image/webp',
        is_primary: true,
        created_at: '2025-01-01T00:00:00Z'
      })
    }
    throw new Error('No primary image found')
  })
}))

describe('Product Image Controller', () => {
  describe('GET /api/products/:id/images', () => {
    it('should return 200 and product images for valid product ID', async () => {
      const response = await request(app).get('/api/products/67/images').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
      expect(response.body.data[0]).toHaveProperty('product_id', 67)
      expect(response.body.data[0]).toHaveProperty('url')
      expect(response.body.data[0]).toHaveProperty('size')
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('retrieved successfully')
    })

    it('should filter images by size when size query param is provided', async () => {
      const response = await request(app).get('/api/products/67/images?size=small').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      response.body.data.forEach(img => {
        expect(img.size).toBe('small')
      })
    })

    it('should return 400 for invalid product ID (string)', async () => {
      const response = await request(app).get('/api/products/abc/images').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('ValidationError') // Fixed: Using PascalCase for consistency
    })

    it('should return 400 for invalid product ID (zero)', async () => {
      const response = await request(app).get('/api/products/0/images').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body.error).toBe('ValidationError') // Fixed: Using PascalCase for consistency
    })

    it('should return 400 for invalid product ID (negative)', async () => {
      const response = await request(app).get('/api/products/-1/images').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body.error).toBe('ValidationError') // Fixed: Using PascalCase for consistency
    })

    it('should return 500 when service throws error', async () => {
      const response = await request(app).get('/api/products/999/images').expect(500)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/products/:id/images/primary', () => {
    it('should return 200 and primary image for valid product ID', async () => {
      const response = await request(app).get('/api/products/67/images/primary').expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('product_id', 67)
      expect(response.body.data).toHaveProperty('is_primary', true)
      expect(response.body.data).toHaveProperty('size', 'medium')
      expect(response.body).toHaveProperty('message', 'Primary image retrieved successfully')
    })

    it('should return 400 for invalid product ID', async () => {
      const response = await request(app).get('/api/products/invalid/images/primary').expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 500 when no primary image exists', async () => {
      const response = await request(app).get('/api/products/999/images/primary').expect(500)

      expect(response.body).toHaveProperty('success', false)
    })
  })

  describe('Response format validation', () => {
    it('should have standardized success response structure', async () => {
      const response = await request(app).get('/api/products/67/images').expect(200)

      // Validate standard response format
      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('message')
      expect(typeof response.body.success).toBe('boolean')
      expect(typeof response.body.message).toBe('string')
    })

    it('should have standardized error response structure', async () => {
      const response = await request(app).get('/api/products/0/images').expect(400)

      // Validate standard error format
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
      expect(response.body).toHaveProperty('message')
      expect(typeof response.body.error).toBe('string')
      expect(typeof response.body.message).toBe('string')
    })
  })

  describe('OpenAPI contract compliance', () => {
    it('should return ProductImage schema-compliant data', async () => {
      const response = await request(app).get('/api/products/67/images').expect(200)

      const image = response.body.data[0]
      expect(image).toHaveProperty('id')
      expect(image).toHaveProperty('product_id')
      expect(image).toHaveProperty('image_index')
      expect(image).toHaveProperty('size')
      expect(image).toHaveProperty('url')
      expect(image).toHaveProperty('file_hash')
      expect(image).toHaveProperty('mime_type')
      expect(image).toHaveProperty('is_primary')
      expect(image).toHaveProperty('created_at')

      // Validate types
      expect(typeof image.id).toBe('number')
      expect(typeof image.product_id).toBe('number')
      expect(typeof image.image_index).toBe('number')
      expect(['thumb', 'small', 'medium', 'large']).toContain(image.size)
      expect(typeof image.url).toBe('string')
      expect(typeof image.file_hash).toBe('string')
      expect(typeof image.mime_type).toBe('string')
      expect(typeof image.is_primary).toBe('boolean')
      expect(typeof image.created_at).toBe('string')
    })
  })
})
