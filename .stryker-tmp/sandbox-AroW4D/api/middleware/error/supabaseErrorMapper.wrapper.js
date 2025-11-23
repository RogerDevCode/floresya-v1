/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Supabase Error Mapper - Wrapper Functions
 * Wrapper functions for database operations with automatic error mapping
 * LEGACY: Modularized from supabaseErrorMapper.js (Phase 6)
 */

import { AppError, DatabaseError } from '../../errors/AppError.js'
import { mapSupabaseError } from './supabaseErrorMapper.codes.js'

/**
 * Wrapper function for database operations with automatic error mapping
 * @param {Function} operation - Async function to wrap
 * @returns {Function} Wrapped function with error mapping
 *
 * @example
 * // Without wrapper
 * export async function getProductById(id) {
 *   try {
 *     const { data, error } = await supabase.from(TABLE).select().eq('id', id).single()
 *     if (error) throw error
 *     return data
 *   } catch (error) {
 *     console.error('getProductById failed:', error)
 *     throw error
 *   }
 * }
 *
 * // With wrapper
 * export const getProductById = withErrorMapping(async (id) => {
 *   const { data, error } = await supabase.from(TABLE).select().eq('id', id).single()
 *   if (error) throw error
 *   return data
 * }, 'SELECT', 'products')
 */
export function withErrorMapping(
  operation,
  defaultOperation = 'UNKNOWN',
  defaultTable = 'unknown'
) {
  return async function (...args) {
    try {
      return await operation(...args)
    } catch (error) {
      // If it's already an AppError, re-throw as-is (fail-fast)
      // Check for AppError more specifically (not just any Error)
      if (error instanceof AppError) {
        console.error(`Operation failed:`, {
          operation: defaultOperation,
          table: defaultTable,
          error: error.message
        })
        throw error
      }

      // If it's a Supabase/PostgreSQL error, map it
      if (error.code && typeof error.code === 'string') {
        const mappedError = mapSupabaseError(error, defaultOperation, defaultTable)
        console.error(`Database operation failed:`, {
          operation: defaultOperation,
          table: defaultTable,
          error: error.code,
          message: error.message
        })
        throw mappedError
      }

      // Otherwise, wrap as generic DatabaseError
      const genericError = new DatabaseError(defaultOperation, defaultTable, error)
      console.error(`Unexpected error in database operation:`, {
        operation: defaultOperation,
        table: defaultTable,
        error: error.message
      })
      throw genericError
    }
  }
}

/**
 * Helper to create table-specific wrapped operations
 * @param {string} tableName - Table name for context
 * @returns {Object} Object with wrapped method creators
 *
 * @example
 * const productOps = createTableOperations('products')
 * export const getProductById = productOps.wrap(
 *   async (id) => {
 *     const { data, error } = await supabase.from('products').select().eq('id', id).single()
 *     if (error) throw error
 *     return data
 *   },
 *   'SELECT'
 * )
 */
export function createTableOperations(tableName) {
  return {
    wrap(operation, operationType = 'UNKNOWN') {
      return withErrorMapping(operation, operationType, tableName)
    }
  }
}
