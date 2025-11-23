/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Order Service - Cancel Operations
 * Handles order cancellation operations
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
import { getOrderRepository, BadRequestError } from './orderService.helpers.js'

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
  notes = stryMutAct_9fa48('2503') ? '' : (stryCov_9fa48('2503'), 'Order cancelled'),
  _changedBy = null
) {
  if (stryMutAct_9fa48('2504')) {
    {
    }
  } else {
    stryCov_9fa48('2504')
    try {
      if (stryMutAct_9fa48('2505')) {
        {
        }
      } else {
        stryCov_9fa48('2505')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('2508')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('2507')
              ? false
              : stryMutAct_9fa48('2506')
                ? true
                : (stryCov_9fa48('2506', '2507', '2508'),
                  (stryMutAct_9fa48('2509') ? orderId : (stryCov_9fa48('2509'), !orderId)) ||
                    (stryMutAct_9fa48('2511')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('2510')
                        ? false
                        : (stryCov_9fa48('2510', '2511'),
                          typeof orderId !==
                            (stryMutAct_9fa48('2512') ? '' : (stryCov_9fa48('2512'), 'number')))))
        ) {
          if (stryMutAct_9fa48('2513')) {
            {
            }
          } else {
            stryCov_9fa48('2513')
            throw new BadRequestError(
              stryMutAct_9fa48('2514')
                ? ''
                : (stryCov_9fa48('2514'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('2515')
                ? {}
                : (stryCov_9fa48('2515'),
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
      if (stryMutAct_9fa48('2516')) {
        {
        }
      } else {
        stryCov_9fa48('2516')
        console.error(
          stryMutAct_9fa48('2517')
            ? ``
            : (stryCov_9fa48('2517'), `cancelOrder(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
