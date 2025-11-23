/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Payment Service - Venezuelan Payment Methods
 * Business logic for payment processing and order management
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses PaymentRepository and PaymentMethodRepository for data access
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
import {
  ValidationError,
  DatabaseError,
  NotFoundError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { validateEmail, validateVenezuelanPhone } from '../utils/validation.js'

/**
 * Get PaymentMethodRepository instance from DI Container
 * @returns {PaymentMethodRepository} Repository instance
 */
function getPaymentMethodRepository() {
  if (stryMutAct_9fa48('3704')) {
    {
    }
  } else {
    stryCov_9fa48('3704')
    return DIContainer.resolve(
      stryMutAct_9fa48('3705') ? '' : (stryCov_9fa48('3705'), 'PaymentMethodRepository')
    )
  }
}

/**
 * Get PaymentRepository instance from DI Container
 * @returns {PaymentRepository} Repository instance
 */
function getPaymentRepository() {
  if (stryMutAct_9fa48('3706')) {
    {
    }
  } else {
    stryCov_9fa48('3706')
    return DIContainer.resolve(
      stryMutAct_9fa48('3707') ? '' : (stryCov_9fa48('3707'), 'PaymentRepository')
    )
  }
}

/**
 * Get SettingsRepository instance from DI Container
 * @returns {SettingsRepository} Repository instance
 */
function getSettingsRepository() {
  if (stryMutAct_9fa48('3708')) {
    {
    }
  } else {
    stryCov_9fa48('3708')
    return DIContainer.resolve(
      stryMutAct_9fa48('3709') ? '' : (stryCov_9fa48('3709'), 'SettingsRepository')
    )
  }
}

/**
 * Get OrderRepository instance from DI Container
 * @returns {OrderRepository} Repository instance
 */
function getOrderRepository() {
  if (stryMutAct_9fa48('3710')) {
    {
    }
  } else {
    stryCov_9fa48('3710')
    return DIContainer.resolve(
      stryMutAct_9fa48('3711') ? '' : (stryCov_9fa48('3711'), 'OrderRepository')
    )
  }
}

/**
 * Get available payment methods for Venezuela
 * @returns {Array} Active payment methods sorted by display_order
 * @throws {DatabaseError} If database query fails
 * @throws {NotFoundError} If no payment methods found
 */
export async function getPaymentMethods() {
  if (stryMutAct_9fa48('3712')) {
    {
    }
  } else {
    stryCov_9fa48('3712')
    try {
      if (stryMutAct_9fa48('3713')) {
        {
        }
      } else {
        stryCov_9fa48('3713')
        const paymentMethodRepository = getPaymentMethodRepository()

        // Use repository to get active payment methods
        const data = await paymentMethodRepository.findActive()
        if (
          stryMutAct_9fa48('3716')
            ? !data && data.length === 0
            : stryMutAct_9fa48('3715')
              ? false
              : stryMutAct_9fa48('3714')
                ? true
                : (stryCov_9fa48('3714', '3715', '3716'),
                  (stryMutAct_9fa48('3717') ? data : (stryCov_9fa48('3717'), !data)) ||
                    (stryMutAct_9fa48('3719')
                      ? data.length !== 0
                      : stryMutAct_9fa48('3718')
                        ? false
                        : (stryCov_9fa48('3718', '3719'), data.length === 0)))
        ) {
          if (stryMutAct_9fa48('3720')) {
            {
            }
          } else {
            stryCov_9fa48('3720')
            throw new NotFoundError(
              stryMutAct_9fa48('3721') ? '' : (stryCov_9fa48('3721'), 'Payment Methods'),
              stryMutAct_9fa48('3722') ? '' : (stryCov_9fa48('3722'), 'active'),
              stryMutAct_9fa48('3723')
                ? {}
                : (stryCov_9fa48('3723'),
                  {
                    active: stryMutAct_9fa48('3724') ? false : (stryCov_9fa48('3724'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3725')) {
        {
        }
      } else {
        stryCov_9fa48('3725')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('3728')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3727')
              ? false
              : stryMutAct_9fa48('3726')
                ? true
                : (stryCov_9fa48('3726', '3727', '3728'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3729') ? '' : (stryCov_9fa48('3729'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3730')) {
            {
            }
          } else {
            stryCov_9fa48('3730')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3731') ? '' : (stryCov_9fa48('3731'), 'getPaymentMethods failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Validate Venezuelan phone number format (FAIL-FAST version)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid Venezuelan format
 * @throws {ValidationError} When phone format is invalid
 * @example
 * isValidVenezuelanPhone('04141234567') // Returns: true
 * isValidVenezuelanPhone('584141234567') // Returns: true
 * isValidVenezuelanPhone('123456789') // Throws ValidationError
 */
export function isValidVenezuelanPhone(phone) {
  if (stryMutAct_9fa48('3732')) {
    {
    }
  } else {
    stryCov_9fa48('3732')
    try {
      if (stryMutAct_9fa48('3733')) {
        {
        }
      } else {
        stryCov_9fa48('3733')
        validateVenezuelanPhone(phone)
        return stryMutAct_9fa48('3734') ? false : (stryCov_9fa48('3734'), true)
      }
    } catch (error) {
      if (stryMutAct_9fa48('3735')) {
        {
        }
      } else {
        stryCov_9fa48('3735')
        console.error(error)
        return stryMutAct_9fa48('3736') ? true : (stryCov_9fa48('3736'), false)
      }
    }
  }
}

/**
 * Validate email format using regex pattern (FAIL-FAST version)
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email format is valid
 * @throws {ValidationError} When email format is invalid
 * @example
 * isValidEmail('user@example.com') // Returns: true
 * isValidEmail('invalid-email') // Returns: false
 */
export function isValidEmail(email) {
  if (stryMutAct_9fa48('3737')) {
    {
    }
  } else {
    stryCov_9fa48('3737')
    try {
      if (stryMutAct_9fa48('3738')) {
        {
        }
      } else {
        stryCov_9fa48('3738')
        validateEmail(email)
        return stryMutAct_9fa48('3739') ? false : (stryCov_9fa48('3739'), true)
      }
    } catch (error) {
      if (stryMutAct_9fa48('3740')) {
        {
        }
      } else {
        stryCov_9fa48('3740')
        console.error(error)
        return stryMutAct_9fa48('3741') ? true : (stryCov_9fa48('3741'), false)
      }
    }
  }
}

/**
 * Generate unique order reference with timestamp and random component
 * @returns {string} - Unique order reference in format FY-{timestamp}{random}
 * @example
 * generateOrderReference() // Returns: 'FY-123456789'
 */
export function generateOrderReference() {
  if (stryMutAct_9fa48('3742')) {
    {
    }
  } else {
    stryCov_9fa48('3742')
    const timestamp = stryMutAct_9fa48('3743')
      ? Date.now().toString()
      : (stryCov_9fa48('3743'),
        Date.now()
          .toString()
          .slice(stryMutAct_9fa48('3744') ? +6 : (stryCov_9fa48('3744'), -6)))
    const random = Math.floor(
      stryMutAct_9fa48('3745')
        ? Math.random() / 1000
        : (stryCov_9fa48('3745'), Math.random() * 1000)
    )
      .toString()
      .padStart(3, stryMutAct_9fa48('3746') ? '' : (stryCov_9fa48('3746'), '0'))
    return stryMutAct_9fa48('3747') ? `` : (stryCov_9fa48('3747'), `FY-${timestamp}${random}`)
  }
}

/**
 * Get delivery cost from settings (FAIL-FAST - no fallback)
 * @returns {number} Delivery cost in USD
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If delivery cost setting is not found
 * @throws {ValidationError} If delivery cost value is invalid
 * @example
 * const cost = await getDeliveryCost() // Returns configured value or throws error
 */
export async function getDeliveryCost() {
  if (stryMutAct_9fa48('3748')) {
    {
    }
  } else {
    stryCov_9fa48('3748')
    try {
      if (stryMutAct_9fa48('3749')) {
        {
        }
      } else {
        stryCov_9fa48('3749')
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findByKey(
          stryMutAct_9fa48('3750') ? '' : (stryCov_9fa48('3750'), 'DELIVERY_COST_USD')
        )
        if (
          stryMutAct_9fa48('3753')
            ? false
            : stryMutAct_9fa48('3752')
              ? true
              : stryMutAct_9fa48('3751')
                ? data
                : (stryCov_9fa48('3751', '3752', '3753'), !data)
        ) {
          if (stryMutAct_9fa48('3754')) {
            {
            }
          } else {
            stryCov_9fa48('3754')
            throw new NotFoundError(
              stryMutAct_9fa48('3755') ? '' : (stryCov_9fa48('3755'), 'Setting'),
              stryMutAct_9fa48('3756') ? '' : (stryCov_9fa48('3756'), 'DELIVERY_COST_USD'),
              stryMutAct_9fa48('3757')
                ? {}
                : (stryCov_9fa48('3757'),
                  {
                    key: stryMutAct_9fa48('3758')
                      ? ''
                      : (stryCov_9fa48('3758'), 'DELIVERY_COST_USD')
                  })
            )
          }
        }
        const cost = parseFloat(data.value)
        if (
          stryMutAct_9fa48('3761')
            ? isNaN(cost) && cost < 0
            : stryMutAct_9fa48('3760')
              ? false
              : stryMutAct_9fa48('3759')
                ? true
                : (stryCov_9fa48('3759', '3760', '3761'),
                  isNaN(cost) ||
                    (stryMutAct_9fa48('3764')
                      ? cost >= 0
                      : stryMutAct_9fa48('3763')
                        ? cost <= 0
                        : stryMutAct_9fa48('3762')
                          ? false
                          : (stryCov_9fa48('3762', '3763', '3764'), cost < 0)))
        ) {
          if (stryMutAct_9fa48('3765')) {
            {
            }
          } else {
            stryCov_9fa48('3765')
            throw new ValidationError(
              stryMutAct_9fa48('3766')
                ? ''
                : (stryCov_9fa48('3766'), 'Invalid delivery cost value'),
              stryMutAct_9fa48('3767')
                ? {}
                : (stryCov_9fa48('3767'),
                  {
                    key: stryMutAct_9fa48('3768')
                      ? ''
                      : (stryCov_9fa48('3768'), 'DELIVERY_COST_USD'),
                    value: data.value,
                    rule: stryMutAct_9fa48('3769')
                      ? ''
                      : (stryCov_9fa48('3769'), 'must be a non-negative number')
                  })
            )
          }
        }
        return cost
      }
    } catch (error) {
      if (stryMutAct_9fa48('3770')) {
        {
        }
      } else {
        stryCov_9fa48('3770')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('3773')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3772')
              ? false
              : stryMutAct_9fa48('3771')
                ? true
                : (stryCov_9fa48('3771', '3772', '3773'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3774') ? '' : (stryCov_9fa48('3774'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3775')) {
            {
            }
          } else {
            stryCov_9fa48('3775')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3776') ? '' : (stryCov_9fa48('3776'), 'getDeliveryCost failed:'),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3777') ? '' : (stryCov_9fa48('3777'), 'SELECT'),
          stryMutAct_9fa48('3778') ? '' : (stryCov_9fa48('3778'), 'settings'),
          error,
          stryMutAct_9fa48('3779')
            ? {}
            : (stryCov_9fa48('3779'),
              {
                key: stryMutAct_9fa48('3780') ? '' : (stryCov_9fa48('3780'), 'DELIVERY_COST_USD')
              })
        )
      }
    }
  }
}

/**
 * Get BCV exchange rate from settings (FAIL-FAST - no fallback)
 * @returns {number} BCV rate (USD to VES)
 * @throws {DatabaseError} If settings query fails
 * @throws {NotFoundError} If BCV rate setting is not found
 * @throws {ValidationError} If BCV rate value is invalid
 * @example
 * const rate = await getBCVRate() // Returns configured value or throws error
 */
export async function getBCVRate() {
  if (stryMutAct_9fa48('3781')) {
    {
    }
  } else {
    stryCov_9fa48('3781')
    try {
      if (stryMutAct_9fa48('3782')) {
        {
        }
      } else {
        stryCov_9fa48('3782')
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findByKey(
          stryMutAct_9fa48('3783') ? '' : (stryCov_9fa48('3783'), 'bcv_usd_rate')
        )
        if (
          stryMutAct_9fa48('3786')
            ? false
            : stryMutAct_9fa48('3785')
              ? true
              : stryMutAct_9fa48('3784')
                ? data
                : (stryCov_9fa48('3784', '3785', '3786'), !data)
        ) {
          if (stryMutAct_9fa48('3787')) {
            {
            }
          } else {
            stryCov_9fa48('3787')
            throw new NotFoundError(
              stryMutAct_9fa48('3788') ? '' : (stryCov_9fa48('3788'), 'Setting'),
              stryMutAct_9fa48('3789') ? '' : (stryCov_9fa48('3789'), 'bcv_usd_rate'),
              stryMutAct_9fa48('3790')
                ? {}
                : (stryCov_9fa48('3790'),
                  {
                    key: stryMutAct_9fa48('3791') ? '' : (stryCov_9fa48('3791'), 'bcv_usd_rate')
                  })
            )
          }
        }
        const rate = parseFloat(data.value)
        if (
          stryMutAct_9fa48('3794')
            ? isNaN(rate) && rate <= 0
            : stryMutAct_9fa48('3793')
              ? false
              : stryMutAct_9fa48('3792')
                ? true
                : (stryCov_9fa48('3792', '3793', '3794'),
                  isNaN(rate) ||
                    (stryMutAct_9fa48('3797')
                      ? rate > 0
                      : stryMutAct_9fa48('3796')
                        ? rate < 0
                        : stryMutAct_9fa48('3795')
                          ? false
                          : (stryCov_9fa48('3795', '3796', '3797'), rate <= 0)))
        ) {
          if (stryMutAct_9fa48('3798')) {
            {
            }
          } else {
            stryCov_9fa48('3798')
            throw new ValidationError(
              stryMutAct_9fa48('3799') ? '' : (stryCov_9fa48('3799'), 'Invalid BCV rate value'),
              stryMutAct_9fa48('3800')
                ? {}
                : (stryCov_9fa48('3800'),
                  {
                    key: stryMutAct_9fa48('3801') ? '' : (stryCov_9fa48('3801'), 'bcv_usd_rate'),
                    value: data.value,
                    rule: stryMutAct_9fa48('3802')
                      ? ''
                      : (stryCov_9fa48('3802'), 'must be a positive number')
                  })
            )
          }
        }
        return rate
      }
    } catch (error) {
      if (stryMutAct_9fa48('3803')) {
        {
        }
      } else {
        stryCov_9fa48('3803')
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('3806')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3805')
              ? false
              : stryMutAct_9fa48('3804')
                ? true
                : (stryCov_9fa48('3804', '3805', '3806'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3807') ? '' : (stryCov_9fa48('3807'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3808')) {
            {
            }
          } else {
            stryCov_9fa48('3808')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3809') ? '' : (stryCov_9fa48('3809'), 'getBCVRate failed:'),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3810') ? '' : (stryCov_9fa48('3810'), 'SELECT'),
          stryMutAct_9fa48('3811') ? '' : (stryCov_9fa48('3811'), 'settings'),
          error,
          stryMutAct_9fa48('3812')
            ? {}
            : (stryCov_9fa48('3812'),
              {
                key: stryMutAct_9fa48('3813') ? '' : (stryCov_9fa48('3813'), 'bcv_usd_rate')
              })
        )
      }
    }
  }
}

/**
 * Confirm payment for an order - creates a payment record with the provided details
 * @param {number} orderId - Order ID to confirm payment for
 * @param {Object} paymentData - Payment confirmation data
 * @param {string} paymentData.payment_method - Payment method code (e.g., 'cash', 'mobile_payment')
 * @param {string} paymentData.reference_number - Payment reference number
 * @param {string} [paymentData.payment_details] - Additional payment details
 * @param {string} [paymentData.receipt_image_url] - Receipt image URL
 * @param {number} [paymentData.confirmed_by] - User ID who confirmed the payment
 * @returns {Object} - Created payment record
 * @throws {BadRequestError} When orderId or payment data is invalid
 * @throws {ValidationError} When payment method or reference is missing
 * @throws {NotFoundError} When order or payment method is not found
 * @throws {DatabaseError} When payment record creation fails
 * @example
 * const payment = await confirmPayment(123, {
 *   payment_method: 'mobile_payment',
 *   reference_number: 'REF123456',
 *   payment_details: 'Pago móvil desde Banco XYZ',
 *   confirmed_by: 456
 * })
 */
export async function confirmPayment(orderId, paymentData) {
  if (stryMutAct_9fa48('3814')) {
    {
    }
  } else {
    stryCov_9fa48('3814')
    try {
      if (stryMutAct_9fa48('3815')) {
        {
        }
      } else {
        stryCov_9fa48('3815')
        if (
          stryMutAct_9fa48('3818')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3817')
              ? false
              : stryMutAct_9fa48('3816')
                ? true
                : (stryCov_9fa48('3816', '3817', '3818'),
                  (stryMutAct_9fa48('3819') ? orderId : (stryCov_9fa48('3819'), !orderId)) ||
                    (stryMutAct_9fa48('3821')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3820')
                        ? false
                        : (stryCov_9fa48('3820', '3821'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3822') ? '' : (stryCov_9fa48('3822'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3823')) {
            {
            }
          } else {
            stryCov_9fa48('3823')
            throw new BadRequestError(
              stryMutAct_9fa48('3824') ? '' : (stryCov_9fa48('3824'), 'Invalid order ID'),
              stryMutAct_9fa48('3825')
                ? {}
                : (stryCov_9fa48('3825'),
                  {
                    orderId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3828')
            ? false
            : stryMutAct_9fa48('3827')
              ? true
              : stryMutAct_9fa48('3826')
                ? paymentData.payment_method
                : (stryCov_9fa48('3826', '3827', '3828'), !paymentData.payment_method)
        ) {
          if (stryMutAct_9fa48('3829')) {
            {
            }
          } else {
            stryCov_9fa48('3829')
            throw new ValidationError(
              stryMutAct_9fa48('3830') ? '' : (stryCov_9fa48('3830'), 'Payment method is required'),
              stryMutAct_9fa48('3831')
                ? {}
                : (stryCov_9fa48('3831'),
                  {
                    orderId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3834')
            ? false
            : stryMutAct_9fa48('3833')
              ? true
              : stryMutAct_9fa48('3832')
                ? paymentData.reference_number
                : (stryCov_9fa48('3832', '3833', '3834'), !paymentData.reference_number)
        ) {
          if (stryMutAct_9fa48('3835')) {
            {
            }
          } else {
            stryCov_9fa48('3835')
            throw new ValidationError(
              stryMutAct_9fa48('3836')
                ? ''
                : (stryCov_9fa48('3836'), 'Reference number is required'),
              stryMutAct_9fa48('3837')
                ? {}
                : (stryCov_9fa48('3837'),
                  {
                    orderId
                  })
            )
          }
        }

        // Get payment method details using repository
        const paymentMethodRepository = getPaymentMethodRepository()
        const methods = await paymentMethodRepository.findAllWithFilters(
          stryMutAct_9fa48('3838')
            ? {}
            : (stryCov_9fa48('3838'),
              {
                type: paymentData.payment_method,
                active: stryMutAct_9fa48('3839') ? false : (stryCov_9fa48('3839'), true)
              }),
          stryMutAct_9fa48('3840')
            ? {}
            : (stryCov_9fa48('3840'),
              {
                limit: 1
              })
        )
        if (
          stryMutAct_9fa48('3843')
            ? !methods && methods.length === 0
            : stryMutAct_9fa48('3842')
              ? false
              : stryMutAct_9fa48('3841')
                ? true
                : (stryCov_9fa48('3841', '3842', '3843'),
                  (stryMutAct_9fa48('3844') ? methods : (stryCov_9fa48('3844'), !methods)) ||
                    (stryMutAct_9fa48('3846')
                      ? methods.length !== 0
                      : stryMutAct_9fa48('3845')
                        ? false
                        : (stryCov_9fa48('3845', '3846'), methods.length === 0)))
        ) {
          if (stryMutAct_9fa48('3847')) {
            {
            }
          } else {
            stryCov_9fa48('3847')
            throw new NotFoundError(
              stryMutAct_9fa48('3848') ? '' : (stryCov_9fa48('3848'), 'Payment Method'),
              paymentData.payment_method
            )
          }
        }
        const method = methods[0]

        // Get order to validate and get amount using repository
        const orderRepository = getOrderRepository()
        const order = await orderRepository.findByIdWithItems(orderId)
        if (
          stryMutAct_9fa48('3851')
            ? false
            : stryMutAct_9fa48('3850')
              ? true
              : stryMutAct_9fa48('3849')
                ? order
                : (stryCov_9fa48('3849', '3850', '3851'), !order)
        ) {
          if (stryMutAct_9fa48('3852')) {
            {
            }
          } else {
            stryCov_9fa48('3852')
            throw new NotFoundError(
              stryMutAct_9fa48('3853') ? '' : (stryCov_9fa48('3853'), 'Order'),
              orderId
            )
          }
        }

        // Create payment record using repository
        const payment = stryMutAct_9fa48('3854')
          ? {}
          : (stryCov_9fa48('3854'),
            {
              order_id: orderId,
              payment_method_id: method.id,
              payment_method_name: method.name,
              amount_usd: order.total_amount_usd,
              amount_ves: order.total_amount_ves,
              currency_rate: order.currency_rate,
              reference_number: paymentData.reference_number,
              payment_details: stryMutAct_9fa48('3857')
                ? paymentData.payment_details && null
                : stryMutAct_9fa48('3856')
                  ? false
                  : stryMutAct_9fa48('3855')
                    ? true
                    : (stryCov_9fa48('3855', '3856', '3857'), paymentData.payment_details || null),
              receipt_image_url: stryMutAct_9fa48('3860')
                ? paymentData.receipt_image_url && null
                : stryMutAct_9fa48('3859')
                  ? false
                  : stryMutAct_9fa48('3858')
                    ? true
                    : (stryCov_9fa48('3858', '3859', '3860'),
                      paymentData.receipt_image_url || null),
              status: stryMutAct_9fa48('3861') ? '' : (stryCov_9fa48('3861'), 'pending'),
              user_id: stryMutAct_9fa48('3864')
                ? paymentData.confirmed_by && null
                : stryMutAct_9fa48('3863')
                  ? false
                  : stryMutAct_9fa48('3862')
                    ? true
                    : (stryCov_9fa48('3862', '3863', '3864'), paymentData.confirmed_by || null),
              payment_date: new Date().toISOString()
            })
        const paymentRepository = getPaymentRepository()
        const data = await paymentRepository.create(payment)
        if (
          stryMutAct_9fa48('3867')
            ? false
            : stryMutAct_9fa48('3866')
              ? true
              : stryMutAct_9fa48('3865')
                ? data
                : (stryCov_9fa48('3865', '3866', '3867'), !data)
        ) {
          if (stryMutAct_9fa48('3868')) {
            {
            }
          } else {
            stryCov_9fa48('3868')
            throw new DatabaseError(
              stryMutAct_9fa48('3869') ? '' : (stryCov_9fa48('3869'), 'INSERT'),
              stryMutAct_9fa48('3870') ? '' : (stryCov_9fa48('3870'), 'payments'),
              new InternalServerError(
                stryMutAct_9fa48('3871') ? '' : (stryCov_9fa48('3871'), 'No data returned')
              ),
              stryMutAct_9fa48('3872')
                ? {}
                : (stryCov_9fa48('3872'),
                  {
                    orderId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3873')) {
        {
        }
      } else {
        stryCov_9fa48('3873')
        if (
          stryMutAct_9fa48('3876')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3875')
              ? false
              : stryMutAct_9fa48('3874')
                ? true
                : (stryCov_9fa48('3874', '3875', '3876'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3877') ? '' : (stryCov_9fa48('3877'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3878')) {
            {
            }
          } else {
            stryCov_9fa48('3878')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3879')
            ? ``
            : (stryCov_9fa48('3879'), `confirmPayment(${orderId}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3880') ? '' : (stryCov_9fa48('3880'), 'INSERT'),
          stryMutAct_9fa48('3881') ? '' : (stryCov_9fa48('3881'), 'payments'),
          error,
          stryMutAct_9fa48('3882')
            ? {}
            : (stryCov_9fa48('3882'),
              {
                orderId
              })
        )
      }
    }
  }
}

/**
 * Get payments for an order - retrieves all payment records for a specific order
 * @param {number} orderId - Order ID to get payments for
 * @returns {Object[]} - Array of payment records ordered by creation date (newest first)
 * @throws {BadRequestError} When orderId is invalid
 * @throws {NotFoundError} When order or payments are not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const payments = await getOrderPayments(123)
 * // Returns: [{ id: 1, order_id: 123, payment_method_name: 'Pago Móvil', amount_usd: 45.99, ... }]
 */
export async function getOrderPayments(orderId) {
  if (stryMutAct_9fa48('3883')) {
    {
    }
  } else {
    stryCov_9fa48('3883')
    try {
      if (stryMutAct_9fa48('3884')) {
        {
        }
      } else {
        stryCov_9fa48('3884')
        if (
          stryMutAct_9fa48('3887')
            ? !orderId && typeof orderId !== 'number'
            : stryMutAct_9fa48('3886')
              ? false
              : stryMutAct_9fa48('3885')
                ? true
                : (stryCov_9fa48('3885', '3886', '3887'),
                  (stryMutAct_9fa48('3888') ? orderId : (stryCov_9fa48('3888'), !orderId)) ||
                    (stryMutAct_9fa48('3890')
                      ? typeof orderId === 'number'
                      : stryMutAct_9fa48('3889')
                        ? false
                        : (stryCov_9fa48('3889', '3890'),
                          typeof orderId !==
                            (stryMutAct_9fa48('3891') ? '' : (stryCov_9fa48('3891'), 'number')))))
        ) {
          if (stryMutAct_9fa48('3892')) {
            {
            }
          } else {
            stryCov_9fa48('3892')
            throw new BadRequestError(
              stryMutAct_9fa48('3893') ? '' : (stryCov_9fa48('3893'), 'Invalid order ID'),
              stryMutAct_9fa48('3894')
                ? {}
                : (stryCov_9fa48('3894'),
                  {
                    orderId
                  })
            )
          }
        }
        const paymentRepository = getPaymentRepository()
        const data = await paymentRepository.findByOrderId(orderId)
        if (
          stryMutAct_9fa48('3897')
            ? !data && data.length === 0
            : stryMutAct_9fa48('3896')
              ? false
              : stryMutAct_9fa48('3895')
                ? true
                : (stryCov_9fa48('3895', '3896', '3897'),
                  (stryMutAct_9fa48('3898') ? data : (stryCov_9fa48('3898'), !data)) ||
                    (stryMutAct_9fa48('3900')
                      ? data.length !== 0
                      : stryMutAct_9fa48('3899')
                        ? false
                        : (stryCov_9fa48('3899', '3900'), data.length === 0)))
        ) {
          if (stryMutAct_9fa48('3901')) {
            {
            }
          } else {
            stryCov_9fa48('3901')
            throw new NotFoundError(
              stryMutAct_9fa48('3902') ? '' : (stryCov_9fa48('3902'), 'Payments for order'),
              orderId
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3903')) {
        {
        }
      } else {
        stryCov_9fa48('3903')
        if (
          stryMutAct_9fa48('3906')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3905')
              ? false
              : stryMutAct_9fa48('3904')
                ? true
                : (stryCov_9fa48('3904', '3905', '3906'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3907') ? '' : (stryCov_9fa48('3907'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3908')) {
            {
            }
          } else {
            stryCov_9fa48('3908')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3909')
            ? ``
            : (stryCov_9fa48('3909'), `getOrderPayments(${orderId}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3910') ? '' : (stryCov_9fa48('3910'), 'SELECT'),
          stryMutAct_9fa48('3911') ? '' : (stryCov_9fa48('3911'), 'payments'),
          error,
          stryMutAct_9fa48('3912')
            ? {}
            : (stryCov_9fa48('3912'),
              {
                orderId
              })
        )
      }
    }
  }
}
