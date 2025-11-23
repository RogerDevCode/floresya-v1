/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde userService.js (WEEK 4)
 *
 * Contains:
 * - Shared imports and constants
 * - Repository getter function
 * - Helper functions (validation, error handling)
 */ function stryNS_9fa48() {
  var g =
    (typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis) ||
    new Function('return this')()
  var ns = g.__stryker__ || (g.__stryker__ = {})
  if (
    ns.activeMutant === undefined &&
    g.process &&
    g.process.env &&
    g.process.env.__STRYKER_ACTIVE_MUTANT__
  ) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__
  }
  function retrieveNS() {
    return ns
  }
  stryNS_9fa48 = retrieveNS
  return retrieveNS()
}
stryNS_9fa48()
function stryCov_9fa48() {
  var ns = stryNS_9fa48()
  var cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {}
    })
  function cover() {
    var c = cov.static
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {}
    }
    var a = arguments
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1
    }
  }
  stryCov_9fa48 = cover
  cover.apply(null, arguments)
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48()
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')')
      }
      return true
    }
    return false
  }
  stryMutAct_9fa48 = isActive
  return isActive(id)
}
import { DB_SCHEMA } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError
} from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateId } from '../utils/validation.js'
const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role

/**
 * Get UserRepository instance from DI Container
 * @returns {UserRepository} Repository instance
 */
function getUserRepository() {
  if (stryMutAct_9fa48('6720')) {
    {
    }
  } else {
    stryCov_9fa48('6720')
    return DIContainer.resolve(
      stryMutAct_9fa48('6721') ? '' : (stryCov_9fa48('6721'), 'UserRepository')
    )
  }
}

/**
 * Validate user ID (KISS principle)
 */
function validateUserId(
  id,
  operation = stryMutAct_9fa48('6722') ? '' : (stryCov_9fa48('6722'), 'operation')
) {
  if (stryMutAct_9fa48('6723')) {
    {
    }
  } else {
    stryCov_9fa48('6723')
    validateId(id, stryMutAct_9fa48('6724') ? '' : (stryCov_9fa48('6724'), 'User'), operation)
  }
}

/**
 * Enhanced error handler (KISS principle)
 */
async function withErrorHandling(operation, operationName, context = {}) {
  if (stryMutAct_9fa48('6725')) {
    {
    }
  } else {
    stryCov_9fa48('6725')
    try {
      if (stryMutAct_9fa48('6726')) {
        {
        }
      } else {
        stryCov_9fa48('6726')
        return await operation()
      }
    } catch (error) {
      if (stryMutAct_9fa48('6727')) {
        {
        }
      } else {
        stryCov_9fa48('6727')
        console.error(
          stryMutAct_9fa48('6728') ? `` : (stryCov_9fa48('6728'), `${operationName} failed:`),
          stryMutAct_9fa48('6729')
            ? {}
            : (stryCov_9fa48('6729'),
              {
                error: error.message,
                context
              })
        )
        throw error
      }
    }
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
