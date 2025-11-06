/**
 * Product Controller - REFACTORED
 * Implements Clean Architecture and SOLID Principles
 *
 * Controller Responsibilities (Single Responsibility):
 * 1. Receive HTTP requests
 * 2. Delegate to Use Cases
 * 3. Format responses
 * 4. Handle errors at HTTP boundary
 *
 * This controller follows:
 * - Dependency Inversion Principle (depends on abstractions, not concretions)
 * - Single Responsibility Principle (only handles HTTP concerns)
 * - Open/Closed Principle (open for extension via DI, closed for modification)
 */

import { asyncHandler } from '../middleware/error/index.js'
import DIContainer from './di-container.js'
import { ResponseFormatter } from './response-formatter.js'
import { RequestValidator } from './request-validator.js'
import { BadRequestError } from '../errors/AppError.js'

/**
 * Get Product by ID use case
 * Encapsulates business logic for getting a product
 */
class GetProductUseCase {
  /**
   * @param {Object} productService - Product service (injected)
   */
  constructor(productService) {
    this.productService = productService
  }

  /**
   * Execute use case
   * @param {number} productId - Product ID
   * @param {string|null} imageSize - Optional image size
   * @returns {Promise<Object>} Product data
   */
  async execute(productId, imageSize = null) {
    return await this.productService.getProductById(productId, false, imageSize)
  }
}

/**
 * Get All Products use case
 * Encapsulates business logic for getting products with filters
 */
class GetAllProductsUseCase {
  /**
   * @param {Object} productService - Product service (injected)
   */
  constructor(productService) {
    this.productService = productService
  }

  /**
   * Execute use case
   * @param {Object} filters - Product filters
   * @param {boolean} includeDeactivated - Include deactivated products
   * @param {string|null} imageSize - Optional image size
   * @returns {Promise<Array>} Array of products
   */
  async execute(filters, includeDeactivated = false, imageSize = null) {
    return await this.productService.getAllProducts(filters, includeDeactivated, imageSize)
  }
}

/**
 * Product Controller
 * Refactored to follow Clean Architecture
 *
 * Dependencies are injected via constructor:
 * - productService: Business logic layer
 * - responseFormatter: Response formatting logic
 * - requestValidator: Request validation logic
 */
export class ProductController {
  /**
   * @param {Object} productService - Product service instance
   * @param {ResponseFormatter} responseFormatter - Response formatter instance
   * @param {RequestValidator} requestValidator - Request validator instance
   */
  constructor(
    productService,
    responseFormatter = new ResponseFormatter(),
    requestValidator = new RequestValidator()
  ) {
    this.productService = productService
    this.responseFormatter = responseFormatter
    this.requestValidator = requestValidator

    // Initialize use cases with injected dependencies
    this.getProductUseCase = new GetProductUseCase(productService)
    this.getAllProductsUseCase = new GetAllProductsUseCase(productService)

    // Bind methods to maintain 'this' context
    this.handleGetAllProducts = this.handleGetAllProducts.bind(this)
    this.handleGetProductById = this.handleGetProductById.bind(this)
    this.handleGetProductBySku = this.handleGetProductBySku.bind(this)
    this.handleGetCarouselProducts = this.handleGetCarouselProducts.bind(this)
  }

  /**
   * Internal method for getting all products (without asyncHandler)
   * @private
   */
  async handleGetAllProducts(req, res) {
    // Extract and validate request data
    const filters = this.requestValidator.validateProductFilters(req.query)
    const includeDeactivated = req.user?.role === 'admin' && req.query.includeDeactivated === 'true'
    const imageSize = this.requestValidator.validateImageSize(req.query)

    // Delegate to use case (business logic)
    const products = await this.getAllProductsUseCase.execute(
      filters,
      includeDeactivated,
      imageSize
    )

    // Format response
    return this.responseFormatter.success(res, products, 'Products retrieved successfully')
  }

  /**
   * Internal method for getting product by ID (without asyncHandler)
   * @private
   */
  async handleGetProductById(req, res) {
    // Extract and validate request data
    const productId = this.requestValidator.validateProductId(req.params)
    const imageSize = this.requestValidator.validateImageSize(req.query)

    // Delegate to use case (business logic)
    const product = await this.getProductUseCase.execute(productId, imageSize)

    // Format response
    return this.responseFormatter.success(res, product, 'Product retrieved successfully')
  }

  /**
   * Internal method for getting product by SKU (without asyncHandler)
   * @private
   */
  async handleGetProductBySku(req, res) {
    const { sku } = req.params

    if (!sku) {
      throw new BadRequestError('SKU is required', {
        field: 'sku',
        rule: 'required'
      })
    }

    const product = await this.productService.getProductBySku(sku)

    return this.responseFormatter.success(res, product, 'Product retrieved successfully')
  }

  /**
   * Internal method for getting carousel products (without asyncHandler)
   * @private
   */
  async handleGetCarouselProducts(req, res) {
    const products = await this.productService.getCarouselProducts()

    return this.responseFormatter.success(res, products, 'Carousel products retrieved successfully')
  }

  /**
   * GET /api/products
   * Get all products with filters (middleware-wrapped)
   */
  getAllProducts = asyncHandler((req, res, _next) => {
    return this.handleGetAllProducts(req, res)
  })

  /**
   * GET /api/products/:id
   * Get product by ID (middleware-wrapped)
   */
  getProductById = asyncHandler((req, res, _next) => {
    return this.handleGetProductById(req, res)
  })

  /**
   * GET /api/products/sku/:sku
   * Get product by SKU (middleware-wrapped)
   */
  getProductBySku = asyncHandler((req, res, _next) => {
    return this.handleGetProductBySku(req, res)
  })

  /**
   * GET /api/products/carousel
   * Get carousel products (middleware-wrapped)
   */
  getCarouselProducts = asyncHandler((req, res, _next) => {
    return this.handleGetCarouselProducts(req, res)
  })
}

/**
 * Factory function to create ProductController instance
 * Uses DI Container for dependency injection
 * @returns {ProductController} Configured controller instance
 */
export function createProductController() {
  // Resolve dependencies from DI container
  const productService = DIContainer.resolve('ProductService')
  const responseFormatter = new ResponseFormatter()
  const requestValidator = new RequestValidator()

  // Create controller with injected dependencies
  return new ProductController(productService, responseFormatter, requestValidator)
}

/**
 * Export controller instance (singleton pattern)
 * This can be used for routes
 */
const createSingletonController = () => {
  if (typeof DIContainer !== 'undefined' && DIContainer.has('ProductService')) {
    return createProductController()
  }
  return null // Don't create if DI not configured
}

export const productController = createSingletonController()
