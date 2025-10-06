/**
 * Admin Settings Controller
 * Handles HTTP logic for admin settings operations
 */

import * as settingsService from '../../services/settingsService.js'
import { asyncHandler } from '../../middleware/errorHandler.js'
import { BadRequestError } from '../../errors/AppError.js'

/**
 * POST /api/admin/settings/image
 * Upload and save image for a specific setting (hero_image, site_logo, etc.)
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

  // Save image URL to settings
  const imageUrl = req.file.path // From multer upload
  const setting = await settingsService.setSettingValue(settingKey, imageUrl)

  res.json({
    success: true,
    data: setting,
    message: 'Imagen guardada exitosamente'
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
