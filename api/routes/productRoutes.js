/**
 * Product Routes
 * Defines routes for product operations
 */

import express from 'express'
import * as productController from '../controllers/productController.js'
import * as productImageController from '../controllers/productImageController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, validateId, validatePagination } from '../middleware/validate.js'

const router = express.Router()

// Public routes
router.get('/', validatePagination, productController.getAllProducts)
router.get('/carousel', productController.getCarouselProducts)
router.get('/with-occasions', validatePagination, productController.getProductsWithOccasions)
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
  validate({
    name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
    price_usd: { type: 'number', required: true, min: 0 },
    price_ves: { type: 'number', min: 0 },
    stock: { type: 'number', integer: true, min: 0 },
    sku: { type: 'string', maxLength: 50 },
    featured: { type: 'boolean' },
    carousel_order: { type: 'number', integer: true, min: 0 }
  }),
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

router.put('/:id', authenticate, authorize('admin'), validateId(), productController.updateProduct)

router.patch(
  '/:id/carousel-order',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    order: { type: 'number', integer: true, min: 0 }
  }),
  productController.updateCarouselOrder
)

router.patch(
  '/:id/stock',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    quantity: { type: 'number', required: true, integer: true, min: 0 }
  }),
  productController.updateStock
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

export default router
