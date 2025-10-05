/**
 * Product Controller
 * Handles HTTP logic for product operations
 * Delegates business logic to productService
 */

import * as productService from '../services/productService.js'
import * as carouselService from '../services/carouselService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/products
 * Get all products with filters
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const filters = {
    featured:
      req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
    sku: req.query.sku,
    search: req.query.search,
    occasion: req.query.occasion,
    sortBy: req.query.sortBy,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset, 10) : undefined
  }

  // includeInactive: admin can see inactive products
  const includeInactive = req.query.includeInactive === 'true'

  // includeImageSize: optional image size to attach to products
  const includeImageSize = req.query.imageSize || null

  const products = await productService.getAllProducts(filters, includeInactive, includeImageSize)

  res.json({
    success: true,
    data: products,
    message:
      products.length === 0 ? 'No products found for filters' : 'Products retrieved successfully'
  })
})

/**
 * GET /api/products/:id
 * Get product by ID
 */
export const getProductById = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid id: must be a positive integer',
      message: 'Invalid id: must be a positive integer'
    })
  }

  // includeImageSize: optional image size to attach to product
  const includeImageSize = req.query.imageSize || null

  const product = await productService.getProductById(productId, false, includeImageSize)

  res.json({
    success: true,
    data: product,
    message: 'Product retrieved successfully'
  })
})

/**
 * GET /api/products/sku/:sku
 * Get product by SKU
 */
export const getProductBySku = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySku(req.params.sku)

  res.json({
    success: true,
    data: product,
    message: 'Product retrieved successfully'
  })
})

/**
 * GET /api/products/carousel
 * Get carousel products
 */
export const getCarouselProducts = asyncHandler(async (req, res) => {
  const products = await productService.getCarouselProducts()

  res.json({
    success: true,
    data: products,
    message: 'Carousel products retrieved successfully'
  })
})

/**
 * GET /api/products/with-occasions
 * Get products with occasions (stored function)
 */
export const getProductsWithOccasions = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 50
  const offset = req.query.offset || 0

  const products = await productService.getProductsWithOccasions(limit, offset)

  res.json({
    success: true,
    data: products,
    message: 'Products with occasions retrieved successfully'
  })
})

/**
 * GET /api/products/occasion/:occasionId
 * Get products by occasion
 */
export const getProductsByOccasion = asyncHandler(async (req, res) => {
  const occasionId = req.params.occasionId
  const limit = req.query.limit || 50

  const products = await productService.getProductsByOccasion(occasionId, limit)

  res.json({
    success: true,
    data: products,
    message: 'Products retrieved successfully'
  })
})

/**
 * POST /api/products
 * Create new product
 */
export const createProduct = asyncHandler(async (req, res) => {
  // Resolve carousel conflicts before creating
  if (req.body.featured && req.body.carousel_order) {
    await carouselService.resolveCarouselOrderConflict(req.body.carousel_order, null)
  }

  const product = await productService.createProduct(req.body)

  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully'
  })
})

/**
 * POST /api/products/with-occasions
 * Create product with occasions (atomic)
 */
export const createProductWithOccasions = asyncHandler(async (req, res) => {
  const { product, occasionIds } = req.body

  const result = await productService.createProductWithOccasions(product, occasionIds)

  res.status(201).json({
    success: true,
    data: result,
    message: 'Product with occasions created successfully'
  })
})

/**
 * PUT /api/products/:id
 * Update product
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)

  // Resolve carousel conflicts before updating
  if (req.body.featured && req.body.carousel_order) {
    await carouselService.resolveCarouselOrderConflict(req.body.carousel_order, productId)
  }

  const product = await productService.updateProduct(productId, req.body)

  res.json({
    success: true,
    data: product,
    message: 'Product updated successfully'
  })
})

/**
 * PATCH /api/products/:id/carousel-order
 * Update carousel order (atomic)
 */
export const updateCarouselOrder = asyncHandler(async (req, res) => {
  const { order } = req.body

  const result = await productService.updateCarouselOrder(req.params.id, order)

  res.json({
    success: true,
    data: result,
    message: 'Carousel order updated successfully'
  })
})

/**
 * PATCH /api/products/:id/stock
 * Update stock
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body

  const product = await productService.updateStock(req.params.id, quantity)

  res.json({
    success: true,
    data: product,
    message: 'Stock updated successfully'
  })
})

/**
 * DELETE /api/products/:id
 * Soft-delete product
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id)

  res.json({
    success: true,
    data: product,
    message: 'Product deactivated successfully'
  })
})

/**
 * PATCH /api/products/:id/reactivate
 * Reactivate product
 */
export const reactivateProduct = asyncHandler(async (req, res) => {
  const product = await productService.reactivateProduct(req.params.id)

  res.json({
    success: true,
    data: product,
    message: 'Product reactivated successfully'
  })
})
