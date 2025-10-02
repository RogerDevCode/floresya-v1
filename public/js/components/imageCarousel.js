/**
 * Image Carousel Component (Vanilla JS)
 * Hover-activated: Shows first image by default, cycles on hover
 * No dependencies, CSP-compliant
 */

import { api } from '../shared/api.js'

/**
 * Create hover-activated image carousel for product card
 * @param {HTMLElement} container - Container element
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Carousel instance
 */
export async function createImageCarousel(container, productId) {
  try {
    // Fetch product images (small size)
    const response = await api.getProductImages(productId, 'small')

    if (!response.success || !response.data || response.data.length === 0) {
      throw new Error('No images found for product')
    }

    const images = response.data.sort((a, b) => a.image_index - b.image_index)
    const defaultImage = images[0] // First image is default

    // Render initial HTML (default image only)
    container.innerHTML = `
      <div class="product-image-container" data-product-id="${productId}">
        <img
          src="${defaultImage.url}"
          alt="Product image"
          class="product-carousel-image"
          loading="lazy"
        />
        ${images.length > 1 ? `<div class="image-count-badge">${images.length} fotos</div>` : ''}
      </div>
    `

    // If only 1 image, no carousel needed
    if (images.length === 1) {
      return { destroy: () => {} }
    }

    // Carousel state
    let currentIndex = 0
    let autoplayTimer = null

    const imageContainer = container.querySelector('.product-image-container')
    const imgElement = imageContainer.querySelector('img')

    /**
     * Cycle to next image
     */
    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length
      imgElement.src = images[currentIndex].url
    }

    /**
     * Reset to default image
     */
    function resetToDefault() {
      currentIndex = 0
      imgElement.src = defaultImage.url
    }

    /**
     * Start auto-cycling images
     */
    function startCycling() {
      if (autoplayTimer) {
        return
      }
      autoplayTimer = setInterval(nextImage, 800) // Fast cycling on hover
    }

    /**
     * Stop cycling and reset to default
     */
    function stopCycling() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
      }
      resetToDefault()
    }

    // Attach hover events
    imageContainer.addEventListener('mouseenter', startCycling)
    imageContainer.addEventListener('mouseleave', stopCycling)

    // Return control methods
    return {
      destroy: () => {
        stopCycling()
        imageContainer.removeEventListener('mouseenter', startCycling)
        imageContainer.removeEventListener('mouseleave', stopCycling)
      }
    }
  } catch (error) {
    console.error(`createImageCarousel(${productId}) failed:`, error)
    throw error // Fail-fast: propagate error to caller
  }
}
