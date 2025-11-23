/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * User Service - Create Operations
 * Handles user creation operations
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
  VALID_ROLES,
  ValidationError
} from './userService.helpers.js'

/**
 * Create new user (client registration - no password required)
 */
export function createUser(userData) {
  if (stryMutAct_9fa48('6652')) {
    {
    }
  } else {
    stryCov_9fa48('6652')
    return withErrorHandling(
      async () => {
        if (stryMutAct_9fa48('6653')) {
          {
          }
        } else {
          stryCov_9fa48('6653')
          const userRepository = getUserRepository()

          // Validate required fields for client registration
          if (
            stryMutAct_9fa48('6656')
              ? !userData.email && typeof userData.email !== 'string'
              : stryMutAct_9fa48('6655')
                ? false
                : stryMutAct_9fa48('6654')
                  ? true
                  : (stryCov_9fa48('6654', '6655', '6656'),
                    (stryMutAct_9fa48('6657')
                      ? userData.email
                      : (stryCov_9fa48('6657'), !userData.email)) ||
                      (stryMutAct_9fa48('6659')
                        ? typeof userData.email === 'string'
                        : stryMutAct_9fa48('6658')
                          ? false
                          : (stryCov_9fa48('6658', '6659'),
                            typeof userData.email !==
                              (stryMutAct_9fa48('6660') ? '' : (stryCov_9fa48('6660'), 'string')))))
          ) {
            if (stryMutAct_9fa48('6661')) {
              {
              }
            } else {
              stryCov_9fa48('6661')
              throw new ValidationError(
                stryMutAct_9fa48('6662')
                  ? ''
                  : (stryCov_9fa48('6662'), 'Email is required and must be a string'),
                stryMutAct_9fa48('6663')
                  ? {}
                  : (stryCov_9fa48('6663'),
                    {
                      field: stryMutAct_9fa48('6664') ? '' : (stryCov_9fa48('6664'), 'email'),
                      value: userData.email,
                      rule: stryMutAct_9fa48('6665')
                        ? ''
                        : (stryCov_9fa48('6665'), 'required string')
                    })
              )
            }
          }

          // Validate email format (simple check - no regex as requested)
          if (
            stryMutAct_9fa48('6668')
              ? !userData.email.includes('@') && !userData.email.includes('.')
              : stryMutAct_9fa48('6667')
                ? false
                : stryMutAct_9fa48('6666')
                  ? true
                  : (stryCov_9fa48('6666', '6667', '6668'),
                    (stryMutAct_9fa48('6669')
                      ? userData.email.includes('@')
                      : (stryCov_9fa48('6669'),
                        !userData.email.includes(
                          stryMutAct_9fa48('6670') ? '' : (stryCov_9fa48('6670'), '@')
                        ))) ||
                      (stryMutAct_9fa48('6671')
                        ? userData.email.includes('.')
                        : (stryCov_9fa48('6671'),
                          !userData.email.includes(
                            stryMutAct_9fa48('6672') ? '' : (stryCov_9fa48('6672'), '.')
                          ))))
          ) {
            if (stryMutAct_9fa48('6673')) {
              {
              }
            } else {
              stryCov_9fa48('6673')
              throw new ValidationError(
                stryMutAct_9fa48('6674') ? '' : (stryCov_9fa48('6674'), 'Invalid email format'),
                stryMutAct_9fa48('6675')
                  ? {}
                  : (stryCov_9fa48('6675'),
                    {
                      field: stryMutAct_9fa48('6676') ? '' : (stryCov_9fa48('6676'), 'email'),
                      value: userData.email,
                      rule: stryMutAct_9fa48('6677')
                        ? ''
                        : (stryCov_9fa48('6677'), 'valid email format required')
                    })
              )
            }
          }

          // For client registration, password is optional
          // For admin creation, password is required
          if (
            stryMutAct_9fa48('6680')
              ? userData.role === 'admin' || !userData.password_hash
              : stryMutAct_9fa48('6679')
                ? false
                : stryMutAct_9fa48('6678')
                  ? true
                  : (stryCov_9fa48('6678', '6679', '6680'),
                    (stryMutAct_9fa48('6682')
                      ? userData.role !== 'admin'
                      : stryMutAct_9fa48('6681')
                        ? true
                        : (stryCov_9fa48('6681', '6682'),
                          userData.role ===
                            (stryMutAct_9fa48('6683') ? '' : (stryCov_9fa48('6683'), 'admin')))) &&
                      (stryMutAct_9fa48('6684')
                        ? userData.password_hash
                        : (stryCov_9fa48('6684'), !userData.password_hash)))
          ) {
            if (stryMutAct_9fa48('6685')) {
              {
              }
            } else {
              stryCov_9fa48('6685')
              throw new ValidationError(
                stryMutAct_9fa48('6686')
                  ? ''
                  : (stryCov_9fa48('6686'), 'Password is required for admin users'),
                stryMutAct_9fa48('6687')
                  ? {}
                  : (stryCov_9fa48('6687'),
                    {
                      field: stryMutAct_9fa48('6688')
                        ? ''
                        : (stryCov_9fa48('6688'), 'password_hash'),
                      rule: stryMutAct_9fa48('6689')
                        ? ''
                        : (stryCov_9fa48('6689'), 'required for admin role')
                    })
              )
            }
          }

          // Validate role if provided
          if (
            stryMutAct_9fa48('6692')
              ? userData.role || !VALID_ROLES.includes(userData.role)
              : stryMutAct_9fa48('6691')
                ? false
                : stryMutAct_9fa48('6690')
                  ? true
                  : (stryCov_9fa48('6690', '6691', '6692'),
                    userData.role &&
                      (stryMutAct_9fa48('6693')
                        ? VALID_ROLES.includes(userData.role)
                        : (stryCov_9fa48('6693'), !VALID_ROLES.includes(userData.role))))
          ) {
            if (stryMutAct_9fa48('6694')) {
              {
              }
            } else {
              stryCov_9fa48('6694')
              throw new ValidationError(
                stryMutAct_9fa48('6695')
                  ? ``
                  : (stryCov_9fa48('6695'),
                    `Invalid role: must be one of ${VALID_ROLES.join(stryMutAct_9fa48('6696') ? '' : (stryCov_9fa48('6696'), ', '))}`),
                stryMutAct_9fa48('6697')
                  ? {}
                  : (stryCov_9fa48('6697'),
                    {
                      field: stryMutAct_9fa48('6698') ? '' : (stryCov_9fa48('6698'), 'role'),
                      value: userData.role,
                      validValues: VALID_ROLES
                    })
              )
            }
          }

          // FAIL FAST - Explicit field requirements
          const newUser = stryMutAct_9fa48('6699')
            ? {}
            : (stryCov_9fa48('6699'),
              {
                email: userData.email,
                full_name: stryMutAct_9fa48('6700')
                  ? userData.full_name && null
                  : (stryCov_9fa48('6700'), userData.full_name ?? null),
                phone: stryMutAct_9fa48('6701')
                  ? userData.phone && null
                  : (stryCov_9fa48('6701'), userData.phone ?? null),
                role: stryMutAct_9fa48('6702')
                  ? userData.role && 'user'
                  : (stryCov_9fa48('6702'),
                    userData.role ??
                      (stryMutAct_9fa48('6703') ? '' : (stryCov_9fa48('6703'), 'user'))),
                password_hash: stryMutAct_9fa48('6704')
                  ? userData.password_hash && null
                  : (stryCov_9fa48('6704'), userData.password_hash ?? null),
                active: stryMutAct_9fa48('6705') ? false : (stryCov_9fa48('6705'), true),
                email_verified: stryMutAct_9fa48('6706')
                  ? userData.email_verified && false
                  : (stryCov_9fa48('6706'),
                    userData.email_verified ??
                      (stryMutAct_9fa48('6707') ? true : (stryCov_9fa48('6707'), false)))
              })

          // Use repository's create method
          const data = await userRepository.create(newUser)
          return data
        }
      },
      stryMutAct_9fa48('6708') ? '' : (stryCov_9fa48('6708'), 'createUser'),
      stryMutAct_9fa48('6709')
        ? {}
        : (stryCov_9fa48('6709'),
          {
            email: userData.email
          })
    )
  }
}
