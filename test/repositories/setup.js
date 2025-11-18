/**
 * Repository Tests Setup - Vitest Edition
 * Centralized mocking utilities for repository testing
 * Following KISS principle and Supabase best practices
 */

import { vi } from 'vitest'

// Global test data for repositories
export const testData = {
  users: {
    active: {
      id: 1,
      email: 'user@example.com',
      password_hash: 'hashed_password',
      full_name: 'John Doe',
      phone: '+1234567890',
      role: 'user',
      active: true,
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      full_name_normalized: 'john doe',
      email_normalized: 'user@example.com'
    },
    inactive: {
      id: 2,
      email: 'inactive@example.com',
      password_hash: 'hashed_password',
      full_name: 'Jane Doe',
      phone: '+1234567891',
      role: 'user',
      active: false,
      email_verified: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      full_name_normalized: 'jane doe',
      email_normalized: 'inactive@example.com'
    },
    admin: {
      id: 3,
      email: 'admin@example.com',
      password_hash: 'hashed_password',
      full_name: 'Admin User',
      phone: '+1234567892',
      role: 'admin',
      active: true,
      email_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      full_name_normalized: 'admin user',
      email_normalized: 'admin@example.com'
    }
  },
  orders: {
    pending: {
      id: 1,
      user_id: 1,
      customer_email: 'customer@example.com',
      customer_name: 'Customer Name',
      delivery_address: 'Test Address',
      status: 'pending',
      total_amount_usd: 29.99,
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    delivered: {
      id: 2,
      user_id: 1,
      customer_email: 'customer2@example.com',
      customer_name: 'Customer Two',
      delivery_address: 'Test Address 2',
      status: 'delivered',
      total_amount_usd: 49.99,
      active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  },
  products: {
    active: {
      id: 1,
      name: 'Test Product',
      description: 'A test product',
      price_usd: 29.99,
      stock: 100,
      active: true,
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    inactive: {
      id: 2,
      name: 'Inactive Product',
      description: 'An inactive product',
      price_usd: 19.99,
      stock: 0,
      active: false,
      featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  payments: {
    completed: {
      id: 1,
      order_id: 1,
      amount_usd: 29.99,
      currency: 'USD',
      status: 'completed',
      payment_method: 'card',
      transaction_id: 'txn_123',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    pending: {
      id: 2,
      order_id: 2,
      amount_usd: 49.99,
      currency: 'USD',
      status: 'pending',
      payment_method: 'paypal',
      transaction_id: null,
      active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  },
  paymentMethods: {
    card: {
      id: 1,
      user_id: 1,
      type: 'card',
      provider: 'stripe',
      last_four: '4242',
      expiry_month: 12,
      expiry_year: 2025,
      is_default: true,
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    paypal: {
      id: 2,
      user_id: 1,
      type: 'paypal',
      provider: 'paypal',
      paypal_email: 'user@example.com',
      is_default: false,
      active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  },
  productImages: {
    primary: {
      id: 1,
      product_id: 1,
      url: 'https://example.com/image1.jpg',
      alt_text: 'Product image',
      is_primary: true,
      sort_order: 1,
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    secondary: {
      id: 2,
      product_id: 1,
      url: 'https://example.com/image2.jpg',
      alt_text: 'Secondary image',
      is_primary: false,
      sort_order: 2,
      active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  },
  settings: {
    siteName: {
      id: 1,
      key: 'site_name',
      value: 'FloresYa',
      type: 'string',
      category: 'general',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    maintenanceMode: {
      id: 2,
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'system',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  },
  occasions: {
    birthday: {
      id: 1,
      name: 'Birthday',
      description: 'Birthday celebration',
      active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    wedding: {
      id: 2,
      name: 'Wedding',
      description: 'Wedding celebration',
      active: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  }
}

// Mock Supabase client factory
export function createMockSupabase() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      and: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn()
    })),
    rpc: vi.fn(),
    raw: vi.fn((sql, params) => sql.replace('?', params[0]))
  }
}

// Reset all mocks between tests
export function resetAllMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

// Setup mock responses for common scenarios
export function setupMockResponse(mockQuery, response) {
  mockQuery.mockResolvedValue(response)
  return mockQuery
}

// Setup mock error responses
export function setupMockError(mockQuery, error) {
  mockQuery.mockResolvedValue({ data: null, error })
  return mockQuery
}

// Setup mock single response
export function setupMockSingle(mockQuery, data, error = null) {
  mockQuery.mockResolvedValue({ data, error })
  return mockQuery
}

// Setup mock array response
export function setupMockArray(mockQuery, data, error = null) {
  mockQuery.mockResolvedValue({ data, error })
  return mockQuery
}

// Common error codes for testing
export const mockErrors = {
  notFound: { code: 'PGRST116', message: 'No rows found' },
  uniqueViolation: { code: '23505', message: 'Duplicate key value' },
  foreignKeyViolation: { code: '23503', message: 'Foreign key violation' },
  notNullViolation: { code: '23502', message: 'Not null violation' },
  generic: { code: '500', message: 'Internal server error' }
}
