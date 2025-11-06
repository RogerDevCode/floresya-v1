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
 * Currency exchange codes
 * USD to VES (Venezuelan Bolivar)
 * NOTE: Exchange rates should be fetched from settings, not hardcoded
 */
export const CURRENCY = {
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

/**
 * Permission-based Access Control (RBAC)
 * Permissions are more granular than roles
 * Users can have multiple permissions
 */
export const PERMISSIONS = {
  // User management
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Product management
  PRODUCT_READ: 'product:read',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Order management
  ORDER_READ: 'order:read',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',

  // Payment management
  PAYMENT_READ: 'payment:read',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_UPDATE: 'payment:update',
  PAYMENT_DELETE: 'payment:delete',

  // Settings management
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // Occasion management
  OCCASION_READ: 'occasion:read',
  OCCASION_CREATE: 'occasion:create',
  OCCASION_UPDATE: 'occasion:update',
  OCCASION_DELETE: 'occasion:delete',

  // System administration
  SYSTEM_ADMIN: 'system:admin',
  MIGRATION_RUN: 'migration:run'
}

/**
 * Role to Permission Mapping
 * Maps roles to their default permissions
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_CREATE
  ],
  [USER_ROLES.ADMIN]: [
    // All user permissions
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,

    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,

    PERMISSIONS.ORDER_READ,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_DELETE,

    PERMISSIONS.PAYMENT_READ,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_UPDATE,
    PERMISSIONS.PAYMENT_DELETE,

    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,

    PERMISSIONS.OCCASION_READ,
    PERMISSIONS.OCCASION_CREATE,
    PERMISSIONS.OCCASION_UPDATE,
    PERMISSIONS.OCCASION_DELETE,

    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.MIGRATION_RUN
  ]
}
