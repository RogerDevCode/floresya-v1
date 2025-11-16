/**
 * Procesado por B
 */

/**
 * Supabase Client Configuration
 * Single source of truth for database connection
 * Only import this in services/* files
 *
 * Uses centralized configLoader for all configuration
 */

import { createClient } from '@supabase/supabase-js'
import config from '../config/configLoader.js'
import { ConfigurationError } from '../errors/AppError.js'
import { createMonitoredSupabaseClient } from '../monitoring/databaseMonitor.js'

// Import mock for testing
let createSupabaseClientMock = null
if (process.env.NODE_ENV === 'test') {
  try {
    const { createSupabaseClientMock: mockFn } = await import(
      '../../refinery/test/supabase-client/mocks/mocks.js'
    )
    createSupabaseClientMock = mockFn
  } catch (error) {
    console.warn('Mock not available, using real client for tests', error.message)
  }
}

const supabaseUrl = config.database.url
const supabaseKey = config.database.key

if (!supabaseUrl || !supabaseKey) {
  console.error('Configuration error:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    isVercel: config.VERCEL,
    nodeEnv: config.NODE_ENV
  })
  throw new ConfigurationError(
    'Missing database configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY',
    {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      nodeEnv: config.NODE_ENV
    }
  )
}

/**
 * Supabase client instance
 * Uses SERVICE_ROLE_KEY to bypass RLS for API endpoints
 * Configuration from centralized configLoader
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const rawSupabaseClient =
  process.env.NODE_ENV === 'test' && createSupabaseClientMock
    ? createSupabaseClientMock({ url: supabaseUrl, anonKey: supabaseKey })
    : createClient(supabaseUrl, supabaseKey, config.database.options)

/**
 * Monitored Supabase client with performance tracking
 * All database operations are automatically monitored for slow queries and performance
 */
export const supabase =
  process.env.NODE_ENV === 'test'
    ? rawSupabaseClient
    : createMonitoredSupabaseClient(rawSupabaseClient)

/**
 * Database schema metadata for query optimization
 * Maps table names to indexed columns for efficient filtering
 */
export const DB_SCHEMA = {
  users: {
    table: 'users',
    pk: 'id',
    indexes: ['email', 'full_name_normalized', 'email_normalized'],
    search: ['full_name_normalized', 'email_normalized'],
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
  occasions: {
    table: 'occasions',
    pk: 'id',
    indexes: ['slug'],
    filters: ['active', 'display_order'],
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
  products: {
    table: 'products',
    pk: 'id',
    indexes: [
      'sku',
      'active',
      'featured',
      'carousel_order',
      'name_normalized',
      'description_normalized'
    ],
    filters: ['active', 'featured'],
    sorts: ['created_at', 'carousel_order'],
    search: ['name_normalized', 'description_normalized'],
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
  product_occasions: {
    table: 'product_occasions',
    pk: 'id',
    indexes: ['product_id', 'occasion_id'],
    unique: ['product_id', 'occasion_id'],
    columns: ['id', 'product_id', 'occasion_id', 'created_at']
  },
  product_images: {
    table: 'product_images',
    pk: 'id',
    indexes: ['product_id', 'size', 'is_primary'],
    unique: ['product_id', 'image_index', 'size'],
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
  orders: {
    table: 'orders',
    pk: 'id',
    indexes: [
      'user_id',
      'status',
      'created_at',
      'customer_email',
      'customer_name_normalized',
      'customer_email_normalized'
    ],
    filters: ['status', 'user_id', 'customer_email'],
    sorts: ['created_at'],
    search: ['customer_name_normalized', 'customer_email_normalized'],
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
    indexes: ['order_id', 'product_id'],
    filters: ['order_id', 'product_id'],
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
  order_status_history: {
    table: 'order_status_history',
    pk: 'id',
    indexes: ['order_id', 'created_at'],
    filters: ['order_id'],
    sorts: ['created_at'],
    columns: ['id', 'order_id', 'old_status', 'new_status', 'notes', 'changed_by', 'created_at']
  },
  payment_methods: {
    table: 'payment_methods',
    pk: 'id',
    filters: ['active', 'type'],
    sorts: ['display_order'],
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
  payments: {
    table: 'payments',
    pk: 'id',
    indexes: ['order_id', 'status', 'payment_method_id', 'user_id'],
    filters: ['status', 'order_id', 'payment_method_id', 'user_id'],
    sorts: ['created_at', 'payment_date'],
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
  settings: {
    table: 'settings',
    pk: 'id',
    indexes: ['key'],
    filters: ['is_public'],
    columns: ['id', 'key', 'value', 'description', 'type', 'is_public', 'created_at', 'updated_at']
  }
}

/**
 * Database stored functions (SSOT)
 * All functions verified to exist in floresya.sql
 * Services SHOULD use these via supabase.rpc() for atomic operations
 */
export const DB_FUNCTIONS = {
  // Order operations (lines 122-268 in floresya.sql)
  createOrderWithItems: 'create_order_with_items',
  updateOrderStatusWithHistory: 'update_order_status_with_history',

  // Product operations (lines 352-677 in floresya.sql)
  createProductWithOccasions: 'create_product_with_occasions',
  createProductImagesAtomic: 'create_product_images_atomic',
  updateCarouselOrderAtomic: 'update_carousel_order_atomic',
  deleteProductImagesSafe: 'delete_product_images_safe',

  // Query functions (lines 468-568 in floresya.sql)
  getProductOccasions: 'get_product_occasions',
  getProductsByOccasion: 'get_products_by_occasion',
  getProductsWithOccasions: 'get_products_with_occasions',
  getExistingImageByHash: 'get_existing_image_by_hash',

  // Utility (lines 575-584 in floresya.sql)
  resetSequence: 'reset_sequence'
}
