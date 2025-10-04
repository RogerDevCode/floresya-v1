/**
 * Image Upload Middleware
 * Handles multipart/form-data file uploads with Multer
 */

import multer from 'multer'
import { BadRequestError } from '../errors/AppError.js'

/**
 * File filter - only allow images
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new BadRequestError(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP`), false)
  }
}

/**
 * Multer configuration
 * Storage: memory (we'll process and upload to Supabase)
 * Limits: 4MB max file size (Vercel serverless function payload limit)
 *
 * IMPORTANT: Vercel serverless functions have a 4MB request body limit.
 * Files larger than 4MB will be rejected to prevent deployment errors.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB (Vercel limit)
    files: 5 // Max 5 files per request
  },
  fileFilter
})

/**
 * Single image upload middleware
 * Usage: upload.single('image')
 */
export const uploadSingle = upload.single('image')

/**
 * Multiple images upload middleware (max 5)
 * Usage: upload.array('images', 5)
 */
export const uploadMultiple = upload.array('images', 5)

/**
 * Handle multer errors
 */
export function handleMulterError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'PayloadTooLarge',
        message: 'File size exceeds 4MB limit (Vercel serverless function restriction)'
      })
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'TooManyFiles',
        message: 'Maximum 5 files allowed'
      })
    }

    return res.status(400).json({
      success: false,
      error: 'UploadError',
      message: error.message
    })
  }

  next(error)
}
