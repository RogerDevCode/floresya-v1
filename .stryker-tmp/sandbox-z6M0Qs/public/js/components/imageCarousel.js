/**
 * Image Carousel Component (Vanilla JS)
 * Enhanced with touch swipe navigation
 * Hover-activated: Shows first image by default, cycles on hover
 * Touch-enabled: Swipe to navigate between images
 * No dependencies, CSP-compliant
 */
// @ts-nocheck

import { api } from '../shared/api-client.js'
import { TouchGestures } from '../shared/touchGestures.js'

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
            loading="eager"
          />
        </div>
      `
      return { destroy: () => {} }
    }

    const images = response.data.sort((a, b) => a.image_index - b.image_index)
    const defaultImage = images[0] // First image is default

    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    // Render initial HTML (default image only)
    // First 8 products load eagerly (above the fold), rest lazy load
    const isAboveFold =
      Array.from(document.querySelectorAll('[data-carousel-container]')).indexOf(container) < 8

    container.innerHTML = `
      <div class="product-image-container" data-product-id="${productId}">
        <div class="carousel-images-wrapper">
          <img
            src="${defaultImage.url}"
            alt="Product image"
            class="product-carousel-image bg-gray-100"
            loading="${isAboveFold ? 'eager' : 'lazy'}"
            decoding="async"
            fetchpriority="${isAboveFold ? 'high' : 'auto'}"
          />
        </div>
        ${
          images.length > 1
            ? `
          <div class="image-count-badge">${images.length} fotos</div>
          <div class="carousel-indicators ${isTouchDevice ? 'touch-visible' : 'touch-hidden'}" data-current="0">
            ${images
              .map(
                (_, index) => `
              <button class="indicator-dot ${index === 0 ? 'active' : ''}"
                      data-index="${index}"
                      aria-label="Ver imagen ${index + 1} de ${images.length}"
                      tabindex="0">
                <span class="sr-only">Imagen ${index + 1}</span>
              </button>
            `
              )
              .join('')}
          </div>
          <button class="carousel-nav prev ${isTouchDevice ? 'touch-visible' : 'touch-hidden'}"
                  aria-label="Ver imagen anterior"
                  tabindex="0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button class="carousel-nav next ${isTouchDevice ? 'touch-visible' : 'touch-hidden'}"
                  aria-label="Ver siguiente imagen"
                  tabindex="0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <div class="swipe-hint ${isTouchDevice ? 'touch-visible' : 'touch-hidden'}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="7 12 12 7 17 12"></polyline>
              <polyline points="7 12 12 17 17 12"></polyline>
            </svg>
            <span>Desliza para ver más</span>
          </div>
        `
            : ''
        }
      </div>
    `

    // If only 1 image, no carousel needed
    if (images.length === 1) {
      return { destroy: () => {} }
    }

    // Carousel state
    let currentIndex = 0
    let autoplayTimer = null
    let touchGestures = null
    let isSwipeHintShown = false

    const imageContainer = container.querySelector('.product-image-container')
    const imagesWrapper = imageContainer.querySelector('.carousel-images-wrapper')
    const imgElement = imageContainer.querySelector('img')

    // Touch-specific elements
    const indicators = imageContainer.querySelector('.carousel-indicators')
    const prevBtn = imageContainer.querySelector('.carousel-nav.prev')
    const nextBtn = imageContainer.querySelector('.carousel-nav.next')
    const swipeHint = imageContainer.querySelector('.swipe-hint')

    // Add error handling for image loading
    const handleImageError = () => {
      imgElement.src = '/images/placeholder-flower.svg'
      imgElement.classList.add('bg-gray-100')
      console.warn('Failed to load product image:', defaultImage.url)
    }
    imgElement.addEventListener('error', handleImageError)

    /**
     * Navigate to specific image with smooth transition
     */
    function goToImage(index, animate = true) {
      if (index < 0) {
        index = images.length - 1
      }
      if (index >= images.length) {
        index = 0
      }

      const wasChanged = currentIndex !== index
      currentIndex = index

      if (animate) {
        // Add fade transition
        imgElement.style.opacity = '0'

        setTimeout(() => {
          imgElement.src = images[currentIndex].url
          imgElement.classList.remove('bg-gray-100')
          imgElement.style.opacity = '1'

          // Update indicators
          updateIndicators()

          // Haptic feedback if supported
          if (wasChanged && navigator.vibrate) {
            navigator.vibrate(10)
          }
        }, 150)
      } else {
        imgElement.src = images[currentIndex].url
        imgElement.classList.remove('bg-gray-100')
        updateIndicators()
      }

      // Hide swipe hint after first interaction
      if (isSwipeHintShown && swipeHint) {
        swipeHint.classList.add('hidden')
        isSwipeHintShown = true
      }
    }

    /**
     * Cycle to next image
     */
    function nextImage() {
      goToImage(currentIndex + 1)
    }

    /**
     * Cycle to previous image
     */
    function prevImage() {
      goToImage(currentIndex - 1)
    }

    /**
     * Reset to default image
     */
    function resetToDefault() {
      goToImage(0, false)
    }

    /**
     * Update visual indicators
     */
    function updateIndicators() {
      if (!indicators) {
        return
      }

      // Update current index attribute
      indicators.setAttribute('data-current', currentIndex.toString())

      // Update active indicator
      const dots = indicators.querySelectorAll('.indicator-dot')
      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.add('active')
          dot.setAttribute('aria-current', 'true')
        } else {
          dot.classList.remove('active')
          dot.removeAttribute('aria-current')
        }
      })
    }

    /**
     * Initialize touch gestures
     */
    function initTouchGestures() {
      if (!isTouchDevice || !imagesWrapper) {
        return
      }

      touchGestures = new TouchGestures({
        swipeThreshold: 50,
        velocityThreshold: 0.3,
        preventDefault: false,
        passive: true
      })

      touchGestures.init(imagesWrapper)

      touchGestures.onSwipe(event => {
        if (event.direction === 'left') {
          nextImage()
        } else if (event.direction === 'right') {
          prevImage()
        }
      })

      // Add visual feedback during swipe
      imagesWrapper.addEventListener(
        'touchstart',
        () => {
          imagesWrapper.classList.add('swiping')
        },
        { passive: true }
      )

      imagesWrapper.addEventListener(
        'touchend',
        () => {
          setTimeout(() => {
            imagesWrapper.classList.remove('swiping')
          }, 300)
        },
        { passive: true }
      )
    }

    /**
     * Show swipe hint on first load
     */
    function showSwipeHint() {
      if (!isTouchDevice || !swipeHint || isSwipeHintShown) {
        return
      }

      // Show hint after a delay
      setTimeout(() => {
        if (!isSwipeHintShown) {
          swipeHint.classList.add('show')

          // Auto-hide after 3 seconds
          setTimeout(() => {
            swipeHint.classList.remove('show')
            isSwipeHintShown = true
          }, 3000)
        }
      }, 1500)
    }

    /**
     * Initialize navigation buttons and indicators
     */
    function initNavigationControls() {
      if (!indicators) {
        return
      }

      // Indicator clicks
      const dots = indicators.querySelectorAll('.indicator-dot')
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToImage(index))

        // Keyboard navigation
        dot.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            goToImage(index)
          }
        })
      })

      // Navigation buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', prevImage)
        prevBtn.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            prevImage()
          }
        })
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', nextImage)
        nextBtn.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            nextImage()
          }
        })
      }
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

    // Initialize touch and navigation controls
    if (images.length > 1) {
      initNavigationControls()
      initTouchGestures()
      showSwipeHint()
    }

    // Attach hover events (maintain backward compatibility)
    imageContainer.addEventListener('mouseenter', startCycling)
    imageContainer.addEventListener('mouseleave', stopCycling)

    // Return control methods
    return {
      destroy: () => {
        stopCycling()
        imageContainer.removeEventListener('mouseenter', startCycling)
        imageContainer.removeEventListener('mouseleave', stopCycling)
        imgElement.removeEventListener('error', handleImageError)

        // Clean up touch gestures
        if (touchGestures) {
          touchGestures.destroy()
        }

        // Clean up navigation controls
        if (indicators) {
          const dots = indicators.querySelectorAll('.indicator-dot')
          dots.forEach(dot => {
            dot.removeEventListener('click', goToImage)
          })
        }

        if (prevBtn) {
          prevBtn.removeEventListener('click', prevImage)
        }

        if (nextBtn) {
          nextBtn.removeEventListener('click', nextImage)
        }
      }
    }
  } catch (error) {
    console.error(`createImageCarousel(${productId}) failed:`, error)
    throw error // Fail-fast: propagate error to caller
  }
}
