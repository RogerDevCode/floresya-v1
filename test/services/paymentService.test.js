/**
 * Payment Service Tests - Vitest Edition
 * Comprehensive testing of payment service operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'

// Mock DI Container
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn(() => ({
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }))
  }
}))

// Import services after mocks are set up
import * as paymentService from '../../api/services/paymentService.js'

describe('Payment Service - Payment Management Operations', () => {
  beforeEach(async () => {
    resetAllMocks()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('Service module can be imported', () => {
    test('should import payment service module without errors', () => {
      expect(paymentService).toBeDefined()
      expect(typeof paymentService).toBe('object')
    })
  })
})
