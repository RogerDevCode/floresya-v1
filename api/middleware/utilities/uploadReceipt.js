/**
 * Receipt Upload Middleware
 * Handles receipt file uploads (images and PDFs)
 * @module middleware/utilities/uploadReceipt
 */

import multer from 'multer'
import { BadRequestError, PayloadTooLargeError } from '../../errors/AppError.js'

/**
 * File filter - accept images and PDFs
 */
const receiptFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, WebP) and PDF are allowed.`
      ),
      false
    )
  }
}

/**
 * Multer configuration for receipts
 * Storage: memory (upload to Supabase storage)
 * Limits: 5MB max file size
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: receiptFilter
})

/**
 * Single receipt upload middleware
 */
export const uploadReceipt = upload.single('receipt')

/**
 * Handle multer errors for receipts
 */
export function handleReceiptUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      const err = new PayloadTooLargeError('Receipt file exceeds 5MB limit', {
        maxSize: '5MB',
        field: error.field
      })
      return next(err)
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      const err = new BadRequestError('Only one receipt file allowed', {
        maxFiles: 1
      })
      return next(err)
    }

    const err = new BadRequestError(`Upload error: ${error.message}`, {
      code: error.code,
      field: error.field
    })
    return next(err)
  }

  next(error)
}
