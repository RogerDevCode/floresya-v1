/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Order Service
 * CRUD operations with atomic order creation (stored function)
 * Uses indexed columns (user_id, status, created_at)
 * Soft-delete implementation using status field (cancelled orders excluded by default)
 *
 * REPOSITORY PATTERN: Uses OrderRepository for data access
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
import { DB_SCHEMA, supabase } from './supabaseClient.js'
import DIContainer from '../architecture/di-container.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { sanitizeOrderData, sanitizeOrderItemData } from '../utils/sanitize.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { validateOrder } from '../utils/validation.js'
const TABLE = DB_SCHEMA.orders.table
const VALID_STATUSES = DB_SCHEMA.orders.enums.status

/**
 * Get OrderRepository instance from DI Container
 * @returns {OrderRepository} Repository instance
 */
function getOrderRepository() {
  if (stryMutAct_9fa48('2746')) {
    {
    }
  } else {
    stryCov_9fa48('2746')
    return DIContainer.resolve(
      stryMutAct_9fa48('2747') ? '' : (stryCov_9fa48('2747'), 'OrderRepository')
    )
  }
}

/**
 * Get ProductRepository instance from DI Container
 * @returns {ProductRepository} Repository instance
 */
function getProductRepository() {
  if (stryMutAct_9fa48('2748')) {
    {
    }
  } else {
    stryCov_9fa48('2748')
    return DIContainer.resolve(
      stryMutAct_9fa48('2749') ? '' : (stryCov_9fa48('2749'), 'ProductRepository')
    )
  }
}

/**
 * Get all orders with filters
 * Supports accent-insensitive search via normalized columns
 * Includes order_items with product details
 * @param {Object} filters - Filter options
 * @param {number} [filters.user_id] - Filter by user ID
 * @param {string} [filters.status] - Filter by order status (pending, verified, preparing, shipped, delivered, cancelled)
 * @param {string} [filters.date_from] - Filter orders from date
 * @param {string} [filters.date_to] - Filter orders to date
 * @param {string} [filters.search] - Search in customer_name and customer_email (accent-insensitive)
 * @param {number} [filters.limit] - Number of items to return
 * @param {number} [filters.offset] - Number of items to skip
 * @param {boolean} includeDeactivated - Include cancelled orders (default: false, admin only)
 * @returns {Object[]} - Array of orders with items
 * @throws {NotFoundError} When no orders are found
 * @throws {DatabaseError} When database query fails
 */
export const getAllOrders = withErrorMapping(
  async (
    filters = {},
    includeDeactivated = stryMutAct_9fa48('2750') ? true : (stryCov_9fa48('2750'), false)
  ) => {
    if (stryMutAct_9fa48('2751')) {
      {
      }
    } else {
      stryCov_9fa48('2751')
      const orderRepository = getOrderRepository()

      // Use repository to get orders with filters
      const data = await orderRepository.findAllWithFilters(
        filters,
        stryMutAct_9fa48('2752')
          ? {}
          : (stryCov_9fa48('2752'),
            {
              includeDeactivated
            })
      )
      if (
        stryMutAct_9fa48('2755')
          ? false
          : stryMutAct_9fa48('2754')
            ? true
            : stryMutAct_9fa48('2753')
              ? data
              : (stryCov_9fa48('2753', '2754', '2755'), !data)
      ) {
        if (stryMutAct_9fa48('2756')) {
          {
          }
        } else {
          stryCov_9fa48('2756')
          throw new NotFoundError(stryMutAct_9fa48('2757') ? '' : (stryCov_9fa48('2757'), 'Orders'))
        }
      }
      return data
    }
  },
  stryMutAct_9fa48('2758') ? '' : (stryCov_9fa48('2758'), 'SELECT'),
  TABLE
)

/**
 * Get order by ID with items and product details
 * @param {number} id - Order ID to retrieve
 * @param {boolean} includeDeactivated - Include cancelled orders (default: false, admin only)
 * @returns {Object} - Order object with order_items array
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const order = await getOrderById(123)
 */
export async function getOrderById(
  id,
  includeDeactivated = stryMutAct_9fa48('2759') ? true : (stryCov_9fa48('2759'), false)
) {
  if (stryMutAct_9fa48('2760')) {
    {
    }
  } else {
    stryCov_9fa48('2760')
    try {
      if (stryMutAct_9fa48('2761')) {
        {
        }
      } else {
        stryCov_9fa48('2761')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('2764')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('2763')
              ? false
              : stryMutAct_9fa48('2762')
                ? true
                : (stryCov_9fa48('2762', '2763', '2764'),
                  (stryMutAct_9fa48('2765') ? id : (stryCov_9fa48('2765'), !id)) ||
                    (stryMutAct_9fa48('2767')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('2766')
                        ? false
                        : (stryCov_9fa48('2766', '2767'),
                          typeof id !==
                            (stryMutAct_9fa48('2768') ? '' : (stryCov_9fa48('2768'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2769')) {
            {
            }
          } else {
            stryCov_9fa48('2769')
            throw new BadRequestError(
              stryMutAct_9fa48('2770')
                ? ''
                : (stryCov_9fa48('2770'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('2771')
                ? {}
                : (stryCov_9fa48('2771'),
                  {
                    orderId: id
                  })
            )
          }
        }

        // Use repository to get order
        const data = await orderRepository.findByIdWithItems(id, includeDeactivated)
        if (
          stryMutAct_9fa48('2774')
            ? false
            : stryMutAct_9fa48('2773')
              ? true
              : stryMutAct_9fa48('2772')
                ? data
                : (stryCov_9fa48('2772', '2773', '2774'), !data)
        ) {
          if (stryMutAct_9fa48('2775')) {
            {
            }
          } else {
            stryCov_9fa48('2775')
            throw new NotFoundError(
              stryMutAct_9fa48('2776') ? '' : (stryCov_9fa48('2776'), 'Order'),
              id
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2777')) {
        {
        }
      } else {
        stryCov_9fa48('2777')
        console.error(
          stryMutAct_9fa48('2778') ? `` : (stryCov_9fa48('2778'), `getOrderById(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get orders by user (indexed query) with optional status filtering
 * @param {number} userId - User ID to filter orders by
 * @param {Object} [filters={}] - Filter options
 * @param {string} [filters.status] - Filter by order status
 * @param {number} [filters.limit] - Maximum number of orders to return
 * @returns {Object[]} - Array of orders for the user
 * @throws {BadRequestError} When userId is invalid
 * @throws {NotFoundError} When no orders are found for the user
 * @throws {DatabaseError} When database query fails
 * @example
 * const orders = await getOrdersByUser(123, { status: 'delivered', limit: 10 })
 */
export async function getOrdersByUser(userId, filters = {}) {
  if (stryMutAct_9fa48('2779')) {
    {
    }
  } else {
    stryCov_9fa48('2779')
    try {
      if (stryMutAct_9fa48('2780')) {
        {
        }
      } else {
        stryCov_9fa48('2780')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('2783')
            ? !userId && typeof userId !== 'number'
            : stryMutAct_9fa48('2782')
              ? false
              : stryMutAct_9fa48('2781')
                ? true
                : (stryCov_9fa48('2781', '2782', '2783'),
                  (stryMutAct_9fa48('2784') ? userId : (stryCov_9fa48('2784'), !userId)) ||
                    (stryMutAct_9fa48('2786')
                      ? typeof userId === 'number'
                      : stryMutAct_9fa48('2785')
                        ? false
                        : (stryCov_9fa48('2785', '2786'),
                          typeof userId !==
                            (stryMutAct_9fa48('2787') ? '' : (stryCov_9fa48('2787'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2788')) {
            {
            }
          } else {
            stryCov_9fa48('2788')
            throw new BadRequestError(
              stryMutAct_9fa48('2789')
                ? ''
                : (stryCov_9fa48('2789'), 'Invalid user ID: must be a number'),
              stryMutAct_9fa48('2790')
                ? {}
                : (stryCov_9fa48('2790'),
                  {
                    userId
                  })
            )
          }
        }

        // Use repository to get orders by user
        const data = await orderRepository.findByUserId(userId, filters)
        if (
          stryMutAct_9fa48('2793')
            ? false
            : stryMutAct_9fa48('2792')
              ? true
              : stryMutAct_9fa48('2791')
                ? data
                : (stryCov_9fa48('2791', '2792', '2793'), !data)
        ) {
          if (stryMutAct_9fa48('2794')) {
            {
            }
          } else {
            stryCov_9fa48('2794')
            throw new NotFoundError(
              stryMutAct_9fa48('2795') ? '' : (stryCov_9fa48('2795'), 'Orders for user'),
              userId,
              stryMutAct_9fa48('2796')
                ? {}
                : (stryCov_9fa48('2796'),
                  {
                    userId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('2797')) {
        {
        }
      } else {
        stryCov_9fa48('2797')
        console.error(
          stryMutAct_9fa48('2798')
            ? ``
            : (stryCov_9fa48('2798'), `getOrdersByUser(${userId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Create order with items (uses atomic stored function)
 */
export async function createOrderWithItems(orderData, orderItems) {
  if (stryMutAct_9fa48('2799')) {
    {
    }
  } else {
    stryCov_9fa48('2799')
    try {
      if (stryMutAct_9fa48('2800')) {
        {
        }
      } else {
        stryCov_9fa48('2800')
        validateOrder(
          orderData,
          VALID_STATUSES,
          stryMutAct_9fa48('2801') ? true : (stryCov_9fa48('2801'), false)
        )
        if (
          stryMutAct_9fa48('2804')
            ? !Array.isArray(orderItems) && orderItems.length === 0
            : stryMutAct_9fa48('2803')
              ? false
              : stryMutAct_9fa48('2802')
                ? true
                : (stryCov_9fa48('2802', '2803', '2804'),
                  (stryMutAct_9fa48('2805')
                    ? Array.isArray(orderItems)
                    : (stryCov_9fa48('2805'), !Array.isArray(orderItems))) ||
                    (stryMutAct_9fa48('2807')
                      ? orderItems.length !== 0
                      : stryMutAct_9fa48('2806')
                        ? false
                        : (stryCov_9fa48('2806', '2807'), orderItems.length === 0)))
        ) {
          if (stryMutAct_9fa48('2808')) {
            {
            }
          } else {
            stryCov_9fa48('2808')
            throw new ValidationError(
              stryMutAct_9fa48('2809') ? '' : (stryCov_9fa48('2809'), 'Order validation failed'),
              stryMutAct_9fa48('2810')
                ? {}
                : (stryCov_9fa48('2810'),
                  {
                    orderItems: stryMutAct_9fa48('2811')
                      ? ''
                      : (stryCov_9fa48('2811'), 'must be a non-empty array')
                  })
            )
          }
        }

        // Validate each item and check stock
        for (const item of orderItems) {
          if (stryMutAct_9fa48('2812')) {
            {
            }
          } else {
            stryCov_9fa48('2812')
            // Convert string IDs to numbers if needed
            let productId = item.product_id
            if (
              stryMutAct_9fa48('2815')
                ? typeof productId !== 'string'
                : stryMutAct_9fa48('2814')
                  ? false
                  : stryMutAct_9fa48('2813')
                    ? true
                    : (stryCov_9fa48('2813', '2814', '2815'),
                      typeof productId ===
                        (stryMutAct_9fa48('2816') ? '' : (stryCov_9fa48('2816'), 'string')))
            ) {
              if (stryMutAct_9fa48('2817')) {
                {
                }
              } else {
                stryCov_9fa48('2817')
                productId = parseInt(productId, 10)
              }
            }
            if (
              stryMutAct_9fa48('2820')
                ? (!productId || typeof productId !== 'number') && isNaN(productId)
                : stryMutAct_9fa48('2819')
                  ? false
                  : stryMutAct_9fa48('2818')
                    ? true
                    : (stryCov_9fa48('2818', '2819', '2820'),
                      (stryMutAct_9fa48('2822')
                        ? !productId && typeof productId !== 'number'
                        : stryMutAct_9fa48('2821')
                          ? false
                          : (stryCov_9fa48('2821', '2822'),
                            (stryMutAct_9fa48('2823')
                              ? productId
                              : (stryCov_9fa48('2823'), !productId)) ||
                              (stryMutAct_9fa48('2825')
                                ? typeof productId === 'number'
                                : stryMutAct_9fa48('2824')
                                  ? false
                                  : (stryCov_9fa48('2824', '2825'),
                                    typeof productId !==
                                      (stryMutAct_9fa48('2826')
                                        ? ''
                                        : (stryCov_9fa48('2826'), 'number')))))) ||
                        isNaN(productId))
            ) {
              if (stryMutAct_9fa48('2827')) {
                {
                }
              } else {
                stryCov_9fa48('2827')
                throw new ValidationError(
                  stryMutAct_9fa48('2828')
                    ? ''
                    : (stryCov_9fa48('2828'), 'Order validation failed'),
                  stryMutAct_9fa48('2829')
                    ? {}
                    : (stryCov_9fa48('2829'),
                      {
                        'orderItems.product_id': stryMutAct_9fa48('2830')
                          ? ''
                          : (stryCov_9fa48('2830'), 'must be a number')
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('2833')
                ? !item.product_name && typeof item.product_name !== 'string'
                : stryMutAct_9fa48('2832')
                  ? false
                  : stryMutAct_9fa48('2831')
                    ? true
                    : (stryCov_9fa48('2831', '2832', '2833'),
                      (stryMutAct_9fa48('2834')
                        ? item.product_name
                        : (stryCov_9fa48('2834'), !item.product_name)) ||
                        (stryMutAct_9fa48('2836')
                          ? typeof item.product_name === 'string'
                          : stryMutAct_9fa48('2835')
                            ? false
                            : (stryCov_9fa48('2835', '2836'),
                              typeof item.product_name !==
                                (stryMutAct_9fa48('2837')
                                  ? ''
                                  : (stryCov_9fa48('2837'), 'string')))))
            ) {
              if (stryMutAct_9fa48('2838')) {
                {
                }
              } else {
                stryCov_9fa48('2838')
                throw new ValidationError(
                  stryMutAct_9fa48('2839')
                    ? ''
                    : (stryCov_9fa48('2839'), 'Order validation failed'),
                  stryMutAct_9fa48('2840')
                    ? {}
                    : (stryCov_9fa48('2840'),
                      {
                        'orderItems.product_name': stryMutAct_9fa48('2841')
                          ? ''
                          : (stryCov_9fa48('2841'), 'must be a string')
                      })
                )
              }
            }

            // Convert string quantities to numbers if needed
            let quantity = item.quantity
            if (
              stryMutAct_9fa48('2844')
                ? typeof quantity !== 'string'
                : stryMutAct_9fa48('2843')
                  ? false
                  : stryMutAct_9fa48('2842')
                    ? true
                    : (stryCov_9fa48('2842', '2843', '2844'),
                      typeof quantity ===
                        (stryMutAct_9fa48('2845') ? '' : (stryCov_9fa48('2845'), 'string')))
            ) {
              if (stryMutAct_9fa48('2846')) {
                {
                }
              } else {
                stryCov_9fa48('2846')
                quantity = parseInt(quantity, 10)
              }
            }
            if (
              stryMutAct_9fa48('2849')
                ? (!quantity || typeof quantity !== 'number' || isNaN(quantity)) && quantity <= 0
                : stryMutAct_9fa48('2848')
                  ? false
                  : stryMutAct_9fa48('2847')
                    ? true
                    : (stryCov_9fa48('2847', '2848', '2849'),
                      (stryMutAct_9fa48('2851')
                        ? (!quantity || typeof quantity !== 'number') && isNaN(quantity)
                        : stryMutAct_9fa48('2850')
                          ? false
                          : (stryCov_9fa48('2850', '2851'),
                            (stryMutAct_9fa48('2853')
                              ? !quantity && typeof quantity !== 'number'
                              : stryMutAct_9fa48('2852')
                                ? false
                                : (stryCov_9fa48('2852', '2853'),
                                  (stryMutAct_9fa48('2854')
                                    ? quantity
                                    : (stryCov_9fa48('2854'), !quantity)) ||
                                    (stryMutAct_9fa48('2856')
                                      ? typeof quantity === 'number'
                                      : stryMutAct_9fa48('2855')
                                        ? false
                                        : (stryCov_9fa48('2855', '2856'),
                                          typeof quantity !==
                                            (stryMutAct_9fa48('2857')
                                              ? ''
                                              : (stryCov_9fa48('2857'), 'number')))))) ||
                              isNaN(quantity))) ||
                        (stryMutAct_9fa48('2860')
                          ? quantity > 0
                          : stryMutAct_9fa48('2859')
                            ? quantity < 0
                            : stryMutAct_9fa48('2858')
                              ? false
                              : (stryCov_9fa48('2858', '2859', '2860'), quantity <= 0)))
            ) {
              if (stryMutAct_9fa48('2861')) {
                {
                }
              } else {
                stryCov_9fa48('2861')
                throw new ValidationError(
                  stryMutAct_9fa48('2862')
                    ? ''
                    : (stryCov_9fa48('2862'), 'Order validation failed'),
                  stryMutAct_9fa48('2863')
                    ? {}
                    : (stryCov_9fa48('2863'),
                      {
                        'orderItems.quantity': stryMutAct_9fa48('2864')
                          ? ''
                          : (stryCov_9fa48('2864'), 'must be positive')
                      })
                )
              }
            }

            // Convert string prices to numbers if needed
            let unitPriceUsd = item.unit_price_usd
            if (
              stryMutAct_9fa48('2867')
                ? typeof unitPriceUsd !== 'string'
                : stryMutAct_9fa48('2866')
                  ? false
                  : stryMutAct_9fa48('2865')
                    ? true
                    : (stryCov_9fa48('2865', '2866', '2867'),
                      typeof unitPriceUsd ===
                        (stryMutAct_9fa48('2868') ? '' : (stryCov_9fa48('2868'), 'string')))
            ) {
              if (stryMutAct_9fa48('2869')) {
                {
                }
              } else {
                stryCov_9fa48('2869')
                unitPriceUsd = parseFloat(unitPriceUsd)
              }
            }
            if (
              stryMutAct_9fa48('2872')
                ? (!unitPriceUsd || typeof unitPriceUsd !== 'number' || isNaN(unitPriceUsd)) &&
                  unitPriceUsd <= 0
                : stryMutAct_9fa48('2871')
                  ? false
                  : stryMutAct_9fa48('2870')
                    ? true
                    : (stryCov_9fa48('2870', '2871', '2872'),
                      (stryMutAct_9fa48('2874')
                        ? (!unitPriceUsd || typeof unitPriceUsd !== 'number') && isNaN(unitPriceUsd)
                        : stryMutAct_9fa48('2873')
                          ? false
                          : (stryCov_9fa48('2873', '2874'),
                            (stryMutAct_9fa48('2876')
                              ? !unitPriceUsd && typeof unitPriceUsd !== 'number'
                              : stryMutAct_9fa48('2875')
                                ? false
                                : (stryCov_9fa48('2875', '2876'),
                                  (stryMutAct_9fa48('2877')
                                    ? unitPriceUsd
                                    : (stryCov_9fa48('2877'), !unitPriceUsd)) ||
                                    (stryMutAct_9fa48('2879')
                                      ? typeof unitPriceUsd === 'number'
                                      : stryMutAct_9fa48('2878')
                                        ? false
                                        : (stryCov_9fa48('2878', '2879'),
                                          typeof unitPriceUsd !==
                                            (stryMutAct_9fa48('2880')
                                              ? ''
                                              : (stryCov_9fa48('2880'), 'number')))))) ||
                              isNaN(unitPriceUsd))) ||
                        (stryMutAct_9fa48('2883')
                          ? unitPriceUsd > 0
                          : stryMutAct_9fa48('2882')
                            ? unitPriceUsd < 0
                            : stryMutAct_9fa48('2881')
                              ? false
                              : (stryCov_9fa48('2881', '2882', '2883'), unitPriceUsd <= 0)))
            ) {
              if (stryMutAct_9fa48('2884')) {
                {
                }
              } else {
                stryCov_9fa48('2884')
                throw new ValidationError(
                  stryMutAct_9fa48('2885')
                    ? ''
                    : (stryCov_9fa48('2885'), 'Order validation failed'),
                  stryMutAct_9fa48('2886')
                    ? {}
                    : (stryCov_9fa48('2886'),
                      {
                        'orderItems.unit_price_usd': stryMutAct_9fa48('2887')
                          ? ''
                          : (stryCov_9fa48('2887'), 'must be positive')
                      })
                )
              }
            }

            // Validate stock availability using ProductRepository
            const productRepository = getProductRepository()
            const product = await productRepository.findById(
              item.product_id,
              stryMutAct_9fa48('2888') ? false : (stryCov_9fa48('2888'), true)
            )
            if (
              stryMutAct_9fa48('2891')
                ? false
                : stryMutAct_9fa48('2890')
                  ? true
                  : stryMutAct_9fa48('2889')
                    ? product
                    : (stryCov_9fa48('2889', '2890', '2891'), !product)
            ) {
              if (stryMutAct_9fa48('2892')) {
                {
                }
              } else {
                stryCov_9fa48('2892')
                throw new NotFoundError(
                  stryMutAct_9fa48('2893') ? '' : (stryCov_9fa48('2893'), 'Product'),
                  item.product_id,
                  stryMutAct_9fa48('2894')
                    ? {}
                    : (stryCov_9fa48('2894'),
                      {
                        productId: item.product_id
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('2897')
                ? false
                : stryMutAct_9fa48('2896')
                  ? true
                  : stryMutAct_9fa48('2895')
                    ? product.active
                    : (stryCov_9fa48('2895', '2896', '2897'), !product.active)
            ) {
              if (stryMutAct_9fa48('2898')) {
                {
                }
              } else {
                stryCov_9fa48('2898')
                throw new ValidationError(
                  stryMutAct_9fa48('2899') ? '' : (stryCov_9fa48('2899'), 'Product is not active'),
                  stryMutAct_9fa48('2900')
                    ? {}
                    : (stryCov_9fa48('2900'),
                      {
                        productId: item.product_id,
                        productName: product.name
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('2904')
                ? product.stock >= item.quantity
                : stryMutAct_9fa48('2903')
                  ? product.stock <= item.quantity
                  : stryMutAct_9fa48('2902')
                    ? false
                    : stryMutAct_9fa48('2901')
                      ? true
                      : (stryCov_9fa48('2901', '2902', '2903', '2904'),
                        product.stock < item.quantity)
            ) {
              if (stryMutAct_9fa48('2905')) {
                {
                }
              } else {
                stryCov_9fa48('2905')
                throw new ValidationError(
                  stryMutAct_9fa48('2906') ? '' : (stryCov_9fa48('2906'), 'Insufficient stock'),
                  stryMutAct_9fa48('2907')
                    ? {}
                    : (stryCov_9fa48('2907'),
                      {
                        productId: item.product_id,
                        productName: product.name,
                        requested: item.quantity,
                        available: product.stock
                      })
                )
              }
            }
          }
        }

        // Sanitize order data before database operations
        const sanitizedOrderData = sanitizeOrderData(
          orderData,
          stryMutAct_9fa48('2908') ? true : (stryCov_9fa48('2908'), false)
        )

        // Convert string amounts to numbers if needed for the order payload
        let totalAmountVes = sanitizedOrderData.total_amount_ves
        if (
          stryMutAct_9fa48('2911')
            ? typeof totalAmountVes !== 'string'
            : stryMutAct_9fa48('2910')
              ? false
              : stryMutAct_9fa48('2909')
                ? true
                : (stryCov_9fa48('2909', '2910', '2911'),
                  typeof totalAmountVes ===
                    (stryMutAct_9fa48('2912') ? '' : (stryCov_9fa48('2912'), 'string')))
        ) {
          if (stryMutAct_9fa48('2913')) {
            {
            }
          } else {
            stryCov_9fa48('2913')
            totalAmountVes = parseFloat(totalAmountVes)
          }
        }
        let currencyRate = sanitizedOrderData.currency_rate
        if (
          stryMutAct_9fa48('2916')
            ? typeof currencyRate !== 'string'
            : stryMutAct_9fa48('2915')
              ? false
              : stryMutAct_9fa48('2914')
                ? true
                : (stryCov_9fa48('2914', '2915', '2916'),
                  typeof currencyRate ===
                    (stryMutAct_9fa48('2917') ? '' : (stryCov_9fa48('2917'), 'string')))
        ) {
          if (stryMutAct_9fa48('2918')) {
            {
            }
          } else {
            stryCov_9fa48('2918')
            currencyRate = parseFloat(currencyRate)
          }
        }
        const orderPayload = stryMutAct_9fa48('2919')
          ? {}
          : (stryCov_9fa48('2919'),
            {
              user_id: (
                stryMutAct_9fa48('2922')
                  ? sanitizedOrderData.user_id === undefined
                  : stryMutAct_9fa48('2921')
                    ? false
                    : stryMutAct_9fa48('2920')
                      ? true
                      : (stryCov_9fa48('2920', '2921', '2922'),
                        sanitizedOrderData.user_id !== undefined)
              )
                ? sanitizedOrderData.user_id
                : null,
              customer_email: sanitizedOrderData.customer_email,
              customer_name: sanitizedOrderData.customer_name,
              customer_phone: (
                stryMutAct_9fa48('2925')
                  ? sanitizedOrderData.customer_phone === undefined
                  : stryMutAct_9fa48('2924')
                    ? false
                    : stryMutAct_9fa48('2923')
                      ? true
                      : (stryCov_9fa48('2923', '2924', '2925'),
                        sanitizedOrderData.customer_phone !== undefined)
              )
                ? sanitizedOrderData.customer_phone
                : null,
              delivery_address: sanitizedOrderData.delivery_address,
              delivery_date: (
                stryMutAct_9fa48('2928')
                  ? sanitizedOrderData.delivery_date === undefined
                  : stryMutAct_9fa48('2927')
                    ? false
                    : stryMutAct_9fa48('2926')
                      ? true
                      : (stryCov_9fa48('2926', '2927', '2928'),
                        sanitizedOrderData.delivery_date !== undefined)
              )
                ? sanitizedOrderData.delivery_date
                : null,
              delivery_time_slot: (
                stryMutAct_9fa48('2931')
                  ? sanitizedOrderData.delivery_time_slot === undefined
                  : stryMutAct_9fa48('2930')
                    ? false
                    : stryMutAct_9fa48('2929')
                      ? true
                      : (stryCov_9fa48('2929', '2930', '2931'),
                        sanitizedOrderData.delivery_time_slot !== undefined)
              )
                ? sanitizedOrderData.delivery_time_slot
                : null,
              delivery_notes: (
                stryMutAct_9fa48('2934')
                  ? sanitizedOrderData.delivery_notes === undefined
                  : stryMutAct_9fa48('2933')
                    ? false
                    : stryMutAct_9fa48('2932')
                      ? true
                      : (stryCov_9fa48('2932', '2933', '2934'),
                        sanitizedOrderData.delivery_notes !== undefined)
              )
                ? sanitizedOrderData.delivery_notes
                : null,
              status: (
                stryMutAct_9fa48('2937')
                  ? sanitizedOrderData.status === undefined
                  : stryMutAct_9fa48('2936')
                    ? false
                    : stryMutAct_9fa48('2935')
                      ? true
                      : (stryCov_9fa48('2935', '2936', '2937'),
                        sanitizedOrderData.status !== undefined)
              )
                ? sanitizedOrderData.status
                : stryMutAct_9fa48('2938')
                  ? ''
                  : (stryCov_9fa48('2938'), 'pending'),
              total_amount_usd: (
                stryMutAct_9fa48('2941')
                  ? typeof sanitizedOrderData.total_amount_usd !== 'string'
                  : stryMutAct_9fa48('2940')
                    ? false
                    : stryMutAct_9fa48('2939')
                      ? true
                      : (stryCov_9fa48('2939', '2940', '2941'),
                        typeof sanitizedOrderData.total_amount_usd ===
                          (stryMutAct_9fa48('2942') ? '' : (stryCov_9fa48('2942'), 'string')))
              )
                ? parseFloat(sanitizedOrderData.total_amount_usd)
                : sanitizedOrderData.total_amount_usd,
              total_amount_ves: (
                stryMutAct_9fa48('2945')
                  ? totalAmountVes !== null || totalAmountVes !== undefined
                  : stryMutAct_9fa48('2944')
                    ? false
                    : stryMutAct_9fa48('2943')
                      ? true
                      : (stryCov_9fa48('2943', '2944', '2945'),
                        (stryMutAct_9fa48('2947')
                          ? totalAmountVes === null
                          : stryMutAct_9fa48('2946')
                            ? true
                            : (stryCov_9fa48('2946', '2947'), totalAmountVes !== null)) &&
                          (stryMutAct_9fa48('2949')
                            ? totalAmountVes === undefined
                            : stryMutAct_9fa48('2948')
                              ? true
                              : (stryCov_9fa48('2948', '2949'), totalAmountVes !== undefined)))
              )
                ? Math.round(totalAmountVes)
                : null,
              currency_rate: (
                stryMutAct_9fa48('2952')
                  ? currencyRate === undefined
                  : stryMutAct_9fa48('2951')
                    ? false
                    : stryMutAct_9fa48('2950')
                      ? true
                      : (stryCov_9fa48('2950', '2951', '2952'), currencyRate !== undefined)
              )
                ? currencyRate
                : null,
              notes: (
                stryMutAct_9fa48('2955')
                  ? sanitizedOrderData.notes === undefined
                  : stryMutAct_9fa48('2954')
                    ? false
                    : stryMutAct_9fa48('2953')
                      ? true
                      : (stryCov_9fa48('2953', '2954', '2955'),
                        sanitizedOrderData.notes !== undefined)
              )
                ? sanitizedOrderData.notes
                : null,
              admin_notes: (
                stryMutAct_9fa48('2958')
                  ? sanitizedOrderData.admin_notes === undefined
                  : stryMutAct_9fa48('2957')
                    ? false
                    : stryMutAct_9fa48('2956')
                      ? true
                      : (stryCov_9fa48('2956', '2957', '2958'),
                        sanitizedOrderData.admin_notes !== undefined)
              )
                ? sanitizedOrderData.admin_notes
                : null
            })
        const itemsPayload = orderItems.map(item => {
          if (stryMutAct_9fa48('2959')) {
            {
            }
          } else {
            stryCov_9fa48('2959')
            // Sanitize item data before database operations
            const sanitizedItem = sanitizeOrderItemData(item)

            // Ensure numeric values are properly converted
            const productId = (
              stryMutAct_9fa48('2962')
                ? typeof sanitizedItem.product_id !== 'string'
                : stryMutAct_9fa48('2961')
                  ? false
                  : stryMutAct_9fa48('2960')
                    ? true
                    : (stryCov_9fa48('2960', '2961', '2962'),
                      typeof sanitizedItem.product_id ===
                        (stryMutAct_9fa48('2963') ? '' : (stryCov_9fa48('2963'), 'string')))
            )
              ? parseInt(sanitizedItem.product_id, 10)
              : sanitizedItem.product_id
            const unitPriceUsd = (
              stryMutAct_9fa48('2966')
                ? typeof sanitizedItem.unit_price_usd !== 'string'
                : stryMutAct_9fa48('2965')
                  ? false
                  : stryMutAct_9fa48('2964')
                    ? true
                    : (stryCov_9fa48('2964', '2965', '2966'),
                      typeof sanitizedItem.unit_price_usd ===
                        (stryMutAct_9fa48('2967') ? '' : (stryCov_9fa48('2967'), 'string')))
            )
              ? parseFloat(sanitizedItem.unit_price_usd)
              : sanitizedItem.unit_price_usd
            const unitPriceVes = (
              stryMutAct_9fa48('2970')
                ? typeof sanitizedItem.unit_price_ves !== 'string'
                : stryMutAct_9fa48('2969')
                  ? false
                  : stryMutAct_9fa48('2968')
                    ? true
                    : (stryCov_9fa48('2968', '2969', '2970'),
                      typeof sanitizedItem.unit_price_ves ===
                        (stryMutAct_9fa48('2971') ? '' : (stryCov_9fa48('2971'), 'string')))
            )
              ? parseFloat(sanitizedItem.unit_price_ves)
              : sanitizedItem.unit_price_ves
            const quantity = (
              stryMutAct_9fa48('2974')
                ? typeof sanitizedItem.quantity !== 'string'
                : stryMutAct_9fa48('2973')
                  ? false
                  : stryMutAct_9fa48('2972')
                    ? true
                    : (stryCov_9fa48('2972', '2973', '2974'),
                      typeof sanitizedItem.quantity ===
                        (stryMutAct_9fa48('2975') ? '' : (stryCov_9fa48('2975'), 'string')))
            )
              ? parseInt(sanitizedItem.quantity, 10)
              : sanitizedItem.quantity

            // Apply intelligent rounding to VES values (round to nearest integer)
            const roundedUnitPriceVes = (
              stryMutAct_9fa48('2978')
                ? unitPriceVes !== null || unitPriceVes !== undefined
                : stryMutAct_9fa48('2977')
                  ? false
                  : stryMutAct_9fa48('2976')
                    ? true
                    : (stryCov_9fa48('2976', '2977', '2978'),
                      (stryMutAct_9fa48('2980')
                        ? unitPriceVes === null
                        : stryMutAct_9fa48('2979')
                          ? true
                          : (stryCov_9fa48('2979', '2980'), unitPriceVes !== null)) &&
                        (stryMutAct_9fa48('2982')
                          ? unitPriceVes === undefined
                          : stryMutAct_9fa48('2981')
                            ? true
                            : (stryCov_9fa48('2981', '2982'), unitPriceVes !== undefined)))
            )
              ? Math.round(unitPriceVes)
              : null
            const roundedSubtotalVes = (
              stryMutAct_9fa48('2985')
                ? unitPriceVes !== null || unitPriceVes !== undefined
                : stryMutAct_9fa48('2984')
                  ? false
                  : stryMutAct_9fa48('2983')
                    ? true
                    : (stryCov_9fa48('2983', '2984', '2985'),
                      (stryMutAct_9fa48('2987')
                        ? unitPriceVes === null
                        : stryMutAct_9fa48('2986')
                          ? true
                          : (stryCov_9fa48('2986', '2987'), unitPriceVes !== null)) &&
                        (stryMutAct_9fa48('2989')
                          ? unitPriceVes === undefined
                          : stryMutAct_9fa48('2988')
                            ? true
                            : (stryCov_9fa48('2988', '2989'), unitPriceVes !== undefined)))
            )
              ? Math.round(
                  stryMutAct_9fa48('2990')
                    ? unitPriceVes / quantity
                    : (stryCov_9fa48('2990'), unitPriceVes * quantity)
                )
              : null
            return stryMutAct_9fa48('2991')
              ? {}
              : (stryCov_9fa48('2991'),
                {
                  product_id: productId,
                  product_name: sanitizedItem.product_name,
                  product_summary: (
                    stryMutAct_9fa48('2994')
                      ? sanitizedItem.product_summary === undefined
                      : stryMutAct_9fa48('2993')
                        ? false
                        : stryMutAct_9fa48('2992')
                          ? true
                          : (stryCov_9fa48('2992', '2993', '2994'),
                            sanitizedItem.product_summary !== undefined)
                  )
                    ? sanitizedItem.product_summary
                    : null,
                  unit_price_usd: unitPriceUsd,
                  unit_price_ves: roundedUnitPriceVes,
                  quantity: quantity,
                  subtotal_usd: stryMutAct_9fa48('2995')
                    ? unitPriceUsd / quantity
                    : (stryCov_9fa48('2995'), unitPriceUsd * quantity),
                  subtotal_ves: roundedSubtotalVes
                })
          }
        })

        // Use atomic stored function (SSOT: DB_FUNCTIONS.createOrderWithItems)
        const result = await supabase.rpc(
          stryMutAct_9fa48('2996') ? '' : (stryCov_9fa48('2996'), 'create_order_with_items'),
          stryMutAct_9fa48('2997')
            ? {}
            : (stryCov_9fa48('2997'),
              {
                order_data: orderPayload,
                order_items: itemsPayload
              })
        )
        const data = stryMutAct_9fa48('2998')
          ? result?.data && result
          : (stryCov_9fa48('2998'),
            (stryMutAct_9fa48('2999') ? result.data : (stryCov_9fa48('2999'), result?.data)) ??
              result)
        const error = stryMutAct_9fa48('3000')
          ? result.error
          : (stryCov_9fa48('3000'), result?.error)
        if (
          stryMutAct_9fa48('3002')
            ? false
            : stryMutAct_9fa48('3001')
              ? true
              : (stryCov_9fa48('3001', '3002'), error)
        ) {
          if (stryMutAct_9fa48('3003')) {
            {
            }
          } else {
            stryCov_9fa48('3003')
            throw new DatabaseError(
              stryMutAct_9fa48('3004') ? '' : (stryCov_9fa48('3004'), 'RPC'),
              stryMutAct_9fa48('3005') ? '' : (stryCov_9fa48('3005'), 'create_order_with_items'),
              error,
              stryMutAct_9fa48('3006')
                ? {}
                : (stryCov_9fa48('3006'),
                  {
                    orderData,
                    itemCount: orderItems.length
                  })
            )
          }
        }

        // RPC functions return single values, not arrays
        if (
          stryMutAct_9fa48('3009')
            ? data === null && Array.isArray(data) && data.length === 0
            : stryMutAct_9fa48('3008')
              ? false
              : stryMutAct_9fa48('3007')
                ? true
                : (stryCov_9fa48('3007', '3008', '3009'),
                  (stryMutAct_9fa48('3011')
                    ? data !== null
                    : stryMutAct_9fa48('3010')
                      ? false
                      : (stryCov_9fa48('3010', '3011'), data === null)) ||
                    (stryMutAct_9fa48('3013')
                      ? Array.isArray(data) || data.length === 0
                      : stryMutAct_9fa48('3012')
                        ? false
                        : (stryCov_9fa48('3012', '3013'),
                          Array.isArray(data) &&
                            (stryMutAct_9fa48('3015')
                              ? data.length !== 0
                              : stryMutAct_9fa48('3014')
                                ? true
                                : (stryCov_9fa48('3014', '3015'), data.length === 0)))))
        ) {
          if (stryMutAct_9fa48('3016')) {
            {
            }
          } else {
            stryCov_9fa48('3016')
            throw new DatabaseError(
              stryMutAct_9fa48('3017') ? '' : (stryCov_9fa48('3017'), 'RPC'),
              stryMutAct_9fa48('3018') ? '' : (stryCov_9fa48('3018'), 'create_order_with_items'),
              new InternalServerError(
                stryMutAct_9fa48('3019') ? '' : (stryCov_9fa48('3019'), 'No data returned')
              ),
              stryMutAct_9fa48('3020')
                ? {}
                : (stryCov_9fa48('3020'),
                  {
                    orderData,
                    itemCount: orderItems.length
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3021')) {
        {
        }
      } else {
        stryCov_9fa48('3021')
        console.error(
          stryMutAct_9fa48('3022') ? '' : (stryCov_9fa48('3022'), 'createOrderWithItems failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update order status with history (uses atomic stored function)
 */
export async function updateOrderStatus(orderId, newStatus, notes = null, changedBy = null) {
  if (stryMutAct_9fa48('3023')) {
    {
    }
  } else {
    stryCov_9fa48('3023')
    try {
      if (stryMutAct_9fa48('3024')) {
        {
        }
      } else {
        stryCov_9fa48('3024')
        if (
          stryMutAct_9fa48('3027')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3026')
              ? false
              : stryMutAct_9fa48('3025')
                ? true
                : (stryCov_9fa48('3025', '3026', '3027'),
                  (stryMutAct_9fa48('3028') ? orderId : (stryCov_9fa48('3028'), !orderId)) ||
                    (stryMutAct_9fa48('3030')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3029')
                        ? false
                        : (stryCov_9fa48('3029', '3030'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3031') ? '' : (stryCov_9fa48('3031'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3032')) {
            {
            }
          } else {
            stryCov_9fa48('3032')
            throw new BadRequestError(
              stryMutAct_9fa48('3033')
                ? ''
                : (stryCov_9fa48('3033'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3034')
                ? {}
                : (stryCov_9fa48('3034'),
                  {
                    orderId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3037')
            ? !newStatus && !VALID_STATUSES.includes(newStatus)
            : stryMutAct_9fa48('3036')
              ? false
              : stryMutAct_9fa48('3035')
                ? true
                : (stryCov_9fa48('3035', '3036', '3037'),
                  (stryMutAct_9fa48('3038') ? newStatus : (stryCov_9fa48('3038'), !newStatus)) ||
                    (stryMutAct_9fa48('3039')
                      ? VALID_STATUSES.includes(newStatus)
                      : (stryCov_9fa48('3039'), !VALID_STATUSES.includes(newStatus))))
        ) {
          if (stryMutAct_9fa48('3040')) {
            {
            }
          } else {
            stryCov_9fa48('3040')
            throw new BadRequestError(
              stryMutAct_9fa48('3041')
                ? ``
                : (stryCov_9fa48('3041'),
                  `Invalid status: must be one of ${VALID_STATUSES.join(stryMutAct_9fa48('3042') ? '' : (stryCov_9fa48('3042'), ', '))}`),
              stryMutAct_9fa48('3043')
                ? {}
                : (stryCov_9fa48('3043'),
                  {
                    newStatus
                  })
            )
          }
        }

        // Use atomic stored function (SSOT: DB_FUNCTIONS.updateOrderStatusWithHistory)
        const { data, error } = await supabase.rpc(
          stryMutAct_9fa48('3044')
            ? ''
            : (stryCov_9fa48('3044'), 'update_order_status_with_history'),
          stryMutAct_9fa48('3045')
            ? {}
            : (stryCov_9fa48('3045'),
              {
                order_id: orderId,
                new_status: newStatus,
                notes: notes,
                changed_by: changedBy
              })
        )
        if (
          stryMutAct_9fa48('3047')
            ? false
            : stryMutAct_9fa48('3046')
              ? true
              : (stryCov_9fa48('3046', '3047'), error)
        ) {
          if (stryMutAct_9fa48('3048')) {
            {
            }
          } else {
            stryCov_9fa48('3048')
            if (
              stryMutAct_9fa48('3051')
                ? error.message.includes('not found')
                : stryMutAct_9fa48('3050')
                  ? false
                  : stryMutAct_9fa48('3049')
                    ? true
                    : (stryCov_9fa48('3049', '3050', '3051'),
                      error.message?.includes(
                        stryMutAct_9fa48('3052') ? '' : (stryCov_9fa48('3052'), 'not found')
                      ))
            ) {
              if (stryMutAct_9fa48('3053')) {
                {
                }
              } else {
                stryCov_9fa48('3053')
                throw new NotFoundError(
                  stryMutAct_9fa48('3054') ? '' : (stryCov_9fa48('3054'), 'Order'),
                  orderId
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('3055') ? '' : (stryCov_9fa48('3055'), 'RPC'),
              stryMutAct_9fa48('3056')
                ? ''
                : (stryCov_9fa48('3056'), 'update_order_status_with_history'),
              error,
              stryMutAct_9fa48('3057')
                ? {}
                : (stryCov_9fa48('3057'),
                  {
                    orderId,
                    newStatus
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3060')
            ? false
            : stryMutAct_9fa48('3059')
              ? true
              : stryMutAct_9fa48('3058')
                ? data
                : (stryCov_9fa48('3058', '3059', '3060'), !data)
        ) {
          if (stryMutAct_9fa48('3061')) {
            {
            }
          } else {
            stryCov_9fa48('3061')
            throw new DatabaseError(
              stryMutAct_9fa48('3062') ? '' : (stryCov_9fa48('3062'), 'RPC'),
              stryMutAct_9fa48('3063')
                ? ''
                : (stryCov_9fa48('3063'), 'update_order_status_with_history'),
              new InternalServerError(
                stryMutAct_9fa48('3064') ? '' : (stryCov_9fa48('3064'), 'No data returned')
              ),
              stryMutAct_9fa48('3065')
                ? {}
                : (stryCov_9fa48('3065'),
                  {
                    orderId,
                    newStatus
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3066')) {
        {
        }
      } else {
        stryCov_9fa48('3066')
        console.error(
          stryMutAct_9fa48('3067')
            ? ``
            : (stryCov_9fa48('3067'), `updateOrderStatus(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update order (limited fields) - only allows updating delivery and note fields
 * @param {number} id - Order ID to update
 * @param {Object} updates - Updated order data
 * @param {string} [updates.delivery_address] - Delivery address
 * @param {string} [updates.delivery_date] - Delivery date
 * @param {string} [updates.delivery_time_slot] - Delivery time slot
 * @param {string} [updates.delivery_notes] - Delivery notes
 * @param {string} [updates.notes] - Customer notes
 * @param {string} [updates.admin_notes] - Admin notes
 * @returns {Object} - Updated order
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When order data is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database update fails
 * @example
 * const order = await updateOrder(123, {
 *   delivery_address: 'Nueva dirección 456',
 *   delivery_notes: 'Llamar al timbre'
 * })
 */
export async function updateOrder(id, updates) {
  if (stryMutAct_9fa48('3068')) {
    {
    }
  } else {
    stryCov_9fa48('3068')
    try {
      if (stryMutAct_9fa48('3069')) {
        {
        }
      } else {
        stryCov_9fa48('3069')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('3072')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('3071')
              ? false
              : stryMutAct_9fa48('3070')
                ? true
                : (stryCov_9fa48('3070', '3071', '3072'),
                  (stryMutAct_9fa48('3073') ? id : (stryCov_9fa48('3073'), !id)) ||
                    (stryMutAct_9fa48('3075')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('3074')
                        ? false
                        : (stryCov_9fa48('3074', '3075'),
                          typeof id !==
                            (stryMutAct_9fa48('3076') ? '' : (stryCov_9fa48('3076'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3077')) {
            {
            }
          } else {
            stryCov_9fa48('3077')
            throw new BadRequestError(
              stryMutAct_9fa48('3078')
                ? ''
                : (stryCov_9fa48('3078'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3079')
                ? {}
                : (stryCov_9fa48('3079'),
                  {
                    orderId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3082')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('3081')
              ? false
              : stryMutAct_9fa48('3080')
                ? true
                : (stryCov_9fa48('3080', '3081', '3082'),
                  (stryMutAct_9fa48('3083') ? updates : (stryCov_9fa48('3083'), !updates)) ||
                    (stryMutAct_9fa48('3085')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('3084')
                        ? false
                        : (stryCov_9fa48('3084', '3085'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('3086')) {
            {
            }
          } else {
            stryCov_9fa48('3086')
            throw new BadRequestError(
              stryMutAct_9fa48('3087') ? '' : (stryCov_9fa48('3087'), 'No updates provided'),
              stryMutAct_9fa48('3088')
                ? {}
                : (stryCov_9fa48('3088'),
                  {
                    orderId: id
                  })
            )
          }
        }
        validateOrder(
          updates,
          VALID_STATUSES,
          stryMutAct_9fa48('3089') ? false : (stryCov_9fa48('3089'), true)
        )
        const allowedFields = stryMutAct_9fa48('3090')
          ? []
          : (stryCov_9fa48('3090'),
            [
              stryMutAct_9fa48('3091') ? '' : (stryCov_9fa48('3091'), 'delivery_address'),
              stryMutAct_9fa48('3092') ? '' : (stryCov_9fa48('3092'), 'delivery_date'),
              stryMutAct_9fa48('3093') ? '' : (stryCov_9fa48('3093'), 'delivery_time_slot'),
              stryMutAct_9fa48('3094') ? '' : (stryCov_9fa48('3094'), 'delivery_notes'),
              stryMutAct_9fa48('3095') ? '' : (stryCov_9fa48('3095'), 'notes'),
              stryMutAct_9fa48('3096') ? '' : (stryCov_9fa48('3096'), 'admin_notes')
            ])
        const sanitized = {}
        for (const key of allowedFields) {
          if (stryMutAct_9fa48('3097')) {
            {
            }
          } else {
            stryCov_9fa48('3097')
            if (
              stryMutAct_9fa48('3100')
                ? updates[key] === undefined
                : stryMutAct_9fa48('3099')
                  ? false
                  : stryMutAct_9fa48('3098')
                    ? true
                    : (stryCov_9fa48('3098', '3099', '3100'), updates[key] !== undefined)
            ) {
              if (stryMutAct_9fa48('3101')) {
                {
                }
              } else {
                stryCov_9fa48('3101')
                sanitized[key] = updates[key]
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('3104')
            ? Object.keys(sanitized).length !== 0
            : stryMutAct_9fa48('3103')
              ? false
              : stryMutAct_9fa48('3102')
                ? true
                : (stryCov_9fa48('3102', '3103', '3104'), Object.keys(sanitized).length === 0)
        ) {
          if (stryMutAct_9fa48('3105')) {
            {
            }
          } else {
            stryCov_9fa48('3105')
            throw new BadRequestError(
              stryMutAct_9fa48('3106') ? '' : (stryCov_9fa48('3106'), 'No valid fields to update'),
              stryMutAct_9fa48('3107')
                ? {}
                : (stryCov_9fa48('3107'),
                  {
                    orderId: id
                  })
            )
          }
        }

        // Use repository's update method
        const data = await orderRepository.update(id, sanitized)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3108')) {
        {
        }
      } else {
        stryCov_9fa48('3108')
        console.error(
          stryMutAct_9fa48('3109') ? `` : (stryCov_9fa48('3109'), `updateOrder(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Cancel order - wrapper for updateOrderStatus that sets status to 'cancelled'
 * @param {number} orderId - Order ID to cancel
 * @param {string} [notes='Order cancelled'] - Cancellation notes
 * @param {number|null} [_changedBy=null] - User ID who cancelled the order (not used, kept for API compatibility)
 * @returns {Object} - Updated order with cancelled status
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database operation fails
 * @example
 * const order = await cancelOrder(123, 'Cliente solicitó cancelación', 456)
 */
export async function cancelOrder(
  orderId,
  notes = stryMutAct_9fa48('3110') ? '' : (stryCov_9fa48('3110'), 'Order cancelled'),
  _changedBy = null
) {
  if (stryMutAct_9fa48('3111')) {
    {
    }
  } else {
    stryCov_9fa48('3111')
    try {
      if (stryMutAct_9fa48('3112')) {
        {
        }
      } else {
        stryCov_9fa48('3112')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('3115')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3114')
              ? false
              : stryMutAct_9fa48('3113')
                ? true
                : (stryCov_9fa48('3113', '3114', '3115'),
                  (stryMutAct_9fa48('3116') ? orderId : (stryCov_9fa48('3116'), !orderId)) ||
                    (stryMutAct_9fa48('3118')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3117')
                        ? false
                        : (stryCov_9fa48('3117', '3118'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3119') ? '' : (stryCov_9fa48('3119'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3120')) {
            {
            }
          } else {
            stryCov_9fa48('3120')
            throw new BadRequestError(
              stryMutAct_9fa48('3121')
                ? ''
                : (stryCov_9fa48('3121'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3122')
                ? {}
                : (stryCov_9fa48('3122'),
                  {
                    orderId
                  })
            )
          }
        }

        // Use repository's cancel method
        const data = await orderRepository.cancel(orderId, notes)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3123')) {
        {
        }
      } else {
        stryCov_9fa48('3123')
        console.error(
          stryMutAct_9fa48('3124')
            ? ``
            : (stryCov_9fa48('3124'), `cancelOrder(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get order status history - chronological record of all status changes
 * @param {number} orderId - Order ID to get history for
 * @returns {Object[]} - Array of status history records ordered by creation date
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order or history is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const history = await getOrderStatusHistory(123)
 * // Returns: [{ id: 1, order_id: 123, old_status: 'pending', new_status: 'verified', created_at: '...' }]
 */
export async function getOrderStatusHistory(orderId) {
  if (stryMutAct_9fa48('3125')) {
    {
    }
  } else {
    stryCov_9fa48('3125')
    try {
      if (stryMutAct_9fa48('3126')) {
        {
        }
      } else {
        stryCov_9fa48('3126')
        if (
          stryMutAct_9fa48('3129')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3128')
              ? false
              : stryMutAct_9fa48('3127')
                ? true
                : (stryCov_9fa48('3127', '3128', '3129'),
                  (stryMutAct_9fa48('3130') ? orderId : (stryCov_9fa48('3130'), !orderId)) ||
                    (stryMutAct_9fa48('3132')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3131')
                        ? false
                        : (stryCov_9fa48('3131', '3132'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3133') ? '' : (stryCov_9fa48('3133'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3134')) {
            {
            }
          } else {
            stryCov_9fa48('3134')
            throw new BadRequestError(
              stryMutAct_9fa48('3135')
                ? ''
                : (stryCov_9fa48('3135'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3136')
                ? {}
                : (stryCov_9fa48('3136'),
                  {
                    orderId
                  })
            )
          }
        }
        const orderRepository = getOrderRepository()
        const data = await orderRepository.findStatusHistoryByOrderId(orderId)
        if (
          stryMutAct_9fa48('3139')
            ? !data && data.length === 0
            : stryMutAct_9fa48('3138')
              ? false
              : stryMutAct_9fa48('3137')
                ? true
                : (stryCov_9fa48('3137', '3138', '3139'),
                  (stryMutAct_9fa48('3140') ? data : (stryCov_9fa48('3140'), !data)) ||
                    (stryMutAct_9fa48('3142')
                      ? data.length !== 0
                      : stryMutAct_9fa48('3141')
                        ? false
                        : (stryCov_9fa48('3141', '3142'), data.length === 0)))
        ) {
          if (stryMutAct_9fa48('3143')) {
            {
            }
          } else {
            stryCov_9fa48('3143')
            throw new NotFoundError(
              stryMutAct_9fa48('3144') ? '' : (stryCov_9fa48('3144'), 'Order status history'),
              orderId,
              stryMutAct_9fa48('3145')
                ? {}
                : (stryCov_9fa48('3145'),
                  {
                    orderId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3146')) {
        {
        }
      } else {
        stryCov_9fa48('3146')
        console.error(
          stryMutAct_9fa48('3147')
            ? ``
            : (stryCov_9fa48('3147'), `getOrderStatusHistory(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
