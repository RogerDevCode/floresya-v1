/**
 * Middleware Mocks
 * Provides comprehensive mocking for Express middleware
 */

// import { vi } from 'vitest'

export const mockAsyncHandler = fn => fn
export const mockWithErrorMapping = fn => fn

// Mock error classes
export const mockSupabaseErrorMapper = {
  mapError: error => error
}

// Mock error handler
export const mockErrorHandler = {
  asyncHandler: mockAsyncHandler,
  withErrorMapping: mockWithErrorMapping
}

// Complete middleware mock
export const middlewareMocks = {
  asyncHandler: mockAsyncHandler,
  withErrorMapping: mockWithErrorMapping,
  SupabaseErrorMapper: mockSupabaseErrorMapper
}