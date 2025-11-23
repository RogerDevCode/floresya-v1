/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Occasion Service - Read Operations
 * Handles all occasion retrieval operations
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
import { getOccasionRepository, NotFoundError, BadRequestError } from './occasionService.helpers.js'

/**
 * Get all occasions with filters
 * @param {Object} filters - Filter options
 * @param {boolean} includeDeactivated - Include deactivated occasions (default: false)
 * @returns {Array} Array of occasions
 */
export async function getAllOccasions(
  filters = {},
  includeDeactivated = stryMutAct_9fa48('2355') ? true : (stryCov_9fa48('2355'), false)
) {
  if (stryMutAct_9fa48('2356')) {
    {
    }
  } else {
    stryCov_9fa48('2356')
    try {
      if (stryMutAct_9fa48('2357')) {
        {
        }
      } else {
        stryCov_9fa48('2357')
        const occasionRepository = getOccasionRepository()
        const data = await occasionRepository.findAllWithFilters(
          filters,
          stryMutAct_9fa48('2358')
            ? {}
            : (stryCov_9fa48('2358'),
              {
                includeDeactivated
              })
        )
        return stryMutAct_9fa48('2361')
          ? data && []
          : stryMutAct_9fa48('2360')
            ? false
            : stryMutAct_9fa48('2359')
              ? true
              : (stryCov_9fa48('2359', '2360', '2361'),
                data ||
                  (stryMutAct_9fa48('2362') ? ['Stryker was here'] : (stryCov_9fa48('2362'), [])))
      }
    } catch (error) {
      if (stryMutAct_9fa48('2363')) {
        {
        }
      } else {
        stryCov_9fa48('2363')
        console.error(
          stryMutAct_9fa48('2364') ? '' : (stryCov_9fa48('2364'), 'getAllOccasions failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get occasion by ID
 * @param {number} id - Occasion ID
 * @param {boolean} includeDeactivated - Include deactivated occasions (default: false)
 * @returns {Object|null} Occasion object or null
 * @throws {BadRequestError} If ID is invalid
 * @throws {NotFoundError} If occasion is not found
 */
export async function getOccasionById(
  id,
  includeDeactivated = stryMutAct_9fa48('2365') ? true : (stryCov_9fa48('2365'), false)
) {
  if (stryMutAct_9fa48('2366')) {
    {
    }
  } else {
    stryCov_9fa48('2366')
    try {
      if (stryMutAct_9fa48('2367')) {
        {
        }
      } else {
        stryCov_9fa48('2367')
        if (
          stryMutAct_9fa48('2370')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('2369')
              ? false
              : stryMutAct_9fa48('2368')
                ? true
                : (stryCov_9fa48('2368', '2369', '2370'),
                  (stryMutAct_9fa48('2371') ? id : (stryCov_9fa48('2371'), !id)) ||
                    (stryMutAct_9fa48('2373')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('2372')
                        ? false
                        : (stryCov_9fa48('2372', '2373'),
                          typeof id !==
                            (stryMutAct_9fa48('2374') ? '' : (stryCov_9fa48('2374'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2375')) {
            {
            }
          } else {
            stryCov_9fa48('2375')
            throw new BadRequestError(
              stryMutAct_9fa48('2376')
                ? ''
                : (stryCov_9fa48('2376'), 'Invalid occasion ID: must be a number'),
              stryMutAct_9fa48('2377')
                ? {}
                : (stryCov_9fa48('2377'),
                  {
                    id
                  })
            )
          }
        }
        const occasionRepository = getOccasionRepository()
        const data = await occasionRepository.findById(id, includeDeactivated)
        if (
          stryMutAct_9fa48('2380')
            ? false
            : stryMutAct_9fa48('2379')
              ? true
              : stryMutAct_9fa48('2378')
                ? data
                : (stryCov_9fa48('2378', '2379', '2380'), !data)
        ) {
          if (stryMutAct_9fa48('2381')) {
            {
            }
          } else {
            stryCov_9fa48('2381')
            throw new NotFoundError(
              stryMutAct_9fa48('2382') ? '' : (stryCov_9fa48('2382'), 'Occasion'),
              id
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2383')) {
        {
        }
      } else {
        stryCov_9fa48('2383')
        if (
          stryMutAct_9fa48('2386')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('2385')
              ? false
              : stryMutAct_9fa48('2384')
                ? true
                : (stryCov_9fa48('2384', '2385', '2386'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('2387') ? '' : (stryCov_9fa48('2387'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('2388')) {
            {
            }
          } else {
            stryCov_9fa48('2388')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('2389') ? `` : (stryCov_9fa48('2389'), `getOccasionById(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get occasion by slug
 * @param {string} slug - Occasion slug
 * @param {boolean} includeDeactivated - Include deactivated occasions (default: false)
 * @returns {Object|null} Occasion object or null
 * @throws {BadRequestError} If slug is invalid
 * @throws {NotFoundError} If occasion is not found
 */
export async function getOccasionBySlug(
  slug,
  includeDeactivated = stryMutAct_9fa48('2390') ? true : (stryCov_9fa48('2390'), false)
) {
  if (stryMutAct_9fa48('2391')) {
    {
    }
  } else {
    stryCov_9fa48('2391')
    try {
      if (stryMutAct_9fa48('2392')) {
        {
        }
      } else {
        stryCov_9fa48('2392')
        if (
          stryMutAct_9fa48('2395')
            ? !slug && typeof slug !== 'string'
            : stryMutAct_9fa48('2394')
              ? false
              : stryMutAct_9fa48('2393')
                ? true
                : (stryCov_9fa48('2393', '2394', '2395'),
                  (stryMutAct_9fa48('2396') ? slug : (stryCov_9fa48('2396'), !slug)) ||
                    (stryMutAct_9fa48('2398')
                      ? typeof slug === 'string'
                      : stryMutAct_9fa48('2397')
                        ? false
                        : (stryCov_9fa48('2397', '2398'),
                          typeof slug !==
                            (stryMutAct_9fa48('2399') ? '' : (stryCov_9fa48('2399'), 'string')))))
        ) {
          if (stryMutAct_9fa48('2400')) {
            {
            }
          } else {
            stryCov_9fa48('2400')
            throw new BadRequestError(
              stryMutAct_9fa48('2401')
                ? ''
                : (stryCov_9fa48('2401'), 'Invalid occasion slug: must be a string'),
              stryMutAct_9fa48('2402')
                ? {}
                : (stryCov_9fa48('2402'),
                  {
                    slug
                  })
            )
          }
        }
        const occasionRepository = getOccasionRepository()
        const data = await occasionRepository.findBySlug(slug, includeDeactivated)
        if (
          stryMutAct_9fa48('2405')
            ? false
            : stryMutAct_9fa48('2404')
              ? true
              : stryMutAct_9fa48('2403')
                ? data
                : (stryCov_9fa48('2403', '2404', '2405'), !data)
        ) {
          if (stryMutAct_9fa48('2406')) {
            {
            }
          } else {
            stryCov_9fa48('2406')
            throw new NotFoundError(
              stryMutAct_9fa48('2407') ? '' : (stryCov_9fa48('2407'), 'Occasion'),
              slug
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2408')) {
        {
        }
      } else {
        stryCov_9fa48('2408')
        if (
          stryMutAct_9fa48('2411')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('2410')
              ? false
              : stryMutAct_9fa48('2409')
                ? true
                : (stryCov_9fa48('2409', '2410', '2411'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('2412') ? '' : (stryCov_9fa48('2412'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('2413')) {
            {
            }
          } else {
            stryCov_9fa48('2413')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('2414')
            ? ``
            : (stryCov_9fa48('2414'), `getOccasionBySlug(${slug}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
