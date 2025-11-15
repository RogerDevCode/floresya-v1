/**
 * Procesado por B
 */

/**
 * Comprehensive Test Utilities for Supabase Mocking
 * Provides complete mocking strategy for database operations, auth, and storage
 * Supports both unit tests (with DI container) and integration tests
 * Follows KISS, DRY, and SSOT principles
 */

import request from 'supertest'
import app from '../app.js'
import { vi } from 'vitest'

/**
 * Mock Data Factories
 * Generate consistent test data across all tests
 */
export const mockDataFactories = {
  user: (overrides = {}) => ({
    id: 1,
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+56912345678',
    role: 'user',
    active: true,
    email_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  product: (overrides = {}) => ({
    id: 1,
    name: 'Test Product',
    summary: 'Test product summary',
    description: 'Test product description',
    price_usd: 25.99,
    price_ves: 950.5,
    stock: 100,
    sku: 'TEST001',
    active: true,
    featured: false,
    carousel_order: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  order: (overrides = {}) => ({
    id: 1,
    user_id: 1,
    customer_email: 'customer@example.com',
    customer_name: 'Test Customer',
    customer_phone: '+56987654321',
    delivery_address: 'Test Address 123',
    delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    delivery_time_slot: '10:00',
    delivery_notes: 'Test notes',
    status: 'pending',
    total_amount_usd: 25.99,
    total_amount_ves: 950.5,
    currency_rate: 36.7,
    notes: null,
    admin_notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  occasion: (overrides = {}) => ({
    id: 1,
    name: 'Birthday',
    description: 'Birthday celebration',
    slug: 'birthday',
    active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  payment: (overrides = {}) => ({
    id: 1,
    order_id: 1,
    payment_method_id: 1,
    user_id: 1,
    amount_usd: 25.99,
    amount_ves: 950.5,
    currency_rate: 36.7,
    status: 'pending',
    payment_method_name: 'Bank Transfer',
    transaction_id: null,
    reference_number: 'REF001',
    payment_details: null,
    receipt_image_url: null,
    admin_notes: null,
    payment_date: null,
    confirmed_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  })
}

/**
 * Creates a comprehensive mock Supabase query builder
 * Implements fluent interface for method chaining with advanced filtering
 * @param {Object} options - Mock options
 * @param {Array|Object} options.data - Data to return (array for queries, object for single)
 * @param {Object} options.error - Error to return
 * @param {Object} options.queryState - Internal state for query building
 * @returns {Object} Mock query builder
 */
export const createMockQueryBuilder = (options = {}) => {
  const { data = null, error = null } = options

  const queryBuilder = {
    // Query building state
    _filters: [],
    _sorts: [],
    _limit: null,
    _offset: 0,
    _select: '*',

    // Query building methods (return this for chaining)
    select: vi.fn(function (fields) {
      this._select = fields || '*'
      return this
    }),
    insert: vi.fn(function (data) {
      this._operation = 'insert'
      this._data = data
      return this
    }),
    update: vi.fn(function (data) {
      this._operation = 'update'
      this._data = data
      return this
    }),
    delete: vi.fn(function () {
      this._operation = 'delete'
      return this
    }),
    from: vi.fn().mockReturnThis(),
    eq: vi.fn(function (column, value) {
      this._filters.push({ type: 'eq', column, value })
      return this
    }),
    neq: vi.fn(function (column, value) {
      this._filters.push({ type: 'neq', column, value })
      return this
    }),
    gt: vi.fn(function (column, value) {
      this._filters.push({ type: 'gt', column, value })
      return this
    }),
    gte: vi.fn(function (column, value) {
      this._filters.push({ type: 'gte', column, value })
      return this
    }),
    lt: vi.fn(function (column, value) {
      this._filters.push({ type: 'lt', column, value })
      return this
    }),
    lte: vi.fn(function (column, value) {
      this._filters.push({ type: 'lte', column, value })
      return this
    }),
    like: vi.fn(function (column, pattern) {
      this._filters.push({ type: 'like', column, pattern })
      return this
    }),
    ilike: vi.fn(function (column, pattern) {
      this._filters.push({ type: 'ilike', column, pattern })
      return this
    }),
    or: vi.fn(function (conditions) {
      this._filters.push({ type: 'or', conditions })
      return this
    }),
    and: vi.fn(function (conditions) {
      this._filters.push({ type: 'and', conditions })
      return this
    }),
    not: vi.fn(function (column, value) {
      this._filters.push({ type: 'not', column, value })
      return this
    }),
    is: vi.fn(function (column, value) {
      this._filters.push({ type: 'is', column, value })
      return this
    }),
    in: vi.fn(function (column, values) {
      this._filters.push({ type: 'in', column, values })
      return this
    }),
    contains: vi.fn(function (column, value) {
      this._filters.push({ type: 'contains', column, value })
      return this
    }),
    containedBy: vi.fn(function (column, value) {
      this._filters.push({ type: 'containedBy', column, value })
      return this
    }),
    range: vi.fn(function (column, range) {
      this._filters.push({ type: 'range', column, range })
      return this
    }),
    order: vi.fn(function (column, options = {}) {
      this._sorts.push({ column, ...options })
      return this
    }),
    limit: vi.fn(function (count) {
      this._limit = count
      return this
    }),
    rangeLimit: vi.fn(function (start, end) {
      this._offset = start
      this._limit = end - start + 1
      return this
    }),
    raw: vi.fn().mockReturnThis(),

    // Execute methods
    single: vi.fn().mockResolvedValue({
      data: Array.isArray(data) ? data[0] : data,
      error
    }),
    maybeSingle: vi.fn().mockResolvedValue({
      data: Array.isArray(data) ? data[0] : data,
      error
    }),
    rpc: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn().mockImplementation(resolve => resolve({ data, error }))
  }

  // Make sure all methods return the queryBuilder for chaining
  Object.keys(queryBuilder).forEach(key => {
    if (
      typeof queryBuilder[key] === 'function' &&
      !['single', 'maybeSingle', 'rpc', 'then', 'raw'].includes(key)
    ) {
      queryBuilder[key].mockReturnValue(queryBuilder)
    }
  })

  return queryBuilder
}

/**
 * Creates a comprehensive mock Supabase client
 * Supports database operations, auth, and storage
 * @param {Object} config - Mock configuration
 * @param {Object} config.mockResponses - Map of table/function names to mock responses
 * @param {Object} config.authResponses - Mock auth responses
 * @param {Object} config.storageResponses - Mock storage responses
 * @returns {Object} Mock Supabase client
 */
export const createMockSupabaseClient = (config = {}) => {
  const { mockResponses = {}, authResponses = {}, storageResponses = {} } = config

  // Mock auth client
  const mockAuth = {
    signUp: vi
      .fn()
      .mockResolvedValue(
        authResponses.signUp || { data: { user: null, session: null }, error: null }
      ),
    signInWithPassword: vi
      .fn()
      .mockResolvedValue(
        authResponses.signIn || { data: { user: null, session: null }, error: null }
      ),
    signOut: vi.fn().mockResolvedValue(authResponses.signOut || { error: null }),
    getUser: vi
      .fn()
      .mockResolvedValue(authResponses.getUser || { data: { user: null }, error: null }),
    getSession: vi
      .fn()
      .mockResolvedValue(authResponses.getSession || { data: { session: null }, error: null }),
    refreshSession: vi
      .fn()
      .mockResolvedValue(authResponses.refreshSession || { data: { session: null }, error: null }),
    resetPasswordForEmail: vi
      .fn()
      .mockResolvedValue(authResponses.resetPassword || { error: null }),
    updateUser: vi
      .fn()
      .mockResolvedValue(authResponses.updateUser || { data: { user: null }, error: null }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  }

  // Mock storage client
  const mockStorage = {
    from: vi.fn(bucket => ({
      upload: vi
        .fn()
        .mockResolvedValue(storageResponses.upload || { data: { path: 'test-path' }, error: null }),
      download: vi
        .fn()
        .mockResolvedValue(storageResponses.download || { data: new Blob(), error: null }),
      getPublicUrl: vi
        .fn()
        .mockReturnValue(
          storageResponses.getPublicUrl || { data: { publicUrl: 'https://test-url.com' } }
        ),
      remove: vi.fn().mockResolvedValue(storageResponses.remove || { data: null, error: null }),
      list: vi.fn().mockResolvedValue(storageResponses.list || { data: [], error: null }),
      createSignedUrl: vi.fn().mockResolvedValue(
        storageResponses.createSignedUrl || {
          data: { signedUrl: 'https://signed-url.com' },
          error: null
        }
      ),
      createSignedUrls: vi.fn().mockResolvedValue(
        storageResponses.createSignedUrls || {
          data: [{ signedUrl: 'https://signed-url.com' }],
          error: null
        }
      )
    }))
  }

  // Mock database client
  const mockClient = {
    from: vi.fn(table => {
      const response = mockResponses[table] || { data: null, error: null }
      return createMockQueryBuilder(response)
    }),
    rpc: vi.fn(functionName => {
      const response = mockResponses[functionName] || { data: null, error: null }
      return createMockQueryBuilder(response)
    }),
    auth: mockAuth,
    storage: mockStorage
  }

  return mockClient
}

/**
 * Database Simulation Utilities for Integration Tests
 * Provides in-memory database simulation with CRUD operations
 */
export class MockDatabase {
  constructor() {
    this.tables = new Map()
    this.reset()
  }

  reset() {
    this.tables.clear()
    // Initialize with empty arrays for common tables
    const tables = [
      'users',
      'products',
      'orders',
      'payments',
      'occasions',
      'product_images',
      'order_items',
      'settings',
      'payment_methods'
    ]
    tables.forEach(table => this.tables.set(table, []))
  }

  // CRUD operations
  async findAll(table, filters = {}, options = {}) {
    let data = [...(this.tables.get(table) || [])]

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        data = data.filter(item => item[key] === value)
      }
    })

    // Apply sorting
    if (options.orderBy) {
      const { column, ascending = true } = options.orderBy
      data.sort((a, b) => {
        const aVal = a[column]
        const bVal = b[column]
        if (aVal < bVal) {
          return ascending ? -1 : 1
        }
        if (aVal > bVal) {
          return ascending ? 1 : -1
        }
        return 0
      })
    }

    // Apply pagination
    const offset = options.offset || 0
    const limit = options.limit || data.length
    data = data.slice(offset, offset + limit)

    return { data, error: null }
  }

  async findById(table, id) {
    const data = this.tables.get(table)?.find(item => item.id === id) || null
    return { data, error: data ? null : { code: 'PGRST116', message: 'Not found' } }
  }

  async create(table, item) {
    const items = this.tables.get(table) || []
    const newItem = { ...item, id: Math.max(...items.map(i => i.id || 0), 0) + 1 }
    items.push(newItem)
    this.tables.set(table, items)
    return { data: newItem, error: null }
  }

  async update(table, id, updates) {
    const items = this.tables.get(table) || []
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
    }
    items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() }
    return { data: items[index], error: null }
  }

  async delete(table, id) {
    const items = this.tables.get(table) || []
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      return { data: null, error: { code: 'PGRST116', message: 'Not found' } }
    }
    const deletedItem = items.splice(index, 1)[0]
    return { data: deletedItem, error: null }
  }

  // Bulk operations
  async bulkCreate(table, items) {
    const results = []
    for (const item of items) {
      const result = await this.create(table, item)
      results.push(result)
    }
    return results
  }

  async bulkUpdate(table, updates) {
    const results = []
    for (const { id, data } of updates) {
      const result = await this.update(table, id, data)
      results.push(result)
    }
    return results
  }

  // Utility methods
  seed(table, data) {
    this.tables.set(table, [...data])
  }

  getTable(table) {
    return [...(this.tables.get(table) || [])]
  }

  clearTable(table) {
    this.tables.set(table, [])
  }
}

// Global mock database instance for integration tests
export const mockDatabase = new MockDatabase()

/**
 * Creates a test user for integration tests
 * @returns {Object} Created user data
 */
export const createTestUser = async () => {
  const timestamp = Date.now()
  const testUser = {
    email: `testuser${timestamp}@example.com`,
    full_name: 'Test User',
    phone: `+569${timestamp.toString().slice(-8)}`,
    password_hash: 'TestPassword123!',
    role: 'user',
    email_verified: true
  }

  const adminToken = getAdminToken()
  const response = await request(app)
    .post('/api/users')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testUser)

  if (response.status !== 201) {
    throw new Error(`Failed to create test user: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test user
 * @param {number} userId - User ID to delete
 */
export const deleteTestUser = async userId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/users/${userId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test product for integration tests
 * @returns {Object} Created product data
 */
export const createTestProduct = async () => {
  const timestamp = Date.now()
  const testProduct = {
    product: {
      name: `Test Product ${timestamp}`,
      price_usd: 25.99,
      summary: 'Test product for integration tests',
      description: 'This is a test product created for integration testing',
      price_ves: 950.5,
      stock: 100,
      sku: `TEST${timestamp}`,
      featured: false
    }
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testProduct)

  if (response.status !== 201) {
    console.error('Test product creation failed:', response.body)
    throw new Error(`Failed to create test product: ${response.body.error || response.text}`)
  }

  return response.body.data
}

/**
 * Deletes a test product
 * @param {number} productId - Product ID to delete
 */
export const deleteTestProduct = async productId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/products/${productId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test occasion for integration tests
 * @returns {Object} Created occasion data
 */
export const createTestOccasion = async () => {
  const timestamp = Date.now()
  const testOccasion = {
    name: `Test Occasion ${timestamp}`,
    description: 'Test occasion for integration tests',
    slug: `test-occasion-${timestamp}`,
    display_order: timestamp % 100
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/occasions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testOccasion)

  if (response.status !== 201) {
    throw new Error(`Failed to create test occasion: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test occasion
 * @param {number} occasionId - Occasion ID to delete
 */
export const deleteTestOccasion = async occasionId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/occasions/${occasionId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test order for integration tests
 * @param {number} userId - User ID for the order
 * @param {number} productId - Product ID for the order
 * @returns {Object} Created order data
 */
export const createTestOrder = async (userId, productId) => {
  const testOrder = {
    order: {
      user_id: userId,
      delivery_address: 'Test Address 123',
      delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      delivery_time: '10:00',
      special_instructions: 'Handle with care',
      total_usd: 25.99,
      total_ves: 950.5
    },
    items: [
      {
        product_id: productId,
        quantity: 1,
        price_usd: 25.99,
        price_ves: 950.5
      }
    ]
  }

  const response = await request(app).post('/api/orders').send(testOrder)

  if (response.status !== 201) {
    throw new Error(`Failed to create test order: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Cancels a test order
 * @param {number} orderId - Order ID to cancel
 */
export const cancelTestOrder = async orderId => {
  const response = await request(app)
    .patch(`/api/orders/${orderId}/cancel`)
    .send({ notes: 'Cancelled by test cleanup' })

  if (response.status !== 200) {
    throw new Error(`Failed to cancel test order: ${response.body.error}`)
  }
}

/**
 * Creates a test payment method for integration tests
 * @returns {Object} Created payment method data
 */
export const createTestPaymentMethod = async () => {
  const timestamp = Date.now()
  const testPaymentMethod = {
    name: `Test Payment Method ${timestamp}`,
    type: 'bank_transfer',
    description: 'Test payment method for integration tests',
    account_info: `0123-4567-8901-${timestamp.toString().slice(-4)}`,
    display_order: timestamp % 100
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/payment-methods')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testPaymentMethod)

  if (response.status !== 201) {
    throw new Error(`Failed to create test payment method: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test payment method
 * @param {number} paymentMethodId - Payment method ID to delete
 */
export const deleteTestPaymentMethod = async paymentMethodId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/payment-methods/${paymentMethodId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Creates a test product image for integration tests
 * @param {number} productId - Product ID for the image
 * @returns {Object} Created product image data
 */
export const createTestProductImage = async productId => {
  const timestamp = Date.now()
  const testProductImage = {
    product_id: productId,
    image_url: `https://example.com/test-image-${timestamp}.jpg`,
    alt_text: `Test image ${timestamp}`,
    display_order: 1,
    is_primary: true
  }

  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
  const response = await request(app)
    .post('/api/product-images')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(testProductImage)

  if (response.status !== 201) {
    throw new Error(`Failed to create test product image: ${response.body.error}`)
  }

  return response.body.data
}

/**
 * Deletes a test product image
 * @param {number} imageId - Product image ID to delete
 */
export const deleteTestProductImage = async imageId => {
  const adminToken = process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'

  await request(app)
    .delete(`/api/product-images/${imageId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200)
}

/**
 * Gets admin authentication token for tests
 * @returns {string} Admin token
 */
export const getAdminToken = () => {
  // Use the mock token defined in auth middleware for development
  return process.env.TEST_ADMIN_TOKEN || 'dev-mock-token-admin-floresya'
}

/**
 * Creates a complete test scenario with user, product, occasion, and order
 * @returns {Object} Test scenario data
 */
export const createTestScenario = async () => {
  try {
    // Create test entities
    const user = await createTestUser()
    const product = await createTestProduct()
    const occasion = await createTestOccasion()
    const order = await createTestOrder(user.id, product.id)

    return {
      user,
      product,
      occasion,
      order,
      cleanup: async () => {
        // Cleanup in reverse order
        try {
          if (order?.id) {
            await cancelTestOrder(order.id)
          }
          if (product?.id) {
            await deleteTestProduct(product.id)
          }
          if (occasion?.id) {
            await deleteTestOccasion(occasion.id)
          }
          if (user?.id) {
            await deleteTestUser(user.id)
          }
        } catch (error) {
          console.error('Error during test cleanup:', error)
        }
      }
    }
  } catch (error) {
    throw new Error(`Failed to create test scenario: ${error.message}`)
  }
}
