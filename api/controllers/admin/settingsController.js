/**
 * Admin Settings Controller
 * Handles HTTP logic for admin settings operations
 */

import sharp from 'sharp'
import * as settingsService from '../../services/settingsService.js'
import { uploadToStorage } from '../../services/supabaseStorageService.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { BadRequestError } from '../../errors/AppError.js'

// Settings images bucket name
const SETTINGS_BUCKET = 'settings-images'

/**
 * POST /api/admin/settings/image
 * Upload and save image for a specific setting (hero_image, site_logo, etc.)
 * Automatically processes images with sharp (resize + WebP conversion)
 */
export const uploadSettingImage = asyncHandler(async (req, res) => {
  // Validate file upload
  if (!req.file) {
    throw new BadRequestError('No se ha proporcionado ninguna imagen')
  }

  // Validate setting key
  const settingKey = req.body.setting_key
  if (!settingKey) {
    throw new BadRequestError('setting_key es requerido')
  }

  // Validate allowed setting keys
  const allowedKeys = ['hero_image', 'site_logo']
  if (!allowedKeys.includes(settingKey)) {
    throw new BadRequestError(`setting_key debe ser uno de: ${allowedKeys.join(', ')}`)
  }

  // Process image with sharp based on setting key
  let processedBuffer
  let filename
  let storagePath

  if (settingKey === 'site_logo') {
    // Logo: Resize to 128x128px and convert to WebP
    processedBuffer = await sharp(req.file.buffer)
      .resize(128, 128, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 90 })
      .toBuffer()

    filename = `logo-${Date.now()}.webp`
    storagePath = `logos/${filename}`
  } else if (settingKey === 'hero_image') {
    // Hero image: Optimize and convert to WebP (maintain aspect ratio, max width 1920px)
    processedBuffer = await sharp(req.file.buffer)
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer()

    filename = `hero-${Date.now()}.webp`
    storagePath = `hero/${filename}`
  }

  // Upload processed image to Supabase Storage
  const imageUrl = await uploadToStorage(
    processedBuffer,
    storagePath,
    SETTINGS_BUCKET,
    'image/webp'
  )

  // Save image URL to settings
  const setting = await settingsService.setSettingValue(settingKey, imageUrl)

  res.json({
    success: true,
    data: setting,
    message: `Imagen procesada y guardada exitosamente (${(processedBuffer.length / 1024).toFixed(2)} KB)`
  })
})

/**
 * POST /api/admin/settings/bcv-price
 * Save BCV USD rate
 */
export const saveBcvPrice = asyncHandler(async (req, res) => {
  const { bcv_price } = req.body

  if (bcv_price === undefined || bcv_price === null) {
    throw new BadRequestError('bcv_price es requerido')
  }

  if (isNaN(bcv_price) || parseFloat(bcv_price) <= 0) {
    throw new BadRequestError('bcv_price debe ser un número positivo')
  }

  // Save BCV price to settings
  const setting = await settingsService.setSettingValue('bcv_usd_rate', bcv_price.toString())

  res.json({
    success: true,
    data: setting,
    message: 'Precio BCV guardado exitosamente'
  })
})
