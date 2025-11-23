/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Auth Service - User Operations
 * Handles user retrieval, password reset, password update
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
  UnauthorizedError,
  DatabaseError,
  validateEmail,
  validatePassword
} from './authService.helpers.js'

/**
 * Get user by access token
 * @param {string} accessToken - User's access token
 * @returns {Object} user
 * @throws {UnauthorizedError} If token is invalid or expired
 * @throws {DatabaseError} If operation fails
 */
export async function getUser(accessToken) {
  if (stryMutAct_9fa48('834')) {
    {
    }
  } else {
    stryCov_9fa48('834')
    try {
      if (stryMutAct_9fa48('835')) {
        {
        }
      } else {
        stryCov_9fa48('835')
        if (
          stryMutAct_9fa48('838')
            ? false
            : stryMutAct_9fa48('837')
              ? true
              : stryMutAct_9fa48('836')
                ? accessToken
                : (stryCov_9fa48('836', '837', '838'), !accessToken)
        ) {
          if (stryMutAct_9fa48('839')) {
            {
            }
          } else {
            stryCov_9fa48('839')
            throw new UnauthorizedError(
              stryMutAct_9fa48('840') ? '' : (stryCov_9fa48('840'), 'Access token is required'),
              {}
            )
          }
        }

        // Supabase Auth get user
        const { data, error } = await supabase.auth.getUser(accessToken)
        if (
          stryMutAct_9fa48('842')
            ? false
            : stryMutAct_9fa48('841')
              ? true
              : (stryCov_9fa48('841', '842'), error)
        ) {
          if (stryMutAct_9fa48('843')) {
            {
            }
          } else {
            stryCov_9fa48('843')
            if (
              stryMutAct_9fa48('846')
                ? error.message.includes('Invalid JWT') && error.message.includes('expired')
                : stryMutAct_9fa48('845')
                  ? false
                  : stryMutAct_9fa48('844')
                    ? true
                    : (stryCov_9fa48('844', '845', '846'),
                      error.message.includes(
                        stryMutAct_9fa48('847') ? '' : (stryCov_9fa48('847'), 'Invalid JWT')
                      ) ||
                        error.message.includes(
                          stryMutAct_9fa48('848') ? '' : (stryCov_9fa48('848'), 'expired')
                        ))
            ) {
              if (stryMutAct_9fa48('849')) {
                {
                }
              } else {
                stryCov_9fa48('849')
                throw new UnauthorizedError(
                  stryMutAct_9fa48('850') ? '' : (stryCov_9fa48('850'), 'Invalid or expired token'),
                  {}
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('851') ? '' : (stryCov_9fa48('851'), 'GET_USER'),
              stryMutAct_9fa48('852') ? '' : (stryCov_9fa48('852'), 'auth.users'),
              error,
              {}
            )
          }
        }
        if (
          stryMutAct_9fa48('855')
            ? false
            : stryMutAct_9fa48('854')
              ? true
              : stryMutAct_9fa48('853')
                ? data.user
                : (stryCov_9fa48('853', '854', '855'), !data.user)
        ) {
          if (stryMutAct_9fa48('856')) {
            {
            }
          } else {
            stryCov_9fa48('856')
            throw new UnauthorizedError(
              stryMutAct_9fa48('857') ? '' : (stryCov_9fa48('857'), 'User not found'),
              {}
            )
          }
        }
        return data.user
      }
    } catch (error) {
      if (stryMutAct_9fa48('858')) {
        {
        }
      } else {
        stryCov_9fa48('858')
        if (
          stryMutAct_9fa48('861')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('860')
              ? false
              : stryMutAct_9fa48('859')
                ? true
                : (stryCov_9fa48('859', '860', '861'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('862') ? '' : (stryCov_9fa48('862'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('863')) {
            {
            }
          } else {
            stryCov_9fa48('863')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('864') ? '' : (stryCov_9fa48('864'), 'getUser failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reset password (send reset email)
 * @param {string} email
 * @returns {Object} { message }
 * @throws {BadRequestError} If email is invalid
 * @throws {DatabaseError} If operation fails
 */
export async function resetPassword(email) {
  if (stryMutAct_9fa48('865')) {
    {
    }
  } else {
    stryCov_9fa48('865')
    try {
      if (stryMutAct_9fa48('866')) {
        {
        }
      } else {
        stryCov_9fa48('866')
        // Validation - FAIL FAST
        validateEmail(email)

        // Supabase Auth reset password
        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          stryMutAct_9fa48('867')
            ? {}
            : (stryCov_9fa48('867'),
              {
                redirectTo: stryMutAct_9fa48('868')
                  ? ``
                  : (stryCov_9fa48('868'), `${window.location.origin}/reset-password`)
              })
        )
        if (
          stryMutAct_9fa48('870')
            ? false
            : stryMutAct_9fa48('869')
              ? true
              : (stryCov_9fa48('869', '870'), error)
        ) {
          if (stryMutAct_9fa48('871')) {
            {
            }
          } else {
            stryCov_9fa48('871')
            throw new DatabaseError(
              stryMutAct_9fa48('872') ? '' : (stryCov_9fa48('872'), 'RESET_PASSWORD'),
              stryMutAct_9fa48('873') ? '' : (stryCov_9fa48('873'), 'auth.users'),
              error,
              stryMutAct_9fa48('874')
                ? {}
                : (stryCov_9fa48('874'),
                  {
                    email
                  })
            )
          }
        }
        return stryMutAct_9fa48('875')
          ? {}
          : (stryCov_9fa48('875'),
            {
              message: stryMutAct_9fa48('876')
                ? ''
                : (stryCov_9fa48('876'), 'Password reset email sent. Please check your email.')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('877')) {
        {
        }
      } else {
        stryCov_9fa48('877')
        if (
          stryMutAct_9fa48('880')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('879')
              ? false
              : stryMutAct_9fa48('878')
                ? true
                : (stryCov_9fa48('878', '879', '880'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('881') ? '' : (stryCov_9fa48('881'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('882')) {
            {
            }
          } else {
            stryCov_9fa48('882')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('883') ? '' : (stryCov_9fa48('883'), 'resetPassword failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update password (when user is authenticated)
 * @param {string} accessToken - User's access token
 * @param {string} newPassword - New password
 * @returns {Object} { message }
 * @throws {UnauthorizedError} If token is invalid
 * @throws {BadRequestError} If password is invalid
 * @throws {DatabaseError} If operation fails
 */
export async function updatePassword(accessToken, newPassword) {
  if (stryMutAct_9fa48('884')) {
    {
    }
  } else {
    stryCov_9fa48('884')
    try {
      if (stryMutAct_9fa48('885')) {
        {
        }
      } else {
        stryCov_9fa48('885')
        if (
          stryMutAct_9fa48('888')
            ? false
            : stryMutAct_9fa48('887')
              ? true
              : stryMutAct_9fa48('886')
                ? accessToken
                : (stryCov_9fa48('886', '887', '888'), !accessToken)
        ) {
          if (stryMutAct_9fa48('889')) {
            {
            }
          } else {
            stryCov_9fa48('889')
            throw new UnauthorizedError(
              stryMutAct_9fa48('890') ? '' : (stryCov_9fa48('890'), 'Access token is required'),
              {}
            )
          }
        }

        // Validation - FAIL FAST
        validatePassword(newPassword)

        // Supabase Auth update password
        const { error } = await supabase.auth.updateUser(
          stryMutAct_9fa48('891')
            ? {}
            : (stryCov_9fa48('891'),
              {
                password: newPassword
              })
        )
        if (
          stryMutAct_9fa48('893')
            ? false
            : stryMutAct_9fa48('892')
              ? true
              : (stryCov_9fa48('892', '893'), error)
        ) {
          if (stryMutAct_9fa48('894')) {
            {
            }
          } else {
            stryCov_9fa48('894')
            throw new DatabaseError(
              stryMutAct_9fa48('895') ? '' : (stryCov_9fa48('895'), 'UPDATE_PASSWORD'),
              stryMutAct_9fa48('896') ? '' : (stryCov_9fa48('896'), 'auth.users'),
              error,
              {}
            )
          }
        }
        return stryMutAct_9fa48('897')
          ? {}
          : (stryCov_9fa48('897'),
            {
              message: stryMutAct_9fa48('898')
                ? ''
                : (stryCov_9fa48('898'), 'Password updated successfully.')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('899')) {
        {
        }
      } else {
        stryCov_9fa48('899')
        if (
          stryMutAct_9fa48('902')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('901')
              ? false
              : stryMutAct_9fa48('900')
                ? true
                : (stryCov_9fa48('900', '901', '902'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('903') ? '' : (stryCov_9fa48('903'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('904')) {
            {
            }
          } else {
            stryCov_9fa48('904')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('905') ? '' : (stryCov_9fa48('905'), 'updatePassword failed:'),
          error
        )
        throw error
      }
    }
  }
}
