/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service - Verification Operations
 * Handles user verification operations
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
 * Verify user email
 * @param {number} id - User ID to verify email for
 * @returns {Promise<Object>} Updated user data with verified email
 */
export function verifyUserEmail(id) {
  if (stryMutAct_9fa48('7078')) {
    {
    }
  } else {
    stryCov_9fa48('7078')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('7079')) {
          {
          }
        } else {
          stryCov_9fa48('7079')
          const userRepository = getUserRepository()
          validateUserId(
            id,
            stryMutAct_9fa48('7080') ? '' : (stryCov_9fa48('7080'), 'verifyUserEmail')
          )

          // Use repository's verifyEmail method
          const data = await userRepository.verifyEmail(id)
          return data
        }
      },
      stryMutAct_9fa48('7081') ? `` : (stryCov_9fa48('7081'), `verifyUserEmail(${id})`),
      stryMutAct_9fa48('7082')
        ? {}
        : (stryCov_9fa48('7082'),
          {
            userId: id
          })
    )
  }
}
