/**
 * Procesado por B
 */

/**
 * Authentication Middleware - Helpers & Constants
 * LEGACY: Modularized from auth.js (Phase 6)
 */

import config from '../../config/configLoader.js'
import { ROLE_PERMISSIONS } from '../../config/constants.js'

// SECURITY: Check environment
export const IS_DEV = config.IS_DEVELOPMENT

// Mock user for development ONLY (never in production)
export const DEV_MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@floresya.local',
  user_metadata: {
    full_name: 'Developer User',
    phone: '+584141234567',
    role: 'admin'
  },
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString()
}

/**
 * Helper: Get user role from user object (DRY principle)
 * @param {Object} user - User object
 * @returns {string} User role
 */
export const getUserRole = user => {
  return user?.user_metadata?.role || user?.role || 'user'
}

export { ROLE_PERMISSIONS }
