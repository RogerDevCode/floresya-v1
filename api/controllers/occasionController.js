/**
 * Occasion Controller
 * Handles HTTP logic for occasion operations
 */

import * as occasionService from '../services/occasionService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/occasions
 * Get all active occasions
 */

export const getAllOccasions = asyncHandler(async (req, res) => {
  const filters = {
    limit: req.query.limit
  }

  const includeInactive = req.user?.role === 'admin'
  const occasions = await occasionService.getAllOccasions(filters, includeInactive)

  res.json({
    success: true,
    data: occasions,
    message: 'Occasions retrieved successfully'
  })
})

/**
 * GET /api/occasions/:id
 * Get occasion by ID
 */

export const getOccasionById = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const occasion = await occasionService.getOccasionById(req.params.id, includeInactive)

  res.json({
    success: true,
    data: occasion,
    message: 'Occasion retrieved successfully'
  })
})

/**
 * GET /api/occasions/slug/:slug
 * Get occasion by slug
 */

export const getOccasionBySlug = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin'
  const occasion = await occasionService.getOccasionBySlug(req.params.slug, includeInactive)

  res.json({
    success: true,
    data: occasion,
    message: 'Occasion retrieved successfully'
  })
})

/**
 * POST /api/occasions
 * Create new occasion
 */

export const createOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.createOccasion(req.body)

  res.status(201).json({
    success: true,
    data: occasion,
    message: 'Occasion created successfully'
  })
})

/**
 * PUT /api/occasions/:id
 * Update occasion
 */

export const updateOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.updateOccasion(req.params.id, req.body)

  res.json({
    success: true,
    data: occasion,
    message: 'Occasion updated successfully'
  })
})

/**
 * PATCH /api/occasions/:id/display-order
 * Update display order
 */

export const updateDisplayOrder = asyncHandler(async (req, res) => {
  const { order } = req.body

  const occasion = await occasionService.updateDisplayOrder(req.params.id, order)

  res.json({
    success: true,
    data: occasion,
    message: 'Display order updated successfully'
  })
})

/**
 * DELETE /api/occasions/:id
 * Soft-delete occasion
 */

export const deleteOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.deleteOccasion(req.params.id)

  res.json({
    success: true,
    data: occasion,
    message: 'Occasion deactivated successfully'
  })
})

/**
 * PATCH /api/occasions/:id/reactivate
 * Reactivate occasion
 */

export const reactivateOccasion = asyncHandler(async (req, res) => {
  const occasion = await occasionService.reactivateOccasion(req.params.id)

  res.json({
    success: true,
    data: occasion,
    message: 'Occasion reactivated successfully'
  })
})
