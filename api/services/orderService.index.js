/**
 * Procesado por B
 */

/**
 * Order Service - Barrel Export
 * Re-exports all functions from modular services
 * LEGACY: Maintain backward compatibility after modularization (WEEK 3)
 *
 * This file ensures that existing imports like:
 *   import { getOrderById } from '../services/orderService.js'
 * Continue to work without changes.
 */

// Import from all modules
export * from './orderService.helpers.js'
export * from './orderService.read.js'
export * from './orderService.create.js'
export * from './orderService.update.js'
export * from './orderService.cancel.js'
export * from './orderService.status.js'
