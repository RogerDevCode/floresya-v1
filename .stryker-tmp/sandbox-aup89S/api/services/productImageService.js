/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Product Image Service
 * CRUD operations for product images with soft-delete pattern
 * Uses stored functions for atomic multi-image operations
 * Uses indexed columns (product_id, size, is_primary)
 * Soft-delete implementation using active flag (inactive images excluded by default)
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
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { QUERY_LIMITS } from '../config/constants.js'
import { validateProductImage } from '../utils/validation.js'
import { logger } from '../utils/logger.js'
const TABLE = stryMutAct_9fa48('4029')
  ? DB_SCHEMA.product_images?.table && 'product_images'
  : stryMutAct_9fa48('4028')
    ? false
    : stryMutAct_9fa48('4027')
      ? true
      : (stryCov_9fa48('4027', '4028', '4029'),
        (stryMutAct_9fa48('4030')
          ? DB_SCHEMA.product_images.table
          : (stryCov_9fa48('4030'), DB_SCHEMA.product_images?.table)) ||
          (stryMutAct_9fa48('4031') ? '' : (stryCov_9fa48('4031'), 'product_images')))
const VALID_SIZES = stryMutAct_9fa48('4034')
  ? DB_SCHEMA.product_images?.enums?.size && ['thumb', 'small', 'medium', 'large']
  : stryMutAct_9fa48('4033')
    ? false
    : stryMutAct_9fa48('4032')
      ? true
      : (stryCov_9fa48('4032', '4033', '4034'),
        (stryMutAct_9fa48('4036')
          ? DB_SCHEMA.product_images.enums?.size
          : stryMutAct_9fa48('4035')
            ? DB_SCHEMA.product_images?.enums.size
            : (stryCov_9fa48('4035', '4036'), DB_SCHEMA.product_images?.enums?.size)) ||
          (stryMutAct_9fa48('4037')
            ? []
            : (stryCov_9fa48('4037'),
              [
                stryMutAct_9fa48('4038') ? '' : (stryCov_9fa48('4038'), 'thumb'),
                stryMutAct_9fa48('4039') ? '' : (stryCov_9fa48('4039'), 'small'),
                stryMutAct_9fa48('4040') ? '' : (stryCov_9fa48('4040'), 'medium'),
                stryMutAct_9fa48('4041') ? '' : (stryCov_9fa48('4041'), 'large')
              ])))

/**
 * Get all images for a product with optional filtering by size and primary status
 * @param {number} productId - Product ID to get images for
 * @param {Object} [filters={}] - Filter options
 * @param {string} [filters.size] - Filter by image size
 * @param {boolean} [filters.is_primary] - Filter by primary image status
 * @returns {Object[]} - Array of product images ordered by image_index
 * @throws {BadRequestError} When productId is invalid
 * @throws {NotFoundError} When no images are found for the product
 * @throws {DatabaseError} When database query fails
 */
export async function getProductImages(productId, filters = {}) {
  if (stryMutAct_9fa48('4042')) {
    {
    }
  } else {
    stryCov_9fa48('4042')
    try {
      if (stryMutAct_9fa48('4043')) {
        {
        }
      } else {
        stryCov_9fa48('4043')
        if (
          stryMutAct_9fa48('4046')
            ? (!productId || typeof productId !== 'number') && productId <= 0
            : stryMutAct_9fa48('4045')
              ? false
              : stryMutAct_9fa48('4044')
                ? true
                : (stryCov_9fa48('4044', '4045', '4046'),
                  (stryMutAct_9fa48('4048')
                    ? !productId && typeof productId !== 'number'
                    : stryMutAct_9fa48('4047')
                      ? false
                      : (stryCov_9fa48('4047', '4048'),
                        (stryMutAct_9fa48('4049')
                          ? productId
                          : (stryCov_9fa48('4049'), !productId)) ||
                          (stryMutAct_9fa48('4051')
                            ? typeof productId === 'number'
                            : stryMutAct_9fa48('4050')
                              ? false
                              : (stryCov_9fa48('4050', '4051'),
                                typeof productId !==
                                  (stryMutAct_9fa48('4052')
                                    ? ''
                                    : (stryCov_9fa48('4052'), 'number')))))) ||
                    (stryMutAct_9fa48('4055')
                      ? productId > 0
                      : stryMutAct_9fa48('4054')
                        ? productId < 0
                        : stryMutAct_9fa48('4053')
                          ? false
                          : (stryCov_9fa48('4053', '4054', '4055'), productId <= 0)))
        ) {
          if (stryMutAct_9fa48('4056')) {
            {
            }
          } else {
            stryCov_9fa48('4056')
            throw new BadRequestError(
              stryMutAct_9fa48('4057')
                ? ''
                : (stryCov_9fa48('4057'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4058')
                ? {}
                : (stryCov_9fa48('4058'),
                  {
                    productId
                  })
            )
          }
        }
        let query = supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4059') ? '' : (stryCov_9fa48('4059'), '*'))
          .eq(stryMutAct_9fa48('4060') ? '' : (stryCov_9fa48('4060'), 'product_id'), productId)
        if (
          stryMutAct_9fa48('4063')
            ? filters.size || VALID_SIZES.includes(filters.size)
            : stryMutAct_9fa48('4062')
              ? false
              : stryMutAct_9fa48('4061')
                ? true
                : (stryCov_9fa48('4061', '4062', '4063'),
                  filters.size && VALID_SIZES.includes(filters.size))
        ) {
          if (stryMutAct_9fa48('4064')) {
            {
            }
          } else {
            stryCov_9fa48('4064')
            query = query.eq(
              stryMutAct_9fa48('4065') ? '' : (stryCov_9fa48('4065'), 'size'),
              filters.size
            )
          }
        }
        if (
          stryMutAct_9fa48('4068')
            ? filters.is_primary === undefined
            : stryMutAct_9fa48('4067')
              ? false
              : stryMutAct_9fa48('4066')
                ? true
                : (stryCov_9fa48('4066', '4067', '4068'), filters.is_primary !== undefined)
        ) {
          if (stryMutAct_9fa48('4069')) {
            {
            }
          } else {
            stryCov_9fa48('4069')
            query = query.eq(
              stryMutAct_9fa48('4070') ? '' : (stryCov_9fa48('4070'), 'is_primary'),
              filters.is_primary
            )
          }
        }
        query = query.order(
          stryMutAct_9fa48('4071') ? '' : (stryCov_9fa48('4071'), 'image_index'),
          stryMutAct_9fa48('4072')
            ? {}
            : (stryCov_9fa48('4072'),
              {
                ascending: stryMutAct_9fa48('4073') ? false : (stryCov_9fa48('4073'), true)
              })
        )
        const { data, error } = await query
        if (
          stryMutAct_9fa48('4075')
            ? false
            : stryMutAct_9fa48('4074')
              ? true
              : (stryCov_9fa48('4074', '4075'), error)
        ) {
          if (stryMutAct_9fa48('4076')) {
            {
            }
          } else {
            stryCov_9fa48('4076')
            throw new DatabaseError(
              stryMutAct_9fa48('4077') ? '' : (stryCov_9fa48('4077'), 'SELECT'),
              TABLE,
              error,
              stryMutAct_9fa48('4078')
                ? {}
                : (stryCov_9fa48('4078'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4081')
            ? false
            : stryMutAct_9fa48('4080')
              ? true
              : stryMutAct_9fa48('4079')
                ? data
                : (stryCov_9fa48('4079', '4080', '4081'), !data)
        ) {
          if (stryMutAct_9fa48('4082')) {
            {
            }
          } else {
            stryCov_9fa48('4082')
            throw new NotFoundError(
              stryMutAct_9fa48('4083') ? '' : (stryCov_9fa48('4083'), 'Product images'),
              productId,
              stryMutAct_9fa48('4084')
                ? {}
                : (stryCov_9fa48('4084'),
                  {
                    productId
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4085')) {
        {
        }
      } else {
        stryCov_9fa48('4085')
        logger.error(
          stryMutAct_9fa48('4086')
            ? ``
            : (stryCov_9fa48('4086'), `getProductImages(${productId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get primary image for a product (indexed query)
 * Falls back to first available image if no primary image exists
 */
export async function getPrimaryImage(productId) {
  if (stryMutAct_9fa48('4087')) {
    {
    }
  } else {
    stryCov_9fa48('4087')
    try {
      if (stryMutAct_9fa48('4088')) {
        {
        }
      } else {
        stryCov_9fa48('4088')
        if (
          stryMutAct_9fa48('4091')
            ? (!productId || typeof productId !== 'number') && productId <= 0
            : stryMutAct_9fa48('4090')
              ? false
              : stryMutAct_9fa48('4089')
                ? true
                : (stryCov_9fa48('4089', '4090', '4091'),
                  (stryMutAct_9fa48('4093')
                    ? !productId && typeof productId !== 'number'
                    : stryMutAct_9fa48('4092')
                      ? false
                      : (stryCov_9fa48('4092', '4093'),
                        (stryMutAct_9fa48('4094')
                          ? productId
                          : (stryCov_9fa48('4094'), !productId)) ||
                          (stryMutAct_9fa48('4096')
                            ? typeof productId === 'number'
                            : stryMutAct_9fa48('4095')
                              ? false
                              : (stryCov_9fa48('4095', '4096'),
                                typeof productId !==
                                  (stryMutAct_9fa48('4097')
                                    ? ''
                                    : (stryCov_9fa48('4097'), 'number')))))) ||
                    (stryMutAct_9fa48('4100')
                      ? productId > 0
                      : stryMutAct_9fa48('4099')
                        ? productId < 0
                        : stryMutAct_9fa48('4098')
                          ? false
                          : (stryCov_9fa48('4098', '4099', '4100'), productId <= 0)))
        ) {
          if (stryMutAct_9fa48('4101')) {
            {
            }
          } else {
            stryCov_9fa48('4101')
            throw new BadRequestError(
              stryMutAct_9fa48('4102')
                ? ''
                : (stryCov_9fa48('4102'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4103')
                ? {}
                : (stryCov_9fa48('4103'),
                  {
                    productId
                  })
            )
          }
        }

        // First, try to get the actual primary image
        const { data: primaryImage, error: primaryError } = await supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4104') ? '' : (stryCov_9fa48('4104'), '*'))
          .eq(stryMutAct_9fa48('4105') ? '' : (stryCov_9fa48('4105'), 'product_id'), productId)
          .eq(
            stryMutAct_9fa48('4106') ? '' : (stryCov_9fa48('4106'), 'is_primary'),
            stryMutAct_9fa48('4107') ? false : (stryCov_9fa48('4107'), true)
          )
          .eq(
            stryMutAct_9fa48('4108') ? '' : (stryCov_9fa48('4108'), 'size'),
            stryMutAct_9fa48('4109') ? '' : (stryCov_9fa48('4109'), 'medium')
          )
          .single()
        if (
          stryMutAct_9fa48('4111')
            ? false
            : stryMutAct_9fa48('4110')
              ? true
              : (stryCov_9fa48('4110', '4111'), primaryError)
        ) {
          if (stryMutAct_9fa48('4112')) {
            {
            }
          } else {
            stryCov_9fa48('4112')
            if (
              stryMutAct_9fa48('4115')
                ? primaryError.code !== 'PGRST116'
                : stryMutAct_9fa48('4114')
                  ? false
                  : stryMutAct_9fa48('4113')
                    ? true
                    : (stryCov_9fa48('4113', '4114', '4115'),
                      primaryError.code ===
                        (stryMutAct_9fa48('4116') ? '' : (stryCov_9fa48('4116'), 'PGRST116')))
            ) {
              if (stryMutAct_9fa48('4117')) {
                {
                }
              } else {
                stryCov_9fa48('4117')
                // No primary image found, try to get the first available image as fallback
                const { data: fallbackImage, error: fallbackError } = await supabase
                  .from(TABLE)
                  .select(stryMutAct_9fa48('4118') ? '' : (stryCov_9fa48('4118'), '*'))
                  .eq(
                    stryMutAct_9fa48('4119') ? '' : (stryCov_9fa48('4119'), 'product_id'),
                    productId
                  )
                  .order(
                    stryMutAct_9fa48('4120') ? '' : (stryCov_9fa48('4120'), 'image_index'),
                    stryMutAct_9fa48('4121')
                      ? {}
                      : (stryCov_9fa48('4121'),
                        {
                          ascending: stryMutAct_9fa48('4122')
                            ? false
                            : (stryCov_9fa48('4122'), true)
                        })
                  )
                  .limit(QUERY_LIMITS.SINGLE_RECORD)
                  .maybeSingle()
                if (
                  stryMutAct_9fa48('4124')
                    ? false
                    : stryMutAct_9fa48('4123')
                      ? true
                      : (stryCov_9fa48('4123', '4124'), fallbackError)
                ) {
                  if (stryMutAct_9fa48('4125')) {
                    {
                    }
                  } else {
                    stryCov_9fa48('4125')
                    throw new DatabaseError(
                      stryMutAct_9fa48('4126') ? '' : (stryCov_9fa48('4126'), 'SELECT'),
                      TABLE,
                      fallbackError,
                      stryMutAct_9fa48('4127')
                        ? {}
                        : (stryCov_9fa48('4127'),
                          {
                            productId
                          })
                    )
                  }
                }
                if (
                  stryMutAct_9fa48('4129')
                    ? false
                    : stryMutAct_9fa48('4128')
                      ? true
                      : (stryCov_9fa48('4128', '4129'), fallbackImage)
                ) {
                  if (stryMutAct_9fa48('4130')) {
                    {
                    }
                  } else {
                    stryCov_9fa48('4130')
                    // Return the fallback image (first available)
                    return fallbackImage
                  }
                } else {
                  if (stryMutAct_9fa48('4131')) {
                    {
                    }
                  } else {
                    stryCov_9fa48('4131')
                    // No images at all for this product
                    throw new NotFoundError(
                      stryMutAct_9fa48('4132') ? '' : (stryCov_9fa48('4132'), 'Primary image'),
                      productId,
                      stryMutAct_9fa48('4133')
                        ? {}
                        : (stryCov_9fa48('4133'),
                          {
                            productId
                          })
                    )
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48('4134')) {
                {
                }
              } else {
                stryCov_9fa48('4134')
                throw new DatabaseError(
                  stryMutAct_9fa48('4135') ? '' : (stryCov_9fa48('4135'), 'SELECT'),
                  TABLE,
                  primaryError,
                  stryMutAct_9fa48('4136')
                    ? {}
                    : (stryCov_9fa48('4136'),
                      {
                        productId
                      })
                )
              }
            }
          }
        }
        return primaryImage
      }
    } catch (error) {
      if (stryMutAct_9fa48('4137')) {
        {
        }
      } else {
        stryCov_9fa48('4137')
        logger.error(
          stryMutAct_9fa48('4138')
            ? ``
            : (stryCov_9fa48('4138'), `getPrimaryImage(${productId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get image by ID
 * @param {number} id - Image ID to retrieve
 * @param {boolean} includeDeactivated - Include inactive images (default: false, admin only)
 * @returns {Object} - Image object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When image is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getImageById(
  id,
  includeDeactivated = stryMutAct_9fa48('4139') ? true : (stryCov_9fa48('4139'), false)
) {
  if (stryMutAct_9fa48('4140')) {
    {
    }
  } else {
    stryCov_9fa48('4140')
    try {
      if (stryMutAct_9fa48('4141')) {
        {
        }
      } else {
        stryCov_9fa48('4141')
        if (
          stryMutAct_9fa48('4144')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('4143')
              ? false
              : stryMutAct_9fa48('4142')
                ? true
                : (stryCov_9fa48('4142', '4143', '4144'),
                  (stryMutAct_9fa48('4145') ? id : (stryCov_9fa48('4145'), !id)) ||
                    (stryMutAct_9fa48('4147')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('4146')
                        ? false
                        : (stryCov_9fa48('4146', '4147'),
                          typeof id !==
                            (stryMutAct_9fa48('4148') ? '' : (stryCov_9fa48('4148'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4149')) {
            {
            }
          } else {
            stryCov_9fa48('4149')
            throw new BadRequestError(
              stryMutAct_9fa48('4150')
                ? ''
                : (stryCov_9fa48('4150'), 'Invalid image ID: must be a number'),
              stryMutAct_9fa48('4151')
                ? {}
                : (stryCov_9fa48('4151'),
                  {
                    imageId: id
                  })
            )
          }
        }
        let query = supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4152') ? '' : (stryCov_9fa48('4152'), '*'))
          .eq(stryMutAct_9fa48('4153') ? '' : (stryCov_9fa48('4153'), 'id'), id)

        // By default, only return active images
        if (
          stryMutAct_9fa48('4156')
            ? false
            : stryMutAct_9fa48('4155')
              ? true
              : stryMutAct_9fa48('4154')
                ? includeDeactivated
                : (stryCov_9fa48('4154', '4155', '4156'), !includeDeactivated)
        ) {
          if (stryMutAct_9fa48('4157')) {
            {
            }
          } else {
            stryCov_9fa48('4157')
            query = query.eq(
              stryMutAct_9fa48('4158') ? '' : (stryCov_9fa48('4158'), 'active'),
              stryMutAct_9fa48('4159') ? false : (stryCov_9fa48('4159'), true)
            )
          }
        }
        const { data, error } = await query.single()
        if (
          stryMutAct_9fa48('4161')
            ? false
            : stryMutAct_9fa48('4160')
              ? true
              : (stryCov_9fa48('4160', '4161'), error)
        ) {
          if (stryMutAct_9fa48('4162')) {
            {
            }
          } else {
            stryCov_9fa48('4162')
            throw new DatabaseError(
              stryMutAct_9fa48('4163') ? '' : (stryCov_9fa48('4163'), 'SELECT'),
              TABLE,
              error,
              stryMutAct_9fa48('4164')
                ? {}
                : (stryCov_9fa48('4164'),
                  {
                    imageId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4167')
            ? false
            : stryMutAct_9fa48('4166')
              ? true
              : stryMutAct_9fa48('4165')
                ? data
                : (stryCov_9fa48('4165', '4166', '4167'), !data)
        ) {
          if (stryMutAct_9fa48('4168')) {
            {
            }
          } else {
            stryCov_9fa48('4168')
            throw new NotFoundError(
              stryMutAct_9fa48('4169') ? '' : (stryCov_9fa48('4169'), 'Image'),
              id
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4170')) {
        {
        }
      } else {
        stryCov_9fa48('4170')
        logger.error(
          stryMutAct_9fa48('4171') ? `` : (stryCov_9fa48('4171'), `getImageById(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get images by file hash (deduplication check)
 */
export async function getImagesByHash(fileHash) {
  if (stryMutAct_9fa48('4172')) {
    {
    }
  } else {
    stryCov_9fa48('4172')
    try {
      if (stryMutAct_9fa48('4173')) {
        {
        }
      } else {
        stryCov_9fa48('4173')
        if (
          stryMutAct_9fa48('4176')
            ? !fileHash && typeof fileHash !== 'string'
            : stryMutAct_9fa48('4175')
              ? false
              : stryMutAct_9fa48('4174')
                ? true
                : (stryCov_9fa48('4174', '4175', '4176'),
                  (stryMutAct_9fa48('4177') ? fileHash : (stryCov_9fa48('4177'), !fileHash)) ||
                    (stryMutAct_9fa48('4179')
                      ? typeof fileHash === 'string'
                      : stryMutAct_9fa48('4178')
                        ? false
                        : (stryCov_9fa48('4178', '4179'),
                          typeof fileHash !==
                            (stryMutAct_9fa48('4180') ? '' : (stryCov_9fa48('4180'), 'string')))))
        ) {
          if (stryMutAct_9fa48('4181')) {
            {
            }
          } else {
            stryCov_9fa48('4181')
            throw new BadRequestError(
              stryMutAct_9fa48('4182')
                ? ''
                : (stryCov_9fa48('4182'), 'Invalid file_hash: must be a string'),
              stryMutAct_9fa48('4183')
                ? {}
                : (stryCov_9fa48('4183'),
                  {
                    fileHash
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4184') ? '' : (stryCov_9fa48('4184'), '*'))
          .eq(stryMutAct_9fa48('4185') ? '' : (stryCov_9fa48('4185'), 'file_hash'), fileHash)
          .limit(1)
        if (
          stryMutAct_9fa48('4187')
            ? false
            : stryMutAct_9fa48('4186')
              ? true
              : (stryCov_9fa48('4186', '4187'), error)
        ) {
          if (stryMutAct_9fa48('4188')) {
            {
            }
          } else {
            stryCov_9fa48('4188')
            throw new DatabaseError(
              stryMutAct_9fa48('4189') ? '' : (stryCov_9fa48('4189'), 'SELECT'),
              TABLE,
              error
            )
          }
        }
        return stryMutAct_9fa48('4192')
          ? data && []
          : stryMutAct_9fa48('4191')
            ? false
            : stryMutAct_9fa48('4190')
              ? true
              : (stryCov_9fa48('4190', '4191', '4192'),
                data ||
                  (stryMutAct_9fa48('4193') ? ['Stryker was here'] : (stryCov_9fa48('4193'), [])))
      }
    } catch (error) {
      if (stryMutAct_9fa48('4194')) {
        {
        }
      } else {
        stryCov_9fa48('4194')
        logger.error(
          stryMutAct_9fa48('4195')
            ? ``
            : (stryCov_9fa48('4195'), `getImagesByHash(${fileHash}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Create single image
 */
export async function createImage(imageData) {
  if (stryMutAct_9fa48('4196')) {
    {
    }
  } else {
    stryCov_9fa48('4196')
    try {
      if (stryMutAct_9fa48('4197')) {
        {
        }
      } else {
        stryCov_9fa48('4197')
        validateProductImage(
          imageData,
          stryMutAct_9fa48('4198') ? true : (stryCov_9fa48('4198'), false)
        )
        const newImage = stryMutAct_9fa48('4199')
          ? {}
          : (stryCov_9fa48('4199'),
            {
              product_id: imageData.product_id,
              image_index: imageData.image_index,
              size: imageData.size,
              url: imageData.url,
              file_hash: imageData.file_hash,
              mime_type: stryMutAct_9fa48('4202')
                ? imageData.mime_type && 'image/webp'
                : stryMutAct_9fa48('4201')
                  ? false
                  : stryMutAct_9fa48('4200')
                    ? true
                    : (stryCov_9fa48('4200', '4201', '4202'),
                      imageData.mime_type ||
                        (stryMutAct_9fa48('4203') ? '' : (stryCov_9fa48('4203'), 'image/webp'))),
              is_primary: stryMutAct_9fa48('4206')
                ? imageData.is_primary && false
                : stryMutAct_9fa48('4205')
                  ? false
                  : stryMutAct_9fa48('4204')
                    ? true
                    : (stryCov_9fa48('4204', '4205', '4206'),
                      imageData.is_primary ||
                        (stryMutAct_9fa48('4207') ? true : (stryCov_9fa48('4207'), false)))
            })
        const { data, error } = await supabase.from(TABLE).insert(newImage).select().single()
        if (
          stryMutAct_9fa48('4209')
            ? false
            : stryMutAct_9fa48('4208')
              ? true
              : (stryCov_9fa48('4208', '4209'), error)
        ) {
          if (stryMutAct_9fa48('4210')) {
            {
            }
          } else {
            stryCov_9fa48('4210')
            if (
              stryMutAct_9fa48('4213')
                ? error.code !== '23505'
                : stryMutAct_9fa48('4212')
                  ? false
                  : stryMutAct_9fa48('4211')
                    ? true
                    : (stryCov_9fa48('4211', '4212', '4213'),
                      error.code ===
                        (stryMutAct_9fa48('4214') ? '' : (stryCov_9fa48('4214'), '23505')))
            ) {
              if (stryMutAct_9fa48('4215')) {
                {
                }
              } else {
                stryCov_9fa48('4215')
                throw new DatabaseConstraintError(
                  stryMutAct_9fa48('4216') ? '' : (stryCov_9fa48('4216'), 'unique_image'),
                  TABLE,
                  stryMutAct_9fa48('4217')
                    ? {}
                    : (stryCov_9fa48('4217'),
                      {
                        product_id: imageData.product_id,
                        image_index: imageData.image_index,
                        size: imageData.size,
                        message: stryMutAct_9fa48('4218')
                          ? ``
                          : (stryCov_9fa48('4218'),
                            `Image already exists for product ${imageData.product_id}, index ${imageData.image_index}, size ${imageData.size}`)
                      })
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('4219') ? '' : (stryCov_9fa48('4219'), 'INSERT'),
              TABLE,
              error,
              stryMutAct_9fa48('4220')
                ? {}
                : (stryCov_9fa48('4220'),
                  {
                    imageData
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4223')
            ? false
            : stryMutAct_9fa48('4222')
              ? true
              : stryMutAct_9fa48('4221')
                ? data
                : (stryCov_9fa48('4221', '4222', '4223'), !data)
        ) {
          if (stryMutAct_9fa48('4224')) {
            {
            }
          } else {
            stryCov_9fa48('4224')
            throw new DatabaseError(
              stryMutAct_9fa48('4225') ? '' : (stryCov_9fa48('4225'), 'INSERT'),
              TABLE,
              new InternalServerError(
                stryMutAct_9fa48('4226')
                  ? ''
                  : (stryCov_9fa48('4226'), 'No data returned after insert')
              ),
              stryMutAct_9fa48('4227')
                ? {}
                : (stryCov_9fa48('4227'),
                  {
                    imageData
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4228')) {
        {
        }
      } else {
        stryCov_9fa48('4228')
        logger.error(
          stryMutAct_9fa48('4229') ? '' : (stryCov_9fa48('4229'), 'createImage failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Create multiple images atomically (manual batch insert)
 * Creates all sizes for a single image_index
 */
export async function createProductImagesAtomic(
  productId,
  imageIndex,
  imagesData,
  isPrimary = stryMutAct_9fa48('4230') ? true : (stryCov_9fa48('4230'), false)
) {
  if (stryMutAct_9fa48('4231')) {
    {
    }
  } else {
    stryCov_9fa48('4231')
    try {
      if (stryMutAct_9fa48('4232')) {
        {
        }
      } else {
        stryCov_9fa48('4232')
        if (
          stryMutAct_9fa48('4235')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('4234')
              ? false
              : stryMutAct_9fa48('4233')
                ? true
                : (stryCov_9fa48('4233', '4234', '4235'),
                  (stryMutAct_9fa48('4236') ? productId : (stryCov_9fa48('4236'), !productId)) ||
                    (stryMutAct_9fa48('4238')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('4237')
                        ? false
                        : (stryCov_9fa48('4237', '4238'),
                          typeof productId !==
                            (stryMutAct_9fa48('4239') ? '' : (stryCov_9fa48('4239'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4240')) {
            {
            }
          } else {
            stryCov_9fa48('4240')
            throw new BadRequestError(
              stryMutAct_9fa48('4241')
                ? ''
                : (stryCov_9fa48('4241'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4242')
                ? {}
                : (stryCov_9fa48('4242'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4245')
            ? (!imageIndex || typeof imageIndex !== 'number') && imageIndex <= 0
            : stryMutAct_9fa48('4244')
              ? false
              : stryMutAct_9fa48('4243')
                ? true
                : (stryCov_9fa48('4243', '4244', '4245'),
                  (stryMutAct_9fa48('4247')
                    ? !imageIndex && typeof imageIndex !== 'number'
                    : stryMutAct_9fa48('4246')
                      ? false
                      : (stryCov_9fa48('4246', '4247'),
                        (stryMutAct_9fa48('4248')
                          ? imageIndex
                          : (stryCov_9fa48('4248'), !imageIndex)) ||
                          (stryMutAct_9fa48('4250')
                            ? typeof imageIndex === 'number'
                            : stryMutAct_9fa48('4249')
                              ? false
                              : (stryCov_9fa48('4249', '4250'),
                                typeof imageIndex !==
                                  (stryMutAct_9fa48('4251')
                                    ? ''
                                    : (stryCov_9fa48('4251'), 'number')))))) ||
                    (stryMutAct_9fa48('4254')
                      ? imageIndex > 0
                      : stryMutAct_9fa48('4253')
                        ? imageIndex < 0
                        : stryMutAct_9fa48('4252')
                          ? false
                          : (stryCov_9fa48('4252', '4253', '4254'), imageIndex <= 0)))
        ) {
          if (stryMutAct_9fa48('4255')) {
            {
            }
          } else {
            stryCov_9fa48('4255')
            throw new BadRequestError(
              stryMutAct_9fa48('4256')
                ? ''
                : (stryCov_9fa48('4256'), 'Invalid image_index: must be a positive number'),
              stryMutAct_9fa48('4257')
                ? {}
                : (stryCov_9fa48('4257'),
                  {
                    imageIndex
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4260')
            ? !Array.isArray(imagesData) && imagesData.length === 0
            : stryMutAct_9fa48('4259')
              ? false
              : stryMutAct_9fa48('4258')
                ? true
                : (stryCov_9fa48('4258', '4259', '4260'),
                  (stryMutAct_9fa48('4261')
                    ? Array.isArray(imagesData)
                    : (stryCov_9fa48('4261'), !Array.isArray(imagesData))) ||
                    (stryMutAct_9fa48('4263')
                      ? imagesData.length !== 0
                      : stryMutAct_9fa48('4262')
                        ? false
                        : (stryCov_9fa48('4262', '4263'), imagesData.length === 0)))
        ) {
          if (stryMutAct_9fa48('4264')) {
            {
            }
          } else {
            stryCov_9fa48('4264')
            throw new BadRequestError(
              stryMutAct_9fa48('4265')
                ? ''
                : (stryCov_9fa48('4265'), 'Invalid imagesData: must be a non-empty array'),
              stryMutAct_9fa48('4266')
                ? {}
                : (stryCov_9fa48('4266'),
                  {
                    imagesData
                  })
            )
          }
        }

        // Validate and prepare each image
        const imagesToInsert = imagesData.map(img => {
          if (stryMutAct_9fa48('4267')) {
            {
            }
          } else {
            stryCov_9fa48('4267')
            if (
              stryMutAct_9fa48('4270')
                ? !img.size && !VALID_SIZES.includes(img.size)
                : stryMutAct_9fa48('4269')
                  ? false
                  : stryMutAct_9fa48('4268')
                    ? true
                    : (stryCov_9fa48('4268', '4269', '4270'),
                      (stryMutAct_9fa48('4271') ? img.size : (stryCov_9fa48('4271'), !img.size)) ||
                        (stryMutAct_9fa48('4272')
                          ? VALID_SIZES.includes(img.size)
                          : (stryCov_9fa48('4272'), !VALID_SIZES.includes(img.size))))
            ) {
              if (stryMutAct_9fa48('4273')) {
                {
                }
              } else {
                stryCov_9fa48('4273')
                throw new ValidationError(
                  stryMutAct_9fa48('4274')
                    ? ''
                    : (stryCov_9fa48('4274'), 'Image validation failed'),
                  stryMutAct_9fa48('4275')
                    ? {}
                    : (stryCov_9fa48('4275'),
                      {
                        size: stryMutAct_9fa48('4276')
                          ? ``
                          : (stryCov_9fa48('4276'),
                            `must be one of ${VALID_SIZES.join(stryMutAct_9fa48('4277') ? '' : (stryCov_9fa48('4277'), ', '))}`)
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('4280')
                ? !img.url && typeof img.url !== 'string'
                : stryMutAct_9fa48('4279')
                  ? false
                  : stryMutAct_9fa48('4278')
                    ? true
                    : (stryCov_9fa48('4278', '4279', '4280'),
                      (stryMutAct_9fa48('4281') ? img.url : (stryCov_9fa48('4281'), !img.url)) ||
                        (stryMutAct_9fa48('4283')
                          ? typeof img.url === 'string'
                          : stryMutAct_9fa48('4282')
                            ? false
                            : (stryCov_9fa48('4282', '4283'),
                              typeof img.url !==
                                (stryMutAct_9fa48('4284')
                                  ? ''
                                  : (stryCov_9fa48('4284'), 'string')))))
            ) {
              if (stryMutAct_9fa48('4285')) {
                {
                }
              } else {
                stryCov_9fa48('4285')
                throw new ValidationError(
                  stryMutAct_9fa48('4286')
                    ? ''
                    : (stryCov_9fa48('4286'), 'Image validation failed'),
                  stryMutAct_9fa48('4287')
                    ? {}
                    : (stryCov_9fa48('4287'),
                      {
                        url: stryMutAct_9fa48('4288')
                          ? ''
                          : (stryCov_9fa48('4288'), 'must be a non-empty string')
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('4291')
                ? !img.file_hash && typeof img.file_hash !== 'string'
                : stryMutAct_9fa48('4290')
                  ? false
                  : stryMutAct_9fa48('4289')
                    ? true
                    : (stryCov_9fa48('4289', '4290', '4291'),
                      (stryMutAct_9fa48('4292')
                        ? img.file_hash
                        : (stryCov_9fa48('4292'), !img.file_hash)) ||
                        (stryMutAct_9fa48('4294')
                          ? typeof img.file_hash === 'string'
                          : stryMutAct_9fa48('4293')
                            ? false
                            : (stryCov_9fa48('4293', '4294'),
                              typeof img.file_hash !==
                                (stryMutAct_9fa48('4295')
                                  ? ''
                                  : (stryCov_9fa48('4295'), 'string')))))
            ) {
              if (stryMutAct_9fa48('4296')) {
                {
                }
              } else {
                stryCov_9fa48('4296')
                throw new ValidationError(
                  stryMutAct_9fa48('4297')
                    ? ''
                    : (stryCov_9fa48('4297'), 'Image validation failed'),
                  stryMutAct_9fa48('4298')
                    ? {}
                    : (stryCov_9fa48('4298'),
                      {
                        file_hash: stryMutAct_9fa48('4299')
                          ? ''
                          : (stryCov_9fa48('4299'), 'must be a non-empty string')
                      })
                )
              }
            }
            return stryMutAct_9fa48('4300')
              ? {}
              : (stryCov_9fa48('4300'),
                {
                  product_id: productId,
                  image_index: imageIndex,
                  size: img.size,
                  url: img.url,
                  file_hash: img.file_hash,
                  mime_type: stryMutAct_9fa48('4303')
                    ? img.mime_type && 'image/webp'
                    : stryMutAct_9fa48('4302')
                      ? false
                      : stryMutAct_9fa48('4301')
                        ? true
                        : (stryCov_9fa48('4301', '4302', '4303'),
                          img.mime_type ||
                            (stryMutAct_9fa48('4304')
                              ? ''
                              : (stryCov_9fa48('4304'), 'image/webp'))),
                  // IMPORTANT: Only ONE image can be primary per product (DB constraint)
                  // Mark only the 'medium' size as primary when isPrimary=true
                  is_primary: stryMutAct_9fa48('4307')
                    ? isPrimary || img.size === 'medium'
                    : stryMutAct_9fa48('4306')
                      ? false
                      : stryMutAct_9fa48('4305')
                        ? true
                        : (stryCov_9fa48('4305', '4306', '4307'),
                          isPrimary &&
                            (stryMutAct_9fa48('4309')
                              ? img.size !== 'medium'
                              : stryMutAct_9fa48('4308')
                                ? true
                                : (stryCov_9fa48('4308', '4309'),
                                  img.size ===
                                    (stryMutAct_9fa48('4310')
                                      ? ''
                                      : (stryCov_9fa48('4310'), 'medium')))))
                })
          }
        })
        const { data, error } = await supabase.from(TABLE).insert(imagesToInsert).select()
        if (
          stryMutAct_9fa48('4312')
            ? false
            : stryMutAct_9fa48('4311')
              ? true
              : (stryCov_9fa48('4311', '4312'), error)
        ) {
          if (stryMutAct_9fa48('4313')) {
            {
            }
          } else {
            stryCov_9fa48('4313')
            throw new DatabaseError(
              stryMutAct_9fa48('4314') ? '' : (stryCov_9fa48('4314'), 'INSERT'),
              TABLE,
              error,
              stryMutAct_9fa48('4315')
                ? {}
                : (stryCov_9fa48('4315'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4318')
            ? false
            : stryMutAct_9fa48('4317')
              ? true
              : stryMutAct_9fa48('4316')
                ? data
                : (stryCov_9fa48('4316', '4317', '4318'), !data)
        ) {
          if (stryMutAct_9fa48('4319')) {
            {
            }
          } else {
            stryCov_9fa48('4319')
            throw new DatabaseError(
              stryMutAct_9fa48('4320') ? '' : (stryCov_9fa48('4320'), 'INSERT'),
              TABLE,
              new InternalServerError(
                stryMutAct_9fa48('4321')
                  ? ''
                  : (stryCov_9fa48('4321'), 'No data returned after insert')
              ),
              stryMutAct_9fa48('4322')
                ? {}
                : (stryCov_9fa48('4322'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4323')) {
        {
        }
      } else {
        stryCov_9fa48('4323')
        logger.error(
          stryMutAct_9fa48('4324')
            ? ``
            : (stryCov_9fa48('4324'), `createProductImagesAtomic(${productId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update image
 */
export async function updateImage(id, updates) {
  if (stryMutAct_9fa48('4325')) {
    {
    }
  } else {
    stryCov_9fa48('4325')
    try {
      if (stryMutAct_9fa48('4326')) {
        {
        }
      } else {
        stryCov_9fa48('4326')
        if (
          stryMutAct_9fa48('4329')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('4328')
              ? false
              : stryMutAct_9fa48('4327')
                ? true
                : (stryCov_9fa48('4327', '4328', '4329'),
                  (stryMutAct_9fa48('4330') ? id : (stryCov_9fa48('4330'), !id)) ||
                    (stryMutAct_9fa48('4332')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('4331')
                        ? false
                        : (stryCov_9fa48('4331', '4332'),
                          typeof id !==
                            (stryMutAct_9fa48('4333') ? '' : (stryCov_9fa48('4333'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4334')) {
            {
            }
          } else {
            stryCov_9fa48('4334')
            throw new BadRequestError(
              stryMutAct_9fa48('4335')
                ? ''
                : (stryCov_9fa48('4335'), 'Invalid image ID: must be a number'),
              stryMutAct_9fa48('4336')
                ? {}
                : (stryCov_9fa48('4336'),
                  {
                    imageId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4339')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('4338')
              ? false
              : stryMutAct_9fa48('4337')
                ? true
                : (stryCov_9fa48('4337', '4338', '4339'),
                  (stryMutAct_9fa48('4340') ? updates : (stryCov_9fa48('4340'), !updates)) ||
                    (stryMutAct_9fa48('4342')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('4341')
                        ? false
                        : (stryCov_9fa48('4341', '4342'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('4343')) {
            {
            }
          } else {
            stryCov_9fa48('4343')
            throw new BadRequestError(
              stryMutAct_9fa48('4344') ? '' : (stryCov_9fa48('4344'), 'No updates provided'),
              stryMutAct_9fa48('4345')
                ? {}
                : (stryCov_9fa48('4345'),
                  {
                    imageId: id
                  })
            )
          }
        }
        validateProductImage(
          updates,
          stryMutAct_9fa48('4346') ? false : (stryCov_9fa48('4346'), true)
        )
        const allowedFields = stryMutAct_9fa48('4347')
          ? []
          : (stryCov_9fa48('4347'),
            [
              stryMutAct_9fa48('4348') ? '' : (stryCov_9fa48('4348'), 'url'),
              stryMutAct_9fa48('4349') ? '' : (stryCov_9fa48('4349'), 'file_hash'),
              stryMutAct_9fa48('4350') ? '' : (stryCov_9fa48('4350'), 'mime_type'),
              stryMutAct_9fa48('4351') ? '' : (stryCov_9fa48('4351'), 'is_primary')
            ])
        const sanitized = {}
        for (const key of allowedFields) {
          if (stryMutAct_9fa48('4352')) {
            {
            }
          } else {
            stryCov_9fa48('4352')
            if (
              stryMutAct_9fa48('4355')
                ? updates[key] === undefined
                : stryMutAct_9fa48('4354')
                  ? false
                  : stryMutAct_9fa48('4353')
                    ? true
                    : (stryCov_9fa48('4353', '4354', '4355'), updates[key] !== undefined)
            ) {
              if (stryMutAct_9fa48('4356')) {
                {
                }
              } else {
                stryCov_9fa48('4356')
                sanitized[key] = updates[key]
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('4359')
            ? Object.keys(sanitized).length !== 0
            : stryMutAct_9fa48('4358')
              ? false
              : stryMutAct_9fa48('4357')
                ? true
                : (stryCov_9fa48('4357', '4358', '4359'), Object.keys(sanitized).length === 0)
        ) {
          if (stryMutAct_9fa48('4360')) {
            {
            }
          } else {
            stryCov_9fa48('4360')
            throw new BadRequestError(
              stryMutAct_9fa48('4361') ? '' : (stryCov_9fa48('4361'), 'No valid fields to update'),
              stryMutAct_9fa48('4362')
                ? {}
                : (stryCov_9fa48('4362'),
                  {
                    imageId: id
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(sanitized)
          .eq(stryMutAct_9fa48('4363') ? '' : (stryCov_9fa48('4363'), 'id'), id)
          .select()
          .single()
        if (
          stryMutAct_9fa48('4365')
            ? false
            : stryMutAct_9fa48('4364')
              ? true
              : (stryCov_9fa48('4364', '4365'), error)
        ) {
          if (stryMutAct_9fa48('4366')) {
            {
            }
          } else {
            stryCov_9fa48('4366')
            throw new DatabaseError(
              stryMutAct_9fa48('4367') ? '' : (stryCov_9fa48('4367'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('4368')
                ? {}
                : (stryCov_9fa48('4368'),
                  {
                    imageId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4371')
            ? false
            : stryMutAct_9fa48('4370')
              ? true
              : stryMutAct_9fa48('4369')
                ? data
                : (stryCov_9fa48('4369', '4370', '4371'), !data)
        ) {
          if (stryMutAct_9fa48('4372')) {
            {
            }
          } else {
            stryCov_9fa48('4372')
            throw new NotFoundError(
              stryMutAct_9fa48('4373') ? '' : (stryCov_9fa48('4373'), 'Image'),
              id
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4374')) {
        {
        }
      } else {
        stryCov_9fa48('4374')
        logger.error(
          stryMutAct_9fa48('4375') ? `` : (stryCov_9fa48('4375'), `updateImage(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Set primary image
 */
export async function setPrimaryImage(productId, imageIndex) {
  if (stryMutAct_9fa48('4376')) {
    {
    }
  } else {
    stryCov_9fa48('4376')
    try {
      if (stryMutAct_9fa48('4377')) {
        {
        }
      } else {
        stryCov_9fa48('4377')
        if (
          stryMutAct_9fa48('4380')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('4379')
              ? false
              : stryMutAct_9fa48('4378')
                ? true
                : (stryCov_9fa48('4378', '4379', '4380'),
                  (stryMutAct_9fa48('4381') ? productId : (stryCov_9fa48('4381'), !productId)) ||
                    (stryMutAct_9fa48('4383')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('4382')
                        ? false
                        : (stryCov_9fa48('4382', '4383'),
                          typeof productId !==
                            (stryMutAct_9fa48('4384') ? '' : (stryCov_9fa48('4384'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4385')) {
            {
            }
          } else {
            stryCov_9fa48('4385')
            throw new BadRequestError(
              stryMutAct_9fa48('4386')
                ? ''
                : (stryCov_9fa48('4386'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4387')
                ? {}
                : (stryCov_9fa48('4387'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4390')
            ? (!imageIndex || typeof imageIndex !== 'number') && imageIndex <= 0
            : stryMutAct_9fa48('4389')
              ? false
              : stryMutAct_9fa48('4388')
                ? true
                : (stryCov_9fa48('4388', '4389', '4390'),
                  (stryMutAct_9fa48('4392')
                    ? !imageIndex && typeof imageIndex !== 'number'
                    : stryMutAct_9fa48('4391')
                      ? false
                      : (stryCov_9fa48('4391', '4392'),
                        (stryMutAct_9fa48('4393')
                          ? imageIndex
                          : (stryCov_9fa48('4393'), !imageIndex)) ||
                          (stryMutAct_9fa48('4395')
                            ? typeof imageIndex === 'number'
                            : stryMutAct_9fa48('4394')
                              ? false
                              : (stryCov_9fa48('4394', '4395'),
                                typeof imageIndex !==
                                  (stryMutAct_9fa48('4396')
                                    ? ''
                                    : (stryCov_9fa48('4396'), 'number')))))) ||
                    (stryMutAct_9fa48('4399')
                      ? imageIndex > 0
                      : stryMutAct_9fa48('4398')
                        ? imageIndex < 0
                        : stryMutAct_9fa48('4397')
                          ? false
                          : (stryCov_9fa48('4397', '4398', '4399'), imageIndex <= 0)))
        ) {
          if (stryMutAct_9fa48('4400')) {
            {
            }
          } else {
            stryCov_9fa48('4400')
            throw new BadRequestError(
              stryMutAct_9fa48('4401')
                ? ''
                : (stryCov_9fa48('4401'), 'Invalid image_index: must be a positive number'),
              stryMutAct_9fa48('4402')
                ? {}
                : (stryCov_9fa48('4402'),
                  {
                    imageIndex
                  })
            )
          }
        }

        // Unset all primary images for this product
        const { error: unsetError } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4403')
              ? {}
              : (stryCov_9fa48('4403'),
                {
                  is_primary: stryMutAct_9fa48('4404') ? true : (stryCov_9fa48('4404'), false)
                })
          )
          .eq(stryMutAct_9fa48('4405') ? '' : (stryCov_9fa48('4405'), 'product_id'), productId)
          .eq(
            stryMutAct_9fa48('4406') ? '' : (stryCov_9fa48('4406'), 'is_primary'),
            stryMutAct_9fa48('4407') ? false : (stryCov_9fa48('4407'), true)
          )
        if (
          stryMutAct_9fa48('4409')
            ? false
            : stryMutAct_9fa48('4408')
              ? true
              : (stryCov_9fa48('4408', '4409'), unsetError)
        ) {
          if (stryMutAct_9fa48('4410')) {
            {
            }
          } else {
            stryCov_9fa48('4410')
            throw new DatabaseError(
              stryMutAct_9fa48('4411') ? '' : (stryCov_9fa48('4411'), 'UPDATE'),
              TABLE,
              unsetError,
              stryMutAct_9fa48('4412')
                ? {}
                : (stryCov_9fa48('4412'),
                  {
                    productId
                  })
            )
          }
        }

        // Set new primary image (only medium size)
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4413')
              ? {}
              : (stryCov_9fa48('4413'),
                {
                  is_primary: stryMutAct_9fa48('4414') ? false : (stryCov_9fa48('4414'), true)
                })
          )
          .eq(stryMutAct_9fa48('4415') ? '' : (stryCov_9fa48('4415'), 'product_id'), productId)
          .eq(stryMutAct_9fa48('4416') ? '' : (stryCov_9fa48('4416'), 'image_index'), imageIndex)
          .eq(
            stryMutAct_9fa48('4417') ? '' : (stryCov_9fa48('4417'), 'size'),
            stryMutAct_9fa48('4418') ? '' : (stryCov_9fa48('4418'), 'medium')
          )
          .select()
          .single()
        if (
          stryMutAct_9fa48('4420')
            ? false
            : stryMutAct_9fa48('4419')
              ? true
              : (stryCov_9fa48('4419', '4420'), error)
        ) {
          if (stryMutAct_9fa48('4421')) {
            {
            }
          } else {
            stryCov_9fa48('4421')
            throw new DatabaseError(
              stryMutAct_9fa48('4422') ? '' : (stryCov_9fa48('4422'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('4423')
                ? {}
                : (stryCov_9fa48('4423'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4426')
            ? false
            : stryMutAct_9fa48('4425')
              ? true
              : stryMutAct_9fa48('4424')
                ? data
                : (stryCov_9fa48('4424', '4425', '4426'), !data)
        ) {
          if (stryMutAct_9fa48('4427')) {
            {
            }
          } else {
            stryCov_9fa48('4427')
            throw new NotFoundError(
              stryMutAct_9fa48('4428') ? '' : (stryCov_9fa48('4428'), 'Image'),
              stryMutAct_9fa48('4429') ? `` : (stryCov_9fa48('4429'), `${productId}/${imageIndex}`),
              stryMutAct_9fa48('4430')
                ? {}
                : (stryCov_9fa48('4430'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4431')) {
        {
        }
      } else {
        stryCov_9fa48('4431')
        logger.error(
          stryMutAct_9fa48('4432')
            ? ``
            : (stryCov_9fa48('4432'), `setPrimaryImage(${productId}, ${imageIndex}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Soft-delete single image
 * @param {number} id - Image ID to delete
 * @returns {Object} - Deactivated image
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When image is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteImage(id) {
  if (stryMutAct_9fa48('4433')) {
    {
    }
  } else {
    stryCov_9fa48('4433')
    try {
      if (stryMutAct_9fa48('4434')) {
        {
        }
      } else {
        stryCov_9fa48('4434')
        if (
          stryMutAct_9fa48('4437')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('4436')
              ? false
              : stryMutAct_9fa48('4435')
                ? true
                : (stryCov_9fa48('4435', '4436', '4437'),
                  (stryMutAct_9fa48('4438') ? id : (stryCov_9fa48('4438'), !id)) ||
                    (stryMutAct_9fa48('4440')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('4439')
                        ? false
                        : (stryCov_9fa48('4439', '4440'),
                          typeof id !==
                            (stryMutAct_9fa48('4441') ? '' : (stryCov_9fa48('4441'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4442')) {
            {
            }
          } else {
            stryCov_9fa48('4442')
            throw new BadRequestError(
              stryMutAct_9fa48('4443')
                ? ''
                : (stryCov_9fa48('4443'), 'Invalid image ID: must be a number'),
              stryMutAct_9fa48('4444')
                ? {}
                : (stryCov_9fa48('4444'),
                  {
                    imageId: id
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4445')
              ? {}
              : (stryCov_9fa48('4445'),
                {
                  active: stryMutAct_9fa48('4446') ? true : (stryCov_9fa48('4446'), false)
                })
          )
          .eq(stryMutAct_9fa48('4447') ? '' : (stryCov_9fa48('4447'), 'id'), id)
          .eq(
            stryMutAct_9fa48('4448') ? '' : (stryCov_9fa48('4448'), 'active'),
            stryMutAct_9fa48('4449') ? false : (stryCov_9fa48('4449'), true)
          )
          .select()
          .single()
        if (
          stryMutAct_9fa48('4451')
            ? false
            : stryMutAct_9fa48('4450')
              ? true
              : (stryCov_9fa48('4450', '4451'), error)
        ) {
          if (stryMutAct_9fa48('4452')) {
            {
            }
          } else {
            stryCov_9fa48('4452')
            throw new DatabaseError(
              stryMutAct_9fa48('4453') ? '' : (stryCov_9fa48('4453'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('4454')
                ? {}
                : (stryCov_9fa48('4454'),
                  {
                    imageId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4457')
            ? false
            : stryMutAct_9fa48('4456')
              ? true
              : stryMutAct_9fa48('4455')
                ? data
                : (stryCov_9fa48('4455', '4456', '4457'), !data)
        ) {
          if (stryMutAct_9fa48('4458')) {
            {
            }
          } else {
            stryCov_9fa48('4458')
            throw new NotFoundError(
              stryMutAct_9fa48('4459') ? '' : (stryCov_9fa48('4459'), 'Image'),
              id,
              stryMutAct_9fa48('4460')
                ? {}
                : (stryCov_9fa48('4460'),
                  {
                    active: stryMutAct_9fa48('4461') ? false : (stryCov_9fa48('4461'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4462')) {
        {
        }
      } else {
        stryCov_9fa48('4462')
        logger.error(
          stryMutAct_9fa48('4463') ? `` : (stryCov_9fa48('4463'), `deleteImage(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reactivate image (reverse soft-delete)
 * @param {number} id - Image ID to reactivate
 * @returns {Object} - Reactivated image
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When image is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivateImage(id) {
  if (stryMutAct_9fa48('4464')) {
    {
    }
  } else {
    stryCov_9fa48('4464')
    try {
      if (stryMutAct_9fa48('4465')) {
        {
        }
      } else {
        stryCov_9fa48('4465')
        if (
          stryMutAct_9fa48('4468')
            ? !id && typeof id !== 'number'
            : stryMutAct_9fa48('4467')
              ? false
              : stryMutAct_9fa48('4466')
                ? true
                : (stryCov_9fa48('4466', '4467', '4468'),
                  (stryMutAct_9fa48('4469') ? id : (stryCov_9fa48('4469'), !id)) ||
                    (stryMutAct_9fa48('4471')
                      ? typeof id === 'number'
                      : stryMutAct_9fa48('4470')
                        ? false
                        : (stryCov_9fa48('4470', '4471'),
                          typeof id !==
                            (stryMutAct_9fa48('4472') ? '' : (stryCov_9fa48('4472'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4473')) {
            {
            }
          } else {
            stryCov_9fa48('4473')
            throw new BadRequestError(
              stryMutAct_9fa48('4474')
                ? ''
                : (stryCov_9fa48('4474'), 'Invalid image ID: must be a number'),
              stryMutAct_9fa48('4475')
                ? {}
                : (stryCov_9fa48('4475'),
                  {
                    imageId: id
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4476')
              ? {}
              : (stryCov_9fa48('4476'),
                {
                  active: stryMutAct_9fa48('4477') ? false : (stryCov_9fa48('4477'), true)
                })
          )
          .eq(stryMutAct_9fa48('4478') ? '' : (stryCov_9fa48('4478'), 'id'), id)
          .eq(
            stryMutAct_9fa48('4479') ? '' : (stryCov_9fa48('4479'), 'active'),
            stryMutAct_9fa48('4480') ? true : (stryCov_9fa48('4480'), false)
          )
          .select()
          .single()
        if (
          stryMutAct_9fa48('4482')
            ? false
            : stryMutAct_9fa48('4481')
              ? true
              : (stryCov_9fa48('4481', '4482'), error)
        ) {
          if (stryMutAct_9fa48('4483')) {
            {
            }
          } else {
            stryCov_9fa48('4483')
            throw new DatabaseError(
              stryMutAct_9fa48('4484') ? '' : (stryCov_9fa48('4484'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('4485')
                ? {}
                : (stryCov_9fa48('4485'),
                  {
                    imageId: id
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4488')
            ? false
            : stryMutAct_9fa48('4487')
              ? true
              : stryMutAct_9fa48('4486')
                ? data
                : (stryCov_9fa48('4486', '4487', '4488'), !data)
        ) {
          if (stryMutAct_9fa48('4489')) {
            {
            }
          } else {
            stryCov_9fa48('4489')
            throw new NotFoundError(
              stryMutAct_9fa48('4490') ? '' : (stryCov_9fa48('4490'), 'Image'),
              id,
              stryMutAct_9fa48('4491')
                ? {}
                : (stryCov_9fa48('4491'),
                  {
                    active: stryMutAct_9fa48('4492') ? true : (stryCov_9fa48('4492'), false)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4493')) {
        {
        }
      } else {
        stryCov_9fa48('4493')
        logger.error(
          stryMutAct_9fa48('4494') ? `` : (stryCov_9fa48('4494'), `reactivateImage(${id}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Soft-delete all images for a product
 * @param {number} productId - Product ID to delete images for
 * @returns {Object} - Result with success status and count
 * @throws {BadRequestError} When productId is invalid
 * @throws {DatabaseError} When database update fails
 */
export async function deleteProductImagesSafe(productId) {
  if (stryMutAct_9fa48('4495')) {
    {
    }
  } else {
    stryCov_9fa48('4495')
    try {
      if (stryMutAct_9fa48('4496')) {
        {
        }
      } else {
        stryCov_9fa48('4496')
        if (
          stryMutAct_9fa48('4499')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('4498')
              ? false
              : stryMutAct_9fa48('4497')
                ? true
                : (stryCov_9fa48('4497', '4498', '4499'),
                  (stryMutAct_9fa48('4500') ? productId : (stryCov_9fa48('4500'), !productId)) ||
                    (stryMutAct_9fa48('4502')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('4501')
                        ? false
                        : (stryCov_9fa48('4501', '4502'),
                          typeof productId !==
                            (stryMutAct_9fa48('4503') ? '' : (stryCov_9fa48('4503'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4504')) {
            {
            }
          } else {
            stryCov_9fa48('4504')
            throw new BadRequestError(
              stryMutAct_9fa48('4505')
                ? ''
                : (stryCov_9fa48('4505'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4506')
                ? {}
                : (stryCov_9fa48('4506'),
                  {
                    productId
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4507')
              ? {}
              : (stryCov_9fa48('4507'),
                {
                  active: stryMutAct_9fa48('4508') ? true : (stryCov_9fa48('4508'), false)
                })
          )
          .eq(stryMutAct_9fa48('4509') ? '' : (stryCov_9fa48('4509'), 'product_id'), productId)
          .eq(
            stryMutAct_9fa48('4510') ? '' : (stryCov_9fa48('4510'), 'active'),
            stryMutAct_9fa48('4511') ? false : (stryCov_9fa48('4511'), true)
          )
          .select()
        if (
          stryMutAct_9fa48('4513')
            ? false
            : stryMutAct_9fa48('4512')
              ? true
              : (stryCov_9fa48('4512', '4513'), error)
        ) {
          if (stryMutAct_9fa48('4514')) {
            {
            }
          } else {
            stryCov_9fa48('4514')
            throw new DatabaseError(
              stryMutAct_9fa48('4515') ? '' : (stryCov_9fa48('4515'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('4516')
                ? {}
                : (stryCov_9fa48('4516'),
                  {
                    productId
                  })
            )
          }
        }
        return stryMutAct_9fa48('4517')
          ? {}
          : (stryCov_9fa48('4517'),
            {
              success: stryMutAct_9fa48('4518') ? false : (stryCov_9fa48('4518'), true),
              deleted_count: stryMutAct_9fa48('4521')
                ? data?.length && 0
                : stryMutAct_9fa48('4520')
                  ? false
                  : stryMutAct_9fa48('4519')
                    ? true
                    : (stryCov_9fa48('4519', '4520', '4521'),
                      (stryMutAct_9fa48('4522')
                        ? data.length
                        : (stryCov_9fa48('4522'), data?.length)) || 0),
              product_id: productId
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('4523')) {
        {
        }
      } else {
        stryCov_9fa48('4523')
        logger.error(
          stryMutAct_9fa48('4524')
            ? ``
            : (stryCov_9fa48('4524'), `deleteProductImagesSafe(${productId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reactivate all images for a product
 * @param {number} productId - Product ID to reactivate images for
 * @returns {Object} - Result with success status and count
 * @throws {BadRequestError} When productId is invalid
 * @throws {DatabaseError} When database update fails
 */
export async function reactivateProductImages(productId) {
  if (stryMutAct_9fa48('4525')) {
    {
    }
  } else {
    stryCov_9fa48('4525')
    try {
      if (stryMutAct_9fa48('4526')) {
        {
        }
      } else {
        stryCov_9fa48('4526')
        if (
          stryMutAct_9fa48('4529')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('4528')
              ? false
              : stryMutAct_9fa48('4527')
                ? true
                : (stryCov_9fa48('4527', '4528', '4529'),
                  (stryMutAct_9fa48('4530') ? productId : (stryCov_9fa48('4530'), !productId)) ||
                    (stryMutAct_9fa48('4532')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('4531')
                        ? false
                        : (stryCov_9fa48('4531', '4532'),
                          typeof productId !==
                            (stryMutAct_9fa48('4533') ? '' : (stryCov_9fa48('4533'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4534')) {
            {
            }
          } else {
            stryCov_9fa48('4534')
            throw new BadRequestError(
              stryMutAct_9fa48('4535')
                ? ''
                : (stryCov_9fa48('4535'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4536')
                ? {}
                : (stryCov_9fa48('4536'),
                  {
                    productId
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4537')
              ? {}
              : (stryCov_9fa48('4537'),
                {
                  active: stryMutAct_9fa48('4538') ? false : (stryCov_9fa48('4538'), true)
                })
          )
          .eq(stryMutAct_9fa48('4539') ? '' : (stryCov_9fa48('4539'), 'product_id'), productId)
          .eq(
            stryMutAct_9fa48('4540') ? '' : (stryCov_9fa48('4540'), 'active'),
            stryMutAct_9fa48('4541') ? true : (stryCov_9fa48('4541'), false)
          )
          .select()
        if (
          stryMutAct_9fa48('4543')
            ? false
            : stryMutAct_9fa48('4542')
              ? true
              : (stryCov_9fa48('4542', '4543'), error)
        ) {
          if (stryMutAct_9fa48('4544')) {
            {
            }
          } else {
            stryCov_9fa48('4544')
            throw new DatabaseError(
              stryMutAct_9fa48('4545') ? '' : (stryCov_9fa48('4545'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('4546')
                ? {}
                : (stryCov_9fa48('4546'),
                  {
                    productId
                  })
            )
          }
        }
        return stryMutAct_9fa48('4547')
          ? {}
          : (stryCov_9fa48('4547'),
            {
              success: stryMutAct_9fa48('4548') ? false : (stryCov_9fa48('4548'), true),
              reactivated_count: stryMutAct_9fa48('4551')
                ? data?.length && 0
                : stryMutAct_9fa48('4550')
                  ? false
                  : stryMutAct_9fa48('4549')
                    ? true
                    : (stryCov_9fa48('4549', '4550', '4551'),
                      (stryMutAct_9fa48('4552')
                        ? data.length
                        : (stryCov_9fa48('4552'), data?.length)) || 0),
              product_id: productId
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('4553')) {
        {
        }
      } else {
        stryCov_9fa48('4553')
        logger.error(
          stryMutAct_9fa48('4554')
            ? ``
            : (stryCov_9fa48('4554'), `reactivateProductImages(${productId}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Delete images by image_index (all sizes)
 */
export async function deleteImagesByIndex(productId, imageIndex) {
  if (stryMutAct_9fa48('4555')) {
    {
    }
  } else {
    stryCov_9fa48('4555')
    try {
      if (stryMutAct_9fa48('4556')) {
        {
        }
      } else {
        stryCov_9fa48('4556')
        if (
          stryMutAct_9fa48('4559')
            ? !productId && typeof productId !== 'number'
            : stryMutAct_9fa48('4558')
              ? false
              : stryMutAct_9fa48('4557')
                ? true
                : (stryCov_9fa48('4557', '4558', '4559'),
                  (stryMutAct_9fa48('4560') ? productId : (stryCov_9fa48('4560'), !productId)) ||
                    (stryMutAct_9fa48('4562')
                      ? typeof productId === 'number'
                      : stryMutAct_9fa48('4561')
                        ? false
                        : (stryCov_9fa48('4561', '4562'),
                          typeof productId !==
                            (stryMutAct_9fa48('4563') ? '' : (stryCov_9fa48('4563'), 'number')))))
        ) {
          if (stryMutAct_9fa48('4564')) {
            {
            }
          } else {
            stryCov_9fa48('4564')
            throw new BadRequestError(
              stryMutAct_9fa48('4565')
                ? ''
                : (stryCov_9fa48('4565'), 'Invalid product ID: must be a number'),
              stryMutAct_9fa48('4566')
                ? {}
                : (stryCov_9fa48('4566'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4569')
            ? (!imageIndex || typeof imageIndex !== 'number') && imageIndex <= 0
            : stryMutAct_9fa48('4568')
              ? false
              : stryMutAct_9fa48('4567')
                ? true
                : (stryCov_9fa48('4567', '4568', '4569'),
                  (stryMutAct_9fa48('4571')
                    ? !imageIndex && typeof imageIndex !== 'number'
                    : stryMutAct_9fa48('4570')
                      ? false
                      : (stryCov_9fa48('4570', '4571'),
                        (stryMutAct_9fa48('4572')
                          ? imageIndex
                          : (stryCov_9fa48('4572'), !imageIndex)) ||
                          (stryMutAct_9fa48('4574')
                            ? typeof imageIndex === 'number'
                            : stryMutAct_9fa48('4573')
                              ? false
                              : (stryCov_9fa48('4573', '4574'),
                                typeof imageIndex !==
                                  (stryMutAct_9fa48('4575')
                                    ? ''
                                    : (stryCov_9fa48('4575'), 'number')))))) ||
                    (stryMutAct_9fa48('4578')
                      ? imageIndex > 0
                      : stryMutAct_9fa48('4577')
                        ? imageIndex < 0
                        : stryMutAct_9fa48('4576')
                          ? false
                          : (stryCov_9fa48('4576', '4577', '4578'), imageIndex <= 0)))
        ) {
          if (stryMutAct_9fa48('4579')) {
            {
            }
          } else {
            stryCov_9fa48('4579')
            throw new BadRequestError(
              stryMutAct_9fa48('4580')
                ? ''
                : (stryCov_9fa48('4580'), 'Invalid image_index: must be a positive number'),
              stryMutAct_9fa48('4581')
                ? {}
                : (stryCov_9fa48('4581'),
                  {
                    imageIndex
                  })
            )
          }
        }

        // 1. Get images to delete (we need URLs to delete from storage)
        const { data: images, error: selectError } = await supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4582') ? '' : (stryCov_9fa48('4582'), '*'))
          .eq(stryMutAct_9fa48('4583') ? '' : (stryCov_9fa48('4583'), 'product_id'), productId)
          .eq(stryMutAct_9fa48('4584') ? '' : (stryCov_9fa48('4584'), 'image_index'), imageIndex)
        if (
          stryMutAct_9fa48('4586')
            ? false
            : stryMutAct_9fa48('4585')
              ? true
              : (stryCov_9fa48('4585', '4586'), selectError)
        ) {
          if (stryMutAct_9fa48('4587')) {
            {
            }
          } else {
            stryCov_9fa48('4587')
            throw new DatabaseError(
              stryMutAct_9fa48('4588') ? '' : (stryCov_9fa48('4588'), 'SELECT'),
              TABLE,
              selectError,
              stryMutAct_9fa48('4589')
                ? {}
                : (stryCov_9fa48('4589'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4592')
            ? !images && images.length === 0
            : stryMutAct_9fa48('4591')
              ? false
              : stryMutAct_9fa48('4590')
                ? true
                : (stryCov_9fa48('4590', '4591', '4592'),
                  (stryMutAct_9fa48('4593') ? images : (stryCov_9fa48('4593'), !images)) ||
                    (stryMutAct_9fa48('4595')
                      ? images.length !== 0
                      : stryMutAct_9fa48('4594')
                        ? false
                        : (stryCov_9fa48('4594', '4595'), images.length === 0)))
        ) {
          if (stryMutAct_9fa48('4596')) {
            {
            }
          } else {
            stryCov_9fa48('4596')
            throw new NotFoundError(
              stryMutAct_9fa48('4597') ? '' : (stryCov_9fa48('4597'), 'Images'),
              stryMutAct_9fa48('4598') ? `` : (stryCov_9fa48('4598'), `${productId}/${imageIndex}`),
              stryMutAct_9fa48('4599')
                ? {}
                : (stryCov_9fa48('4599'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }

        // 2. Extract filename from URL to delete from storage
        // URL format: https://.../storage/v1/object/public/product-images/medium/product_1_1_abc123.webp
        // We need: product_1_1_abc123 (without size prefix and extension)
        const firstImageUrl = images[0].url
        const urlParts = firstImageUrl.split(
          stryMutAct_9fa48('4600') ? '' : (stryCov_9fa48('4600'), '/')
        )
        const filename =
          urlParts[
            stryMutAct_9fa48('4601')
              ? urlParts.length + 1
              : (stryCov_9fa48('4601'), urlParts.length - 1)
          ] // e.g., product_1_1_abc123.webp
        const filenameBase = filename.replace(
          stryMutAct_9fa48('4602') ? '' : (stryCov_9fa48('4602'), '.webp'),
          stryMutAct_9fa48('4603') ? 'Stryker was here!' : (stryCov_9fa48('4603'), '')
        ) // Remove extension

        // 3. Delete from Supabase Storage (all sizes: thumb, small, medium, large)
        const { deleteImageSizes } = await import(
          stryMutAct_9fa48('4604') ? '' : (stryCov_9fa48('4604'), './supabaseStorageService.js')
        )
        try {
          if (stryMutAct_9fa48('4605')) {
            {
            }
          } else {
            stryCov_9fa48('4605')
            await deleteImageSizes(filenameBase)
            logger.info(
              stryMutAct_9fa48('4606')
                ? ``
                : (stryCov_9fa48('4606'), `✓ Deleted ${filenameBase} from storage (all sizes)`)
            )
          }
        } catch (storageError) {
          if (stryMutAct_9fa48('4607')) {
            {
            }
          } else {
            stryCov_9fa48('4607')
            logger.warn(
              stryMutAct_9fa48('4608')
                ? ''
                : (stryCov_9fa48('4608'), 'Failed to delete from storage:'),
              storageError.message
            )
            // Continue to delete from database even if storage deletion fails
          }
        }

        // 4. Soft-delete from database
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4609')
              ? {}
              : (stryCov_9fa48('4609'),
                {
                  active: stryMutAct_9fa48('4610') ? true : (stryCov_9fa48('4610'), false)
                })
          )
          .eq(stryMutAct_9fa48('4611') ? '' : (stryCov_9fa48('4611'), 'product_id'), productId)
          .eq(stryMutAct_9fa48('4612') ? '' : (stryCov_9fa48('4612'), 'image_index'), imageIndex)
          .eq(
            stryMutAct_9fa48('4613') ? '' : (stryCov_9fa48('4613'), 'active'),
            stryMutAct_9fa48('4614') ? false : (stryCov_9fa48('4614'), true)
          )
          .select()
        if (
          stryMutAct_9fa48('4616')
            ? false
            : stryMutAct_9fa48('4615')
              ? true
              : (stryCov_9fa48('4615', '4616'), error)
        ) {
          if (stryMutAct_9fa48('4617')) {
            {
            }
          } else {
            stryCov_9fa48('4617')
            throw new DatabaseError(
              stryMutAct_9fa48('4618') ? '' : (stryCov_9fa48('4618'), 'DELETE'),
              TABLE,
              error,
              stryMutAct_9fa48('4619')
                ? {}
                : (stryCov_9fa48('4619'),
                  {
                    productId,
                    imageIndex
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4620')) {
        {
        }
      } else {
        stryCov_9fa48('4620')
        logger.error(
          stryMutAct_9fa48('4621')
            ? ``
            : (stryCov_9fa48('4621'), `deleteImagesByIndex(${productId}, ${imageIndex}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get image by product ID and size
 * Fail-fast if product has no image of requested size
 */
export async function getProductImageBySize(productId, size) {
  if (stryMutAct_9fa48('4622')) {
    {
    }
  } else {
    stryCov_9fa48('4622')
    try {
      if (stryMutAct_9fa48('4623')) {
        {
        }
      } else {
        stryCov_9fa48('4623')
        if (
          stryMutAct_9fa48('4626')
            ? (!productId || typeof productId !== 'number') && productId <= 0
            : stryMutAct_9fa48('4625')
              ? false
              : stryMutAct_9fa48('4624')
                ? true
                : (stryCov_9fa48('4624', '4625', '4626'),
                  (stryMutAct_9fa48('4628')
                    ? !productId && typeof productId !== 'number'
                    : stryMutAct_9fa48('4627')
                      ? false
                      : (stryCov_9fa48('4627', '4628'),
                        (stryMutAct_9fa48('4629')
                          ? productId
                          : (stryCov_9fa48('4629'), !productId)) ||
                          (stryMutAct_9fa48('4631')
                            ? typeof productId === 'number'
                            : stryMutAct_9fa48('4630')
                              ? false
                              : (stryCov_9fa48('4630', '4631'),
                                typeof productId !==
                                  (stryMutAct_9fa48('4632')
                                    ? ''
                                    : (stryCov_9fa48('4632'), 'number')))))) ||
                    (stryMutAct_9fa48('4635')
                      ? productId > 0
                      : stryMutAct_9fa48('4634')
                        ? productId < 0
                        : stryMutAct_9fa48('4633')
                          ? false
                          : (stryCov_9fa48('4633', '4634', '4635'), productId <= 0)))
        ) {
          if (stryMutAct_9fa48('4636')) {
            {
            }
          } else {
            stryCov_9fa48('4636')
            throw new BadRequestError(
              stryMutAct_9fa48('4637')
                ? ''
                : (stryCov_9fa48('4637'), 'Invalid product ID: must be a positive number'),
              stryMutAct_9fa48('4638')
                ? {}
                : (stryCov_9fa48('4638'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4641')
            ? !size && !VALID_SIZES.includes(size)
            : stryMutAct_9fa48('4640')
              ? false
              : stryMutAct_9fa48('4639')
                ? true
                : (stryCov_9fa48('4639', '4640', '4641'),
                  (stryMutAct_9fa48('4642') ? size : (stryCov_9fa48('4642'), !size)) ||
                    (stryMutAct_9fa48('4643')
                      ? VALID_SIZES.includes(size)
                      : (stryCov_9fa48('4643'), !VALID_SIZES.includes(size))))
        ) {
          if (stryMutAct_9fa48('4644')) {
            {
            }
          } else {
            stryCov_9fa48('4644')
            throw new ValidationError(
              (stryMutAct_9fa48('4645')
                ? ''
                : (stryCov_9fa48('4645'), 'Invalid size: must be one of ')) +
                VALID_SIZES.join(stryMutAct_9fa48('4646') ? '' : (stryCov_9fa48('4646'), ', ')),
              stryMutAct_9fa48('4647')
                ? {}
                : (stryCov_9fa48('4647'),
                  {
                    size
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4648') ? '' : (stryCov_9fa48('4648'), '*'))
          .eq(stryMutAct_9fa48('4649') ? '' : (stryCov_9fa48('4649'), 'product_id'), productId)
          .eq(stryMutAct_9fa48('4650') ? '' : (stryCov_9fa48('4650'), 'size'), size)
          .order(
            stryMutAct_9fa48('4651') ? '' : (stryCov_9fa48('4651'), 'image_index'),
            stryMutAct_9fa48('4652')
              ? {}
              : (stryCov_9fa48('4652'),
                {
                  ascending: stryMutAct_9fa48('4653') ? false : (stryCov_9fa48('4653'), true)
                })
          )
          .limit(1)
          .maybeSingle()
        if (
          stryMutAct_9fa48('4655')
            ? false
            : stryMutAct_9fa48('4654')
              ? true
              : (stryCov_9fa48('4654', '4655'), error)
        ) {
          if (stryMutAct_9fa48('4656')) {
            {
            }
          } else {
            stryCov_9fa48('4656')
            throw new DatabaseError(
              stryMutAct_9fa48('4657') ? '' : (stryCov_9fa48('4657'), 'SELECT'),
              TABLE,
              error,
              stryMutAct_9fa48('4658')
                ? {}
                : (stryCov_9fa48('4658'),
                  {
                    productId,
                    size
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4661')
            ? false
            : stryMutAct_9fa48('4660')
              ? true
              : stryMutAct_9fa48('4659')
                ? data
                : (stryCov_9fa48('4659', '4660', '4661'), !data)
        ) {
          if (stryMutAct_9fa48('4662')) {
            {
            }
          } else {
            stryCov_9fa48('4662')
            throw new NotFoundError(
              stryMutAct_9fa48('4663')
                ? ``
                : (stryCov_9fa48('4663'), `No ${size} image found for product`),
              productId,
              stryMutAct_9fa48('4664')
                ? {}
                : (stryCov_9fa48('4664'),
                  {
                    productId,
                    size,
                    availableSizes: VALID_SIZES
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('4665')) {
        {
        }
      } else {
        stryCov_9fa48('4665')
        logger.error(
          stryMutAct_9fa48('4666')
            ? ``
            : (stryCov_9fa48('4666'), `getProductImageBySize(${productId}, ${size}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get product with specific image size attached
 * Fail-fast approach - throws error if image doesn't exist
 */
export async function getProductWithImageSize(productId, size) {
  if (stryMutAct_9fa48('4667')) {
    {
    }
  } else {
    stryCov_9fa48('4667')
    try {
      if (stryMutAct_9fa48('4668')) {
        {
        }
      } else {
        stryCov_9fa48('4668')
        if (
          stryMutAct_9fa48('4671')
            ? (!productId || typeof productId !== 'number') && productId <= 0
            : stryMutAct_9fa48('4670')
              ? false
              : stryMutAct_9fa48('4669')
                ? true
                : (stryCov_9fa48('4669', '4670', '4671'),
                  (stryMutAct_9fa48('4673')
                    ? !productId && typeof productId !== 'number'
                    : stryMutAct_9fa48('4672')
                      ? false
                      : (stryCov_9fa48('4672', '4673'),
                        (stryMutAct_9fa48('4674')
                          ? productId
                          : (stryCov_9fa48('4674'), !productId)) ||
                          (stryMutAct_9fa48('4676')
                            ? typeof productId === 'number'
                            : stryMutAct_9fa48('4675')
                              ? false
                              : (stryCov_9fa48('4675', '4676'),
                                typeof productId !==
                                  (stryMutAct_9fa48('4677')
                                    ? ''
                                    : (stryCov_9fa48('4677'), 'number')))))) ||
                    (stryMutAct_9fa48('4680')
                      ? productId > 0
                      : stryMutAct_9fa48('4679')
                        ? productId < 0
                        : stryMutAct_9fa48('4678')
                          ? false
                          : (stryCov_9fa48('4678', '4679', '4680'), productId <= 0)))
        ) {
          if (stryMutAct_9fa48('4681')) {
            {
            }
          } else {
            stryCov_9fa48('4681')
            throw new BadRequestError(
              stryMutAct_9fa48('4682')
                ? ''
                : (stryCov_9fa48('4682'), 'Invalid product ID: must be a positive number'),
              stryMutAct_9fa48('4683')
                ? {}
                : (stryCov_9fa48('4683'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4686')
            ? !size && !VALID_SIZES.includes(size)
            : stryMutAct_9fa48('4685')
              ? false
              : stryMutAct_9fa48('4684')
                ? true
                : (stryCov_9fa48('4684', '4685', '4686'),
                  (stryMutAct_9fa48('4687') ? size : (stryCov_9fa48('4687'), !size)) ||
                    (stryMutAct_9fa48('4688')
                      ? VALID_SIZES.includes(size)
                      : (stryCov_9fa48('4688'), !VALID_SIZES.includes(size))))
        ) {
          if (stryMutAct_9fa48('4689')) {
            {
            }
          } else {
            stryCov_9fa48('4689')
            throw new ValidationError(
              (stryMutAct_9fa48('4690')
                ? ''
                : (stryCov_9fa48('4690'), 'Invalid size: must be one of ')) +
                VALID_SIZES.join(stryMutAct_9fa48('4691') ? '' : (stryCov_9fa48('4691'), ', ')),
              stryMutAct_9fa48('4692')
                ? {}
                : (stryCov_9fa48('4692'),
                  {
                    size
                  })
            )
          }
        }

        // Get the product
        const { data: product, error: productError } = await supabase
          .from(DB_SCHEMA.products.table)
          .select(stryMutAct_9fa48('4693') ? '' : (stryCov_9fa48('4693'), '*'))
          .eq(stryMutAct_9fa48('4694') ? '' : (stryCov_9fa48('4694'), 'id'), productId)
          .single()
        if (
          stryMutAct_9fa48('4696')
            ? false
            : stryMutAct_9fa48('4695')
              ? true
              : (stryCov_9fa48('4695', '4696'), productError)
        ) {
          if (stryMutAct_9fa48('4697')) {
            {
            }
          } else {
            stryCov_9fa48('4697')
            throw new DatabaseError(
              stryMutAct_9fa48('4698') ? '' : (stryCov_9fa48('4698'), 'SELECT'),
              DB_SCHEMA.products.table,
              productError,
              stryMutAct_9fa48('4699')
                ? {}
                : (stryCov_9fa48('4699'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4702')
            ? false
            : stryMutAct_9fa48('4701')
              ? true
              : stryMutAct_9fa48('4700')
                ? product
                : (stryCov_9fa48('4700', '4701', '4702'), !product)
        ) {
          if (stryMutAct_9fa48('4703')) {
            {
            }
          } else {
            stryCov_9fa48('4703')
            throw new NotFoundError(
              stryMutAct_9fa48('4704') ? '' : (stryCov_9fa48('4704'), 'Product'),
              productId,
              stryMutAct_9fa48('4705')
                ? {}
                : (stryCov_9fa48('4705'),
                  {
                    productId
                  })
            )
          }
        }

        // Get the specific image
        // Try to get the image but don't fail if it doesn't exist
        const { data: image } = await supabase
          .from(DB_SCHEMA.product_images.table)
          .select(stryMutAct_9fa48('4706') ? '' : (stryCov_9fa48('4706'), 'url'))
          .eq(stryMutAct_9fa48('4707') ? '' : (stryCov_9fa48('4707'), 'product_id'), productId)
          .eq(stryMutAct_9fa48('4708') ? '' : (stryCov_9fa48('4708'), 'size'), size)
          .order(
            stryMutAct_9fa48('4709') ? '' : (stryCov_9fa48('4709'), 'image_index'),
            stryMutAct_9fa48('4710')
              ? {}
              : (stryCov_9fa48('4710'),
                {
                  ascending: stryMutAct_9fa48('4711') ? false : (stryCov_9fa48('4711'), true)
                })
          )
          .limit(1)
          .maybeSingle()

        // Return product with image URL (null if not found)
        return stryMutAct_9fa48('4713')
          ? {
              ...product,
              [``]: image?.url || null
            }
          : stryMutAct_9fa48('4712')
            ? {}
            : (stryCov_9fa48('4712', '4713'),
              {
                ...product,
                [`image_url_${size}`]: stryMutAct_9fa48('4716')
                  ? image?.url && null
                  : stryMutAct_9fa48('4715')
                    ? false
                    : stryMutAct_9fa48('4714')
                      ? true
                      : (stryCov_9fa48('4714', '4715', '4716'),
                        (stryMutAct_9fa48('4717')
                          ? image.url
                          : (stryCov_9fa48('4717'), image?.url)) || null)
              })
      }
    } catch (error) {
      if (stryMutAct_9fa48('4718')) {
        {
        }
      } else {
        stryCov_9fa48('4718')
        logger.error(
          stryMutAct_9fa48('4719')
            ? ``
            : (stryCov_9fa48('4719'), `getProductWithImageSize(${productId}, ${size}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get multiple products with specific image size attached
 * Uses efficient batch query to avoid N+1 problem
 */
export async function getProductsBatchWithImageSize(productIds, size) {
  if (stryMutAct_9fa48('4720')) {
    {
    }
  } else {
    stryCov_9fa48('4720')
    try {
      if (stryMutAct_9fa48('4721')) {
        {
        }
      } else {
        stryCov_9fa48('4721')
        if (
          stryMutAct_9fa48('4724')
            ? !Array.isArray(productIds) && productIds.length === 0
            : stryMutAct_9fa48('4723')
              ? false
              : stryMutAct_9fa48('4722')
                ? true
                : (stryCov_9fa48('4722', '4723', '4724'),
                  (stryMutAct_9fa48('4725')
                    ? Array.isArray(productIds)
                    : (stryCov_9fa48('4725'), !Array.isArray(productIds))) ||
                    (stryMutAct_9fa48('4727')
                      ? productIds.length !== 0
                      : stryMutAct_9fa48('4726')
                        ? false
                        : (stryCov_9fa48('4726', '4727'), productIds.length === 0)))
        ) {
          if (stryMutAct_9fa48('4728')) {
            {
            }
          } else {
            stryCov_9fa48('4728')
            throw new BadRequestError(
              stryMutAct_9fa48('4729')
                ? ''
                : (stryCov_9fa48('4729'), 'Invalid product IDs: must be a non-empty array'),
              stryMutAct_9fa48('4730')
                ? {}
                : (stryCov_9fa48('4730'),
                  {
                    productIds
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4733')
            ? !size && !VALID_SIZES.includes(size)
            : stryMutAct_9fa48('4732')
              ? false
              : stryMutAct_9fa48('4731')
                ? true
                : (stryCov_9fa48('4731', '4732', '4733'),
                  (stryMutAct_9fa48('4734') ? size : (stryCov_9fa48('4734'), !size)) ||
                    (stryMutAct_9fa48('4735')
                      ? VALID_SIZES.includes(size)
                      : (stryCov_9fa48('4735'), !VALID_SIZES.includes(size))))
        ) {
          if (stryMutAct_9fa48('4736')) {
            {
            }
          } else {
            stryCov_9fa48('4736')
            throw new ValidationError(
              (stryMutAct_9fa48('4737')
                ? ''
                : (stryCov_9fa48('4737'), 'Invalid size: must be one of ')) +
                VALID_SIZES.join(stryMutAct_9fa48('4738') ? '' : (stryCov_9fa48('4738'), ', ')),
              stryMutAct_9fa48('4739')
                ? {}
                : (stryCov_9fa48('4739'),
                  {
                    size
                  })
            )
          }
        }

        // Validate all product IDs
        for (const id of productIds) {
          if (stryMutAct_9fa48('4740')) {
            {
            }
          } else {
            stryCov_9fa48('4740')
            if (
              stryMutAct_9fa48('4743')
                ? (!id || typeof id !== 'number') && id <= 0
                : stryMutAct_9fa48('4742')
                  ? false
                  : stryMutAct_9fa48('4741')
                    ? true
                    : (stryCov_9fa48('4741', '4742', '4743'),
                      (stryMutAct_9fa48('4745')
                        ? !id && typeof id !== 'number'
                        : stryMutAct_9fa48('4744')
                          ? false
                          : (stryCov_9fa48('4744', '4745'),
                            (stryMutAct_9fa48('4746') ? id : (stryCov_9fa48('4746'), !id)) ||
                              (stryMutAct_9fa48('4748')
                                ? typeof id === 'number'
                                : stryMutAct_9fa48('4747')
                                  ? false
                                  : (stryCov_9fa48('4747', '4748'),
                                    typeof id !==
                                      (stryMutAct_9fa48('4749')
                                        ? ''
                                        : (stryCov_9fa48('4749'), 'number')))))) ||
                        (stryMutAct_9fa48('4752')
                          ? id > 0
                          : stryMutAct_9fa48('4751')
                            ? id < 0
                            : stryMutAct_9fa48('4750')
                              ? false
                              : (stryCov_9fa48('4750', '4751', '4752'), id <= 0)))
            ) {
              if (stryMutAct_9fa48('4753')) {
                {
                }
              } else {
                stryCov_9fa48('4753')
                throw new BadRequestError(
                  stryMutAct_9fa48('4754')
                    ? ''
                    : (stryCov_9fa48('4754'),
                      'Invalid product ID in array: all must be positive numbers'),
                  stryMutAct_9fa48('4755')
                    ? {}
                    : (stryCov_9fa48('4755'),
                      {
                        invalidId: id,
                        productIds
                      })
                )
              }
            }
          }
        }
        logger.debug(
          stryMutAct_9fa48('4756')
            ? ``
            : (stryCov_9fa48('4756'),
              `🔍 [DEBUG] getProductsBatchWithImageSize - Fetching ${productIds.length} products with ${size} images`)
        )

        // Get products
        const { data: products, error: productError } = await supabase
          .from(DB_SCHEMA.products.table)
          .select(stryMutAct_9fa48('4757') ? '' : (stryCov_9fa48('4757'), '*'))
          .in(stryMutAct_9fa48('4758') ? '' : (stryCov_9fa48('4758'), 'id'), productIds)
        if (
          stryMutAct_9fa48('4760')
            ? false
            : stryMutAct_9fa48('4759')
              ? true
              : (stryCov_9fa48('4759', '4760'), productError)
        ) {
          if (stryMutAct_9fa48('4761')) {
            {
            }
          } else {
            stryCov_9fa48('4761')
            throw new DatabaseError(
              stryMutAct_9fa48('4762') ? '' : (stryCov_9fa48('4762'), 'SELECT'),
              DB_SCHEMA.products.table,
              productError,
              stryMutAct_9fa48('4763')
                ? {}
                : (stryCov_9fa48('4763'),
                  {
                    productIds
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4766')
            ? !products && products.length === 0
            : stryMutAct_9fa48('4765')
              ? false
              : stryMutAct_9fa48('4764')
                ? true
                : (stryCov_9fa48('4764', '4765', '4766'),
                  (stryMutAct_9fa48('4767') ? products : (stryCov_9fa48('4767'), !products)) ||
                    (stryMutAct_9fa48('4769')
                      ? products.length !== 0
                      : stryMutAct_9fa48('4768')
                        ? false
                        : (stryCov_9fa48('4768', '4769'), products.length === 0)))
        ) {
          if (stryMutAct_9fa48('4770')) {
            {
            }
          } else {
            stryCov_9fa48('4770')
            throw new NotFoundError(
              stryMutAct_9fa48('4771') ? '' : (stryCov_9fa48('4771'), 'Products'),
              null,
              stryMutAct_9fa48('4772')
                ? {}
                : (stryCov_9fa48('4772'),
                  {
                    productIds
                  })
            )
          }
        }
        logger.debug(
          stryMutAct_9fa48('4773')
            ? ``
            : (stryCov_9fa48('4773'),
              `🔍 [DEBUG] getProductsBatchWithImageSize - Found ${products.length} products`)
        )

        // Find unique product IDs to compare with requested IDs
        const retrievedProductIds = products.map(
          stryMutAct_9fa48('4774') ? () => undefined : (stryCov_9fa48('4774'), p => p.id)
        )
        const missingIds = stryMutAct_9fa48('4775')
          ? productIds
          : (stryCov_9fa48('4775'),
            productIds.filter(
              stryMutAct_9fa48('4776')
                ? () => undefined
                : (stryCov_9fa48('4776'),
                  id =>
                    stryMutAct_9fa48('4777')
                      ? retrievedProductIds.includes(id)
                      : (stryCov_9fa48('4777'), !retrievedProductIds.includes(id)))
            ))
        if (
          stryMutAct_9fa48('4781')
            ? missingIds.length <= 0
            : stryMutAct_9fa48('4780')
              ? missingIds.length >= 0
              : stryMutAct_9fa48('4779')
                ? false
                : stryMutAct_9fa48('4778')
                  ? true
                  : (stryCov_9fa48('4778', '4779', '4780', '4781'), missingIds.length > 0)
        ) {
          if (stryMutAct_9fa48('4782')) {
            {
            }
          } else {
            stryCov_9fa48('4782')
            throw new NotFoundError(
              stryMutAct_9fa48('4783') ? '' : (stryCov_9fa48('4783'), 'Some products not found'),
              missingIds,
              stryMutAct_9fa48('4784')
                ? {}
                : (stryCov_9fa48('4784'),
                  {
                    missingIds,
                    requested: productIds
                  })
            )
          }
        }

        // Get images for the specific size for all products
        let images
        const { data: initialImages, error: imageError } = await supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('4785') ? '' : (stryCov_9fa48('4785'), '*'))
          .in(stryMutAct_9fa48('4786') ? '' : (stryCov_9fa48('4786'), 'product_id'), productIds)
          .eq(stryMutAct_9fa48('4787') ? '' : (stryCov_9fa48('4787'), 'size'), size)
          .order(
            stryMutAct_9fa48('4788') ? '' : (stryCov_9fa48('4788'), 'image_index'),
            stryMutAct_9fa48('4789')
              ? {}
              : (stryCov_9fa48('4789'),
                {
                  ascending: stryMutAct_9fa48('4790') ? false : (stryCov_9fa48('4790'), true)
                })
          )
        if (
          stryMutAct_9fa48('4792')
            ? false
            : stryMutAct_9fa48('4791')
              ? true
              : (stryCov_9fa48('4791', '4792'), imageError)
        ) {
          if (stryMutAct_9fa48('4793')) {
            {
            }
          } else {
            stryCov_9fa48('4793')
            throw new DatabaseError(
              stryMutAct_9fa48('4794') ? '' : (stryCov_9fa48('4794'), 'SELECT'),
              TABLE,
              imageError,
              stryMutAct_9fa48('4795')
                ? {}
                : (stryCov_9fa48('4795'),
                  {
                    productIds,
                    size
                  })
            )
          }
        }
        images = initialImages
        logger.debug(
          stryMutAct_9fa48('4796')
            ? ``
            : (stryCov_9fa48('4796'),
              `🔍 [DEBUG] getProductsBatchWithImageSize - Found ${stryMutAct_9fa48('4799') ? images?.length && 0 : stryMutAct_9fa48('4798') ? false : stryMutAct_9fa48('4797') ? true : (stryCov_9fa48('4797', '4798', '4799'), (stryMutAct_9fa48('4800') ? images.length : (stryCov_9fa48('4800'), images?.length)) || 0)} images for size ${size}`)
        )

        // Fallback to 'large' size if 'small' not found (graceful handling for missing small images)
        if (
          stryMutAct_9fa48('4803')
            ? size === 'small' || !images || images.length === 0
            : stryMutAct_9fa48('4802')
              ? false
              : stryMutAct_9fa48('4801')
                ? true
                : (stryCov_9fa48('4801', '4802', '4803'),
                  (stryMutAct_9fa48('4805')
                    ? size !== 'small'
                    : stryMutAct_9fa48('4804')
                      ? true
                      : (stryCov_9fa48('4804', '4805'),
                        size ===
                          (stryMutAct_9fa48('4806') ? '' : (stryCov_9fa48('4806'), 'small')))) &&
                    (stryMutAct_9fa48('4808')
                      ? !images && images.length === 0
                      : stryMutAct_9fa48('4807')
                        ? true
                        : (stryCov_9fa48('4807', '4808'),
                          (stryMutAct_9fa48('4809') ? images : (stryCov_9fa48('4809'), !images)) ||
                            (stryMutAct_9fa48('4811')
                              ? images.length !== 0
                              : stryMutAct_9fa48('4810')
                                ? false
                                : (stryCov_9fa48('4810', '4811'), images.length === 0)))))
        ) {
          if (stryMutAct_9fa48('4812')) {
            {
            }
          } else {
            stryCov_9fa48('4812')
            logger.debug(
              stryMutAct_9fa48('4813')
                ? ``
                : (stryCov_9fa48('4813'),
                  `🔍 [DEBUG] getProductsBatchWithImageSize - No small images found, falling back to large`)
            )
            const { data: fallbackImages, error: fallbackError } = await supabase
              .from(TABLE)
              .select(stryMutAct_9fa48('4814') ? '' : (stryCov_9fa48('4814'), '*'))
              .in(stryMutAct_9fa48('4815') ? '' : (stryCov_9fa48('4815'), 'product_id'), productIds)
              .eq(
                stryMutAct_9fa48('4816') ? '' : (stryCov_9fa48('4816'), 'size'),
                stryMutAct_9fa48('4817') ? '' : (stryCov_9fa48('4817'), 'large')
              )
              .order(
                stryMutAct_9fa48('4818') ? '' : (stryCov_9fa48('4818'), 'image_index'),
                stryMutAct_9fa48('4819')
                  ? {}
                  : (stryCov_9fa48('4819'),
                    {
                      ascending: stryMutAct_9fa48('4820') ? false : (stryCov_9fa48('4820'), true)
                    })
              )
            if (
              stryMutAct_9fa48('4822')
                ? false
                : stryMutAct_9fa48('4821')
                  ? true
                  : (stryCov_9fa48('4821', '4822'), fallbackError)
            ) {
              if (stryMutAct_9fa48('4823')) {
                {
                }
              } else {
                stryCov_9fa48('4823')
                throw new DatabaseError(
                  stryMutAct_9fa48('4824') ? '' : (stryCov_9fa48('4824'), 'SELECT'),
                  TABLE,
                  fallbackError,
                  stryMutAct_9fa48('4825')
                    ? {}
                    : (stryCov_9fa48('4825'),
                      {
                        productIds,
                        size: stryMutAct_9fa48('4826') ? '' : (stryCov_9fa48('4826'), 'large')
                      })
                )
              }
            }
            images = stryMutAct_9fa48('4829')
              ? fallbackImages && []
              : stryMutAct_9fa48('4828')
                ? false
                : stryMutAct_9fa48('4827')
                  ? true
                  : (stryCov_9fa48('4827', '4828', '4829'),
                    fallbackImages ||
                      (stryMutAct_9fa48('4830')
                        ? ['Stryker was here']
                        : (stryCov_9fa48('4830'), [])))
            logger.debug(
              stryMutAct_9fa48('4831')
                ? ``
                : (stryCov_9fa48('4831'),
                  `🔍 [DEBUG] getProductsBatchWithImageSize - Fallback found ${stryMutAct_9fa48('4834') ? images?.length && 0 : stryMutAct_9fa48('4833') ? false : stryMutAct_9fa48('4832') ? true : (stryCov_9fa48('4832', '4833', '4834'), (stryMutAct_9fa48('4835') ? images.length : (stryCov_9fa48('4835'), images?.length)) || 0)} large images`)
            )
          }
        }

        // Create a map for quick lookup
        const imageMap = {}
        if (
          stryMutAct_9fa48('4837')
            ? false
            : stryMutAct_9fa48('4836')
              ? true
              : (stryCov_9fa48('4836', '4837'), images)
        ) {
          if (stryMutAct_9fa48('4838')) {
            {
            }
          } else {
            stryCov_9fa48('4838')
            images.forEach(img => {
              if (stryMutAct_9fa48('4839')) {
                {
                }
              } else {
                stryCov_9fa48('4839')
                // Only store the first image found for each product (since we ordered by index)
                if (
                  stryMutAct_9fa48('4842')
                    ? false
                    : stryMutAct_9fa48('4841')
                      ? true
                      : stryMutAct_9fa48('4840')
                        ? imageMap[img.product_id]
                        : (stryCov_9fa48('4840', '4841', '4842'), !imageMap[img.product_id])
                ) {
                  if (stryMutAct_9fa48('4843')) {
                    {
                    }
                  } else {
                    stryCov_9fa48('4843')
                    imageMap[img.product_id] = img.url
                    logger.debug(
                      stryMutAct_9fa48('4844')
                        ? ``
                        : (stryCov_9fa48('4844'),
                          `🔍 [DEBUG] Image for product ${img.product_id}: ${img.url}`)
                    )
                  }
                }
              }
            })
          }
        }

        // Attach image URLs to products
        const productsWithImages = products.map(
          stryMutAct_9fa48('4845')
            ? () => undefined
            : (stryCov_9fa48('4845'),
              product =>
                stryMutAct_9fa48('4847')
                  ? {
                      ...product,
                      [``]: imageMap[product.id] || null
                    }
                  : stryMutAct_9fa48('4846')
                    ? {}
                    : (stryCov_9fa48('4846', '4847'),
                      {
                        ...product,
                        [`image_url_${size}`]: stryMutAct_9fa48('4850')
                          ? imageMap[product.id] && null
                          : stryMutAct_9fa48('4849')
                            ? false
                            : stryMutAct_9fa48('4848')
                              ? true
                              : (stryCov_9fa48('4848', '4849', '4850'),
                                imageMap[product.id] || null)
                      }))
        )
        return productsWithImages
      }
    } catch (error) {
      if (stryMutAct_9fa48('4851')) {
        {
        }
      } else {
        stryCov_9fa48('4851')
        console.error(
          stryMutAct_9fa48('4852')
            ? ``
            : (stryCov_9fa48('4852'),
              `getProductsBatchWithImageSize(${productIds.length} products, ${size}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Delete all images of specific size for a product
 */
export async function deleteProductImagesBySize(productId, size) {
  if (stryMutAct_9fa48('4853')) {
    {
    }
  } else {
    stryCov_9fa48('4853')
    try {
      if (stryMutAct_9fa48('4854')) {
        {
        }
      } else {
        stryCov_9fa48('4854')
        if (
          stryMutAct_9fa48('4857')
            ? (!productId || typeof productId !== 'number') && productId <= 0
            : stryMutAct_9fa48('4856')
              ? false
              : stryMutAct_9fa48('4855')
                ? true
                : (stryCov_9fa48('4855', '4856', '4857'),
                  (stryMutAct_9fa48('4859')
                    ? !productId && typeof productId !== 'number'
                    : stryMutAct_9fa48('4858')
                      ? false
                      : (stryCov_9fa48('4858', '4859'),
                        (stryMutAct_9fa48('4860')
                          ? productId
                          : (stryCov_9fa48('4860'), !productId)) ||
                          (stryMutAct_9fa48('4862')
                            ? typeof productId === 'number'
                            : stryMutAct_9fa48('4861')
                              ? false
                              : (stryCov_9fa48('4861', '4862'),
                                typeof productId !==
                                  (stryMutAct_9fa48('4863')
                                    ? ''
                                    : (stryCov_9fa48('4863'), 'number')))))) ||
                    (stryMutAct_9fa48('4866')
                      ? productId > 0
                      : stryMutAct_9fa48('4865')
                        ? productId < 0
                        : stryMutAct_9fa48('4864')
                          ? false
                          : (stryCov_9fa48('4864', '4865', '4866'), productId <= 0)))
        ) {
          if (stryMutAct_9fa48('4867')) {
            {
            }
          } else {
            stryCov_9fa48('4867')
            throw new BadRequestError(
              stryMutAct_9fa48('4868')
                ? ''
                : (stryCov_9fa48('4868'), 'Invalid product ID: must be a positive number'),
              stryMutAct_9fa48('4869')
                ? {}
                : (stryCov_9fa48('4869'),
                  {
                    productId
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('4872')
            ? !size && !VALID_SIZES.includes(size)
            : stryMutAct_9fa48('4871')
              ? false
              : stryMutAct_9fa48('4870')
                ? true
                : (stryCov_9fa48('4870', '4871', '4872'),
                  (stryMutAct_9fa48('4873') ? size : (stryCov_9fa48('4873'), !size)) ||
                    (stryMutAct_9fa48('4874')
                      ? VALID_SIZES.includes(size)
                      : (stryCov_9fa48('4874'), !VALID_SIZES.includes(size))))
        ) {
          if (stryMutAct_9fa48('4875')) {
            {
            }
          } else {
            stryCov_9fa48('4875')
            throw new ValidationError(
              (stryMutAct_9fa48('4876')
                ? ''
                : (stryCov_9fa48('4876'), 'Invalid size: must be one of ')) +
                VALID_SIZES.join(stryMutAct_9fa48('4877') ? '' : (stryCov_9fa48('4877'), ', ')),
              stryMutAct_9fa48('4878')
                ? {}
                : (stryCov_9fa48('4878'),
                  {
                    size
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('4879')
              ? {}
              : (stryCov_9fa48('4879'),
                {
                  active: stryMutAct_9fa48('4880') ? true : (stryCov_9fa48('4880'), false)
                })
          )
          .eq(stryMutAct_9fa48('4881') ? '' : (stryCov_9fa48('4881'), 'product_id'), productId)
          .eq(stryMutAct_9fa48('4882') ? '' : (stryCov_9fa48('4882'), 'size'), size)
          .eq(
            stryMutAct_9fa48('4883') ? '' : (stryCov_9fa48('4883'), 'active'),
            stryMutAct_9fa48('4884') ? false : (stryCov_9fa48('4884'), true)
          )
          .select()
        if (
          stryMutAct_9fa48('4886')
            ? false
            : stryMutAct_9fa48('4885')
              ? true
              : (stryCov_9fa48('4885', '4886'), error)
        ) {
          if (stryMutAct_9fa48('4887')) {
            {
            }
          } else {
            stryCov_9fa48('4887')
            throw new DatabaseError(
              stryMutAct_9fa48('4888') ? '' : (stryCov_9fa48('4888'), 'DELETE'),
              TABLE,
              error,
              stryMutAct_9fa48('4889')
                ? {}
                : (stryCov_9fa48('4889'),
                  {
                    productId,
                    size
                  })
            )
          }
        }
        return stryMutAct_9fa48('4890')
          ? {}
          : (stryCov_9fa48('4890'),
            {
              success: stryMutAct_9fa48('4891') ? false : (stryCov_9fa48('4891'), true),
              deleted_count: stryMutAct_9fa48('4894')
                ? data?.length && 0
                : stryMutAct_9fa48('4893')
                  ? false
                  : stryMutAct_9fa48('4892')
                    ? true
                    : (stryCov_9fa48('4892', '4893', '4894'),
                      (stryMutAct_9fa48('4895')
                        ? data.length
                        : (stryCov_9fa48('4895'), data?.length)) || 0),
              product_id: productId,
              size: size
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('4896')) {
        {
        }
      } else {
        stryCov_9fa48('4896')
        console.error(
          stryMutAct_9fa48('4897')
            ? ``
            : (stryCov_9fa48('4897'), `deleteProductImagesBySize(${productId}, ${size}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
