/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service - Read Operations
 * Handles all user retrieval operations
 * LEGACY: Modularizado desde userService.js (WEEK 4)
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
import {
  getUserRepository,
  withErrorHandling,
  withErrorMapping,
  NotFoundError,
  BadRequestError,
  ValidationError,
  TABLE
} from './userService.helpers.js'

/**
 * Get all users with simple filters (KISS principle)
 * - Shows ALL users by default (no pagination required)
 * - Only applies filters when explicitly provided
 */
export function getAllUsers(
  filters = {},
  includeDeactivated = stryMutAct_9fa48('6975') ? true : (stryCov_9fa48('6975'), false)
) {
  if (stryMutAct_9fa48('6976')) {
    {
    }
  } else {
    stryCov_9fa48('6976')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6977')) {
          {
          }
        } else {
          stryCov_9fa48('6977')
          const userRepository = getUserRepository()

          // Use repository to get users with filters
          const data = await userRepository.findAllWithFilters(
            filters,
            stryMutAct_9fa48('6978')
              ? {}
              : (stryCov_9fa48('6978'),
                {
                  includeDeactivated,
                  orderBy: stryMutAct_9fa48('6979') ? '' : (stryCov_9fa48('6979'), 'created_at'),
                  ascending: stryMutAct_9fa48('6980') ? true : (stryCov_9fa48('6980'), false)
                })
          )

          // Don't throw error if no users found - return empty array
          return stryMutAct_9fa48('6983')
            ? data && []
            : stryMutAct_9fa48('6982')
              ? false
              : stryMutAct_9fa48('6981')
                ? true
                : (stryCov_9fa48('6981', '6982', '6983'),
                  data ||
                    (stryMutAct_9fa48('6984') ? ['Stryker was here'] : (stryCov_9fa48('6984'), [])))
        }
      },
      stryMutAct_9fa48('6985') ? '' : (stryCov_9fa48('6985'), 'getAllUsers'),
      stryMutAct_9fa48('6986')
        ? {}
        : (stryCov_9fa48('6986'),
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
    includeDeactivated = stryMutAct_9fa48('6987') ? true : (stryCov_9fa48('6987'), false)
  ) => {
    if (stryMutAct_9fa48('6988')) {
      {
      }
    } else {
      stryCov_9fa48('6988')
      const userRepository = getUserRepository()
      if (
        stryMutAct_9fa48('6991')
          ? !id && typeof id !== 'number'
          : stryMutAct_9fa48('6990')
            ? false
            : stryMutAct_9fa48('6989')
              ? true
              : (stryCov_9fa48('6989', '6990', '6991'),
                (stryMutAct_9fa48('6992') ? id : (stryCov_9fa48('6992'), !id)) ||
                  (stryMutAct_9fa48('6994')
                    ? typeof id === 'number'
                    : stryMutAct_9fa48('6993')
                      ? false
                      : (stryCov_9fa48('6993', '6994'),
                        typeof id !==
                          (stryMutAct_9fa48('6995') ? '' : (stryCov_9fa48('6995'), 'number')))))
      ) {
        if (stryMutAct_9fa48('6996')) {
          {
          }
        } else {
          stryCov_9fa48('6996')
          throw new BadRequestError(
            stryMutAct_9fa48('6997')
              ? ''
              : (stryCov_9fa48('6997'), 'Invalid user ID: must be a number'),
            stryMutAct_9fa48('6998')
              ? {}
              : (stryCov_9fa48('6998'),
                {
                  userId: id
                })
          )
        }
      }

      // Use repository to get user
      const data = await userRepository.findById(id, includeDeactivated)
      if (
        stryMutAct_9fa48('7001')
          ? false
          : stryMutAct_9fa48('7000')
            ? true
            : stryMutAct_9fa48('6999')
              ? data
              : (stryCov_9fa48('6999', '7000', '7001'), !data)
      ) {
        if (stryMutAct_9fa48('7002')) {
          {
          }
        } else {
          stryCov_9fa48('7002')
          throw new NotFoundError(
            stryMutAct_9fa48('7003') ? '' : (stryCov_9fa48('7003'), 'User'),
            id,
            stryMutAct_9fa48('7004')
              ? {}
              : (stryCov_9fa48('7004'),
                {
                  includeDeactivated
                })
          )
        }
      }
      return data
    }
  },
  stryMutAct_9fa48('7005') ? '' : (stryCov_9fa48('7005'), 'SELECT'),
  TABLE
)

/**
 * Get user by email
 */
export function getUserByEmail(
  email,
  includeDeactivated = stryMutAct_9fa48('7006') ? true : (stryCov_9fa48('7006'), false)
) {
  if (stryMutAct_9fa48('7007')) {
    {
    }
  } else {
    stryCov_9fa48('7007')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('7008')) {
          {
          }
        } else {
          stryCov_9fa48('7008')
          const userRepository = getUserRepository()

          // FAIL FAST - Validate email parameter
          if (
            stryMutAct_9fa48('7011')
              ? false
              : stryMutAct_9fa48('7010')
                ? true
                : stryMutAct_9fa48('7009')
                  ? email
                  : (stryCov_9fa48('7009', '7010', '7011'), !email)
          ) {
            if (stryMutAct_9fa48('7012')) {
              {
              }
            } else {
              stryCov_9fa48('7012')
              throw new BadRequestError(
                stryMutAct_9fa48('7013') ? '' : (stryCov_9fa48('7013'), 'Email is required'),
                stryMutAct_9fa48('7014')
                  ? {}
                  : (stryCov_9fa48('7014'),
                    {
                      email
                    })
              )
            }
          }
          if (
            stryMutAct_9fa48('7017')
              ? typeof email === 'string'
              : stryMutAct_9fa48('7016')
                ? false
                : stryMutAct_9fa48('7015')
                  ? true
                  : (stryCov_9fa48('7015', '7016', '7017'),
                    typeof email !==
                      (stryMutAct_9fa48('7018') ? '' : (stryCov_9fa48('7018'), 'string')))
          ) {
            if (stryMutAct_9fa48('7019')) {
              {
              }
            } else {
              stryCov_9fa48('7019')
              throw new BadRequestError(
                stryMutAct_9fa48('7020') ? '' : (stryCov_9fa48('7020'), 'Email must be a string'),
                stryMutAct_9fa48('7021')
                  ? {}
                  : (stryCov_9fa48('7021'),
                    {
                      email,
                      type: typeof email
                    })
              )
            }
          }

          // FAIL FAST - Basic email format validation
          if (
            stryMutAct_9fa48('7024')
              ? !email.includes('@') && !email.includes('.')
              : stryMutAct_9fa48('7023')
                ? false
                : stryMutAct_9fa48('7022')
                  ? true
                  : (stryCov_9fa48('7022', '7023', '7024'),
                    (stryMutAct_9fa48('7025')
                      ? email.includes('@')
                      : (stryCov_9fa48('7025'),
                        !email.includes(
                          stryMutAct_9fa48('7026') ? '' : (stryCov_9fa48('7026'), '@')
                        ))) ||
                      (stryMutAct_9fa48('7027')
                        ? email.includes('.')
                        : (stryCov_9fa48('7027'),
                          !email.includes(
                            stryMutAct_9fa48('7028') ? '' : (stryCov_9fa48('7028'), '.')
                          ))))
          ) {
            if (stryMutAct_9fa48('7029')) {
              {
              }
            } else {
              stryCov_9fa48('7029')
              throw new ValidationError(
                stryMutAct_9fa48('7030') ? '' : (stryCov_9fa48('7030'), 'Invalid email format'),
                stryMutAct_9fa48('7031')
                  ? {}
                  : (stryCov_9fa48('7031'),
                    {
                      field: stryMutAct_9fa48('7032') ? '' : (stryCov_9fa48('7032'), 'email'),
                      value: email,
                      rule: stryMutAct_9fa48('7033')
                        ? ''
                        : (stryCov_9fa48('7033'), 'valid email format required')
                    })
              )
            }
          }

          // Use repository to get user by email
          const data = await userRepository.findByEmail(email, includeDeactivated)
          if (
            stryMutAct_9fa48('7036')
              ? false
              : stryMutAct_9fa48('7035')
                ? true
                : stryMutAct_9fa48('7034')
                  ? data
                  : (stryCov_9fa48('7034', '7035', '7036'), !data)
          ) {
            if (stryMutAct_9fa48('7037')) {
              {
              }
            } else {
              stryCov_9fa48('7037')
              throw new NotFoundError(
                stryMutAct_9fa48('7038') ? '' : (stryCov_9fa48('7038'), 'User'),
                email,
                stryMutAct_9fa48('7039')
                  ? {}
                  : (stryCov_9fa48('7039'),
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
      stryMutAct_9fa48('7040') ? `` : (stryCov_9fa48('7040'), `getUserByEmail(${email})`),
      stryMutAct_9fa48('7041')
        ? {}
        : (stryCov_9fa48('7041'),
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
  if (stryMutAct_9fa48('7042')) {
    {
    }
  } else {
    stryCov_9fa48('7042')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('7043')) {
          {
          }
        } else {
          stryCov_9fa48('7043')
          const userRepository = getUserRepository()

          // Use repository's filter method instead of direct supabase query
          const data = await userRepository.findByFilter(filters)
          return data
        }
      },
      stryMutAct_9fa48('7044') ? '' : (stryCov_9fa48('7044'), 'getUsersByFilter'),
      stryMutAct_9fa48('7045')
        ? {}
        : (stryCov_9fa48('7045'),
          {
            filters
          })
    )
  }
}
