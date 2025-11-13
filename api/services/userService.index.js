/**
 * User Service - Barrel Export
 * Re-exports all functions from modular services
 * LEGACY: Maintain backward compatibility after modularization (WEEK 4)
 *
 * This file ensures that existing imports like:
 *   import { getUserById } from '../services/userService.js'
 * Continue to work without changes.
 */

// Import from all modules
export * from './userService.helpers.js'
export * from './userService.read.js'
export * from './userService.create.js'
export * from './userService.update.js'
export * from './userService.delete.js'
export * from './userService.verify.js'
