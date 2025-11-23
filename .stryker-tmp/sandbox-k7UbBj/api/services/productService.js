/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Product Service
 * Full CRUD operations with soft-delete (active flag)
 * Uses stored functions for atomic operations
 * Uses indexed columns (sku, active, featured, carousel_order)
 * ENTERPRISE FAIL-FAST: All errors use custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses ProductRepository for data access
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
import { DB_SCHEMA } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { sanitizeProductData } from '../utils/sanitize.js'
import { CAROUSEL } from '../config/constants.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateProduct } from '../utils/validation.js'
import { logger } from '../utils/logger.js'
const TABLE = DB_SCHEMA.products.table

/**
 * Get ProductRepository instance from DI Container
 * @returns {ProductRepository} Repository instance
 */
function getProductRepository() {
  if (stryMutAct_9fa48('4898')) {
    {
    }
  } else {
    stryCov_9fa48('4898')
    return DIContainer.resolve(
      stryMutAct_9fa48('4899') ? '' : (stryCov_9fa48('4899'), 'ProductRepository')
    )
  }
}

/**
 * Get OccasionRepository instance from DI Container
 * @returns {OccasionRepository} Repository instance
 */
function getOccasionRepository() {
  if (stryMutAct_9fa48('4900')) {
    {
    }
  } else {
    stryCov_9fa48('4900')
    return DIContainer.resolve(
      stryMutAct_9fa48('4901') ? '' : (stryCov_9fa48('4901'), 'OccasionRepository')
    )
  }
}

/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {number} [filters.limit] - Number of items to return
 * @param {number} [filters.offset] - Number of items to skip
 * @param {boolean} [filters.featured] - Filter by featured products
 * @param {string} [filters.sku] - Filter by SKU
 * @param {string} [filters.search] - Search in name and description (accent-insensitive)
 * @param {string} [filters.sortBy] - Sort field with direction
 * @param {string} [filters.occasion] - Filter by occasion slug
 * @param {boolean} includeDeactivated - Include inactive products (default: false, admin only)
 * @param {string} [includeImageSize] - Include specific image size (thumb, small, medium, large)
 * @returns {Object[]} - Array of products
 * @throws {DatabaseError} When database query fails
 */
export const getAllProducts = withErrorMapping(
  async (
    filters = {},
    includeDeactivated = stryMutAct_9fa48('4902') ? true : (stryCov_9fa48('4902'), false),
    includeImageSize = null
  ) => {
    if (stryMutAct_9fa48('4903')) {
      {
      }
    } else {
      stryCov_9fa48('4903')
      const productRepository = getProductRepository()

      // If filtering by occasion slug, first resolve it to occasion_id
      let occasionId = null
      if (
        stryMutAct_9fa48('4905')
          ? false
          : stryMutAct_9fa48('4904')
            ? true
            : (stryCov_9fa48('4904', '4905'), filters.occasion)
      ) {
        if (stryMutAct_9fa48('4906')) {
          {
          }
        } else {
          stryCov_9fa48('4906')
          // Use OccasionRepository instead of direct database access
          const occasionRepository = getOccasionRepository()
          const occasionData = await occasionRepository.findBySlug(
            filters.occasion,
            stryMutAct_9fa48('4907') ? false : (stryCov_9fa48('4907'), true)
          )

          // Fail Fast: Check for no data
          if (
            stryMutAct_9fa48('4910')
              ? false
              : stryMutAct_9fa48('4909')
                ? true
                : stryMutAct_9fa48('4908')
                  ? occasionData
                  : (stryCov_9fa48('4908', '4909', '4910'), !occasionData)
          ) {
            if (stryMutAct_9fa48('4911')) {
              {
              }
            } else {
              stryCov_9fa48('4911')
              logger.warn(
                stryMutAct_9fa48('4912')
                  ? ``
                  : (stryCov_9fa48('4912'), `Occasion not found for slug: ${filters.occasion}`)
              )
              return stryMutAct_9fa48('4913') ? ['Stryker was here'] : (stryCov_9fa48('4913'), [])
            }
          }
          occasionId = occasionData.id
          logger.debug(
            stryMutAct_9fa48('4914')
              ? ``
              : (stryCov_9fa48('4914'),
                `🔍 Resolved occasion slug "${filters.occasion}" to ID ${occasionId}`)
          )
        }
      }

      // Prepare repository filters
      const repositoryFilters = stryMutAct_9fa48('4915')
        ? {}
        : (stryCov_9fa48('4915'),
          {
            ...filters,
            occasionId: occasionId,
            includeDeactivated
          })

      // Prepare repository options
      const repositoryOptions = {}

      // Handle sorting - pass orderBy in options as expected by repository
      if (
        stryMutAct_9fa48('4918')
          ? filters.sortBy !== 'carousel_order'
          : stryMutAct_9fa48('4917')
            ? false
            : stryMutAct_9fa48('4916')
              ? true
              : (stryCov_9fa48('4916', '4917', '4918'),
                filters.sortBy ===
                  (stryMutAct_9fa48('4919') ? '' : (stryCov_9fa48('4919'), 'carousel_order')))
      ) {
        if (stryMutAct_9fa48('4920')) {
          {
          }
        } else {
          stryCov_9fa48('4920')
          repositoryOptions.orderBy = stryMutAct_9fa48('4921')
            ? ''
            : (stryCov_9fa48('4921'), 'carousel_order')
          repositoryOptions.ascending = stryMutAct_9fa48('4922')
            ? false
            : (stryCov_9fa48('4922'), true)
        }
      } else if (
        stryMutAct_9fa48('4925')
          ? filters.sortBy !== 'price_asc'
          : stryMutAct_9fa48('4924')
            ? false
            : stryMutAct_9fa48('4923')
              ? true
              : (stryCov_9fa48('4923', '4924', '4925'),
                filters.sortBy ===
                  (stryMutAct_9fa48('4926') ? '' : (stryCov_9fa48('4926'), 'price_asc')))
      ) {
        if (stryMutAct_9fa48('4927')) {
          {
          }
        } else {
          stryCov_9fa48('4927')
          repositoryOptions.orderBy = stryMutAct_9fa48('4928')
            ? ''
            : (stryCov_9fa48('4928'), 'price')
          repositoryOptions.ascending = stryMutAct_9fa48('4929')
            ? false
            : (stryCov_9fa48('4929'), true)
        }
      } else if (
        stryMutAct_9fa48('4932')
          ? filters.sortBy !== 'price_desc'
          : stryMutAct_9fa48('4931')
            ? false
            : stryMutAct_9fa48('4930')
              ? true
              : (stryCov_9fa48('4930', '4931', '4932'),
                filters.sortBy ===
                  (stryMutAct_9fa48('4933') ? '' : (stryCov_9fa48('4933'), 'price_desc')))
      ) {
        if (stryMutAct_9fa48('4934')) {
          {
          }
        } else {
          stryCov_9fa48('4934')
          repositoryOptions.orderBy = stryMutAct_9fa48('4935')
            ? ''
            : (stryCov_9fa48('4935'), 'price')
          repositoryOptions.ascending = stryMutAct_9fa48('4936')
            ? true
            : (stryCov_9fa48('4936'), false)
        }
      } else if (
        stryMutAct_9fa48('4939')
          ? filters.sortBy !== 'name_asc'
          : stryMutAct_9fa48('4938')
            ? false
            : stryMutAct_9fa48('4937')
              ? true
              : (stryCov_9fa48('4937', '4938', '4939'),
                filters.sortBy ===
                  (stryMutAct_9fa48('4940') ? '' : (stryCov_9fa48('4940'), 'name_asc')))
      ) {
        if (stryMutAct_9fa48('4941')) {
          {
          }
        } else {
          stryCov_9fa48('4941')
          repositoryOptions.orderBy = stryMutAct_9fa48('4942')
            ? ''
            : (stryCov_9fa48('4942'), 'name')
          repositoryOptions.ascending = stryMutAct_9fa48('4943')
            ? false
            : (stryCov_9fa48('4943'), true)
        }
      } else {
        if (stryMutAct_9fa48('4944')) {
          {
          }
        } else {
          stryCov_9fa48('4944')
          repositoryOptions.orderBy = stryMutAct_9fa48('4945')
            ? ''
            : (stryCov_9fa48('4945'), 'created_at')
          repositoryOptions.ascending = stryMutAct_9fa48('4946')
            ? true
            : (stryCov_9fa48('4946'), false)
        }
      }

      // Apply pagination
      if (
        stryMutAct_9fa48('4949')
          ? filters.limit === undefined
          : stryMutAct_9fa48('4948')
            ? false
            : stryMutAct_9fa48('4947')
              ? true
              : (stryCov_9fa48('4947', '4948', '4949'), filters.limit !== undefined)
      ) {
        if (stryMutAct_9fa48('4950')) {
          {
          }
        } else {
          stryCov_9fa48('4950')
          repositoryOptions.limit = filters.limit
        }
      }
      if (
        stryMutAct_9fa48('4953')
          ? filters.offset === undefined
          : stryMutAct_9fa48('4952')
            ? false
            : stryMutAct_9fa48('4951')
              ? true
              : (stryCov_9fa48('4951', '4952', '4953'), filters.offset !== undefined)
      ) {
        if (stryMutAct_9fa48('4954')) {
          {
          }
        } else {
          stryCov_9fa48('4954')
          repositoryOptions.offset = filters.offset
        }
      }
      logger.debug(
        stryMutAct_9fa48('4955') ? `` : (stryCov_9fa48('4955'), `🔍 Query filters:`),
        stryMutAct_9fa48('4956')
          ? {}
          : (stryCov_9fa48('4956'),
            {
              ...filters,
              occasionId,
              includeDeactivated,
              includeImageSize
            })
      )

      // Get products directly from database
      const products = await productRepository.findAllWithFilters(
        repositoryFilters,
        repositoryOptions
      )
      logger.debug(
        stryMutAct_9fa48('4957')
          ? ``
          : (stryCov_9fa48('4957'),
            `📦 getAllProducts: Found ${products.length} products from database`)
      )

      // If no image size requested, return products
      if (
        stryMutAct_9fa48('4960')
          ? false
          : stryMutAct_9fa48('4959')
            ? true
            : stryMutAct_9fa48('4958')
              ? includeImageSize
              : (stryCov_9fa48('4958', '4959', '4960'), !includeImageSize)
      ) {
        if (stryMutAct_9fa48('4961')) {
          {
          }
        } else {
          stryCov_9fa48('4961')
          return products
        }
      }

      // If images needed, use batch service
      const productIds = products.map(
        stryMutAct_9fa48('4962') ? () => undefined : (stryCov_9fa48('4962'), p => p.id)
      )

      // Use the specialized service function to get products with requested image size
      const { getProductsBatchWithImageSize } = await import(
        stryMutAct_9fa48('4963') ? '' : (stryCov_9fa48('4963'), './productImageService.js')
      )
      return await getProductsBatchWithImageSize(productIds, includeImageSize)
    }
  },
  stryMutAct_9fa48('4964') ? '' : (stryCov_9fa48('4964'), 'SELECT'),
  TABLE
)

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @param {boolean} includeDeactivated - Include inactive products (default: false, admin only)
 * @param {string} [includeImageSize] - Include specific image size (thumb, small, medium, large)
 * @returns {Object} - Product object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When product is not found
 * @throws {DatabaseError} When database query fails
 */
export const getProductById = withErrorMapping(
  async (
    id,
    includeDeactivated = stryMutAct_9fa48('4965') ? true : (stryCov_9fa48('4965'), false),
    includeImageSize = null
  ) => {
    if (stryMutAct_9fa48('4966')) {
      {
      }
    } else {
      stryCov_9fa48('4966')
      const productRepository = getProductRepository()

      // Fail-fast: Validate ID
      if (
        stryMutAct_9fa48('4969')
          ? (id === null || id === undefined || typeof id !== 'number') && id <= 0
          : stryMutAct_9fa48('4968')
            ? false
            : stryMutAct_9fa48('4967')
              ? true
              : (stryCov_9fa48('4967', '4968', '4969'),
                (stryMutAct_9fa48('4971')
                  ? (id === null || id === undefined) && typeof id !== 'number'
                  : stryMutAct_9fa48('4970')
                    ? false
                    : (stryCov_9fa48('4970', '4971'),
                      (stryMutAct_9fa48('4973')
                        ? id === null && id === undefined
                        : stryMutAct_9fa48('4972')
                          ? false
                          : (stryCov_9fa48('4972', '4973'),
                            (stryMutAct_9fa48('4975')
                              ? id !== null
                              : stryMutAct_9fa48('4974')
                                ? false
                                : (stryCov_9fa48('4974', '4975'), id === null)) ||
                              (stryMutAct_9fa48('4977')
                                ? id !== undefined
                                : stryMutAct_9fa48('4976')
                                  ? false
                                  : (stryCov_9fa48('4976', '4977'), id === undefined)))) ||
                        (stryMutAct_9fa48('4979')
                          ? typeof id === 'number'
                          : stryMutAct_9fa48('4978')
                            ? false
                            : (stryCov_9fa48('4978', '4979'),
                              typeof id !==
                                (stryMutAct_9fa48('4980')
                                  ? ''
                                  : (stryCov_9fa48('4980'), 'number')))))) ||
                  (stryMutAct_9fa48('4983')
                    ? id > 0
                    : stryMutAct_9fa48('4982')
                      ? id < 0
                      : stryMutAct_9fa48('4981')
                        ? false
                        : (stryCov_9fa48('4981', '4982', '4983'), id <= 0)))
      ) {
        if (stryMutAct_9fa48('4984')) {
          {
          }
        } else {
          stryCov_9fa48('4984')
          throw new BadRequestError(
            stryMutAct_9fa48('4985')
              ? ''
              : (stryCov_9fa48('4985'), 'Invalid product ID: must be a positive number'),
            stryMutAct_9fa48('4986')
              ? {}
              : (stryCov_9fa48('4986'),
                {
                  productId: id
                })
          )
        }
      }

      // Get product directly from database
      const data = await productRepository.findByIdWithImages(id, includeDeactivated)
      if (
        stryMutAct_9fa48('4989')
          ? false
          : stryMutAct_9fa48('4988')
            ? true
            : stryMutAct_9fa48('4987')
              ? data
              : (stryCov_9fa48('4987', '4988', '4989'), !data)
      ) {
        if (stryMutAct_9fa48('4990')) {
          {
          }
        } else {
          stryCov_9fa48('4990')
          throw new NotFoundError(
            stryMutAct_9fa48('4991') ? '' : (stryCov_9fa48('4991'), 'Product'),
            id,
            stryMutAct_9fa48('4992')
              ? {}
              : (stryCov_9fa48('4992'),
                {
                  includeDeactivated
                })
          )
        }
      }

      // If no image size requested, return product
      if (
        stryMutAct_9fa48('4995')
          ? false
          : stryMutAct_9fa48('4994')
            ? true
            : stryMutAct_9fa48('4993')
              ? includeImageSize
              : (stryCov_9fa48('4993', '4994', '4995'), !includeImageSize)
      ) {
        if (stryMutAct_9fa48('4996')) {
          {
          }
        } else {
          stryCov_9fa48('4996')
          return data
        }
      }

      // Filter images by size if needed
      if (
        stryMutAct_9fa48('4999')
          ? data.product_images || includeImageSize
          : stryMutAct_9fa48('4998')
            ? false
            : stryMutAct_9fa48('4997')
              ? true
              : (stryCov_9fa48('4997', '4998', '4999'), data.product_images && includeImageSize)
      ) {
        if (stryMutAct_9fa48('5000')) {
          {
          }
        } else {
          stryCov_9fa48('5000')
          data.product_images = stryMutAct_9fa48('5001')
            ? data.product_images
            : (stryCov_9fa48('5001'),
              data.product_images.filter(
                stryMutAct_9fa48('5002')
                  ? () => undefined
                  : (stryCov_9fa48('5002'),
                    img =>
                      stryMutAct_9fa48('5005')
                        ? img.size !== includeImageSize
                        : stryMutAct_9fa48('5004')
                          ? false
                          : stryMutAct_9fa48('5003')
                            ? true
                            : (stryCov_9fa48('5003', '5004', '5005'),
                              img.size === includeImageSize))
              ))
        }
      }

      // Use the specialized service function to get product with specific image size
      const { getProductWithImageSize } = await import(
        stryMutAct_9fa48('5006') ? '' : (stryCov_9fa48('5006'), './productImageService.js')
      )
      return await getProductWithImageSize(id, includeImageSize)
    }
  },
  stryMutAct_9fa48('5007') ? '' : (stryCov_9fa48('5007'), 'SELECT'),
  TABLE
)

/**
 * Get product by SKU (indexed column)
 * @param {string} sku - Product SKU to search for
 * @returns {Object} - Product object
 * @throws {BadRequestError} When SKU is invalid
 * @throws {NotFoundError} When product with SKU is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const product = await getProductBySku('ROS-001')
 */
export async function getProductBySku(sku) {
  if (stryMutAct_9fa48('5008')) {
    {
    }
  } else {
    stryCov_9fa48('5008')
    try {
      if (stryMutAct_9fa48('5009')) {
        {
        }
      } else {
        stryCov_9fa48('5009')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5012')
            ? !sku && typeof sku !== 'string'
            : stryMutAct_9fa48('5011')
              ? false
              : stryMutAct_9fa48('5010')
                ? true
                : (stryCov_9fa48('5010', '5011', '5012'),
                  (stryMutAct_9fa48('5013') ? sku : (stryCov_9fa48('5013'), !sku)) ||
                    (stryMutAct_9fa48('5015')
                      ? typeof sku === 'string'
                      : stryMutAct_9fa48('5014')
                        ? false
                        : (stryCov_9fa48('5014', '5015'),
                          typeof sku !==
                            (stryMutAct_9fa48('5016') ? '' : (stryCov_9fa48('5016'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5017')) {
            {
            }
          } else {
            stryCov_9fa48('5017')
            throw new BadRequestError(
              stryMutAct_9fa48('5018')
                ? ''
                : (stryCov_9fa48('5018'), 'Invalid SKU: must be a string'),
              stryMutAct_9fa48('5019')
                ? {}
                : (stryCov_9fa48('5019'),
                  {
                    sku
                  })
            )
          }
        }

        // Use repository to get product by SKU
        const data = await productRepository.findBySku(sku)
        if (
          stryMutAct_9fa48('5022')
            ? false
            : stryMutAct_9fa48('5021')
              ? true
              : stryMutAct_9fa48('5020')
                ? data
                : (stryCov_9fa48('5020', '5021', '5022'), !data)
        ) {
          if (stryMutAct_9fa48('5023')) {
            {
            }
          } else {
            stryCov_9fa48('5023')
            throw new NotFoundError(
              stryMutAct_9fa48('5024') ? '' : (stryCov_9fa48('5024'), 'Product'),
              sku,
              stryMutAct_9fa48('5025')
                ? {}
                : (stryCov_9fa48('5025'),
                  {
                    sku
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5026')) {
        {
        }
      } else {
        stryCov_9fa48('5026')
        logger.error(
          stryMutAct_9fa48('5027')
            ? ``
            : (stryCov_9fa48('5027'), `getProductBySku(${sku}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get products with occasions (using repository pattern - OPTIMIZED: Single JOIN query)
 * @param {number} [limit=50] - Maximum number of products to return
 * @param {number} [offset=0] - Number of products to skip
 * @returns {Object[]} - Array of products with their associated occasions
 * @throws {DatabaseError} When database query fails
 * @throws {NotFoundError} When no products are found
 * @example
 * const products = await getProductsWithOccasions(20, 0)
 */
export async function getProductsWithOccasions(limit = 50, offset = 0) {
  if (stryMutAct_9fa48('5028')) {
    {
    }
  } else {
    stryCov_9fa48('5028')
    try {
      if (stryMutAct_9fa48('5029')) {
        {
        }
      } else {
        stryCov_9fa48('5029')
        const productRepository = getProductRepository()

        // OPTIMIZED: Use single JOIN query instead of N+1 pattern
        const productsWithOccasions = await productRepository.findAllWithOccasions(
          stryMutAct_9fa48('5030')
            ? {}
            : (stryCov_9fa48('5030'),
              {
                includeDeactivated: stryMutAct_9fa48('5031') ? true : (stryCov_9fa48('5031'), false)
              }),
          stryMutAct_9fa48('5032')
            ? {}
            : (stryCov_9fa48('5032'),
              {
                limit,
                offset,
                ascending: stryMutAct_9fa48('5033') ? true : (stryCov_9fa48('5033'), false)
              })
        )
        if (
          stryMutAct_9fa48('5036')
            ? productsWithOccasions.length !== 0
            : stryMutAct_9fa48('5035')
              ? false
              : stryMutAct_9fa48('5034')
                ? true
                : (stryCov_9fa48('5034', '5035', '5036'), productsWithOccasions.length === 0)
        ) {
          if (stryMutAct_9fa48('5037')) {
            {
            }
          } else {
            stryCov_9fa48('5037')
            throw new NotFoundError(
              stryMutAct_9fa48('5038') ? '' : (stryCov_9fa48('5038'), 'Products')
            )
          }
        }
        return productsWithOccasions
      }
    } catch (error) {
      if (stryMutAct_9fa48('5039')) {
        {
        }
      } else {
        stryCov_9fa48('5039')
        logger.error(
          stryMutAct_9fa48('5040')
            ? ''
            : (stryCov_9fa48('5040'), 'getProductsWithOccasions failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get products by occasion ID (using repository pattern)
 * @param {number} occasionId - Occasion ID to filter products by
 * @param {number} [limit=50] - Maximum number of products to return
 * @returns {Object[]} - Array of products for the specified occasion
 * @throws {BadRequestError} When occasion ID is invalid
 * @throws {DatabaseError} When database query fails
 * @throws {NotFoundError} When no products are found for the occasion
 * @example
 * const products = await getProductsByOccasion(1, 25)
 */
export async function getProductsByOccasion(occasionId, limit = 50) {
  if (stryMutAct_9fa48('5041')) {
    {
    }
  } else {
    stryCov_9fa48('5041')
    try {
      if (stryMutAct_9fa48('5042')) {
        {
        }
      } else {
        stryCov_9fa48('5042')
        if (
          stryMutAct_9fa48('5045')
            ? !occasionId && typeof occasionId !== 'number'
            : stryMutAct_9fa48('5044')
              ? false
              : stryMutAct_9fa48('5043')
                ? true
                : (stryCov_9fa48('5043', '5044', '5045'),
                  (stryMutAct_9fa48('5046') ? occasionId : (stryCov_9fa48('5046'), !occasionId)) ||
                    (stryMutAct_9fa48('5048')
                      ? typeof occasionId === 'number'
                      : stryMutAct_9fa48('5047')
                        ? false
                        : (stryCov_9fa48('5047', '5048'),
                          typeof occasionId !==
                            (stryMutAct_9fa48('5049') ? '' : (stryCov_9fa48('5049'), 'number')))))
        ) {
          if (stryMutAct_9fa48('5050')) {
            {
            }
          } else {
            stryCov_9fa48('5050')
            throw new BadRequestError(
              stryMutAct_9fa48('5051')
                ? ''
                : (stryCov_9fa48('5051'), 'Invalid occasion ID: must be a number'),
              stryMutAct_9fa48('5052')
                ? {}
                : (stryCov_9fa48('5052'),
                  {
                    occasionId
                  })
            )
          }
        }

        // Use repository pattern instead of direct Supabase access
        const repository = getProductRepository()
        const products = await repository.findByOccasion(occasionId, limit)
        return products
      }
    } catch (error) {
      if (stryMutAct_9fa48('5053')) {
        {
        }
      } else {
        stryCov_9fa48('5053')
        logger.error(
          stryMutAct_9fa48('5054')
            ? ``
            : (stryCov_9fa48('5054'), `getProductsByOccasion(${occasionId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get products in carousel (carousel_order IS NOT NULL)
 * Includes primary image in 'small' size (300x300px) for carousel display
 * @returns {Object[]} - Array of carousel products with images
 * @throws {DatabaseError} When database query fails
 * @throws {NotFoundError} When no carousel products are found
 * @example
 * const carouselProducts = await getCarouselProducts()
 */
export async function getCarouselProducts() {
  if (stryMutAct_9fa48('5055')) {
    {
    }
  } else {
    stryCov_9fa48('5055')
    try {
      if (stryMutAct_9fa48('5056')) {
        {
        }
      } else {
        stryCov_9fa48('5056')
        const productRepository = getProductRepository()

        // Get featured products directly from database
        const products = await productRepository.findFeatured(CAROUSEL.MAX_SIZE)
        logger.debug(
          stryMutAct_9fa48('5057')
            ? ''
            : (stryCov_9fa48('5057'),
              '🔍 [DEBUG] getCarouselProducts - Featured products from database:'),
          stryMutAct_9fa48('5058')
            ? {}
            : (stryCov_9fa48('5058'),
              {
                count: stryMutAct_9fa48('5061')
                  ? products?.length && 0
                  : stryMutAct_9fa48('5060')
                    ? false
                    : stryMutAct_9fa48('5059')
                      ? true
                      : (stryCov_9fa48('5059', '5060', '5061'),
                        (stryMutAct_9fa48('5062')
                          ? products.length
                          : (stryCov_9fa48('5062'), products?.length)) || 0),
                products: stryMutAct_9fa48('5065')
                  ? products?.map(p => ({
                      id: p.id,
                      name: p.name,
                      featured: p.featured,
                      carousel_order: p.carousel_order
                    })) && []
                  : stryMutAct_9fa48('5064')
                    ? false
                    : stryMutAct_9fa48('5063')
                      ? true
                      : (stryCov_9fa48('5063', '5064', '5065'),
                        (stryMutAct_9fa48('5066')
                          ? products.map(p => ({
                              id: p.id,
                              name: p.name,
                              featured: p.featured,
                              carousel_order: p.carousel_order
                            }))
                          : (stryCov_9fa48('5066'),
                            products?.map(
                              stryMutAct_9fa48('5067')
                                ? () => undefined
                                : (stryCov_9fa48('5067'),
                                  p =>
                                    stryMutAct_9fa48('5068')
                                      ? {}
                                      : (stryCov_9fa48('5068'),
                                        {
                                          id: p.id,
                                          name: p.name,
                                          featured: p.featured,
                                          carousel_order: p.carousel_order
                                        }))
                            ))) ||
                          (stryMutAct_9fa48('5069')
                            ? ['Stryker was here']
                            : (stryCov_9fa48('5069'), [])))
              })
        )
        if (
          stryMutAct_9fa48('5072')
            ? !products && products.length === 0
            : stryMutAct_9fa48('5071')
              ? false
              : stryMutAct_9fa48('5070')
                ? true
                : (stryCov_9fa48('5070', '5071', '5072'),
                  (stryMutAct_9fa48('5073') ? products : (stryCov_9fa48('5073'), !products)) ||
                    (stryMutAct_9fa48('5075')
                      ? products.length !== 0
                      : stryMutAct_9fa48('5074')
                        ? false
                        : (stryCov_9fa48('5074', '5075'), products.length === 0)))
        ) {
          if (stryMutAct_9fa48('5076')) {
            {
            }
          } else {
            stryCov_9fa48('5076')
            throw new NotFoundError(
              stryMutAct_9fa48('5077') ? '' : (stryCov_9fa48('5077'), 'Carousel products')
            )
          }
        }

        // Extract product IDs for batch processing to avoid N+1 problem
        const productIds = products.map(
          stryMutAct_9fa48('5078') ? () => undefined : (stryCov_9fa48('5078'), p => p.id)
        )

        // Use the specialized service function to get products with small images (300x300px)
        const { getProductsBatchWithImageSize } = await import(
          stryMutAct_9fa48('5079') ? '' : (stryCov_9fa48('5079'), './productImageService.js')
        )
        const productsWithImages = await getProductsBatchWithImageSize(
          productIds,
          stryMutAct_9fa48('5080') ? '' : (stryCov_9fa48('5080'), 'small')
        )
        logger.debug(
          stryMutAct_9fa48('5081')
            ? ''
            : (stryCov_9fa48('5081'), '🔍 [DEBUG] getCarouselProducts - Products with images:'),
          stryMutAct_9fa48('5082')
            ? {}
            : (stryCov_9fa48('5082'),
              {
                count: stryMutAct_9fa48('5085')
                  ? productsWithImages?.length && 0
                  : stryMutAct_9fa48('5084')
                    ? false
                    : stryMutAct_9fa48('5083')
                      ? true
                      : (stryCov_9fa48('5083', '5084', '5085'),
                        (stryMutAct_9fa48('5086')
                          ? productsWithImages.length
                          : (stryCov_9fa48('5086'), productsWithImages?.length)) || 0),
                products: stryMutAct_9fa48('5089')
                  ? productsWithImages?.map(p => ({
                      id: p.id,
                      name: p.name,
                      hasImageUrlSmall: !!p.image_url_small,
                      imageUrlSmall: p.image_url_small
                    })) && []
                  : stryMutAct_9fa48('5088')
                    ? false
                    : stryMutAct_9fa48('5087')
                      ? true
                      : (stryCov_9fa48('5087', '5088', '5089'),
                        (stryMutAct_9fa48('5090')
                          ? productsWithImages.map(p => ({
                              id: p.id,
                              name: p.name,
                              hasImageUrlSmall: !!p.image_url_small,
                              imageUrlSmall: p.image_url_small
                            }))
                          : (stryCov_9fa48('5090'),
                            productsWithImages?.map(
                              stryMutAct_9fa48('5091')
                                ? () => undefined
                                : (stryCov_9fa48('5091'),
                                  p =>
                                    stryMutAct_9fa48('5092')
                                      ? {}
                                      : (stryCov_9fa48('5092'),
                                        {
                                          id: p.id,
                                          name: p.name,
                                          hasImageUrlSmall: stryMutAct_9fa48('5093')
                                            ? !p.image_url_small
                                            : (stryCov_9fa48('5093'),
                                              !(stryMutAct_9fa48('5094')
                                                ? p.image_url_small
                                                : (stryCov_9fa48('5094'), !p.image_url_small))),
                                          imageUrlSmall: p.image_url_small
                                        }))
                            ))) ||
                          (stryMutAct_9fa48('5095')
                            ? ['Stryker was here']
                            : (stryCov_9fa48('5095'), [])))
              })
        )
        return productsWithImages
      }
    } catch (error) {
      if (stryMutAct_9fa48('5096')) {
        {
        }
      } else {
        stryCov_9fa48('5096')
        logger.error(
          stryMutAct_9fa48('5097') ? '' : (stryCov_9fa48('5097'), 'getCarouselProducts failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Create product (simple)
 * @param {Object} productData - Product data to create
 * @param {string} productData.name - Product name (required)
 * @param {number} productData.price_usd - Price in USD (required)
 * @param {string} [productData.summary] - Product summary
 * @param {string} [productData.description] - Product description
 * @param {number} [productData.price_ves] - Price in VES
 * @param {number} [productData.stock] - Available stock
 * @param {string} [productData.sku] - Product SKU
 * @param {boolean} [productData.featured] - Whether product is featured
 * @param {number} [productData.carousel_order] - Order in carousel display
 * @returns {Object} - Created product
 * @throws {ValidationError} When product data is invalid
 * @throws {DatabaseConstraintError} When product violates database constraints (e.g., duplicate SKU)
 * @throws {DatabaseError} When database insert fails
 */
export async function createProduct(productData) {
  if (stryMutAct_9fa48('5098')) {
    {
    }
  } else {
    stryCov_9fa48('5098')
    try {
      if (stryMutAct_9fa48('5099')) {
        {
        }
      } else {
        stryCov_9fa48('5099')
        const productRepository = getProductRepository()
        validateProduct(
          productData,
          stryMutAct_9fa48('5100') ? true : (stryCov_9fa48('5100'), false)
        )

        // Sanitize data before database operations
        const sanitizedData = sanitizeProductData(
          productData,
          stryMutAct_9fa48('5101') ? true : (stryCov_9fa48('5101'), false)
        )

        // Check SKU uniqueness if SKU is provided
        if (
          stryMutAct_9fa48('5103')
            ? false
            : stryMutAct_9fa48('5102')
              ? true
              : (stryCov_9fa48('5102', '5103'), sanitizedData.sku)
        ) {
          if (stryMutAct_9fa48('5104')) {
            {
            }
          } else {
            stryCov_9fa48('5104')
            const existing = await productRepository.findBySku(sanitizedData.sku)
            if (
              stryMutAct_9fa48('5106')
                ? false
                : stryMutAct_9fa48('5105')
                  ? true
                  : (stryCov_9fa48('5105', '5106'), existing)
            ) {
              if (stryMutAct_9fa48('5107')) {
                {
                }
              } else {
                stryCov_9fa48('5107')
                throw new DatabaseConstraintError(
                  stryMutAct_9fa48('5108') ? '' : (stryCov_9fa48('5108'), 'unique_sku'),
                  TABLE,
                  stryMutAct_9fa48('5109')
                    ? {}
                    : (stryCov_9fa48('5109'),
                      {
                        sku: sanitizedData.sku,
                        message: stryMutAct_9fa48('5110')
                          ? ``
                          : (stryCov_9fa48('5110'),
                            `Product with SKU ${sanitizedData.sku} already exists`)
                      })
                )
              }
            }
          }
        }
        const newProduct = stryMutAct_9fa48('5111')
          ? {}
          : (stryCov_9fa48('5111'),
            {
              name: sanitizedData.name,
              summary: (
                stryMutAct_9fa48('5114')
                  ? sanitizedData.summary === undefined
                  : stryMutAct_9fa48('5113')
                    ? false
                    : stryMutAct_9fa48('5112')
                      ? true
                      : (stryCov_9fa48('5112', '5113', '5114'), sanitizedData.summary !== undefined)
              )
                ? sanitizedData.summary
                : null,
              description: (
                stryMutAct_9fa48('5117')
                  ? sanitizedData.description === undefined
                  : stryMutAct_9fa48('5116')
                    ? false
                    : stryMutAct_9fa48('5115')
                      ? true
                      : (stryCov_9fa48('5115', '5116', '5117'),
                        sanitizedData.description !== undefined)
              )
                ? sanitizedData.description
                : null,
              price_usd: sanitizedData.price_usd,
              price_ves: (
                stryMutAct_9fa48('5120')
                  ? sanitizedData.price_ves === undefined
                  : stryMutAct_9fa48('5119')
                    ? false
                    : stryMutAct_9fa48('5118')
                      ? true
                      : (stryCov_9fa48('5118', '5119', '5120'),
                        sanitizedData.price_ves !== undefined)
              )
                ? sanitizedData.price_ves
                : null,
              stock: (
                stryMutAct_9fa48('5123')
                  ? sanitizedData.stock === undefined
                  : stryMutAct_9fa48('5122')
                    ? false
                    : stryMutAct_9fa48('5121')
                      ? true
                      : (stryCov_9fa48('5121', '5122', '5123'), sanitizedData.stock !== undefined)
              )
                ? sanitizedData.stock
                : 0,
              sku: (
                stryMutAct_9fa48('5126')
                  ? sanitizedData.sku === undefined
                  : stryMutAct_9fa48('5125')
                    ? false
                    : stryMutAct_9fa48('5124')
                      ? true
                      : (stryCov_9fa48('5124', '5125', '5126'), sanitizedData.sku !== undefined)
              )
                ? sanitizedData.sku
                : null,
              active: stryMutAct_9fa48('5127') ? false : (stryCov_9fa48('5127'), true),
              featured: (
                stryMutAct_9fa48('5130')
                  ? sanitizedData.featured === undefined
                  : stryMutAct_9fa48('5129')
                    ? false
                    : stryMutAct_9fa48('5128')
                      ? true
                      : (stryCov_9fa48('5128', '5129', '5130'),
                        sanitizedData.featured !== undefined)
              )
                ? sanitizedData.featured
                : stryMutAct_9fa48('5131')
                  ? true
                  : (stryCov_9fa48('5131'), false),
              carousel_order: (
                stryMutAct_9fa48('5134')
                  ? sanitizedData.carousel_order === undefined
                  : stryMutAct_9fa48('5133')
                    ? false
                    : stryMutAct_9fa48('5132')
                      ? true
                      : (stryCov_9fa48('5132', '5133', '5134'),
                        sanitizedData.carousel_order !== undefined)
              )
                ? sanitizedData.carousel_order
                : null
            })

        // Use repository pattern instead of direct Supabase access
        const data = await productRepository.create(newProduct)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5135')) {
        {
        }
      } else {
        stryCov_9fa48('5135')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('5138')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('5137')
              ? false
              : stryMutAct_9fa48('5136')
                ? true
                : (stryCov_9fa48('5136', '5137', '5138'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('5139') ? '' : (stryCov_9fa48('5139'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('5140')) {
            {
            }
          } else {
            stryCov_9fa48('5140')
            throw error
          }
        }
        // Handle database constraint violations
        if (
          stryMutAct_9fa48('5143')
            ? error.code !== '23505'
            : stryMutAct_9fa48('5142')
              ? false
              : stryMutAct_9fa48('5141')
                ? true
                : (stryCov_9fa48('5141', '5142', '5143'),
                  error.code === (stryMutAct_9fa48('5144') ? '' : (stryCov_9fa48('5144'), '23505')))
        ) {
          if (stryMutAct_9fa48('5145')) {
            {
            }
          } else {
            stryCov_9fa48('5145')
            throw new DatabaseConstraintError(
              stryMutAct_9fa48('5146') ? '' : (stryCov_9fa48('5146'), 'unique_constraint'),
              TABLE,
              stryMutAct_9fa48('5147')
                ? {}
                : (stryCov_9fa48('5147'),
                  {
                    productData,
                    originalError: error.message
                  })
            )
          }
        }
        logger.error(
          stryMutAct_9fa48('5148') ? '' : (stryCov_9fa48('5148'), 'createProduct failed:'),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('5149') ? '' : (stryCov_9fa48('5149'), 'INSERT'),
          TABLE,
          error,
          stryMutAct_9fa48('5150')
            ? {}
            : (stryCov_9fa48('5150'),
              {
                productData
              })
        )
      }
    }
  }
}

/**
 * Create product with occasions (manual transaction)
 * @param {Object} productData - Product data to create
 * @param {string} productData.name - Product name (required)
 * @param {number} productData.price_usd - Price in USD (required)
 * @param {string} [productData.summary] - Product summary
 * @param {string} [productData.description] - Product description
 * @param {number} [productData.price_ves] - Price in VES
 * @param {number} [productData.stock] - Available stock
 * @param {string} [productData.sku] - Product SKU
 * @param {boolean} [productData.featured] - Whether product is featured
 * @param {number} [productData.carousel_order] - Order in carousel display
 * @param {number[]} [occasionIds=[]] - Array of occasion IDs to associate with the product
 * @returns {Object} - Created product
 * @throws {ValidationError} When product data is invalid
 * @throws {BadRequestError} When occasionIds is not an array
 * @throws {DatabaseError} When database operations fail
 * @example
 * const product = await createProductWithOccasions({
 *   name: 'Rosas para Aniversario',
 *   price_usd: 45.99,
 *   stock: 5
 * }, [1, 3]) // Associate with occasions 1 and 3
 */
export async function createProductWithOccasions(
  productData,
  occasionIds = stryMutAct_9fa48('5151') ? ['Stryker was here'] : (stryCov_9fa48('5151'), [])
) {
  if (stryMutAct_9fa48('5152')) {
    {
    }
  } else {
    stryCov_9fa48('5152')
    try {
      if (stryMutAct_9fa48('5153')) {
        {
        }
      } else {
        stryCov_9fa48('5153')
        const productRepository = getProductRepository()
        validateProduct(
          productData,
          stryMutAct_9fa48('5154') ? true : (stryCov_9fa48('5154'), false)
        )
        if (
          stryMutAct_9fa48('5157')
            ? false
            : stryMutAct_9fa48('5156')
              ? true
              : stryMutAct_9fa48('5155')
                ? Array.isArray(occasionIds)
                : (stryCov_9fa48('5155', '5156', '5157'), !Array.isArray(occasionIds))
        ) {
          if (stryMutAct_9fa48('5158')) {
            {
            }
          } else {
            stryCov_9fa48('5158')
            throw new BadRequestError(
              stryMutAct_9fa48('5159')
                ? ''
                : (stryCov_9fa48('5159'), 'Invalid occasionIds: must be an array'),
              stryMutAct_9fa48('5160')
                ? {}
                : (stryCov_9fa48('5160'),
                  {
                    occasionIds
                  })
            )
          }
        }

        // Step 1: Create product using repository
        const product = await createProduct(productData)

        // Step 2: Create product_occasions entries if occasionIds provided
        if (
          stryMutAct_9fa48('5164')
            ? occasionIds.length <= 0
            : stryMutAct_9fa48('5163')
              ? occasionIds.length >= 0
              : stryMutAct_9fa48('5162')
                ? false
                : stryMutAct_9fa48('5161')
                  ? true
                  : (stryCov_9fa48('5161', '5162', '5163', '5164'), occasionIds.length > 0)
        ) {
          if (stryMutAct_9fa48('5165')) {
            {
            }
          } else {
            stryCov_9fa48('5165')
            try {
              if (stryMutAct_9fa48('5166')) {
                {
                }
              } else {
                stryCov_9fa48('5166')
                // Use repository to replace occasions (handles transaction)
                await productRepository.replaceOccasions(product.id, occasionIds)
              }
            } catch (occasionError) {
              if (stryMutAct_9fa48('5167')) {
                {
                }
              } else {
                stryCov_9fa48('5167')
                // Rollback: delete product using repository
                await productRepository.delete(product.id)
                throw new DatabaseError(
                  stryMutAct_9fa48('5168') ? '' : (stryCov_9fa48('5168'), 'INSERT'),
                  stryMutAct_9fa48('5169') ? '' : (stryCov_9fa48('5169'), 'product_occasions'),
                  occasionError,
                  stryMutAct_9fa48('5170')
                    ? {}
                    : (stryCov_9fa48('5170'),
                      {
                        productId: product.id,
                        occasionIds
                      })
                )
              }
            }
          }
        }
        return product
      }
    } catch (error) {
      if (stryMutAct_9fa48('5171')) {
        {
        }
      } else {
        stryCov_9fa48('5171')
        logger.error(
          stryMutAct_9fa48('5172')
            ? ''
            : (stryCov_9fa48('5172'), 'createProductWithOccasions failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update product
 * @param {number} id - Product ID
 * @param {Object} updates - Updated product data
 * @param {string} [updates.name] - Product name
 * @param {string} [updates.summary] - Product summary
 * @param {string} [updates.description] - Product description
 * @param {number} [updates.price_usd] - Price in USD
 * @param {number} [updates.price_ves] - Price in VES
 * @param {number} [updates.stock] - Available stock
 * @param {string} [updates.sku] - Product SKU
 * @param {boolean} [updates.featured] - Whether product is featured
 * @param {number} [updates.carousel_order] - Order in carousel display
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When ID is invalid or no updates are provided
 * @throws {ValidationError} When product data is invalid
 * @throws {NotFoundError} When product is not found
 * @throws {DatabaseConstraintError} When product violates database constraints (e.g., duplicate SKU)
 * @throws {DatabaseError} When database update fails
 */
export async function updateProduct(id, updates) {
  if (stryMutAct_9fa48('5173')) {
    {
    }
  } else {
    stryCov_9fa48('5173')
    let sanitizedData = {}
    try {
      if (stryMutAct_9fa48('5174')) {
        {
        }
      } else {
        stryCov_9fa48('5174')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5177')
            ? (!id || typeof id !== 'number') && id <= 0
            : stryMutAct_9fa48('5176')
              ? false
              : stryMutAct_9fa48('5175')
                ? true
                : (stryCov_9fa48('5175', '5176', '5177'),
                  (stryMutAct_9fa48('5179')
                    ? !id && typeof id !== 'number'
                    : stryMutAct_9fa48('5178')
                      ? false
                      : (stryCov_9fa48('5178', '5179'),
                        (stryMutAct_9fa48('5180') ? id : (stryCov_9fa48('5180'), !id)) ||
                          (stryMutAct_9fa48('5182')
                            ? typeof id === 'number'
                            : stryMutAct_9fa48('5181')
                              ? false
                              : (stryCov_9fa48('5181', '5182'),
                                typeof id !==
                                  (stryMutAct_9fa48('5183')
                                    ? ''
                                    : (stryCov_9fa48('5183'), 'number')))))) ||
                    (stryMutAct_9fa48('5186')
                      ? id > 0
                      : stryMutAct_9fa48('5185')
                        ? id < 0
                        : stryMutAct_9fa48('5184')
                          ? false
                          : (stryCov_9fa48('5184', '5185', '5186'), id <= 0)))
        ) {
          if (stryMutAct_9fa48('5187')) {
            {
            }
          } else {
            stryCov_9fa48('5187')
            throw new BadRequestError(
              stryMutAct_9fa48('5188')
                ? ''
                : (stryCov_9fa48('5188'), 'Invalid product ID: must be a positive number'),
              stryMutAct_9fa48('5189')
                ? {}
                : (stryCov_9fa48('5189'),
                  {
                    productId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5192')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('5191')
              ? false
              : stryMutAct_9fa48('5190')
                ? true
                : (stryCov_9fa48('5190', '5191', '5192'),
                  (stryMutAct_9fa48('5193') ? updates : (stryCov_9fa48('5193'), !updates)) ||
                    (stryMutAct_9fa48('5195')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('5194')
                        ? false
                        : (stryCov_9fa48('5194', '5195'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('5196')) {
            {
            }
          } else {
            stryCov_9fa48('5196')
            throw new BadRequestError(
              stryMutAct_9fa48('5197') ? '' : (stryCov_9fa48('5197'), 'No updates provided'),
              stryMutAct_9fa48('5198')
                ? {}
                : (stryCov_9fa48('5198'),
                  {
                    productId: id
                  })
            )
          }
        }
        validateProduct(updates, stryMutAct_9fa48('5199') ? false : (stryCov_9fa48('5199'), true))

        // Sanitize data before database operations
        sanitizedData = sanitizeProductData(
          updates,
          stryMutAct_9fa48('5200') ? false : (stryCov_9fa48('5200'), true)
        )
        const allowedFields = stryMutAct_9fa48('5201')
          ? []
          : (stryCov_9fa48('5201'),
            [
              stryMutAct_9fa48('5202') ? '' : (stryCov_9fa48('5202'), 'name'),
              stryMutAct_9fa48('5203') ? '' : (stryCov_9fa48('5203'), 'summary'),
              stryMutAct_9fa48('5204') ? '' : (stryCov_9fa48('5204'), 'description'),
              stryMutAct_9fa48('5205') ? '' : (stryCov_9fa48('5205'), 'price_usd'),
              stryMutAct_9fa48('5206') ? '' : (stryCov_9fa48('5206'), 'price_ves'),
              stryMutAct_9fa48('5207') ? '' : (stryCov_9fa48('5207'), 'stock'),
              stryMutAct_9fa48('5208') ? '' : (stryCov_9fa48('5208'), 'sku'),
              stryMutAct_9fa48('5209') ? '' : (stryCov_9fa48('5209'), 'featured'),
              stryMutAct_9fa48('5210') ? '' : (stryCov_9fa48('5210'), 'carousel_order')
            ])
        const sanitized = {}
        for (const key of allowedFields) {
          if (stryMutAct_9fa48('5211')) {
            {
            }
          } else {
            stryCov_9fa48('5211')
            if (
              stryMutAct_9fa48('5214')
                ? sanitizedData[key] === undefined
                : stryMutAct_9fa48('5213')
                  ? false
                  : stryMutAct_9fa48('5212')
                    ? true
                    : (stryCov_9fa48('5212', '5213', '5214'), sanitizedData[key] !== undefined)
            ) {
              if (stryMutAct_9fa48('5215')) {
                {
                }
              } else {
                stryCov_9fa48('5215')
                sanitized[key] = sanitizedData[key]
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('5218')
            ? Object.keys(sanitized).length !== 0
            : stryMutAct_9fa48('5217')
              ? false
              : stryMutAct_9fa48('5216')
                ? true
                : (stryCov_9fa48('5216', '5217', '5218'), Object.keys(sanitized).length === 0)
        ) {
          if (stryMutAct_9fa48('5219')) {
            {
            }
          } else {
            stryCov_9fa48('5219')
            throw new BadRequestError(
              stryMutAct_9fa48('5220') ? '' : (stryCov_9fa48('5220'), 'No valid fields to update'),
              stryMutAct_9fa48('5221')
                ? {}
                : (stryCov_9fa48('5221'),
                  {
                    productId: id
                  })
            )
          }
        }

        // Check for SKU uniqueness if SKU is being updated
        if (
          stryMutAct_9fa48('5223')
            ? false
            : stryMutAct_9fa48('5222')
              ? true
              : (stryCov_9fa48('5222', '5223'), sanitized.sku)
        ) {
          if (stryMutAct_9fa48('5224')) {
            {
            }
          } else {
            stryCov_9fa48('5224')
            const existingProduct = await productRepository.findBySku(sanitized.sku)
            if (
              stryMutAct_9fa48('5227')
                ? existingProduct || existingProduct.id !== id
                : stryMutAct_9fa48('5226')
                  ? false
                  : stryMutAct_9fa48('5225')
                    ? true
                    : (stryCov_9fa48('5225', '5226', '5227'),
                      existingProduct &&
                        (stryMutAct_9fa48('5229')
                          ? existingProduct.id === id
                          : stryMutAct_9fa48('5228')
                            ? true
                            : (stryCov_9fa48('5228', '5229'), existingProduct.id !== id)))
            ) {
              if (stryMutAct_9fa48('5230')) {
                {
                }
              } else {
                stryCov_9fa48('5230')
                throw new DatabaseConstraintError(
                  stryMutAct_9fa48('5231') ? '' : (stryCov_9fa48('5231'), 'unique_sku'),
                  TABLE,
                  stryMutAct_9fa48('5232')
                    ? {}
                    : (stryCov_9fa48('5232'),
                      {
                        sku: sanitized.sku,
                        message: stryMutAct_9fa48('5233')
                          ? ``
                          : (stryCov_9fa48('5233'),
                            `Product with SKU ${sanitized.sku} already exists`)
                      })
                )
              }
            }
          }
        }

        // Use repository for update
        const data = await productRepository.update(id, sanitized)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5234')) {
        {
        }
      } else {
        stryCov_9fa48('5234')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('5237')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('5236')
              ? false
              : stryMutAct_9fa48('5235')
                ? true
                : (stryCov_9fa48('5235', '5236', '5237'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('5238') ? '' : (stryCov_9fa48('5238'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('5239')) {
            {
            }
          } else {
            stryCov_9fa48('5239')
            throw error
          }
        }
        // Handle database constraint violations
        if (
          stryMutAct_9fa48('5242')
            ? error.code !== '23505'
            : stryMutAct_9fa48('5241')
              ? false
              : stryMutAct_9fa48('5240')
                ? true
                : (stryCov_9fa48('5240', '5241', '5242'),
                  error.code === (stryMutAct_9fa48('5243') ? '' : (stryCov_9fa48('5243'), '23505')))
        ) {
          if (stryMutAct_9fa48('5244')) {
            {
            }
          } else {
            stryCov_9fa48('5244')
            throw new DatabaseConstraintError(
              stryMutAct_9fa48('5245') ? '' : (stryCov_9fa48('5245'), 'unique_constraint'),
              TABLE,
              stryMutAct_9fa48('5246')
                ? {}
                : (stryCov_9fa48('5246'),
                  {
                    productId: id,
                    updates: sanitizedData,
                    originalError: error.message
                  })
            )
          }
        }
        logger.error(
          stryMutAct_9fa48('5247') ? `` : (stryCov_9fa48('5247'), `updateProduct(${id}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('5248') ? '' : (stryCov_9fa48('5248'), 'UPDATE'),
          TABLE,
          error,
          stryMutAct_9fa48('5249')
            ? {}
            : (stryCov_9fa48('5249'),
              {
                productId: id,
                updates: sanitizedData
              })
        )
      }
    }
  }
}

/**
 * Update carousel order (direct update)
 * @param {number} productId - Product ID to update
 * @param {number|null} newOrder - New carousel order (0-7) or null to remove from carousel
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When productId is invalid or newOrder is out of range
 * @throws {DatabaseError} When database update fails
 * @example
 * // Set product to position 1 in carousel
 * await updateCarouselOrder(123, 1)
 *
 * // Remove product from carousel
 * await updateCarouselOrder(123, null)
 */
export async function updateCarouselOrder(productId, newOrder) {
  if (stryMutAct_9fa48('5250')) {
    {
    }
  } else {
    stryCov_9fa48('5250')
    try {
      if (stryMutAct_9fa48('5251')) {
        {
        }
      } else {
        stryCov_9fa48('5251')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5254')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('5253')
              ? false
              : stryMutAct_9fa48('5252')
                ? true
                : (stryCov_9fa48('5252', '5253', '5254'),
                  (stryMutAct_9fa48('5255') ? productId : (stryCov_9fa48('5255'), !productId)) ||
                    (stryMutAct_9fa48('5257')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('5256')
                        ? false
                        : (stryCov_9fa48('5256', '5257'),
                          typeof productId !==
                            (stryMutAct_9fa48('5258') ? '' : (stryCov_9fa48('5258'), 'number')))))
        ) {
          if (stryMutAct_9fa48('5259')) {
            {
            }
          } else {
            stryCov_9fa48('5259')
            throw new BadRequestError(
              stryMutAct_9fa48('5260')
                ? ''
                : (stryCov_9fa48('5260'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('5261')
                ? {}
                : (stryCov_9fa48('5261'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5264')
            ? newOrder !== null || typeof newOrder !== 'number' || newOrder < 0 || newOrder > 7
            : stryMutAct_9fa48('5263')
              ? false
              : stryMutAct_9fa48('5262')
                ? true
                : (stryCov_9fa48('5262', '5263', '5264'),
                  (stryMutAct_9fa48('5266')
                    ? newOrder === null
                    : stryMutAct_9fa48('5265')
                      ? true
                      : (stryCov_9fa48('5265', '5266'), newOrder !== null)) &&
                    (stryMutAct_9fa48('5268')
                      ? (typeof newOrder !== 'number' || newOrder < 0) && newOrder > 7
                      : stryMutAct_9fa48('5267')
                        ? true
                        : (stryCov_9fa48('5267', '5268'),
                          (stryMutAct_9fa48('5270')
                            ? typeof newOrder !== 'number' && newOrder < 0
                            : stryMutAct_9fa48('5269')
                              ? false
                              : (stryCov_9fa48('5269', '5270'),
                                (stryMutAct_9fa48('5272')
                                  ? typeof newOrder === 'number'
                                  : stryMutAct_9fa48('5271')
                                    ? false
                                    : (stryCov_9fa48('5271', '5272'),
                                      typeof newOrder !==
                                        (stryMutAct_9fa48('5273')
                                          ? ''
                                          : (stryCov_9fa48('5273'), 'number')))) ||
                                  (stryMutAct_9fa48('5276')
                                    ? newOrder >= 0
                                    : stryMutAct_9fa48('5275')
                                      ? newOrder <= 0
                                      : stryMutAct_9fa48('5274')
                                        ? false
                                        : (stryCov_9fa48('5274', '5275', '5276'),
                                          newOrder < 0)))) ||
                            (stryMutAct_9fa48('5279')
                              ? newOrder <= 7
                              : stryMutAct_9fa48('5278')
                                ? newOrder >= 7
                                : stryMutAct_9fa48('5277')
                                  ? false
                                  : (stryCov_9fa48('5277', '5278', '5279'), newOrder > 7)))))
        ) {
          if (stryMutAct_9fa48('5280')) {
            {
            }
          } else {
            stryCov_9fa48('5280')
            throw new BadRequestError(
              stryMutAct_9fa48('5281')
                ? ''
                : (stryCov_9fa48('5281'), 'Invalid carousel_order: must be between 0-7 or null'),
              stryMutAct_9fa48('5282')
                ? {}
                : (stryCov_9fa48('5282'),
                  {
                    newOrder
                  })
            )
          }
        }

        // Use repository to update carousel order
        const data = await productRepository.updateCarouselOrder(productId, newOrder)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5283')) {
        {
        }
      } else {
        stryCov_9fa48('5283')
        logger.error(
          stryMutAct_9fa48('5284')
            ? ``
            : (stryCov_9fa48('5284'), `updateCarouselOrder(${productId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Soft-delete product
 * @param {number} id - Product ID to delete
 * @returns {Object} - Deactivated product
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When product is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteProduct(id) {
  if (stryMutAct_9fa48('5285')) {
    {
    }
  } else {
    stryCov_9fa48('5285')
    try {
      if (stryMutAct_9fa48('5286')) {
        {
        }
      } else {
        stryCov_9fa48('5286')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5289')
            ? (!id || typeof id !== 'number') && id <= 0
            : stryMutAct_9fa48('5288')
              ? false
              : stryMutAct_9fa48('5287')
                ? true
                : (stryCov_9fa48('5287', '5288', '5289'),
                  (stryMutAct_9fa48('5291')
                    ? !id && typeof id !== 'number'
                    : stryMutAct_9fa48('5290')
                      ? false
                      : (stryCov_9fa48('5290', '5291'),
                        (stryMutAct_9fa48('5292') ? id : (stryCov_9fa48('5292'), !id)) ||
                          (stryMutAct_9fa48('5294')
                            ? typeof id === 'number'
                            : stryMutAct_9fa48('5293')
                              ? false
                              : (stryCov_9fa48('5293', '5294'),
                                typeof id !==
                                  (stryMutAct_9fa48('5295')
                                    ? ''
                                    : (stryCov_9fa48('5295'), 'number')))))) ||
                    (stryMutAct_9fa48('5298')
                      ? id > 0
                      : stryMutAct_9fa48('5297')
                        ? id < 0
                        : stryMutAct_9fa48('5296')
                          ? false
                          : (stryCov_9fa48('5296', '5297', '5298'), id <= 0)))
        ) {
          if (stryMutAct_9fa48('5299')) {
            {
            }
          } else {
            stryCov_9fa48('5299')
            throw new BadRequestError(
              stryMutAct_9fa48('5300')
                ? ''
                : (stryCov_9fa48('5300'), 'Invalid product ID: must be a positive number'),
              stryMutAct_9fa48('5301')
                ? {}
                : (stryCov_9fa48('5301'),
                  {
                    productId: id
                  })
            )
          }
        }

        // Use repository's delete method (soft-delete)
        const data = await productRepository.delete(id)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5302')) {
        {
        }
      } else {
        stryCov_9fa48('5302')
        logger.error(
          stryMutAct_9fa48('5303') ? `` : (stryCov_9fa48('5303'), `deleteProduct(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reactivate product (reverse soft-delete)
 * @param {number} id - Product ID to reactivate
 * @returns {Object} - Reactivated product
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When product is not found or already active
 * @throws {DatabaseError} When database update fails
 * @example
 * const product = await reactivateProduct(123)
 */
export async function reactivateProduct(id) {
  if (stryMutAct_9fa48('5304')) {
    {
    }
  } else {
    stryCov_9fa48('5304')
    try {
      if (stryMutAct_9fa48('5305')) {
        {
        }
      } else {
        stryCov_9fa48('5305')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5308')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('5307')
              ? false
              : stryMutAct_9fa48('5306')
                ? true
                : (stryCov_9fa48('5306', '5307', '5308'),
                  (stryMutAct_9fa48('5309') ? id : (stryCov_9fa48('5309'), !id)) ||
                    (stryMutAct_9fa48('5311')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('5310')
                        ? false
                        : (stryCov_9fa48('5310', '5311'),
                          typeof id !==
                            (stryMutAct_9fa48('5312') ? '' : (stryCov_9fa48('5312'), 'number')))))
        ) {
          if (stryMutAct_9fa48('5313')) {
            {
            }
          } else {
            stryCov_9fa48('5313')
            throw new BadRequestError(
              stryMutAct_9fa48('5314')
                ? ''
                : (stryCov_9fa48('5314'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('5315')
                ? {}
                : (stryCov_9fa48('5315'),
                  {
                    productId: id
                  })
            )
          }
        }

        // Use repository's reactivate method
        const data = await productRepository.reactivate(id)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5316')) {
        {
        }
      } else {
        stryCov_9fa48('5316')
        logger.error(
          stryMutAct_9fa48('5317')
            ? ``
            : (stryCov_9fa48('5317'), `reactivateProduct(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update stock (direct update)
 * @param {number} id - Product ID to update
 * @param {number} quantity - New stock quantity (must be non-negative)
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When ID is invalid or quantity is negative
 * @throws {NotFoundError} When product is not found or inactive
 * @throws {DatabaseError} When database update fails
 * @example
 * const product = await updateStock(123, 50)
 */
export async function updateStock(id, quantity) {
  if (stryMutAct_9fa48('5318')) {
    {
    }
  } else {
    stryCov_9fa48('5318')
    try {
      if (stryMutAct_9fa48('5319')) {
        {
        }
      } else {
        stryCov_9fa48('5319')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5322')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('5321')
              ? false
              : stryMutAct_9fa48('5320')
                ? true
                : (stryCov_9fa48('5320', '5321', '5322'),
                  (stryMutAct_9fa48('5323') ? id : (stryCov_9fa48('5323'), !id)) ||
                    (stryMutAct_9fa48('5325')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('5324')
                        ? false
                        : (stryCov_9fa48('5324', '5325'),
                          typeof id !==
                            (stryMutAct_9fa48('5326') ? '' : (stryCov_9fa48('5326'), 'number')))))
        ) {
          if (stryMutAct_9fa48('5327')) {
            {
            }
          } else {
            stryCov_9fa48('5327')
            throw new BadRequestError(
              stryMutAct_9fa48('5328')
                ? ''
                : (stryCov_9fa48('5328'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('5329')
                ? {}
                : (stryCov_9fa48('5329'),
                  {
                    productId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5332')
            ? typeof quantity !== 'number' && quantity < 0
            : stryMutAct_9fa48('5331')
              ? false
              : stryMutAct_9fa48('5330')
                ? true
                : (stryCov_9fa48('5330', '5331', '5332'),
                  (stryMutAct_9fa48('5334')
                    ? typeof quantity === 'number'
                    : stryMutAct_9fa48('5333')
                      ? false
                      : (stryCov_9fa48('5333', '5334'),
                        typeof quantity !==
                          (stryMutAct_9fa48('5335') ? '' : (stryCov_9fa48('5335'), 'number')))) ||
                    (stryMutAct_9fa48('5338')
                      ? quantity >= 0
                      : stryMutAct_9fa48('5337')
                        ? quantity <= 0
                        : stryMutAct_9fa48('5336')
                          ? false
                          : (stryCov_9fa48('5336', '5337', '5338'), quantity < 0)))
        ) {
          if (stryMutAct_9fa48('5339')) {
            {
            }
          } else {
            stryCov_9fa48('5339')
            throw new BadRequestError(
              stryMutAct_9fa48('5340')
                ? ''
                : (stryCov_9fa48('5340'), 'Invalid quantity: must be a non-negative number'),
              stryMutAct_9fa48('5341')
                ? {}
                : (stryCov_9fa48('5341'),
                  {
                    quantity
                  })
            )
          }
        }

        // Use repository to update stock
        const data = await productRepository.updateStock(id, quantity)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5342')) {
        {
        }
      } else {
        stryCov_9fa48('5342')
        logger.error(
          stryMutAct_9fa48('5343') ? `` : (stryCov_9fa48('5343'), `updateStock(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Decrement stock (for orders) - ENTERPRISE FAIL-FAST with insufficient stock check
 * @param {number} id - Product ID to decrement stock for
 * @param {number} quantity - Quantity to decrement (must be positive)
 * @returns {Object} - Updated product
 * @throws {BadRequestError} When ID is invalid or quantity is not positive
 * @throws {NotFoundError} When product is not found or inactive
 * @throws {InsufficientStockError} When current stock is less than requested decrement
 * @throws {DatabaseError} When database operations fail
 * @example
 * // Decrement stock by 2 for order processing
 * const product = await decrementStock(123, 2)
 */
export async function decrementStock(id, quantity) {
  if (stryMutAct_9fa48('5344')) {
    {
    }
  } else {
    stryCov_9fa48('5344')
    try {
      if (stryMutAct_9fa48('5345')) {
        {
        }
      } else {
        stryCov_9fa48('5345')
        const productRepository = getProductRepository()
        if (
          stryMutAct_9fa48('5348')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('5347')
              ? false
              : stryMutAct_9fa48('5346')
                ? true
                : (stryCov_9fa48('5346', '5347', '5348'),
                  (stryMutAct_9fa48('5349') ? id : (stryCov_9fa48('5349'), !id)) ||
                    (stryMutAct_9fa48('5351')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('5350')
                        ? false
                        : (stryCov_9fa48('5350', '5351'),
                          typeof id !==
                            (stryMutAct_9fa48('5352') ? '' : (stryCov_9fa48('5352'), 'number')))))
        ) {
          if (stryMutAct_9fa48('5353')) {
            {
            }
          } else {
            stryCov_9fa48('5353')
            throw new BadRequestError(
              stryMutAct_9fa48('5354')
                ? ''
                : (stryCov_9fa48('5354'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('5355')
                ? {}
                : (stryCov_9fa48('5355'),
                  {
                    productId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5358')
            ? typeof quantity !== 'number' && quantity <= 0
            : stryMutAct_9fa48('5357')
              ? false
              : stryMutAct_9fa48('5356')
                ? true
                : (stryCov_9fa48('5356', '5357', '5358'),
                  (stryMutAct_9fa48('5360')
                    ? typeof quantity === 'number'
                    : stryMutAct_9fa48('5359')
                      ? false
                      : (stryCov_9fa48('5359', '5360'),
                        typeof quantity !==
                          (stryMutAct_9fa48('5361') ? '' : (stryCov_9fa48('5361'), 'number')))) ||
                    (stryMutAct_9fa48('5364')
                      ? quantity > 0
                      : stryMutAct_9fa48('5363')
                        ? quantity < 0
                        : stryMutAct_9fa48('5362')
                          ? false
                          : (stryCov_9fa48('5362', '5363', '5364'), quantity <= 0)))
        ) {
          if (stryMutAct_9fa48('5365')) {
            {
            }
          } else {
            stryCov_9fa48('5365')
            throw new BadRequestError(
              stryMutAct_9fa48('5366')
                ? ''
                : (stryCov_9fa48('5366'), 'Invalid quantity: must be a positive number'),
              stryMutAct_9fa48('5367')
                ? {}
                : (stryCov_9fa48('5367'),
                  {
                    quantity
                  })
            )
          }
        }

        // Use repository to decrement stock (handles validation internally)
        return await productRepository.decrementStock(id, quantity)
      }
    } catch (error) {
      if (stryMutAct_9fa48('5368')) {
        {
        }
      } else {
        stryCov_9fa48('5368')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('5371')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('5370')
              ? false
              : stryMutAct_9fa48('5369')
                ? true
                : (stryCov_9fa48('5369', '5370', '5371'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('5372') ? '' : (stryCov_9fa48('5372'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('5373')) {
            {
            }
          } else {
            stryCov_9fa48('5373')
            throw error
          }
        }
        // Wrap unexpected errors
        logger.error(
          stryMutAct_9fa48('5374') ? `` : (stryCov_9fa48('5374'), `decrementStock(${id}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('5375') ? '' : (stryCov_9fa48('5375'), 'UPDATE'),
          TABLE,
          error,
          stryMutAct_9fa48('5376')
            ? {}
            : (stryCov_9fa48('5376'),
              {
                productId: id,
                quantity
              })
        )
      }
    }
  }
}

/**
 * Replace all occasions for a product (TRANSACTIONAL)
 * Uses PostgreSQL stored function for atomic DELETE + INSERT
 * @param {number} productId - Product ID
 * @param {number[]} occasionIds - Array of occasion IDs to link
 * @returns {Promise<Object>} Operation result with counts
 * @throws {ValidationError} Invalid parameters
 * @throws {NotFoundError} Product not found
 * @throws {DatabaseError} Database error
 */
export async function replaceProductOccasions(
  productId,
  occasionIds = stryMutAct_9fa48('5377') ? ['Stryker was here'] : (stryCov_9fa48('5377'), [])
) {
  if (stryMutAct_9fa48('5378')) {
    {
    }
  } else {
    stryCov_9fa48('5378')
    try {
      if (stryMutAct_9fa48('5379')) {
        {
        }
      } else {
        stryCov_9fa48('5379')
        // Validate parameters
        if (
          stryMutAct_9fa48('5382')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('5381')
              ? false
              : stryMutAct_9fa48('5380')
                ? true
                : (stryCov_9fa48('5380', '5381', '5382'),
                  (stryMutAct_9fa48('5383') ? productId : (stryCov_9fa48('5383'), !productId)) ||
                    (stryMutAct_9fa48('5385')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('5384')
                        ? false
                        : (stryCov_9fa48('5384', '5385'),
                          typeof productId !==
                            (stryMutAct_9fa48('5386') ? '' : (stryCov_9fa48('5386'), 'number')))))
        ) {
          if (stryMutAct_9fa48('5387')) {
            {
            }
          } else {
            stryCov_9fa48('5387')
            throw new ValidationError(
              stryMutAct_9fa48('5388') ? '' : (stryCov_9fa48('5388'), 'Invalid product ID'),
              stryMutAct_9fa48('5389')
                ? {}
                : (stryCov_9fa48('5389'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5392')
            ? false
            : stryMutAct_9fa48('5391')
              ? true
              : stryMutAct_9fa48('5390')
                ? Array.isArray(occasionIds)
                : (stryCov_9fa48('5390', '5391', '5392'), !Array.isArray(occasionIds))
        ) {
          if (stryMutAct_9fa48('5393')) {
            {
            }
          } else {
            stryCov_9fa48('5393')
            throw new ValidationError(
              stryMutAct_9fa48('5394')
                ? ''
                : (stryCov_9fa48('5394'), 'occasion_ids must be an array'),
              stryMutAct_9fa48('5395')
                ? {}
                : (stryCov_9fa48('5395'),
                  {
                    occasionIds
                  })
            )
          }
        }

        // Validate all occasion IDs are numbers
        const invalidIds = stryMutAct_9fa48('5396')
          ? occasionIds
          : (stryCov_9fa48('5396'),
            occasionIds.filter(
              stryMutAct_9fa48('5397')
                ? () => undefined
                : (stryCov_9fa48('5397'),
                  id =>
                    stryMutAct_9fa48('5400')
                      ? typeof id !== 'number' && id <= 0
                      : stryMutAct_9fa48('5399')
                        ? false
                        : stryMutAct_9fa48('5398')
                          ? true
                          : (stryCov_9fa48('5398', '5399', '5400'),
                            (stryMutAct_9fa48('5402')
                              ? typeof id === 'number'
                              : stryMutAct_9fa48('5401')
                                ? false
                                : (stryCov_9fa48('5401', '5402'),
                                  typeof id !==
                                    (stryMutAct_9fa48('5403')
                                      ? ''
                                      : (stryCov_9fa48('5403'), 'number')))) ||
                              (stryMutAct_9fa48('5406')
                                ? id > 0
                                : stryMutAct_9fa48('5405')
                                  ? id < 0
                                  : stryMutAct_9fa48('5404')
                                    ? false
                                    : (stryCov_9fa48('5404', '5405', '5406'), id <= 0))))
            ))
        if (
          stryMutAct_9fa48('5410')
            ? invalidIds.length <= 0
            : stryMutAct_9fa48('5409')
              ? invalidIds.length >= 0
              : stryMutAct_9fa48('5408')
                ? false
                : stryMutAct_9fa48('5407')
                  ? true
                  : (stryCov_9fa48('5407', '5408', '5409', '5410'), invalidIds.length > 0)
        ) {
          if (stryMutAct_9fa48('5411')) {
            {
            }
          } else {
            stryCov_9fa48('5411')
            throw new ValidationError(
              stryMutAct_9fa48('5412') ? '' : (stryCov_9fa48('5412'), 'Invalid occasion IDs'),
              stryMutAct_9fa48('5413')
                ? {}
                : (stryCov_9fa48('5413'),
                  {
                    invalidIds
                  })
            )
          }
        }
        logger.debug(
          stryMutAct_9fa48('5414')
            ? ``
            : (stryCov_9fa48('5414'), `Replacing occasions for product ${productId}:`),
          occasionIds
        )

        // Use repository pattern instead of direct supabase access
        const productRepository = getProductRepository()
        const data = await productRepository.replaceProductOccasions(productId, occasionIds)
        logger.debug(
          stryMutAct_9fa48('5415')
            ? ``
            : (stryCov_9fa48('5415'), `✓ Occasions replaced for product ${productId}:`),
          data
        )
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5416')) {
        {
        }
      } else {
        stryCov_9fa48('5416')
        logger.error(
          stryMutAct_9fa48('5417')
            ? ``
            : (stryCov_9fa48('5417'), `replaceProductOccasions(${productId}) failed:`),
          error
        )
        if (
          stryMutAct_9fa48('5419')
            ? false
            : stryMutAct_9fa48('5418')
              ? true
              : (stryCov_9fa48('5418', '5419'), error.isOperational)
        ) {
          if (stryMutAct_9fa48('5420')) {
            {
            }
          } else {
            stryCov_9fa48('5420')
            throw error
          }
        }
        throw new InternalServerError(
          stryMutAct_9fa48('5421')
            ? ''
            : (stryCov_9fa48('5421'), 'Failed to replace product occasions'),
          stryMutAct_9fa48('5422')
            ? {}
            : (stryCov_9fa48('5422'),
              {
                productId,
                occasionIds,
                error
              })
        )
      }
    }
  }
}

// Alias for tests compatibility
export const decrementProductStock = decrementStock
