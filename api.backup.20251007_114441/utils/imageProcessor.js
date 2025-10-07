/**
 * Image Processing Utilities
 * Uses Sharp for high-performance image resizing and optimization
 */

import sharp from 'sharp'
import crypto from 'crypto'

/**
 * Image size configurations
 * thumb: 150x150px - For grid thumbnails
 * small: 300x300px - For product lists
 * medium: 600x600px - For product detail page
 * large: 1200x1200px - For zoom/fullscreen
 */
const IMAGE_SIZES = {
  thumb: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 }
}

/**
 * Generate all image sizes from a buffer
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} mimeType - Original mime type
 * @returns {Promise<Object>} Object with all sizes as buffers
 */
export async function generateImageSizes(imageBuffer, _mimeType = 'image/jpeg') {
  try {
    const results = {}

    // Validate image buffer
    const metadata = await sharp(imageBuffer).metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: unable to read dimensions')
    }

    // Generate all sizes in parallel
    const promises = Object.entries(IMAGE_SIZES).map(async ([size, dimensions]) => {
      const buffer = await sharp(imageBuffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: false // Allow upscaling for smaller images
        })
        .webp({ quality: 85, effort: 4 }) // Convert to WebP with good quality
        .toBuffer()

      return { size, buffer }
    })

    const generated = await Promise.all(promises)

    // Build results object
    generated.forEach(({ size, buffer }) => {
      results[size] = buffer
    })

    return results
  } catch (error) {
    console.error('Error generating image sizes:', error)
    throw new Error(`Image processing failed: ${error.message}`)
  }
}

/**
 * Calculate hash of buffer for deduplication
 * @param {Buffer} buffer - Image buffer
 * @returns {string} SHA-256 hash
 */
export function calculateBufferHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Validate image buffer
 * @param {Buffer} buffer - Image buffer to validate
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Metadata and validation result
 */
export async function validateImageBuffer(buffer, options = {}) {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    minWidth = 500,
    minHeight = 500,
    allowedFormats = ['jpeg', 'jpg', 'png', 'webp']
  } = options

  try {
    // Check buffer size
    if (buffer.length > maxSizeBytes) {
      throw new Error(
        `Image too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (max ${maxSizeBytes / 1024 / 1024}MB)`
      )
    }

    // Get metadata
    const metadata = await sharp(buffer).metadata()

    // Validate format
    if (!allowedFormats.includes(metadata.format)) {
      throw new Error(`Invalid format: ${metadata.format}. Allowed: ${allowedFormats.join(', ')}`)
    }

    // Validate dimensions
    if (metadata.width < minWidth || metadata.height < minHeight) {
      throw new Error(
        `Image too small: ${metadata.width}x${metadata.height} (min ${minWidth}x${minHeight})`
      )
    }

    return {
      valid: true,
      metadata,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message
    }
  }
}

/**
 * Process single image: validate + generate sizes + calculate hash
 * @param {Buffer} buffer - Original image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed images with metadata
 */
export async function processImage(buffer, options = {}) {
  try {
    // Validate image
    const validation = await validateImageBuffer(buffer, options)

    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Calculate hash of original
    const fileHash = calculateBufferHash(buffer)

    // Generate all sizes
    const sizes = await generateImageSizes(buffer, validation.format)

    return {
      success: true,
      fileHash,
      originalMetadata: validation.metadata,
      sizes // { thumb: Buffer, small: Buffer, medium: Buffer, large: Buffer }
    }
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
}

/**
 * Get optimal image format for web
 * @param {string} originalFormat - Original image format
 * @returns {string} Optimal format (webp)
 */
export function getOptimalFormat(_originalFormat) {
  // Always use WebP for best compression and quality
  return 'webp'
}

/**
 * Generate filename for processed image
 * @param {string} prefix - Filename prefix (e.g., 'product')
 * @param {number} productId - Product ID
 * @param {number} imageIndex - Image index (1-5)
 * @param {string} size - Size variant (thumb, small, medium, large)
 * @param {string} hash - File hash
 * @returns {string} Generated filename
 */
export function generateFilename(prefix, productId, imageIndex, size, hash) {
  return `${prefix}_${productId}_${imageIndex}_${hash}.webp`
}
