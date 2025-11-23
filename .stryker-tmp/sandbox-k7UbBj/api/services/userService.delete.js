/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service - Delete Operations
 * Handles user soft-delete and reactivation operations
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
import { getUserRepository, withErrorHandling, validateUserId } from './userService.helpers.js'

/**
 * Soft-delete user
 */
export function deleteUser(id) {
  if (stryMutAct_9fa48('6710')) {
    {
    }
  } else {
    stryCov_9fa48('6710')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6711')) {
          {
          }
        } else {
          stryCov_9fa48('6711')
          const userRepository = getUserRepository()
          validateUserId(id, stryMutAct_9fa48('6712') ? '' : (stryCov_9fa48('6712'), 'deleteUser'))

          // Use repository's delete method (soft-delete)
          const data = await userRepository.delete(id)
          return data
        }
      },
      stryMutAct_9fa48('6713') ? `` : (stryCov_9fa48('6713'), `deleteUser(${id})`),
      stryMutAct_9fa48('6714')
        ? {}
        : (stryCov_9fa48('6714'),
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
  if (stryMutAct_9fa48('6715')) {
    {
    }
  } else {
    stryCov_9fa48('6715')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6716')) {
          {
          }
        } else {
          stryCov_9fa48('6716')
          const userRepository = getUserRepository()
          validateUserId(
            id,
            stryMutAct_9fa48('6717') ? '' : (stryCov_9fa48('6717'), 'reactivateUser')
          )

          // Use repository's reactivate method
          const data = await userRepository.reactivate(id)
          return data
        }
      },
      stryMutAct_9fa48('6718') ? `` : (stryCov_9fa48('6718'), `reactivateUser(${id})`),
      stryMutAct_9fa48('6719')
        ? {}
        : (stryCov_9fa48('6719'),
          {
            userId: id
          })
    )
  }
}
