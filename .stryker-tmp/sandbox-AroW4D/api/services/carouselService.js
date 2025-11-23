/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Carousel Service
 * Single Responsibility: Manage carousel_order conflicts and positioning
 * SOLID: Extracted from productService to avoid bloat
 *
 * Uses centralized structured logging
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
import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { ValidationError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'
import { CAROUSEL, QUERY_LIMITS } from '../config/constants.js'
import { log as logger } from '../utils/logger.js'
const TABLE = DB_SCHEMA.products.table

/**
 * Get all featured products in carousel (ordered)
 * @returns {Promise<Array>} Featured products sorted by carousel_order
 */
export const getCarouselProducts = withErrorMapping(
  async () => {
    if (stryMutAct_9fa48('1576')) {
      {
      }
    } else {
      stryCov_9fa48('1576')
      logger.info(
        stryMutAct_9fa48('1577') ? '' : (stryCov_9fa48('1577'), 'Fetching carousel products')
      )

      // Get all featured and active products, ordered by creation date (newest first)
      const { data: products, error } = await supabase
        .from(TABLE)
        .select(stryMutAct_9fa48('1578') ? '' : (stryCov_9fa48('1578'), '*'))
        .eq(
          stryMutAct_9fa48('1579') ? '' : (stryCov_9fa48('1579'), 'featured'),
          stryMutAct_9fa48('1580') ? false : (stryCov_9fa48('1580'), true)
        )
        .eq(
          stryMutAct_9fa48('1581') ? '' : (stryCov_9fa48('1581'), 'active'),
          stryMutAct_9fa48('1582') ? false : (stryCov_9fa48('1582'), true)
        )
        .order(
          stryMutAct_9fa48('1583') ? '' : (stryCov_9fa48('1583'), 'created_at'),
          stryMutAct_9fa48('1584')
            ? {}
            : (stryCov_9fa48('1584'),
              {
                ascending: stryMutAct_9fa48('1585') ? true : (stryCov_9fa48('1585'), false)
              })
        )
        .limit(CAROUSEL.MAX_SIZE)
      if (
        stryMutAct_9fa48('1587')
          ? false
          : stryMutAct_9fa48('1586')
            ? true
            : (stryCov_9fa48('1586', '1587'), error)
      ) {
        if (stryMutAct_9fa48('1588')) {
          {
          }
        } else {
          stryCov_9fa48('1588')
          logger.error(
            stryMutAct_9fa48('1589')
              ? ''
              : (stryCov_9fa48('1589'), 'Error fetching products from database'),
            stryMutAct_9fa48('1590')
              ? {}
              : (stryCov_9fa48('1590'),
                {
                  error: error.message
                })
          )
          // Map Supabase error automatically
          throw error
        }
      }
      logger.info(
        stryMutAct_9fa48('1591') ? '' : (stryCov_9fa48('1591'), 'Products query result'),
        stryMutAct_9fa48('1592')
          ? {}
          : (stryCov_9fa48('1592'),
            {
              count: stryMutAct_9fa48('1595')
                ? products?.length && 0
                : stryMutAct_9fa48('1594')
                  ? false
                  : stryMutAct_9fa48('1593')
                    ? true
                    : (stryCov_9fa48('1593', '1594', '1595'),
                      (stryMutAct_9fa48('1596')
                        ? products.length
                        : (stryCov_9fa48('1596'), products?.length)) || 0)
            })
      )
      if (
        stryMutAct_9fa48('1599')
          ? !products && products.length === 0
          : stryMutAct_9fa48('1598')
            ? false
            : stryMutAct_9fa48('1597')
              ? true
              : (stryCov_9fa48('1597', '1598', '1599'),
                (stryMutAct_9fa48('1600') ? products : (stryCov_9fa48('1600'), !products)) ||
                  (stryMutAct_9fa48('1602')
                    ? products.length !== 0
                    : stryMutAct_9fa48('1601')
                      ? false
                      : (stryCov_9fa48('1601', '1602'), products.length === 0)))
      ) {
        if (stryMutAct_9fa48('1603')) {
          {
          }
        } else {
          stryCov_9fa48('1603')
          logger.info(
            stryMutAct_9fa48('1604') ? '' : (stryCov_9fa48('1604'), 'No featured products found')
          )
          return stryMutAct_9fa48('1605') ? ['Stryker was here'] : (stryCov_9fa48('1605'), [])
        }
      }

      // Fetch small image for each product (first image, image_index=1)
      const IMAGES_TABLE = DB_SCHEMA.product_images.table
      logger.info(
        stryMutAct_9fa48('1606') ? '' : (stryCov_9fa48('1606'), 'Fetching images for products'),
        stryMutAct_9fa48('1607')
          ? {}
          : (stryCov_9fa48('1607'),
            {
              productCount: products.length
            })
      )
      let productsWithImages = stryMutAct_9fa48('1608')
        ? ['Stryker was here']
        : (stryCov_9fa48('1608'), [])
      try {
        if (stryMutAct_9fa48('1609')) {
          {
          }
        } else {
          stryCov_9fa48('1609')
          const productsWithImagesPromises = products.map(async product => {
            if (stryMutAct_9fa48('1610')) {
              {
              }
            } else {
              stryCov_9fa48('1610')
              try {
                if (stryMutAct_9fa48('1611')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1611')
                  const { data: images, error: imgError } = await supabase
                    .from(IMAGES_TABLE)
                    .select(stryMutAct_9fa48('1612') ? '' : (stryCov_9fa48('1612'), 'url'))
                    .eq(
                      stryMutAct_9fa48('1613') ? '' : (stryCov_9fa48('1613'), 'product_id'),
                      product.id
                    )
                    .eq(
                      stryMutAct_9fa48('1614') ? '' : (stryCov_9fa48('1614'), 'size'),
                      stryMutAct_9fa48('1615') ? '' : (stryCov_9fa48('1615'), 'small')
                    )
                    .order(
                      stryMutAct_9fa48('1616') ? '' : (stryCov_9fa48('1616'), 'image_index'),
                      stryMutAct_9fa48('1617')
                        ? {}
                        : (stryCov_9fa48('1617'),
                          {
                            ascending: stryMutAct_9fa48('1618')
                              ? false
                              : (stryCov_9fa48('1618'), true)
                          })
                    )
                    .limit(QUERY_LIMITS.SINGLE_RECORD)
                    .maybeSingle()
                  if (
                    stryMutAct_9fa48('1620')
                      ? false
                      : stryMutAct_9fa48('1619')
                        ? true
                        : (stryCov_9fa48('1619', '1620'), imgError)
                  ) {
                    if (stryMutAct_9fa48('1621')) {
                      {
                      }
                    } else {
                      stryCov_9fa48('1621')
                      logger.warn(
                        stryMutAct_9fa48('1622')
                          ? ''
                          : (stryCov_9fa48('1622'), 'Failed to fetch image for product'),
                        stryMutAct_9fa48('1623')
                          ? {}
                          : (stryCov_9fa48('1623'),
                            {
                              productId: product.id,
                              error: imgError.message
                            })
                      )
                    }
                  }
                  return stryMutAct_9fa48('1624')
                    ? {}
                    : (stryCov_9fa48('1624'),
                      {
                        ...product,
                        image_url_small: stryMutAct_9fa48('1627')
                          ? images?.url && null
                          : stryMutAct_9fa48('1626')
                            ? false
                            : stryMutAct_9fa48('1625')
                              ? true
                              : (stryCov_9fa48('1625', '1626', '1627'),
                                (stryMutAct_9fa48('1628')
                                  ? images.url
                                  : (stryCov_9fa48('1628'), images?.url)) || null)
                      })
                }
              } catch (imgErr) {
                if (stryMutAct_9fa48('1629')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1629')
                  logger.error(
                    stryMutAct_9fa48('1630')
                      ? ''
                      : (stryCov_9fa48('1630'), 'Error fetching image for product'),
                    stryMutAct_9fa48('1631')
                      ? {}
                      : (stryCov_9fa48('1631'),
                        {
                          productId: product.id,
                          error: imgErr.message
                        })
                  )
                  return stryMutAct_9fa48('1632')
                    ? {}
                    : (stryCov_9fa48('1632'),
                      {
                        ...product,
                        image_url_small: null
                      })
                }
              }
            }
          })
          productsWithImages = await Promise.all(productsWithImagesPromises)
          logger.info(
            stryMutAct_9fa48('1633')
              ? ''
              : (stryCov_9fa48('1633'), 'Successfully processed products with images'),
            stryMutAct_9fa48('1634')
              ? {}
              : (stryCov_9fa48('1634'),
                {
                  count: productsWithImages.length
                })
          )
        }
      } catch (allErr) {
        if (stryMutAct_9fa48('1635')) {
          {
          }
        } else {
          stryCov_9fa48('1635')
          logger.error(
            stryMutAct_9fa48('1636')
              ? ''
              : (stryCov_9fa48('1636'), 'Error in Promise.all for image fetching'),
            stryMutAct_9fa48('1637')
              ? {}
              : (stryCov_9fa48('1637'),
                {
                  error: allErr.message
                })
          )
          // Fallback: return products without images
          productsWithImages = products.map(
            stryMutAct_9fa48('1638')
              ? () => undefined
              : (stryCov_9fa48('1638'),
                product =>
                  stryMutAct_9fa48('1639')
                    ? {}
                    : (stryCov_9fa48('1639'),
                      {
                        ...product,
                        image_url_small: null
                      }))
          )
        }
      }
      logger.info(
        stryMutAct_9fa48('1640') ? '' : (stryCov_9fa48('1640'), 'Carousel products prepared'),
        stryMutAct_9fa48('1641')
          ? {}
          : (stryCov_9fa48('1641'),
            {
              count: productsWithImages.length
            })
      )
      return productsWithImages
    }
  },
  stryMutAct_9fa48('1642') ? '' : (stryCov_9fa48('1642'), 'SELECT'),
  TABLE
)

/**
 * Validate carousel_order value
 * @param {number} carouselOrder - Position to validate
 * @throws {ValidationError} If invalid
 */
export function validateCarouselOrder(carouselOrder) {
  if (stryMutAct_9fa48('1643')) {
    {
    }
  } else {
    stryCov_9fa48('1643')
    // null/undefined is valid (not featured)
    if (
      stryMutAct_9fa48('1646')
        ? carouselOrder === null && carouselOrder === undefined
        : stryMutAct_9fa48('1645')
          ? false
          : stryMutAct_9fa48('1644')
            ? true
            : (stryCov_9fa48('1644', '1645', '1646'),
              (stryMutAct_9fa48('1648')
                ? carouselOrder !== null
                : stryMutAct_9fa48('1647')
                  ? false
                  : (stryCov_9fa48('1647', '1648'), carouselOrder === null)) ||
                (stryMutAct_9fa48('1650')
                  ? carouselOrder !== undefined
                  : stryMutAct_9fa48('1649')
                    ? false
                    : (stryCov_9fa48('1649', '1650'), carouselOrder === undefined)))
    ) {
      if (stryMutAct_9fa48('1651')) {
        {
        }
      } else {
        stryCov_9fa48('1651')
        return
      }
    }
    if (
      stryMutAct_9fa48('1654')
        ? (typeof carouselOrder !== 'number' ||
            !Number.isInteger(carouselOrder) ||
            carouselOrder < CAROUSEL.MIN_POSITION) &&
          carouselOrder > CAROUSEL.MAX_POSITION
        : stryMutAct_9fa48('1653')
          ? false
          : stryMutAct_9fa48('1652')
            ? true
            : (stryCov_9fa48('1652', '1653', '1654'),
              (stryMutAct_9fa48('1656')
                ? (typeof carouselOrder !== 'number' || !Number.isInteger(carouselOrder)) &&
                  carouselOrder < CAROUSEL.MIN_POSITION
                : stryMutAct_9fa48('1655')
                  ? false
                  : (stryCov_9fa48('1655', '1656'),
                    (stryMutAct_9fa48('1658')
                      ? typeof carouselOrder !== 'number' && !Number.isInteger(carouselOrder)
                      : stryMutAct_9fa48('1657')
                        ? false
                        : (stryCov_9fa48('1657', '1658'),
                          (stryMutAct_9fa48('1660')
                            ? typeof carouselOrder === 'number'
                            : stryMutAct_9fa48('1659')
                              ? false
                              : (stryCov_9fa48('1659', '1660'),
                                typeof carouselOrder !==
                                  (stryMutAct_9fa48('1661')
                                    ? ''
                                    : (stryCov_9fa48('1661'), 'number')))) ||
                            (stryMutAct_9fa48('1662')
                              ? Number.isInteger(carouselOrder)
                              : (stryCov_9fa48('1662'), !Number.isInteger(carouselOrder))))) ||
                      (stryMutAct_9fa48('1665')
                        ? carouselOrder >= CAROUSEL.MIN_POSITION
                        : stryMutAct_9fa48('1664')
                          ? carouselOrder <= CAROUSEL.MIN_POSITION
                          : stryMutAct_9fa48('1663')
                            ? false
                            : (stryCov_9fa48('1663', '1664', '1665'),
                              carouselOrder < CAROUSEL.MIN_POSITION)))) ||
                (stryMutAct_9fa48('1668')
                  ? carouselOrder <= CAROUSEL.MAX_POSITION
                  : stryMutAct_9fa48('1667')
                    ? carouselOrder >= CAROUSEL.MAX_POSITION
                    : stryMutAct_9fa48('1666')
                      ? false
                      : (stryCov_9fa48('1666', '1667', '1668'),
                        carouselOrder > CAROUSEL.MAX_POSITION)))
    ) {
      if (stryMutAct_9fa48('1669')) {
        {
        }
      } else {
        stryCov_9fa48('1669')
        throw new ValidationError(
          stryMutAct_9fa48('1670')
            ? ``
            : (stryCov_9fa48('1670'),
              `carousel_order must be an integer between ${CAROUSEL.MIN_POSITION}-${CAROUSEL.MAX_POSITION}`),
          stryMutAct_9fa48('1671')
            ? {}
            : (stryCov_9fa48('1671'),
              {
                carouselOrder
              })
        )
      }
    }
  }
}

/**
 * Check if carousel is full (7 products)
 * @param {number} excludeProductId - Product ID to exclude from count (when editing)
 * @returns {Promise<boolean>}
 */
export const isCarouselFull = withErrorMapping(
  async (excludeProductId = null) => {
    if (stryMutAct_9fa48('1672')) {
      {
      }
    } else {
      stryCov_9fa48('1672')
      let query = supabase
        .from(TABLE)
        .select(
          stryMutAct_9fa48('1673') ? '' : (stryCov_9fa48('1673'), 'id'),
          stryMutAct_9fa48('1674')
            ? {}
            : (stryCov_9fa48('1674'),
              {
                count: stryMutAct_9fa48('1675') ? '' : (stryCov_9fa48('1675'), 'exact'),
                head: stryMutAct_9fa48('1676') ? false : (stryCov_9fa48('1676'), true)
              })
        )
        .eq(
          stryMutAct_9fa48('1677') ? '' : (stryCov_9fa48('1677'), 'featured'),
          stryMutAct_9fa48('1678') ? false : (stryCov_9fa48('1678'), true)
        )
        .eq(
          stryMutAct_9fa48('1679') ? '' : (stryCov_9fa48('1679'), 'active'),
          stryMutAct_9fa48('1680') ? false : (stryCov_9fa48('1680'), true)
        )
      if (
        stryMutAct_9fa48('1682')
          ? false
          : stryMutAct_9fa48('1681')
            ? true
            : (stryCov_9fa48('1681', '1682'), excludeProductId)
      ) {
        if (stryMutAct_9fa48('1683')) {
          {
          }
        } else {
          stryCov_9fa48('1683')
          query = stryMutAct_9fa48('1684')
            ? query
            : (stryCov_9fa48('1684'),
              query.filter(
                stryMutAct_9fa48('1685') ? '' : (stryCov_9fa48('1685'), 'id'),
                stryMutAct_9fa48('1686') ? '' : (stryCov_9fa48('1686'), 'neq'),
                excludeProductId
              ))
        }
      }
      const { count, error } = await query
      if (
        stryMutAct_9fa48('1688')
          ? false
          : stryMutAct_9fa48('1687')
            ? true
            : (stryCov_9fa48('1687', '1688'), error)
      ) {
        if (stryMutAct_9fa48('1689')) {
          {
          }
        } else {
          stryCov_9fa48('1689')
          // Map Supabase error automatically
          throw error
        }
      }
      return stryMutAct_9fa48('1693')
        ? count < CAROUSEL.MAX_SIZE
        : stryMutAct_9fa48('1692')
          ? count > CAROUSEL.MAX_SIZE
          : stryMutAct_9fa48('1691')
            ? false
            : stryMutAct_9fa48('1690')
              ? true
              : (stryCov_9fa48('1690', '1691', '1692', '1693'), count >= CAROUSEL.MAX_SIZE)
    }
  },
  stryMutAct_9fa48('1694') ? '' : (stryCov_9fa48('1694'), 'COUNT'),
  TABLE
)

/**
 * Resolve carousel_order conflicts before insert/update
 * Strategy:
 * 1. Find products with same or higher carousel_order
 * 2. Shift them down (+1)
 * 3. If shifted beyond position 7, remove from carousel (featured = false)
 *
 * @param {number} newOrder - Desired carousel position (1-7)
 * @param {number} excludeProductId - Product ID being created/edited (exclude from conflict check)
 * @returns {Promise<Object>} { shiftedCount, removedProducts }
 */
export const resolveCarouselOrderConflict = withErrorMapping(
  async (newOrder, excludeProductId = null) => {
    if (stryMutAct_9fa48('1695')) {
      {
      }
    } else {
      stryCov_9fa48('1695')
      if (
        stryMutAct_9fa48('1698')
          ? false
          : stryMutAct_9fa48('1697')
            ? true
            : stryMutAct_9fa48('1696')
              ? newOrder
              : (stryCov_9fa48('1696', '1697', '1698'), !newOrder)
      ) {
        if (stryMutAct_9fa48('1699')) {
          {
          }
        } else {
          stryCov_9fa48('1699')
          return stryMutAct_9fa48('1700')
            ? {}
            : (stryCov_9fa48('1700'),
              {
                shiftedCount: 0,
                removedProducts: stryMutAct_9fa48('1701')
                  ? ['Stryker was here']
                  : (stryCov_9fa48('1701'), [])
              })
        }
      } // Not featured, skip

      validateCarouselOrder(newOrder)

      // Get products with same or higher order (process in reverse to avoid conflicts)
      let query = supabase
        .from(TABLE)
        .select(stryMutAct_9fa48('1702') ? '' : (stryCov_9fa48('1702'), 'id, name, carousel_order'))
        .eq(
          stryMutAct_9fa48('1703') ? '' : (stryCov_9fa48('1703'), 'featured'),
          stryMutAct_9fa48('1704') ? false : (stryCov_9fa48('1704'), true)
        )
        .eq(
          stryMutAct_9fa48('1705') ? '' : (stryCov_9fa48('1705'), 'active'),
          stryMutAct_9fa48('1706') ? false : (stryCov_9fa48('1706'), true)
        )
        .gte(stryMutAct_9fa48('1707') ? '' : (stryCov_9fa48('1707'), 'carousel_order'), newOrder)
        .order(
          stryMutAct_9fa48('1708') ? '' : (stryCov_9fa48('1708'), 'carousel_order'),
          stryMutAct_9fa48('1709')
            ? {}
            : (stryCov_9fa48('1709'),
              {
                ascending: stryMutAct_9fa48('1710') ? true : (stryCov_9fa48('1710'), false)
              })
        ) // Process from highest to lowest

      if (
        stryMutAct_9fa48('1712')
          ? false
          : stryMutAct_9fa48('1711')
            ? true
            : (stryCov_9fa48('1711', '1712'), excludeProductId)
      ) {
        if (stryMutAct_9fa48('1713')) {
          {
          }
        } else {
          stryCov_9fa48('1713')
          query = stryMutAct_9fa48('1714')
            ? query
            : (stryCov_9fa48('1714'),
              query.filter(
                stryMutAct_9fa48('1715') ? '' : (stryCov_9fa48('1715'), 'id'),
                stryMutAct_9fa48('1716') ? '' : (stryCov_9fa48('1716'), 'neq'),
                excludeProductId
              ))
        }
      }
      const { data: conflicts, error } = await query
      if (
        stryMutAct_9fa48('1718')
          ? false
          : stryMutAct_9fa48('1717')
            ? true
            : (stryCov_9fa48('1717', '1718'), error)
      ) {
        if (stryMutAct_9fa48('1719')) {
          {
          }
        } else {
          stryCov_9fa48('1719')
          // Map Supabase error automatically
          throw error
        }
      }
      if (
        stryMutAct_9fa48('1722')
          ? !conflicts && conflicts.length === 0
          : stryMutAct_9fa48('1721')
            ? false
            : stryMutAct_9fa48('1720')
              ? true
              : (stryCov_9fa48('1720', '1721', '1722'),
                (stryMutAct_9fa48('1723') ? conflicts : (stryCov_9fa48('1723'), !conflicts)) ||
                  (stryMutAct_9fa48('1725')
                    ? conflicts.length !== 0
                    : stryMutAct_9fa48('1724')
                      ? false
                      : (stryCov_9fa48('1724', '1725'), conflicts.length === 0)))
      ) {
        if (stryMutAct_9fa48('1726')) {
          {
          }
        } else {
          stryCov_9fa48('1726')
          return stryMutAct_9fa48('1727')
            ? {}
            : (stryCov_9fa48('1727'),
              {
                shiftedCount: 0,
                removedProducts: stryMutAct_9fa48('1728')
                  ? ['Stryker was here']
                  : (stryCov_9fa48('1728'), [])
              })
        }
      }
      logger.info(
        stryMutAct_9fa48('1729')
          ? ''
          : (stryCov_9fa48('1729'), 'Resolving carousel_order conflicts'),
        stryMutAct_9fa48('1730')
          ? {}
          : (stryCov_9fa48('1730'),
            {
              conflictsCount: conflicts.length,
              newOrder
            })
      )
      const removedProducts = stryMutAct_9fa48('1731')
        ? ['Stryker was here']
        : (stryCov_9fa48('1731'), [])
      let shiftedCount = 0

      // Shift each conflicting product down
      for (const product of conflicts) {
        if (stryMutAct_9fa48('1732')) {
          {
          }
        } else {
          stryCov_9fa48('1732')
          const newCarouselOrder = stryMutAct_9fa48('1733')
            ? product.carousel_order - 1
            : (stryCov_9fa48('1733'), product.carousel_order + 1)
          if (
            stryMutAct_9fa48('1737')
              ? newCarouselOrder <= CAROUSEL.MAX_SIZE
              : stryMutAct_9fa48('1736')
                ? newCarouselOrder >= CAROUSEL.MAX_SIZE
                : stryMutAct_9fa48('1735')
                  ? false
                  : stryMutAct_9fa48('1734')
                    ? true
                    : (stryCov_9fa48('1734', '1735', '1736', '1737'),
                      newCarouselOrder > CAROUSEL.MAX_SIZE)
          ) {
            if (stryMutAct_9fa48('1738')) {
              {
              }
            } else {
              stryCov_9fa48('1738')
              // Remove from carousel (beyond limit)
              const { error: updateError } = await supabase
                .from(TABLE)
                .update(
                  stryMutAct_9fa48('1739')
                    ? {}
                    : (stryCov_9fa48('1739'),
                      {
                        featured: stryMutAct_9fa48('1740') ? true : (stryCov_9fa48('1740'), false),
                        carousel_order: null
                      })
                )
                .eq(stryMutAct_9fa48('1741') ? '' : (stryCov_9fa48('1741'), 'id'), product.id)
              if (
                stryMutAct_9fa48('1743')
                  ? false
                  : stryMutAct_9fa48('1742')
                    ? true
                    : (stryCov_9fa48('1742', '1743'), updateError)
              ) {
                if (stryMutAct_9fa48('1744')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1744')
                  throw updateError // Mapeo automático
                }
              }
              removedProducts.push(
                stryMutAct_9fa48('1745')
                  ? {}
                  : (stryCov_9fa48('1745'),
                    {
                      id: product.id,
                      name: product.name
                    })
              )
              logger.info(
                stryMutAct_9fa48('1746')
                  ? ''
                  : (stryCov_9fa48('1746'), 'Removed product from carousel'),
                stryMutAct_9fa48('1747')
                  ? {}
                  : (stryCov_9fa48('1747'),
                    {
                      productId: product.id,
                      productName: product.name,
                      oldPosition: product.carousel_order,
                      reason: stryMutAct_9fa48('1748')
                        ? ''
                        : (stryCov_9fa48('1748'), 'position exceeds max carousel size')
                    })
              )
            }
          } else {
            if (stryMutAct_9fa48('1749')) {
              {
              }
            } else {
              stryCov_9fa48('1749')
              // Shift down
              const { error: updateError } = await supabase
                .from(TABLE)
                .update(
                  stryMutAct_9fa48('1750')
                    ? {}
                    : (stryCov_9fa48('1750'),
                      {
                        carousel_order: newCarouselOrder
                      })
                )
                .eq(stryMutAct_9fa48('1751') ? '' : (stryCov_9fa48('1751'), 'id'), product.id)
              if (
                stryMutAct_9fa48('1753')
                  ? false
                  : stryMutAct_9fa48('1752')
                    ? true
                    : (stryCov_9fa48('1752', '1753'), updateError)
              ) {
                if (stryMutAct_9fa48('1754')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1754')
                  throw updateError // Mapeo automático
                }
              }
              stryMutAct_9fa48('1755') ? shiftedCount-- : (stryCov_9fa48('1755'), shiftedCount++)
              logger.info(
                stryMutAct_9fa48('1756')
                  ? ''
                  : (stryCov_9fa48('1756'), 'Shifted product in carousel'),
                stryMutAct_9fa48('1757')
                  ? {}
                  : (stryCov_9fa48('1757'),
                    {
                      productId: product.id,
                      productName: product.name,
                      oldPosition: product.carousel_order,
                      newPosition: newCarouselOrder
                    })
              )
            }
          }
        }
      }
      return stryMutAct_9fa48('1758')
        ? {}
        : (stryCov_9fa48('1758'),
          {
            shiftedCount,
            removedProducts
          })
    }
  },
  stryMutAct_9fa48('1759') ? '' : (stryCov_9fa48('1759'), 'SELECT'),
  TABLE
)

/**
 * Reorder carousel products (batch update)
 * Used for drag-and-drop reordering
 *
 * @param {Array<{productId: number, newOrder: number}>} reorderMap
 * @returns {Promise<number>} Number of products updated
 */
export const reorderCarousel = withErrorMapping(
  async reorderMap => {
    if (stryMutAct_9fa48('1760')) {
      {
      }
    } else {
      stryCov_9fa48('1760')
      if (
        stryMutAct_9fa48('1763')
          ? !Array.isArray(reorderMap) && reorderMap.length === 0
          : stryMutAct_9fa48('1762')
            ? false
            : stryMutAct_9fa48('1761')
              ? true
              : (stryCov_9fa48('1761', '1762', '1763'),
                (stryMutAct_9fa48('1764')
                  ? Array.isArray(reorderMap)
                  : (stryCov_9fa48('1764'), !Array.isArray(reorderMap))) ||
                  (stryMutAct_9fa48('1766')
                    ? reorderMap.length !== 0
                    : stryMutAct_9fa48('1765')
                      ? false
                      : (stryCov_9fa48('1765', '1766'), reorderMap.length === 0)))
      ) {
        if (stryMutAct_9fa48('1767')) {
          {
          }
        } else {
          stryCov_9fa48('1767')
          throw new ValidationError(
            stryMutAct_9fa48('1768')
              ? ''
              : (stryCov_9fa48('1768'), 'reorderMap must be a non-empty array')
          )
        }
      }
      let updatedCount = 0
      for (const { productId, newOrder } of reorderMap) {
        if (stryMutAct_9fa48('1769')) {
          {
          }
        } else {
          stryCov_9fa48('1769')
          validateCarouselOrder(newOrder)
          const { error } = await supabase
            .from(TABLE)
            .update(
              stryMutAct_9fa48('1770')
                ? {}
                : (stryCov_9fa48('1770'),
                  {
                    carousel_order: newOrder
                  })
            )
            .eq(stryMutAct_9fa48('1771') ? '' : (stryCov_9fa48('1771'), 'id'), productId)
            .eq(
              stryMutAct_9fa48('1772') ? '' : (stryCov_9fa48('1772'), 'featured'),
              stryMutAct_9fa48('1773') ? false : (stryCov_9fa48('1773'), true)
            )
            .eq(
              stryMutAct_9fa48('1774') ? '' : (stryCov_9fa48('1774'), 'active'),
              stryMutAct_9fa48('1775') ? false : (stryCov_9fa48('1775'), true)
            )
          if (
            stryMutAct_9fa48('1777')
              ? false
              : stryMutAct_9fa48('1776')
                ? true
                : (stryCov_9fa48('1776', '1777'), error)
          ) {
            if (stryMutAct_9fa48('1778')) {
              {
              }
            } else {
              stryCov_9fa48('1778')
              // Map Supabase error automatically
              throw error
            }
          }
          stryMutAct_9fa48('1779') ? updatedCount-- : (stryCov_9fa48('1779'), updatedCount++)
        }
      }
      logger.info(
        stryMutAct_9fa48('1780') ? '' : (stryCov_9fa48('1780'), 'Reordered carousel products'),
        stryMutAct_9fa48('1781')
          ? {}
          : (stryCov_9fa48('1781'),
            {
              updatedCount
            })
      )
      return updatedCount
    }
  },
  stryMutAct_9fa48('1782') ? '' : (stryCov_9fa48('1782'), 'UPDATE'),
  TABLE
)

/**
 * Remove product from carousel
 * @param {number} productId - Product to remove
 * @returns {Promise<void>}
 */
export const removeFromCarousel = withErrorMapping(
  async productId => {
    if (stryMutAct_9fa48('1783')) {
      {
      }
    } else {
      stryCov_9fa48('1783')
      const { error } = await supabase
        .from(TABLE)
        .update(
          stryMutAct_9fa48('1784')
            ? {}
            : (stryCov_9fa48('1784'),
              {
                featured: stryMutAct_9fa48('1785') ? true : (stryCov_9fa48('1785'), false),
                carousel_order: null
              })
        )
        .eq(stryMutAct_9fa48('1786') ? '' : (stryCov_9fa48('1786'), 'id'), productId)
      if (
        stryMutAct_9fa48('1788')
          ? false
          : stryMutAct_9fa48('1787')
            ? true
            : (stryCov_9fa48('1787', '1788'), error)
      ) {
        if (stryMutAct_9fa48('1789')) {
          {
          }
        } else {
          stryCov_9fa48('1789')
          // Map Supabase error automatically
          throw error
        }
      }
      logger.info(
        stryMutAct_9fa48('1790') ? '' : (stryCov_9fa48('1790'), 'Removed product from carousel'),
        stryMutAct_9fa48('1791')
          ? {}
          : (stryCov_9fa48('1791'),
            {
              productId
            })
      )
    }
  },
  stryMutAct_9fa48('1792') ? '' : (stryCov_9fa48('1792'), 'UPDATE'),
  TABLE
)

/**
 * Get available carousel positions (1-7)
 * Returns array of available positions based on current carousel state
 *
 * @param {number} excludeProductId - Product being edited (its position is available)
 * @returns {Promise<Array<number>>} Available positions
 */
export const getAvailablePositions = withErrorMapping(
  async (excludeProductId = null) => {
    if (stryMutAct_9fa48('1793')) {
      {
      }
    } else {
      stryCov_9fa48('1793')
      const products = await getCarouselProducts()

      // Filter out excluded product
      const occupiedPositions = stryMutAct_9fa48('1795')
        ? products.map(p => p.carousel_order).filter(order => order !== null)
        : stryMutAct_9fa48('1794')
          ? products.filter(p => p.id !== excludeProductId).map(p => p.carousel_order)
          : (stryCov_9fa48('1794', '1795'),
            products
              .filter(
                stryMutAct_9fa48('1796')
                  ? () => undefined
                  : (stryCov_9fa48('1796'),
                    p =>
                      stryMutAct_9fa48('1799')
                        ? p.id === excludeProductId
                        : stryMutAct_9fa48('1798')
                          ? false
                          : stryMutAct_9fa48('1797')
                            ? true
                            : (stryCov_9fa48('1797', '1798', '1799'), p.id !== excludeProductId))
              )
              .map(
                stryMutAct_9fa48('1800')
                  ? () => undefined
                  : (stryCov_9fa48('1800'), p => p.carousel_order)
              )
              .filter(
                stryMutAct_9fa48('1801')
                  ? () => undefined
                  : (stryCov_9fa48('1801'),
                    order =>
                      stryMutAct_9fa48('1804')
                        ? order === null
                        : stryMutAct_9fa48('1803')
                          ? false
                          : stryMutAct_9fa48('1802')
                            ? true
                            : (stryCov_9fa48('1802', '1803', '1804'), order !== null))
              ))

      // Generate available positions (1-7 minus occupied)
      const allPositions = Array.from(
        stryMutAct_9fa48('1805')
          ? {}
          : (stryCov_9fa48('1805'),
            {
              length: CAROUSEL.MAX_SIZE
            }),
        stryMutAct_9fa48('1806')
          ? () => undefined
          : (stryCov_9fa48('1806'),
            (_, i) => (stryMutAct_9fa48('1807') ? i - 1 : (stryCov_9fa48('1807'), i + 1)))
      )
      const available = stryMutAct_9fa48('1808')
        ? allPositions
        : (stryCov_9fa48('1808'),
          allPositions.filter(
            stryMutAct_9fa48('1809')
              ? () => undefined
              : (stryCov_9fa48('1809'),
                pos =>
                  stryMutAct_9fa48('1810')
                    ? occupiedPositions.includes(pos)
                    : (stryCov_9fa48('1810'), !occupiedPositions.includes(pos)))
          ))
      return available
    }
  },
  stryMutAct_9fa48('1811') ? '' : (stryCov_9fa48('1811'), 'SELECT'),
  TABLE
)
