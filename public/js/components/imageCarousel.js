/**
 * Image Carousel Component (Vanilla JS)
 * Hover-activated: Shows first image by default, cycles on hover
 * No dependencies, CSP-compliant
 */

import { api } from '../shared/api-client.js'

/**
 * Create hover-activated image carousel for product card
 * @param {HTMLElement} container - Container element
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} Carousel instance
 */
export async function createImageCarousel(container, productId) {
  try {
    // Fetch product images (small size)
    const response = await api.getProductImages(productId, { size: 'small' })

    // Fallback: Use placeholder if no images found
    if (!response.success || !response.data || response.data.length === 0) {
      const placeholders = ['/images/placeholder-flower.svg', '/images/placeholder-hero.svg']
      const placeholderIndex = productId % placeholders.length
      const placeholderUrl = placeholders[placeholderIndex]

      container.innerHTML = `
        <div class="product-image-container" data-product-id="${productId}">
          <img
            src="${placeholderUrl}"
            alt="Product placeholder"
            class="product-carousel-image"
            loading="lazy"
          />
        </div>
      `
      return { destroy: () => {} }
    }

    const images = response.data.sort((a, b) => a.image_index - b.image_index)
    const defaultImage = images[0] // First image is default

    // Render initial HTML (default image only)
    container.innerHTML = `
      <div class="product-image-container" data-product-id="${productId}">
        <img
          src="${defaultImage.url}"
          alt="Product image"
          class="product-carousel-image bg-gray-100"
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

    // Add error handling for image loading
    const handleImageError = () => {
      imgElement.src = '/images/placeholder-flower.svg'
      imgElement.classList.add('bg-gray-100')
      console.warn('Failed to load product image:', defaultImage.url)
    }
    imgElement.addEventListener('error', handleImageError)

    /**
     * Cycle to next image
     */
    function nextImage() {
      currentIndex = (currentIndex + 1) % images.length
      imgElement.src = images[currentIndex].url
      imgElement.classList.remove('bg-gray-100')
    }

    /**
     * Reset to default image
     */
    function resetToDefault() {
      currentIndex = 0
      imgElement.src = defaultImage.url
      imgElement.classList.remove('bg-gray-100')
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
        imgElement.removeEventListener('error', handleImageError)
      }
    }
  } catch (error) {
    console.error(`createImageCarousel(${productId}) failed:`, error)
    throw error // Fail-fast: propagate error to caller
  }
}
