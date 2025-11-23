/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Occasion Service - Create Operations
 * Handles occasion creation
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
import { getOccasionRepository, ValidationError } from './occasionService.helpers.js'

/**
 * Create new occasion
 * @param {Object} occasionData - Occasion data
 * @returns {Object} Created occasion
 * @throws {ValidationError} If occasion data is invalid
 */
export async function createOccasion(occasionData) {
  if (stryMutAct_9fa48('2153')) {
    {
    }
  } else {
    stryCov_9fa48('2153')
    try {
      if (stryMutAct_9fa48('2154')) {
        {
        }
      } else {
        stryCov_9fa48('2154')
        const occasionRepository = getOccasionRepository()

        // Validate required fields
        if (
          stryMutAct_9fa48('2157')
            ? !occasionData.name && typeof occasionData.name !== 'string'
            : stryMutAct_9fa48('2156')
              ? false
              : stryMutAct_9fa48('2155')
                ? true
                : (stryCov_9fa48('2155', '2156', '2157'),
                  (stryMutAct_9fa48('2158')
                    ? occasionData.name
                    : (stryCov_9fa48('2158'), !occasionData.name)) ||
                    (stryMutAct_9fa48('2160')
                      ? typeof occasionData.name === 'string'
                      : stryMutAct_9fa48('2159')
                        ? false
                        : (stryCov_9fa48('2159', '2160'),
                          typeof occasionData.name !==
                            (stryMutAct_9fa48('2161') ? '' : (stryCov_9fa48('2161'), 'string')))))
        ) {
          if (stryMutAct_9fa48('2162')) {
            {
            }
          } else {
            stryCov_9fa48('2162')
            throw new ValidationError(
              stryMutAct_9fa48('2163')
                ? ''
                : (stryCov_9fa48('2163'), 'Occasion name is required and must be a string'),
              stryMutAct_9fa48('2164')
                ? {}
                : (stryCov_9fa48('2164'),
                  {
                    field: stryMutAct_9fa48('2165') ? '' : (stryCov_9fa48('2165'), 'name'),
                    value: occasionData.name
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('2168')
            ? !occasionData.slug && typeof occasionData.slug !== 'string'
            : stryMutAct_9fa48('2167')
              ? false
              : stryMutAct_9fa48('2166')
                ? true
                : (stryCov_9fa48('2166', '2167', '2168'),
                  (stryMutAct_9fa48('2169')
                    ? occasionData.slug
                    : (stryCov_9fa48('2169'), !occasionData.slug)) ||
                    (stryMutAct_9fa48('2171')
                      ? typeof occasionData.slug === 'string'
                      : stryMutAct_9fa48('2170')
                        ? false
                        : (stryCov_9fa48('2170', '2171'),
                          typeof occasionData.slug !==
                            (stryMutAct_9fa48('2172') ? '' : (stryCov_9fa48('2172'), 'string')))))
        ) {
          if (stryMutAct_9fa48('2173')) {
            {
            }
          } else {
            stryCov_9fa48('2173')
            throw new ValidationError(
              stryMutAct_9fa48('2174')
                ? ''
                : (stryCov_9fa48('2174'), 'Occasion slug is required and must be a string'),
              stryMutAct_9fa48('2175')
                ? {}
                : (stryCov_9fa48('2175'),
                  {
                    field: stryMutAct_9fa48('2176') ? '' : (stryCov_9fa48('2176'), 'slug'),
                    value: occasionData.slug
                  })
            )
          }
        }

        // Prepare occasion data
        const newOccasion = stryMutAct_9fa48('2177')
          ? {}
          : (stryCov_9fa48('2177'),
            {
              name: occasionData.name,
              slug: occasionData.slug,
              description: stryMutAct_9fa48('2180')
                ? occasionData.description && null
                : stryMutAct_9fa48('2179')
                  ? false
                  : stryMutAct_9fa48('2178')
                    ? true
                    : (stryCov_9fa48('2178', '2179', '2180'), occasionData.description || null),
              display_order: stryMutAct_9fa48('2183')
                ? occasionData.display_order && 0
                : stryMutAct_9fa48('2182')
                  ? false
                  : stryMutAct_9fa48('2181')
                    ? true
                    : (stryCov_9fa48('2181', '2182', '2183'), occasionData.display_order || 0),
              active: (
                stryMutAct_9fa48('2186')
                  ? occasionData.active === undefined
                  : stryMutAct_9fa48('2185')
                    ? false
                    : stryMutAct_9fa48('2184')
                      ? true
                      : (stryCov_9fa48('2184', '2185', '2186'), occasionData.active !== undefined)
              )
                ? occasionData.active
                : stryMutAct_9fa48('2187')
                  ? false
                  : (stryCov_9fa48('2187'), true)
            })

        // Use repository to create occasion
        const data = await occasionRepository.create(newOccasion)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2188')) {
        {
        }
      } else {
        stryCov_9fa48('2188')
        console.error(
          stryMutAct_9fa48('2189') ? '' : (stryCov_9fa48('2189'), 'createOccasion failed:'),
          error
        )
        throw error
      }
    }
  }
}
