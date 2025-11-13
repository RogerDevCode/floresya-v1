/**
 * Admin Settings Controller
 * Handles HTTP logic for admin settings operations
 *
 * Uses centralized structured logging
 */

import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { log as logger } from '../../utils/logger.js'
import * as settingsService from '../../services/settingsService.index.js'
import { asyncHandler } from '../../middleware/error/errorHandler.js'
import { BadRequestError, DatabaseError } from '../../errors/AppError.js'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Base path for public/images/ folder
const PUBLIC_IMAGES_PATH = path.join(__dirname, '../../../public/images')

/**
 * POST /api/admin/settings/image
 * Upload and save image for a specific setting (hero_image, site_logo)
 *
 * CRITICAL: Images are ALWAYS saved to public/images/ (local), NOT Supabase
 *
 * Workflow:
 * 1. Delete existing .bak file (if exists)
 * 2. Rename existing image to .bak
 * 3. Process new image with Sharp and save with original name
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
  let targetFilename
  let targetPath

  if (settingKey === 'site_logo') {
    // Logo: Resize to 128x128px and convert to WebP
    processedBuffer = await sharp(req.file.buffer)
      .resize(128, 128, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 90 })
      .toBuffer()

    // ALWAYS save as logoFloresYa.jpeg (NOT .webp, for backwards compatibility)
    targetFilename = 'logoFloresYa.jpeg'
    targetPath = path.join(PUBLIC_IMAGES_PATH, targetFilename)
  } else if (settingKey === 'hero_image') {
    // Hero image: Optimize and convert to WebP (maintain aspect ratio, max width 1920px)
    processedBuffer = await sharp(req.file.buffer)
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer()

    // ALWAYS save as hero-flowers.webp
    targetFilename = 'hero-flowers.webp'
    targetPath = path.join(PUBLIC_IMAGES_PATH, targetFilename)
  }

  // Backup workflow: delete .bak, rename existing, save new
  const backupPath = `${targetPath}.bak`

  try {
    // Step 1: Delete existing .bak file (if exists)
    try {
      await fs.unlink(backupPath)
      logger.info('Deleted existing backup', { backupPath })
    } catch (error) {
      // Ignore if .bak doesn't exist
      if (error.code !== 'ENOENT') {
        logger.warn('Warning deleting .bak', {
          backupPath,
          error: error.message
        })
      }
    }

    // Step 2: Rename existing image to .bak (if exists)
    try {
      await fs.rename(targetPath, backupPath)
      logger.info('Renamed existing image to backup', {
        targetPath,
        backupPath
      })
    } catch (error) {
      // Ignore if original doesn't exist (first upload)
      if (error.code !== 'ENOENT') {
        logger.warn('Warning renaming existing image', {
          targetPath,
          backupPath,
          error: error.message
        })
      }
    }

    // Step 3: Write new processed image
    await fs.writeFile(targetPath, processedBuffer)
    logger.info('Saved new image', {
      targetPath,
      sizeKB: (processedBuffer.length / 1024).toFixed(2)
    })

    // Save local path to settings (for reference)
    const localUrl = `/images/${targetFilename}`
    await settingsService.setSettingValue(settingKey, localUrl)

    res.json({
      success: true,
      data: { url: localUrl },
      message: `Imagen procesada y guardada exitosamente en local (${(processedBuffer.length / 1024).toFixed(2)} KB)`
    })
  } catch (error) {
    logger.error('Error saving image to local filesystem', error, {
      targetPath,
      operation: 'saveImage'
    })
    throw new DatabaseError('INSERT', 'settings', error, { operation: 'saveImage' })
  }
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
