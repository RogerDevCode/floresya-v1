/**
 * Order Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
 *
 * Contains:
 * - Shared imports and constants
 * - Repository getter functions
 * - Common utilities
 */

import { DB_SCHEMA } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'

const TABLE = DB_SCHEMA.orders.table
const VALID_STATUSES = DB_SCHEMA.orders.enums.status

/**
 * Get OrderRepository instance from DI Container
 * @returns {OrderRepository} Repository instance
 */
function getOrderRepository() {
  return DIContainer.resolve('OrderRepository')
}

/**
 * Get ProductRepository instance from DI Container
 * @returns {ProductRepository} Repository instance
 */
function getProductRepository() {
  return DIContainer.resolve('ProductRepository')
}

export {
  getOrderRepository,
  getProductRepository,
  TABLE,
  VALID_STATUSES,
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError,
  InternalServerError,
  withErrorMapping
}
