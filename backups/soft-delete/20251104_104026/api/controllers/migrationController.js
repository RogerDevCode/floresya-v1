/**
 * Migration Controller
 * MVC Pattern: Controller → Service → Database
 * Temporary endpoint for database migrations - ONLY FOR DEVELOPMENT USE
 *
 * Uses centralized structured logging
 */

import { log as logger } from '../utils/logger.js'
import * as migrationService from '../services/migrationService.js'
import { DatabaseError } from '../errors/AppError.js'

/**
 * Execute migration to add is_active column to settings table
 * MVC Pattern: Controller calls Service, Service accesses Database
 * TEMPORARY ENDPOINT - ONLY FOR DEVELOPMENT
 */
export const addIsActiveToSettings = async (req, res) => {
  try {
    // MVC Pattern: Controller delegates to Service
    // Service Layer Exclusivo: Only services can access supabase
    const result = await migrationService.addIsActiveToSettings()

    res.status(200).json({
      success: true,
      data: result,
      message: result.message
    })
  } catch (error) {
    logger.error('Migration failed', error, {
      operation: 'addIsActiveToSettings'
    })

    // Handle different error types
    if (error instanceof DatabaseError) {
      res.status(500).json({
        success: false,
        error: 'MigrationError',
        message: `Failed to execute migration: ${error.message}`,
        context: error.context
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'MigrationError',
        message: 'Failed to execute migration: ' + error.message
      })
    }
  }
}
