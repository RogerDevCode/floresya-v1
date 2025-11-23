/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Advanced Validation - Barrel Export
 * Re-exports all validation functions from modular files
 * LEGACY: Maintain backward compatibility after modularization (Phase 6)
 */

// Import from all modules
export * from './advancedValidation.helpers.js'
export * from './advancedValidation.email.js'
export * from './advancedValidation.phone.js'
export * from './advancedValidation.amount.js'
export * from './advancedValidation.order.js'
export * from './advancedValidation.middleware.js'
