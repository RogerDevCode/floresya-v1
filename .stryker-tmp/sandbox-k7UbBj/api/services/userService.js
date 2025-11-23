/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service
 * Business logic for user operations
 * KISS implementation - simple and direct
 *
 * REPOSITORY PATTERN: Uses UserRepository for data access
 * Following Service Layer Exclusive principle
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
import { ValidationError, NotFoundError, BadRequestError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateId } from '../utils/validation.js'

/**
 * Get Logger instance from DI Container
 * @returns {Object} Logger instance
 */
function getLogger() {
  if (stryMutAct_9fa48('6730')) {
    {
    }
  } else {
    stryCov_9fa48('6730')
    return DIContainer.resolve(stryMutAct_9fa48('6731') ? '' : (stryCov_9fa48('6731'), 'Logger'))
  }
}
const TABLE = DB_SCHEMA.users.table
const VALID_ROLES = DB_SCHEMA.users.enums.role

/**
 * Get UserRepository instance from DI Container
 * @returns {UserRepository} Repository instance
 */
function getUserRepository() {
  if (stryMutAct_9fa48('6732')) {
    {
    }
  } else {
    stryCov_9fa48('6732')
    return DIContainer.resolve(
      stryMutAct_9fa48('6733') ? '' : (stryCov_9fa48('6733'), 'UserRepository')
    )
  }
}

/**
 * Validate user ID (KISS principle)
 */
function validateUserId(
  id,
  operation = stryMutAct_9fa48('6734') ? '' : (stryCov_9fa48('6734'), 'operation')
) {
  if (stryMutAct_9fa48('6735')) {
    {
    }
  } else {
    stryCov_9fa48('6735')
    validateId(id, stryMutAct_9fa48('6736') ? '' : (stryCov_9fa48('6736'), 'User'), operation)
  }
}

/**
 * Enhanced error handler (KISS principle)
 */
async function withErrorHandling(operation, operationName, context = {}) {
  if (stryMutAct_9fa48('6737')) {
    {
    }
  } else {
    stryCov_9fa48('6737')
    try {
      if (stryMutAct_9fa48('6738')) {
        {
        }
      } else {
        stryCov_9fa48('6738')
        return await operation()
      }
    } catch (error) {
      if (stryMutAct_9fa48('6739')) {
        {
        }
      } else {
        stryCov_9fa48('6739')
        const logger = getLogger()
        logger.error(
          stryMutAct_9fa48('6740') ? `` : (stryCov_9fa48('6740'), `${operationName} failed:`),
          error,
          context
        )
        throw error
      }
    }
  }
}

/**
 * Apply activity filter (FAIL FAST - no fallback)
 * Note: Not currently used - kept for reference
 */

/**
 * Get all users with simple filters (KISS principle)
 * - Shows ALL users by default (no pagination required)
 * - Only applies filters when explicitly provided
 */
export function getAllUsers(
  filters = {},
  includeDeactivated = stryMutAct_9fa48('6741') ? true : (stryCov_9fa48('6741'), false)
) {
  if (stryMutAct_9fa48('6742')) {
    {
    }
  } else {
    stryCov_9fa48('6742')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6743')) {
          {
          }
        } else {
          stryCov_9fa48('6743')
          const userRepository = getUserRepository()

          // Use repository to get users with filters
          const data = await userRepository.findAllWithFilters(
            filters,
            stryMutAct_9fa48('6744')
              ? {}
              : (stryCov_9fa48('6744'),
                {
                  includeDeactivated,
                  orderBy: stryMutAct_9fa48('6745') ? '' : (stryCov_9fa48('6745'), 'created_at'),
                  ascending: stryMutAct_9fa48('6746') ? true : (stryCov_9fa48('6746'), false)
                })
          )

          // Don't throw error if no users found - return empty array
          return stryMutAct_9fa48('6749')
            ? data && []
            : stryMutAct_9fa48('6748')
              ? false
              : stryMutAct_9fa48('6747')
                ? true
                : (stryCov_9fa48('6747', '6748', '6749'),
                  data ||
                    (stryMutAct_9fa48('6750') ? ['Stryker was here'] : (stryCov_9fa48('6750'), [])))
        }
      },
      stryMutAct_9fa48('6751') ? '' : (stryCov_9fa48('6751'), 'getAllUsers'),
      stryMutAct_9fa48('6752')
        ? {}
        : (stryCov_9fa48('6752'),
          {
            filters,
            includeDeactivated
          })
    )
  }
}

/**
 * Get user by ID
 */
export const getUserById = withErrorMapping(
  async (
    id,
    includeDeactivated = stryMutAct_9fa48('6753') ? true : (stryCov_9fa48('6753'), false)
  ) => {
    if (stryMutAct_9fa48('6754')) {
      {
      }
    } else {
      stryCov_9fa48('6754')
      const userRepository = getUserRepository()
      validateUserId(id, stryMutAct_9fa48('6755') ? '' : (stryCov_9fa48('6755'), 'getUserById'))

      // Use repository to get user
      const data = await userRepository.findById(id, includeDeactivated)
      if (
        stryMutAct_9fa48('6758')
          ? false
          : stryMutAct_9fa48('6757')
            ? true
            : stryMutAct_9fa48('6756')
              ? data
              : (stryCov_9fa48('6756', '6757', '6758'), !data)
      ) {
        if (stryMutAct_9fa48('6759')) {
          {
          }
        } else {
          stryCov_9fa48('6759')
          throw new NotFoundError(
            stryMutAct_9fa48('6760') ? '' : (stryCov_9fa48('6760'), 'User'),
            id,
            stryMutAct_9fa48('6761')
              ? {}
              : (stryCov_9fa48('6761'),
                {
                  includeDeactivated
                })
          )
        }
      }
      return data
    }
  },
  stryMutAct_9fa48('6762') ? '' : (stryCov_9fa48('6762'), 'SELECT'),
  TABLE
)

/**
 * Get user by email
 */
export function getUserByEmail(
  email,
  includeDeactivated = stryMutAct_9fa48('6763') ? true : (stryCov_9fa48('6763'), false)
) {
  if (stryMutAct_9fa48('6764')) {
    {
    }
  } else {
    stryCov_9fa48('6764')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6765')) {
          {
          }
        } else {
          stryCov_9fa48('6765')
          const userRepository = getUserRepository()

          // FAIL FAST - Validate email parameter
          if (
            stryMutAct_9fa48('6768')
              ? false
              : stryMutAct_9fa48('6767')
                ? true
                : stryMutAct_9fa48('6766')
                  ? email
                  : (stryCov_9fa48('6766', '6767', '6768'), !email)
          ) {
            if (stryMutAct_9fa48('6769')) {
              {
              }
            } else {
              stryCov_9fa48('6769')
              throw new BadRequestError(
                stryMutAct_9fa48('6770') ? '' : (stryCov_9fa48('6770'), 'Email is required'),
                stryMutAct_9fa48('6771')
                  ? {}
                  : (stryCov_9fa48('6771'),
                    {
                      email
                    })
              )
            }
          }
          if (
            stryMutAct_9fa48('6774')
              ? typeof email === 'string'
              : stryMutAct_9fa48('6773')
                ? false
                : stryMutAct_9fa48('6772')
                  ? true
                  : (stryCov_9fa48('6772', '6773', '6774'),
                    typeof email !==
                      (stryMutAct_9fa48('6775') ? '' : (stryCov_9fa48('6775'), 'string')))
          ) {
            if (stryMutAct_9fa48('6776')) {
              {
              }
            } else {
              stryCov_9fa48('6776')
              throw new BadRequestError(
                stryMutAct_9fa48('6777') ? '' : (stryCov_9fa48('6777'), 'Email must be a string'),
                stryMutAct_9fa48('6778')
                  ? {}
                  : (stryCov_9fa48('6778'),
                    {
                      email,
                      type: typeof email
                    })
              )
            }
          }

          // FAIL FAST - Basic email format validation
          if (
            stryMutAct_9fa48('6781')
              ? !email.includes('@') && !email.includes('.')
              : stryMutAct_9fa48('6780')
                ? false
                : stryMutAct_9fa48('6779')
                  ? true
                  : (stryCov_9fa48('6779', '6780', '6781'),
                    (stryMutAct_9fa48('6782')
                      ? email.includes('@')
                      : (stryCov_9fa48('6782'),
                        !email.includes(
                          stryMutAct_9fa48('6783') ? '' : (stryCov_9fa48('6783'), '@')
                        ))) ||
                      (stryMutAct_9fa48('6784')
                        ? email.includes('.')
                        : (stryCov_9fa48('6784'),
                          !email.includes(
                            stryMutAct_9fa48('6785') ? '' : (stryCov_9fa48('6785'), '.')
                          ))))
          ) {
            if (stryMutAct_9fa48('6786')) {
              {
              }
            } else {
              stryCov_9fa48('6786')
              throw new ValidationError(
                stryMutAct_9fa48('6787') ? '' : (stryCov_9fa48('6787'), 'Invalid email format'),
                stryMutAct_9fa48('6788')
                  ? {}
                  : (stryCov_9fa48('6788'),
                    {
                      field: stryMutAct_9fa48('6789') ? '' : (stryCov_9fa48('6789'), 'email'),
                      value: email,
                      rule: stryMutAct_9fa48('6790')
                        ? ''
                        : (stryCov_9fa48('6790'), 'valid email format required')
                    })
              )
            }
          }

          // Use repository to get user by email
          const data = await userRepository.findByEmail(email, includeDeactivated)
          if (
            stryMutAct_9fa48('6793')
              ? false
              : stryMutAct_9fa48('6792')
                ? true
                : stryMutAct_9fa48('6791')
                  ? data
                  : (stryCov_9fa48('6791', '6792', '6793'), !data)
          ) {
            if (stryMutAct_9fa48('6794')) {
              {
              }
            } else {
              stryCov_9fa48('6794')
              throw new NotFoundError(
                stryMutAct_9fa48('6795') ? '' : (stryCov_9fa48('6795'), 'User'),
                email,
                stryMutAct_9fa48('6796')
                  ? {}
                  : (stryCov_9fa48('6796'),
                    {
                      email,
                      includeDeactivated
                    })
              )
            }
          }
          return data
        }
      },
      stryMutAct_9fa48('6797') ? `` : (stryCov_9fa48('6797'), `getUserByEmail(${email})`),
      stryMutAct_9fa48('6798')
        ? {}
        : (stryCov_9fa48('6798'),
          {
            email,
            includeDeactivated
          })
    )
  }
}

/**
 * Get users by intelligent filter (role, state, email-verified)
 * This is the smart filter function - combines multiple criteria
 */
export function getUsersByFilter(filters = {}) {
  if (stryMutAct_9fa48('6799')) {
    {
    }
  } else {
    stryCov_9fa48('6799')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6800')) {
          {
          }
        } else {
          stryCov_9fa48('6800')
          const userRepository = getUserRepository()

          // FAIL FAST - Require at least one filter
          if (
            stryMutAct_9fa48('6803')
              ? (!filters.role && filters.state === undefined) ||
                filters.email_verified === undefined
              : stryMutAct_9fa48('6802')
                ? false
                : stryMutAct_9fa48('6801')
                  ? true
                  : (stryCov_9fa48('6801', '6802', '6803'),
                    (stryMutAct_9fa48('6805')
                      ? !filters.role || filters.state === undefined
                      : stryMutAct_9fa48('6804')
                        ? true
                        : (stryCov_9fa48('6804', '6805'),
                          (stryMutAct_9fa48('6806')
                            ? filters.role
                            : (stryCov_9fa48('6806'), !filters.role)) &&
                            (stryMutAct_9fa48('6808')
                              ? filters.state !== undefined
                              : stryMutAct_9fa48('6807')
                                ? true
                                : (stryCov_9fa48('6807', '6808'), filters.state === undefined)))) &&
                      (stryMutAct_9fa48('6810')
                        ? filters.email_verified !== undefined
                        : stryMutAct_9fa48('6809')
                          ? true
                          : (stryCov_9fa48('6809', '6810'), filters.email_verified === undefined)))
          ) {
            if (stryMutAct_9fa48('6811')) {
              {
              }
            } else {
              stryCov_9fa48('6811')
              throw new BadRequestError(
                stryMutAct_9fa48('6812')
                  ? ''
                  : (stryCov_9fa48('6812'),
                    'At least one filter must be specified: role, state, or email_verified'),
                stryMutAct_9fa48('6813')
                  ? {}
                  : (stryCov_9fa48('6813'),
                    {
                      providedFilters: Object.keys(filters),
                      rule: stryMutAct_9fa48('6814')
                        ? ''
                        : (stryCov_9fa48('6814'), 'filter required')
                    })
              )
            }
          }

          // FAIL FAST - Require explicit pagination parameters
          if (
            stryMutAct_9fa48('6817')
              ? filters.limit === undefined && filters.offset === undefined
              : stryMutAct_9fa48('6816')
                ? false
                : stryMutAct_9fa48('6815')
                  ? true
                  : (stryCov_9fa48('6815', '6816', '6817'),
                    (stryMutAct_9fa48('6819')
                      ? filters.limit !== undefined
                      : stryMutAct_9fa48('6818')
                        ? false
                        : (stryCov_9fa48('6818', '6819'), filters.limit === undefined)) ||
                      (stryMutAct_9fa48('6821')
                        ? filters.offset !== undefined
                        : stryMutAct_9fa48('6820')
                          ? false
                          : (stryCov_9fa48('6820', '6821'), filters.offset === undefined)))
          ) {
            if (stryMutAct_9fa48('6822')) {
              {
              }
            } else {
              stryCov_9fa48('6822')
              throw new BadRequestError(
                stryMutAct_9fa48('6823')
                  ? ''
                  : (stryCov_9fa48('6823'), 'Pagination parameters limit and offset are required'),
                stryMutAct_9fa48('6824')
                  ? {}
                  : (stryCov_9fa48('6824'),
                    {
                      limit: filters.limit,
                      offset: filters.offset,
                      rule: stryMutAct_9fa48('6825')
                        ? ''
                        : (stryCov_9fa48('6825'), 'Both limit and offset must be provided')
                    })
              )
            }
          }

          // Validate pagination parameters
          if (
            stryMutAct_9fa48('6828')
              ? (typeof filters.limit !== 'number' || filters.limit <= 0) && filters.limit > 100
              : stryMutAct_9fa48('6827')
                ? false
                : stryMutAct_9fa48('6826')
                  ? true
                  : (stryCov_9fa48('6826', '6827', '6828'),
                    (stryMutAct_9fa48('6830')
                      ? typeof filters.limit !== 'number' && filters.limit <= 0
                      : stryMutAct_9fa48('6829')
                        ? false
                        : (stryCov_9fa48('6829', '6830'),
                          (stryMutAct_9fa48('6832')
                            ? typeof filters.limit === 'number'
                            : stryMutAct_9fa48('6831')
                              ? false
                              : (stryCov_9fa48('6831', '6832'),
                                typeof filters.limit !==
                                  (stryMutAct_9fa48('6833')
                                    ? ''
                                    : (stryCov_9fa48('6833'), 'number')))) ||
                            (stryMutAct_9fa48('6836')
                              ? filters.limit > 0
                              : stryMutAct_9fa48('6835')
                                ? filters.limit < 0
                                : stryMutAct_9fa48('6834')
                                  ? false
                                  : (stryCov_9fa48('6834', '6835', '6836'),
                                    filters.limit <= 0)))) ||
                      (stryMutAct_9fa48('6839')
                        ? filters.limit <= 100
                        : stryMutAct_9fa48('6838')
                          ? filters.limit >= 100
                          : stryMutAct_9fa48('6837')
                            ? false
                            : (stryCov_9fa48('6837', '6838', '6839'), filters.limit > 100)))
          ) {
            if (stryMutAct_9fa48('6840')) {
              {
              }
            } else {
              stryCov_9fa48('6840')
              throw new BadRequestError(
                stryMutAct_9fa48('6841')
                  ? ''
                  : (stryCov_9fa48('6841'), 'Invalid limit: must be a positive number <= 100'),
                stryMutAct_9fa48('6842')
                  ? {}
                  : (stryCov_9fa48('6842'),
                    {
                      limit: filters.limit,
                      rule: stryMutAct_9fa48('6843')
                        ? ''
                        : (stryCov_9fa48('6843'), 'positive number <= 100 required')
                    })
              )
            }
          }
          if (
            stryMutAct_9fa48('6846')
              ? typeof filters.offset !== 'number' && filters.offset < 0
              : stryMutAct_9fa48('6845')
                ? false
                : stryMutAct_9fa48('6844')
                  ? true
                  : (stryCov_9fa48('6844', '6845', '6846'),
                    (stryMutAct_9fa48('6848')
                      ? typeof filters.offset === 'number'
                      : stryMutAct_9fa48('6847')
                        ? false
                        : (stryCov_9fa48('6847', '6848'),
                          typeof filters.offset !==
                            (stryMutAct_9fa48('6849') ? '' : (stryCov_9fa48('6849'), 'number')))) ||
                      (stryMutAct_9fa48('6852')
                        ? filters.offset >= 0
                        : stryMutAct_9fa48('6851')
                          ? filters.offset <= 0
                          : stryMutAct_9fa48('6850')
                            ? false
                            : (stryCov_9fa48('6850', '6851', '6852'), filters.offset < 0)))
          ) {
            if (stryMutAct_9fa48('6853')) {
              {
              }
            } else {
              stryCov_9fa48('6853')
              throw new BadRequestError(
                stryMutAct_9fa48('6854')
                  ? ''
                  : (stryCov_9fa48('6854'), 'Invalid offset: must be a non-negative number'),
                stryMutAct_9fa48('6855')
                  ? {}
                  : (stryCov_9fa48('6855'),
                    {
                      offset: filters.offset,
                      rule: stryMutAct_9fa48('6856')
                        ? ''
                        : (stryCov_9fa48('6856'), 'non-negative number required')
                    })
              )
            }
          }

          // Prepare repository filters
          const repositoryFilters = {}
          if (
            stryMutAct_9fa48('6859')
              ? filters.role || VALID_ROLES.includes(filters.role)
              : stryMutAct_9fa48('6858')
                ? false
                : stryMutAct_9fa48('6857')
                  ? true
                  : (stryCov_9fa48('6857', '6858', '6859'),
                    filters.role && VALID_ROLES.includes(filters.role))
          ) {
            if (stryMutAct_9fa48('6860')) {
              {
              }
            } else {
              stryCov_9fa48('6860')
              repositoryFilters.role = filters.role
            }
          }
          if (
            stryMutAct_9fa48('6863')
              ? filters.state === undefined
              : stryMutAct_9fa48('6862')
                ? false
                : stryMutAct_9fa48('6861')
                  ? true
                  : (stryCov_9fa48('6861', '6862', '6863'), filters.state !== undefined)
          ) {
            if (stryMutAct_9fa48('6864')) {
              {
              }
            } else {
              stryCov_9fa48('6864')
              repositoryFilters.active = filters.state
            }
          }
          if (
            stryMutAct_9fa48('6867')
              ? filters.email_verified === undefined
              : stryMutAct_9fa48('6866')
                ? false
                : stryMutAct_9fa48('6865')
                  ? true
                  : (stryCov_9fa48('6865', '6866', '6867'), filters.email_verified !== undefined)
          ) {
            if (stryMutAct_9fa48('6868')) {
              {
              }
            } else {
              stryCov_9fa48('6868')
              repositoryFilters.email_verified = filters.email_verified
            }
          }

          // Use repository to get users with filters
          const data = await userRepository.findAll(
            repositoryFilters,
            stryMutAct_9fa48('6869')
              ? {}
              : (stryCov_9fa48('6869'),
                {
                  limit: filters.limit,
                  offset: filters.offset,
                  orderBy: stryMutAct_9fa48('6870') ? '' : (stryCov_9fa48('6870'), 'created_at'),
                  ascending: stryMutAct_9fa48('6871') ? true : (stryCov_9fa48('6871'), false)
                })
          )
          if (
            stryMutAct_9fa48('6874')
              ? false
              : stryMutAct_9fa48('6873')
                ? true
                : stryMutAct_9fa48('6872')
                  ? data
                  : (stryCov_9fa48('6872', '6873', '6874'), !data)
          ) {
            if (stryMutAct_9fa48('6875')) {
              {
              }
            } else {
              stryCov_9fa48('6875')
              throw new NotFoundError(
                stryMutAct_9fa48('6876') ? '' : (stryCov_9fa48('6876'), 'Users'),
                null
              )
            }
          }
          return data
        }
      },
      stryMutAct_9fa48('6877') ? '' : (stryCov_9fa48('6877'), 'getUsersByFilter'),
      stryMutAct_9fa48('6878')
        ? {}
        : (stryCov_9fa48('6878'),
          {
            filters
          })
    )
  }
}

/**
 * Create new user (client registration - no password required)
 */
export function createUser(userData) {
  if (stryMutAct_9fa48('6879')) {
    {
    }
  } else {
    stryCov_9fa48('6879')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6880')) {
          {
          }
        } else {
          stryCov_9fa48('6880')
          const userRepository = getUserRepository()

          // Validate required fields for client registration
          if (
            stryMutAct_9fa48('6883')
              ? !userData.email && typeof userData.email !== 'string'
              : stryMutAct_9fa48('6882')
                ? false
                : stryMutAct_9fa48('6881')
                  ? true
                  : (stryCov_9fa48('6881', '6882', '6883'),
                    (stryMutAct_9fa48('6884')
                      ? userData.email
                      : (stryCov_9fa48('6884'), !userData.email)) ||
                      (stryMutAct_9fa48('6886')
                        ? typeof userData.email === 'string'
                        : stryMutAct_9fa48('6885')
                          ? false
                          : (stryCov_9fa48('6885', '6886'),
                            typeof userData.email !==
                              (stryMutAct_9fa48('6887') ? '' : (stryCov_9fa48('6887'), 'string')))))
          ) {
            if (stryMutAct_9fa48('6888')) {
              {
              }
            } else {
              stryCov_9fa48('6888')
              throw new ValidationError(
                stryMutAct_9fa48('6889')
                  ? ''
                  : (stryCov_9fa48('6889'), 'Email is required and must be a string'),
                stryMutAct_9fa48('6890')
                  ? {}
                  : (stryCov_9fa48('6890'),
                    {
                      field: stryMutAct_9fa48('6891') ? '' : (stryCov_9fa48('6891'), 'email'),
                      value: userData.email,
                      rule: stryMutAct_9fa48('6892')
                        ? ''
                        : (stryCov_9fa48('6892'), 'required string')
                    })
              )
            }
          }

          // Validate email format (simple check - no regex as requested)
          if (
            stryMutAct_9fa48('6895')
              ? !userData.email.includes('@') && !userData.email.includes('.')
              : stryMutAct_9fa48('6894')
                ? false
                : stryMutAct_9fa48('6893')
                  ? true
                  : (stryCov_9fa48('6893', '6894', '6895'),
                    (stryMutAct_9fa48('6896')
                      ? userData.email.includes('@')
                      : (stryCov_9fa48('6896'),
                        !userData.email.includes(
                          stryMutAct_9fa48('6897') ? '' : (stryCov_9fa48('6897'), '@')
                        ))) ||
                      (stryMutAct_9fa48('6898')
                        ? userData.email.includes('.')
                        : (stryCov_9fa48('6898'),
                          !userData.email.includes(
                            stryMutAct_9fa48('6899') ? '' : (stryCov_9fa48('6899'), '.')
                          ))))
          ) {
            if (stryMutAct_9fa48('6900')) {
              {
              }
            } else {
              stryCov_9fa48('6900')
              throw new ValidationError(
                stryMutAct_9fa48('6901') ? '' : (stryCov_9fa48('6901'), 'Invalid email format'),
                stryMutAct_9fa48('6902')
                  ? {}
                  : (stryCov_9fa48('6902'),
                    {
                      field: stryMutAct_9fa48('6903') ? '' : (stryCov_9fa48('6903'), 'email'),
                      value: userData.email,
                      rule: stryMutAct_9fa48('6904')
                        ? ''
                        : (stryCov_9fa48('6904'), 'valid email format required')
                    })
              )
            }
          }

          // For client registration, password is optional
          // For admin creation, password is required
          if (
            stryMutAct_9fa48('6907')
              ? userData.role === 'admin' || !userData.password_hash
              : stryMutAct_9fa48('6906')
                ? false
                : stryMutAct_9fa48('6905')
                  ? true
                  : (stryCov_9fa48('6905', '6906', '6907'),
                    (stryMutAct_9fa48('6909')
                      ? userData.role !== 'admin'
                      : stryMutAct_9fa48('6908')
                        ? true
                        : (stryCov_9fa48('6908', '6909'),
                          userData.role ===
                            (stryMutAct_9fa48('6910') ? '' : (stryCov_9fa48('6910'), 'admin')))) &&
                      (stryMutAct_9fa48('6911')
                        ? userData.password_hash
                        : (stryCov_9fa48('6911'), !userData.password_hash)))
          ) {
            if (stryMutAct_9fa48('6912')) {
              {
              }
            } else {
              stryCov_9fa48('6912')
              throw new ValidationError(
                stryMutAct_9fa48('6913')
                  ? ''
                  : (stryCov_9fa48('6913'), 'Password is required for admin users'),
                stryMutAct_9fa48('6914')
                  ? {}
                  : (stryCov_9fa48('6914'),
                    {
                      field: stryMutAct_9fa48('6915')
                        ? ''
                        : (stryCov_9fa48('6915'), 'password_hash'),
                      rule: stryMutAct_9fa48('6916')
                        ? ''
                        : (stryCov_9fa48('6916'), 'required for admin role')
                    })
              )
            }
          }

          // Validate role if provided
          if (
            stryMutAct_9fa48('6919')
              ? userData.role || !VALID_ROLES.includes(userData.role)
              : stryMutAct_9fa48('6918')
                ? false
                : stryMutAct_9fa48('6917')
                  ? true
                  : (stryCov_9fa48('6917', '6918', '6919'),
                    userData.role &&
                      (stryMutAct_9fa48('6920')
                        ? VALID_ROLES.includes(userData.role)
                        : (stryCov_9fa48('6920'), !VALID_ROLES.includes(userData.role))))
          ) {
            if (stryMutAct_9fa48('6921')) {
              {
              }
            } else {
              stryCov_9fa48('6921')
              throw new ValidationError(
                stryMutAct_9fa48('6922')
                  ? ``
                  : (stryCov_9fa48('6922'),
                    `Invalid role: must be one of ${VALID_ROLES.join(stryMutAct_9fa48('6923') ? '' : (stryCov_9fa48('6923'), ', '))}`),
                stryMutAct_9fa48('6924')
                  ? {}
                  : (stryCov_9fa48('6924'),
                    {
                      field: stryMutAct_9fa48('6925') ? '' : (stryCov_9fa48('6925'), 'role'),
                      value: userData.role,
                      validValues: VALID_ROLES
                    })
              )
            }
          }

          // FAIL FAST - Explicit field requirements
          const newUser = stryMutAct_9fa48('6926')
            ? {}
            : (stryCov_9fa48('6926'),
              {
                email: userData.email,
                full_name: stryMutAct_9fa48('6927')
                  ? userData.full_name && null
                  : (stryCov_9fa48('6927'), userData.full_name ?? null),
                phone: stryMutAct_9fa48('6928')
                  ? userData.phone && null
                  : (stryCov_9fa48('6928'), userData.phone ?? null),
                role: stryMutAct_9fa48('6929')
                  ? userData.role && 'user'
                  : (stryCov_9fa48('6929'),
                    userData.role ??
                      (stryMutAct_9fa48('6930') ? '' : (stryCov_9fa48('6930'), 'user'))),
                password_hash: stryMutAct_9fa48('6931')
                  ? userData.password_hash && null
                  : (stryCov_9fa48('6931'), userData.password_hash ?? null),
                active: stryMutAct_9fa48('6932') ? false : (stryCov_9fa48('6932'), true),
                email_verified: stryMutAct_9fa48('6933')
                  ? userData.email_verified && false
                  : (stryCov_9fa48('6933'),
                    userData.email_verified ??
                      (stryMutAct_9fa48('6934') ? true : (stryCov_9fa48('6934'), false)))
              })

          // Use repository's create method
          const data = await userRepository.create(newUser)
          return data
        }
      },
      stryMutAct_9fa48('6935') ? '' : (stryCov_9fa48('6935'), 'createUser'),
      stryMutAct_9fa48('6936')
        ? {}
        : (stryCov_9fa48('6936'),
          {
            email: userData.email
          })
    )
  }
}

/**
 * Update user
 */
export function updateUser(id, updates) {
  if (stryMutAct_9fa48('6937')) {
    {
    }
  } else {
    stryCov_9fa48('6937')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6938')) {
          {
          }
        } else {
          stryCov_9fa48('6938')
          const userRepository = getUserRepository()
          validateUserId(id, stryMutAct_9fa48('6939') ? '' : (stryCov_9fa48('6939'), 'updateUser'))
          if (
            stryMutAct_9fa48('6942')
              ? !updates && Object.keys(updates).length === 0
              : stryMutAct_9fa48('6941')
                ? false
                : stryMutAct_9fa48('6940')
                  ? true
                  : (stryCov_9fa48('6940', '6941', '6942'),
                    (stryMutAct_9fa48('6943') ? updates : (stryCov_9fa48('6943'), !updates)) ||
                      (stryMutAct_9fa48('6945')
                        ? Object.keys(updates).length !== 0
                        : stryMutAct_9fa48('6944')
                          ? false
                          : (stryCov_9fa48('6944', '6945'), Object.keys(updates).length === 0)))
          ) {
            if (stryMutAct_9fa48('6946')) {
              {
              }
            } else {
              stryCov_9fa48('6946')
              throw new BadRequestError(
                stryMutAct_9fa48('6947') ? '' : (stryCov_9fa48('6947'), 'No updates provided'),
                stryMutAct_9fa48('6948')
                  ? {}
                  : (stryCov_9fa48('6948'),
                    {
                      userId: id
                    })
              )
            }
          }

          // Validate role if being updated
          if (
            stryMutAct_9fa48('6951')
              ? updates.role || !VALID_ROLES.includes(updates.role)
              : stryMutAct_9fa48('6950')
                ? false
                : stryMutAct_9fa48('6949')
                  ? true
                  : (stryCov_9fa48('6949', '6950', '6951'),
                    updates.role &&
                      (stryMutAct_9fa48('6952')
                        ? VALID_ROLES.includes(updates.role)
                        : (stryCov_9fa48('6952'), !VALID_ROLES.includes(updates.role))))
          ) {
            if (stryMutAct_9fa48('6953')) {
              {
              }
            } else {
              stryCov_9fa48('6953')
              throw new ValidationError(
                stryMutAct_9fa48('6954')
                  ? ``
                  : (stryCov_9fa48('6954'),
                    `Invalid role: must be one of ${VALID_ROLES.join(stryMutAct_9fa48('6955') ? '' : (stryCov_9fa48('6955'), ', '))}`),
                stryMutAct_9fa48('6956')
                  ? {}
                  : (stryCov_9fa48('6956'),
                    {
                      field: stryMutAct_9fa48('6957') ? '' : (stryCov_9fa48('6957'), 'role'),
                      value: updates.role,
                      validValues: VALID_ROLES
                    })
              )
            }
          }

          // Use repository's update method
          const data = await userRepository.update(id, updates)
          return data
        }
      },
      stryMutAct_9fa48('6958') ? `` : (stryCov_9fa48('6958'), `updateUser(${id})`),
      stryMutAct_9fa48('6959')
        ? {}
        : (stryCov_9fa48('6959'),
          {
            userId: id
          })
    )
  }
}

/**
 * Soft-delete user
 */
export function deleteUser(id) {
  if (stryMutAct_9fa48('6960')) {
    {
    }
  } else {
    stryCov_9fa48('6960')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6961')) {
          {
          }
        } else {
          stryCov_9fa48('6961')
          const userRepository = getUserRepository()
          validateUserId(id, stryMutAct_9fa48('6962') ? '' : (stryCov_9fa48('6962'), 'deleteUser'))

          // Use repository's delete method (soft-delete)
          const data = await userRepository.delete(id)
          return data
        }
      },
      stryMutAct_9fa48('6963') ? `` : (stryCov_9fa48('6963'), `deleteUser(${id})`),
      stryMutAct_9fa48('6964')
        ? {}
        : (stryCov_9fa48('6964'),
          {
            userId: id
          })
    )
  }
}

/**
 * Reactivate user (undo soft-delete)
 * @param {number} id - User ID to reactivate
 * @returns {Promise<Object>} Reactivated user data
 */
export function reactivateUser(id) {
  if (stryMutAct_9fa48('6965')) {
    {
    }
  } else {
    stryCov_9fa48('6965')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6966')) {
          {
          }
        } else {
          stryCov_9fa48('6966')
          const userRepository = getUserRepository()
          validateUserId(
            id,
            stryMutAct_9fa48('6967') ? '' : (stryCov_9fa48('6967'), 'reactivateUser')
          )

          // Use repository's reactivate method
          const data = await userRepository.reactivate(id)
          return data
        }
      },
      stryMutAct_9fa48('6968') ? `` : (stryCov_9fa48('6968'), `reactivateUser(${id})`),
      stryMutAct_9fa48('6969')
        ? {}
        : (stryCov_9fa48('6969'),
          {
            userId: id
          })
    )
  }
}

/**
 * Verify user email
 * @param {number} id - User ID to verify email for
 * @returns {Promise<Object>} Updated user data with verified email
 */
export function verifyUserEmail(id) {
  if (stryMutAct_9fa48('6970')) {
    {
    }
  } else {
    stryCov_9fa48('6970')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6971')) {
          {
          }
        } else {
          stryCov_9fa48('6971')
          const userRepository = getUserRepository()
          validateUserId(
            id,
            stryMutAct_9fa48('6972') ? '' : (stryCov_9fa48('6972'), 'verifyUserEmail')
          )

          // Use repository's verifyEmail method
          const data = await userRepository.verifyEmail(id)
          return data
        }
      },
      stryMutAct_9fa48('6973') ? `` : (stryCov_9fa48('6973'), `verifyUserEmail(${id})`),
      stryMutAct_9fa48('6974')
        ? {}
        : (stryCov_9fa48('6974'),
          {
            userId: id
          })
    )
  }
}
