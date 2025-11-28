/**
 * Soft Delete Verification Routes
 * API endpoints for soft delete verification and monitoring
 * Follows CLAUDE.md and claude2.txt requirements for production-ready code
 */

import express from 'express'
import SoftDeleteVerificationController from '../controllers/softDeleteVerificationController.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

/**
 * Create controller instance with Supabase client
 */
const createController = req => {
  return new SoftDeleteVerificationController(req.supabase)
}

/**
 * Verify soft delete schema for specific table
 * GET /api/admin/soft-delete/verify/:tableName
 */
router.get('/verify/:tableName', authenticateToken, requireAdmin, (req, res) =>
  createController(req).verifyTableSchema(req, res)
)

/**
 * Get comprehensive entity coverage report
 * GET /api/admin/soft-delete/coverage
 */
router.get('/coverage', authenticateToken, requireAdmin, (req, res) =>
  createController(req).getEntityCoverage(req, res)
)

/**
 * Get audit trail verification
 * GET /api/admin/soft-delete/audit-verification
 */
router.get('/audit-verification', authenticateToken, requireAdmin, (req, res) =>
  createController(req).getAuditVerification(req, res)
)

/**
 * Get comprehensive soft delete health report
 * GET /api/admin/soft-delete/health
 */
router.get('/health', authenticateToken, requireAdmin, (req, res) =>
  createController(req).getHealthReport(req, res)
)

/**
 * Get soft delete statistics
 * GET /api/admin/soft-delete/statistics
 * Query parameters:
 * - dateFrom: ISO date string (optional)
 * - dateTo: ISO date string (optional)
 */
router.get('/statistics', authenticateToken, requireAdmin, (req, res) =>
  createController(req).getStatistics(req, res)
)

/**
 * Validate all tables for soft delete support
 * POST /api/admin/soft-delete/validate-all
 */
router.post('/validate-all', authenticateToken, requireAdmin, (req, res) =>
  createController(req).validateAllTables(req, res)
)

/**
 * Get migration recommendations
 * GET /api/admin/soft-delete/migration-recommendations
 */
router.get('/migration-recommendations', authenticateToken, requireAdmin, (req, res) =>
  createController(req).getMigrationRecommendations(req, res)
)

export default router
