/**
 * Procesado por B
 */

/**
 * Admin Settings Routes
 * Defines routes for admin settings operations
 */

import express from 'express'
import * as adminSettingsController from '../../controllers/admin/settingsController.js'
import { authenticate, authorize } from '../../middleware/auth/index.js'
import { uploadSingle } from '../../middleware/utilities/index.js'
import { getBusinessRulesStatus } from '../../services/businessRules.js'

const router = express.Router()

// All routes require admin authentication
router.use(authenticate, authorize('admin'))

/**
 * POST /api/admin/settings/image
 * Upload and save image for a specific setting
 * Multer handles file upload to temporary storage
 */
router.post(
  '/image',
  uploadSingle, // Multer middleware for file upload
  adminSettingsController.uploadSettingImage
)

/**
 * POST /api/admin/settings/bcv-price
 * Save BCV USD rate
 */
router.post('/bcv-price', adminSettingsController.saveBcvPrice)

/**
 * GET /api/admin/settings/business-rules
 * Get business rules engine status and configuration
 */
router.get('/business-rules', getBusinessRulesStatus)

export default router
