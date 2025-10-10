/**
 * Application Constants (SSOT)
 * Centralized configuration for limits, defaults, and business rules
 * IMPORTANT: These are business rules and technical constraints, not magic numbers
 */

/**
 * Pagination settings for API endpoints
 * Used to prevent database overload and ensure reasonable response sizes
 */
export const PAGINATION = {
  /** Default limit when user doesn't specify one (prevents unbounded queries) */
  DEFAULT_LIMIT: 50,
  /** Maximum allowed limit per request (anti-DoS protection) */
  MAX_LIMIT: 1000,
  /** Default offset for pagination */
  DEFAULT_OFFSET: 0
}

/**
 * Carousel business rules
 * Based on UI design constraints (homepage carousel displays max 7 products)
 */
export const CAROUSEL = {
  /** Maximum number of products in carousel (UI constraint) */
  MAX_SIZE: 7,
  /** Minimum valid carousel position */
  MIN_POSITION: 1,
  /** Maximum valid carousel position (same as MAX_SIZE) */
  MAX_POSITION: 7
}

/**
 * Query optimization limits
 * Technical limits for performance optimization
 */
export const QUERY_LIMITS = {
  /** Fetch only 1 record (used with .single() or when only one record is needed) */
  SINGLE_RECORD: 1,
  /** Sample data for debugging/testing */
  SAMPLE_DATA: 10,
  /** Batch processing chunk size */
  BATCH_SIZE: 100
}

/**
 * Currency exchange rates
 * USD to VES (Venezuelan Bolivar)
 */
export const CURRENCY = {
  /** Current USD to VES exchange rate */
  USD_TO_VES: 36.45,
  /** Currency codes */
  CODES: {
    USD: 'USD',
    VES: 'VES'
  }
}

/**
 * Validation limits
 * Field length constraints for database schema
 */
export const VALIDATION = {
  /** Maximum product name length */
  PRODUCT_NAME_MAX_LENGTH: 255,
  /** Maximum SKU length */
  SKU_MAX_LENGTH: 50,
  /** Maximum user full name length */
  USER_NAME_MAX_LENGTH: 255,
  /** Maximum email length */
  EMAIL_MAX_LENGTH: 255
}

/**
 * Image size presets
 * Used for product image variants
 */
export const IMAGE_SIZES = {
  THUMB: 'thumb', // 100x100px
  SMALL: 'small', // 300x300px
  MEDIUM: 'medium', // 600x600px
  LARGE: 'large' // 1200x1200px
}

/**
 * Order status workflow
 * Valid order statuses (mirrors DB_SCHEMA.orders.enums.status)
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

/**
 * Payment status workflow
 * Valid payment statuses
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
}

/**
 * User roles
 * Valid user role values (mirrors DB_SCHEMA.users.enums.role)
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}
