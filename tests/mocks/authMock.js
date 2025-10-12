/**
 * Authentication Mock for Tests
 * Provides mock authentication for testing security features
 */

import { vi } from 'vitest'

// Mock user data for testing
export const mockUsers = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@floresya.local',
    user_metadata: {
      full_name: 'Admin User',
      phone: '+584141234567',
      role: 'admin'
    },
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  customer: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'customer@floresya.local',
    user_metadata: {
      full_name: 'Customer User',
      phone: '+584141234568',
      role: 'user'
    },
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
}

// Mock getUser function
export const mockGetUser = vi.fn(token => {
  if (token === 'mock-admin-token') {
    return Promise.resolve(mockUsers.admin)
  } else if (token === 'mock-customer-token') {
    return Promise.resolve(mockUsers.customer)
  } else {
    const error = new Error('Invalid or expired token')
    error.name = 'UnauthorizedError'
    error.statusCode = 401
    return Promise.reject(error)
  }
})

// Setup mock for authService
vi.mock('../../api/services/authService.js', () => ({
  getUser: mockGetUser
}))
