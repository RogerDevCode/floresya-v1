/**
 * Centralized Supabase/PostgreSQL Error Mapper
 * Converts Supabase errors to appropriate AppError instances
 *
 * Based on FloresYa principles:
 * - KISS First: Simple, direct mapping
 * - Fail Fast: Throws specific errors immediately
 * - Enterprise Error Handling: Uses AppError classes
 * - Service Layer Exclusivo: Used only in services/
 */

import {
  AppError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ServiceUnavailableError,
  ConflictError,
  ValidationError
} from '../../errors/AppError.js'

/**
 * Maps Supabase/PostgreSQL error codes to appropriate AppError instances
 * @param {Object} error - Error object from Supabase
 * @param {string} operation - Database operation (SELECT, INSERT, UPDATE, DELETE)
 * @param {string} table - Table name (for context)
 * @returns {AppError} Appropriate error instance
 */
export function mapSupabaseError(error, operation = 'UNKNOWN', table = 'unknown') {
  // Fail-fast: Validate input
  if (!error || !error.code) {
    console.error('mapSupabaseError called with invalid error:', error)

    // Create specific error without fallback - fail fast
    if (!error) {
      throw new DatabaseError(operation, table, {
        name: 'InvalidError',
        message: 'Error object is required but was not provided',
        code: 'MISSING_ERROR_OBJECT'
      })
    }

    if (!error.code) {
      throw new DatabaseError(operation, table, {
        name: 'InvalidError',
        message: `Error object missing required 'code' property`,
        code: 'MISSING_ERROR_CODE',
        providedError: error
      })
    }
  }

  const context = {
    supabaseCode: error.code,
    originalMessage: error.message,
    operation,
    table,
    timestamp: new Date().toISOString()
  }

  // PGRST Errors (PostgREST/Supabase specific)
  if (error.code === 'PGRST116') {
    return new NotFoundError('Resource', 'unknown', {
      ...context,
      hint: 'Resource not found in database'
    })
  }

  if (error.code === 'PGRST301') {
    return new UnauthorizedError('Invalid or expired authentication token', {
      ...context,
      hint: 'JWT token is invalid or has expired'
    })
  }

  // PostgreSQL Error Codes
  switch (error.code) {
    case '23505': {
      // unique_violation
      const constraintMatch = error.message?.match(
        /duplicate key value violates unique constraint "(.+?)"/
      )
      const constraint = constraintMatch ? constraintMatch[1] : 'unique_constraint'

      return new DatabaseConstraintError(constraint, table, {
        ...context,
        constraint,
        hint: 'Resource with this value already exists'
      })
    }

    case '23503': {
      // foreign_key_violation
      const fkMatch = error.message?.match(/violates foreign key constraint "(.+?)"/)
      const constraint = fkMatch ? fkMatch[1] : 'foreign_key'

      return new ConflictError(
        `Referential integrity violation: cannot modify resource due to existing dependencies`,
        {
          ...context,
          constraint,
          type: 'foreign_key',
          hint: 'This resource cannot be deleted as it is referenced by other records'
        }
      )
    }

    case '23514': {
      // check_violation
      return new BadRequestError('Invalid data: violates business rule constraint', {
        ...context,
        type: 'check_constraint',
        hint: 'Provided data does not meet business rules'
      })
    }

    case '23502': {
      // not_null_violation
      const columnMatch = error.message?.match(/null value in column "(.+?)"/)
      const column = columnMatch ? columnMatch[1] : 'unknown_column'

      return new ValidationError('Required field missing', {
        ...context,
        column,
        type: 'not_null',
        validationErrors: {
          [column]: 'This field is required and cannot be null'
        }
      })
    }

    case '42501': {
      // insufficient_privilege
      return new ForbiddenError('Insufficient database privileges for this operation', {
        ...context,
        type: 'permission_denied',
        hint: 'Check RLS policies or user permissions'
      })
    }

    case '08006': // connection_failure
    case '08003': {
      // connection_does_not_exist
      return new ServiceUnavailableError('Database connection', {
        ...context,
        type: 'connection',
        hint: 'Database is temporarily unavailable. Please try again later.'
      })
    }

    case '53300': {
      // deadlock_detected
      return new ConflictError('Database transaction conflict: please retry', {
        ...context,
        type: 'deadlock',
        hint: 'Multiple transactions conflicting. Retry the operation.'
      })
    }

    case '42P01': {
      // undefined_table
      return new DatabaseError(operation, table, error, {
        ...context,
        type: 'undefined_table',
        hint: 'Table does not exist'
      })
    }

    case '42703': {
      // undefined_column
      return new DatabaseError(operation, table, error, {
        ...context,
        type: 'undefined_column',
        hint: 'Column does not exist'
      })
    }

    case '22001': {
      // string_data_right_truncation
      return new BadRequestError('Data too long for column', {
        ...context,
        type: 'data_truncation',
        hint: 'One or more fields exceed maximum length'
      })
    }

    case '22003': {
      // numeric_value_out_of_range
      return new BadRequestError('Numeric value out of range', {
        ...context,
        type: 'numeric_range',
        hint: 'Numeric value is too large or too small'
      })
    }

    default: {
      // Unknown error - wrap as DatabaseError with full context
      return new DatabaseError(operation, table, error, {
        ...context,
        unmapped: true,
        hint: 'An unexpected database error occurred'
      })
    }
  }
}

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
