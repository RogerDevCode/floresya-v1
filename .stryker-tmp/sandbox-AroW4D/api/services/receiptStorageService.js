/**
 * Receipt Storage Service
 * Handles receipt file uploads to Supabase Storage
 * @module services/receiptStorageService
 */
// @ts-nocheck
function stryNS_9fa48() {
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
import { supabase } from '../services/supabaseClient.js'
import { logger } from '../utils/logger.js'
import { AppError } from '../errors/AppError.js'
const BUCKET_NAME = stryMutAct_9fa48('5423') ? '' : (stryCov_9fa48('5423'), 'receipts')
class ReceiptStorageService {
  /**
   * Upload receipt file to Supabase Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @param {number} userId - User ID uploading the file
   * @returns {Promise<string>} Public URL of uploaded file
   */
  async uploadReceipt(fileBuffer, fileName, mimeType, userId) {
    if (stryMutAct_9fa48('5424')) {
      {
      }
    } else {
      stryCov_9fa48('5424')
      try {
        if (stryMutAct_9fa48('5425')) {
          {
          }
        } else {
          stryCov_9fa48('5425')
          // Generate unique filename
          const timestamp = Date.now()
          const sanitizedName = fileName.replace(
            stryMutAct_9fa48('5426')
              ? /[a-zA-Z0-9.-]/g
              : (stryCov_9fa48('5426'), /[^a-zA-Z0-9.-]/g),
            stryMutAct_9fa48('5427') ? '' : (stryCov_9fa48('5427'), '_')
          )
          const uniqueFileName = stryMutAct_9fa48('5428')
            ? ``
            : (stryCov_9fa48('5428'), `${userId}/${timestamp}_${sanitizedName}`)

          // Upload to Supabase Storage
          const { error } = await supabase.storage.from(BUCKET_NAME).upload(
            uniqueFileName,
            fileBuffer,
            stryMutAct_9fa48('5429')
              ? {}
              : (stryCov_9fa48('5429'),
                {
                  contentType: mimeType,
                  cacheControl: stryMutAct_9fa48('5430') ? '' : (stryCov_9fa48('5430'), '3600'),
                  upsert: stryMutAct_9fa48('5431') ? true : (stryCov_9fa48('5431'), false)
                })
          )
          if (
            stryMutAct_9fa48('5433')
              ? false
              : stryMutAct_9fa48('5432')
                ? true
                : (stryCov_9fa48('5432', '5433'), error)
          ) {
            if (stryMutAct_9fa48('5434')) {
              {
              }
            } else {
              stryCov_9fa48('5434')
              logger.error(
                stryMutAct_9fa48('5435')
                  ? ''
                  : (stryCov_9fa48('5435'), 'Supabase storage upload error:'),
                error
              )
              throw new AppError(
                stryMutAct_9fa48('5436') ? '' : (stryCov_9fa48('5436'), 'Failed to upload receipt'),
                500,
                stryMutAct_9fa48('5437')
                  ? {}
                  : (stryCov_9fa48('5437'),
                    {
                      originalError: error.message
                    })
              )
            }
          }

          // Get public URL
          const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName)
          logger.info(
            stryMutAct_9fa48('5438')
              ? ``
              : (stryCov_9fa48('5438'), `Receipt uploaded successfully: ${uniqueFileName}`)
          )
          return urlData.publicUrl
        }
      } catch (error) {
        if (stryMutAct_9fa48('5439')) {
          {
          }
        } else {
          stryCov_9fa48('5439')
          if (
            stryMutAct_9fa48('5441')
              ? false
              : stryMutAct_9fa48('5440')
                ? true
                : (stryCov_9fa48('5440', '5441'), error instanceof AppError)
          ) {
            if (stryMutAct_9fa48('5442')) {
              {
              }
            } else {
              stryCov_9fa48('5442')
              throw error
            }
          }
          logger.error(
            stryMutAct_9fa48('5443') ? '' : (stryCov_9fa48('5443'), 'Error uploading receipt:'),
            error
          )
          throw new AppError(
            stryMutAct_9fa48('5444') ? '' : (stryCov_9fa48('5444'), 'Receipt upload failed'),
            500,
            stryMutAct_9fa48('5445')
              ? {}
              : (stryCov_9fa48('5445'),
                {
                  error: error.message
                })
          )
        }
      }
    }
  }

  /**
   * Delete receipt from storage
   * @param {string} receiptUrl - Public URL of the receipt
   * @returns {Promise<boolean>} Success status
   */
  async deleteReceipt(receiptUrl) {
    if (stryMutAct_9fa48('5446')) {
      {
      }
    } else {
      stryCov_9fa48('5446')
      try {
        if (stryMutAct_9fa48('5447')) {
          {
          }
        } else {
          stryCov_9fa48('5447')
          if (
            stryMutAct_9fa48('5450')
              ? false
              : stryMutAct_9fa48('5449')
                ? true
                : stryMutAct_9fa48('5448')
                  ? receiptUrl
                  : (stryCov_9fa48('5448', '5449', '5450'), !receiptUrl)
          ) {
            if (stryMutAct_9fa48('5451')) {
              {
              }
            } else {
              stryCov_9fa48('5451')
              return stryMutAct_9fa48('5452') ? false : (stryCov_9fa48('5452'), true)
            }
          }

          // Extract file path from URL
          const urlParts = receiptUrl.split(
            stryMutAct_9fa48('5453') ? `` : (stryCov_9fa48('5453'), `${BUCKET_NAME}/`)
          )
          if (
            stryMutAct_9fa48('5457')
              ? urlParts.length >= 2
              : stryMutAct_9fa48('5456')
                ? urlParts.length <= 2
                : stryMutAct_9fa48('5455')
                  ? false
                  : stryMutAct_9fa48('5454')
                    ? true
                    : (stryCov_9fa48('5454', '5455', '5456', '5457'), urlParts.length < 2)
          ) {
            if (stryMutAct_9fa48('5458')) {
              {
              }
            } else {
              stryCov_9fa48('5458')
              logger.warn(
                stryMutAct_9fa48('5459')
                  ? ''
                  : (stryCov_9fa48('5459'), 'Invalid receipt URL format:'),
                receiptUrl
              )
              return stryMutAct_9fa48('5460') ? true : (stryCov_9fa48('5460'), false)
            }
          }
          const filePath = urlParts[1]
          const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(stryMutAct_9fa48('5461') ? [] : (stryCov_9fa48('5461'), [filePath]))
          if (
            stryMutAct_9fa48('5463')
              ? false
              : stryMutAct_9fa48('5462')
                ? true
                : (stryCov_9fa48('5462', '5463'), error)
          ) {
            if (stryMutAct_9fa48('5464')) {
              {
              }
            } else {
              stryCov_9fa48('5464')
              logger.error(
                stryMutAct_9fa48('5465') ? '' : (stryCov_9fa48('5465'), 'Error deleting receipt:'),
                error
              )
              return stryMutAct_9fa48('5466') ? true : (stryCov_9fa48('5466'), false)
            }
          }
          logger.info(
            stryMutAct_9fa48('5467') ? `` : (stryCov_9fa48('5467'), `Receipt deleted: ${filePath}`)
          )
          return stryMutAct_9fa48('5468') ? false : (stryCov_9fa48('5468'), true)
        }
      } catch (error) {
        if (stryMutAct_9fa48('5469')) {
          {
          }
        } else {
          stryCov_9fa48('5469')
          logger.error(
            stryMutAct_9fa48('5470') ? '' : (stryCov_9fa48('5470'), 'Error deleting receipt:'),
            error
          )
          return stryMutAct_9fa48('5471') ? true : (stryCov_9fa48('5471'), false)
        }
      }
    }
  }

  /**
   * Initialize storage bucket if not exists
   * @returns {Promise<void>}
   */
  async initializeBucket() {
    if (stryMutAct_9fa48('5472')) {
      {
      }
    } else {
      stryCov_9fa48('5472')
      try {
        if (stryMutAct_9fa48('5473')) {
          {
          }
        } else {
          stryCov_9fa48('5473')
          const { data: buckets } = await supabase.storage.listBuckets()
          const bucketExists = stryMutAct_9fa48('5475')
            ? buckets.some(b => b.name === BUCKET_NAME)
            : stryMutAct_9fa48('5474')
              ? buckets?.every(b => b.name === BUCKET_NAME)
              : (stryCov_9fa48('5474', '5475'),
                buckets?.some(
                  stryMutAct_9fa48('5476')
                    ? () => undefined
                    : (stryCov_9fa48('5476'),
                      b =>
                        stryMutAct_9fa48('5479')
                          ? b.name !== BUCKET_NAME
                          : stryMutAct_9fa48('5478')
                            ? false
                            : stryMutAct_9fa48('5477')
                              ? true
                              : (stryCov_9fa48('5477', '5478', '5479'), b.name === BUCKET_NAME))
                ))
          if (
            stryMutAct_9fa48('5482')
              ? false
              : stryMutAct_9fa48('5481')
                ? true
                : stryMutAct_9fa48('5480')
                  ? bucketExists
                  : (stryCov_9fa48('5480', '5481', '5482'), !bucketExists)
          ) {
            if (stryMutAct_9fa48('5483')) {
              {
              }
            } else {
              stryCov_9fa48('5483')
              const { error } = await supabase.storage.createBucket(
                BUCKET_NAME,
                stryMutAct_9fa48('5484')
                  ? {}
                  : (stryCov_9fa48('5484'),
                    {
                      public: stryMutAct_9fa48('5485') ? false : (stryCov_9fa48('5485'), true),
                      fileSizeLimit: 5242880 // 5MB
                    })
              )
              if (
                stryMutAct_9fa48('5487')
                  ? false
                  : stryMutAct_9fa48('5486')
                    ? true
                    : (stryCov_9fa48('5486', '5487'), error)
              ) {
                if (stryMutAct_9fa48('5488')) {
                  {
                  }
                } else {
                  stryCov_9fa48('5488')
                  logger.error(
                    stryMutAct_9fa48('5489')
                      ? ''
                      : (stryCov_9fa48('5489'), 'Error creating receipts bucket:'),
                    error
                  )
                }
              } else {
                if (stryMutAct_9fa48('5490')) {
                  {
                  }
                } else {
                  stryCov_9fa48('5490')
                  logger.info(
                    stryMutAct_9fa48('5491')
                      ? ''
                      : (stryCov_9fa48('5491'), 'Receipts bucket created successfully')
                  )
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48('5492')) {
          {
          }
        } else {
          stryCov_9fa48('5492')
          logger.error(
            stryMutAct_9fa48('5493')
              ? ''
              : (stryCov_9fa48('5493'), 'Error initializing receipts bucket:'),
            error
          )
        }
      }
    }
  }
}
export default new ReceiptStorageService()
