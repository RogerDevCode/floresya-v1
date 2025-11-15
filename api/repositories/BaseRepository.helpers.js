/**
 * Procesado por B
 */

/**
 * Base Repository - Helper Functions & Constructor
 * Provides common CRUD operations for all entities
 * LEGACY: Modularizado desde BaseRepository.js (WEEK 4)
 *
 * Contains:
 * - Constructor
 * - Shared imports
 * - Base initialization logic
 */

import { NotFoundError, ConflictError } from '../errors/AppError.js'

/**
 * Base Repository Class
 * Abstract base class for all repository implementations
 * Provides common data access patterns
 */
export class BaseRepository {
  /**
   * @param {Object} supabaseClient - Supabase client instance
   * @param {string} tableName - Database table name
   */
  constructor(supabaseClient, tableName) {
    this.supabase = supabaseClient
    this.table = tableName
  }
}

export { NotFoundError, ConflictError }
