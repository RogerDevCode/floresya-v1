/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * OrderStatusService
 * Business logic for order_status_history table
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
import { supabase } from './supabaseClient.js'
import { BadRequestError, DatabaseError } from '../errors/AppError.js'
import { QUERY_LIMITS } from '../config/constants.js'

/**
 * Get status history for an order
 * @param {string} orderId
 * @returns {Promise<Array>}
 */
export async function getOrderStatusHistory(orderId) {
  if (stryMutAct_9fa48('3308')) {
    {
    }
  } else {
    stryCov_9fa48('3308')
    try {
      if (stryMutAct_9fa48('3309')) {
        {
        }
      } else {
        stryCov_9fa48('3309')
        if (
          stryMutAct_9fa48('3312')
            ? false
            : stryMutAct_9fa48('3311')
              ? true
              : stryMutAct_9fa48('3310')
                ? orderId
                : (stryCov_9fa48('3310', '3311', '3312'), !orderId)
        ) {
          if (stryMutAct_9fa48('3313')) {
            {
            }
          } else {
            stryCov_9fa48('3313')
            throw new BadRequestError(
              stryMutAct_9fa48('3314') ? '' : (stryCov_9fa48('3314'), 'Order ID required'),
              stryMutAct_9fa48('3315')
                ? {}
                : (stryCov_9fa48('3315'),
                  {
                    orderId
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(stryMutAct_9fa48('3316') ? '' : (stryCov_9fa48('3316'), 'order_status_history'))
          .select(stryMutAct_9fa48('3317') ? '' : (stryCov_9fa48('3317'), '*'))
          .eq(stryMutAct_9fa48('3318') ? '' : (stryCov_9fa48('3318'), 'order_id'), orderId)
          .order(
            stryMutAct_9fa48('3319') ? '' : (stryCov_9fa48('3319'), 'created_at'),
            stryMutAct_9fa48('3320')
              ? {}
              : (stryCov_9fa48('3320'),
                {
                  ascending: stryMutAct_9fa48('3321') ? false : (stryCov_9fa48('3321'), true)
                })
          )
        if (
          stryMutAct_9fa48('3323')
            ? false
            : stryMutAct_9fa48('3322')
              ? true
              : (stryCov_9fa48('3322', '3323'), error)
        ) {
          if (stryMutAct_9fa48('3324')) {
            {
            }
          } else {
            stryCov_9fa48('3324')
            throw new DatabaseError(
              stryMutAct_9fa48('3325') ? '' : (stryCov_9fa48('3325'), 'SELECT'),
              stryMutAct_9fa48('3326') ? '' : (stryCov_9fa48('3326'), 'order_status_history'),
              error,
              stryMutAct_9fa48('3327')
                ? {}
                : (stryCov_9fa48('3327'),
                  {
                    orderId
                  })
            )
          }
        }
        return stryMutAct_9fa48('3330')
          ? data && []
          : stryMutAct_9fa48('3329')
            ? false
            : stryMutAct_9fa48('3328')
              ? true
              : (stryCov_9fa48('3328', '3329', '3330'),
                data ||
                  (stryMutAct_9fa48('3331') ? ['Stryker was here'] : (stryCov_9fa48('3331'), [])))
      }
    } catch (error) {
      if (stryMutAct_9fa48('3332')) {
        {
        }
      } else {
        stryCov_9fa48('3332')
        console.error(
          stryMutAct_9fa48('3333')
            ? ``
            : (stryCov_9fa48('3333'),
              `orderStatusService.getOrderStatusHistory(${orderId}) falló:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Add status update to order history
 * @param {string} orderId
 * @param {Object} statusData - {status, notes, changed_by}
 * @returns {Promise<Object>}
 */
export async function addStatusUpdate(orderId, statusData) {
  if (stryMutAct_9fa48('3334')) {
    {
    }
  } else {
    stryCov_9fa48('3334')
    try {
      if (stryMutAct_9fa48('3335')) {
        {
        }
      } else {
        stryCov_9fa48('3335')
        if (
          stryMutAct_9fa48('3338')
            ? false
            : stryMutAct_9fa48('3337')
              ? true
              : stryMutAct_9fa48('3336')
                ? orderId
                : (stryCov_9fa48('3336', '3337', '3338'), !orderId)
        ) {
          if (stryMutAct_9fa48('3339')) {
            {
            }
          } else {
            stryCov_9fa48('3339')
            throw new BadRequestError(
              stryMutAct_9fa48('3340') ? '' : (stryCov_9fa48('3340'), 'Order ID required'),
              stryMutAct_9fa48('3341')
                ? {}
                : (stryCov_9fa48('3341'),
                  {
                    orderId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3344')
            ? false
            : stryMutAct_9fa48('3343')
              ? true
              : stryMutAct_9fa48('3342')
                ? statusData.status
                : (stryCov_9fa48('3342', '3343', '3344'), !statusData.status)
        ) {
          if (stryMutAct_9fa48('3345')) {
            {
            }
          } else {
            stryCov_9fa48('3345')
            throw new BadRequestError(
              stryMutAct_9fa48('3346') ? '' : (stryCov_9fa48('3346'), 'Status required'),
              stryMutAct_9fa48('3347')
                ? {}
                : (stryCov_9fa48('3347'),
                  {
                    statusData
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(stryMutAct_9fa48('3348') ? '' : (stryCov_9fa48('3348'), 'order_status_history'))
          .insert(
            stryMutAct_9fa48('3349')
              ? {}
              : (stryCov_9fa48('3349'),
                {
                  order_id: orderId,
                  status: statusData.status,
                  notes: stryMutAct_9fa48('3352')
                    ? statusData.notes && null
                    : stryMutAct_9fa48('3351')
                      ? false
                      : stryMutAct_9fa48('3350')
                        ? true
                        : (stryCov_9fa48('3350', '3351', '3352'), statusData.notes || null),
                  changed_by: stryMutAct_9fa48('3355')
                    ? statusData.changed_by && null
                    : stryMutAct_9fa48('3354')
                      ? false
                      : stryMutAct_9fa48('3353')
                        ? true
                        : (stryCov_9fa48('3353', '3354', '3355'), statusData.changed_by || null)
                })
          )
          .select()
          .single()
        if (
          stryMutAct_9fa48('3357')
            ? false
            : stryMutAct_9fa48('3356')
              ? true
              : (stryCov_9fa48('3356', '3357'), error)
        ) {
          if (stryMutAct_9fa48('3358')) {
            {
            }
          } else {
            stryCov_9fa48('3358')
            throw new DatabaseError(
              stryMutAct_9fa48('3359') ? '' : (stryCov_9fa48('3359'), 'INSERT'),
              stryMutAct_9fa48('3360') ? '' : (stryCov_9fa48('3360'), 'order_status_history'),
              error,
              stryMutAct_9fa48('3361')
                ? {}
                : (stryCov_9fa48('3361'),
                  {
                    orderId,
                    statusData
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3362')) {
        {
        }
      } else {
        stryCov_9fa48('3362')
        console.error(
          stryMutAct_9fa48('3363')
            ? ''
            : (stryCov_9fa48('3363'), 'orderStatusService.addStatusUpdate() falló:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get latest status for an order
 * @param {string} orderId
 * @returns {Promise<Object|null>}
 */
export async function getLatestStatus(orderId) {
  if (stryMutAct_9fa48('3364')) {
    {
    }
  } else {
    stryCov_9fa48('3364')
    try {
      if (stryMutAct_9fa48('3365')) {
        {
        }
      } else {
        stryCov_9fa48('3365')
        if (
          stryMutAct_9fa48('3368')
            ? false
            : stryMutAct_9fa48('3367')
              ? true
              : stryMutAct_9fa48('3366')
                ? orderId
                : (stryCov_9fa48('3366', '3367', '3368'), !orderId)
        ) {
          if (stryMutAct_9fa48('3369')) {
            {
            }
          } else {
            stryCov_9fa48('3369')
            throw new BadRequestError(
              stryMutAct_9fa48('3370') ? '' : (stryCov_9fa48('3370'), 'Order ID required'),
              stryMutAct_9fa48('3371')
                ? {}
                : (stryCov_9fa48('3371'),
                  {
                    orderId
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(stryMutAct_9fa48('3372') ? '' : (stryCov_9fa48('3372'), 'order_status_history'))
          .select(stryMutAct_9fa48('3373') ? '' : (stryCov_9fa48('3373'), '*'))
          .eq(stryMutAct_9fa48('3374') ? '' : (stryCov_9fa48('3374'), 'order_id'), orderId)
          .order(
            stryMutAct_9fa48('3375') ? '' : (stryCov_9fa48('3375'), 'created_at'),
            stryMutAct_9fa48('3376')
              ? {}
              : (stryCov_9fa48('3376'),
                {
                  ascending: stryMutAct_9fa48('3377') ? true : (stryCov_9fa48('3377'), false)
                })
          )
          .limit(QUERY_LIMITS.SINGLE_RECORD)
          .single()
        if (
          stryMutAct_9fa48('3380')
            ? error || error.code !== 'PGRST116'
            : stryMutAct_9fa48('3379')
              ? false
              : stryMutAct_9fa48('3378')
                ? true
                : (stryCov_9fa48('3378', '3379', '3380'),
                  error &&
                    (stryMutAct_9fa48('3382')
                      ? error.code === 'PGRST116'
                      : stryMutAct_9fa48('3381')
                        ? true
                        : (stryCov_9fa48('3381', '3382'),
                          error.code !==
                            (stryMutAct_9fa48('3383') ? '' : (stryCov_9fa48('3383'), 'PGRST116')))))
        ) {
          if (stryMutAct_9fa48('3384')) {
            {
            }
          } else {
            stryCov_9fa48('3384')
            throw new DatabaseError(
              stryMutAct_9fa48('3385') ? '' : (stryCov_9fa48('3385'), 'SELECT'),
              stryMutAct_9fa48('3386') ? '' : (stryCov_9fa48('3386'), 'order_status_history'),
              error,
              stryMutAct_9fa48('3387')
                ? {}
                : (stryCov_9fa48('3387'),
                  {
                    orderId
                  })
            )
          }
        }
        return stryMutAct_9fa48('3390')
          ? data && null
          : stryMutAct_9fa48('3389')
            ? false
            : stryMutAct_9fa48('3388')
              ? true
              : (stryCov_9fa48('3388', '3389', '3390'), data || null)
      }
    } catch (error) {
      if (stryMutAct_9fa48('3391')) {
        {
        }
      } else {
        stryCov_9fa48('3391')
        console.error(
          stryMutAct_9fa48('3392')
            ? ``
            : (stryCov_9fa48('3392'), `orderStatusService.getLatestStatus(${orderId}) falló:`),
          error
        )
        throw error
      }
    }
  }
}
