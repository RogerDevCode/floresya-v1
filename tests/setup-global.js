/**
 * Global Test Setup
 * Se ejecuta antes de todos los tests
 * Configura mocks globales de Supabase y DI Container
 */

import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import DIContainer from '../api/architecture/di-container.js'
import { createProductRepository } from '../api/repositories/ProductRepository.js'
import { createUserRepository } from '../api/repositories/UserRepository.js'
import { createOrderRepository } from '../api/repositories/OrderRepository.js'
import { createPaymentRepository } from '../api/repositories/PaymentRepository.js'
import { createPaymentMethodRepository } from '../api/repositories/PaymentMethodRepository.js'
import { createSettingsRepository } from '../api/repositories/SettingsRepository.js'
import { createProductImageRepository } from '../api/repositories/ProductImageRepository.js'
import { createOccasionRepository } from '../api/repositories/OccasionRepository.js'

// Mock clinic to prevent import issues in tests
vi.mock('clinic', () => ({
  default: vi.fn(() => ({
    on: vi.fn(),
    destroy: vi.fn(),
    outputPath: '/mock/path'
  }))
}))

// Mock Supabase client globally
vi.mock('../api/services/supabaseClient.js', () => {
  // Create mock query chain following Supabase client structure
  const createMockQuery = () => ({
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
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    raw: vi.fn(() => 'mocked_raw_value'),
    single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null }))
  })

  const mockSupabase = {
    from: vi.fn(() => createMockQuery()),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null })
      }))
    },
    raw: vi.fn(() => 'mocked_raw_value')
  }

  return {
    supabase: mockSupabase,
    DB_SCHEMA: {
      products: {
        table: 'products',
        pk: 'id',
        columns: [
          'id',
          'name',
          'summary',
          'description',
          'price_usd',
          'price_ves',
          'stock',
          'sku',
          'active',
          'featured',
          'carousel_order',
          'created_at',
          'updated_at',
          'name_normalized',
          'description_normalized'
        ]
      },
      users: {
        table: 'users',
        pk: 'id',
        enums: {
          role: ['user', 'admin']
        },
        columns: [
          'id',
          'email',
          'password_hash',
          'full_name',
          'phone',
          'role',
          'active',
          'email_verified',
          'created_at',
          'updated_at',
          'full_name_normalized',
          'email_normalized'
        ]
      },
      orders: {
        table: 'orders',
        pk: 'id',
        enums: {
          status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
        },
        columns: [
          'id',
          'user_id',
          'customer_email',
          'customer_name',
          'customer_phone',
          'delivery_address',
          'delivery_date',
          'delivery_time_slot',
          'delivery_notes',
          'status',
          'total_amount_usd',
          'total_amount_ves',
          'currency_rate',
          'notes',
          'admin_notes',
          'created_at',
          'updated_at',
          'customer_name_normalized',
          'customer_email_normalized'
        ]
      },
      order_items: {
        table: 'order_items',
        pk: 'id',
        columns: [
          'id',
          'order_id',
          'product_id',
          'product_name',
          'product_summary',
          'unit_price_usd',
          'unit_price_ves',
          'quantity',
          'subtotal_usd',
          'subtotal_ves',
          'created_at',
          'updated_at'
        ]
      },
      payments: {
        table: 'payments',
        pk: 'id',
        enums: {
          status: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
        },
        columns: [
          'id',
          'order_id',
          'payment_method_id',
          'user_id',
          'amount_usd',
          'amount_ves',
          'currency_rate',
          'status',
          'payment_method_name',
          'transaction_id',
          'reference_number',
          'payment_details',
          'receipt_image_url',
          'admin_notes',
          'payment_date',
          'confirmed_date',
          'created_at',
          'updated_at'
        ]
      },
      payment_methods: {
        table: 'payment_methods',
        pk: 'id',
        enums: {
          type: ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
        },
        columns: [
          'id',
          'name',
          'type',
          'description',
          'account_info',
          'active',
          'display_order',
          'created_at',
          'updated_at'
        ]
      },
      product_images: {
        table: 'product_images',
        pk: 'id',
        enums: {
          size: ['thumb', 'small', 'medium', 'large']
        },
        columns: [
          'id',
          'product_id',
          'url',
          'image_index',
          'size',
          'is_primary',
          'file_hash',
          'mime_type',
          'created_at',
          'updated_at'
        ]
      },
      occasions: {
        table: 'occasions',
        pk: 'id',
        columns: [
          'id',
          'name',
          'description',
          'active',
          'display_order',
          'created_at',
          'updated_at',
          'slug'
        ]
      },
      product_occasions: {
        table: 'product_occasions',
        pk: 'id',
        columns: ['id', 'product_id', 'occasion_id', 'created_at']
      },
      settings: {
        table: 'settings',
        pk: 'id',
        columns: [
          'id',
          'key',
          'value',
          'description',
          'type',
          'is_public',
          'created_at',
          'updated_at'
        ]
      }
    },
    DB_FUNCTIONS: {
      createOrderWithItems: 'create_order_with_items',
      updateOrderStatusWithHistory: 'update_order_status_with_history',
      createProductWithOccasions: 'create_product_with_occasions',
      createProductImagesAtomic: 'create_product_images_atomic',
      updateCarouselOrderAtomic: 'update_carousel_order_atomic',
      deleteProductImagesSafe: 'delete_product_images_safe',
      getProductOccasions: 'get_product_occasions',
      getProductsByOccasion: 'get_products_by_occasion',
      getProductsWithOccasions: 'get_products_with_occasions',
      getExistingImageByHash: 'get_existing_image_by_hash',
      resetSequence: 'reset_sequence'
    }
  }
})

// Import after mocking to get the mocked version
import { supabase } from '../api/services/supabaseClient.js'

// Create mock Supabase instance for DI Container
const mockSupabase = supabase

// Inicialización asíncrona
async function setupDIContainer() {
  // Registrar repositories en DI Container usando el mock de Supabase
  DIContainer.registerInstance('SupabaseClient', mockSupabase)
  DIContainer.register('ProductRepository', createProductRepository, ['SupabaseClient'])
  DIContainer.register('UserRepository', createUserRepository, ['SupabaseClient'])
  DIContainer.register('OrderRepository', createOrderRepository, ['SupabaseClient'])
  DIContainer.register('PaymentRepository', createPaymentRepository, ['SupabaseClient'])
  DIContainer.register('PaymentMethodRepository', createPaymentMethodRepository, ['SupabaseClient'])
  DIContainer.register('SettingsRepository', createSettingsRepository, ['SupabaseClient'])
  DIContainer.register('ProductImageRepository', createProductImageRepository, ['SupabaseClient'])
  DIContainer.register('OccasionRepository', createOccasionRepository, ['SupabaseClient'])

  // Registrar services mockeados para testing
  // Los tests pueden configurar estos mocks según sus necesidades

  // Mock ProductService
  const mockProductService = {
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    decrementProductStock: vi.fn(),
    getProductsByOccasion: vi.fn(),
    getProductRepository: vi.fn(() => DIContainer.resolve('ProductRepository')),
    getOccasionRepository: vi.fn(() => DIContainer.resolve('OccasionRepository'))
  }
  DIContainer.registerInstance('ProductService', mockProductService)

  // Mock UserService
  const mockUserService = {
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getUserRepository: vi.fn(() => DIContainer.resolve('UserRepository'))
  }
  DIContainer.registerInstance('UserService', mockUserService)

  // Mock OrderService
  const mockOrderService = {
    getAllOrders: vi.fn(),
    getOrderById: vi.fn(),
    createOrder: vi.fn(),
    updateOrder: vi.fn(),
    deleteOrder: vi.fn(),
    getOrderRepository: vi.fn(() => DIContainer.resolve('OrderRepository')),
    getProductRepository: vi.fn(() => DIContainer.resolve('ProductRepository'))
  }
  DIContainer.registerInstance('OrderService', mockOrderService)

  // Mock PaymentService
  const mockPaymentService = {
    getAllPayments: vi.fn(),
    getPaymentById: vi.fn(),
    createPayment: vi.fn(),
    updatePayment: vi.fn(),
    deletePayment: vi.fn(),
    getPaymentRepository: vi.fn(() => DIContainer.resolve('PaymentRepository')),
    getOrderRepository: vi.fn(() => DIContainer.resolve('OrderRepository'))
  }
  DIContainer.registerInstance('PaymentService', mockPaymentService)

  // Exponer los mocks globalmente para que los tests puedan configurarlos
  global.testMocks = {
    productService: mockProductService,
    userService: mockUserService,
    orderService: mockOrderService,
    paymentService: mockPaymentService
  }
}

// Configurar antes de todos los tests
beforeAll(async () => {
  await setupDIContainer()
  console.log('✅ Global test setup completed - Supabase mocked and DI Container configured')
})

// Limpiar después de todos los tests
afterAll(() => {
  DIContainer.clear()
  console.log('🧹 DI Container and mocks cleaned up')
})

// Limpiar mocks antes de cada test
beforeEach(() => {
  vi.clearAllMocks()
  // Reset Supabase mock call counts and return values
  mockSupabase.from.mockClear()
  mockSupabase.rpc.mockClear()
  if (mockSupabase.storage) {
    mockSupabase.storage.from.mockClear()
  }
})

// Restaurar mocks después de cada test
afterEach(() => {
  vi.restoreAllMocks()
})
