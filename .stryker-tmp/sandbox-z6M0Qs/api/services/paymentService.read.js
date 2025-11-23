/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Payment Service - Read Operations
 * Handles all payment retrieval operations
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
import {
  getPaymentMethodRepository,
  getSettingsRepository,
  getPaymentRepository,
  NotFoundError
} from './paymentService.helpers.js'

/**
 * Get available payment methods for Venezuela
 * @returns {Array} Active payment methods sorted by display_order
 * @throws {DatabaseError} If database query fails
 * @throws {NotFoundError} If no payment methods found
 */
export async function getPaymentMethods() {
  if (stryMutAct_9fa48('3913')) {
    {
    }
  } else {
    stryCov_9fa48('3913')
    try {
      if (stryMutAct_9fa48('3914')) {
        {
        }
      } else {
        stryCov_9fa48('3914')
        const paymentMethodRepository = getPaymentMethodRepository()

        // Use repository to get active payment methods
        const data = await paymentMethodRepository.findActive()
        if (
          stryMutAct_9fa48('3917')
            ? !data && data.length === 0
            : stryMutAct_9fa48('3916')
              ? false
              : stryMutAct_9fa48('3915')
                ? true
                : (stryCov_9fa48('3915', '3916', '3917'),
                  (stryMutAct_9fa48('3918') ? data : (stryCov_9fa48('3918'), !data)) ||
                    (stryMutAct_9fa48('3920')
                      ? data.length !== 0
                      : stryMutAct_9fa48('3919')
                        ? false
                        : (stryCov_9fa48('3919', '3920'), data.length === 0)))
        ) {
          if (stryMutAct_9fa48('3921')) {
            {
            }
          } else {
            stryCov_9fa48('3921')
            throw new NotFoundError(
              stryMutAct_9fa48('3922') ? '' : (stryCov_9fa48('3922'), 'Payment Methods'),
              stryMutAct_9fa48('3923') ? '' : (stryCov_9fa48('3923'), 'active'),
              stryMutAct_9fa48('3924')
                ? {}
                : (stryCov_9fa48('3924'),
                  {
                    active: stryMutAct_9fa48('3925') ? false : (stryCov_9fa48('3925'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3926')) {
        {
        }
      } else {
        stryCov_9fa48('3926')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('3929')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3928')
              ? false
              : stryMutAct_9fa48('3927')
                ? true
                : (stryCov_9fa48('3927', '3928', '3929'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3930') ? '' : (stryCov_9fa48('3930'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3931')) {
            {
            }
          } else {
            stryCov_9fa48('3931')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3932') ? '' : (stryCov_9fa48('3932'), 'getPaymentMethods failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get delivery cost from settings (FAIL-FAST - no fallback)
 * @returns {number} Delivery cost in USD
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If delivery cost setting is not found
 * @throws {ValidationError} If delivery cost value is invalid
 */
export async function getDeliveryCost() {
  if (stryMutAct_9fa48('3933')) {
    {
    }
  } else {
    stryCov_9fa48('3933')
    try {
      if (stryMutAct_9fa48('3934')) {
        {
        }
      } else {
        stryCov_9fa48('3934')
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findByKey(
          stryMutAct_9fa48('3935') ? '' : (stryCov_9fa48('3935'), 'DELIVERY_COST_USD')
        )
        if (
          stryMutAct_9fa48('3938')
            ? false
            : stryMutAct_9fa48('3937')
              ? true
              : stryMutAct_9fa48('3936')
                ? data
                : (stryCov_9fa48('3936', '3937', '3938'), !data)
        ) {
          if (stryMutAct_9fa48('3939')) {
            {
            }
          } else {
            stryCov_9fa48('3939')
            throw new NotFoundError(
              stryMutAct_9fa48('3940') ? '' : (stryCov_9fa48('3940'), 'Setting'),
              stryMutAct_9fa48('3941') ? '' : (stryCov_9fa48('3941'), 'DELIVERY_COST_USD')
            )
          }
        }
        const cost = parseFloat(data.value)
        if (
          stryMutAct_9fa48('3944')
            ? isNaN(cost) && cost < 0
            : stryMutAct_9fa48('3943')
              ? false
              : stryMutAct_9fa48('3942')
                ? true
                : (stryCov_9fa48('3942', '3943', '3944'),
                  isNaN(cost) ||
                    (stryMutAct_9fa48('3947')
                      ? cost >= 0
                      : stryMutAct_9fa48('3946')
                        ? cost <= 0
                        : stryMutAct_9fa48('3945')
                          ? false
                          : (stryCov_9fa48('3945', '3946', '3947'), cost < 0)))
        ) {
          if (stryMutAct_9fa48('3948')) {
            {
            }
          } else {
            stryCov_9fa48('3948')
            throw new ValidationError(
              stryMutAct_9fa48('3949')
                ? ''
                : (stryCov_9fa48('3949'), 'Invalid DELIVERY_COST_USD value'),
              stryMutAct_9fa48('3950')
                ? {}
                : (stryCov_9fa48('3950'),
                  {
                    value: data.value
                  })
            )
          }
        }
        return cost
      }
    } catch (error) {
      if (stryMutAct_9fa48('3951')) {
        {
        }
      } else {
        stryCov_9fa48('3951')
        if (
          stryMutAct_9fa48('3954')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3953')
              ? false
              : stryMutAct_9fa48('3952')
                ? true
                : (stryCov_9fa48('3952', '3953', '3954'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3955') ? '' : (stryCov_9fa48('3955'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3956')) {
            {
            }
          } else {
            stryCov_9fa48('3956')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3957') ? '' : (stryCov_9fa48('3957'), 'getDeliveryCost failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get USD to VES exchange rate from settings (FAIL-FAST - no fallback)
 * @returns {number} Exchange rate from USD to VES
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If exchange rate setting is not found
 * @throws {ValidationError} If exchange rate value is invalid
 */
export async function getBCVRate() {
  if (stryMutAct_9fa48('3958')) {
    {
    }
  } else {
    stryCov_9fa48('3958')
    try {
      if (stryMutAct_9fa48('3959')) {
        {
        }
      } else {
        stryCov_9fa48('3959')
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findByKey(
          stryMutAct_9fa48('3960') ? '' : (stryCov_9fa48('3960'), 'USD_VES_BCV_RATE')
        )
        if (
          stryMutAct_9fa48('3963')
            ? false
            : stryMutAct_9fa48('3962')
              ? true
              : stryMutAct_9fa48('3961')
                ? data
                : (stryCov_9fa48('3961', '3962', '3963'), !data)
        ) {
          if (stryMutAct_9fa48('3964')) {
            {
            }
          } else {
            stryCov_9fa48('3964')
            throw new NotFoundError(
              stryMutAct_9fa48('3965') ? '' : (stryCov_9fa48('3965'), 'Setting'),
              stryMutAct_9fa48('3966') ? '' : (stryCov_9fa48('3966'), 'USD_VES_BCV_RATE')
            )
          }
        }
        const rate = parseFloat(data.value)
        if (
          stryMutAct_9fa48('3969')
            ? isNaN(rate) && rate <= 0
            : stryMutAct_9fa48('3968')
              ? false
              : stryMutAct_9fa48('3967')
                ? true
                : (stryCov_9fa48('3967', '3968', '3969'),
                  isNaN(rate) ||
                    (stryMutAct_9fa48('3972')
                      ? rate > 0
                      : stryMutAct_9fa48('3971')
                        ? rate < 0
                        : stryMutAct_9fa48('3970')
                          ? false
                          : (stryCov_9fa48('3970', '3971', '3972'), rate <= 0)))
        ) {
          if (stryMutAct_9fa48('3973')) {
            {
            }
          } else {
            stryCov_9fa48('3973')
            throw new ValidationError(
              stryMutAct_9fa48('3974')
                ? ''
                : (stryCov_9fa48('3974'), 'Invalid USD_VES_BCV_RATE value'),
              stryMutAct_9fa48('3975')
                ? {}
                : (stryCov_9fa48('3975'),
                  {
                    value: data.value
                  })
            )
          }
        }
        return rate
      }
    } catch (error) {
      if (stryMutAct_9fa48('3976')) {
        {
        }
      } else {
        stryCov_9fa48('3976')
        if (
          stryMutAct_9fa48('3979')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3978')
              ? false
              : stryMutAct_9fa48('3977')
                ? true
                : (stryCov_9fa48('3977', '3978', '3979'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3980') ? '' : (stryCov_9fa48('3980'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3981')) {
            {
            }
          } else {
            stryCov_9fa48('3981')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3982') ? '' : (stryCov_9fa48('3982'), 'getBCVRate failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get all payments for an order
 * @param {number} orderId - Order ID to get payments for
 * @returns {Array} Array of payments for the order
 * @throws {BadRequestError} If orderId is invalid
 * @throws {NotFoundError} If no payments found for the order
 * @throws {DatabaseError} If database query fails
 */
export async function getOrderPayments(orderId) {
  if (stryMutAct_9fa48('3983')) {
    {
    }
  } else {
    stryCov_9fa48('3983')
    try {
      if (stryMutAct_9fa48('3984')) {
        {
        }
      } else {
        stryCov_9fa48('3984')
        if (
          stryMutAct_9fa48('3987')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3986')
              ? false
              : stryMutAct_9fa48('3985')
                ? true
                : (stryCov_9fa48('3985', '3986', '3987'),
                  (stryMutAct_9fa48('3988') ? orderId : (stryCov_9fa48('3988'), !orderId)) ||
                    (stryMutAct_9fa48('3990')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3989')
                        ? false
                        : (stryCov_9fa48('3989', '3990'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3991') ? '' : (stryCov_9fa48('3991'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3992')) {
            {
            }
          } else {
            stryCov_9fa48('3992')
            throw new BadRequestError(
              stryMutAct_9fa48('3993')
                ? ''
                : (stryCov_9fa48('3993'), 'Invalid order ID: must be a number'),
              stryMutAct_9fa48('3994')
                ? {}
                : (stryCov_9fa48('3994'),
                  {
                    orderId
                  })
            )
          }
        }
        const paymentRepository = getPaymentRepository()
        const data = await paymentRepository.findByOrderId(orderId)
        if (
          stryMutAct_9fa48('3997')
            ? !data && data.length === 0
            : stryMutAct_9fa48('3996')
              ? false
              : stryMutAct_9fa48('3995')
                ? true
                : (stryCov_9fa48('3995', '3996', '3997'),
                  (stryMutAct_9fa48('3998') ? data : (stryCov_9fa48('3998'), !data)) ||
                    (stryMutAct_9fa48('4000')
                      ? data.length !== 0
                      : stryMutAct_9fa48('3999')
                        ? false
                        : (stryCov_9fa48('3999', '4000'), data.length === 0)))
        ) {
          if (stryMutAct_9fa48('4001')) {
            {
            }
          } else {
            stryCov_9fa48('4001')
            throw new NotFoundError(
              stryMutAct_9fa48('4002') ? '' : (stryCov_9fa48('4002'), 'Payments for order'),
              orderId,
              stryMutAct_9fa48('4003')
                ? {}
                : (stryCov_9fa48('4003'),
                  {
                    orderId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4004')) {
        {
        }
      } else {
        stryCov_9fa48('4004')
        if (
          stryMutAct_9fa48('4007')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('4006')
              ? false
              : stryMutAct_9fa48('4005')
                ? true
                : (stryCov_9fa48('4005', '4006', '4007'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('4008') ? '' : (stryCov_9fa48('4008'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('4009')) {
            {
            }
          } else {
            stryCov_9fa48('4009')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('4010')
            ? ``
            : (stryCov_9fa48('4010'), `getOrderPayments(${orderId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
