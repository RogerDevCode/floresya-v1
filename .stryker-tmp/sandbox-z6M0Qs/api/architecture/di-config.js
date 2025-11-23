/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * DI Container Configuration
 * Register all services with their dependencies
 * Call this during application initialization
 */

import DIContainer from './di-container.js'
import { supabaseClient } from '../config/supabaseClient.js'
import { logger } from '../utils/logger.js'

/**
 * Configure DI Container with all services
 * This should be called once during app initialization (e.g., in app.js)
 */
import { ResponseFormatter } from './response-formatter.js'
import { RequestValidator } from './request-validator.js'

export function configureDIContainer() {
  // Register database client as singleton
  DIContainer.registerInstance('SupabaseClient', supabaseClient)

  /**
   * Example: Register ProductService with its dependencies
   *
   * NOTE: This is an example showing how to register services.
   * The actual ProductService needs to be refactored to accept dependencies
   * via constructor first.
   *
   * Before (current implementation):
   * export async function getAllProducts() {
   *   const supabase = createClient(...)  // Direct dependency - BAD
   * }
   *
   * After (with DI):
   * class ProductService {
   *   constructor(supabaseClient) {  // Injected dependency - GOOD
   *     this.supabase = supabaseClient
   *   }
   *
   *   async getAllProducts() {
   *     return this.supabase.from(...)
   *   }
   * }
   */

  // Example registration (uncomment after refactoring ProductService):
  // import ProductService from '../services/productService.js'
  // DIContainer.register('ProductService', ProductService, ['SupabaseClient'])

  /**
   * Register response formatter and validator as singletons
   * These are stateless and can be shared
   */
  DIContainer.registerInstance('ResponseFormatter', new ResponseFormatter())
  DIContainer.registerInstance('RequestValidator', new RequestValidator())

  logger.info('✅ DI Container configured successfully')

  return DIContainer
}

/**
 * Example usage in routes:
 *
 * Before (tight coupling):
 * import * as productController from '../controllers/productController.js'
 * router.get('/', productController.getAllProducts)
 *
 * After (with DI - loose coupling):
 * import { productController } from '../architecture/product-controller-refactored.js'
 * router.get('/', productController.getAllProducts)
 *
 * Or for testing:
 * const mockProductService = { getAllProducts: async () => [...] }
 * const controller = new ProductController(mockProductService)
 * const result = await controller.getAllProducts(req, res)
 */
