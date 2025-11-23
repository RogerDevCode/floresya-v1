/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Validation Middleware - Common Validation Schemas
 * LEGACY: Modularized from validate.js (Phase 6)
 */

/**
 * Common validation schemas (reusable)
 */
export const commonSchemas = {
  email: {
    type: 'string',
    required: true,
    email: true
  },
  password: {
    type: 'string',
    required: true,
    minLength: 8
  },
  /**
   * ID parameter for resource routes
   */
  IdParam: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  /**
   * Occasion ID parameter
   */
  OccasionIdParam: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  },
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 255
  },
  phone: {
    type: 'string',
    pattern: /^\+?[\d\s-()]+$/
  },
  url: {
    type: 'string',
    pattern: /^https?:\/\/.+/
  },
  positiveNumber: {
    type: 'number',
    required: true,
    min: 0
  },
  positiveInteger: {
    type: 'number',
    required: true,
    integer: true,
    min: 1
  }
}
