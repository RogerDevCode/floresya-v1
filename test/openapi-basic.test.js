/**
 * Basic OpenAPI Tests
 * Verifies that OpenAPI documentation and basic validation is working
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import request from 'supertest'

// Mock Supabase client to avoid real DB connection
vi.mock('../api/services/supabaseClient.js', async () => {
  const { createSupabaseClientMock } = await import('./supabase-client/mocks/mocks.js')
  const mockSupabase = createSupabaseClientMock()
  return {
    supabase: mockSupabase,
    DB_SCHEMA: {
      products: { table: 'products' },
      users: { 
        table: 'users',
        enums: {
          role: ['user', 'admin']
        }
      },
      orders: { 
        table: 'orders',
        enums: {
          status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
        }
      },
      product_images: { table: 'product_images' },
      product_occasions: { table: 'product_occasions' },
      occasions: { table: 'occasions' },
      profiles: { table: 'profiles' },
      payment_methods: { table: 'payment_methods' },
      payments: { table: 'payments' },
      settings: { table: 'settings' }
    }
  }
})

// Mock authentication middleware to bypass security for basic testing
vi.mock('../api/middleware/auth/index.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    authenticate: (req, res, next) => {
      req.user = { id: 1, role: 'admin', email: 'admin@example.com' }
      next()
    },
    authorize: (...roles) => (req, res, next) => next(),
    requireAdmin: (req, res, next) => next()
  }
})

// Mock ProductRepository to avoid Supabase timeouts
vi.mock('../api/repositories/ProductRepository.js', () => {
  return {
    createProductRepository: () => ({
      findAllWithFilters: async () => [],
      count: async () => 0
    }),
    ProductRepository: class {
      static async create() { return new this() }
      async findAllWithFilters() { return [] }
      async count() { return 0 }
    }
  }
})

// Mock ProductService to avoid any other dependencies
vi.mock('../api/services/productService.js', () => {
  return {
    getAllProducts: async () => ({ data: [], count: 0 }),
    getProductById: async () => ({ id: 1 }),
    createProduct: async () => ({ id: 1 }),
    updateProduct: async () => ({ id: 1 }),
    deleteProduct: async () => ({ id: 1 }),
    getFeaturedProducts: async () => [],
    getCarouselProducts: async () => []
  }
})

// Mock DI Container to prevent real DB connections
vi.mock('../api/architecture/di-container.js', () => {
  return {
    initializeDIContainer: async () => {},
    DIContainer: {
      resolve: async () => ({})
    }
  }
})

// Mock OpenAPI Validator to prevent middleware issues
vi.mock('../api/middleware/api/index.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    initializeOpenApiValidator: async () => false
  }
})

// Mock performance middleware to prevent DB connection attempts
vi.mock('../api/middleware/performance/index.js', () => {
  return {
    withDatabaseCircuitBreaker: () => (req, res, next) => next(),
    circuitBreakerHealthCheck: (req, res) => res.json({ status: 'ok' })
  }
})

// Mock validation middleware to prevent issues
vi.mock('../api/middleware/validation/index.js', () => {
  return {
    validatePagination: (req, res, next) => next(),
    validateId: () => (req, res, next) => next(),
    validate: () => (req, res, next) => next(),
    sanitizeRequestData: (req, res, next) => next(),
    advancedValidate: () => (req, res, next) => next(),
    productCreateSchema: {},
    productUpdateSchema: {},
    orderCreateSchema: {},
    orderStatusUpdateSchema: {},
    paymentConfirmSchema: {},
    userCreateSchema: {},
    userUpdateSchema: {},
    occasionCreateSchema: {},
    occasionUpdateSchema: {},
    settingCreateSchema: {},
    settingUpdateSchema: {},
    productImageCreateSchema: {},
    productImageUpdateSchema: {}
  }
})

import app from '../api/app.js'

describe('OpenAPI Basic Functionality', () => {
  describe('Documentation Endpoints', () => {
    it('should serve OpenAPI documentation JSON', async () => {
      const response = await request(app).get('/api-docs.json').expect(200)

      expect(response.body).toBeDefined()
      expect(response.body.openapi).toBeDefined()
      expect(response.body.paths).toBeDefined()
      expect(response.body.components).toBeDefined()
    })

    it('should serve Swagger UI', async () => {
      const response = await request(app).get('/api-docs/').redirects(5)
      
      // Accept either 200 (if redirects followed) or 302 (if redirected to index.html)
      expect([200, 302]).toContain(response.status)
      if (response.status === 200) {
        expect(response.text).toContain('swagger-ui')
      }
    })
  })

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: 'healthy',
          timestamp: expect.any(String),
          uptime: expect.any(Number)
        },
        message: 'Service is running'
      })
    })
  })

  describe('Basic API Access', () => {
    it('should allow access to public endpoints', async () => {
      const response = await request(app).get('/api/products').expect(200)

      expect(response.body).toMatchObject({
        success: true
      })
    })

    it('should reject undefined endpoints', async () => {
      const response = await request(app).get('/api/nonexistent').expect(404)

      expect(response.body).toMatchObject({
        success: false
      })
    })
  })

  describe('OpenAPI Spec Structure', () => {
    it('should include basic OpenAPI structure', async () => {
      const response = await request(app).get('/api-docs.json').expect(200)

      const spec = response.body

      // Check OpenAPI version
      expect(spec.openapi).toMatch(/^3\.\d+\.\d+$/)

      // Check info section
      expect(spec.info).toBeDefined()
      expect(spec.info.title).toBe('FloresYa API')
      expect(spec.info.version).toBeDefined()

      // Check paths
      expect(spec.paths).toBeDefined()
      expect(typeof spec.paths).toBe('object')

      // Check components
      expect(spec.components).toBeDefined()
      expect(spec.components.schemas).toBeDefined()
      expect(spec.components.securitySchemes).toBeDefined()
    })

    it('should include security schemes', async () => {
      const response = await request(app).get('/api-docs.json').expect(200)

      const securitySchemes = response.body.components?.securitySchemes
      expect(securitySchemes).toBeDefined()
      expect(securitySchemes.bearerAuth).toBeDefined()
      expect(securitySchemes.bearerAuth.type).toBe('http')
      expect(securitySchemes.bearerAuth.scheme).toBe('bearer')
    })
  })
})
