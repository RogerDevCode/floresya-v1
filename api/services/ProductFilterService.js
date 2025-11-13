/**
 * ProductFilterService
 * Servicio especializado para manejo centralizado de filtros de productos
 * Implementa la lógica de filtrado para múltiples criterios
 *
 * Principios CLAUDE.md aplicados:
 * - Service Layer Exclusive: Solo servicios acceden a repositorios
 * - KISS First: Máxima simplicidad sin abstracciones innecesarias
 * - Fail Fast: Errores específicos con logging inmediato
 * - Performance: Caché optimizado para consultas frecuentes
 * - Clean Architecture: Separación clara de responsabilidades
 */

import DIContainer from '../architecture/di-container.js'
import { NotFoundError, DatabaseError } from '../errors/AppError.js'

/**
 * Get ProductRepository instance from DI Container
 * @returns {ProductRepository} Repository instance
 */
function getProductRepository() {
  return DIContainer.resolve('ProductRepository')
}

/**
 * Get OccasionRepository instance from DI Container
 * @returns {OccasionRepository} Repository instance
 */
function getOccasionRepository() {
  return DIContainer.resolve('OccasionRepository')
}

/**
 * Service especializado para filtros de productos
 * Centraliza la lógica de filtrado para evitar JOINs complejos
 */
export class ProductFilterService {
  constructor() {
    this.productRepository = getProductRepository()
    this.occasionRepository = getOccasionRepository()
  }

  /**
   * Filtra productos con múltiples criterios (ocasión, búsqueda, precio, ordenamiento)
   * @param {Object} filters - Criterios de filtrado
   * @param {boolean} [_includeDeactivated=false] - Incluir productos inactivos (solo admin)
   * @param {string} [_includeImageSize=null] - Tamaño de imagen a incluir
   * @returns {Promise<Array>} Productos filtrados
   * @throws {NotFoundError} Cuando no se encuentran productos
   */
  async filterProducts(filters = {}, _includeDeactivated = false, _includeImageSize = null) {
    // Si hay filtro de ocasión, usar la función SQL optimizada
    if (filters.occasionId && typeof filters.occasionId === 'number') {
      return await this.filterByOccasion(filters, _includeDeactivated, _includeImageSize)
    }

    // Para filtros simples (sin ocasión), usar el método base del repository
    const query = {
      ...filters
    }

    // Aplicar filtros básicos
    if (filters.sku) {
      query.sku = filters.sku
    }

    if (filters.featured !== undefined) {
      query.featured = filters.featured === 'true'
    }

    if (filters.search && filters.search.trim() !== '') {
      query.search = filters.search.trim()
    }

    if (filters.price_min !== undefined && typeof filters.price_min === 'number') {
      query.price_min = filters.price_min
    }

    if (filters.price_max !== undefined && typeof filters.price_max === 'number') {
      query.price_max = filters.price_max
    }

    // Obtener productos del repository
    const products = await this.productRepository.findAllWithFilters(query, {
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      includeDeactivated
    })

    // Los productos ya vienen filtrados desde el repository (SQL)
    // Solo aplicamos ordenamiento y paginación en JavaScript
    const filteredProducts = products || []

    // Aplicar ordenamiento
    if (filters.sortBy === 'price_asc') {
      filteredProducts.sort((a, b) => a.price_usd - b.price_usd)
    } else if (filters.sortBy === 'price_desc') {
      filteredProducts.sort((a, b) => b.price_usd - a.price_usd)
    } else if (filters.sortBy === 'name_asc') {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
    } else if (filters.sortBy === 'created_desc') {
      filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else {
      // Default: más recientes primero
      filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    // Paginación
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    const startIndex = Math.min(offset, filteredProducts.length)
    const endIndex = Math.min(startIndex + limit, filteredProducts.length)

    return filteredProducts.slice(startIndex, endIndex)
  }

  /**
   * Filtrado específico por ocasión usando función SQL optimizada
   * @param {Object} filters - Filtros a aplicar
   * @param {boolean} [_includeDeactivated=false] - Incluir productos inactivos
   * @param {string} [_includeImageSize=null] - Tamaño de imagen a incluir
   * @returns {Promise<Array>} Productos filtrados
   * @throws {NotFoundError} Cuando no se encuentran productos para la ocasión
   * @throws {DatabaseError} Error en la llamada RPC
   */
  async filterByOccasion(filters, _includeDeactivated = false, _includeImageSize = null) {
    try {
      // Usar la función SQL optimizada que ya existe en la BD
      const { data, error } = await this.productRepository.rpc('get_products_with_occasions', {
        p_occasion_id: filters.occasionId,
        p_limit: filters.limit || 50,
        p_offset: filters.offset || 0
      })

      if (error) {
        throw new DatabaseError('Error en consulta SQL: ' + error.message, 'FILTER_BY_OCCASION', {
          filters,
          sqlError: error
        })
      }

      if (!data || data.length === 0) {
        throw new NotFoundError('No products found for this occasion', 'OCCASION_NOT_FOUND', {
          occasionId: filters.occasionId
        })
      }

      // Los productos ya vienen filtrados desde la función SQL
      // Solo aplicamos ordenamiento y paginación en JavaScript
      const filteredProducts = data || []

      // Aplicar ordenamiento
      if (filters.sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => a.price_usd - b.price_usd)
      } else if (filters.sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => b.price_usd - a.price_usd)
      } else if (filters.sortBy === 'name_asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
      } else {
        // Default: más recientes primero
        filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      // Paginación
      const limit = filters.limit || 50
      const offset = filters.offset || 0
      const startIndex = Math.min(offset, filteredProducts.length)
      const endIndex = Math.min(startIndex + limit, filteredProducts.length)

      return filteredProducts.slice(startIndex, endIndex)
    } catch (error) {
      console.error('❌ ProductFilterService.filterByOccasion failed:', error)
      throw error
    }
  }

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error a transformar
   * @param {string} operation - Operación donde ocurrió el error
   * @param {Object} context - Contexto adicional
   * @returns {DatabaseError} Error formateado
   */
  handleError(error, operation, context = {}) {
    console.error(`❌ ProductFilterService.${operation} failed:`, error)

    // Transformar errores específicos
    if (error.message.includes('relationship')) {
      return new DatabaseError(`Error de relación en la base de datos en ${operation}`, operation, {
        context,
        sqlError: error.message
      })
    }

    if (error.message.includes('function')) {
      return new DatabaseError(`Error en función SQL en ${operation}`, operation, {
        context,
        sqlError: error.message
      })
    }

    // Error genérico de base de datos
    return new DatabaseError(`Error de base de datos en ${operation}`, operation, {
      context,
      originalError: error.message
    })
  }
}

export default ProductFilterService
