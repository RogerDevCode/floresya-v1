/**
 * Product Image Controller
 * Handles HTTP logic for product image operations
 * Delegates business logic to productImageService
 */

import * as productImageService from '../services/productImageService.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { processImage, generateFilename } from '../utils/imageProcessor.js'
import { uploadImageSizes } from '../services/supabaseStorageService.js'
import { BadRequestError } from '../errors/AppError.js'

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
    upload: 201,
    primary: 200
  }
  return statusCodes[operation] || 200
}

/**
 * Gets appropriate success message for operation
 * @param {string} operation - Operation type
 * @param {string} entity - Entity name (user, product, etc.)
 * @returns {string} Success message
 */
const getSuccessMessage = (operation, entity = 'Product image') => {
  const messages = {
    create: `${entity} created successfully`,
    update: `${entity} updated successfully`,
    delete: `${entity} deleted successfully`,
    upload: `${entity} uploaded successfully`,
    primary: 'Primary image set successfully',
    retrieve: `${entity} retrieved successfully`
  }
  return messages[operation] || `${entity} operation completed successfully`
}

/**
 * Validates product ID parameter
 * @param {string|number} productId - Product ID from request params
 * @returns {number} Validated product ID
 * @throws {BadRequestError} If productId is invalid
 */
const validateProductId = productId => {
  const id = parseInt(productId, 10)

  if (isNaN(id) || id <= 0) {
    throw new BadRequestError(`Invalid product ID: must be a positive integer`, {
      productId,
      receivedType: typeof productId
    })
  }

  return id
}

/**
 * Validates image index parameter
 * @param {string|number} imageIndex - Image index from request params
 * @returns {number} Validated image index
 * @throws {BadRequestError} If imageIndex is invalid
 */
const validateImageIndex = imageIndex => {
  const index = parseInt(imageIndex, 10)

  if (isNaN(index) || index <= 0) {
    throw new BadRequestError(`Invalid image index: must be a positive integer`, {
      imageIndex,
      receivedType: typeof imageIndex
    })
  }

  return index
}

/**
 * GET /api/products/:id/images
 * Get all images for a product (filtered by size if needed)
 * Query params: size (optional) - filter by image size
 */
export const getProductImages = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id)
  const filters = {}

  if (req.query.size) {
    filters.size = req.query.size
  }

  const images = await productImageService.getProductImages(productId, filters)
  const response = createResponse(images, getSuccessMessage('retrieve', 'Images'))
  res.json(response)
})

/**
 * GET /api/products/:id/images/primary
 * Get primary image for a product
 */
export const getPrimaryImage = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id)
  const image = await productImageService.getPrimaryImage(productId)
  const response = createResponse(image, getSuccessMessage('retrieve', 'Primary image'))
  res.json(response)
})

/**
 * POST /api/products/:id/images
 * Create images for a product (batch insert - all sizes for a single image_index)
 * Admin only - Supports both file upload and JSON body
 */
export const createProductImages = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id)
  const isFileUpload = req.file && req.file.buffer

  if (isFileUpload) {
    // File upload flow
    const imageIndex = parseInt(req.body.image_index, 10)
    const isPrimary = req.body.is_primary === 'true' || req.body.is_primary === true

    if (!imageIndex || imageIndex < 1 || imageIndex > 5) {
      throw new BadRequestError('image_index must be between 1 and 5')
    }

    // Check existing images constraints
    const existingImages = await productImageService.getProductImages(productId)
    const existingIndex = existingImages.find(img => img.image_index === imageIndex)

    if (existingIndex) {
      throw new BadRequestError(
        `Product ${productId} already has an image at index ${imageIndex}. Delete it first or use a different index.`
      )
    }

    const uniqueIndexes = new Set(existingImages.map(img => img.image_index))
    if (uniqueIndexes.size >= 5) {
      throw new BadRequestError(
        `Product ${productId} already has 5 images (maximum allowed). Delete one before adding a new image.`
      )
    }

    // Process and upload image
    const processed = await processImage(req.file.buffer, {
      maxSizeBytes: 4 * 1024 * 1024,
      minWidth: 500,
      minHeight: 500
    })

    const filenameBase = generateFilename(
      'product',
      productId,
      imageIndex,
      '',
      processed.fileHash
    ).replace('.webp', '')

    const urls = await uploadImageSizes(processed.sizes, filenameBase)
    const images = Object.entries(urls).map(([size, url]) => ({
      size,
      url,
      file_hash: processed.fileHash,
      mime_type: 'image/webp'
    }))

    const createdImages = await productImageService.createProductImagesAtomic(
      productId,
      imageIndex,
      images,
      isPrimary
    )

    const response = createResponse(createdImages, getSuccessMessage('upload'))
    res.status(getStatusCode('upload')).json(response)
  } else {
    // JSON body flow (backward compatible)
    const { image_index, images, is_primary } = req.body

    if (!image_index || typeof image_index !== 'number' || image_index < 1 || image_index > 5) {
      throw new BadRequestError('image_index must be between 1 and 5')
    }

    if (!Array.isArray(images) || images.length === 0) {
      throw new BadRequestError('images must be a non-empty array')
    }

    const createdImages = await productImageService.createProductImagesAtomic(
      productId,
      image_index,
      images,
      is_primary || false
    )

    const response = createResponse(createdImages, getSuccessMessage('create'))
    res.status(getStatusCode('create')).json(response)
  }
})

/**
 * DELETE /api/products/:id/images/:imageIndex
 * Delete images by image_index (all sizes)
 * Admin only
 */
export const deleteImagesByIndex = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id)
  const imageIndex = validateImageIndex(req.params.imageIndex)

  const deletedImages = await productImageService.deleteImagesByIndex(productId, imageIndex)
  const response = createResponse(
    { deleted_count: deletedImages.length },
    getSuccessMessage('delete')
  )
  res.json(response)
})

/**
 * PATCH /api/products/:id/images/primary/:imageIndex
 * Set primary image by image_index
 * Admin only
 */
export const setPrimaryImage = asyncHandler(async (req, res) => {
  const productId = validateProductId(req.params.id)
  const imageIndex = validateImageIndex(req.params.imageIndex)

  const primaryImage = await productImageService.setPrimaryImage(productId, imageIndex)
  const response = createResponse(primaryImage, getSuccessMessage('primary'))
  res.json(response)
})
