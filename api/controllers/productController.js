/**
 * Product Controller
 * Handles HTTP logic for product operations
 * Extends BaseController for common functionality
 */

import * as productService from '../services/productService.js'
import * as carouselService from '../services/carouselService.js'
import { asyncHandler } from '../middleware/error/index.js'
import { BadRequestError } from '../errors/AppError.js'
import { BaseController } from './BaseController.js'

/**
 * Product Controller extending BaseController
 * Inherits common response patterns and validation helpers
 */
class ProductController extends BaseController {
  /**
   * GET /api/products
   * Get all products with filters
   */
  getAllProducts = asyncHandler(async (req, res) => {
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

    const includeDeactivated = req.user?.role === 'admin' && req.query.includeDeactivated === 'true'

    // Validate imageSize if provided using centralized ValidatorService
    let includeImageSize = null
    if (req.query.imageSize !== undefined) {
      this.validateEnum(req.query.imageSize, ['small', 'medium', 'large', 'thumbnail'], 'imageSize')
      includeImageSize = req.query.imageSize
    }

    const products = await productService.getAllProducts(
      filters,
      includeDeactivated,
      includeImageSize
    )

    this.sendResponse(res, products, this.getSuccessMessage('retrieve', 'Products'))
  })

  /**
   * GET /api/products/:id
   * Get product by ID
   */
  getProductById = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    // Validate imageSize if provided using centralized ValidatorService
    let includeImageSize = null
    if (req.query.imageSize !== undefined) {
      this.validateEnum(req.query.imageSize, ['small', 'medium', 'large', 'thumbnail'], 'imageSize')
      includeImageSize = req.query.imageSize
    }

    const product = await productService.getProductById(productId, false, includeImageSize)

    this.sendResponse(res, product, this.getSuccessMessage('retrieve', 'Product'))
  })

  /**
   * GET /api/products/sku/:sku
   * Get product by SKU
   */
  getProductBySku = asyncHandler(async (req, res) => {
    const product = await productService.getProductBySku(req.params.sku)

    this.sendResponse(res, product, this.getSuccessMessage('retrieve', 'Product'))
  })

  /**
   * GET /api/products/carousel
   * Get carousel products
   */
  getCarouselProducts = asyncHandler(async (req, res) => {
    const products = await productService.getCarouselProducts()

    this.sendResponse(res, products, this.getSuccessMessage('retrieve', 'Carousel products'))
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
  getProductsWithOccasions = asyncHandler(async (req, res) => {
    // FAIL FAST - Explicit validation for pagination parameters
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50
    if (req.query.limit && (isNaN(limit) || limit <= 0 || limit > 1000)) {
      throw new BadRequestError('Invalid limit: must be a positive number <= 1000', {
        limit: req.query.limit,
        rule: 'positive number <= 1000'
      })
    }

    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0
    if (req.query.offset && (isNaN(offset) || offset < 0)) {
      throw new BadRequestError('Invalid offset: must be a non-negative number', {
        offset: req.query.offset,
        rule: 'non-negative number'
      })
    }

    const products = await productService.getProductsWithOccasions(limit, offset)

    this.sendResponse(res, products, this.getSuccessMessage('retrieve', 'Products with occasions'))
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
  getProductsByOccasion = asyncHandler(async (req, res) => {
    const occasionId = req.params.occasionId

    // FAIL FAST - Explicit validation for limit parameter
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50
    if (req.query.limit && (isNaN(limit) || limit <= 0 || limit > 1000)) {
      throw new BadRequestError('Invalid limit: must be a positive number <= 1000', {
        limit: req.query.limit,
        rule: 'positive number <= 1000'
      })
    }

    const products = await productService.getProductsByOccasion(occasionId, limit)

    this.sendResponse(res, products, this.getSuccessMessage('retrieve', 'Products'))
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
  createProduct = asyncHandler(async (req, res) => {
    // Resolve carousel conflicts before creating
    if (req.body.featured && req.body.carousel_order) {
      await carouselService.resolveCarouselOrderConflict(req.body.carousel_order, null)
    }

    const product = await productService.createProduct(req.body)

    this.sendSuccess(res, product, 'create', null, 'Product')
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
  createProductWithOccasions = asyncHandler(async (req, res) => {
    const { product, occasionIds } = req.body

    const result = await productService.createProductWithOccasions(product, occasionIds)

    this.sendSuccess(res, result, 'create', null, 'Product with occasions')
  })

  /**
   * PUT /api/products/:id
   * Update product
   */
  updateProduct = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    // Resolve carousel conflicts before updating
    if (req.body.featured && req.body.carousel_order) {
      await carouselService.resolveCarouselOrderConflict(req.body.carousel_order, productId)
    }

    const product = await productService.updateProduct(productId, req.body)

    this.sendResponse(res, product, this.getSuccessMessage('update', 'Product'))
  })

  /**
   * PATCH /api/products/:id/carousel-order
   * Update carousel order (atomic)
   */
  updateCarouselOrder = asyncHandler(async (req, res) => {
    const { order } = req.body
    const productId = this.validateId(req.params.id, 'productId')

    const result = await productService.updateCarouselOrder(productId, order)

    this.sendResponse(res, result, this.getSuccessMessage('carousel'))
  })

  /**
   * PATCH /api/products/:id/stock
   * Update stock
   */
  updateStock = asyncHandler(async (req, res) => {
    const { quantity } = req.body
    const productId = this.validateId(req.params.id, 'productId')

    const product = await productService.updateStock(productId, quantity)

    this.sendResponse(res, product, this.getSuccessMessage('stock'))
  })

  /**
   * DELETE /api/products/:id
   * Soft-delete product
   */
  deleteProduct = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    const product = await productService.deleteProduct(productId)

    this.sendResponse(res, product, this.getSuccessMessage('delete', 'Product'))
  })

  /**
   * PATCH /api/products/:id/reactivate
   * Reactivate product
   */
  reactivateProduct = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    const product = await productService.reactivateProduct(productId)

    this.sendResponse(res, product, this.getSuccessMessage('reactivate', 'Product'))
  })

  /**
   * Get occasions linked to a specific product
   */
  getProductOccasions = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    const result = await productService.getProductOccasions(productId)

    this.sendResponse(res, result, this.getSuccessMessage('occasions'))
  })

  /**
   * Link a single occasion to a product
   */
  linkProductOccasion = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    const result = await productService.linkProductOccasion(productId, req.params.occasionId)

    this.sendResponse(res, result, this.getSuccessMessage('link'))
  })

  /**
   * Replace all occasions for a product
   */
  replaceProductOccasions = asyncHandler(async (req, res) => {
    const productId = this.validateId(req.params.id, 'productId')

    const result = await productService.replaceProductOccasions(productId, req.body.occasion_ids)

    this.sendResponse(res, result, this.getSuccessMessage('replace'))
  })
}

// Export an instance of the controller
export const productController = new ProductController()

// Export individual functions for test compatibility
export const getAllProducts = productController.getAllProducts
export const getProductById = productController.getProductById
export const getProductBySku = productController.getProductBySku
export const getCarouselProducts = productController.getCarouselProducts
export const getProductsWithOccasions = productController.getProductsWithOccasions
export const getProductsByOccasion = productController.getProductsByOccasion
export const createProduct = productController.createProduct
export const createProductWithOccasions = productController.createProductWithOccasions
export const updateProduct = productController.updateProduct
export const updateCarouselOrder = productController.updateCarouselOrder
export const updateStock = productController.updateStock
export const deleteProduct = productController.deleteProduct
export const reactivateProduct = productController.reactivateProduct
export const getProductOccasions = productController.getProductOccasions
export const linkProductOccasion = productController.linkProductOccasion
export const replaceProductOccasions = productController.replaceProductOccasions
