/**
 * Migration Routes
 * Temporary routes for database migrations
 * ONLY FOR DEVELOPMENT USE
 */

import express from 'express'
import { addIsActiveToSettings } from '../controllers/migrationController.js'

const router = express.Router()

// Temporary migration endpoint
router.post('/add-is-active-to-settings', addIsActiveToSettings)

export default router
