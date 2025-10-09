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
 * GET /api/products/:id/images
 * Get all images for a product (filtered by size if needed)
 * Query params: size (optional) - filter by image size
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Get product images
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get product images operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Get product images
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get product images operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Get primary image
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get primary image operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Get primary image
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get primary image operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
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

/**
 * POST /api/products/:id/images
 * Create images for a product (batch insert - all sizes for a single image_index)
 * Admin only
 *
 * UPDATED: Now supports multipart/form-data with file upload
 * Body (multipart/form-data): {
 *   image: File (required) - Image file to upload
 *   image_index: number (1-5) (required)
 *   is_primary: boolean (optional)
 * }
 *
 * OR JSON body (backward compatible): {
 *   image_index: number (1-5),
 *   images: [{ size, url, file_hash, mime_type }, ...],
 *   is_primary: boolean (optional)
 * }
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   post:
 *     tags: [productimage]
 *     summary: Create product images
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create product images operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   post:
 *     tags: [productimage]
 *     summary: Create product images
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create product images operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const createProductImages = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID',
      message: 'Product ID must be a positive number'
    })
  }

  // Check if this is a file upload (multipart/form-data) or JSON body
  const isFileUpload = req.file && req.file.buffer

  if (isFileUpload) {
    // NEW: File upload flow
    const imageIndex = parseInt(req.body.image_index, 10)
    const isPrimary = req.body.is_primary === 'true' || req.body.is_primary === true

    if (!imageIndex || imageIndex < 1 || imageIndex > 5) {
      throw new BadRequestError('image_index must be between 1 and 5')
    }

    // Check if product already has an image at this index
    const existingImages = await productImageService.getProductImages(productId)
    const existingIndex = existingImages.find(img => img.image_index === imageIndex)

    if (existingIndex) {
      throw new BadRequestError(
        `Product ${productId} already has an image at index ${imageIndex}. Delete it first or use a different index.`
      )
    }

    // Get unique image indexes count (max 5 images per product)
    const uniqueIndexes = new Set(existingImages.map(img => img.image_index))
    if (uniqueIndexes.size >= 5) {
      throw new BadRequestError(
        `Product ${productId} already has 5 images (maximum allowed). Delete one before adding a new image.`
      )
    }

    // Process image: validate + generate sizes + hash
    // IMPORTANT: 4MB limit for Vercel serverless functions
    const processed = await processImage(req.file.buffer, {
      maxSizeBytes: 4 * 1024 * 1024, // 4MB (Vercel limit)
      minWidth: 500,
      minHeight: 500
    })

    // Generate filename base
    const filenameBase = generateFilename(
      'product',
      productId,
      imageIndex,
      '',
      processed.fileHash
    ).replace('.webp', '') // Remove extension, will be added by uploadImageSizes

    // Upload all sizes to Supabase Storage
    const urls = await uploadImageSizes(processed.sizes, filenameBase)

    // Build images array for database
    const images = Object.entries(urls).map(([size, url]) => ({
      size,
      url,
      file_hash: processed.fileHash,
      mime_type: 'image/webp'
    }))

    // Save to database
    const createdImages = await productImageService.createProductImagesAtomic(
      productId,
      imageIndex,
      images,
      isPrimary
    )

    return res.status(201).json({
      success: true,
      data: createdImages,
      message: `Image uploaded and ${createdImages.length} sizes created for product ${productId}, index ${imageIndex}`
    })
  } else {
    // OLD: JSON body flow (backward compatible)
    const { image_index, images, is_primary } = req.body

    if (!image_index || typeof image_index !== 'number' || image_index < 1 || image_index > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image_index',
        message: 'image_index must be between 1 and 5'
      })
    }

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid images',
        message: 'images must be a non-empty array'
      })
    }

    const createdImages = await productImageService.createProductImagesAtomic(
      productId,
      image_index,
      images,
      is_primary || false
    )

    return res.status(201).json({
      success: true,
      data: createdImages,
      message: `${createdImages.length} image(s) created for product ${productId}, index ${image_index}`
    })
  }
})

/**
 * DELETE /api/products/:id/images/:imageIndex
 * Delete images by image_index (all sizes)
 * Admin only
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   delete:
 *     tags: [productimage]
 *     summary: Delete images by index
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete images by index operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   delete:
 *     tags: [productimage]
 *     summary: Delete images by index
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete images by index operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const deleteImagesByIndex = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)
  const imageIndex = parseInt(req.params.imageIndex, 10)

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID',
      message: 'Product ID must be a positive number'
    })
  }

  if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 5) {
    return res.status(400).json({
      success: false,
      error: 'Invalid image_index',
      message: 'image_index must be between 1 and 5'
    })
  }

  const deletedImages = await productImageService.deleteImagesByIndex(productId, imageIndex)

  res.status(200).json({
    success: true,
    data: { deleted_count: deletedImages.length },
    message: `${deletedImages.length} image(s) deleted for product ${productId}, index ${imageIndex}`
  })
})

/**
 * PATCH /api/products/:id/images/primary/:imageIndex
 * Set primary image by image_index
 * Admin only
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Set primary image
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Set primary image operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Set primary image
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Set primary image operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
export const setPrimaryImage = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id, 10)
  const imageIndex = parseInt(req.params.imageIndex, 10)

  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID',
      message: 'Product ID must be a positive number'
    })
  }

  if (isNaN(imageIndex) || imageIndex < 1 || imageIndex > 5) {
    return res.status(400).json({
      success: false,
      error: 'Invalid image_index',
      message: 'image_index must be between 1 and 5'
    })
  }

  const primaryImage = await productImageService.setPrimaryImage(productId, imageIndex)

  res.status(200).json({
    success: true,
    data: primaryImage,
    message: `Image ${imageIndex} set as primary for product ${productId}`
  })
})
