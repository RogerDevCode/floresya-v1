/**
 * Product Image Routes
 * Routes for product image operations
 */

import express from 'express'
import * as productImageController from '../controllers/productImageController.js'
import { authenticate, authorize } from '../middleware/auth/index.js'
import { uploadSingle, handleMulterError } from '../middleware/utilities/index.js'
import { validateId } from '../middleware/validation/index.js'

const router = express.Router()

/**
 * GET /api/products/:id/images
 * Get all images for a product
 * Query params: size (optional) - filter by image size (thumb, small, medium, large)
 */
router.get('/:id/images', validateId(), productImageController.getProductImages)

/**
 * GET /api/products/:id/images/primary
 * Get primary image for a product
 */
router.get('/:id/images/primary', validateId(), productImageController.getPrimaryImage)

/**
 * POST /api/products/:id/images
 * Create images for a product (all sizes for a single image_index)
 * Admin only
 * Supports multipart/form-data (file upload) or JSON body
 */
router.post(
  '/:id/images',
  validateId(),
  authenticate,
  authorize('admin'),
  uploadSingle, // Multer middleware for file upload
  handleMulterError, // Handle multer-specific errors
  productImageController.createProductImages
)

/**
 * DELETE /api/products/:id/images/:imageIndex
 * Delete images by image_index (all sizes)
 * Admin only
 */
router.delete(
  '/:id/images/:imageIndex',
  validateId(),
  validateId('imageIndex'),
  authenticate,
  authorize('admin'),
  productImageController.deleteImagesByIndex
)

/**
 * PATCH /api/products/:id/images/primary/:imageIndex
 * Set primary image by image_index
 * Admin only
 */
router.patch(
  '/:id/images/primary/:imageIndex',
  validateId(),
  validateId('imageIndex'),
  authenticate,
  authorize('admin'),
  productImageController.setPrimaryImage
)

export default router
