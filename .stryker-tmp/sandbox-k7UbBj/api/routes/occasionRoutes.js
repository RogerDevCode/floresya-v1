/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Occasion Routes
 * Defines routes for occasion operations
 */

import express from 'express'
import * as occasionController from '../controllers/occasionController.js'
import { authenticate, authorize } from '../middleware/auth/index.js'
import { validate, validateId } from '../middleware/validation/index.js'

const router = express.Router()

// Public routes
router.get('/', occasionController.getAllOccasions)
router.get('/slug/:slug', occasionController.getOccasionBySlug)
router.get('/:id', validateId(), occasionController.getOccasionById)

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({
    name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    description: { type: 'string' },
    slug: {
      type: 'string',
      required: true,
      pattern: /^[a-z0-9-]+$/,
      custom: value => {
        if (value !== value.toLowerCase()) {
          return 'slug must be lowercase'
        }
        return null
      }
    },
    display_order: { type: 'number', integer: true, min: 0 }
  }),
  occasionController.createOccasion
)

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    name: { type: 'string', minLength: 2, maxLength: 100 },
    description: { type: 'string' },
    slug: {
      type: 'string',
      pattern: /^[a-z0-9-]+$/
    },
    display_order: { type: 'number', integer: true, min: 0 }
  }),
  occasionController.updateOccasion
)

router.patch(
  '/:id/display-order',
  authenticate,
  authorize('admin'),
  validateId(),
  validate({
    order: { type: 'number', required: true, integer: true, min: 0 }
  }),
  occasionController.updateDisplayOrder
)

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateId(),
  occasionController.deleteOccasion
)

router.patch(
  '/:id/reactivate',
  authenticate,
  authorize('admin'),
  validateId(),
  occasionController.reactivateOccasion
)

export default router
