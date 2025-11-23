/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Carousel Service Index
 * Main export point for modular carouselService functionality
 */

export { default } from './carouselService.js'
export * from './carouselService.js'

// Re-export commonly used functions
export {
  getCarouselProducts,
  updateCarouselOrder,
  addToCarousel,
  removeFromCarousel,
  reorderCarousel,
  validateCarouselConfig
} from './carouselService.js'
