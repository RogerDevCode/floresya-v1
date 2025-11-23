/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Order Service - Status Operations
 * Handles order status history and status-related operations
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
import { getOrderRepository, BadRequestError, NotFoundError } from './orderService.helpers.js'

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
  if (stryMutAct_9fa48('3198')) {
    {
    }
  } else {
    stryCov_9fa48('3198')
    try {
      if (stryMutAct_9fa48('3199')) {
        {
        }
      } else {
        stryCov_9fa48('3199')
        if (
          stryMutAct_9fa48('3202')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3201')
              ? false
              : stryMutAct_9fa48('3200')
                ? true
                : (stryCov_9fa48('3200', '3201', '3202'),
                  (stryMutAct_9fa48('3203') ? orderId : (stryCov_9fa48('3203'), !orderId)) ||
                    (stryMutAct_9fa48('3205')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3204')
                        ? false
                        : (stryCov_9fa48('3204', '3205'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3206') ? '' : (stryCov_9fa48('3206'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3207')) {
            {
            }
          } else {
            stryCov_9fa48('3207')
            throw new BadRequestError(
              stryMutAct_9fa48('3208')
                ? ''
                : (stryCov_9fa48('3208'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3209')
                ? {}
                : (stryCov_9fa48('3209'),
                  {
                    orderId
                  })
            )
          }
        }
        const orderRepository = getOrderRepository()
        const data = await orderRepository.findStatusHistoryByOrderId(orderId)
        if (
          stryMutAct_9fa48('3212')
            ? !data && data.length === 0
            : stryMutAct_9fa48('3211')
              ? false
              : stryMutAct_9fa48('3210')
                ? true
                : (stryCov_9fa48('3210', '3211', '3212'),
                  (stryMutAct_9fa48('3213') ? data : (stryCov_9fa48('3213'), !data)) ||
                    (stryMutAct_9fa48('3215')
                      ? data.length !== 0
                      : stryMutAct_9fa48('3214')
                        ? false
                        : (stryCov_9fa48('3214', '3215'), data.length === 0)))
        ) {
          if (stryMutAct_9fa48('3216')) {
            {
            }
          } else {
            stryCov_9fa48('3216')
            throw new NotFoundError(
              stryMutAct_9fa48('3217') ? '' : (stryCov_9fa48('3217'), 'Order status history'),
              orderId,
              stryMutAct_9fa48('3218')
                ? {}
                : (stryCov_9fa48('3218'),
                  {
                    orderId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3219')) {
        {
        }
      } else {
        stryCov_9fa48('3219')
        console.error(
          stryMutAct_9fa48('3220')
            ? ``
            : (stryCov_9fa48('3220'), `getOrderStatusHistory(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
