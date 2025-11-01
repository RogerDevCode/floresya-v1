/**
 * Middleware Index - Centralized Exports
 *
 * Organized into logical categories for better maintainability and clarity.
 * Each category has its own directory with an index.js file.
 *
 * Categories:
 * - auth: Authentication & authorization middleware
 * - validation: Request validation & sanitization middleware
 * - security: Security middleware (CORS, rate limiting, etc.)
 * - error: Error handling & mapping middleware
 * - performance: Performance & reliability middleware (caching, circuit breaker)
 * - api: API-specific middleware (OpenAPI validation, response formatting)
 * - core: Core/essential middleware
 * - utilities: General utility middleware
 *
 * Usage:
 *   import { authenticate, validate, rateLimit } from '../middleware/index.js'
 *   // or import specific categories:
 *   import { authenticate } from '../middleware/auth/index.js'
 *   import { validate } from '../middleware/validation/index.js'
 *
 * @category Middleware
 */

// Core middleware (essential)
export * from './core/index.js'

// Authentication & Authorization
export * from './auth/index.js'

// Validation & Sanitization
export * from './validation/index.js'

// Security middleware
export * from './security/index.js'

// Error handling
export * from './error/index.js'

// Performance & reliability
export * from './performance/index.js'

// API-specific middleware
export * from './api/index.js'

// Utilities
export * from './utilities/index.js'
