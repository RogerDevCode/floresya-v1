/**
 * Settings Controller
 * Handles HTTP logic for settings operations
 */

import * as settingsService from '../services/settingsService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

/**
 * GET /api/settings
 * Get all settings
 */
export const getAllSettings = asyncHandler(async (req, res) => {
  const publicOnly = req.query.public === 'true'

  const settings = await settingsService.getAllSettings(publicOnly)

  res.json({
    success: true,
    data: settings,
    message: 'Settings retrieved successfully'
  })
})

/**
 * GET /api/settings/public
 * Get public settings only
 */
export const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getPublicSettings()

  res.json({
    success: true,
    data: settings,
    message: 'Public settings retrieved successfully'
  })
})

/**
 * GET /api/settings/map
 * Get settings as key-value map
 */
export const getSettingsMap = asyncHandler(async (req, res) => {
  const publicOnly = req.query.public === 'true'

  const map = await settingsService.getSettingsMap(publicOnly)

  res.json({
    success: true,
    data: map,
    message: 'Settings map retrieved successfully'
  })
})

/**
 * GET /api/settings/:key
 * Get setting by key
 */
export const getSettingByKey = asyncHandler(async (req, res) => {
  const setting = await settingsService.getSettingByKey(req.params.key)

  res.json({
    success: true,
    data: setting,
    message: 'Setting retrieved successfully'
  })
})

/**
 * GET /api/settings/:key/value
 * Get setting value (typed)
 */
export const getSettingValue = asyncHandler(async (req, res) => {
  const value = await settingsService.getSettingValue(req.params.key)

  res.json({
    success: true,
    data: { key: req.params.key, value },
    message: 'Setting value retrieved successfully'
  })
})

/**
 * POST /api/settings
 * Create new setting
 */
export const createSetting = asyncHandler(async (req, res) => {
  const setting = await settingsService.createSetting(req.body)

  res.status(201).json({
    success: true,
    data: setting,
    message: 'Setting created successfully'
  })
})

/**
 * PUT /api/settings/:key
 * Update setting
 */
export const updateSetting = asyncHandler(async (req, res) => {
  const setting = await settingsService.updateSetting(req.params.key, req.body)

  res.json({
    success: true,
    data: setting,
    message: 'Setting updated successfully'
  })
})

/**
 * PATCH /api/settings/:key/value
 * Update setting value only
 */
export const setSettingValue = asyncHandler(async (req, res) => {
  const { value } = req.body

  const setting = await settingsService.setSettingValue(req.params.key, value)

  res.json({
    success: true,
    data: setting,
    message: 'Setting value updated successfully'
  })
})

/**
 * DELETE /api/settings/:key
 * Delete setting
 */
export const deleteSetting = asyncHandler(async (req, res) => {
  const setting = await settingsService.deleteSetting(req.params.key)

  res.json({
    success: true,
    data: setting,
    message: 'Setting deleted successfully'
  })
})
