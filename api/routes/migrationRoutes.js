/**
 * Procesado por B
 */

/**
 * Migration Routes
 * Temporary routes for database migrations - ADMIN ONLY
 * ONLY FOR DEVELOPMENT USE - REQUIRES AUTHENTICATION
 */

import express from 'express'
import { authenticate, authorizeByPermission } from '../middleware/auth/index.js'
import { PERMISSIONS } from '../config/constants.js'
import { addIsActiveToSettings } from '../controllers/migrationController.js'

const router = express.Router()

// SECURE: All migration endpoints require authentication and admin permission
// Development: Uses mock auth if NODE_ENV=development
// Production: Requires valid JWT token
router.post(
  '/add-is-active-to-settings',
  authenticate,
  authorizeByPermission(PERMISSIONS.MIGRATION_RUN),
  addIsActiveToSettings
)

export default router
