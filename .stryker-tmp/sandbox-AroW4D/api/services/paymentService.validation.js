/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Payment Service - Validation & Utilities
 * Handles validation and utility functions
 * LEGACY: Modularizado desde paymentService.js (PHASE 5)
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
import { validateEmail, validateVenezuelanPhone } from '../utils/validation.js'

/**
 * Validate Venezuelan phone number format (FAIL-FAST version)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid Venezuelan format
 * @throws {ValidationError} When phone format is invalid
 * @example
 * isValidVenezuelanPhone('04141234567') // Returns: true
 * isValidVenezuelanPhone('584141234567') // Returns: true
 * isValidVenezuelanPhone('123456789') // Throws ValidationError
 */
export function isValidVenezuelanPhone(phone) {
  if (stryMutAct_9fa48('4011')) {
    {
    }
  } else {
    stryCov_9fa48('4011')
    try {
      if (stryMutAct_9fa48('4012')) {
        {
        }
      } else {
        stryCov_9fa48('4012')
        validateVenezuelanPhone(phone)
        return stryMutAct_9fa48('4013') ? false : (stryCov_9fa48('4013'), true)
      }
    } catch (error) {
      if (stryMutAct_9fa48('4014')) {
        {
        }
      } else {
        stryCov_9fa48('4014')
        console.error(error)
        return stryMutAct_9fa48('4015') ? true : (stryCov_9fa48('4015'), false)
      }
    }
  }
}

/**
 * Validate email format using regex pattern (FAIL-FAST version)
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 * @throws {ValidationError} When email format is invalid
 * @example
 * isValidEmail('user@example.com') // Returns: true
 * isValidEmail('invalid-email') // Returns: false
 */
export function isValidEmail(email) {
  if (stryMutAct_9fa48('4016')) {
    {
    }
  } else {
    stryCov_9fa48('4016')
    try {
      if (stryMutAct_9fa48('4017')) {
        {
        }
      } else {
        stryCov_9fa48('4017')
        validateEmail(email)
        return stryMutAct_9fa48('4018') ? false : (stryCov_9fa48('4018'), true)
      }
    } catch (error) {
      if (stryMutAct_9fa48('4019')) {
        {
        }
      } else {
        stryCov_9fa48('4019')
        console.error(error)
        return stryMutAct_9fa48('4020') ? true : (stryCov_9fa48('4020'), false)
      }
    }
  }
}

/**
 * Generate unique order reference with timestamp and random component
 * @returns {string} - Unique order reference in format FY-{timestamp}{random}
 * @example
 * generateOrderReference() // Returns: 'FY-123456789'
 */
export function generateOrderReference() {
  if (stryMutAct_9fa48('4021')) {
    {
    }
  } else {
    stryCov_9fa48('4021')
    const timestamp = stryMutAct_9fa48('4022')
      ? Date.now().toString()
      : (stryCov_9fa48('4022'),
        Date.now()
          .toString()
          .slice(stryMutAct_9fa48('4023') ? +6 : (stryCov_9fa48('4023'), -6)))
    const random = Math.floor(
      stryMutAct_9fa48('4024')
        ? Math.random() / 1000
        : (stryCov_9fa48('4024'), Math.random() * 1000)
    )
      .toString()
      .padStart(3, stryMutAct_9fa48('4025') ? '' : (stryCov_9fa48('4025'), '0'))
    return stryMutAct_9fa48('4026') ? `` : (stryCov_9fa48('4026'), `FY-${timestamp}${random}`)
  }
}
