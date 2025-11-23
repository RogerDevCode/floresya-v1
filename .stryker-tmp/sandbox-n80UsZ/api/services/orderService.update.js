/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Order Service - Update Operations
 * Handles all order update operations
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
  VALID_STATUSES,
  BadRequestError,
  NotFoundError,
  DatabaseError,
  InternalServerError
} from './orderService.helpers.js'
import { supabase } from './supabaseClient.js'
import { validateOrder } from '../utils/validation.js'

/**
 * Update order status with history (uses atomic stored function)
 * @param {number} orderId - Order ID to update
 * @param {string} newStatus - New status for the order
 * @param {string} [notes] - Optional notes for the status change
 * @param {number} [changedBy] - User ID who changed the status
 * @returns {Object} - Updated order with status history
 * @throws {BadRequestError} When orderId or status is invalid
 * @throws {NotFoundError} When order is not found
 * @throws {DatabaseError} When database operation fails
 */
export async function updateOrderStatus(orderId, newStatus, notes = null, changedBy = null) {
  if (stryMutAct_9fa48('3221')) {
    {
    }
  } else {
    stryCov_9fa48('3221')
    try {
      if (stryMutAct_9fa48('3222')) {
        {
        }
      } else {
        stryCov_9fa48('3222')
        if (
          stryMutAct_9fa48('3225')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3224')
              ? false
              : stryMutAct_9fa48('3223')
                ? true
                : (stryCov_9fa48('3223', '3224', '3225'),
                  (stryMutAct_9fa48('3226') ? orderId : (stryCov_9fa48('3226'), !orderId)) ||
                    (stryMutAct_9fa48('3228')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3227')
                        ? false
                        : (stryCov_9fa48('3227', '3228'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3229') ? '' : (stryCov_9fa48('3229'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3230')) {
            {
            }
          } else {
            stryCov_9fa48('3230')
            throw new BadRequestError(
              stryMutAct_9fa48('3231')
                ? ''
                : (stryCov_9fa48('3231'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3232')
                ? {}
                : (stryCov_9fa48('3232'),
                  {
                    orderId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3235')
            ? !newStatus && !VALID_STATUSES.includes(newStatus)
            : stryMutAct_9fa48('3234')
              ? false
              : stryMutAct_9fa48('3233')
                ? true
                : (stryCov_9fa48('3233', '3234', '3235'),
                  (stryMutAct_9fa48('3236') ? newStatus : (stryCov_9fa48('3236'), !newStatus)) ||
                    (stryMutAct_9fa48('3237')
                      ? VALID_STATUSES.includes(newStatus)
                      : (stryCov_9fa48('3237'), !VALID_STATUSES.includes(newStatus))))
        ) {
          if (stryMutAct_9fa48('3238')) {
            {
            }
          } else {
            stryCov_9fa48('3238')
            throw new BadRequestError(
              stryMutAct_9fa48('3239')
                ? ``
                : (stryCov_9fa48('3239'),
                  `Invalid status: must be one of ${VALID_STATUSES.join(stryMutAct_9fa48('3240') ? '' : (stryCov_9fa48('3240'), ', '))}`),
              stryMutAct_9fa48('3241')
                ? {}
                : (stryCov_9fa48('3241'),
                  {
                    newStatus
                  })
            )
          }
        }

        // Use atomic stored function (SSOT: DB_FUNCTIONS.updateOrderStatusWithHistory)
        const { data, error } = await supabase.rpc(
          stryMutAct_9fa48('3242')
            ? ''
            : (stryCov_9fa48('3242'), 'update_order_status_with_history'),
          stryMutAct_9fa48('3243')
            ? {}
            : (stryCov_9fa48('3243'),
              {
                order_id: orderId,
                new_status: newStatus,
                notes: notes,
                changed_by: changedBy
              })
        )
        if (
          stryMutAct_9fa48('3245')
            ? false
            : stryMutAct_9fa48('3244')
              ? true
              : (stryCov_9fa48('3244', '3245'), error)
        ) {
          if (stryMutAct_9fa48('3246')) {
            {
            }
          } else {
            stryCov_9fa48('3246')
            if (
              stryMutAct_9fa48('3249')
                ? error.message.includes('not found')
                : stryMutAct_9fa48('3248')
                  ? false
                  : stryMutAct_9fa48('3247')
                    ? true
                    : (stryCov_9fa48('3247', '3248', '3249'),
                      error.message?.includes(
                        stryMutAct_9fa48('3250') ? '' : (stryCov_9fa48('3250'), 'not found')
                      ))
            ) {
              if (stryMutAct_9fa48('3251')) {
                {
                }
              } else {
                stryCov_9fa48('3251')
                throw new NotFoundError(
                  stryMutAct_9fa48('3252') ? '' : (stryCov_9fa48('3252'), 'Order'),
                  orderId
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('3253') ? '' : (stryCov_9fa48('3253'), 'RPC'),
              stryMutAct_9fa48('3254')
                ? ''
                : (stryCov_9fa48('3254'), 'update_order_status_with_history'),
              error,
              stryMutAct_9fa48('3255')
                ? {}
                : (stryCov_9fa48('3255'),
                  {
                    orderId,
                    newStatus
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3258')
            ? false
            : stryMutAct_9fa48('3257')
              ? true
              : stryMutAct_9fa48('3256')
                ? data
                : (stryCov_9fa48('3256', '3257', '3258'), !data)
        ) {
          if (stryMutAct_9fa48('3259')) {
            {
            }
          } else {
            stryCov_9fa48('3259')
            throw new DatabaseError(
              stryMutAct_9fa48('3260') ? '' : (stryCov_9fa48('3260'), 'RPC'),
              stryMutAct_9fa48('3261')
                ? ''
                : (stryCov_9fa48('3261'), 'update_order_status_with_history'),
              new InternalServerError(
                stryMutAct_9fa48('3262') ? '' : (stryCov_9fa48('3262'), 'No data returned')
              ),
              stryMutAct_9fa48('3263')
                ? {}
                : (stryCov_9fa48('3263'),
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
      if (stryMutAct_9fa48('3264')) {
        {
        }
      } else {
        stryCov_9fa48('3264')
        console.error(
          stryMutAct_9fa48('3265')
            ? ``
            : (stryCov_9fa48('3265'), `updateOrderStatus(${orderId}) failed:`),
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
  if (stryMutAct_9fa48('3266')) {
    {
    }
  } else {
    stryCov_9fa48('3266')
    try {
      if (stryMutAct_9fa48('3267')) {
        {
        }
      } else {
        stryCov_9fa48('3267')
        const orderRepository = getOrderRepository()
        if (
          stryMutAct_9fa48('3270')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('3269')
              ? false
              : stryMutAct_9fa48('3268')
                ? true
                : (stryCov_9fa48('3268', '3269', '3270'),
                  (stryMutAct_9fa48('3271') ? id : (stryCov_9fa48('3271'), !id)) ||
                    (stryMutAct_9fa48('3273')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('3272')
                        ? false
                        : (stryCov_9fa48('3272', '3273'),
                          typeof id !==
                            (stryMutAct_9fa48('3274') ? '' : (stryCov_9fa48('3274'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3275')) {
            {
            }
          } else {
            stryCov_9fa48('3275')
            throw new BadRequestError(
              stryMutAct_9fa48('3276')
                ? ''
                : (stryCov_9fa48('3276'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3277')
                ? {}
                : (stryCov_9fa48('3277'),
                  {
                    orderId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3280')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('3279')
              ? false
              : stryMutAct_9fa48('3278')
                ? true
                : (stryCov_9fa48('3278', '3279', '3280'),
                  (stryMutAct_9fa48('3281') ? updates : (stryCov_9fa48('3281'), !updates)) ||
                    (stryMutAct_9fa48('3283')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('3282')
                        ? false
                        : (stryCov_9fa48('3282', '3283'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('3284')) {
            {
            }
          } else {
            stryCov_9fa48('3284')
            throw new BadRequestError(
              stryMutAct_9fa48('3285') ? '' : (stryCov_9fa48('3285'), 'No updates provided'),
              stryMutAct_9fa48('3286')
                ? {}
                : (stryCov_9fa48('3286'),
                  {
                    orderId: id
                  })
            )
          }
        }
        validateOrder(
          updates,
          VALID_STATUSES,
          stryMutAct_9fa48('3287') ? false : (stryCov_9fa48('3287'), true)
        )
        const allowedFields = stryMutAct_9fa48('3288')
          ? []
          : (stryCov_9fa48('3288'),
            [
              stryMutAct_9fa48('3289') ? '' : (stryCov_9fa48('3289'), 'delivery_address'),
              stryMutAct_9fa48('3290') ? '' : (stryCov_9fa48('3290'), 'delivery_date'),
              stryMutAct_9fa48('3291') ? '' : (stryCov_9fa48('3291'), 'delivery_time_slot'),
              stryMutAct_9fa48('3292') ? '' : (stryCov_9fa48('3292'), 'delivery_notes'),
              stryMutAct_9fa48('3293') ? '' : (stryCov_9fa48('3293'), 'notes'),
              stryMutAct_9fa48('3294') ? '' : (stryCov_9fa48('3294'), 'admin_notes')
            ])
        const sanitized = {}
        for (const key of allowedFields) {
          if (stryMutAct_9fa48('3295')) {
            {
            }
          } else {
            stryCov_9fa48('3295')
            if (
              stryMutAct_9fa48('3298')
                ? updates[key] === undefined
                : stryMutAct_9fa48('3297')
                  ? false
                  : stryMutAct_9fa48('3296')
                    ? true
                    : (stryCov_9fa48('3296', '3297', '3298'), updates[key] !== undefined)
            ) {
              if (stryMutAct_9fa48('3299')) {
                {
                }
              } else {
                stryCov_9fa48('3299')
                sanitized[key] = updates[key]
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('3302')
            ? Object.keys(sanitized).length !== 0
            : stryMutAct_9fa48('3301')
              ? false
              : stryMutAct_9fa48('3300')
                ? true
                : (stryCov_9fa48('3300', '3301', '3302'), Object.keys(sanitized).length === 0)
        ) {
          if (stryMutAct_9fa48('3303')) {
            {
            }
          } else {
            stryCov_9fa48('3303')
            throw new BadRequestError(
              stryMutAct_9fa48('3304') ? '' : (stryCov_9fa48('3304'), 'No valid fields to update'),
              stryMutAct_9fa48('3305')
                ? {}
                : (stryCov_9fa48('3305'),
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
      if (stryMutAct_9fa48('3306')) {
        {
        }
      } else {
        stryCov_9fa48('3306')
        console.error(
          stryMutAct_9fa48('3307') ? `` : (stryCov_9fa48('3307'), `updateOrder(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
