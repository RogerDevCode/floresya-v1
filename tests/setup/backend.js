/**
 * Backend Test Setup
 * Global configuration for backend tests
 */

import { vi } from 'vitest'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_KEY = 'test-key'

// Mock supabase client globally
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: null, error: null }))
              }))
            }))
          }))
        }))
      }))
    }))
  },
  DB_SCHEMA: {
    products: {
      table: 'products',
      search: ['name', 'sku']
    }
  }
}))

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
