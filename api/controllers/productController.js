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

  res.status(200).json({
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

  res.status(200).json({
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
/**
 * @swagger
 * /api/products/with-occasions:
 *   get:
 *     tags: [Products]
 *     summary: Get products with occasions
 *     description: Returns products with their associated occasions
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: featured
 *         in: query
 *         schema: { type: boolean }
 *         description: Filter by featured products
 *     responses:
 *       200:
 *         description: Products with occasions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/product' } }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/products/occasion/{occasionId}:
 *   get:
 *     tags: [Products]
 *     summary: Get products by occasion
 *     parameters:
 *       - name: occasionId
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Occasion ID
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *     responses:
 *       200:
 *         description: Products for occasion retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/product' } }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
 * @param {Object} req.body - Product data
 * @param {string} req.body.name - Product name (required)
 * @param {number} req.body.price_usd - Price in USD (required)
 * @param {string} req.body.summary - Product summary
 * @param {string} req.body.description - Product description
 * @param {number} req.body.price_ves - Price in VES (optional)
 * @param {number} req.body.stock - Available stock (optional)
 * @param {string} req.body.sku - Product SKU (optional)
 * @param {boolean} req.body.featured - Whether product is featured (optional)
 * @param {number} req.body.carousel_order - Order in carousel display (optional)
 * @returns {Object} - Created product
 */
/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create new product
 *     description: Admin only - Creates a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price_usd]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 255 }
 *               summary: { type: string }
 *               description: { type: string }
 *               price_usd: { type: number, minimum: 0 }
 *               price_ves: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               sku: { type: string, maxLength: 50 }
 *               featured: { type: boolean }
 *               carousel_order: { type: integer, minimum: 0 }
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/product/{id}:
 *   post:
 *     tags: [product]
 *     summary: Create product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create product operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/products/with-occasions:
 *   post:
 *     tags: [Products]
 *     summary: Create product with occasions
 *     description: Admin only - Creates a new product with associated occasions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product, occasionIds]
 *             properties:
 *               product:
 *                 type: object
 *                 required: [name, price_usd]
 *                 properties:
 *                   name: { type: string, minLength: 2, maxLength: 255 }
 *                   summary: { type: string }
 *                   description: { type: string }
 *                   price_usd: { type: number, minimum: 0 }
 *                   price_ves: { type: number, minimum: 0 }
 *                   stock: { type: integer, minimum: 0 }
 *                   sku: { type: string, maxLength: 50 }
 *                   featured: { type: boolean }
 *                   carousel_order: { type: integer, minimum: 0, maximum: 7 }
 *               occasionIds: { type: array, items: { type: integer } }
 *     responses:
 *       201:
 *         description: Product with occasions created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
 * @param {number} req.params.id - Product ID
 * @param {Object} req.body - Updated product data
 * @returns {Object} - Updated product
 */
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     description: Admin only - Updates product fields
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               summary: { type: string }
 *               description: { type: string }
 *               price_usd: { type: number }
 *               price_ves: { type: number }
 *               stock: { type: integer }
 *               sku: { type: string }
 *               featured: { type: boolean }
 *               carousel_order: { type: integer }
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/product/{id}:
 *   patch:
 *     tags: [product]
 *     summary: Update product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update product operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/products/{id}/carousel-order:
 *   patch:
 *     tags: [Products]
 *     summary: Update product carousel order
 *     description: Admin only - Updates the carousel display order for a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Carousel order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Update product stock
 *     description: Admin only - Updates the stock quantity for a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
 * @param {number} req.params.id - Product ID
 * @returns {Object} - Deactivated product
 */
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (soft delete)
 *     description: Admin only - Soft deletes a product (sets active to false)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/products/{id}/reactivate:
 *   patch:
 *     tags: [Products]
 *     summary: Reactivate product
 *     description: Admin only - Reactivates a soft-deleted product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const reactivateProduct = asyncHandler(async (req, res) => {
  const product = await productService.reactivateProduct(req.params.id)

  res.json({
    success: true,
    data: product,
    message: 'Product reactivated successfully'
  })
})
