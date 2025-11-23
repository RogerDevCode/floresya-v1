/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Payment Method Service
 * Full CRUD operations for payment method management in Venezuela
 * Uses indexed columns for optimized queries
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses PaymentMethodRepository for data access
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
  NotFoundError,
  DatabaseError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { validatePaymentMethod } from '../utils/validation.js'

/**
 * Get PaymentMethodRepository instance from DI Container
 * @returns {PaymentMethodRepository} Repository instance
 */
function getPaymentMethodRepository() {
  if (stryMutAct_9fa48('3393')) {
    {
    }
  } else {
    stryCov_9fa48('3393')
    return DIContainer.resolve(
      stryMutAct_9fa48('3394') ? '' : (stryCov_9fa48('3394'), 'PaymentMethodRepository')
    )
  }
}

/**
 * Get all payment methods with filters - returns active methods ordered by display_order
 * @param {Object} [filters={}] - Filter options
 * @param {number} [filters.limit] - Maximum number of payment methods to return
 * @param {boolean} includeDeactivated - Include inactive payment methods (default: false, admin only)
 * @returns {Object[]} - Array of payment methods ordered by display_order
 * @throws {NotFoundError} When no payment methods are found
 * @throws {DatabaseError} When database query fails
 */
export async function getAllPaymentMethods(
  filters = {},
  includeDeactivated = stryMutAct_9fa48('3395') ? true : (stryCov_9fa48('3395'), false)
) {
  if (stryMutAct_9fa48('3396')) {
    {
    }
  } else {
    stryCov_9fa48('3396')
    const paymentMethodRepository = getPaymentMethodRepository()
    const data = await paymentMethodRepository.findAllWithFilters(
      stryMutAct_9fa48('3397')
        ? {}
        : (stryCov_9fa48('3397'),
          {
            ...filters,
            includeDeactivated
          }),
      stryMutAct_9fa48('3398')
        ? {}
        : (stryCov_9fa48('3398'),
          {
            orderBy: stryMutAct_9fa48('3399') ? '' : (stryCov_9fa48('3399'), 'display_order'),
            ascending: stryMutAct_9fa48('3400') ? false : (stryCov_9fa48('3400'), true),
            limit: filters.limit
          })
    )
    if (
      stryMutAct_9fa48('3403')
        ? !data && data.length === 0
        : stryMutAct_9fa48('3402')
          ? false
          : stryMutAct_9fa48('3401')
            ? true
            : (stryCov_9fa48('3401', '3402', '3403'),
              (stryMutAct_9fa48('3404') ? data : (stryCov_9fa48('3404'), !data)) ||
                (stryMutAct_9fa48('3406')
                  ? data.length !== 0
                  : stryMutAct_9fa48('3405')
                    ? false
                    : (stryCov_9fa48('3405', '3406'), data.length === 0)))
    ) {
      if (stryMutAct_9fa48('3407')) {
        {
        }
      } else {
        stryCov_9fa48('3407')
        throw new NotFoundError(
          stryMutAct_9fa48('3408') ? '' : (stryCov_9fa48('3408'), 'Payment methods')
        )
      }
    }
    return data
  }
}

/**
 * Get payment method by ID
 * @param {number} id - Payment method ID to retrieve
 * @param {boolean} includeDeactivated - Include inactive payment methods (default: false, admin only)
 * @returns {Object} - Payment method object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getPaymentMethodById(
  id,
  includeDeactivated = stryMutAct_9fa48('3409') ? true : (stryCov_9fa48('3409'), false)
) {
  if (stryMutAct_9fa48('3410')) {
    {
    }
  } else {
    stryCov_9fa48('3410')
    if (
      stryMutAct_9fa48('3413')
        ? (!id || typeof id !== 'number') && id <= 0
        : stryMutAct_9fa48('3412')
          ? false
          : stryMutAct_9fa48('3411')
            ? true
            : (stryCov_9fa48('3411', '3412', '3413'),
              (stryMutAct_9fa48('3415')
                ? !id && typeof id !== 'number'
                : stryMutAct_9fa48('3414')
                  ? false
                  : (stryCov_9fa48('3414', '3415'),
                    (stryMutAct_9fa48('3416') ? id : (stryCov_9fa48('3416'), !id)) ||
                      (stryMutAct_9fa48('3418')
                        ? typeof id === 'number'
                        : stryMutAct_9fa48('3417')
                          ? false
                          : (stryCov_9fa48('3417', '3418'),
                            typeof id !==
                              (stryMutAct_9fa48('3419')
                                ? ''
                                : (stryCov_9fa48('3419'), 'number')))))) ||
                (stryMutAct_9fa48('3422')
                  ? id > 0
                  : stryMutAct_9fa48('3421')
                    ? id < 0
                    : stryMutAct_9fa48('3420')
                      ? false
                      : (stryCov_9fa48('3420', '3421', '3422'), id <= 0)))
    ) {
      if (stryMutAct_9fa48('3423')) {
        {
        }
      } else {
        stryCov_9fa48('3423')
        throw new BadRequestError(
          stryMutAct_9fa48('3424')
            ? ''
            : (stryCov_9fa48('3424'), 'Invalid payment method ID: must be a positive number'),
          stryMutAct_9fa48('3425')
            ? {}
            : (stryCov_9fa48('3425'),
              {
                paymentMethodId: id
              })
        )
      }
    }
    const paymentMethodRepository = getPaymentMethodRepository()
    const data = await paymentMethodRepository.findById(id, includeDeactivated)
    if (
      stryMutAct_9fa48('3428')
        ? false
        : stryMutAct_9fa48('3427')
          ? true
          : stryMutAct_9fa48('3426')
            ? data
            : (stryCov_9fa48('3426', '3427', '3428'), !data)
    ) {
      if (stryMutAct_9fa48('3429')) {
        {
        }
      } else {
        stryCov_9fa48('3429')
        throw new NotFoundError(
          stryMutAct_9fa48('3430') ? '' : (stryCov_9fa48('3430'), 'Payment method'),
          id,
          stryMutAct_9fa48('3431')
            ? {}
            : (stryCov_9fa48('3431'),
              {
                includeDeactivated
              })
        )
      }
    }
    return data
  }
}

/**
 * Create new payment method
 * @param {Object} paymentMethodData - Payment method data to create
 * @param {string} paymentMethodData.name - Payment method name (required)
 * @param {string} paymentMethodData.type - Payment method type (required, must be valid enum value)
 * @param {string} [paymentMethodData.description] - Payment method description
 * @param {string} [paymentMethodData.account_info] - Account information for the payment method
 * @param {number} [paymentMethodData.display_order=0] - Display order for sorting
 * @returns {Object} - Created payment method
 * @throws {ValidationError} When payment method data is invalid
 * @throws {DatabaseConstraintError} When payment method violates database constraints (e.g., duplicate name)
 * @throws {DatabaseError} When database insert fails
 */
export async function createPaymentMethod(paymentMethodData) {
  if (stryMutAct_9fa48('3432')) {
    {
    }
  } else {
    stryCov_9fa48('3432')
    try {
      if (stryMutAct_9fa48('3433')) {
        {
        }
      } else {
        stryCov_9fa48('3433')
        validatePaymentMethod(
          paymentMethodData,
          stryMutAct_9fa48('3434') ? true : (stryCov_9fa48('3434'), false)
        )
        const newPaymentMethod = stryMutAct_9fa48('3435')
          ? {}
          : (stryCov_9fa48('3435'),
            {
              name: paymentMethodData.name,
              type: paymentMethodData.type,
              description: stryMutAct_9fa48('3438')
                ? paymentMethodData.description && null
                : stryMutAct_9fa48('3437')
                  ? false
                  : stryMutAct_9fa48('3436')
                    ? true
                    : (stryCov_9fa48('3436', '3437', '3438'),
                      paymentMethodData.description || null),
              account_info: stryMutAct_9fa48('3441')
                ? paymentMethodData.account_info && null
                : stryMutAct_9fa48('3440')
                  ? false
                  : stryMutAct_9fa48('3439')
                    ? true
                    : (stryCov_9fa48('3439', '3440', '3441'),
                      paymentMethodData.account_info || null),
              active: (
                stryMutAct_9fa48('3444')
                  ? paymentMethodData.active === undefined
                  : stryMutAct_9fa48('3443')
                    ? false
                    : stryMutAct_9fa48('3442')
                      ? true
                      : (stryCov_9fa48('3442', '3443', '3444'),
                        paymentMethodData.active !== undefined)
              )
                ? paymentMethodData.active
                : stryMutAct_9fa48('3445')
                  ? false
                  : (stryCov_9fa48('3445'), true),
              display_order: stryMutAct_9fa48('3448')
                ? paymentMethodData.display_order && 0
                : stryMutAct_9fa48('3447')
                  ? false
                  : stryMutAct_9fa48('3446')
                    ? true
                    : (stryCov_9fa48('3446', '3447', '3448'), paymentMethodData.display_order || 0)
            })
        const paymentMethodRepository = getPaymentMethodRepository()
        const data = await paymentMethodRepository.create(newPaymentMethod)
        if (
          stryMutAct_9fa48('3451')
            ? false
            : stryMutAct_9fa48('3450')
              ? true
              : stryMutAct_9fa48('3449')
                ? data
                : (stryCov_9fa48('3449', '3450', '3451'), !data)
        ) {
          if (stryMutAct_9fa48('3452')) {
            {
            }
          } else {
            stryCov_9fa48('3452')
            throw new DatabaseError(
              stryMutAct_9fa48('3453') ? '' : (stryCov_9fa48('3453'), 'INSERT'),
              stryMutAct_9fa48('3454') ? '' : (stryCov_9fa48('3454'), 'payment_methods'),
              new InternalServerError(
                stryMutAct_9fa48('3455')
                  ? ''
                  : (stryCov_9fa48('3455'), 'No data returned after insert')
              ),
              stryMutAct_9fa48('3456')
                ? {}
                : (stryCov_9fa48('3456'),
                  {
                    paymentMethodData: newPaymentMethod
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3457')) {
        {
        }
      } else {
        stryCov_9fa48('3457')
        if (
          stryMutAct_9fa48('3460')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3459')
              ? false
              : stryMutAct_9fa48('3458')
                ? true
                : (stryCov_9fa48('3458', '3459', '3460'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3461') ? '' : (stryCov_9fa48('3461'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3462')) {
            {
            }
          } else {
            stryCov_9fa48('3462')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3463') ? '' : (stryCov_9fa48('3463'), 'createPaymentMethod failed:'),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3464') ? '' : (stryCov_9fa48('3464'), 'INSERT'),
          stryMutAct_9fa48('3465') ? '' : (stryCov_9fa48('3465'), 'payment_methods'),
          error,
          stryMutAct_9fa48('3466')
            ? {}
            : (stryCov_9fa48('3466'),
              {
                paymentMethodData
              })
        )
      }
    }
  }
}

/**
 * Update payment method (limited fields) - only allows updating specific payment method fields
 * @param {number} id - Payment method ID to update
 * @param {Object} updates - Updated payment method data
 * @param {string} [updates.name] - Payment method name
 * @param {string} [updates.type] - Payment method type
 * @param {string} [updates.description] - Payment method description
 * @param {string} [updates.account_info] - Account information for the payment method
 * @param {boolean} [updates.active] - Whether the payment method is active
 * @param {number} [updates.display_order] - Display order for sorting
 * @returns {Object} - Updated payment method
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When payment method data is invalid
 * @throws {NotFoundError} When payment method is not found
 * @throws {DatabaseConstraintError} When payment method violates database constraints (e.g., duplicate name)
 * @throws {DatabaseError} When database update fails
 */
export async function updatePaymentMethod(id, updates) {
  if (stryMutAct_9fa48('3467')) {
    {
    }
  } else {
    stryCov_9fa48('3467')
    try {
      if (stryMutAct_9fa48('3468')) {
        {
        }
      } else {
        stryCov_9fa48('3468')
        if (
          stryMutAct_9fa48('3471')
            ? (!id || typeof id !== 'number') && id <= 0
            : stryMutAct_9fa48('3470')
              ? false
              : stryMutAct_9fa48('3469')
                ? true
                : (stryCov_9fa48('3469', '3470', '3471'),
                  (stryMutAct_9fa48('3473')
                    ? !id && typeof id !== 'number'
                    : stryMutAct_9fa48('3472')
                      ? false
                      : (stryCov_9fa48('3472', '3473'),
                        (stryMutAct_9fa48('3474') ? id : (stryCov_9fa48('3474'), !id)) ||
                          (stryMutAct_9fa48('3476')
                            ? typeof id === 'number'
                            : stryMutAct_9fa48('3475')
                              ? false
                              : (stryCov_9fa48('3475', '3476'),
                                typeof id !==
                                  (stryMutAct_9fa48('3477')
                                    ? ''
                                    : (stryCov_9fa48('3477'), 'number')))))) ||
                    (stryMutAct_9fa48('3480')
                      ? id > 0
                      : stryMutAct_9fa48('3479')
                        ? id < 0
                        : stryMutAct_9fa48('3478')
                          ? false
                          : (stryCov_9fa48('3478', '3479', '3480'), id <= 0)))
        ) {
          if (stryMutAct_9fa48('3481')) {
            {
            }
          } else {
            stryCov_9fa48('3481')
            throw new BadRequestError(
              stryMutAct_9fa48('3482')
                ? ''
                : (stryCov_9fa48('3482'), 'Invalid payment method ID: must be a positive number'),
              stryMutAct_9fa48('3483')
                ? {}
                : (stryCov_9fa48('3483'),
                  {
                    paymentMethodId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3486')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('3485')
              ? false
              : stryMutAct_9fa48('3484')
                ? true
                : (stryCov_9fa48('3484', '3485', '3486'),
                  (stryMutAct_9fa48('3487') ? updates : (stryCov_9fa48('3487'), !updates)) ||
                    (stryMutAct_9fa48('3489')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('3488')
                        ? false
                        : (stryCov_9fa48('3488', '3489'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('3490')) {
            {
            }
          } else {
            stryCov_9fa48('3490')
            throw new BadRequestError(
              stryMutAct_9fa48('3491') ? '' : (stryCov_9fa48('3491'), 'No updates provided'),
              stryMutAct_9fa48('3492')
                ? {}
                : (stryCov_9fa48('3492'),
                  {
                    paymentMethodId: id
                  })
            )
          }
        }
        validatePaymentMethod(
          updates,
          stryMutAct_9fa48('3493') ? false : (stryCov_9fa48('3493'), true)
        )
        const allowedFields = stryMutAct_9fa48('3494')
          ? []
          : (stryCov_9fa48('3494'),
            [
              stryMutAct_9fa48('3495') ? '' : (stryCov_9fa48('3495'), 'name'),
              stryMutAct_9fa48('3496') ? '' : (stryCov_9fa48('3496'), 'type'),
              stryMutAct_9fa48('3497') ? '' : (stryCov_9fa48('3497'), 'description'),
              stryMutAct_9fa48('3498') ? '' : (stryCov_9fa48('3498'), 'account_info'),
              stryMutAct_9fa48('3499') ? '' : (stryCov_9fa48('3499'), 'active'),
              stryMutAct_9fa48('3500') ? '' : (stryCov_9fa48('3500'), 'display_order')
            ])
        const sanitized = {}
        for (const key of allowedFields) {
          if (stryMutAct_9fa48('3501')) {
            {
            }
          } else {
            stryCov_9fa48('3501')
            if (
              stryMutAct_9fa48('3504')
                ? updates[key] === undefined
                : stryMutAct_9fa48('3503')
                  ? false
                  : stryMutAct_9fa48('3502')
                    ? true
                    : (stryCov_9fa48('3502', '3503', '3504'), updates[key] !== undefined)
            ) {
              if (stryMutAct_9fa48('3505')) {
                {
                }
              } else {
                stryCov_9fa48('3505')
                sanitized[key] = updates[key]
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('3508')
            ? Object.keys(sanitized).length !== 0
            : stryMutAct_9fa48('3507')
              ? false
              : stryMutAct_9fa48('3506')
                ? true
                : (stryCov_9fa48('3506', '3507', '3508'), Object.keys(sanitized).length === 0)
        ) {
          if (stryMutAct_9fa48('3509')) {
            {
            }
          } else {
            stryCov_9fa48('3509')
            throw new BadRequestError(
              stryMutAct_9fa48('3510') ? '' : (stryCov_9fa48('3510'), 'No valid fields to update'),
              stryMutAct_9fa48('3511')
                ? {}
                : (stryCov_9fa48('3511'),
                  {
                    paymentMethodId: id
                  })
            )
          }
        }
        const paymentMethodRepository = getPaymentMethodRepository()
        const data = await paymentMethodRepository.update(id, sanitized)
        if (
          stryMutAct_9fa48('3514')
            ? false
            : stryMutAct_9fa48('3513')
              ? true
              : stryMutAct_9fa48('3512')
                ? data
                : (stryCov_9fa48('3512', '3513', '3514'), !data)
        ) {
          if (stryMutAct_9fa48('3515')) {
            {
            }
          } else {
            stryCov_9fa48('3515')
            throw new NotFoundError(
              stryMutAct_9fa48('3516') ? '' : (stryCov_9fa48('3516'), 'Payment method'),
              id,
              stryMutAct_9fa48('3517')
                ? {}
                : (stryCov_9fa48('3517'),
                  {
                    active: stryMutAct_9fa48('3518') ? false : (stryCov_9fa48('3518'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3519')) {
        {
        }
      } else {
        stryCov_9fa48('3519')
        if (
          stryMutAct_9fa48('3522')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3521')
              ? false
              : stryMutAct_9fa48('3520')
                ? true
                : (stryCov_9fa48('3520', '3521', '3522'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3523') ? '' : (stryCov_9fa48('3523'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3524')) {
            {
            }
          } else {
            stryCov_9fa48('3524')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3525')
            ? ``
            : (stryCov_9fa48('3525'), `updatePaymentMethod(${id}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3526') ? '' : (stryCov_9fa48('3526'), 'UPDATE'),
          stryMutAct_9fa48('3527') ? '' : (stryCov_9fa48('3527'), 'payment_methods'),
          error,
          stryMutAct_9fa48('3528')
            ? {}
            : (stryCov_9fa48('3528'),
              {
                paymentMethodId: id
              })
        )
      }
    }
  }
}

/**
 * Soft-delete payment method (reverse soft-delete)
 * @param {number} id - Payment method ID to delete
 * @returns {Object} - Deactivated payment method
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deletePaymentMethod(id) {
  if (stryMutAct_9fa48('3529')) {
    {
    }
  } else {
    stryCov_9fa48('3529')
    try {
      if (stryMutAct_9fa48('3530')) {
        {
        }
      } else {
        stryCov_9fa48('3530')
        if (
          stryMutAct_9fa48('3533')
            ? (!id || typeof id !== 'number') && id <= 0
            : stryMutAct_9fa48('3532')
              ? false
              : stryMutAct_9fa48('3531')
                ? true
                : (stryCov_9fa48('3531', '3532', '3533'),
                  (stryMutAct_9fa48('3535')
                    ? !id && typeof id !== 'number'
                    : stryMutAct_9fa48('3534')
                      ? false
                      : (stryCov_9fa48('3534', '3535'),
                        (stryMutAct_9fa48('3536') ? id : (stryCov_9fa48('3536'), !id)) ||
                          (stryMutAct_9fa48('3538')
                            ? typeof id === 'number'
                            : stryMutAct_9fa48('3537')
                              ? false
                              : (stryCov_9fa48('3537', '3538'),
                                typeof id !==
                                  (stryMutAct_9fa48('3539')
                                    ? ''
                                    : (stryCov_9fa48('3539'), 'number')))))) ||
                    (stryMutAct_9fa48('3542')
                      ? id > 0
                      : stryMutAct_9fa48('3541')
                        ? id < 0
                        : stryMutAct_9fa48('3540')
                          ? false
                          : (stryCov_9fa48('3540', '3541', '3542'), id <= 0)))
        ) {
          if (stryMutAct_9fa48('3543')) {
            {
            }
          } else {
            stryCov_9fa48('3543')
            throw new BadRequestError(
              stryMutAct_9fa48('3544')
                ? ''
                : (stryCov_9fa48('3544'), 'Invalid payment method ID: must be a positive number'),
              stryMutAct_9fa48('3545')
                ? {}
                : (stryCov_9fa48('3545'),
                  {
                    paymentMethodId: id
                  })
            )
          }
        }
        const paymentMethodRepository = getPaymentMethodRepository()
        const data = await paymentMethodRepository.update(
          id,
          stryMutAct_9fa48('3546')
            ? {}
            : (stryCov_9fa48('3546'),
              {
                active: stryMutAct_9fa48('3547') ? true : (stryCov_9fa48('3547'), false)
              })
        )
        if (
          stryMutAct_9fa48('3550')
            ? false
            : stryMutAct_9fa48('3549')
              ? true
              : stryMutAct_9fa48('3548')
                ? data
                : (stryCov_9fa48('3548', '3549', '3550'), !data)
        ) {
          if (stryMutAct_9fa48('3551')) {
            {
            }
          } else {
            stryCov_9fa48('3551')
            throw new NotFoundError(
              stryMutAct_9fa48('3552') ? '' : (stryCov_9fa48('3552'), 'Payment method'),
              id,
              stryMutAct_9fa48('3553')
                ? {}
                : (stryCov_9fa48('3553'),
                  {
                    active: stryMutAct_9fa48('3554') ? false : (stryCov_9fa48('3554'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3555')) {
        {
        }
      } else {
        stryCov_9fa48('3555')
        if (
          stryMutAct_9fa48('3558')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3557')
              ? false
              : stryMutAct_9fa48('3556')
                ? true
                : (stryCov_9fa48('3556', '3557', '3558'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3559') ? '' : (stryCov_9fa48('3559'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3560')) {
            {
            }
          } else {
            stryCov_9fa48('3560')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3561')
            ? ``
            : (stryCov_9fa48('3561'), `deletePaymentMethod(${id}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3562') ? '' : (stryCov_9fa48('3562'), 'UPDATE'),
          stryMutAct_9fa48('3563') ? '' : (stryCov_9fa48('3563'), 'payment_methods'),
          error,
          stryMutAct_9fa48('3564')
            ? {}
            : (stryCov_9fa48('3564'),
              {
                paymentMethodId: id
              })
        )
      }
    }
  }
}

/**
 * Reactivate payment method (reverse soft-delete)
 * @param {number} id - Payment method ID to reactivate
 * @returns {Object} - Reactivated payment method
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When payment method is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivatePaymentMethod(id) {
  if (stryMutAct_9fa48('3565')) {
    {
    }
  } else {
    stryCov_9fa48('3565')
    try {
      if (stryMutAct_9fa48('3566')) {
        {
        }
      } else {
        stryCov_9fa48('3566')
        if (
          stryMutAct_9fa48('3569')
            ? (!id || typeof id !== 'number') && id <= 0
            : stryMutAct_9fa48('3568')
              ? false
              : stryMutAct_9fa48('3567')
                ? true
                : (stryCov_9fa48('3567', '3568', '3569'),
                  (stryMutAct_9fa48('3571')
                    ? !id && typeof id !== 'number'
                    : stryMutAct_9fa48('3570')
                      ? false
                      : (stryCov_9fa48('3570', '3571'),
                        (stryMutAct_9fa48('3572') ? id : (stryCov_9fa48('3572'), !id)) ||
                          (stryMutAct_9fa48('3574')
                            ? typeof id === 'number'
                            : stryMutAct_9fa48('3573')
                              ? false
                              : (stryCov_9fa48('3573', '3574'),
                                typeof id !==
                                  (stryMutAct_9fa48('3575')
                                    ? ''
                                    : (stryCov_9fa48('3575'), 'number')))))) ||
                    (stryMutAct_9fa48('3578')
                      ? id > 0
                      : stryMutAct_9fa48('3577')
                        ? id < 0
                        : stryMutAct_9fa48('3576')
                          ? false
                          : (stryCov_9fa48('3576', '3577', '3578'), id <= 0)))
        ) {
          if (stryMutAct_9fa48('3579')) {
            {
            }
          } else {
            stryCov_9fa48('3579')
            throw new BadRequestError(
              stryMutAct_9fa48('3580')
                ? ''
                : (stryCov_9fa48('3580'), 'Invalid payment method ID: must be a positive number'),
              stryMutAct_9fa48('3581')
                ? {}
                : (stryCov_9fa48('3581'),
                  {
                    paymentMethodId: id
                  })
            )
          }
        }
        const paymentMethodRepository = getPaymentMethodRepository()
        const data = await paymentMethodRepository.update(
          id,
          stryMutAct_9fa48('3582')
            ? {}
            : (stryCov_9fa48('3582'),
              {
                active: stryMutAct_9fa48('3583') ? false : (stryCov_9fa48('3583'), true)
              })
        )
        if (
          stryMutAct_9fa48('3586')
            ? false
            : stryMutAct_9fa48('3585')
              ? true
              : stryMutAct_9fa48('3584')
                ? data
                : (stryCov_9fa48('3584', '3585', '3586'), !data)
        ) {
          if (stryMutAct_9fa48('3587')) {
            {
            }
          } else {
            stryCov_9fa48('3587')
            throw new NotFoundError(
              stryMutAct_9fa48('3588') ? '' : (stryCov_9fa48('3588'), 'Payment method'),
              id,
              stryMutAct_9fa48('3589')
                ? {}
                : (stryCov_9fa48('3589'),
                  {
                    active: stryMutAct_9fa48('3590') ? true : (stryCov_9fa48('3590'), false)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3591')) {
        {
        }
      } else {
        stryCov_9fa48('3591')
        if (
          stryMutAct_9fa48('3594')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3593')
              ? false
              : stryMutAct_9fa48('3592')
                ? true
                : (stryCov_9fa48('3592', '3593', '3594'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3595') ? '' : (stryCov_9fa48('3595'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3596')) {
            {
            }
          } else {
            stryCov_9fa48('3596')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3597')
            ? ``
            : (stryCov_9fa48('3597'), `reactivatePaymentMethod(${id}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3598') ? '' : (stryCov_9fa48('3598'), 'UPDATE'),
          stryMutAct_9fa48('3599') ? '' : (stryCov_9fa48('3599'), 'payment_methods'),
          error,
          stryMutAct_9fa48('3600')
            ? {}
            : (stryCov_9fa48('3600'),
              {
                paymentMethodId: id
              })
        )
      }
    }
  }
}

/**
 * Update display order for payment method sorting
 * @param {number} id - Payment method ID to update
 * @param {number} newOrder - New display order (must be non-negative)
 * @returns {Object} - Updated payment method
 * @throws {BadRequestError} When ID is invalid or newOrder is negative
 * @throws {NotFoundError} When payment method is not found or inactive
 * @throws {DatabaseError} When database update fails
 */
export async function updateDisplayOrder(id, newOrder) {
  if (stryMutAct_9fa48('3601')) {
    {
    }
  } else {
    stryCov_9fa48('3601')
    try {
      if (stryMutAct_9fa48('3602')) {
        {
        }
      } else {
        stryCov_9fa48('3602')
        if (
          stryMutAct_9fa48('3605')
            ? (!id || typeof id !== 'number') && id <= 0
            : stryMutAct_9fa48('3604')
              ? false
              : stryMutAct_9fa48('3603')
                ? true
                : (stryCov_9fa48('3603', '3604', '3605'),
                  (stryMutAct_9fa48('3607')
                    ? !id && typeof id !== 'number'
                    : stryMutAct_9fa48('3606')
                      ? false
                      : (stryCov_9fa48('3606', '3607'),
                        (stryMutAct_9fa48('3608') ? id : (stryCov_9fa48('3608'), !id)) ||
                          (stryMutAct_9fa48('3610')
                            ? typeof id === 'number'
                            : stryMutAct_9fa48('3609')
                              ? false
                              : (stryCov_9fa48('3609', '3610'),
                                typeof id !==
                                  (stryMutAct_9fa48('3611')
                                    ? ''
                                    : (stryCov_9fa48('3611'), 'number')))))) ||
                    (stryMutAct_9fa48('3614')
                      ? id > 0
                      : stryMutAct_9fa48('3613')
                        ? id < 0
                        : stryMutAct_9fa48('3612')
                          ? false
                          : (stryCov_9fa48('3612', '3613', '3614'), id <= 0)))
        ) {
          if (stryMutAct_9fa48('3615')) {
            {
            }
          } else {
            stryCov_9fa48('3615')
            throw new BadRequestError(
              stryMutAct_9fa48('3616')
                ? ''
                : (stryCov_9fa48('3616'), 'Invalid payment method ID: must be a positive number'),
              stryMutAct_9fa48('3617')
                ? {}
                : (stryCov_9fa48('3617'),
                  {
                    paymentMethodId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('3620')
            ? typeof newOrder !== 'number' && newOrder < 0
            : stryMutAct_9fa48('3619')
              ? false
              : stryMutAct_9fa48('3618')
                ? true
                : (stryCov_9fa48('3618', '3619', '3620'),
                  (stryMutAct_9fa48('3622')
                    ? typeof newOrder === 'number'
                    : stryMutAct_9fa48('3621')
                      ? false
                      : (stryCov_9fa48('3621', '3622'),
                        typeof newOrder !==
                          (stryMutAct_9fa48('3623') ? '' : (stryCov_9fa48('3623'), 'number')))) ||
                    (stryMutAct_9fa48('3626')
                      ? newOrder >= 0
                      : stryMutAct_9fa48('3625')
                        ? newOrder <= 0
                        : stryMutAct_9fa48('3624')
                          ? false
                          : (stryCov_9fa48('3624', '3625', '3626'), newOrder < 0)))
        ) {
          if (stryMutAct_9fa48('3627')) {
            {
            }
          } else {
            stryCov_9fa48('3627')
            throw new BadRequestError(
              stryMutAct_9fa48('3628')
                ? ''
                : (stryCov_9fa48('3628'), 'Invalid display_order: must be a non-negative number'),
              stryMutAct_9fa48('3629')
                ? {}
                : (stryCov_9fa48('3629'),
                  {
                    newOrder
                  })
            )
          }
        }
        const paymentMethodRepository = getPaymentMethodRepository()
        const data = await paymentMethodRepository.updateDisplayOrder(id, newOrder)
        if (
          stryMutAct_9fa48('3632')
            ? false
            : stryMutAct_9fa48('3631')
              ? true
              : stryMutAct_9fa48('3630')
                ? data
                : (stryCov_9fa48('3630', '3631', '3632'), !data)
        ) {
          if (stryMutAct_9fa48('3633')) {
            {
            }
          } else {
            stryCov_9fa48('3633')
            throw new NotFoundError(
              stryMutAct_9fa48('3634') ? '' : (stryCov_9fa48('3634'), 'Payment method'),
              id,
              stryMutAct_9fa48('3635')
                ? {}
                : (stryCov_9fa48('3635'),
                  {
                    active: stryMutAct_9fa48('3636') ? false : (stryCov_9fa48('3636'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('3637')) {
        {
        }
      } else {
        stryCov_9fa48('3637')
        if (
          stryMutAct_9fa48('3640')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('3639')
              ? false
              : stryMutAct_9fa48('3638')
                ? true
                : (stryCov_9fa48('3638', '3639', '3640'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('3641') ? '' : (stryCov_9fa48('3641'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('3642')) {
            {
            }
          } else {
            stryCov_9fa48('3642')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('3643')
            ? ``
            : (stryCov_9fa48('3643'), `updateDisplayOrder(${id}) failed:`),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('3644') ? '' : (stryCov_9fa48('3644'), 'UPDATE'),
          stryMutAct_9fa48('3645') ? '' : (stryCov_9fa48('3645'), 'payment_methods'),
          error,
          stryMutAct_9fa48('3646')
            ? {}
            : (stryCov_9fa48('3646'),
              {
                paymentMethodId: id
              })
        )
      }
    }
  }
}
