/**
 * Product Image Routes
 * Routes for product image operations
 */

import express from 'express'
import * as productImageController from '../controllers/productImageController.js'

const router = express.Router()

/**
 * GET /api/products/:id/images
 * Get all images for a product
 * Query params: size (optional) - filter by image size (thumb, small, medium, large)
 */
router.get('/:id/images', productImageController.getProductImages)

/**
 * GET /api/products/:id/images/primary
 * Get primary image for a product
 */
router.get('/:id/images/primary', productImageController.getPrimaryImage)

export default router
