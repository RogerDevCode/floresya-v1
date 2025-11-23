/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Payment Service - Create Operations
 * Handles payment creation and confirmation
 * LEGACY: Modularizado desde paymentService.js (PHASE 5)
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
import { getPaymentRepository, ValidationError } from './paymentService.helpers.js'

/**
 * Confirm payment for an order (marks as paid)
 * @param {number} orderId - Order ID to confirm payment for
 * @param {Object} paymentData - Payment confirmation data
 * @returns {Object} - Updated payment record
 * @throws {BadRequestError} If orderId or paymentData is invalid
 * @throws {NotFoundError} If payment is not found
 * @throws {ValidationError} If payment data is invalid
 * @throws {DatabaseError} If database update fails
 */
export async function confirmPayment(orderId, paymentData) {
  if (stryMutAct_9fa48('3647')) {
    {
    }
  } else {
    stryCov_9fa48('3647')
    try {
      if (stryMutAct_9fa48('3648')) {
        {
        }
      } else {
        stryCov_9fa48('3648')
        if (
          stryMutAct_9fa48('3651')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3650')
              ? false
              : stryMutAct_9fa48('3649')
                ? true
                : (stryCov_9fa48('3649', '3650', '3651'),
                  (stryMutAct_9fa48('3652') ? orderId : (stryCov_9fa48('3652'), !orderId)) ||
                    (stryMutAct_9fa48('3654')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3653')
                        ? false
                        : (stryCov_9fa48('3653', '3654'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3655') ? '' : (stryCov_9fa48('3655'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3656')) {
            {
            }
          } else {
            stryCov_9fa48('3656')
            throw new BadRequestError(
              stryMutAct_9fa48('3657')
                ? ''
                : (stryCov_9fa48('3657'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3658')
                ? {}
                : (stryCov_9fa48('3658'),
                  {
                    orderId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3661')
            ? !paymentData && typeof paymentData !== 'object'
            : stryMutAct_9fa48('3660')
              ? false
              : stryMutAct_9fa48('3659')
                ? true
                : (stryCov_9fa48('3659', '3660', '3661'),
                  (stryMutAct_9fa48('3662')
                    ? paymentData
                    : (stryCov_9fa48('3662'), !paymentData)) ||
                    (stryMutAct_9fa48('3664')
                      ? typeof paymentData === 'object'
                      : stryMutAct_9fa48('3663')
                        ? false
                        : (stryCov_9fa48('3663', '3664'),
                          typeof paymentData !==
                            (stryMutAct_9fa48('3665') ? '' : (stryCov_9fa48('3665'), 'object')))))
        ) {
          if (stryMutAct_9fa48('3666')) {
            {
            }
          } else {
            stryCov_9fa48('3666')
            throw new BadRequestError(
              stryMutAct_9fa48('3667') ? '' : (stryCov_9fa48('3667'), 'Payment data is required'),
              stryMutAct_9fa48('3668')
                ? {}
                : (stryCov_9fa48('3668'),
                  {
                    orderId
                  })
            )
          }
        }
        const paymentRepository = getPaymentRepository()

        // Validate payment method
        if (
          stryMutAct_9fa48('3671')
            ? false
            : stryMutAct_9fa48('3670')
              ? true
              : stryMutAct_9fa48('3669')
                ? paymentData.payment_method_id
                : (stryCov_9fa48('3669', '3670', '3671'), !paymentData.payment_method_id)
        ) {
          if (stryMutAct_9fa48('3672')) {
            {
            }
          } else {
            stryCov_9fa48('3672')
            throw new ValidationError(
              stryMutAct_9fa48('3673')
                ? ''
                : (stryCov_9fa48('3673'), 'Payment method ID is required'),
              stryMutAct_9fa48('3674')
                ? {}
                : (stryCov_9fa48('3674'),
                  {
                    paymentData
                  })
            )
          }
        }

        // Validate reference if provided
        if (
          stryMutAct_9fa48('3677')
            ? paymentData.reference || typeof paymentData.reference !== 'string'
            : stryMutAct_9fa48('3676')
              ? false
              : stryMutAct_9fa48('3675')
                ? true
                : (stryCov_9fa48('3675', '3676', '3677'),
                  paymentData.reference &&
                    (stryMutAct_9fa48('3679')
                      ? typeof paymentData.reference === 'string'
                      : stryMutAct_9fa48('3678')
                        ? true
                        : (stryCov_9fa48('3678', '3679'),
                          typeof paymentData.reference !==
                            (stryMutAct_9fa48('3680') ? '' : (stryCov_9fa48('3680'), 'string')))))
        ) {
          if (stryMutAct_9fa48('3681')) {
            {
            }
          } else {
            stryCov_9fa48('3681')
            throw new ValidationError(
              stryMutAct_9fa48('3682')
                ? ''
                : (stryCov_9fa48('3682'), 'Payment reference must be a string'),
              stryMutAct_9fa48('3683')
                ? {}
                : (stryCov_9fa48('3683'),
                  {
                    paymentData
                  })
            )
          }
        }

        // Prepare update data
        const updateData = stryMutAct_9fa48('3684')
          ? {}
          : (stryCov_9fa48('3684'),
            {
              status: stryMutAct_9fa48('3685') ? '' : (stryCov_9fa48('3685'), 'confirmed'),
              payment_method_id: paymentData.payment_method_id,
              reference: stryMutAct_9fa48('3688')
                ? paymentData.reference && null
                : stryMutAct_9fa48('3687')
                  ? false
                  : stryMutAct_9fa48('3686')
                    ? true
                    : (stryCov_9fa48('3686', '3687', '3688'), paymentData.reference || null),
              confirmed_at: new Date().toISOString()
            })

        // Use repository to confirm payment
        const data = await paymentRepository.confirmPayment(orderId, updateData)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3689')) {
        {
        }
      } else {
        stryCov_9fa48('3689')
        if (
          stryMutAct_9fa48('3692')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3691')
              ? false
              : stryMutAct_9fa48('3690')
                ? true
                : (stryCov_9fa48('3690', '3691', '3692'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3693') ? '' : (stryCov_9fa48('3693'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3694')) {
            {
            }
          } else {
            stryCov_9fa48('3694')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3695')
            ? ``
            : (stryCov_9fa48('3695'), `confirmPayment(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
