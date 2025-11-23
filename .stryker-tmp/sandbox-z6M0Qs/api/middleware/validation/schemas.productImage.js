/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Validation Schemas - Product Images
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const productImageCreateSchema = {
  product_id: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  image_index: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  size: {
    type: 'string',
    required: true,
    enum: ['thumb', 'small', 'medium', 'large']
  },
  url: {
    type: 'string',
    required: true,
    pattern: /^https?:\/\/.+/
  },
  file_hash: {
    type: 'string',
    required: true,
    minLength: 10
  },
  mime_type: {
    type: 'string',
    required: false,
    pattern: /^image\/(jpeg|jpg|png|webp|gif)$/
  },
  is_primary: {
    type: 'boolean',
    required: false
  }
}

export const productImageFilterSchema = {
  size: {
    type: 'string',
    required: false,
    enum: ['thumb', 'small', 'medium', 'large']
  },
  is_primary: {
    type: 'boolean',
    required: false
  }
}
