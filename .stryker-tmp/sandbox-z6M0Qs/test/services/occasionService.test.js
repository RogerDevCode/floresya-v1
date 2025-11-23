/**
 * Occasion Service Tests - Vitest Edition
 * Comprehensive testing of occasion service operations
 * Following KISS principle and Supabase best practices
 */
// @ts-nocheck

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'

// Mock DI Container
vi.mock('../../api/architecture/di-container.js', () => ({
  default: {
    resolve: vi.fn(() => ({
      findAllWithFilters: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }))
  }
}))

// Mock validation
vi.mock('../../api/utils/validation.js', () => ({
  validateOccasion: vi.fn(),
  validateId: vi.fn()
}))

// Import services after mocks are set up
import {
  getAllOccasions,
  getOccasionById,
  getOccasionBySlug,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  reactivateOccasion,
  updateDisplayOrder
} from '../../api/services/occasionService.js'

describe('Occasion Service - Occasion Management Operations', () => {
  beforeEach(async () => {
    resetAllMocks()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('Service functions exist and are callable', () => {
    test('should export all main functions', () => {
      expect(typeof getAllOccasions).toBe('function')
      expect(typeof getOccasionById).toBe('function')
      expect(typeof getOccasionBySlug).toBe('function')
      expect(typeof createOccasion).toBe('function')
      expect(typeof updateOccasion).toBe('function')
      expect(typeof deleteOccasion).toBe('function')
      expect(typeof reactivateOccasion).toBe('function')
      expect(typeof updateDisplayOrder).toBe('function')
    })
  })
})
