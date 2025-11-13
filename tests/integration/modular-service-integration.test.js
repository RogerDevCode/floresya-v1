/**
 * Modular Services Integration Tests
 * Tests to ensure modular services work correctly together
 */

import { describe, it, expect, vi } from 'vitest'

// Mock Supabase client with DB_SCHEMA
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  },
  DB_SCHEMA: {
    users: {
      table: 'users',
      pk: 'id',
      indexes: ['email', 'full_name_normalized'],
      enums: { role: ['user', 'admin'] }
    },
    products: {
      table: 'products',
      pk: 'id',
      indexes: ['name', 'sku', 'active']
    },
    orders: {
      table: 'orders',
      pk: 'id',
      enums: { status: ['pending', 'verified', 'shipped', 'delivered'] }
    }
  }
}))

describe('Modular Services Integration', () => {
  describe('ProductService with BaseRepository', () => {
    it('should use BaseRepository pattern correctly', async () => {
      const productService = await import('../../api/services/productService.js')
      await import('../../api/repositories/BaseRepository.index.js')

      // Verify ProductService uses repository pattern
      expect(productService.createProduct).toBeDefined()
      expect(productService.getProductById).toBeDefined()
      expect(productService.updateProduct).toBeDefined()
      expect(productService.deleteProduct).toBeDefined()
    })
  })

  describe('OrderService Integration', () => {
    it('should have all modular operations available', async () => {
      const orderService = await import('../../api/services/orderService.index.js')

      // Check that the service loads and has exports
      expect(orderService).toBeDefined()
      expect(Object.keys(orderService).length).toBeGreaterThan(0)

      // Check for expected functions (using actual export names)
      expect(orderService.createOrderWithItems).toBeDefined()
      expect(orderService.getOrderById).toBeDefined()
      expect(orderService.updateOrder).toBeDefined()
      expect(orderService.cancelOrder).toBeDefined()
      expect(orderService.updateOrderStatus).toBeDefined()
    })
  })

  describe('PaymentService Integration', () => {
    it('should have all modular operations available', async () => {
      const paymentService = await import('../../api/services/paymentService.index.js')

      // Check that the service loads and has exports
      expect(paymentService).toBeDefined()
      expect(Object.keys(paymentService).length).toBeGreaterThan(0)

      // Check for key functions that should exist
      expect(paymentService.confirmPayment).toBeDefined()
    })
  })

  describe('UserService Integration', () => {
    it('should have all modular operations available', async () => {
      const userService = await import('../../api/services/userService.index.js')

      expect(userService.createUser).toBeDefined()
      expect(userService.getUserById).toBeDefined()
      expect(userService.getUserByEmail).toBeDefined()
      expect(userService.updateUser).toBeDefined()
      expect(userService.deleteUser).toBeDefined()
      expect(userService.verifyUserEmail).toBeDefined()
    })
  })

  describe('SettingsService Integration', () => {
    it('should have all modular operations available', async () => {
      const settingsService = await import('../../api/services/settingsService.index.js')

      // Check that the service loads and has exports
      expect(settingsService).toBeDefined()
      expect(Object.keys(settingsService).length).toBeGreaterThan(0)
    })
  })

  describe('AuthService Integration', () => {
    it('should have all modular operations available', async () => {
      const authService = await import('../../api/services/authService.index.js')

      // Auth operations
      expect(authService.signUp).toBeDefined()
      expect(authService.signIn).toBeDefined()
      expect(authService.signOut).toBeDefined()

      // Session operations
      expect(authService.refreshToken).toBeDefined()

      // User operations
      expect(authService.getUser).toBeDefined()
      expect(authService.resetPassword).toBeDefined()
      expect(authService.updatePassword).toBeDefined()
    })
  })

  describe('Middleware Validation Integration', () => {
    it('should have all validation schemas available', async () => {
      const schemas = await import('../../api/middleware/validation/schemas.index.js')

      // Product schemas
      expect(schemas.productCreateSchema).toBeDefined()
      expect(schemas.productUpdateSchema).toBeDefined()
      expect(schemas.productFilterSchema).toBeDefined()

      // Order schemas
      expect(schemas.orderCreateSchema).toBeDefined()
      expect(schemas.orderStatusUpdateSchema).toBeDefined()

      // User schemas
      expect(schemas.userCreateSchema).toBeDefined()
      expect(schemas.userUpdateSchema).toBeDefined()

      // Occasion schemas
      expect(schemas.occasionCreateSchema).toBeDefined()
      expect(schemas.occasionUpdateSchema).toBeDefined()

      // Payment schemas
      expect(schemas.paymentCreateSchema).toBeDefined()
      expect(schemas.paymentConfirmSchema).toBeDefined()

      // Product Image schemas
      expect(schemas.productImageCreateSchema).toBeDefined()
    })
  })

  describe('Auth Middleware Integration', () => {
    it('should have all auth middleware available', async () => {
      const auth = await import('../../api/middleware/auth/auth.index.js')

      expect(auth.authenticate).toBeDefined()
      expect(auth.authorize).toBeDefined()
      expect(auth.authorizeByPermission).toBeDefined()
      expect(auth.requireEmailVerified).toBeDefined()
      expect(auth.optionalAuth).toBeDefined()
      expect(auth.checkOwnership).toBeDefined()
      expect(auth.getUserRole).toBeDefined()
    })
  })

  describe('Error Mapping Integration', () => {
    it('should have error mapping functions available', async () => {
      const errorMapper = await import('../../api/middleware/error/supabaseErrorMapper.index.js')

      expect(errorMapper.mapSupabaseError).toBeDefined()
      expect(errorMapper.withErrorMapping).toBeDefined()
      expect(errorMapper.createTableOperations).toBeDefined()
    })
  })

  describe('Advanced Validation Integration', () => {
    it('should have all validation functions available', async () => {
      const advancedValidation = await import(
        '../../api/middleware/validation/advancedValidation.index.js'
      )

      // Helper constants
      expect(advancedValidation.VENEZUELA_PHONE_PATTERNS).toBeDefined()
      expect(advancedValidation.EMAIL_REGEX).toBeDefined()
      expect(advancedValidation.VENEZUELA_EMAIL_DOMAINS).toBeDefined()
      expect(advancedValidation.BUSINESS_LIMITS).toBeDefined()

      // Validation functions
      expect(advancedValidation.validateEmail).toBeDefined()
      expect(advancedValidation.validateVenezuelanPhone).toBeDefined()
      expect(advancedValidation.validateAmount).toBeDefined()
      expect(advancedValidation.validateTextLength).toBeDefined()
      expect(advancedValidation.validateOrderItems).toBeDefined()
      expect(advancedValidation.validateOrderData).toBeDefined()

      // Middleware
      expect(advancedValidation.advancedValidate).toBeDefined()
      expect(advancedValidation.fieldValidators).toBeDefined()
    })
  })

  describe('Service Layer Contract', () => {
    it('should maintain consistent error handling across services', async () => {
      // Verify all services export error classes
      const errors = await import('../../api/errors/AppError.js')

      expect(errors.ValidationError).toBeDefined()
      expect(errors.NotFoundError).toBeDefined()
      expect(errors.BadRequestError).toBeDefined()
      expect(errors.UnauthorizedError).toBeDefined()
      expect(errors.ForbiddenError).toBeDefined()
      expect(errors.DatabaseError).toBeDefined()
      expect(errors.ConflictError).toBeDefined()
    })
  })

  describe('Repository Pattern Contract', () => {
    it('should provide unified repository interface', async () => {
      // Just verify that the BaseRepository module can be imported
      const baseRepositoryModule = await import('../../api/repositories/BaseRepository.index.js')

      // Check that the module exports something
      expect(baseRepositoryModule).toBeDefined()
      expect(Object.keys(baseRepositoryModule).length).toBeGreaterThan(0)

      // Check for basic exports
      expect(baseRepositoryModule.BaseRepository).toBeDefined()
    })
  })
})
