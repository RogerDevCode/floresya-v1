/**
 * Procesado por B
 */

/**
 * Base Repository - Barrel Export
 * Re-exports all modular repository components
 * LEGACY: Maintain backward compatibility after modularization (WEEK 4)
 *
 * This file ensures that existing imports like:
 *   import { BaseRepository } from '../repositories/BaseRepository.js'
 * Continue to work without changes.
 *
 * COMPOSITION APPROACH:
 * Instead of inheritance, BaseRepository now uses composition.
 * Repository classes can extend the specific modules they need:
 *
 * class ProductRepository extends BaseRepositoryWithCRUD {}
 * class OrderRepository extends BaseRepositoryWithCRUD {}
 * class UserRepository extends BaseRepositoryWithCRUDAndSoftDelete {}
 */

// Import base class and all extensions
export { BaseRepository } from './BaseRepository.helpers.js'

export { BaseRepositoryWithCRUD } from './BaseRepository.crud.js'

export { BaseRepositoryWithSoftDelete } from './BaseRepository.soft-delete.js'

export { BaseRepositoryWithQuery } from './BaseRepository.query.js'

export { BaseRepositoryWithErrorHandling } from './BaseRepository.errors.js'

// Also export individual error classes
export { NotFoundError, ConflictError } from './BaseRepository.helpers.js'

// Note: For backward compatibility, UnifiedBaseRepository provides a unified interface
// This avoids circular dependency issues by using the base class
// export { BaseRepository as UnifiedBaseRepository } // Commented out to fix ESLint parsing error
