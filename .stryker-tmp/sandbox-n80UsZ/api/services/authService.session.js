/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Auth Service - Session Operations
 * Handles token refresh, session management
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
import { UnauthorizedError, DatabaseError, BadRequestError } from './authService.helpers.js'

/**
 * Refresh access token
 * @param {string} refreshToken - User's refresh token
 * @returns {Object} { user, session }
 * @throws {BadRequestError} If refresh token is invalid
 * @throws {UnauthorizedError} If refresh fails
 * @throws {DatabaseError} If operation fails
 */
export async function refreshToken(refreshToken) {
  if (stryMutAct_9fa48('803')) {
    {
    }
  } else {
    stryCov_9fa48('803')
    try {
      if (stryMutAct_9fa48('804')) {
        {
        }
      } else {
        stryCov_9fa48('804')
        if (
          stryMutAct_9fa48('807')
            ? false
            : stryMutAct_9fa48('806')
              ? true
              : stryMutAct_9fa48('805')
                ? refreshToken
                : (stryCov_9fa48('805', '806', '807'), !refreshToken)
        ) {
          if (stryMutAct_9fa48('808')) {
            {
            }
          } else {
            stryCov_9fa48('808')
            throw new BadRequestError(
              stryMutAct_9fa48('809') ? '' : (stryCov_9fa48('809'), 'Refresh token is required'),
              {}
            )
          }
        }

        // Supabase Auth refresh token
        const { data, error } = await supabase.auth.refreshSession(
          stryMutAct_9fa48('810')
            ? {}
            : (stryCov_9fa48('810'),
              {
                refresh_token: refreshToken
              })
        )
        if (
          stryMutAct_9fa48('812')
            ? false
            : stryMutAct_9fa48('811')
              ? true
              : (stryCov_9fa48('811', '812'), error)
        ) {
          if (stryMutAct_9fa48('813')) {
            {
            }
          } else {
            stryCov_9fa48('813')
            if (
              stryMutAct_9fa48('815')
                ? false
                : stryMutAct_9fa48('814')
                  ? true
                  : (stryCov_9fa48('814', '815'),
                    error.message.includes(
                      stryMutAct_9fa48('816') ? '' : (stryCov_9fa48('816'), 'Invalid refresh token')
                    ))
            ) {
              if (stryMutAct_9fa48('817')) {
                {
                }
              } else {
                stryCov_9fa48('817')
                throw new UnauthorizedError(
                  stryMutAct_9fa48('818') ? '' : (stryCov_9fa48('818'), 'Invalid refresh token'),
                  {}
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('819') ? '' : (stryCov_9fa48('819'), 'REFRESH'),
              stryMutAct_9fa48('820') ? '' : (stryCov_9fa48('820'), 'auth.users'),
              error,
              {}
            )
          }
        }
        if (
          stryMutAct_9fa48('823')
            ? false
            : stryMutAct_9fa48('822')
              ? true
              : stryMutAct_9fa48('821')
                ? data.session
                : (stryCov_9fa48('821', '822', '823'), !data.session)
        ) {
          if (stryMutAct_9fa48('824')) {
            {
            }
          } else {
            stryCov_9fa48('824')
            throw new UnauthorizedError(
              stryMutAct_9fa48('825') ? '' : (stryCov_9fa48('825'), 'Failed to refresh session'),
              {}
            )
          }
        }
        return stryMutAct_9fa48('826')
          ? {}
          : (stryCov_9fa48('826'),
            {
              user: data.user,
              session: data.session
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('827')) {
        {
        }
      } else {
        stryCov_9fa48('827')
        if (
          stryMutAct_9fa48('830')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('829')
              ? false
              : stryMutAct_9fa48('828')
                ? true
                : (stryCov_9fa48('828', '829', '830'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('831') ? '' : (stryCov_9fa48('831'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('832')) {
            {
            }
          } else {
            stryCov_9fa48('832')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('833') ? '' : (stryCov_9fa48('833'), 'refreshToken failed:'),
          error
        )
        throw error
      }
    }
  }
}
