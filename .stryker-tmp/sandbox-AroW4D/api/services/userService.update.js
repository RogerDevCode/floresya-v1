/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service - Update Operations
 * Handles user update operations
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
  BadRequestError,
  ValidationError,
  VALID_ROLES
} from './userService.helpers.js'

/**
 * Update user
 */
export function updateUser(id, updates) {
  if (stryMutAct_9fa48('7046')) {
    {
    }
  } else {
    stryCov_9fa48('7046')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('7047')) {
          {
          }
        } else {
          stryCov_9fa48('7047')
          const userRepository = getUserRepository()
          if (
            stryMutAct_9fa48('7050')
              ? !id && typeof id !== 'number'
              : stryMutAct_9fa48('7049')
                ? false
                : stryMutAct_9fa48('7048')
                  ? true
                  : (stryCov_9fa48('7048', '7049', '7050'),
                    (stryMutAct_9fa48('7051') ? id : (stryCov_9fa48('7051'), !id)) ||
                      (stryMutAct_9fa48('7053')
                        ? typeof id === 'number'
                        : stryMutAct_9fa48('7052')
                          ? false
                          : (stryCov_9fa48('7052', '7053'),
                            typeof id !==
                              (stryMutAct_9fa48('7054') ? '' : (stryCov_9fa48('7054'), 'number')))))
          ) {
            if (stryMutAct_9fa48('7055')) {
              {
              }
            } else {
              stryCov_9fa48('7055')
              throw new BadRequestError(
                stryMutAct_9fa48('7056')
                  ? ''
                  : (stryCov_9fa48('7056'), 'Invalid user ID: must be a number'),
                stryMutAct_9fa48('7057')
                  ? {}
                  : (stryCov_9fa48('7057'),
                    {
                      userId: id
                    })
              )
            }
          }
          if (
            stryMutAct_9fa48('7060')
              ? !updates && Object.keys(updates).length === 0
              : stryMutAct_9fa48('7059')
                ? false
                : stryMutAct_9fa48('7058')
                  ? true
                  : (stryCov_9fa48('7058', '7059', '7060'),
                    (stryMutAct_9fa48('7061') ? updates : (stryCov_9fa48('7061'), !updates)) ||
                      (stryMutAct_9fa48('7063')
                        ? Object.keys(updates).length !== 0
                        : stryMutAct_9fa48('7062')
                          ? false
                          : (stryCov_9fa48('7062', '7063'), Object.keys(updates).length === 0)))
          ) {
            if (stryMutAct_9fa48('7064')) {
              {
              }
            } else {
              stryCov_9fa48('7064')
              throw new BadRequestError(
                stryMutAct_9fa48('7065') ? '' : (stryCov_9fa48('7065'), 'No updates provided'),
                stryMutAct_9fa48('7066')
                  ? {}
                  : (stryCov_9fa48('7066'),
                    {
                      userId: id
                    })
              )
            }
          }

          // Validate role if being updated
          if (
            stryMutAct_9fa48('7069')
              ? updates.role || !VALID_ROLES.includes(updates.role)
              : stryMutAct_9fa48('7068')
                ? false
                : stryMutAct_9fa48('7067')
                  ? true
                  : (stryCov_9fa48('7067', '7068', '7069'),
                    updates.role &&
                      (stryMutAct_9fa48('7070')
                        ? VALID_ROLES.includes(updates.role)
                        : (stryCov_9fa48('7070'), !VALID_ROLES.includes(updates.role))))
          ) {
            if (stryMutAct_9fa48('7071')) {
              {
              }
            } else {
              stryCov_9fa48('7071')
              throw new ValidationError(
                stryMutAct_9fa48('7072')
                  ? ``
                  : (stryCov_9fa48('7072'),
                    `Invalid role: must be one of ${VALID_ROLES.join(stryMutAct_9fa48('7073') ? '' : (stryCov_9fa48('7073'), ', '))}`),
                stryMutAct_9fa48('7074')
                  ? {}
                  : (stryCov_9fa48('7074'),
                    {
                      field: stryMutAct_9fa48('7075') ? '' : (stryCov_9fa48('7075'), 'role'),
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
      stryMutAct_9fa48('7076') ? `` : (stryCov_9fa48('7076'), `updateUser(${id})`),
      stryMutAct_9fa48('7077')
        ? {}
        : (stryCov_9fa48('7077'),
          {
            userId: id
          })
    )
  }
}
