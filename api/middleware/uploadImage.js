/**
 * Image Upload Middleware
 * Handles multipart/form-data file uploads with Multer
 */

import multer from 'multer'
import { BadRequestError } from '../errors/AppError.js'

/**
 * File filter - accept all image types
 */
const fileFilter = (req, file, cb) => {
  // Accept any file with mimetype starting with 'image/'
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(
      new BadRequestError(`Invalid file type: ${file.mimetype}. Only image files are allowed.`),
      false
    )
  }
}

/**
 * Multer configuration
 * Storage: memory (we'll process with sharp and upload to Supabase)
 * Limits: 2MB max file size (flexible - will be processed and optimized)
 *
 * Images are automatically processed with sharp to:
 * - Resize to appropriate dimensions (128x128px for logos, optimized for hero)
 * - Convert to WebP format for optimal web performance
 * - Compress for faster loading
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max for original upload
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
        message: 'File size exceeds 2MB limit'
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
