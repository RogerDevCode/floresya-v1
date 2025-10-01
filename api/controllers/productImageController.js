/**
 * Product Image Controller
 * Handles HTTP logic for product image operations
 * Delegates business logic to productImageService
 */

import * as productImageService from '../services/productImageService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/products/:id/images
 * Get all images for a product (filtered by size if needed)
 * Query params: size (optional) - filter by image size
 */
export const getProductImages = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID',
      message: 'Product ID must be a positive number'
    })
  }

  const filters = {}

  // Filter by size if provided (default: all sizes)
  if (req.query.size) {
    filters.size = req.query.size
  }

  const images = await productImageService.getProductImages(productId, filters)

  res.status(200).json({
    success: true,
    data: images,
    message: `${images.length} image(s) retrieved successfully for product ${productId}`
  })
})

/**
 * GET /api/products/:id/images/primary
 * Get primary image for a product
 */
export const getPrimaryImage = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID',
      message: 'Product ID must be a positive number'
    })
  }

  const image = await productImageService.getPrimaryImage(productId)

  res.status(200).json({
    success: true,
    data: image,
    message: 'Primary image retrieved successfully'
  })
})
