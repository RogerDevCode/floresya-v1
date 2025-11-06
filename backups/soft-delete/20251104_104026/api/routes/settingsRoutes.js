/**
 * Settings Routes
 * Defines routes for settings operations
 */

import express from 'express'
import * as settingsController from '../controllers/settingsController.js'
import { authenticate, authorize } from '../middleware/auth/index.js'
import { validate } from '../middleware/validation/index.js'

const router = express.Router()

// Public routes
router.get('/public', settingsController.getPublicSettings)
router.get('/map', settingsController.getSettingsMap)
router.get('/:key/value', settingsController.getSettingValue)

// Admin-only routes
router.get('/', authenticate, authorize('admin'), settingsController.getAllSettings)

router.get('/:key', authenticate, authorize('admin'), settingsController.getSettingByKey)

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({
    key: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-z0-9_]+$/,
      custom: value => {
        if (value !== value.toLowerCase()) {
          return 'key must be lowercase'
        }
        return null
      }
    },
    value: { type: 'string', required: true },
    description: { type: 'string' },
    is_public: { type: 'boolean' }
  }),
  settingsController.createSetting
)

router.put(
  '/:key',
  authenticate,
  authorize('admin'),
  validate({
    value: { type: 'string' },
    description: { type: 'string' },
    is_public: { type: 'boolean' }
  }),
  settingsController.updateSetting
)

router.delete('/:key', authenticate, authorize('admin'), settingsController.deleteSetting)

export default router
