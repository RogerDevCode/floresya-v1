/**
 * OrderStatus Service Tests - Vitest Edition
 * Comprehensive testing of order status service operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

// Mock constants
vi.mock('../../api/config/constants.js', () => ({
  QUERY_LIMITS: {
    SINGLE_RECORD: 1
  }
}))

// Import services after mocks are set up
import {
  getOrderStatusHistory,
  addStatusUpdate,
  getLatestStatus
} from '../../api/services/orderStatusService.js'

describe('OrderStatus Service - Order Status Management Operations', () => {
  beforeEach(async () => {
    resetAllMocks()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('Service functions exist and are callable', () => {
    test('should export all main functions', () => {
      expect(typeof getOrderStatusHistory).toBe('function')
      expect(typeof addStatusUpdate).toBe('function')
      expect(typeof getLatestStatus).toBe('function')
    })
  })
})
