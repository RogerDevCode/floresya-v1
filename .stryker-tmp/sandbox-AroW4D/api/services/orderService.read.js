/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Order Service - Read Operations
 * Handles all order retrieval operations
 * LEGACY: Modularizado desde orderService.js (WEEK 3)
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
  getOrderRepository,
  NotFoundError,
  BadRequestError,
  withErrorMapping
} from './orderService.helpers.js'

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
    includeDeactivated = stryMutAct_9fa48('3148') ? true : (stryCov_9fa48('3148'), false)
  ) => {
    if (stryMutAct_9fa48('3149')) {
      {
      }
    } else {
      stryCov_9fa48('3149')
      const orderRepository = getOrderRepository()

      // Use repository to get orders with filters
      const data = await orderRepository.findAllWithFilters(
        filters,
        stryMutAct_9fa48('3150')
          ? {}
          : (stryCov_9fa48('3150'),
            {
              includeDeactivated
            })
      )
      if (
        stryMutAct_9fa48('3153')
          ? false
          : stryMutAct_9fa48('3152')
            ? true
            : stryMutAct_9fa48('3151')
              ? data
              : (stryCov_9fa48('3151', '3152', '3153'), !data)
      ) {
        if (stryMutAct_9fa48('3154')) {
          {
          }
        } else {
          stryCov_9fa48('3154')
          throw new NotFoundError(stryMutAct_9fa48('3155') ? '' : (stryCov_9fa48('3155'), 'Orders'))
        }
      }
      return data
    }
  },
  stryMutAct_9fa48('3156') ? '' : (stryCov_9fa48('3156'), 'SELECT'),
  stryMutAct_9fa48('3157') ? '' : (stryCov_9fa48('3157'), 'orders')
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
  includeDeactivated = stryMutAct_9fa48('3158') ? true : (stryCov_9fa48('3158'), false)
) {
  if (stryMutAct_9fa48('3159')) {
    {
    }
  } else {
    stryCov_9fa48('3159')
    try {
      if (stryMutAct_9fa48('3160')) {
        {
        }
      } else {
        stryCov_9fa48('3160')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('3163')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('3162')
              ? false
              : stryMutAct_9fa48('3161')
                ? true
                : (stryCov_9fa48('3161', '3162', '3163'),
                  (stryMutAct_9fa48('3164') ? id : (stryCov_9fa48('3164'), !id)) ||
                    (stryMutAct_9fa48('3166')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('3165')
                        ? false
                        : (stryCov_9fa48('3165', '3166'),
                          typeof id !==
                            (stryMutAct_9fa48('3167') ? '' : (stryCov_9fa48('3167'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3168')) {
            {
            }
          } else {
            stryCov_9fa48('3168')
            throw new BadRequestError(
              stryMutAct_9fa48('3169')
                ? ''
                : (stryCov_9fa48('3169'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3170')
                ? {}
                : (stryCov_9fa48('3170'),
                  {
                    orderId: id
                  })
            )
          }
        }

        // Use repository to get order
        const data = await orderRepository.findByIdWithItems(id, includeDeactivated)
        if (
          stryMutAct_9fa48('3173')
            ? false
            : stryMutAct_9fa48('3172')
              ? true
              : stryMutAct_9fa48('3171')
                ? data
                : (stryCov_9fa48('3171', '3172', '3173'), !data)
        ) {
          if (stryMutAct_9fa48('3174')) {
            {
            }
          } else {
            stryCov_9fa48('3174')
            throw new NotFoundError(
              stryMutAct_9fa48('3175') ? '' : (stryCov_9fa48('3175'), 'Order'),
              id
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3176')) {
        {
        }
      } else {
        stryCov_9fa48('3176')
        console.error(
          stryMutAct_9fa48('3177') ? `` : (stryCov_9fa48('3177'), `getOrderById(${id}) failed:`),
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
  if (stryMutAct_9fa48('3178')) {
    {
    }
  } else {
    stryCov_9fa48('3178')
    try {
      if (stryMutAct_9fa48('3179')) {
        {
        }
      } else {
        stryCov_9fa48('3179')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('3182')
            ? !userId && typeof userId !== 'number'
            : stryMutAct_9fa48('3181')
              ? false
              : stryMutAct_9fa48('3180')
                ? true
                : (stryCov_9fa48('3180', '3181', '3182'),
                  (stryMutAct_9fa48('3183') ? userId : (stryCov_9fa48('3183'), !userId)) ||
                    (stryMutAct_9fa48('3185')
                      ? typeof userId === 'number'
                      : stryMutAct_9fa48('3184')
                        ? false
                        : (stryCov_9fa48('3184', '3185'),
                          typeof userId !==
                            (stryMutAct_9fa48('3186') ? '' : (stryCov_9fa48('3186'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3187')) {
            {
            }
          } else {
            stryCov_9fa48('3187')
            throw new BadRequestError(
              stryMutAct_9fa48('3188')
                ? ''
                : (stryCov_9fa48('3188'), 'Invalid user ID: must be a number'),
              stryMutAct_9fa48('3189')
                ? {}
                : (stryCov_9fa48('3189'),
                  {
                    userId
                  })
            )
          }
        }

        // Use repository to get orders by user
        const data = await orderRepository.findByUserId(userId, filters)
        if (
          stryMutAct_9fa48('3192')
            ? false
            : stryMutAct_9fa48('3191')
              ? true
              : stryMutAct_9fa48('3190')
                ? data
                : (stryCov_9fa48('3190', '3191', '3192'), !data)
        ) {
          if (stryMutAct_9fa48('3193')) {
            {
            }
          } else {
            stryCov_9fa48('3193')
            throw new NotFoundError(
              stryMutAct_9fa48('3194') ? '' : (stryCov_9fa48('3194'), 'Orders for user'),
              userId,
              stryMutAct_9fa48('3195')
                ? {}
                : (stryCov_9fa48('3195'),
                  {
                    userId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3196')) {
        {
        }
      } else {
        stryCov_9fa48('3196')
        console.error(
          stryMutAct_9fa48('3197')
            ? ``
            : (stryCov_9fa48('3197'), `getOrdersByUser(${userId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
