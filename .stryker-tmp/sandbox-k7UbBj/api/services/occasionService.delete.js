/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Occasion Service - Delete Operations
 * Handles occasion deletion and reactivation
 * LEGACY: Modularizado desde occasionService.js (PHASE 5)
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
import { getOccasionRepository, BadRequestError } from './occasionService.helpers.js'

/**
 * Delete occasion (soft delete)
 * @param {number} id - Occasion ID to delete
 * @returns {Object} Deleted occasion
 * @throws {BadRequestError} If ID is invalid
 */
export async function deleteOccasion(id) {
  if (stryMutAct_9fa48('2190')) {
    {
    }
  } else {
    stryCov_9fa48('2190')
    try {
      if (stryMutAct_9fa48('2191')) {
        {
        }
      } else {
        stryCov_9fa48('2191')
        if (
          stryMutAct_9fa48('2194')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('2193')
              ? false
              : stryMutAct_9fa48('2192')
                ? true
                : (stryCov_9fa48('2192', '2193', '2194'),
                  (stryMutAct_9fa48('2195') ? id : (stryCov_9fa48('2195'), !id)) ||
                    (stryMutAct_9fa48('2197')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('2196')
                        ? false
                        : (stryCov_9fa48('2196', '2197'),
                          typeof id !==
                            (stryMutAct_9fa48('2198') ? '' : (stryCov_9fa48('2198'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2199')) {
            {
            }
          } else {
            stryCov_9fa48('2199')
            throw new BadRequestError(
              stryMutAct_9fa48('2200')
                ? ''
                : (stryCov_9fa48('2200'), 'Invalid occasion ID: must be a number'),
              stryMutAct_9fa48('2201')
                ? {}
                : (stryCov_9fa48('2201'),
                  {
                    id
                  })
            )
          }
        }
        const occasionRepository = getOccasionRepository()
        const data = await occasionRepository.delete(id)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2202')) {
        {
        }
      } else {
        stryCov_9fa48('2202')
        console.error(
          stryMutAct_9fa48('2203') ? `` : (stryCov_9fa48('2203'), `deleteOccasion(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reactivate deleted occasion
 * @param {number} id - Occasion ID to reactivate
 * @returns {Object} Reactivated occasion
 * @throws {BadRequestError} If ID is invalid
 */
export async function reactivateOccasion(id) {
  if (stryMutAct_9fa48('2204')) {
    {
    }
  } else {
    stryCov_9fa48('2204')
    try {
      if (stryMutAct_9fa48('2205')) {
        {
        }
      } else {
        stryCov_9fa48('2205')
        if (
          stryMutAct_9fa48('2208')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('2207')
              ? false
              : stryMutAct_9fa48('2206')
                ? true
                : (stryCov_9fa48('2206', '2207', '2208'),
                  (stryMutAct_9fa48('2209') ? id : (stryCov_9fa48('2209'), !id)) ||
                    (stryMutAct_9fa48('2211')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('2210')
                        ? false
                        : (stryCov_9fa48('2210', '2211'),
                          typeof id !==
                            (stryMutAct_9fa48('2212') ? '' : (stryCov_9fa48('2212'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2213')) {
            {
            }
          } else {
            stryCov_9fa48('2213')
            throw new BadRequestError(
              stryMutAct_9fa48('2214')
                ? ''
                : (stryCov_9fa48('2214'), 'Invalid occasion ID: must be a number'),
              stryMutAct_9fa48('2215')
                ? {}
                : (stryCov_9fa48('2215'),
                  {
                    id
                  })
            )
          }
        }
        const occasionRepository = getOccasionRepository()
        const data = await occasionRepository.reactivate(id)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2216')) {
        {
        }
      } else {
        stryCov_9fa48('2216')
        console.error(
          stryMutAct_9fa48('2217')
            ? ``
            : (stryCov_9fa48('2217'), `reactivateOccasion(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
