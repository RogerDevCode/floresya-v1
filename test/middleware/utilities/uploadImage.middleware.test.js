/**
 * Tests for Upload Image Middleware
 * Coverage for image upload validation and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleMulterError } from '../../../api/middleware/utilities/uploadImage.js'
import multer from 'multer'

vi.mock('../../../api/errors/AppError.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'BadRequestError'
      this.context = context
      this.statusCode = 400
    }
  },
  PayloadTooLargeError: class PayloadTooLargeError extends Error {
    constructor(message, context) {
      super(message)
      this.name = 'PayloadTooLargeError'
      this.context = context
      this.statusCode = 413
    }
  }
}))

describe('Upload Image Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {}
    res = {}
    next = vi.fn()
  })

  describe('handleMulterError', () => {
    it('should handle LIMIT_FILE_SIZE error', () => {
      const error = new multer.MulterError('LIMIT_FILE_SIZE')
      error.code = 'LIMIT_FILE_SIZE'
      error.field = 'image'

      handleMulterError(error, req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PayloadTooLargeError',
          message: expect.stringContaining('2MB limit')
        })
      )
    })

    it('should handle LIMIT_FILE_COUNT error', () => {
      const error = new multer.MulterError('LIMIT_FILE_COUNT')
      error.code = 'LIMIT_FILE_COUNT'
      error.value = 10

      handleMulterError(error, req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'BadRequestError',
          message: expect.stringContaining('Maximum 5 files')
        })
      )
    })

    it('should handle other MulterError types', () => {
      const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE')
      error.code = 'LIMIT_UNEXPECTED_FILE'
      error.field = 'wrongfield'

      handleMulterError(error, req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'BadRequestError',
          message: expect.stringContaining('Upload error')
        })
      )
    })

    it('should pass non-Multer errors through', () => {
      const error = new Error('Generic error')

      handleMulterError(error, req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it('should include error context in responses', () => {
      const error = new multer.MulterError('LIMIT_FILE_SIZE')
      error.code = 'LIMIT_FILE_SIZE'
      error.field = 'photos'

      handleMulterError(error, req, res, next)

      const calledError = next.mock.calls[0][0]
      expect(calledError.context).toMatchObject({
        maxSize: '2MB',
        field: 'photos'
      })
    })
  })
})
