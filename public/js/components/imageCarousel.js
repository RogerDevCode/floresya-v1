/**
 * Image Carousel Component (Vanilla JS)
 * Enhanced with touch swipe navigation
 * Hover-activated: Shows first image by default, cycles on hover
 * Touch-enabled: Swipe to navigate between images
 * No dependencies, CSP-compliant
 */

import { api } from '../shared/api-client.js'
import { TouchGestures } from '../shared/touchGestures.js'

/**
 * Create hover-activated image carousel for product card
 * @param {HTMLElement} container - Container element
 * @param {number} productId - Product ID
 * @returns {Object} Carousel instance
 */
export function createImageCarousel(container, productId) {
  try {
    // State
    let isInitialized = false
    let isLoading = false
    let images = []
    let currentIndex = 0
    let autoplayTimer = null
    let touchGestures = null
    let isSwipeHintShown = false

    // DOM Elements
    const imageContainer = container // The container IS the wrapper in the new HTML structure
    const imgElement = imageContainer.querySelector('img')

    // Validate essential elements
    if (!imgElement) {
      console.warn(`[Carousel] Image element not found for product ${productId}`)
      return { destroy: () => {} }
    }

    /**
     * Initialize carousel on first interaction
     */
    async function initCarousel() {
      if (isInitialized || isLoading) {
        return
      }
      isLoading = true

      try {
        // Fetch product images (small size)
        const response = await api.getProductImages(productId, { size: 'small' })

        if (!response.success || !response.data || response.data.length <= 1) {
          // No extra images, nothing to do
          isInitialized = true
          isLoading = false
          // Remove listeners since we don't need them anymore
          cleanupInteractionListeners()
          return
        }

        images = response.data.sort((a, b) => a.image_index - b.image_index)

        // Check if touch device
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

        // Build UI controls
        const controlsHTML = `
          <div class="image-count-badge fade-in">${images.length} fotos</div>
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

        // Append controls
        imageContainer.insertAdjacentHTML('beforeend', controlsHTML)

        // Initialize controls
        initNavigationControls()
        initTouchGestures()

        if (isTouchDevice) {
          showSwipeHint()
        } else {
          // If mouse, start cycling immediately since we are already hovering
          startCycling()
        }

        isInitialized = true
      } catch (error) {
        console.error(`[Carousel] Failed to load images for product ${productId}:`, error)
      } finally {
        isLoading = false
      }
    }

    /**
     * Navigate to specific image with smooth transition
     */
    function goToImage(index, animate = true) {
      if (!isInitialized || images.length === 0) {
        return
      }

      if (index < 0) {
        index = images.length - 1
      }
      if (index >= images.length) {
        index = 0
      }

      const wasChanged = currentIndex !== index
      currentIndex = index

      if (animate) {
        imgElement.style.opacity = '0.8' // Slight fade for smoother feel

        // Use requestAnimationFrame for smoother visual update
        requestAnimationFrame(() => {
          imgElement.src = images[currentIndex].url
          imgElement.style.opacity = '1'
        })

        // Haptic feedback if supported
        if (wasChanged && navigator.vibrate) {
          navigator.vibrate(10)
        }
      } else {
        imgElement.src = images[currentIndex].url
      }

      updateIndicators()

      // Hide swipe hint after first interaction
      const swipeHint = imageContainer.querySelector('.swipe-hint')
      if (isSwipeHintShown && swipeHint) {
        swipeHint.classList.add('hidden')
        isSwipeHintShown = true
      }
    }

    function nextImage() {
      goToImage(currentIndex + 1)
    }

    function prevImage() {
      goToImage(currentIndex - 1)
    }

    function resetToDefault() {
      if (!isInitialized) {
        return
      }
      goToImage(0, false)
    }

    function updateIndicators() {
      const indicators = imageContainer.querySelector('.carousel-indicators')
      if (!indicators) {
        return
      }

      indicators.setAttribute('data-current', currentIndex.toString())
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

    function initTouchGestures() {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      if (!isTouchDevice) {
        return
      }

      touchGestures = new TouchGestures({
        swipeThreshold: 50,
        velocityThreshold: 0.3,
        preventDefault: false,
        passive: true
      })

      touchGestures.init(imageContainer)

      touchGestures.onSwipe(event => {
        if (event.direction === 'left') {
          nextImage()
        } else if (event.direction === 'right') {
          prevImage()
        }
      })
    }

    function showSwipeHint() {
      const swipeHint = imageContainer.querySelector('.swipe-hint')
      if (!swipeHint || isSwipeHintShown) {
        return
      }

      setTimeout(() => {
        if (!isSwipeHintShown) {
          swipeHint.classList.add('show')
          setTimeout(() => {
            swipeHint.classList.remove('show')
            isSwipeHintShown = true
          }, 3000)
        }
      }, 1500)
    }

    function initNavigationControls() {
      const indicators = imageContainer.querySelector('.carousel-indicators')
      const prevBtn = imageContainer.querySelector('.carousel-nav.prev')
      const nextBtn = imageContainer.querySelector('.carousel-nav.next')

      if (indicators) {
        const dots = indicators.querySelectorAll('.indicator-dot')
        dots.forEach((dot, index) => {
          dot.addEventListener('click', e => {
            e.stopPropagation() // Prevent card click
            goToImage(index)
          })
        })
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', e => {
          e.stopPropagation()
          prevImage()
        })
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', e => {
          e.stopPropagation()
          nextImage()
        })
      }
    }

    function startCycling() {
      if (autoplayTimer || !isInitialized) {
        return
      }
      // Initial delay before cycling starts to avoid jarring effect
      autoplayTimer = setInterval(nextImage, 1200)
    }

    function stopCycling() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer)
        autoplayTimer = null
      }
      resetToDefault()
    }

    // --- Interaction Handlers ---

    function handleInteraction() {
      if (!isInitialized) {
        initCarousel()
      } else {
        startCycling()
      }
    }

    function handleMouseLeave() {
      stopCycling()
    }

    // Attach lazy load listeners
    imageContainer.addEventListener('mouseenter', handleInteraction)
    imageContainer.addEventListener('mouseleave', handleMouseLeave)

    // Touch start also triggers init if needed
    imageContainer.addEventListener('touchstart', handleInteraction, { passive: true })

    function cleanupInteractionListeners() {
      imageContainer.removeEventListener('mouseenter', handleInteraction)
      imageContainer.removeEventListener('mouseleave', handleMouseLeave)
      imageContainer.removeEventListener('touchstart', handleInteraction)
    }

    // Return control methods
    return {
      destroy: () => {
        stopCycling()
        cleanupInteractionListeners()

        if (touchGestures) {
          touchGestures.destroy()
        }

        // Remove injected controls to clean up DOM
        const controls = imageContainer.querySelectorAll(
          '.image-count-badge, .carousel-indicators, .carousel-nav, .swipe-hint'
        )
        controls.forEach(el => el.remove())
      }
    }
  } catch (error) {
    console.error(`createImageCarousel(${productId}) failed:`, error)
    return { destroy: () => {} }
  }
}
