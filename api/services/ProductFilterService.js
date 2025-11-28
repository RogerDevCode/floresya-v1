/**
 * Procesado por B
 */

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
import { DatabaseError } from '../errors/AppError.js'

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
  constructor(productRepository, occasionRepository) {
    this.productRepository = productRepository
    this.occasionRepository = occasionRepository
  }

  /**
   * Static Async Factory
   */
  static async create() {
    const productRepository = await getProductRepository()
    const occasionRepository = await getOccasionRepository()
    return new ProductFilterService(productRepository, occasionRepository)
  }

  /**
   * Filtra productos con múltiples criterios (ocasión, búsqueda, precio, ordenamiento)
   * ✅ OPTIMIZADO: Delega 100% filtrado al repositorio (usa get_products_filtered RPC)
   * @param {Object} filters - Criterios de filtrado
   * @param {boolean} [_includeDeactivated=false] - Incluir productos inactivos (solo admin)
   * @param {string} [_includeImageSize=null] - Tamaño de imagen a incluir
   * @returns {Promise<Array>} Productos filtrados
   * @throws {NotFoundError} Cuando no se encuentran productos
   */
  async filterProducts(filters = {}, _includeDeactivated = false, _includeImageSize = null) {
    // ✅ OPTIMIZACIÓN: Repository ahora maneja TODO el filtrado en SQL
    const query = {
      occasionId: filters.occasionId,
      sku: filters.sku,
      featured:
        filters.featured === 'true'
          ? true
          : filters.featured === 'false'
            ? false
            : filters.featured,
      search: filters.search?.trim() || null,
      price_min: filters.price_min,
      price_max: filters.price_max,
      sortBy: filters.sortBy,
      includeDeactivated: _includeDeactivated
    }

    // Repository options con paginación
    const options = {
      limit: filters.limit || 50,
      offset: filters.offset || 0
    }

    // ✅ Una sola llamada al repository - TODO se hace en SQL
    const products = await this.productRepository.findAllWithFilters(query, options)

    return products || []
  }

  /**
   * Filtrado específico por ocasión usando función SQL optimizada
   * ✅ OPTIMIZADO: Redirige a filterProducts (misma lógica, sin duplicación)
   * @param {Object} filters - Filtros a aplicar
   * @param {boolean} [_includeDeactivated=false] - Incluir productos inactivos
   * @param {string} [_includeImageSize=null] - Tamaño de imagen a incluir
   * @returns {Promise<Array>} Productos filtrados
   * @throws {NotFoundError} Cuando no se encuentran productos para la ocasión
   * @throws {DatabaseError} Error en la llamada RPC
   */
  async filterByOccasion(filters, _includeDeactivated = false, _includeImageSize = null) {
    // ✅ OPTIMIZACIÓN: Usar filterProducts para evitar duplicación
    // filterProducts ya usa get_products_filtered RPC que maneja ocasiones
    return await this.filterProducts(filters, _includeDeactivated, _includeImageSize)
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
