/**
 * Test Parameter Normalizer
 *
 * Problema resuelto:
 * - Los tests esperan parámetros diferentes a los que reciben las funciones reales
 * - ValidatorService.validateId() retorna objetos pero los tests esperan números
 * - Inconsistencia entre lo que mockean los tests y lo que valida el código
 *
 * Solución:
 * - Unificar el mock de validateId para que retorne lo mismo que el código real
 * - Proporcionar helpers para normalizar parámetros entre tests y código
 * - Centralizar las transformaciones de datos comunes
 */

import { vi } from 'vitest'

/**
 * Mock unificado para ValidatorService.validateId
 * Comporta exactamente como el ValidatorService real
 */
export const validatorServiceMock = {
  validateId: vi.fn((id, fieldName = 'id') => {
    // Simular el comportamiento real de ValidatorService.validateId
    if (id === null || id === undefined) {
      const error = new ValidationError(`${fieldName} is required`)
      error.fieldName = fieldName
      throw error
    }

    const numericId = Number(id)
    if (isNaN(numericId)) {
      const error = new ValidationError(`${fieldName} must be a number`)
      error.fieldName = fieldName
      throw error
    }

    if (numericId <= 0) {
      const error = new ValidationError(`${fieldName} must be positive`)
      error.fieldName = fieldName
      throw error
    }

    return numericId
  }),

  validateEmail: vi.fn(() => true),
  validateString: vi.fn(() => true)
}

/**
 * Mock para ValidationError
 */
class ValidationError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ValidationError'
    this.fieldName = options.fieldName
  }
}

/**
 * Normaliza los parámetros que llegan del request a lo que esperan los servicios
 */
export class ParameterNormalizer {
  /**
   * Convierte los parámetros del request al formato esperado por los servicios
   * @param {Object} params - Parámetros crudos del request
   * @returns {Object} - Parámetros normalizados
   */
  static normalizeQueryParams(params) {
    const normalized = { ...params }

    // Convertir strings a números para paginación
    if (normalized.limit !== undefined) {
      normalized.limit = parseInt(normalized.limit, 10)
    }
    if (normalized.offset !== undefined) {
      normalized.offset = parseInt(normalized.offset, 10)
    }

    // Convertir booleanos de string a boolean
    if (typeof normalized.featured === 'string') {
      normalized.featured = normalized.featured === 'true'
    }

    return normalized
  }

  /**
   * Prepara los filtros para el repository
   * @param {Object} filters - Filtros del controller
   * @returns {Object} - Filtros para el repository
   */
  static normalizeRepositoryFilters(filters) {
    const normalized = { ...filters }

    // Convertir occasion a occasionId si existe
    if (filters.occasion) {
      normalized.occasionId = filters.occasion
      delete normalized.occasion
    }

    // Asegurar que includeDeactivated sea booleano
    if (normalized.includeDeactivated === undefined) {
      normalized.includeDeactivated = false
    }

    // Valores por defecto
    if (!normalized.sortBy) {
      normalized.sortBy = 'created_at'
    }

    return normalized
  }

  /**
   * Prepara las opciones para el repository
   * @param {Object} options - Opciones del controller
   * @returns {Object} - Opciones para el repository
   */
  static normalizeRepositoryOptions(options) {
    const normalized = { ...options }

    // Valores por defecto
    if (normalized.ascending === undefined) {
      normalized.ascending = false
    }

    return normalized
  }
}

/**
 * Helper para crear mocks de request con parámetros normalizados
 */
export function createMockRequest(overrides = {}) {
  const defaultRequest = {
    query: {},
    params: {},
    body: {},
    headers: {},
    user: null
  }

  const merged = { ...defaultRequest, ...overrides }

  // Normalizar query params automáticamente
  if (merged.query) {
    merged.query = ParameterNormalizer.normalizeQueryParams(merged.query)
  }

  return merged
}

/**
 * Helper para crear mocks de response consistentes
 */
export function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis()
  }
  return res
}

/**
 * Configuración de mocks para Vitest
 */
export function configureVitestMocks() {
  // Mock de ValidatorService
  vi.mock('../../../api/services/validation/ValidatorService.js', () => ({
    ValidatorService: validatorServiceMock
  }))

  // Mock de ValidationError
  vi.mock('../../../api/errors/AppError.js', () => ({
    ValidationError
  }))
}

/**
 * Funciones de ayuda para assertions comunes
 */
export const testAssertions = {
  /**
   * Verifica que validateId fue llamado con los parámetros correctos
   */
  expectValidateIdCalledWith: (mock, expectedId, fieldName = 'id') => {
    expect(mock.validateId).toHaveBeenCalledWith(expectedId, fieldName)
  },

  /**
   * Verifica que los filtros estén normalizados correctamente
   */
  expectNormalizedFilters: (actual, expected) => {
    const normalized = ParameterNormalizer.normalizeRepositoryFilters(expected)
    expect(actual).toEqual(normalized)
  }
}
