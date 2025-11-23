/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Product Service Index
 * Main export point for modular productService functionality
 * Follows the same pattern as other modular services
 */

export * from './productService.js'

// Re-export commonly used functions for convenience
export {
  getProductCarousel,
  getProductsWithOccasions,
  getProductBySku,
  getProductsByOccasion,
  updateProduct,
  deleteProduct,
  getActiveProducts,
  getFeaturedProducts,
  searchProducts,
  filterProducts,
  validateProductData,
  processProductImages,
  updateProductStock,
  checkProductAvailability
} from './productService.js'
