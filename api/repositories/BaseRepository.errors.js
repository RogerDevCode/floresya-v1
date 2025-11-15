/**
 * Procesado por B
 */

/**
 * Base Repository - Error Handling
 * Provides standardized error handling for repository operations
 * LEGACY: Modularizado desde BaseRepository.js (WEEK 4)
 */

import { BaseRepository } from './BaseRepository.helpers.js'

/**
 * Extend BaseRepository with error handling
 */
export class BaseRepositoryWithErrorHandling extends BaseRepository {
  /**
   * Handle Supabase errors
   * @param {Object} error - Supabase error
   * @param {string} operation - Failed operation
   * @param {Object} context - Additional context
   * @returns {Error} Formatted error
   */
  handleError(error, operation, context = {}) {
    console.error(`[${this.table} Repository] Error in ${operation}:`, error, context)

    // Customize error messages based on code
    if (error.code === '23505') {
      // Unique violation
      return new Error(`Duplicate entry in ${this.table}: ${error.message}`)
    }

    if (error.code === '23503') {
      // Foreign key violation
      return new Error(`Referenced record not found in ${this.table}: ${error.message}`)
    }

    if (error.code === '23502') {
      // Not null violation
      return new Error(`Required field missing in ${this.table}: ${error.message}`)
    }

    // Generic error
    return new Error(`Database error in ${this.table}.${operation}: ${error.message}`)
  }
}
