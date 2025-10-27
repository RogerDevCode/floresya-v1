/**
 * Mock ErrorHandler for Testing
 * Provides mock implementations of error handling functions
 */

import { vi } from 'vitest'

export const asyncHandler = fn => fn
export const errorHandler = vi.fn((err, req, res, _next) => {
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  })
})
export const notFoundHandler = vi.fn((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'Route not found'
  })
})

export default {
  asyncHandler,
  errorHandler,
  notFoundHandler
}
