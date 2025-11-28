/**
 * Receipt Storage Service
 * Handles receipt file uploads to Supabase Storage
 * @module services/receiptStorageService
 */

import { supabase } from '../services/supabaseClient.js'
import { logger } from '../utils/logger.js'
import { AppError } from '../errors/AppError.js'
import { withErrorMapping } from '../middleware/error/index.js'

const BUCKET_NAME = 'receipts'
const TABLE = 'receipts'

/**
 * Upload receipt file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {number} userId - User ID uploading the file
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadReceipt = withErrorMapping(
  async (fileBuffer, fileName, mimeType, userId) => {
    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${userId}/${timestamp}_${sanitizedName}`

    // Upload to Supabase Storage
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(uniqueFileName, fileBuffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    })

    if (error) {
      logger.error('Supabase storage upload error:', error)
      throw new AppError('Failed to upload receipt', 500, { originalError: error.message })
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName)

    logger.info(`Receipt uploaded successfully: ${uniqueFileName}`)
    return urlData.publicUrl
  },
  'UPLOAD',
  TABLE
)

/**
 * Delete receipt from storage
 * @param {string} receiptUrl - Public URL of the receipt
 * @returns {Promise<boolean>} Success status
 */
export const deleteReceipt = withErrorMapping(
  async receiptUrl => {
    if (!receiptUrl) {
      return true
    }

    // Extract file path from URL
    const urlParts = receiptUrl.split(`${BUCKET_NAME}/`)
    if (urlParts.length < 2) {
      logger.warn('Invalid receipt URL format:', receiptUrl)
      return false
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

    if (error) {
      logger.error('Error deleting receipt:', error)
      return false
    }

    logger.info(`Receipt deleted: ${filePath}`)
    return true
  },
  'DELETE',
  TABLE
)

/**
 * Initialize storage bucket if not exists
 * @returns {Promise<void>}
 */
export const initializeBucket = withErrorMapping(
  async () => {
    const { data: buckets } = await supabase.storage.listBuckets()

    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME)

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      })

      if (error) {
        logger.error('Error creating receipts bucket:', error)
      } else {
        logger.info('Receipts bucket created successfully')
      }
    }
  },
  'CREATE',
  BUCKET_NAME
)
