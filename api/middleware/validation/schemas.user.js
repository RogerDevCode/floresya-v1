/**
 * Procesado por B
 */

/**
 * Validation Schemas - Users
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const userCreateSchema = {
  // Required (from OpenAPI line 705)
  email: {
    type: 'string',
    required: true,
    email: true
  },
  // Optional (from OpenAPI lines 706-708)
  full_name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  phone: {
    type: 'string',
    required: false,
    pattern: /^\+?[\d\s-()]+$/
  },
  password_hash: {
    type: 'string',
    required: false
  }
}

export const userUpdateSchema = {
  // All optional (from OpenAPI lines 732-735)
  full_name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 255
  },
  phone: {
    type: 'string',
    required: false,
    pattern: /^\+?[\d\s-()]+$/
  },
  role: {
    type: 'string',
    required: false,
    enum: ['user', 'admin']
  }
}
