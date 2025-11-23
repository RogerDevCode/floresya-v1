/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Order Service - Create Operations
 * Handles order creation with items and atomic stored functions
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
  getProductRepository,
  VALID_STATUSES,
  ValidationError,
  NotFoundError,
  DatabaseError,
  InternalServerError
} from './orderService.helpers.js'
import { supabase } from './supabaseClient.js'
import { sanitizeOrderData, sanitizeOrderItemData } from '../utils/sanitize.js'
import { validateOrder } from '../utils/validation.js'

/**
 * Create order with items (uses atomic stored function)
 * Validates all items, checks stock, and creates order atomically
 * @param {Object} orderData - Order data
 * @param {Array} orderItems - Array of order items
 * @returns {Object} - Created order
 * @throws {ValidationError} When order or items are invalid
 * @throws {NotFoundError} When product is not found
 * @throws {DatabaseError} When database operation fails
 */
export async function createOrderWithItems(orderData, orderItems) {
  if (stryMutAct_9fa48('2518')) {
    {
    }
  } else {
    stryCov_9fa48('2518')
    try {
      if (stryMutAct_9fa48('2519')) {
        {
        }
      } else {
        stryCov_9fa48('2519')
        validateOrder(
          orderData,
          VALID_STATUSES,
          stryMutAct_9fa48('2520') ? true : (stryCov_9fa48('2520'), false)
        )
        if (
          stryMutAct_9fa48('2523')
            ? !Array.isArray(orderItems) && orderItems.length === 0
            : stryMutAct_9fa48('2522')
              ? false
              : stryMutAct_9fa48('2521')
                ? true
                : (stryCov_9fa48('2521', '2522', '2523'),
                  (stryMutAct_9fa48('2524')
                    ? Array.isArray(orderItems)
                    : (stryCov_9fa48('2524'), !Array.isArray(orderItems))) ||
                    (stryMutAct_9fa48('2526')
                      ? orderItems.length !== 0
                      : stryMutAct_9fa48('2525')
                        ? false
                        : (stryCov_9fa48('2525', '2526'), orderItems.length === 0)))
        ) {
          if (stryMutAct_9fa48('2527')) {
            {
            }
          } else {
            stryCov_9fa48('2527')
            throw new ValidationError(
              stryMutAct_9fa48('2528') ? '' : (stryCov_9fa48('2528'), 'Order validation failed'),
              stryMutAct_9fa48('2529')
                ? {}
                : (stryCov_9fa48('2529'),
                  {
                    orderItems: stryMutAct_9fa48('2530')
                      ? ''
                      : (stryCov_9fa48('2530'), 'must be a non-empty array')
                  })
            )
          }
        }

        // Validate each item and check stock
        for (const item of orderItems) {
          if (stryMutAct_9fa48('2531')) {
            {
            }
          } else {
            stryCov_9fa48('2531')
            // Convert string IDs to numbers if needed
            let productId = item.product_id
            if (
              stryMutAct_9fa48('2534')
                ? typeof productId !== 'string'
                : stryMutAct_9fa48('2533')
                  ? false
                  : stryMutAct_9fa48('2532')
                    ? true
                    : (stryCov_9fa48('2532', '2533', '2534'),
                      typeof productId ===
                        (stryMutAct_9fa48('2535') ? '' : (stryCov_9fa48('2535'), 'string')))
            ) {
              if (stryMutAct_9fa48('2536')) {
                {
                }
              } else {
                stryCov_9fa48('2536')
                productId = parseInt(productId, 10)
              }
            }
            if (
              stryMutAct_9fa48('2539')
                ? (!productId || typeof productId !== 'number') && isNaN(productId)
                : stryMutAct_9fa48('2538')
                  ? false
                  : stryMutAct_9fa48('2537')
                    ? true
                    : (stryCov_9fa48('2537', '2538', '2539'),
                      (stryMutAct_9fa48('2541')
                        ? !productId && typeof productId !== 'number'
                        : stryMutAct_9fa48('2540')
                          ? false
                          : (stryCov_9fa48('2540', '2541'),
                            (stryMutAct_9fa48('2542')
                              ? productId
                              : (stryCov_9fa48('2542'), !productId)) ||
                              (stryMutAct_9fa48('2544')
                                ? typeof productId === 'number'
                                : stryMutAct_9fa48('2543')
                                  ? false
                                  : (stryCov_9fa48('2543', '2544'),
                                    typeof productId !==
                                      (stryMutAct_9fa48('2545')
                                        ? ''
                                        : (stryCov_9fa48('2545'), 'number')))))) ||
                        isNaN(productId))
            ) {
              if (stryMutAct_9fa48('2546')) {
                {
                }
              } else {
                stryCov_9fa48('2546')
                throw new ValidationError(
                  stryMutAct_9fa48('2547')
                    ? ''
                    : (stryCov_9fa48('2547'), 'Order validation failed'),
                  stryMutAct_9fa48('2548')
                    ? {}
                    : (stryCov_9fa48('2548'),
                      {
                        'orderItems.product_id': stryMutAct_9fa48('2549')
                          ? ''
                          : (stryCov_9fa48('2549'), 'must be a number')
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('2552')
                ? !item.product_name && typeof item.product_name !== 'string'
                : stryMutAct_9fa48('2551')
                  ? false
                  : stryMutAct_9fa48('2550')
                    ? true
                    : (stryCov_9fa48('2550', '2551', '2552'),
                      (stryMutAct_9fa48('2553')
                        ? item.product_name
                        : (stryCov_9fa48('2553'), !item.product_name)) ||
                        (stryMutAct_9fa48('2555')
                          ? typeof item.product_name === 'string'
                          : stryMutAct_9fa48('2554')
                            ? false
                            : (stryCov_9fa48('2554', '2555'),
                              typeof item.product_name !==
                                (stryMutAct_9fa48('2556')
                                  ? ''
                                  : (stryCov_9fa48('2556'), 'string')))))
            ) {
              if (stryMutAct_9fa48('2557')) {
                {
                }
              } else {
                stryCov_9fa48('2557')
                throw new ValidationError(
                  stryMutAct_9fa48('2558')
                    ? ''
                    : (stryCov_9fa48('2558'), 'Order validation failed'),
                  stryMutAct_9fa48('2559')
                    ? {}
                    : (stryCov_9fa48('2559'),
                      {
                        'orderItems.product_name': stryMutAct_9fa48('2560')
                          ? ''
                          : (stryCov_9fa48('2560'), 'must be a string')
                      })
                )
              }
            }

            // Convert string quantities to numbers if needed
            let quantity = item.quantity
            if (
              stryMutAct_9fa48('2563')
                ? typeof quantity !== 'string'
                : stryMutAct_9fa48('2562')
                  ? false
                  : stryMutAct_9fa48('2561')
                    ? true
                    : (stryCov_9fa48('2561', '2562', '2563'),
                      typeof quantity ===
                        (stryMutAct_9fa48('2564') ? '' : (stryCov_9fa48('2564'), 'string')))
            ) {
              if (stryMutAct_9fa48('2565')) {
                {
                }
              } else {
                stryCov_9fa48('2565')
                quantity = parseInt(quantity, 10)
              }
            }
            if (
              stryMutAct_9fa48('2568')
                ? (!quantity || typeof quantity !== 'number' || isNaN(quantity)) && quantity <= 0
                : stryMutAct_9fa48('2567')
                  ? false
                  : stryMutAct_9fa48('2566')
                    ? true
                    : (stryCov_9fa48('2566', '2567', '2568'),
                      (stryMutAct_9fa48('2570')
                        ? (!quantity || typeof quantity !== 'number') && isNaN(quantity)
                        : stryMutAct_9fa48('2569')
                          ? false
                          : (stryCov_9fa48('2569', '2570'),
                            (stryMutAct_9fa48('2572')
                              ? !quantity && typeof quantity !== 'number'
                              : stryMutAct_9fa48('2571')
                                ? false
                                : (stryCov_9fa48('2571', '2572'),
                                  (stryMutAct_9fa48('2573')
                                    ? quantity
                                    : (stryCov_9fa48('2573'), !quantity)) ||
                                    (stryMutAct_9fa48('2575')
                                      ? typeof quantity === 'number'
                                      : stryMutAct_9fa48('2574')
                                        ? false
                                        : (stryCov_9fa48('2574', '2575'),
                                          typeof quantity !==
                                            (stryMutAct_9fa48('2576')
                                              ? ''
                                              : (stryCov_9fa48('2576'), 'number')))))) ||
                              isNaN(quantity))) ||
                        (stryMutAct_9fa48('2579')
                          ? quantity > 0
                          : stryMutAct_9fa48('2578')
                            ? quantity < 0
                            : stryMutAct_9fa48('2577')
                              ? false
                              : (stryCov_9fa48('2577', '2578', '2579'), quantity <= 0)))
            ) {
              if (stryMutAct_9fa48('2580')) {
                {
                }
              } else {
                stryCov_9fa48('2580')
                throw new ValidationError(
                  stryMutAct_9fa48('2581')
                    ? ''
                    : (stryCov_9fa48('2581'), 'Order validation failed'),
                  stryMutAct_9fa48('2582')
                    ? {}
                    : (stryCov_9fa48('2582'),
                      {
                        'orderItems.quantity': stryMutAct_9fa48('2583')
                          ? ''
                          : (stryCov_9fa48('2583'), 'must be positive')
                      })
                )
              }
            }

            // Convert string prices to numbers if needed
            let unitPriceUsd = item.unit_price_usd
            if (
              stryMutAct_9fa48('2586')
                ? typeof unitPriceUsd !== 'string'
                : stryMutAct_9fa48('2585')
                  ? false
                  : stryMutAct_9fa48('2584')
                    ? true
                    : (stryCov_9fa48('2584', '2585', '2586'),
                      typeof unitPriceUsd ===
                        (stryMutAct_9fa48('2587') ? '' : (stryCov_9fa48('2587'), 'string')))
            ) {
              if (stryMutAct_9fa48('2588')) {
                {
                }
              } else {
                stryCov_9fa48('2588')
                unitPriceUsd = parseFloat(unitPriceUsd)
              }
            }
            if (
              stryMutAct_9fa48('2591')
                ? (!unitPriceUsd || typeof unitPriceUsd !== 'number' || isNaN(unitPriceUsd)) &&
                  unitPriceUsd <= 0
                : stryMutAct_9fa48('2590')
                  ? false
                  : stryMutAct_9fa48('2589')
                    ? true
                    : (stryCov_9fa48('2589', '2590', '2591'),
                      (stryMutAct_9fa48('2593')
                        ? (!unitPriceUsd || typeof unitPriceUsd !== 'number') && isNaN(unitPriceUsd)
                        : stryMutAct_9fa48('2592')
                          ? false
                          : (stryCov_9fa48('2592', '2593'),
                            (stryMutAct_9fa48('2595')
                              ? !unitPriceUsd && typeof unitPriceUsd !== 'number'
                              : stryMutAct_9fa48('2594')
                                ? false
                                : (stryCov_9fa48('2594', '2595'),
                                  (stryMutAct_9fa48('2596')
                                    ? unitPriceUsd
                                    : (stryCov_9fa48('2596'), !unitPriceUsd)) ||
                                    (stryMutAct_9fa48('2598')
                                      ? typeof unitPriceUsd === 'number'
                                      : stryMutAct_9fa48('2597')
                                        ? false
                                        : (stryCov_9fa48('2597', '2598'),
                                          typeof unitPriceUsd !==
                                            (stryMutAct_9fa48('2599')
                                              ? ''
                                              : (stryCov_9fa48('2599'), 'number')))))) ||
                              isNaN(unitPriceUsd))) ||
                        (stryMutAct_9fa48('2602')
                          ? unitPriceUsd > 0
                          : stryMutAct_9fa48('2601')
                            ? unitPriceUsd < 0
                            : stryMutAct_9fa48('2600')
                              ? false
                              : (stryCov_9fa48('2600', '2601', '2602'), unitPriceUsd <= 0)))
            ) {
              if (stryMutAct_9fa48('2603')) {
                {
                }
              } else {
                stryCov_9fa48('2603')
                throw new ValidationError(
                  stryMutAct_9fa48('2604')
                    ? ''
                    : (stryCov_9fa48('2604'), 'Order validation failed'),
                  stryMutAct_9fa48('2605')
                    ? {}
                    : (stryCov_9fa48('2605'),
                      {
                        'orderItems.unit_price_usd': stryMutAct_9fa48('2606')
                          ? ''
                          : (stryCov_9fa48('2606'), 'must be positive')
                      })
                )
              }
            }

            // Validate stock availability using ProductRepository
            const productRepository = getProductRepository()
            const product = await productRepository.findById(
              item.product_id,
              stryMutAct_9fa48('2607') ? false : (stryCov_9fa48('2607'), true)
            )
            if (
              stryMutAct_9fa48('2610')
                ? false
                : stryMutAct_9fa48('2609')
                  ? true
                  : stryMutAct_9fa48('2608')
                    ? product
                    : (stryCov_9fa48('2608', '2609', '2610'), !product)
            ) {
              if (stryMutAct_9fa48('2611')) {
                {
                }
              } else {
                stryCov_9fa48('2611')
                throw new NotFoundError(
                  stryMutAct_9fa48('2612') ? '' : (stryCov_9fa48('2612'), 'Product'),
                  item.product_id,
                  stryMutAct_9fa48('2613')
                    ? {}
                    : (stryCov_9fa48('2613'),
                      {
                        productId: item.product_id
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('2616')
                ? false
                : stryMutAct_9fa48('2615')
                  ? true
                  : stryMutAct_9fa48('2614')
                    ? product.active
                    : (stryCov_9fa48('2614', '2615', '2616'), !product.active)
            ) {
              if (stryMutAct_9fa48('2617')) {
                {
                }
              } else {
                stryCov_9fa48('2617')
                throw new ValidationError(
                  stryMutAct_9fa48('2618') ? '' : (stryCov_9fa48('2618'), 'Product is not active'),
                  stryMutAct_9fa48('2619')
                    ? {}
                    : (stryCov_9fa48('2619'),
                      {
                        productId: item.product_id,
                        productName: product.name
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('2623')
                ? product.stock >= item.quantity
                : stryMutAct_9fa48('2622')
                  ? product.stock <= item.quantity
                  : stryMutAct_9fa48('2621')
                    ? false
                    : stryMutAct_9fa48('2620')
                      ? true
                      : (stryCov_9fa48('2620', '2621', '2622', '2623'),
                        product.stock < item.quantity)
            ) {
              if (stryMutAct_9fa48('2624')) {
                {
                }
              } else {
                stryCov_9fa48('2624')
                throw new ValidationError(
                  stryMutAct_9fa48('2625') ? '' : (stryCov_9fa48('2625'), 'Insufficient stock'),
                  stryMutAct_9fa48('2626')
                    ? {}
                    : (stryCov_9fa48('2626'),
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
          stryMutAct_9fa48('2627') ? true : (stryCov_9fa48('2627'), false)
        )

        // Convert string amounts to numbers if needed for the order payload
        let totalAmountVes = sanitizedOrderData.total_amount_ves
        if (
          stryMutAct_9fa48('2630')
            ? typeof totalAmountVes !== 'string'
            : stryMutAct_9fa48('2629')
              ? false
              : stryMutAct_9fa48('2628')
                ? true
                : (stryCov_9fa48('2628', '2629', '2630'),
                  typeof totalAmountVes ===
                    (stryMutAct_9fa48('2631') ? '' : (stryCov_9fa48('2631'), 'string')))
        ) {
          if (stryMutAct_9fa48('2632')) {
            {
            }
          } else {
            stryCov_9fa48('2632')
            totalAmountVes = parseFloat(totalAmountVes)
          }
        }
        let currencyRate = sanitizedOrderData.currency_rate
        if (
          stryMutAct_9fa48('2635')
            ? typeof currencyRate !== 'string'
            : stryMutAct_9fa48('2634')
              ? false
              : stryMutAct_9fa48('2633')
                ? true
                : (stryCov_9fa48('2633', '2634', '2635'),
                  typeof currencyRate ===
                    (stryMutAct_9fa48('2636') ? '' : (stryCov_9fa48('2636'), 'string')))
        ) {
          if (stryMutAct_9fa48('2637')) {
            {
            }
          } else {
            stryCov_9fa48('2637')
            currencyRate = parseFloat(currencyRate)
          }
        }
        const orderPayload = stryMutAct_9fa48('2638')
          ? {}
          : (stryCov_9fa48('2638'),
            {
              user_id: (
                stryMutAct_9fa48('2641')
                  ? sanitizedOrderData.user_id === undefined
                  : stryMutAct_9fa48('2640')
                    ? false
                    : stryMutAct_9fa48('2639')
                      ? true
                      : (stryCov_9fa48('2639', '2640', '2641'),
                        sanitizedOrderData.user_id !== undefined)
              )
                ? sanitizedOrderData.user_id
                : null,
              customer_email: sanitizedOrderData.customer_email,
              customer_name: sanitizedOrderData.customer_name,
              customer_phone: (
                stryMutAct_9fa48('2644')
                  ? sanitizedOrderData.customer_phone === undefined
                  : stryMutAct_9fa48('2643')
                    ? false
                    : stryMutAct_9fa48('2642')
                      ? true
                      : (stryCov_9fa48('2642', '2643', '2644'),
                        sanitizedOrderData.customer_phone !== undefined)
              )
                ? sanitizedOrderData.customer_phone
                : null,
              delivery_address: sanitizedOrderData.delivery_address,
              delivery_date: (
                stryMutAct_9fa48('2647')
                  ? sanitizedOrderData.delivery_date === undefined
                  : stryMutAct_9fa48('2646')
                    ? false
                    : stryMutAct_9fa48('2645')
                      ? true
                      : (stryCov_9fa48('2645', '2646', '2647'),
                        sanitizedOrderData.delivery_date !== undefined)
              )
                ? sanitizedOrderData.delivery_date
                : null,
              delivery_time_slot: (
                stryMutAct_9fa48('2650')
                  ? sanitizedOrderData.delivery_time_slot === undefined
                  : stryMutAct_9fa48('2649')
                    ? false
                    : stryMutAct_9fa48('2648')
                      ? true
                      : (stryCov_9fa48('2648', '2649', '2650'),
                        sanitizedOrderData.delivery_time_slot !== undefined)
              )
                ? sanitizedOrderData.delivery_time_slot
                : null,
              delivery_notes: (
                stryMutAct_9fa48('2653')
                  ? sanitizedOrderData.delivery_notes === undefined
                  : stryMutAct_9fa48('2652')
                    ? false
                    : stryMutAct_9fa48('2651')
                      ? true
                      : (stryCov_9fa48('2651', '2652', '2653'),
                        sanitizedOrderData.delivery_notes !== undefined)
              )
                ? sanitizedOrderData.delivery_notes
                : null,
              status: (
                stryMutAct_9fa48('2656')
                  ? sanitizedOrderData.status === undefined
                  : stryMutAct_9fa48('2655')
                    ? false
                    : stryMutAct_9fa48('2654')
                      ? true
                      : (stryCov_9fa48('2654', '2655', '2656'),
                        sanitizedOrderData.status !== undefined)
              )
                ? sanitizedOrderData.status
                : stryMutAct_9fa48('2657')
                  ? ''
                  : (stryCov_9fa48('2657'), 'pending'),
              total_amount_usd: (
                stryMutAct_9fa48('2660')
                  ? typeof sanitizedOrderData.total_amount_usd !== 'string'
                  : stryMutAct_9fa48('2659')
                    ? false
                    : stryMutAct_9fa48('2658')
                      ? true
                      : (stryCov_9fa48('2658', '2659', '2660'),
                        typeof sanitizedOrderData.total_amount_usd ===
                          (stryMutAct_9fa48('2661') ? '' : (stryCov_9fa48('2661'), 'string')))
              )
                ? parseFloat(sanitizedOrderData.total_amount_usd)
                : sanitizedOrderData.total_amount_usd,
              total_amount_ves: (
                stryMutAct_9fa48('2664')
                  ? totalAmountVes !== null || totalAmountVes !== undefined
                  : stryMutAct_9fa48('2663')
                    ? false
                    : stryMutAct_9fa48('2662')
                      ? true
                      : (stryCov_9fa48('2662', '2663', '2664'),
                        (stryMutAct_9fa48('2666')
                          ? totalAmountVes === null
                          : stryMutAct_9fa48('2665')
                            ? true
                            : (stryCov_9fa48('2665', '2666'), totalAmountVes !== null)) &&
                          (stryMutAct_9fa48('2668')
                            ? totalAmountVes === undefined
                            : stryMutAct_9fa48('2667')
                              ? true
                              : (stryCov_9fa48('2667', '2668'), totalAmountVes !== undefined)))
              )
                ? Math.round(totalAmountVes)
                : null,
              currency_rate: (
                stryMutAct_9fa48('2671')
                  ? currencyRate === undefined
                  : stryMutAct_9fa48('2670')
                    ? false
                    : stryMutAct_9fa48('2669')
                      ? true
                      : (stryCov_9fa48('2669', '2670', '2671'), currencyRate !== undefined)
              )
                ? currencyRate
                : null,
              notes: (
                stryMutAct_9fa48('2674')
                  ? sanitizedOrderData.notes === undefined
                  : stryMutAct_9fa48('2673')
                    ? false
                    : stryMutAct_9fa48('2672')
                      ? true
                      : (stryCov_9fa48('2672', '2673', '2674'),
                        sanitizedOrderData.notes !== undefined)
              )
                ? sanitizedOrderData.notes
                : null,
              admin_notes: (
                stryMutAct_9fa48('2677')
                  ? sanitizedOrderData.admin_notes === undefined
                  : stryMutAct_9fa48('2676')
                    ? false
                    : stryMutAct_9fa48('2675')
                      ? true
                      : (stryCov_9fa48('2675', '2676', '2677'),
                        sanitizedOrderData.admin_notes !== undefined)
              )
                ? sanitizedOrderData.admin_notes
                : null
            })
        const itemsPayload = orderItems.map(item => {
          if (stryMutAct_9fa48('2678')) {
            {
            }
          } else {
            stryCov_9fa48('2678')
            // Sanitize item data before database operations
            const sanitizedItem = sanitizeOrderItemData(item)

            // Ensure numeric values are properly converted
            const productId = (
              stryMutAct_9fa48('2681')
                ? typeof sanitizedItem.product_id !== 'string'
                : stryMutAct_9fa48('2680')
                  ? false
                  : stryMutAct_9fa48('2679')
                    ? true
                    : (stryCov_9fa48('2679', '2680', '2681'),
                      typeof sanitizedItem.product_id ===
                        (stryMutAct_9fa48('2682') ? '' : (stryCov_9fa48('2682'), 'string')))
            )
              ? parseInt(sanitizedItem.product_id, 10)
              : sanitizedItem.product_id
            const unitPriceUsd = (
              stryMutAct_9fa48('2685')
                ? typeof sanitizedItem.unit_price_usd !== 'string'
                : stryMutAct_9fa48('2684')
                  ? false
                  : stryMutAct_9fa48('2683')
                    ? true
                    : (stryCov_9fa48('2683', '2684', '2685'),
                      typeof sanitizedItem.unit_price_usd ===
                        (stryMutAct_9fa48('2686') ? '' : (stryCov_9fa48('2686'), 'string')))
            )
              ? parseFloat(sanitizedItem.unit_price_usd)
              : sanitizedItem.unit_price_usd
            const unitPriceVes = (
              stryMutAct_9fa48('2689')
                ? typeof sanitizedItem.unit_price_ves !== 'string'
                : stryMutAct_9fa48('2688')
                  ? false
                  : stryMutAct_9fa48('2687')
                    ? true
                    : (stryCov_9fa48('2687', '2688', '2689'),
                      typeof sanitizedItem.unit_price_ves ===
                        (stryMutAct_9fa48('2690') ? '' : (stryCov_9fa48('2690'), 'string')))
            )
              ? parseFloat(sanitizedItem.unit_price_ves)
              : sanitizedItem.unit_price_ves
            const quantity = (
              stryMutAct_9fa48('2693')
                ? typeof sanitizedItem.quantity !== 'string'
                : stryMutAct_9fa48('2692')
                  ? false
                  : stryMutAct_9fa48('2691')
                    ? true
                    : (stryCov_9fa48('2691', '2692', '2693'),
                      typeof sanitizedItem.quantity ===
                        (stryMutAct_9fa48('2694') ? '' : (stryCov_9fa48('2694'), 'string')))
            )
              ? parseInt(sanitizedItem.quantity, 10)
              : sanitizedItem.quantity

            // Apply intelligent rounding to VES values (round to nearest integer)
            const roundedUnitPriceVes = (
              stryMutAct_9fa48('2697')
                ? unitPriceVes !== null || unitPriceVes !== undefined
                : stryMutAct_9fa48('2696')
                  ? false
                  : stryMutAct_9fa48('2695')
                    ? true
                    : (stryCov_9fa48('2695', '2696', '2697'),
                      (stryMutAct_9fa48('2699')
                        ? unitPriceVes === null
                        : stryMutAct_9fa48('2698')
                          ? true
                          : (stryCov_9fa48('2698', '2699'), unitPriceVes !== null)) &&
                        (stryMutAct_9fa48('2701')
                          ? unitPriceVes === undefined
                          : stryMutAct_9fa48('2700')
                            ? true
                            : (stryCov_9fa48('2700', '2701'), unitPriceVes !== undefined)))
            )
              ? Math.round(unitPriceVes)
              : null
            const roundedSubtotalVes = (
              stryMutAct_9fa48('2704')
                ? unitPriceVes !== null || unitPriceVes !== undefined
                : stryMutAct_9fa48('2703')
                  ? false
                  : stryMutAct_9fa48('2702')
                    ? true
                    : (stryCov_9fa48('2702', '2703', '2704'),
                      (stryMutAct_9fa48('2706')
                        ? unitPriceVes === null
                        : stryMutAct_9fa48('2705')
                          ? true
                          : (stryCov_9fa48('2705', '2706'), unitPriceVes !== null)) &&
                        (stryMutAct_9fa48('2708')
                          ? unitPriceVes === undefined
                          : stryMutAct_9fa48('2707')
                            ? true
                            : (stryCov_9fa48('2707', '2708'), unitPriceVes !== undefined)))
            )
              ? Math.round(
                  stryMutAct_9fa48('2709')
                    ? unitPriceVes / quantity
                    : (stryCov_9fa48('2709'), unitPriceVes * quantity)
                )
              : null
            return stryMutAct_9fa48('2710')
              ? {}
              : (stryCov_9fa48('2710'),
                {
                  product_id: productId,
                  product_name: sanitizedItem.product_name,
                  product_summary: (
                    stryMutAct_9fa48('2713')
                      ? sanitizedItem.product_summary === undefined
                      : stryMutAct_9fa48('2712')
                        ? false
                        : stryMutAct_9fa48('2711')
                          ? true
                          : (stryCov_9fa48('2711', '2712', '2713'),
                            sanitizedItem.product_summary !== undefined)
                  )
                    ? sanitizedItem.product_summary
                    : null,
                  unit_price_usd: unitPriceUsd,
                  unit_price_ves: roundedUnitPriceVes,
                  quantity: quantity,
                  subtotal_usd: stryMutAct_9fa48('2714')
                    ? unitPriceUsd / quantity
                    : (stryCov_9fa48('2714'), unitPriceUsd * quantity),
                  subtotal_ves: roundedSubtotalVes
                })
          }
        })

        // Use atomic stored function (SSOT: DB_FUNCTIONS.createOrderWithItems)
        const result = await supabase.rpc(
          stryMutAct_9fa48('2715') ? '' : (stryCov_9fa48('2715'), 'create_order_with_items'),
          stryMutAct_9fa48('2716')
            ? {}
            : (stryCov_9fa48('2716'),
              {
                order_data: orderPayload,
                order_items: itemsPayload
              })
        )
        const data = stryMutAct_9fa48('2717')
          ? result?.data && result
          : (stryCov_9fa48('2717'),
            (stryMutAct_9fa48('2718') ? result.data : (stryCov_9fa48('2718'), result?.data)) ??
              result)
        const error = stryMutAct_9fa48('2719')
          ? result.error
          : (stryCov_9fa48('2719'), result?.error)
        if (
          stryMutAct_9fa48('2721')
            ? false
            : stryMutAct_9fa48('2720')
              ? true
              : (stryCov_9fa48('2720', '2721'), error)
        ) {
          if (stryMutAct_9fa48('2722')) {
            {
            }
          } else {
            stryCov_9fa48('2722')
            throw new DatabaseError(
              stryMutAct_9fa48('2723') ? '' : (stryCov_9fa48('2723'), 'RPC'),
              stryMutAct_9fa48('2724') ? '' : (stryCov_9fa48('2724'), 'create_order_with_items'),
              error,
              stryMutAct_9fa48('2725')
                ? {}
                : (stryCov_9fa48('2725'),
                  {
                    orderData,
                    itemCount: orderItems.length
                  })
            )
          }
        }

        // RPC functions return single values, not arrays
        if (
          stryMutAct_9fa48('2728')
            ? data === null && Array.isArray(data) && data.length === 0
            : stryMutAct_9fa48('2727')
              ? false
              : stryMutAct_9fa48('2726')
                ? true
                : (stryCov_9fa48('2726', '2727', '2728'),
                  (stryMutAct_9fa48('2730')
                    ? data !== null
                    : stryMutAct_9fa48('2729')
                      ? false
                      : (stryCov_9fa48('2729', '2730'), data === null)) ||
                    (stryMutAct_9fa48('2732')
                      ? Array.isArray(data) || data.length === 0
                      : stryMutAct_9fa48('2731')
                        ? false
                        : (stryCov_9fa48('2731', '2732'),
                          Array.isArray(data) &&
                            (stryMutAct_9fa48('2734')
                              ? data.length !== 0
                              : stryMutAct_9fa48('2733')
                                ? true
                                : (stryCov_9fa48('2733', '2734'), data.length === 0)))))
        ) {
          if (stryMutAct_9fa48('2735')) {
            {
            }
          } else {
            stryCov_9fa48('2735')
            throw new DatabaseError(
              stryMutAct_9fa48('2736') ? '' : (stryCov_9fa48('2736'), 'RPC'),
              stryMutAct_9fa48('2737') ? '' : (stryCov_9fa48('2737'), 'create_order_with_items'),
              new InternalServerError(
                stryMutAct_9fa48('2738') ? '' : (stryCov_9fa48('2738'), 'No data returned')
              ),
              stryMutAct_9fa48('2739')
                ? {}
                : (stryCov_9fa48('2739'),
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
      if (stryMutAct_9fa48('2740')) {
        {
        }
      } else {
        stryCov_9fa48('2740')
        console.error(
          stryMutAct_9fa48('2741') ? '' : (stryCov_9fa48('2741'), 'createOrderWithItems failed:'),
          error
        )
        throw error
      }
    }
  }
}
