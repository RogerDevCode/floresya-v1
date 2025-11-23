/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Auth Service - Helper Functions & Shared Imports
 * LEGACY: Modularizado desde authService.js (PHASE 6)
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
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  InternalServerError
} from '../errors/AppError.js'

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {BadRequestError} If email is invalid
 */
function validateEmail(email) {
  if (stryMutAct_9fa48('428')) {
    {
    }
  } else {
    stryCov_9fa48('428')
    if (
      stryMutAct_9fa48('431')
        ? !email && typeof email !== 'string'
        : stryMutAct_9fa48('430')
          ? false
          : stryMutAct_9fa48('429')
            ? true
            : (stryCov_9fa48('429', '430', '431'),
              (stryMutAct_9fa48('432') ? email : (stryCov_9fa48('432'), !email)) ||
                (stryMutAct_9fa48('434')
                  ? typeof email === 'string'
                  : stryMutAct_9fa48('433')
                    ? false
                    : (stryCov_9fa48('433', '434'),
                      typeof email !==
                        (stryMutAct_9fa48('435') ? '' : (stryCov_9fa48('435'), 'string')))))
    ) {
      if (stryMutAct_9fa48('436')) {
        {
        }
      } else {
        stryCov_9fa48('436')
        throw new BadRequestError(
          stryMutAct_9fa48('437')
            ? ''
            : (stryCov_9fa48('437'), 'Email is required and must be a string'),
          stryMutAct_9fa48('438')
            ? {}
            : (stryCov_9fa48('438'),
              {
                email
              })
        )
      }
    }
    const emailRegex = stryMutAct_9fa48('449')
      ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/
      : stryMutAct_9fa48('448')
        ? /^[^\s@]+@[^\s@]+\.[\s@]+$/
        : stryMutAct_9fa48('447')
          ? /^[^\s@]+@[^\s@]+\.[^\s@]$/
          : stryMutAct_9fa48('446')
            ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/
            : stryMutAct_9fa48('445')
              ? /^[^\s@]+@[\s@]+\.[^\s@]+$/
              : stryMutAct_9fa48('444')
                ? /^[^\s@]+@[^\s@]\.[^\s@]+$/
                : stryMutAct_9fa48('443')
                  ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/
                  : stryMutAct_9fa48('442')
                    ? /^[\s@]+@[^\s@]+\.[^\s@]+$/
                    : stryMutAct_9fa48('441')
                      ? /^[^\s@]@[^\s@]+\.[^\s@]+$/
                      : stryMutAct_9fa48('440')
                        ? /^[^\s@]+@[^\s@]+\.[^\s@]+/
                        : stryMutAct_9fa48('439')
                          ? /[^\s@]+@[^\s@]+\.[^\s@]+$/
                          : (stryCov_9fa48(
                              '439',
                              '440',
                              '441',
                              '442',
                              '443',
                              '444',
                              '445',
                              '446',
                              '447',
                              '448',
                              '449'
                            ),
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    if (
      stryMutAct_9fa48('452')
        ? false
        : stryMutAct_9fa48('451')
          ? true
          : stryMutAct_9fa48('450')
            ? emailRegex.test(email)
            : (stryCov_9fa48('450', '451', '452'), !emailRegex.test(email))
    ) {
      if (stryMutAct_9fa48('453')) {
        {
        }
      } else {
        stryCov_9fa48('453')
        throw new BadRequestError(
          stryMutAct_9fa48('454') ? '' : (stryCov_9fa48('454'), 'Invalid email format'),
          stryMutAct_9fa48('455')
            ? {}
            : (stryCov_9fa48('455'),
              {
                email
              })
        )
      }
    }
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @throws {BadRequestError} If password doesn't meet policy
 */
function validatePassword(password) {
  if (stryMutAct_9fa48('456')) {
    {
    }
  } else {
    stryCov_9fa48('456')
    if (
      stryMutAct_9fa48('459')
        ? !password && typeof password !== 'string'
        : stryMutAct_9fa48('458')
          ? false
          : stryMutAct_9fa48('457')
            ? true
            : (stryCov_9fa48('457', '458', '459'),
              (stryMutAct_9fa48('460') ? password : (stryCov_9fa48('460'), !password)) ||
                (stryMutAct_9fa48('462')
                  ? typeof password === 'string'
                  : stryMutAct_9fa48('461')
                    ? false
                    : (stryCov_9fa48('461', '462'),
                      typeof password !==
                        (stryMutAct_9fa48('463') ? '' : (stryCov_9fa48('463'), 'string')))))
    ) {
      if (stryMutAct_9fa48('464')) {
        {
        }
      } else {
        stryCov_9fa48('464')
        throw new BadRequestError(
          stryMutAct_9fa48('465')
            ? ''
            : (stryCov_9fa48('465'), 'Password is required and must be a string'),
          {}
        )
      }
    }

    // STRONG PASSWORD POLICY
    if (
      stryMutAct_9fa48('469')
        ? password.length >= 8
        : stryMutAct_9fa48('468')
          ? password.length <= 8
          : stryMutAct_9fa48('467')
            ? false
            : stryMutAct_9fa48('466')
              ? true
              : (stryCov_9fa48('466', '467', '468', '469'), password.length < 8)
    ) {
      if (stryMutAct_9fa48('470')) {
        {
        }
      } else {
        stryCov_9fa48('470')
        throw new BadRequestError(
          stryMutAct_9fa48('471')
            ? ''
            : (stryCov_9fa48('471'), 'Password must be at least 8 characters'),
          stryMutAct_9fa48('472')
            ? {}
            : (stryCov_9fa48('472'),
              {
                passwordLength: password.length,
                policy: stryMutAct_9fa48('473') ? '' : (stryCov_9fa48('473'), 'min_length_8')
              })
        )
      }
    }

    // Check for at least one uppercase letter
    if (
      stryMutAct_9fa48('476')
        ? false
        : stryMutAct_9fa48('475')
          ? true
          : stryMutAct_9fa48('474')
            ? /[A-Z]/.test(password)
            : (stryCov_9fa48('474', '475', '476'),
              !(stryMutAct_9fa48('477') ? /[^A-Z]/ : (stryCov_9fa48('477'), /[A-Z]/)).test(
                password
              ))
    ) {
      if (stryMutAct_9fa48('478')) {
        {
        }
      } else {
        stryCov_9fa48('478')
        throw new BadRequestError(
          stryMutAct_9fa48('479')
            ? ''
            : (stryCov_9fa48('479'), 'Password must contain at least one uppercase letter'),
          stryMutAct_9fa48('480')
            ? {}
            : (stryCov_9fa48('480'),
              {
                policy: stryMutAct_9fa48('481') ? '' : (stryCov_9fa48('481'), 'require_uppercase')
              })
        )
      }
    }

    // Check for at least one lowercase letter
    if (
      stryMutAct_9fa48('484')
        ? false
        : stryMutAct_9fa48('483')
          ? true
          : stryMutAct_9fa48('482')
            ? /[a-z]/.test(password)
            : (stryCov_9fa48('482', '483', '484'),
              !(stryMutAct_9fa48('485') ? /[^a-z]/ : (stryCov_9fa48('485'), /[a-z]/)).test(
                password
              ))
    ) {
      if (stryMutAct_9fa48('486')) {
        {
        }
      } else {
        stryCov_9fa48('486')
        throw new BadRequestError(
          stryMutAct_9fa48('487')
            ? ''
            : (stryCov_9fa48('487'), 'Password must contain at least one lowercase letter'),
          stryMutAct_9fa48('488')
            ? {}
            : (stryCov_9fa48('488'),
              {
                policy: stryMutAct_9fa48('489') ? '' : (stryCov_9fa48('489'), 'require_lowercase')
              })
        )
      }
    }

    // Check for at least one number
    if (
      stryMutAct_9fa48('492')
        ? false
        : stryMutAct_9fa48('491')
          ? true
          : stryMutAct_9fa48('490')
            ? /[0-9]/.test(password)
            : (stryCov_9fa48('490', '491', '492'),
              !(stryMutAct_9fa48('493') ? /[^0-9]/ : (stryCov_9fa48('493'), /[0-9]/)).test(
                password
              ))
    ) {
      if (stryMutAct_9fa48('494')) {
        {
        }
      } else {
        stryCov_9fa48('494')
        throw new BadRequestError(
          stryMutAct_9fa48('495')
            ? ''
            : (stryCov_9fa48('495'), 'Password must contain at least one number'),
          stryMutAct_9fa48('496')
            ? {}
            : (stryCov_9fa48('496'),
              {
                policy: stryMutAct_9fa48('497') ? '' : (stryCov_9fa48('497'), 'require_number')
              })
        )
      }
    }

    // Check for at least one special character
    if (
      stryMutAct_9fa48('500')
        ? false
        : stryMutAct_9fa48('499')
          ? true
          : stryMutAct_9fa48('498')
            ? /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)
            : (stryCov_9fa48('498', '499', '500'),
              !(
                stryMutAct_9fa48('501')
                  ? /[^!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/
                  : (stryCov_9fa48('501'), /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/)
              ).test(password))
    ) {
      if (stryMutAct_9fa48('502')) {
        {
        }
      } else {
        stryCov_9fa48('502')
        throw new BadRequestError(
          stryMutAct_9fa48('503')
            ? ''
            : (stryCov_9fa48('503'), 'Password must contain at least one special character'),
          stryMutAct_9fa48('504')
            ? {}
            : (stryCov_9fa48('504'),
              {
                policy: stryMutAct_9fa48('505')
                  ? ''
                  : (stryCov_9fa48('505'), 'require_special_char')
              })
        )
      }
    }
  }
}
export {
  validateEmail,
  validatePassword,
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  InternalServerError
}
