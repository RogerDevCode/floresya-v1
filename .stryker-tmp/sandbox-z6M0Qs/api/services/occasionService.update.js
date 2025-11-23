/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Occasion Service - Update Operations
 * Handles occasion updates and order changes
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
import {
  getOccasionRepository,
  ValidationError,
  BadRequestError
} from './occasionService.helpers.js'

/**
 * Update occasion
 * @param {number} id - Occasion ID to update
 * @param {Object} updates - Updated occasion data
 * @returns {Object} Updated occasion
 * @throws {BadRequestError} If ID is invalid
 * @throws {ValidationError} If update data is invalid
 */
export async function updateOccasion(id, updates) {
  if (stryMutAct_9fa48('2415')) {
    {
    }
  } else {
    stryCov_9fa48('2415')
    try {
      if (stryMutAct_9fa48('2416')) {
        {
        }
      } else {
        stryCov_9fa48('2416')
        if (
          stryMutAct_9fa48('2419')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('2418')
              ? false
              : stryMutAct_9fa48('2417')
                ? true
                : (stryCov_9fa48('2417', '2418', '2419'),
                  (stryMutAct_9fa48('2420') ? id : (stryCov_9fa48('2420'), !id)) ||
                    (stryMutAct_9fa48('2422')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('2421')
                        ? false
                        : (stryCov_9fa48('2421', '2422'),
                          typeof id !==
                            (stryMutAct_9fa48('2423') ? '' : (stryCov_9fa48('2423'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2424')) {
            {
            }
          } else {
            stryCov_9fa48('2424')
            throw new BadRequestError(
              stryMutAct_9fa48('2425')
                ? ''
                : (stryCov_9fa48('2425'), 'Invalid occasion ID: must be a number'),
              stryMutAct_9fa48('2426')
                ? {}
                : (stryCov_9fa48('2426'),
                  {
                    id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('2429')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('2428')
              ? false
              : stryMutAct_9fa48('2427')
                ? true
                : (stryCov_9fa48('2427', '2428', '2429'),
                  (stryMutAct_9fa48('2430') ? updates : (stryCov_9fa48('2430'), !updates)) ||
                    (stryMutAct_9fa48('2432')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('2431')
                        ? false
                        : (stryCov_9fa48('2431', '2432'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('2433')) {
            {
            }
          } else {
            stryCov_9fa48('2433')
            throw new BadRequestError(
              stryMutAct_9fa48('2434') ? '' : (stryCov_9fa48('2434'), 'No updates provided'),
              stryMutAct_9fa48('2435')
                ? {}
                : (stryCov_9fa48('2435'),
                  {
                    id
                  })
            )
          }
        }
        const occasionRepository = getOccasionRepository()

        // Validate updates if name or slug is being changed
        if (
          stryMutAct_9fa48('2438')
            ? updates.name === undefined
            : stryMutAct_9fa48('2437')
              ? false
              : stryMutAct_9fa48('2436')
                ? true
                : (stryCov_9fa48('2436', '2437', '2438'), updates.name !== undefined)
        ) {
          if (stryMutAct_9fa48('2439')) {
            {
            }
          } else {
            stryCov_9fa48('2439')
            if (
              stryMutAct_9fa48('2442')
                ? !updates.name && typeof updates.name !== 'string'
                : stryMutAct_9fa48('2441')
                  ? false
                  : stryMutAct_9fa48('2440')
                    ? true
                    : (stryCov_9fa48('2440', '2441', '2442'),
                      (stryMutAct_9fa48('2443')
                        ? updates.name
                        : (stryCov_9fa48('2443'), !updates.name)) ||
                        (stryMutAct_9fa48('2445')
                          ? typeof updates.name === 'string'
                          : stryMutAct_9fa48('2444')
                            ? false
                            : (stryCov_9fa48('2444', '2445'),
                              typeof updates.name !==
                                (stryMutAct_9fa48('2446')
                                  ? ''
                                  : (stryCov_9fa48('2446'), 'string')))))
            ) {
              if (stryMutAct_9fa48('2447')) {
                {
                }
              } else {
                stryCov_9fa48('2447')
                throw new ValidationError(
                  stryMutAct_9fa48('2448')
                    ? ''
                    : (stryCov_9fa48('2448'), 'Occasion name must be a string'),
                  stryMutAct_9fa48('2449')
                    ? {}
                    : (stryCov_9fa48('2449'),
                      {
                        field: stryMutAct_9fa48('2450') ? '' : (stryCov_9fa48('2450'), 'name'),
                        value: updates.name
                      })
                )
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('2453')
            ? updates.slug === undefined
            : stryMutAct_9fa48('2452')
              ? false
              : stryMutAct_9fa48('2451')
                ? true
                : (stryCov_9fa48('2451', '2452', '2453'), updates.slug !== undefined)
        ) {
          if (stryMutAct_9fa48('2454')) {
            {
            }
          } else {
            stryCov_9fa48('2454')
            if (
              stryMutAct_9fa48('2457')
                ? !updates.slug && typeof updates.slug !== 'string'
                : stryMutAct_9fa48('2456')
                  ? false
                  : stryMutAct_9fa48('2455')
                    ? true
                    : (stryCov_9fa48('2455', '2456', '2457'),
                      (stryMutAct_9fa48('2458')
                        ? updates.slug
                        : (stryCov_9fa48('2458'), !updates.slug)) ||
                        (stryMutAct_9fa48('2460')
                          ? typeof updates.slug === 'string'
                          : stryMutAct_9fa48('2459')
                            ? false
                            : (stryCov_9fa48('2459', '2460'),
                              typeof updates.slug !==
                                (stryMutAct_9fa48('2461')
                                  ? ''
                                  : (stryCov_9fa48('2461'), 'string')))))
            ) {
              if (stryMutAct_9fa48('2462')) {
                {
                }
              } else {
                stryCov_9fa48('2462')
                throw new ValidationError(
                  stryMutAct_9fa48('2463')
                    ? ''
                    : (stryCov_9fa48('2463'), 'Occasion slug must be a string'),
                  stryMutAct_9fa48('2464')
                    ? {}
                    : (stryCov_9fa48('2464'),
                      {
                        field: stryMutAct_9fa48('2465') ? '' : (stryCov_9fa48('2465'), 'slug'),
                        value: updates.slug
                      })
                )
              }
            }
          }
        }

        // Use repository to update occasion
        const data = await occasionRepository.update(id, updates)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2466')) {
        {
        }
      } else {
        stryCov_9fa48('2466')
        console.error(
          stryMutAct_9fa48('2467') ? `` : (stryCov_9fa48('2467'), `updateOccasion(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update display order for occasion
 * @param {number} id - Occasion ID
 * @param {number} newOrder - New display order
 * @returns {Object} Updated occasion
 * @throws {BadRequestError} If ID or order is invalid
 */
export async function updateDisplayOrder(id, newOrder) {
  if (stryMutAct_9fa48('2468')) {
    {
    }
  } else {
    stryCov_9fa48('2468')
    try {
      if (stryMutAct_9fa48('2469')) {
        {
        }
      } else {
        stryCov_9fa48('2469')
        if (
          stryMutAct_9fa48('2472')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('2471')
              ? false
              : stryMutAct_9fa48('2470')
                ? true
                : (stryCov_9fa48('2470', '2471', '2472'),
                  (stryMutAct_9fa48('2473') ? id : (stryCov_9fa48('2473'), !id)) ||
                    (stryMutAct_9fa48('2475')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('2474')
                        ? false
                        : (stryCov_9fa48('2474', '2475'),
                          typeof id !==
                            (stryMutAct_9fa48('2476') ? '' : (stryCov_9fa48('2476'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2477')) {
            {
            }
          } else {
            stryCov_9fa48('2477')
            throw new BadRequestError(
              stryMutAct_9fa48('2478')
                ? ''
                : (stryCov_9fa48('2478'), 'Invalid occasion ID: must be a number'),
              stryMutAct_9fa48('2479')
                ? {}
                : (stryCov_9fa48('2479'),
                  {
                    id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('2482')
            ? (newOrder === undefined || newOrder === null || typeof newOrder !== 'number') &&
              newOrder < 0
            : stryMutAct_9fa48('2481')
              ? false
              : stryMutAct_9fa48('2480')
                ? true
                : (stryCov_9fa48('2480', '2481', '2482'),
                  (stryMutAct_9fa48('2484')
                    ? (newOrder === undefined || newOrder === null) && typeof newOrder !== 'number'
                    : stryMutAct_9fa48('2483')
                      ? false
                      : (stryCov_9fa48('2483', '2484'),
                        (stryMutAct_9fa48('2486')
                          ? newOrder === undefined && newOrder === null
                          : stryMutAct_9fa48('2485')
                            ? false
                            : (stryCov_9fa48('2485', '2486'),
                              (stryMutAct_9fa48('2488')
                                ? newOrder !== undefined
                                : stryMutAct_9fa48('2487')
                                  ? false
                                  : (stryCov_9fa48('2487', '2488'), newOrder === undefined)) ||
                                (stryMutAct_9fa48('2490')
                                  ? newOrder !== null
                                  : stryMutAct_9fa48('2489')
                                    ? false
                                    : (stryCov_9fa48('2489', '2490'), newOrder === null)))) ||
                          (stryMutAct_9fa48('2492')
                            ? typeof newOrder === 'number'
                            : stryMutAct_9fa48('2491')
                              ? false
                              : (stryCov_9fa48('2491', '2492'),
                                typeof newOrder !==
                                  (stryMutAct_9fa48('2493')
                                    ? ''
                                    : (stryCov_9fa48('2493'), 'number')))))) ||
                    (stryMutAct_9fa48('2496')
                      ? newOrder >= 0
                      : stryMutAct_9fa48('2495')
                        ? newOrder <= 0
                        : stryMutAct_9fa48('2494')
                          ? false
                          : (stryCov_9fa48('2494', '2495', '2496'), newOrder < 0)))
        ) {
          if (stryMutAct_9fa48('2497')) {
            {
            }
          } else {
            stryCov_9fa48('2497')
            throw new BadRequestError(
              stryMutAct_9fa48('2498')
                ? ''
                : (stryCov_9fa48('2498'), 'Invalid display order: must be a non-negative number'),
              stryMutAct_9fa48('2499')
                ? {}
                : (stryCov_9fa48('2499'),
                  {
                    newOrder
                  })
            )
          }
        }
        const occasionRepository = getOccasionRepository()
        const data = await occasionRepository.update(
          id,
          stryMutAct_9fa48('2500')
            ? {}
            : (stryCov_9fa48('2500'),
              {
                display_order: newOrder
              })
        )
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2501')) {
        {
        }
      } else {
        stryCov_9fa48('2501')
        console.error(
          stryMutAct_9fa48('2502')
            ? ``
            : (stryCov_9fa48('2502'), `updateDisplayOrder(${id}, ${newOrder}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
