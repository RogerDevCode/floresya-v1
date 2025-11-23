/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Auth Service - Authentication Operations
 * Handles sign up, sign in, sign out operations
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
import { supabase } from './supabaseClient.js'
import {
  validateEmail,
  validatePassword,
  ConflictError,
  DatabaseError,
  BadRequestError
} from './authService.helpers.js'

/**
 * Sign up new user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @param {Object} metadata - { full_name, phone }
 * @returns {Object} { user, session, message }
 * @throws {BadRequestError} If invalid input
 * @throws {ConflictError} If email already exists
 * @throws {DatabaseError} If signup fails
 */
export async function signUp(email, password, metadata = {}) {
  if (stryMutAct_9fa48('336')) {
    {
    }
  } else {
    stryCov_9fa48('336')
    try {
      if (stryMutAct_9fa48('337')) {
        {
        }
      } else {
        stryCov_9fa48('337')
        // Validation - FAIL FAST
        validateEmail(email)
        validatePassword(password)

        // Supabase Auth signup
        const { data, error } = await supabase.auth.signUp(
          stryMutAct_9fa48('338')
            ? {}
            : (stryCov_9fa48('338'),
              {
                email,
                password,
                options: stryMutAct_9fa48('339')
                  ? {}
                  : (stryCov_9fa48('339'),
                    {
                      data: stryMutAct_9fa48('340')
                        ? {}
                        : (stryCov_9fa48('340'),
                          {
                            full_name: stryMutAct_9fa48('343')
                              ? metadata.full_name && null
                              : stryMutAct_9fa48('342')
                                ? false
                                : stryMutAct_9fa48('341')
                                  ? true
                                  : (stryCov_9fa48('341', '342', '343'),
                                    metadata.full_name || null),
                            phone: stryMutAct_9fa48('346')
                              ? metadata.phone && null
                              : stryMutAct_9fa48('345')
                                ? false
                                : stryMutAct_9fa48('344')
                                  ? true
                                  : (stryCov_9fa48('344', '345', '346'), metadata.phone || null),
                            role: stryMutAct_9fa48('347') ? '' : (stryCov_9fa48('347'), 'user') // Default role
                          })
                    })
              })
        )
        if (
          stryMutAct_9fa48('349')
            ? false
            : stryMutAct_9fa48('348')
              ? true
              : (stryCov_9fa48('348', '349'), error)
        ) {
          if (stryMutAct_9fa48('350')) {
            {
            }
          } else {
            stryCov_9fa48('350')
            if (
              stryMutAct_9fa48('353')
                ? error.message.includes('already registered') &&
                  error.message.includes('already exists')
                : stryMutAct_9fa48('352')
                  ? false
                  : stryMutAct_9fa48('351')
                    ? true
                    : (stryCov_9fa48('351', '352', '353'),
                      error.message.includes(
                        stryMutAct_9fa48('354') ? '' : (stryCov_9fa48('354'), 'already registered')
                      ) ||
                        error.message.includes(
                          stryMutAct_9fa48('355') ? '' : (stryCov_9fa48('355'), 'already exists')
                        ))
            ) {
              if (stryMutAct_9fa48('356')) {
                {
                }
              } else {
                stryCov_9fa48('356')
                throw new ConflictError(
                  stryMutAct_9fa48('357') ? '' : (stryCov_9fa48('357'), 'Email already registered'),
                  stryMutAct_9fa48('358')
                    ? {}
                    : (stryCov_9fa48('358'),
                      {
                        email
                      })
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('359') ? '' : (stryCov_9fa48('359'), 'SIGNUP'),
              stryMutAct_9fa48('360') ? '' : (stryCov_9fa48('360'), 'auth.users'),
              error,
              stryMutAct_9fa48('361')
                ? {}
                : (stryCov_9fa48('361'),
                  {
                    email
                  })
            )
          }
        }
        return stryMutAct_9fa48('362')
          ? {}
          : (stryCov_9fa48('362'),
            {
              user: data.user,
              session: data.session,
              message: stryMutAct_9fa48('363')
                ? ''
                : (stryCov_9fa48('363'),
                  'User signed up successfully. Please check your email for verification.')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('364')) {
        {
        }
      } else {
        stryCov_9fa48('364')
        if (
          stryMutAct_9fa48('367')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('366')
              ? false
              : stryMutAct_9fa48('365')
                ? true
                : (stryCov_9fa48('365', '366', '367'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('368') ? '' : (stryCov_9fa48('368'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('369')) {
            {
            }
          } else {
            stryCov_9fa48('369')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('370') ? '' : (stryCov_9fa48('370'), 'signUp failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Sign in user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, session, message }
 * @throws {BadRequestError} If invalid input
 * @throws {UnauthorizedError} If credentials are invalid
 * @throws {DatabaseError} If sign in fails
 */
export async function signIn(email, password) {
  if (stryMutAct_9fa48('371')) {
    {
    }
  } else {
    stryCov_9fa48('371')
    try {
      if (stryMutAct_9fa48('372')) {
        {
        }
      } else {
        stryCov_9fa48('372')
        // Validation - FAIL FAST
        validateEmail(email)
        if (
          stryMutAct_9fa48('375')
            ? !password && typeof password !== 'string'
            : stryMutAct_9fa48('374')
              ? false
              : stryMutAct_9fa48('373')
                ? true
                : (stryCov_9fa48('373', '374', '375'),
                  (stryMutAct_9fa48('376') ? password : (stryCov_9fa48('376'), !password)) ||
                    (stryMutAct_9fa48('378')
                      ? typeof password === 'string'
                      : stryMutAct_9fa48('377')
                        ? false
                        : (stryCov_9fa48('377', '378'),
                          typeof password !==
                            (stryMutAct_9fa48('379') ? '' : (stryCov_9fa48('379'), 'string')))))
        ) {
          if (stryMutAct_9fa48('380')) {
            {
            }
          } else {
            stryCov_9fa48('380')
            throw new BadRequestError(
              stryMutAct_9fa48('381') ? '' : (stryCov_9fa48('381'), 'Password is required'),
              stryMutAct_9fa48('382')
                ? {}
                : (stryCov_9fa48('382'),
                  {
                    email
                  })
            )
          }
        }

        // Supabase Auth sign in
        const { data, error } = await supabase.auth.signInWithPassword(
          stryMutAct_9fa48('383')
            ? {}
            : (stryCov_9fa48('383'),
              {
                email,
                password
              })
        )
        if (
          stryMutAct_9fa48('385')
            ? false
            : stryMutAct_9fa48('384')
              ? true
              : (stryCov_9fa48('384', '385'), error)
        ) {
          if (stryMutAct_9fa48('386')) {
            {
            }
          } else {
            stryCov_9fa48('386')
            if (
              stryMutAct_9fa48('389')
                ? error.message.includes('Invalid login credentials') &&
                  error.message.includes('Invalid email or password')
                : stryMutAct_9fa48('388')
                  ? false
                  : stryMutAct_9fa48('387')
                    ? true
                    : (stryCov_9fa48('387', '388', '389'),
                      error.message.includes(
                        stryMutAct_9fa48('390')
                          ? ''
                          : (stryCov_9fa48('390'), 'Invalid login credentials')
                      ) ||
                        error.message.includes(
                          stryMutAct_9fa48('391')
                            ? ''
                            : (stryCov_9fa48('391'), 'Invalid email or password')
                        ))
            ) {
              if (stryMutAct_9fa48('392')) {
                {
                }
              } else {
                stryCov_9fa48('392')
                throw new UnauthorizedError(
                  stryMutAct_9fa48('393')
                    ? ''
                    : (stryCov_9fa48('393'), 'Invalid email or password'),
                  stryMutAct_9fa48('394')
                    ? {}
                    : (stryCov_9fa48('394'),
                      {
                        email
                      })
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('395') ? '' : (stryCov_9fa48('395'), 'SIGNIN'),
              stryMutAct_9fa48('396') ? '' : (stryCov_9fa48('396'), 'auth.users'),
              error,
              stryMutAct_9fa48('397')
                ? {}
                : (stryCov_9fa48('397'),
                  {
                    email
                  })
            )
          }
        }
        return stryMutAct_9fa48('398')
          ? {}
          : (stryCov_9fa48('398'),
            {
              user: data.user,
              session: data.session,
              message: stryMutAct_9fa48('399')
                ? ''
                : (stryCov_9fa48('399'), 'User signed in successfully.')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('400')) {
        {
        }
      } else {
        stryCov_9fa48('400')
        if (
          stryMutAct_9fa48('403')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('402')
              ? false
              : stryMutAct_9fa48('401')
                ? true
                : (stryCov_9fa48('401', '402', '403'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('404') ? '' : (stryCov_9fa48('404'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('405')) {
            {
            }
          } else {
            stryCov_9fa48('405')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('406') ? '' : (stryCov_9fa48('406'), 'signIn failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Sign out user
 * @param {string} accessToken - User's access token
 * @returns {Object} { message }
 * @throws {UnauthorizedError} If token is invalid
 * @throws {DatabaseError} If sign out fails
 */
export async function signOut(accessToken) {
  if (stryMutAct_9fa48('407')) {
    {
    }
  } else {
    stryCov_9fa48('407')
    try {
      if (stryMutAct_9fa48('408')) {
        {
        }
      } else {
        stryCov_9fa48('408')
        if (
          stryMutAct_9fa48('411')
            ? false
            : stryMutAct_9fa48('410')
              ? true
              : stryMutAct_9fa48('409')
                ? accessToken
                : (stryCov_9fa48('409', '410', '411'), !accessToken)
        ) {
          if (stryMutAct_9fa48('412')) {
            {
            }
          } else {
            stryCov_9fa48('412')
            throw new UnauthorizedError(
              stryMutAct_9fa48('413') ? '' : (stryCov_9fa48('413'), 'Access token is required'),
              {}
            )
          }
        }

        // Supabase Auth sign out
        const { error } = await supabase.auth.signOut()
        if (
          stryMutAct_9fa48('415')
            ? false
            : stryMutAct_9fa48('414')
              ? true
              : (stryCov_9fa48('414', '415'), error)
        ) {
          if (stryMutAct_9fa48('416')) {
            {
            }
          } else {
            stryCov_9fa48('416')
            throw new DatabaseError(
              stryMutAct_9fa48('417') ? '' : (stryCov_9fa48('417'), 'SIGNOUT'),
              stryMutAct_9fa48('418') ? '' : (stryCov_9fa48('418'), 'auth.users'),
              error,
              {}
            )
          }
        }
        return stryMutAct_9fa48('419')
          ? {}
          : (stryCov_9fa48('419'),
            {
              message: stryMutAct_9fa48('420')
                ? ''
                : (stryCov_9fa48('420'), 'User signed out successfully.')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('421')) {
        {
        }
      } else {
        stryCov_9fa48('421')
        if (
          stryMutAct_9fa48('424')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('423')
              ? false
              : stryMutAct_9fa48('422')
                ? true
                : (stryCov_9fa48('422', '423', '424'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('425') ? '' : (stryCov_9fa48('425'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('426')) {
            {
            }
          } else {
            stryCov_9fa48('426')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('427') ? '' : (stryCov_9fa48('427'), 'signOut failed:'),
          error
        )
        throw error
      }
    }
  }
}
