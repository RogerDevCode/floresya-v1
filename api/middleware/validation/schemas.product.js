/**
 * Procesado por B
 */

/**
 * Validation Schemas - Products
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const productCreateSchema = {
  // Product object (required) - Accept both nested and flattened structures
  product: {
    type: 'object',
    required: false, // Made optional to allow flattened structure
    custom: (value, data) => {
      // Handle both nested {product: {...}} and flattened {...} structures
      const productData = value || data

      if (!productData || typeof productData !== 'object') {
        return 'product must be an object'
      }

      // Validate required fields regardless of structure
      if (!productData.name || typeof productData.name !== 'string') {
        return 'product.name is required and must be a string'
      }
      if (productData.price_usd === undefined || typeof productData.price_usd !== 'number') {
        return 'product.price_usd is required and must be a number'
      }
      if (productData.price_usd < 0) {
        return 'product.price_usd must be non-negative'
      }

      return null
    }
  },
  // Optional top-level fields that mirror product object for backward compatibility
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  summary: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  price_usd: {
    type: 'number',
    required: false,
    min: 0
  },
  price_ves: {
    type: 'number',
    required: false,
    min: 0
  },
  stock: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  sku: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  featured: {
    type: 'boolean',
    required: false
  },
  carousel_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0,
    max: 7
  }
}

export const productUpdateSchema = {
  // All fields optional for update (from OpenAPI line 234)
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  summary: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  price_usd: {
    type: 'number',
    required: false,
    min: 0,
    custom: (value, _data) => {
      if (value !== undefined && value !== null && (typeof value !== 'number' || isNaN(value))) {
        return 'price_usd must be a valid number'
      }
      return null
    }
  },
  price_ves: {
    type: 'number',
    required: false,
    min: 0
  },
  stock: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  sku: {
    type: 'string',
    required: false,
    maxLength: 50
  },
  active: {
    type: 'boolean',
    required: false
  },
  featured: {
    type: 'boolean',
    required: false
  },
  carousel_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  }
}

export const productFilterSchema = {
  // Query params (from OpenAPI lines 15-32)
  limit: {
    type: 'number',
    required: false,
    integer: true,
    min: 1,
    max: 100
  },
  offset: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  },
  search: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 255
  },
  featured: {
    type: 'boolean',
    required: false
  },
  sku: {
    type: 'string',
    required: false
  },
  sortBy: {
    type: 'string',
    required: false,
    enum: ['name', 'price_usd', 'created_at', 'carousel_order']
  }
}
