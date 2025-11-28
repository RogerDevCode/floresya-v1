/**
 * Procesado por B
 */

/**
 * Occasion Service
 * Full CRUD operations with soft-delete (active flag)
 * Uses indexed slug column for SEO-friendly lookups
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
 *
 * REPOSITORY PATTERN: Uses OccasionRepository for data access
 * Following Service Layer Exclusive principle
 */

import DIContainer from '../architecture/di-container.js'
import { NotFoundError, BadRequestError } from '../errors/AppError.js'
import { validateOccasion } from '../utils/validation.js'
import ValidatorService from './validation/ValidatorService.js'
import { withErrorMapping } from '../middleware/error/index.js'
import logger from '../config/logger.js'

const TABLE = 'occasions'

/**
 * Get OccasionRepository instance from DI Container
 * @returns {OccasionRepository} Repository instance
 */
function getOccasionRepository() {
  return DIContainer.resolve('OccasionRepository')
}

/**
 * Validates occasion ID parameter
 * @param {number} id - Occasion ID to validate
 * @param {string} operation - Operation name for error context
 * @throws {BadRequestError} When ID is invalid
 */
function validateOccasionId(id, operation = 'operation') {
  ValidatorService.validateId(id, 'occasion')
}

/**
 * Get all occasions with filters - returns active occasions ordered by display_order
 * @param {Object} [filters={}] - Filter options
 * @param {number} [filters.limit] - Maximum number of occasions to return
 * @param {boolean} includeDeactivated - Include inactive occasions (default: false, admin only)
 * @returns {Object[]} - Array of occasions ordered by display_order
 * @throws {NotFoundError} When no occasions are found
 * @throws {DatabaseError} When database query fails
 */
export const getAllOccasions = withErrorMapping(
  async (filters = {}, includeDeactivated = false) => {
    const occasionRepository = await getOccasionRepository()

    const data = await occasionRepository.findAllWithFilters(
      { ...filters, includeDeactivated },
      {
        orderBy: 'display_order',
        ascending: true,
        limit: filters.limit
      }
    )

    logger.debug('✅ [getAllOccasions] Retrieved occasions:', {
      count: data?.length || 0,
      includeDeactivated,
      filters
    })

    // Return empty array if no data - let frontend handle fallback
    return data || []
  },
  'SELECT',
  TABLE
)

/**
 * Get occasion by ID
 * @param {number} id - Occasion ID to retrieve
 * @param {boolean} includeDeactivated - Include inactive occasions (default: false, admin only)
 * @returns {Object} - Occasion object
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found
 * @throws {DatabaseError} When database query fails
 */
export const getOccasionById = withErrorMapping(
  async (id, includeDeactivated = false) => {
    validateOccasionId(id, 'getOccasionById')

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.findById(id, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Occasion', id, { includeDeactivated })
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Get occasion by slug (indexed column for SEO)
 * @param {string} slug - Occasion slug to search for
 * @param {boolean} includeDeactivated - Include inactive occasions (default: false, admin only)
 * @returns {Object} - Occasion object
 * @throws {BadRequestError} When slug is invalid
 * @throws {NotFoundError} When occasion with slug is not found
 * @throws {DatabaseError} When database query fails
 */
export const getOccasionBySlug = withErrorMapping(
  async (slug, includeDeactivated = false) => {
    if (!slug || typeof slug !== 'string') {
      throw new BadRequestError('Invalid slug: must be a string', { slug })
    }

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.findBySlug(slug, includeDeactivated)

    if (!data) {
      throw new NotFoundError('Occasion', slug, { slug, includeDeactivated })
    }

    return data
  },
  'SELECT',
  TABLE
)

/**
 * Create new occasion
 * @param {Object} occasionData - Occasion data to create
 * @param {string} occasionData.name - Occasion name (required)
 * @param {string} occasionData.slug - Occasion slug (required, must be lowercase alphanumeric with hyphens)
 * @param {string} [occasionData.description] - Occasion description
 * @param {number} [occasionData.display_order=0] - Display order for sorting
 * @returns {Object} - Created occasion
 * @throws {ValidationError} When occasion data is invalid
 * @throws {DatabaseConstraintError} When occasion violates database constraints (e.g., duplicate slug)
 * @throws {DatabaseError} When database insert fails
 */
export const createOccasion = withErrorMapping(
  async occasionData => {
    validateOccasion(occasionData, false)

    const newOccasion = {
      name: occasionData.name,
      description: occasionData.description !== undefined ? occasionData.description : null,
      slug: occasionData.slug,
      display_order: occasionData.display_order !== undefined ? occasionData.display_order : 0,
      active: true
    }

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.create(newOccasion)

    return data
  },
  'INSERT',
  TABLE
)

/**
 * Update occasion (limited fields) - only allows updating specific occasion fields
 * @param {number} id - Occasion ID to update
 * @param {Object} updates - Updated occasion data
 * @param {string} [updates.name] - Occasion name
 * @param {string} [updates.description] - Occasion description
 * @param {string} [updates.slug] - Occasion slug
 * @param {number} [updates.display_order] - Display order for sorting
 * @returns {Object} - Updated occasion
 * @throws {BadRequestError} When ID is invalid or no valid updates are provided
 * @throws {ValidationError} When occasion data is invalid
 * @throws {NotFoundError} When occasion is not found
 * @throws {DatabaseConstraintError} When occasion violates database constraints (e.g., duplicate slug)
 * @throws {DatabaseError} When database update fails
 */
export const updateOccasion = withErrorMapping(
  async (id, updates) => {
    validateOccasionId(id, 'updateOccasion')

    if (!updates || Object.keys(updates).length === 0) {
      throw new BadRequestError('No updates provided', { occasionId: id })
    }

    validateOccasion(updates, true)

    const allowedFields = ['name', 'description', 'slug', 'display_order']
    const sanitized = {}

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new BadRequestError('No valid fields to update', { occasionId: id })
    }

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.update(id, sanitized)

    if (!data) {
      throw new NotFoundError('Occasion', id, { active: true })
    }

    return data
  },
  'UPDATE',
  TABLE
)

/**
 * Soft-delete occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to delete
 * @returns {Object} - Deactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export const deleteOccasion = withErrorMapping(
  async id => {
    validateOccasionId(id, 'deleteOccasion')

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.update(id, { active: false })

    if (!data) {
      throw new NotFoundError('Occasion', id, { active: true })
    }

    return data
  },
  'DELETE',
  TABLE
)

/**
 * Reactivate occasion (reverse soft-delete)
 * @param {number} id - Occasion ID to reactivate
 * @returns {Object} - Reactivated occasion
 * @throws {BadRequestError} When ID is invalid
 * @throws {NotFoundError} When occasion is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export const reactivateOccasion = withErrorMapping(
  async id => {
    validateOccasionId(id, 'reactivateOccasion')

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.update(id, { active: true })

    if (!data) {
      throw new NotFoundError('Occasion', id, { active: false })
    }

    return data
  },
  'UPDATE',
  TABLE
)

/**
 * Update display order for occasion sorting
 * @param {number} id - Occasion ID to update
 * @param {number} newOrder - New display order (must be non-negative)
 * @returns {Object} - Updated occasion
 * @throws {BadRequestError} When ID is invalid or newOrder is negative
 * @throws {NotFoundError} When occasion is not found or inactive
 * @throws {DatabaseError} When database update fails
 */
export const updateDisplayOrder = withErrorMapping(
  async (id, newOrder) => {
    validateOccasionId(id, 'updateDisplayOrder')

    if (typeof newOrder !== 'number' || newOrder < 0) {
      throw new BadRequestError('Invalid display_order: must be a non-negative number', {
        newOrder
      })
    }

    const occasionRepository = await getOccasionRepository()
    const data = await occasionRepository.update(id, { display_order: newOrder })

    if (!data) {
      throw new NotFoundError('Occasion', id, { active: true })
    }

    return data
  },
  'UPDATE',
  TABLE
)
