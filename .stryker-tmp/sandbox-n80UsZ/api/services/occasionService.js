/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Occasion Service
 * Full CRUD operations with soft-delete (active flag)
 * Uses indexed slug column for SEO-friendly lookups
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses OccasionRepository for data access
 * Following Service Layer Exclusive principle
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
import DIContainer from '../architecture/di-container.js'
import { NotFoundError, BadRequestError } from '../errors/AppError.js'
import { validateOccasion, validateId } from '../utils/validation.js'

/**
 * Get OccasionRepository instance from DI Container
 * @returns {OccasionRepository} Repository instance
 */
function getOccasionRepository() {
  if (stryMutAct_9fa48('2220')) {
    {
    }
  } else {
    stryCov_9fa48('2220')
    return DIContainer.resolve(
      stryMutAct_9fa48('2221') ? '' : (stryCov_9fa48('2221'), 'OccasionRepository')
    )
  }
}

/**
 * Validates occasion ID parameter
 * @param {number} id - Occasion ID to validate
 * @param {string} operation - Operation name for error context
 * @throws {BadRequestError} When ID is invalid
 */
function validateOccasionId(
  id,
  operation = stryMutAct_9fa48('2222') ? '' : (stryCov_9fa48('2222'), 'operation')
) {
  if (stryMutAct_9fa48('2223')) {
    {
    }
  } else {
    stryCov_9fa48('2223')
    validateId(id, stryMutAct_9fa48('2224') ? '' : (stryCov_9fa48('2224'), 'Occasion'), operation)
  }
}

/**
 * Get all occasions with filters - returns active occasions ordered by display_order
 * @param {Object} [filters={}] - Filter options
 * @param {number} [filters.limit] - Maximum number of occasions to return
 * @param {boolean} includeDeactivated - Include inactive occasions (default: false, admin only)
 * @returns {Object[]} - Array of occasions ordered by display_order
 * @throws {NotFoundError} When no occasions are found
 * @throws {DatabaseError} When database query fails
 */
export async function getAllOccasions(
  filters = {},
  includeDeactivated = stryMutAct_9fa48('2225') ? true : (stryCov_9fa48('2225'), false)
) {
  if (stryMutAct_9fa48('2226')) {
    {
    }
  } else {
    stryCov_9fa48('2226')
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.findAllWithFilters(
      stryMutAct_9fa48('2227')
        ? {}
        : (stryCov_9fa48('2227'),
          {
            ...filters,
            includeDeactivated
          }),
      stryMutAct_9fa48('2228')
        ? {}
        : (stryCov_9fa48('2228'),
          {
            orderBy: stryMutAct_9fa48('2229') ? '' : (stryCov_9fa48('2229'), 'display_order'),
            ascending: stryMutAct_9fa48('2230') ? false : (stryCov_9fa48('2230'), true),
            limit: filters.limit
          })
    )
    if (
      stryMutAct_9fa48('2233')
        ? !data && data.length === 0
        : stryMutAct_9fa48('2232')
          ? false
          : stryMutAct_9fa48('2231')
            ? true
            : (stryCov_9fa48('2231', '2232', '2233'),
              (stryMutAct_9fa48('2234') ? data : (stryCov_9fa48('2234'), !data)) ||
                (stryMutAct_9fa48('2236')
                  ? data.length !== 0
                  : stryMutAct_9fa48('2235')
                    ? false
                    : (stryCov_9fa48('2235', '2236'), data.length === 0)))
    ) {
      if (stryMutAct_9fa48('2237')) {
        {
        }
      } else {
        stryCov_9fa48('2237')
        throw new NotFoundError(
          stryMutAct_9fa48('2238') ? '' : (stryCov_9fa48('2238'), 'Occasions'),
          null
        )
      }
    }
    return data
  }
}

/**
 * Get occasion by ID
 * @param {number} id - Occasion ID to retrieve
 * @param {boolean} includeDeactivated - Include inactive occasions (default: false, admin only)
 * @returns {Object} - Occasion object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getOccasionById(
  id,
  includeDeactivated = stryMutAct_9fa48('2239') ? true : (stryCov_9fa48('2239'), false)
) {
  if (stryMutAct_9fa48('2240')) {
    {
    }
  } else {
    stryCov_9fa48('2240')
    validateOccasionId(
      id,
      stryMutAct_9fa48('2241') ? '' : (stryCov_9fa48('2241'), 'getOccasionById')
    )
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.findById(id, includeDeactivated)
    if (
      stryMutAct_9fa48('2244')
        ? false
        : stryMutAct_9fa48('2243')
          ? true
          : stryMutAct_9fa48('2242')
            ? data
            : (stryCov_9fa48('2242', '2243', '2244'), !data)
    ) {
      if (stryMutAct_9fa48('2245')) {
        {
        }
      } else {
        stryCov_9fa48('2245')
        throw new NotFoundError(
          stryMutAct_9fa48('2246') ? '' : (stryCov_9fa48('2246'), 'Occasion'),
          id,
          stryMutAct_9fa48('2247')
            ? {}
            : (stryCov_9fa48('2247'),
              {
                includeDeactivated
              })
        )
      }
    }
    return data
  }
}

/**
 * Get occasion by slug (indexed column for SEO)
 * @param {string} slug - Occasion slug to search for
 * @param {boolean} includeDeactivated - Include inactive occasions (default: false, admin only)
 * @returns {Object} - Occasion object
 * @throws {BadRequestError} When slug is invalid
 * @throws {NotFoundError} When occasion with slug is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getOccasionBySlug(
  slug,
  includeDeactivated = stryMutAct_9fa48('2248') ? true : (stryCov_9fa48('2248'), false)
) {
  if (stryMutAct_9fa48('2249')) {
    {
    }
  } else {
    stryCov_9fa48('2249')
    if (
      stryMutAct_9fa48('2252')
        ? !slug && typeof slug !== 'string'
        : stryMutAct_9fa48('2251')
          ? false
          : stryMutAct_9fa48('2250')
            ? true
            : (stryCov_9fa48('2250', '2251', '2252'),
              (stryMutAct_9fa48('2253') ? slug : (stryCov_9fa48('2253'), !slug)) ||
                (stryMutAct_9fa48('2255')
                  ? typeof slug === 'string'
                  : stryMutAct_9fa48('2254')
                    ? false
                    : (stryCov_9fa48('2254', '2255'),
                      typeof slug !==
                        (stryMutAct_9fa48('2256') ? '' : (stryCov_9fa48('2256'), 'string')))))
    ) {
      if (stryMutAct_9fa48('2257')) {
        {
        }
      } else {
        stryCov_9fa48('2257')
        throw new BadRequestError(
          stryMutAct_9fa48('2258') ? '' : (stryCov_9fa48('2258'), 'Invalid slug: must be a string'),
          stryMutAct_9fa48('2259')
            ? {}
            : (stryCov_9fa48('2259'),
              {
                slug
              })
        )
      }
    }
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.findBySlug(slug, includeDeactivated)
    if (
      stryMutAct_9fa48('2262')
        ? false
        : stryMutAct_9fa48('2261')
          ? true
          : stryMutAct_9fa48('2260')
            ? data
            : (stryCov_9fa48('2260', '2261', '2262'), !data)
    ) {
      if (stryMutAct_9fa48('2263')) {
        {
        }
      } else {
        stryCov_9fa48('2263')
        throw new NotFoundError(
          stryMutAct_9fa48('2264') ? '' : (stryCov_9fa48('2264'), 'Occasion'),
          slug,
          stryMutAct_9fa48('2265')
            ? {}
            : (stryCov_9fa48('2265'),
              {
                slug,
                includeDeactivated
              })
        )
      }
    }
    return data
  }
}

/**
 * Create new occasion
 * @param {Object} occasionData - Occasion data to create
 * @param {string} occasionData.name - Occasion name (required)
 * @param {string} occasionData.slug - Occasion slug (required, must be lowercase alphanumeric with hyphens)
 * @param {string} [occasionData.description] - Occasion description
 * @param {number} [occasionData.display_order=0] - Display order for sorting
 * @returns {Object} - Created occasion
 * @throws {ValidationError} When occasion data is invalid
 * @throws {DatabaseConstraintError} When occasion violates database constraints (e.g., duplicate slug)
 * @throws {DatabaseError} When database insert fails
 */
export async function createOccasion(occasionData) {
  if (stryMutAct_9fa48('2266')) {
    {
    }
  } else {
    stryCov_9fa48('2266')
    validateOccasion(occasionData, stryMutAct_9fa48('2267') ? true : (stryCov_9fa48('2267'), false))
    const newOccasion = stryMutAct_9fa48('2268')
      ? {}
      : (stryCov_9fa48('2268'),
        {
          name: occasionData.name,
          description: (
            stryMutAct_9fa48('2271')
              ? occasionData.description === undefined
              : stryMutAct_9fa48('2270')
                ? false
                : stryMutAct_9fa48('2269')
                  ? true
                  : (stryCov_9fa48('2269', '2270', '2271'), occasionData.description !== undefined)
          )
            ? occasionData.description
            : null,
          slug: occasionData.slug,
          display_order: (
            stryMutAct_9fa48('2274')
              ? occasionData.display_order === undefined
              : stryMutAct_9fa48('2273')
                ? false
                : stryMutAct_9fa48('2272')
                  ? true
                  : (stryCov_9fa48('2272', '2273', '2274'),
                    occasionData.display_order !== undefined)
          )
            ? occasionData.display_order
            : 0,
          active: stryMutAct_9fa48('2275') ? false : (stryCov_9fa48('2275'), true)
        })
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.create(newOccasion)
    return data
  }
}

/**
 * Update occasion (limited fields) - only allows updating specific occasion fields
 * @param {number} id - Occasion ID to update
 * @param {Object} updates - Updated occasion data
 * @param {string} [updates.name] - Occasion name
 * @param {string} [updates.description] - Occasion description
 * @param {string} [updates.slug] - Occasion slug
 * @param {number} [updates.display_order] - Display order for sorting
 * @returns {Object} - Updated occasion
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When occasion data is invalid
 * @throws {NotFoundError} When occasion is not found
 * @throws {DatabaseConstraintError} When occasion violates database constraints (e.g., duplicate slug)
 * @throws {DatabaseError} When database update fails
 */
export async function updateOccasion(id, updates) {
  if (stryMutAct_9fa48('2276')) {
    {
    }
  } else {
    stryCov_9fa48('2276')
    validateOccasionId(
      id,
      stryMutAct_9fa48('2277') ? '' : (stryCov_9fa48('2277'), 'updateOccasion')
    )
    if (
      stryMutAct_9fa48('2280')
        ? !updates && Object.keys(updates).length === 0
        : stryMutAct_9fa48('2279')
          ? false
          : stryMutAct_9fa48('2278')
            ? true
            : (stryCov_9fa48('2278', '2279', '2280'),
              (stryMutAct_9fa48('2281') ? updates : (stryCov_9fa48('2281'), !updates)) ||
                (stryMutAct_9fa48('2283')
                  ? Object.keys(updates).length !== 0
                  : stryMutAct_9fa48('2282')
                    ? false
                    : (stryCov_9fa48('2282', '2283'), Object.keys(updates).length === 0)))
    ) {
      if (stryMutAct_9fa48('2284')) {
        {
        }
      } else {
        stryCov_9fa48('2284')
        throw new BadRequestError(
          stryMutAct_9fa48('2285') ? '' : (stryCov_9fa48('2285'), 'No updates provided'),
          stryMutAct_9fa48('2286')
            ? {}
            : (stryCov_9fa48('2286'),
              {
                occasionId: id
              })
        )
      }
    }
    validateOccasion(updates, stryMutAct_9fa48('2287') ? false : (stryCov_9fa48('2287'), true))
    const allowedFields = stryMutAct_9fa48('2288')
      ? []
      : (stryCov_9fa48('2288'),
        [
          stryMutAct_9fa48('2289') ? '' : (stryCov_9fa48('2289'), 'name'),
          stryMutAct_9fa48('2290') ? '' : (stryCov_9fa48('2290'), 'description'),
          stryMutAct_9fa48('2291') ? '' : (stryCov_9fa48('2291'), 'slug'),
          stryMutAct_9fa48('2292') ? '' : (stryCov_9fa48('2292'), 'display_order')
        ])
    const sanitized = {}
    for (const key of allowedFields) {
      if (stryMutAct_9fa48('2293')) {
        {
        }
      } else {
        stryCov_9fa48('2293')
        if (
          stryMutAct_9fa48('2296')
            ? updates[key] === undefined
            : stryMutAct_9fa48('2295')
              ? false
              : stryMutAct_9fa48('2294')
                ? true
                : (stryCov_9fa48('2294', '2295', '2296'), updates[key] !== undefined)
        ) {
          if (stryMutAct_9fa48('2297')) {
            {
            }
          } else {
            stryCov_9fa48('2297')
            sanitized[key] = updates[key]
          }
        }
      }
    }
    if (
      stryMutAct_9fa48('2300')
        ? Object.keys(sanitized).length !== 0
        : stryMutAct_9fa48('2299')
          ? false
          : stryMutAct_9fa48('2298')
            ? true
            : (stryCov_9fa48('2298', '2299', '2300'), Object.keys(sanitized).length === 0)
    ) {
      if (stryMutAct_9fa48('2301')) {
        {
        }
      } else {
        stryCov_9fa48('2301')
        throw new BadRequestError(
          stryMutAct_9fa48('2302') ? '' : (stryCov_9fa48('2302'), 'No valid fields to update'),
          stryMutAct_9fa48('2303')
            ? {}
            : (stryCov_9fa48('2303'),
              {
                occasionId: id
              })
        )
      }
    }
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.update(id, sanitized)
    if (
      stryMutAct_9fa48('2306')
        ? false
        : stryMutAct_9fa48('2305')
          ? true
          : stryMutAct_9fa48('2304')
            ? data
            : (stryCov_9fa48('2304', '2305', '2306'), !data)
    ) {
      if (stryMutAct_9fa48('2307')) {
        {
        }
      } else {
        stryCov_9fa48('2307')
        throw new NotFoundError(
          stryMutAct_9fa48('2308') ? '' : (stryCov_9fa48('2308'), 'Occasion'),
          id,
          stryMutAct_9fa48('2309')
            ? {}
            : (stryCov_9fa48('2309'),
              {
                active: stryMutAct_9fa48('2310') ? false : (stryCov_9fa48('2310'), true)
              })
        )
      }
    }
    return data
  }
}

/**
 * Soft-delete occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to delete
 * @returns {Object} - Deactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteOccasion(id) {
  if (stryMutAct_9fa48('2311')) {
    {
    }
  } else {
    stryCov_9fa48('2311')
    validateOccasionId(
      id,
      stryMutAct_9fa48('2312') ? '' : (stryCov_9fa48('2312'), 'deleteOccasion')
    )
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.update(
      id,
      stryMutAct_9fa48('2313')
        ? {}
        : (stryCov_9fa48('2313'),
          {
            active: stryMutAct_9fa48('2314') ? true : (stryCov_9fa48('2314'), false)
          })
    )
    if (
      stryMutAct_9fa48('2317')
        ? false
        : stryMutAct_9fa48('2316')
          ? true
          : stryMutAct_9fa48('2315')
            ? data
            : (stryCov_9fa48('2315', '2316', '2317'), !data)
    ) {
      if (stryMutAct_9fa48('2318')) {
        {
        }
      } else {
        stryCov_9fa48('2318')
        throw new NotFoundError(
          stryMutAct_9fa48('2319') ? '' : (stryCov_9fa48('2319'), 'Occasion'),
          id,
          stryMutAct_9fa48('2320')
            ? {}
            : (stryCov_9fa48('2320'),
              {
                active: stryMutAct_9fa48('2321') ? false : (stryCov_9fa48('2321'), true)
              })
        )
      }
    }
    return data
  }
}

/**
 * Reactivate occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to reactivate
 * @returns {Object} - Reactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivateOccasion(id) {
  if (stryMutAct_9fa48('2322')) {
    {
    }
  } else {
    stryCov_9fa48('2322')
    validateOccasionId(
      id,
      stryMutAct_9fa48('2323') ? '' : (stryCov_9fa48('2323'), 'reactivateOccasion')
    )
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.update(
      id,
      stryMutAct_9fa48('2324')
        ? {}
        : (stryCov_9fa48('2324'),
          {
            active: stryMutAct_9fa48('2325') ? false : (stryCov_9fa48('2325'), true)
          })
    )
    if (
      stryMutAct_9fa48('2328')
        ? false
        : stryMutAct_9fa48('2327')
          ? true
          : stryMutAct_9fa48('2326')
            ? data
            : (stryCov_9fa48('2326', '2327', '2328'), !data)
    ) {
      if (stryMutAct_9fa48('2329')) {
        {
        }
      } else {
        stryCov_9fa48('2329')
        throw new NotFoundError(
          stryMutAct_9fa48('2330') ? '' : (stryCov_9fa48('2330'), 'Occasion'),
          id,
          stryMutAct_9fa48('2331')
            ? {}
            : (stryCov_9fa48('2331'),
              {
                active: stryMutAct_9fa48('2332') ? true : (stryCov_9fa48('2332'), false)
              })
        )
      }
    }
    return data
  }
}

/**
 * Update display order for occasion sorting
 * @param {number} id - Occasion ID to update
 * @param {number} newOrder - New display order (must be non-negative)
 * @returns {Object} - Updated occasion
 * @throws {BadRequestError} When ID is invalid or newOrder is negative
 * @throws {NotFoundError} When occasion is not found or inactive
 * @throws {DatabaseError} When database update fails
 */
export async function updateDisplayOrder(id, newOrder) {
  if (stryMutAct_9fa48('2333')) {
    {
    }
  } else {
    stryCov_9fa48('2333')
    validateOccasionId(
      id,
      stryMutAct_9fa48('2334') ? '' : (stryCov_9fa48('2334'), 'updateDisplayOrder')
    )
    if (
      stryMutAct_9fa48('2337')
        ? typeof newOrder !== 'number' && newOrder < 0
        : stryMutAct_9fa48('2336')
          ? false
          : stryMutAct_9fa48('2335')
            ? true
            : (stryCov_9fa48('2335', '2336', '2337'),
              (stryMutAct_9fa48('2339')
                ? typeof newOrder === 'number'
                : stryMutAct_9fa48('2338')
                  ? false
                  : (stryCov_9fa48('2338', '2339'),
                    typeof newOrder !==
                      (stryMutAct_9fa48('2340') ? '' : (stryCov_9fa48('2340'), 'number')))) ||
                (stryMutAct_9fa48('2343')
                  ? newOrder >= 0
                  : stryMutAct_9fa48('2342')
                    ? newOrder <= 0
                    : stryMutAct_9fa48('2341')
                      ? false
                      : (stryCov_9fa48('2341', '2342', '2343'), newOrder < 0)))
    ) {
      if (stryMutAct_9fa48('2344')) {
        {
        }
      } else {
        stryCov_9fa48('2344')
        throw new BadRequestError(
          stryMutAct_9fa48('2345')
            ? ''
            : (stryCov_9fa48('2345'), 'Invalid display_order: must be a non-negative number'),
          stryMutAct_9fa48('2346')
            ? {}
            : (stryCov_9fa48('2346'),
              {
                newOrder
              })
        )
      }
    }
    const occasionRepository = getOccasionRepository()
    const data = await occasionRepository.update(
      id,
      stryMutAct_9fa48('2347')
        ? {}
        : (stryCov_9fa48('2347'),
          {
            display_order: newOrder
          })
    )
    if (
      stryMutAct_9fa48('2350')
        ? false
        : stryMutAct_9fa48('2349')
          ? true
          : stryMutAct_9fa48('2348')
            ? data
            : (stryCov_9fa48('2348', '2349', '2350'), !data)
    ) {
      if (stryMutAct_9fa48('2351')) {
        {
        }
      } else {
        stryCov_9fa48('2351')
        throw new NotFoundError(
          stryMutAct_9fa48('2352') ? '' : (stryCov_9fa48('2352'), 'Occasion'),
          id,
          stryMutAct_9fa48('2353')
            ? {}
            : (stryCov_9fa48('2353'),
              {
                active: stryMutAct_9fa48('2354') ? false : (stryCov_9fa48('2354'), true)
              })
        )
      }
    }
    return data
  }
}
