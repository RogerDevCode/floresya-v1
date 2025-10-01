/**
 * Supabase Client Configuration
 * Single source of truth for database connection
 * Only import this in services/* files
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY'
  )
}

/**
 * Supabase client instance
 * Uses SERVICE_ROLE_KEY to bypass RLS for API endpoints
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Database schema metadata for query optimization
 * Maps table names to indexed columns for efficient filtering
 */
export const DB_SCHEMA = {
  users: {
    table: 'users',
    pk: 'id',
    indexes: ['email'],
    enums: {
      role: ['user', 'admin']
    }
  },
  occasions: {
    table: 'occasions',
    pk: 'id',
    indexes: ['slug'],
    filters: ['is_active', 'display_order']
  },
  products: {
    table: 'products',
    pk: 'id',
    indexes: ['sku', 'active', 'featured', 'carousel_order'],
    filters: ['active', 'featured'],
    sorts: ['created_at', 'carousel_order']
  },
  product_occasions: {
    table: 'product_occasions',
    pk: 'id',
    indexes: ['product_id', 'occasion_id'],
    unique: ['product_id', 'occasion_id']
  },
  product_images: {
    table: 'product_images',
    pk: 'id',
    indexes: ['product_id', 'size', 'is_primary'],
    unique: ['product_id', 'image_index', 'size'],
    enums: {
      size: ['thumb', 'small', 'medium', 'large']
    }
  },
  orders: {
    table: 'orders',
    pk: 'id',
    indexes: ['user_id', 'status', 'created_at'],
    filters: ['status', 'user_id'],
    sorts: ['created_at'],
    enums: {
      status: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled']
    }
  },
  order_items: {
    table: 'order_items',
    pk: 'id',
    indexes: ['order_id'],
    filters: ['order_id']
  },
  order_status_history: {
    table: 'order_status_history',
    pk: 'id',
    indexes: ['order_id']
  },
  payment_methods: {
    table: 'payment_methods',
    pk: 'id',
    filters: ['is_active', 'type'],
    sorts: ['display_order'],
    enums: {
      type: ['bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international']
    }
  },
  payments: {
    table: 'payments',
    pk: 'id',
    indexes: ['order_id', 'status'],
    filters: ['status', 'order_id'],
    enums: {
      status: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
    }
  },
  settings: {
    table: 'settings',
    pk: 'id',
    indexes: ['key'],
    filters: ['is_public']
  }
}

/**
 * Database stored functions
 */
export const DB_FUNCTIONS = {
  createOrderWithItems: 'create_order_with_items',
  createProductWithOccasions: 'create_product_with_occasions',
  createProductImagesAtomic: 'create_product_images_atomic',
  updateOrderStatusWithHistory: 'update_order_status_with_history',
  updateCarouselOrderAtomic: 'update_carousel_order_atomic',
  deleteProductImagesSafe: 'delete_product_images_safe',
  getProductOccasions: 'get_product_occasions',
  getProductsByOccasion: 'get_products_by_occasion',
  getProductsWithOccasions: 'get_products_with_occasions'
}
