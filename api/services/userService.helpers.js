/**
 * Procesado por B
 */

/**
 * User Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 *
 * Contains:
 * - Shared imports and constants
 * - Repository getter function
 * - Helper functions (validation, error handling)
 */

import { DB_SCHEMA } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError
} from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import ValidatorService from './validation/ValidatorService.js'

const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role

/**
 * Get UserRepository instance from DI Container
 * @returns {UserRepository} Repository instance
 */
function getUserRepository() {
  return DIContainer.resolve('UserRepository')
}

/**
 * Validate user ID (KISS principle)
 */
function validateUserId(id, operation = 'operation') {
  ValidatorService.validateId(id, 'user')
}

/**
 * Enhanced error handler (KISS principle)
 */
async function withErrorHandling(operation, operationName, context = {}) {
  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName} failed:`, { error: error.message, context })
    throw error
  }
}

export {
  getUserRepository,
  validateUserId,
  withErrorHandling,
  TABLE,
  VALID_ROLES,
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError,
  withErrorMapping
}
