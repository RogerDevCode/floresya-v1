/**
 * Product Controller
 * Handles HTTP logic for product operations
 */

import * as productService from '../services/productService.js'
import * as carouselService from '../services/carouselService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * Helper Functions
 * Common utilities following KISS, DRY, and SSOT principles
 */

/**
 * Creates standardized API response
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @returns {Object} Formatted response object
 */
const createResponse = (data, message) => ({
  success: true,
  data,
  message
})

/**
 * Gets appropriate HTTP status code for operation
 * @param {string} operation - Operation type (create, update, delete, etc.)
 * @returns {number} HTTP status code
 */
const getStatusCode = operation => {
  const statusCodes = {
    create: 201,
    update: 200,
    delete: 200,
    reactivate: 200,
    stock: 200,
    carousel: 200,
    link: 200,
    replace: 200
  }
  return statusCodes[operation] || 200
}

/**
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'Product') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deactivated successfully`,
    reactivate: `${entity} reactivated successfully`,
    stock: 'Stock updated successfully',
    carousel: 'Carousel order updated successfully',
    link: 'Occasion linked to product successfully',
    replace: 'Product occasions updated successfully',
    retrieve: `${entity} retrieved successfully`,
    occasions: 'Product occasions retrieved successfully'
  }
  return messages[operation] || `${entity} operation completed successfully`
}

/**
 * Validates product ID parameter
 * @param {string} idParam - ID parameter from request
 * @param {string} operation - Operation being performed (for error messages)
 * @returns {number} Validated numeric ID
 * @throws {AppError} 400 for invalid IDs, maintains existing error handling for service layer
 */
const validateProductId = (idParam, operation = 'operation') => {
  // Check if parameter exists
  if (!idParam) {
    const error = new AppError(`Product ID is required for ${operation}`, 400)
    throw error
  }

  // Try to parse as integer
  const numericId = parseInt(idParam, 10)

  // Check if parsing failed (NaN) or if it's not a positive integer
  if (isNaN(numericId) || numericId <= 0) {
    const error = new AppError(
      `Invalid product ID '${idParam}' for ${operation}. Must be a positive integer.`,
      400
    )
    throw error
  }

  return numericId
}

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
    limit: req.query.limit,
    offset: req.query.offset
  }

  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'
  const includeImageSize = req.query.imageSize || null

  const products = await productService.getAllProducts(filters, includeInactive, includeImageSize)

  const response = createResponse(products, getSuccessMessage('retrieve', 'Products'))
  res.json(response)
})

/**
 * GET /api/products/:id
 * Get product by ID
 */
export const getProductById = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id, 'getProductById')
  const includeImageSize = req.query.imageSize || null

  const product = await productService.getProductById(productId, false, includeImageSize)

  const response = createResponse(product, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * GET /api/products/sku/:sku
 * Get product by SKU
 */
export const getProductBySku = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySku(req.params.sku)

  const response = createResponse(product, getSuccessMessage('retrieve'))
  res.json(response)
})

/**
 * GET /api/products/carousel
 * Get carousel products
 */
export const getCarouselProducts = asyncHandler(async (req, res) => {
  const products = await productService.getCarouselProducts()

  const response = createResponse(products, getSuccessMessage('retrieve', 'Carousel products'))
  res.json(response)
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

  const response = createResponse(
    products,
    getSuccessMessage('retrieve', 'Products with occasions')
  )
  res.json(response)
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

  const response = createResponse(products, getSuccessMessage('retrieve', 'Products'))
  res.json(response)
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

  const response = createResponse(product, getSuccessMessage('create'))
  res.status(getStatusCode('create')).json(response)
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

  const response = createResponse(result, getSuccessMessage('create', 'Product with occasions'))
  res.status(getStatusCode('create')).json(response)
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
  const productId = validateProductId(req.params.id, 'updateProduct')

  // Resolve carousel conflicts before updating
  if (req.body.featured && req.body.carousel_order) {
    await carouselService.resolveCarouselOrderConflict(req.body.carousel_order, productId)
  }

  const product = await productService.updateProduct(productId, req.body)

  const response = createResponse(product, getSuccessMessage('update'))
  res.json(response)
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
  const productId = validateProductId(req.params.id, 'updateCarouselOrder')

  const result = await productService.updateCarouselOrder(productId, order)

  const response = createResponse(result, getSuccessMessage('carousel'))
  res.json(response)
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
  const productId = validateProductId(req.params.id, 'updateStock')

  const product = await productService.updateStock(productId, quantity)

  const response = createResponse(product, getSuccessMessage('stock'))
  res.json(response)
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
  const productId = validateProductId(req.params.id, 'deleteProduct')

  const product = await productService.deleteProduct(productId)

  const response = createResponse(product, getSuccessMessage('delete'))
  res.json(response)
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
  const productId = validateProductId(req.params.id, 'reactivateProduct')

  const product = await productService.reactivateProduct(productId)

  const response = createResponse(product, getSuccessMessage('reactivate'))
  res.json(response)
})

/**
 * Get occasions linked to a specific product
 * @swagger
 * /api/products/{id}/occasions:
 *   get:
 *     tags: [Products]
 *     summary: Get occasions linked to a product
 *     description: Retrieve all occasions that are linked to a specific product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product occasions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/responses/SuccessResponse'
 *                 - type: object
 *                 properties:
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/ProductOccasion'
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerErrorError' }
 */
export const getProductOccasions = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id, 'getProductOccasions')

  const result = await productService.getProductOccasions(productId)

  const response = createResponse(result, getSuccessMessage('occasions'))
  res.json(response)
})

/**
 * Link a single occasion to a product
 * @swagger
 * /api/products/{id}/occasions/{occasionId}
 *   post:
 *     tags: [Products]
 *     summary: Link occasion to product
 *     description: Link a single occasion to a product
 *     security:
 *       - bearerAuth: []
 *       - access: Admin only
 *       x-admin-only: true
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/OccasionIdParam'
 *     responses:
 *       200:
 *         description: Occasion linked successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/responses/SuccessResponse'
 *                 - type: object
 *                 properties:
 *                   data:
 *                     description: Updated product occasion relationship
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerErrorError' }
 */
export const linkProductOccasion = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id, 'linkProductOccasion')

  const result = await productService.linkProductOccasion(productId, req.params.occasionId)

  const response = createResponse(result, getSuccessMessage('link'))
  res.json(response)
})

/**
 * Get occasions linked to a specific product
 * @swagger
 * /api/products/{id}/occasions/{occasionId}
 *   get:
 *     tags: [Products]
 *     summary: Get occasions linked to a product
 *     description: Retrieve all occasions that are linked to a specific product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/OccasionIdParam'
 *     responses:
 *       200:
 *         description: Product occasions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/responses/SuccessResponse'
 *                 - type: object
 *                 properties:
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/ProductOccasion'
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerErrorError' }
 */
/**
 * Replace all occasions for a product
 * @swagger
 * /api/products/{id}/occasions:
 *   put:
 *     tags: [Products]
 *     summary: Replace all occasions for a product
 *     description: Replace all occasions linked to a product (transactional operation)
 *     security:
 *       - bearerAuth: []
 *     access: Admin only
 *     x-admin-only: true
 *     x-transactional: true
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     - name: body
 *       in: body
 *       required: true
 *       schema:
 *         type: object
 *         required:
 *           - occasion_ids
 *         properties:
 *           occasion_ids:
 *             type: array
 *             items:
 *               type: integer
 *             description: Array of occasion IDs to link to the product
 *     responses:
 *       200:
 *         description: Product occasions replaced successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/responses/SuccessResponse'
 *                 - type: object
 *                 properties:
 *                   data:
 *                     description: Updated product with new occasions
 *                     type: object
 *                     allOf:
 *                       - $ref: '#/components/schemas/Product'
 *                       - type: object
 *                         properties:
 *                           occasion_ids:
 *                             type: array
 *                             items:
 *                               type: integer
 *                             description: Array of occasion IDs
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 *       403: { $ref: '#/components/responses/ForbiddenError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerErrorError' }
 * @route PUT /api/products/:id/occasions
 * @access Admin
 */
export const replaceProductOccasions = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id, 'replaceProductOccasions')

  const result = await productService.replaceProductOccasions(productId, req.body.occasion_ids)

  const response = createResponse(result, getSuccessMessage('replace'))
  res.json(response)
})
