/**
 * Product Image Service Tests
 * Testing CRUD operations for product images
 */

import { describe, it, expect } from 'vitest'
import * as productImageService from '../productImageService.js'

// Skip service tests for now (requires integration testing with real DB or complex mocking)
// These tests should be integration tests, not unit tests
describe.skip('productImageService (integration tests - requires DB)', () => {
  // These tests would require a test database or more sophisticated mocking
})

// Note: Service tests should ideally be integration tests with a test database
// For now, we test validation logic only (unit tests)
describe('productImageService - Validation', () => {
  describe('input validation', () => {
    it('should throw error for null product ID', async () => {
      await expect(productImageService.getProductImages(null)).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })

    it('should throw error for string product ID', async () => {
      await expect(productImageService.getProductImages('abc')).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })

    it('should throw error for zero product ID', async () => {
      await expect(productImageService.getProductImages(0)).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })

    it('should throw error for negative product ID', async () => {
      await expect(productImageService.getProductImages(-1)).rejects.toThrow(
        'Invalid product ID: must be a number'
      )
    })

    it('should throw error for invalid size in createImage', async () => {
      const invalidData = {
        product_id: 1,
        image_index: 1,
        size: 'invalid-size',
        url: 'https://example.com/image.webp',
        file_hash: 'abc123'
      }

      await expect(productImageService.createImage(invalidData)).rejects.toThrow(
        'Image validation failed'
      )
    })
  })
})
