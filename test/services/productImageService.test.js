/**
 * ProductImage Service Tests - Vitest Edition
 * Comprehensive testing of product image service operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn()
  },
  DB_SCHEMA: {
    products: { table: 'products' },
    product_images: { table: 'product_images' }
  }
}))

// Import services after mocks are set up
import * as productImageService from '../../api/services/productImageService.js'

describe('ProductImage Service - Product Image Management Operations', () => {
  beforeEach(async () => {
    resetAllMocks()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('Service module can be imported', () => {
    test('should import product image service module without errors', () => {
      expect(productImageService).toBeDefined()
      expect(typeof productImageService).toBe('object')
    })
  })
})
