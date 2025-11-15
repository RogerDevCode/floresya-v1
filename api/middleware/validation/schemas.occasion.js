/**
 * Procesado por B
 */

/**
 * Validation Schemas - Occasions
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const occasionCreateSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: false
  },
  slug: {
    type: 'string',
    required: false,
    pattern: /^[a-z0-9-]+$/
  },
  display_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  }
}

export const occasionUpdateSchema = {
  name: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 100
  },
  description: {
    type: 'string',
    required: false
  },
  slug: {
    type: 'string',
    required: false,
    pattern: /^[a-z0-9-]+$/
  },
  active: {
    type: 'boolean',
    required: false
  },
  display_order: {
    type: 'number',
    required: false,
    integer: true,
    min: 0
  }
}
