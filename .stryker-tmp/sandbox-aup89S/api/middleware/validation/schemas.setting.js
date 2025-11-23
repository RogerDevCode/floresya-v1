/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Validation Schemas - Settings
 * Based on OpenAPI 3.1 specifications in api/docs/openapi-annotations.js
 * LEGACY: Modularized from schemas.js (Phase 6)
 */

export const settingCreateSchema = {
  key: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9_]+$/ // lowercase_snake_case (matches DB and OpenAPI)
  },
  value: {
    type: 'string',
    required: true
  },
  description: {
    type: 'string',
    required: false
  },
  is_public: {
    type: 'boolean',
    required: false
  }
}

export const settingUpdateSchema = {
  value: {
    type: 'string',
    required: false
  },
  description: {
    type: 'string',
    required: false
  },
  is_public: {
    type: 'boolean',
    required: false
  }
}
