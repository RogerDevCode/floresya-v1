/**
 * Product Controller
 * Handles HTTP logic for product operations
 * Delegates business logic to productService
 */

import * as productService from '../services/productService.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { NotFoundError } from '../errors/AppError.js'

/**
 * GET /api/products
 * Get all products with filters
 */
export const getAllProducts = asyncHandler(async(req, res) => {
  const filters = {
    featured: req.query.featured === 'true',
    sku: req.query.sku,
    search: req.query.search,
    sortBy: req.query.sortBy,
    limit: req.query.limit,
    offset: req.query.offset
  }

  const products = await productService.getAllProducts(filters)

  res.json({
    success: true,
    data: products,
    message: 'Products retrieved successfully'
  })
})

/**
 * GET /api/products/:id
 * Get product by ID
 */
export const getProductById = asyncHandler(async(req, res) => {
  const product = await productService.getProductById(req.params.id)

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
export const getProductBySku = asyncHandler(async(req, res) => {
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
export const getCarouselProducts = asyncHandler(async(req, res) => {
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
export const getProductsWithOccasions = asyncHandler(async(req, res) => {
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
export const getProductsByOccasion = asyncHandler(async(req, res) => {
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
export const createProduct = asyncHandler(async(req, res) => {
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
export const createProductWithOccasions = asyncHandler(async(req, res) => {
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
export const updateProduct = asyncHandler(async(req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body)

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
export const updateCarouselOrder = asyncHandler(async(req, res) => {
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
export const updateStock = asyncHandler(async(req, res) => {
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
export const deleteProduct = asyncHandler(async(req, res) => {
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
export const reactivateProduct = asyncHandler(async(req, res) => {
  const product = await productService.reactivateProduct(req.params.id)

  res.json({
    success: true,
    data: product,
    message: 'Product reactivated successfully'
  })
})
