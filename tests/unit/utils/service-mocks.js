/**
 * Service Mocks Configuration
 * Comprehensive mock setup for all service tests
 */

import { vi } from 'vitest'
import { createRepositorySupabaseMock } from './repository-mocks.js'

/**
 * Create a complete service mock with repositories
 */
export function createServiceMock(options = {}) {
  const { products = [], users = [], orders = [] } = options

  const mockSupabase = createRepositorySupabaseMock()

  // Mock repositories
  const mockOrderRepository = {
    findAllWithFilters: vi.fn((_filters = {}, _options = {}) => Promise.resolve(orders)),
    findById: vi.fn(id => Promise.resolve(orders.find(o => o.id === id) || null)),
    findByUserId: vi.fn((userId, _options = {}) =>
      Promise.resolve(orders.filter(o => o.user_id === userId))
    ),
    create: vi.fn(orderData => Promise.resolve({ ...orderData, id: orders.length + 1 })),
    update: vi.fn((id, updateData) => Promise.resolve({ id, ...updateData })),
    updateStatus: vi.fn((id, status) => Promise.resolve({ id, status })),
    updatePaymentStatus: vi.fn((id, status) => Promise.resolve({ id, payment_status: status })),
    getStats: vi.fn(() =>
      Promise.resolve({
        total_orders: orders.length,
        pending_orders: orders.filter(o => o.status === 'pending').length,
        completed_orders: orders.filter(o => o.status === 'delivered').length
      })
    ),
    searchOrders: vi.fn(_query => Promise.resolve(orders)),
    softDelete: vi.fn(id => Promise.resolve({ id, active: false })),
    restore: vi.fn(id => Promise.resolve({ id, active: true })),
    count: vi.fn(() => Promise.resolve(orders.length)),
    exists: vi.fn(id => Promise.resolve(orders.some(o => o.id === id)))
  }

  const mockProductRepository = {
    findAll: vi.fn((_filters = {}, _options = {}) => Promise.resolve(products)),
    findById: vi.fn(id => Promise.resolve(products.find(p => p.id === id) || null)),
    findBySku: vi.fn(sku => Promise.resolve(products.find(p => p.sku === sku) || null)),
    create: vi.fn(productData => Promise.resolve({ ...productData, id: products.length + 1 })),
    update: vi.fn((id, updateData) => Promise.resolve({ id, ...updateData })),
    delete: vi.fn(id => Promise.resolve({ id, active: false })),
    softDelete: vi.fn(id => Promise.resolve({ id, active: false })),
    restore: vi.fn(id => Promise.resolve({ id, active: true })),
    findByOccasion: vi.fn(_occasionId => Promise.resolve(products)),
    count: vi.fn(() => Promise.resolve(products.length)),
    exists: vi.fn(id => Promise.resolve(products.some(p => p.id === id))),
    decrementStock: vi.fn((id, quantity) => Promise.resolve({ id, stock: 100 - quantity }))
  }

  const mockUserRepository = {
    findAll: vi.fn((_filters = {}, _options = {}) => Promise.resolve(users)),
    findById: vi.fn(id => Promise.resolve(users.find(u => u.id === id) || null)),
    findByEmail: vi.fn(email => Promise.resolve(users.find(u => u.email === email) || null)),
    create: vi.fn(userData => Promise.resolve({ ...userData, id: users.length + 1 })),
    update: vi.fn((id, updateData) => Promise.resolve({ id, ...updateData })),
    softDelete: vi.fn(id => Promise.resolve({ id, active: false })),
    restore: vi.fn(id => Promise.resolve({ id, active: true })),
    updateRole: vi.fn((id, role) => Promise.resolve({ id, role })),
    count: vi.fn(() => Promise.resolve(users.length)),
    exists: vi.fn(id => Promise.resolve(users.some(u => u.id === id))),
    findByEmailWithActive: vi.fn(email =>
      Promise.resolve(users.find(u => u.email === email) || null)
    )
  }

  return {
    supabase: mockSupabase,
    orderRepository: mockOrderRepository,
    productRepository: mockProductRepository,
    userRepository: mockUserRepository
  }
}

/**
 * Setup Product Service Mock
 */
export function setupProductServiceMock() {
  const mockProducts = [
    {
      id: 1,
      name: 'Test Product',
      sku: 'TEST-001',
      price_usd: 25.99,
      stock: 100,
      active: true,
      created_at: '2024-01-01T00:00:00.000Z'
    }
  ]

  const mocks = createServiceMock({ products: mockProducts })
  return {
    getAllProducts: vi.fn((_filters = {}, _includeDeactivated = false, _adminUserId = null) =>
      Promise.resolve(mockProducts)
    ),
    getProductById: vi.fn((id, _includeDeactivated = false, _adminUserId = null) =>
      Promise.resolve(mockProducts[0] || null)
    ),
    createProduct: vi.fn(productData => Promise.resolve({ ...productData, id: 1 })),
    updateProduct: vi.fn((id, productData) => Promise.resolve({ id, ...productData })),
    deleteProduct: vi.fn(id => Promise.resolve({ id, active: false })),
    decrementStock: vi.fn((id, quantity) => Promise.resolve({ id, stock: 100 - quantity })),
    getProductsByOccasion: vi.fn(_occasionId => Promise.resolve(mockProducts)),
    // Repositories
    orderRepository: mocks.orderRepository,
    productRepository: mocks.productRepository,
    userRepository: mocks.userRepository
  }
}

/**
 * Setup User Service Mock
 */
export function setupUserServiceMock() {
  const mockUsers = [
    {
      id: 1,
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+584141234567',
      role: 'customer',
      active: true,
      created_at: '2024-01-01T00:00:00.000Z'
    }
  ]

  const mocks = createServiceMock({ users: mockUsers })
  return {
    getAllUsers: vi.fn((_filters = {}, _includeDeactivated = false, _adminUserId = null) =>
      Promise.resolve(mockUsers)
    ),
    getUserById: vi.fn((id, _includeDeactivated = false, _adminUserId = null) =>
      Promise.resolve(mockUsers[0] || null)
    ),
    createUser: vi.fn(userData => Promise.resolve({ ...userData, id: 1 })),
    updateUser: vi.fn((id, userData) => Promise.resolve({ id, ...userData })),
    deleteUser: vi.fn(id => Promise.resolve({ id, active: false })),
    updateUserRole: vi.fn((id, role) => Promise.resolve({ id, role })),
    // Repositories
    orderRepository: mocks.orderRepository,
    productRepository: mocks.productRepository,
    userRepository: mocks.userRepository
  }
}

/**
 * Setup Order Service Mock
 */
export function setupOrderServiceMock() {
  const mockOrders = [
    {
      id: 1,
      user_id: 1,
      status: 'pending',
      total_amount_usd: 50.99,
      customer_name: 'Test Customer',
      created_at: '2024-01-01T00:00:00.000Z'
    }
  ]

  const mocks = createServiceMock({ orders: mockOrders })
  return {
    getAllOrders: vi.fn((_filters = {}, _includeDeactivated = false, _adminUserId = null) =>
      Promise.resolve(mockOrders)
    ),
    getOrderById: vi.fn((id, _includeDeactivated = false, _adminUserId = null) =>
      Promise.resolve(mockOrders[0] || null)
    ),
    createOrderWithItems: vi.fn(orderData => Promise.resolve({ ...orderData, id: 1 })),
    updateOrderStatus: vi.fn((id, status, _adminUserId = null) => Promise.resolve({ id, status })),
    confirmPayment: vi.fn((orderId, _paymentData, _adminUserId = null) =>
      Promise.resolve({ id: orderId, status: 'confirmed' })
    ),
    // Repositories
    orderRepository: mocks.orderRepository,
    productRepository: mocks.productRepository,
    userRepository: mocks.userRepository
  }
}
