/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Product Routes
 * Defines routes for product operations
 * Uses centralized validation schemas from api/middleware/schemas.js
 */

import express from 'express'
import * as productController from '../controllers/productController.js'
import * as productImageController from '../controllers/productImageController.js'
import { authenticate, authorize } from '../middleware/auth/index.js'
import {
  validate,
  validateId,
  validatePagination,
  productCreateSchema,
  productUpdateSchema
} from '../middleware/validation/index.js'
import { uploadSingle } from '../middleware/utilities/index.js'

const router = express.Router()

// Public routes
router.get('/', validatePagination, productController.getAllProducts)
router.get('/carousel', productController.getCarouselProducts)
router.get('/with-occasions', productController.getProductsWithOccasions)
router.get(
  '/occasion/:occasionId',
  validateId('occasionId'),
  productController.getProductsByOccasion
)
router.get('/sku/:sku', productController.getProductBySku)

// Product images routes (MUST be before /:id to avoid conflicts)
router.get('/:id/images/primary', validateId(), productImageController.getPrimaryImage)
router.get('/:id/images', validateId(), productImageController.getProductImages)

// Product by ID (must be last parameterized route)
router.get('/:id', validateId(), productController.getProductById)

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(productCreateSchema),
  productController.createProduct
)
router.post(
  '/with-occasions',
  authenticate,
  authorize('admin'),
  validate({
    product: { type: 'object', required: true },
    occasionIds: { type: 'array', items: 'number' }
  }),
  productController.createProductWithOccasions
)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  validate(productUpdateSchema),
  productController.updateProduct
)
router.patch(
  '/:id/carousel-order',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({ order: { type: 'number', integer: true, min: 0 } }),
  productController.updateCarouselOrder
)
router.patch(
  '/:id/stock',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({ quantity: { type: 'number', required: true, integer: true, min: 0 } }),
  productController.updateStock
)

// Product image management routes (admin only) - MUST come before /:id routes
router.post(
  '/:id/images',
  authenticate,
  authorize('admin'),
  validateId(),
  uploadSingle,
  productImageController.createProductImages
)
router.delete(
  '/:id/images/:imageIndex',
  authenticate,
  authorize('admin'),
  validateId(),
  productImageController.deleteImagesByIndex
)
router.patch(
  '/:id/images/primary/:imageIndex',
  authenticate,
  authorize('admin'),
  validateId(),
  productImageController.setPrimaryImage
)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  productController.deleteProduct
)
router.patch(
  '/:id/reactivate',
  authenticate,
  authorize('admin'),
  validateId(),
  productController.reactivateProduct
)

// Get occasions linked to a product
router.get(
  '/:id/occasions',
  authenticate,
  authorize('admin'),
  validateId(),
  productController.getProductOccasions
)
router.post(
  '/:id/occasions/:occasionId',
  authenticate,
  authorize('admin'),
  validateId(),
  validateId('occasionId'),
  productController.linkProductOccasion
)
router.put(
  '/:id/occasions',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({ occasion_ids: { type: 'array', required: true, items: 'number' } }),
  productController.replaceProductOccasions
)

export default router
