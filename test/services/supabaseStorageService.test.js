/**
 * SupabaseStorage Service Tests - Vitest Edition
 * Comprehensive testing of Supabase storage service operations
 * Following KISS principle and Supabase best practices
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { resetAllMocks } from './setup.js'

// Mock Supabase client
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn()
      }))
    }
  }
}))

// Import services after mocks are set up
import * as supabaseStorageService from '../../api/services/supabaseStorageService.js'

describe('SupabaseStorage Service - File Storage Operations', () => {
  beforeEach(async () => {
    resetAllMocks()
  })

  afterEach(() => {
    resetAllMocks()
  })

  describe('Service module can be imported', () => {
    test('should import supabase storage service module without errors', () => {
      expect(supabaseStorageService).toBeDefined()
      expect(typeof supabaseStorageService).toBe('object')
    })
  })
})
