/**
 * FloresYa - Index Page (ES6 Module)
 * Mobile menu toggle and UI interactions for index.html
 * Implementación con carga dinámica de módulos usando el patrón solicitado
 */

import { initMobileNav } from './js/components/mobileNav.js'

// Helper to reduce console noise in production
const shouldLogDebug = () => {
  // Always log in development, reduce in production
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

const log = {
  debug: (...args) => {
    if (shouldLogDebug()) {
      console.debug(...args)
    }
  },
  info: (...args) => {
    if (shouldLogDebug()) {
      console.info(...args)
    }
  },
  success: (...args) => {
    if (shouldLogDebug()) {
      console.log('✅', ...args)
    }
  },
  error: (...args) => {
    console.error('❌', ...args)
  },
  warn: (...args) => {
    console.warn('⚠️', ...args)
  }
}

// Track active event listeners to prevent memory leaks
const eventListenerTracker = {
  quickView: new WeakMap(),
  cart: new WeakMap(),
  productImage: new WeakMap(),
  buyNow: new WeakMap(),
  wishlist: new WeakMap(),

  // Track touch feedback instances
  touchFeedbackInstances: new Set()
}

/**
 * Show cart notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of message ('success', 'error', 'info')
 */
function showCartMessage(message, type = 'success') {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('cart-toast-container')
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.id = 'cart-toast-container'
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none'
    document.body.appendChild(toastContainer)
  }

  // Create toast element
  const toast = document.createElement('div')

  // Set styling based on type
  let bgColor = 'bg-green-500'
  let iconSvg =
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'

  if (type === 'error') {
    bgColor = 'bg-red-500'
    iconSvg =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
  } else if (type === 'info') {
    bgColor = 'bg-blue-500'
    iconSvg =
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
  }

  toast.className = `pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-white text-sm ${bgColor} flex items-center gap-2 min-w-[250px] transform translate-x-0 transition-all duration-300 ease-in-out`

  toast.innerHTML = `
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      ${iconSvg}
    </svg>
    <span class="flex-1">${message}</span>
  `

  // Add to container
  toastContainer.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full')
    toast.classList.add('translate-x-0')
  }, 10)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

// Main initialization function
async function initApp() {
  try {
    log.info('Starting dynamic module loading...')

    // Cargar módulos dinámicamente usando el patrón solicitado
    await Promise.all([
      import('./js/shared/dom-ready.js'),
      import('./js/themes/themeManager.js'),
      import('./js/components/ThemeSelector.js'),
      import('./js/components/imageCarousel.js'),
      // MobileNav imported statically
      import('./js/components/pullToRefresh.js'),
      import('./js/shared/cart.js'),
      import('./js/shared/api-client.js'),
      import('./js/shared/touchFeedback.js'),
      import('./js/components/ui-interactions.js').then(m => m.initUIInteractions())
    ])

    // Nota: Los módulos se cargan dinámicamente dentro de cada función que los necesita

    log.success('All modules loaded successfully')

    // Ejecutar inicialización con módulos cargados dinámicamente
    await init()

    // Try to load cuco clock module separately (optional)
    log.debug('About to import cuco clock module...')
    import('./js/components/cucoClock.js')
      .then(() => {
        log.success('Cuco clock module loaded successfully')

        // Set up event listener when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupCucoClockButton)
        } else {
          setupCucoClockButton()
        }
      })
      .catch(error => {
        log.debug('Cuco clock module failed to load, fallback will be used:', error.message)
      })

    // Function to set up the cuco clock button event listener
    function setupCucoClockButton() {
      const cucoButton = document.getElementById('cuco-clock-toggle')
      if (cucoButton) {
        log.debug('Adding click listener to cuco toggle button...')
        cucoButton.addEventListener('click', e => {
          e.preventDefault()
          e.stopPropagation()

          if (window.cucoClock) {
            window.cucoClock.toggleClock()
            log.debug('window.cucoClock.toggleClock() called')
          } else {
            log.warn('window.cucoClock not available')
          }
        })
        log.success('Cuco clock toggle event listener added successfully')
      } else {
        log.error('Could not find cuco toggle button in DOM')
      }
    }

    log.success('Dynamic module system initialization complete')
  } catch (error) {
    log.error('Failed to load modules:', error)
    throw error
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  // DOM already loaded, run immediately
  initApp()
}

/**
 * Initialize mobile navigation drawer
 * Uses the existing #mobile-menu-btn button from HTML
 */
function initMobileNavigation() {
  try {
    // Initialize the mobile navigation drawer with existing button
    // Using static import for better reliability in tests
    const mobileNav = initMobileNav({
      menuBtnSelector: '#mobile-menu-btn',
      menuSelector: '#mobile-menu',
      drawerId: 'mobile-nav-drawer',
      overlayId: 'mobile-nav-overlay',
      animationDuration: 250
    })

    // Store reference for potential later use
    window.mobileNavInstance = mobileNav

    console.log('✅ [index.js] Mobile navigation initialized successfully')
  } catch (error) {
    console.warn(
      '⚠️ [index.js] Failed to initialize mobile navigation drawer, falling back to simple toggle:',
      error
    )

    // Fallback to simple mobile menu toggle for test compatibility
    initSimpleMobileMenuToggle()
  }
}

/**
 * Initialize simple mobile menu toggle as fallback for tests
 * This ensures Cypress tests pass by providing basic toggle functionality
 */
function initSimpleMobileMenuToggle() {
  const menuBtn = document.getElementById('mobile-menu-btn')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuBtn || !mobileMenu) {
    console.error('❌ [index.js] Mobile menu elements not found for simple toggle')
    return
  }

  // Add simple click handler that toggles the 'hidden' class
  menuBtn.addEventListener('click', e => {
    e.preventDefault()

    // Toggle the hidden class
    mobileMenu.classList.toggle('hidden')

    // Update aria-expanded attribute
    const isExpanded = !mobileMenu.classList.contains('hidden')
    menuBtn.setAttribute('aria-expanded', isExpanded.toString())

    console.log(
      '✅ [index.js] Simple mobile menu toggle activated:',
      isExpanded ? 'opened' : 'closed'
    )
  })

  console.log('✅ [index.js] Simple mobile menu toggle initialized successfully')
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href')
      if (href === '#' || href.startsWith('#login') || href.startsWith('#carrito')) {
        return
      }

      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
}

/**
 * Update Progress Bar for Carousel (Enhanced)
 */
function updateProgressBar(index) {
  const progressBar = document.getElementById('carouselProgressBar')
  const indicators = document.getElementById('carousel-indicators')

  if (!progressBar) {
    return
  }

  // Get total slides from the carousel
  const carouselSlides = document.getElementById('carouselSlides')
  const totalSlides = carouselSlides ? carouselSlides.children.length : 3

  const percentage = ((index + 1) / totalSlides) * 100
  progressBar.style.width = percentage + '%'

  // Update enhanced indicators if they exist
  if (indicators) {
    const dots = indicators.querySelectorAll('.carousel-dot')
    dots.forEach((dot, i) => {
      const isActive = i === index
      dot.classList.toggle('active', isActive)
      dot.setAttribute('aria-current', isActive ? 'true' : 'false')

      // Update inline styles for visual feedback
      if (isActive) {
        dot.style.backgroundColor = '#ec4899'
        dot.style.transform = 'scale(1.3)'
      } else {
        dot.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
        dot.style.transform = 'scale(1)'
      }
    })
  }
}

/**
 * Create Enhanced Carousel Indicators (Modelo 5 - Stanford Research)
 */
function createCarouselIndicators(totalSlides) {
  const indicatorsContainer = document.getElementById('carousel-indicators')
  if (!indicatorsContainer) {
    return
  }

  // Always create at least one indicator for accessibility, even with 0 or 1 slide
  const slidesCount = Math.max(totalSlides, 1)

  // Clear existing indicators
  indicatorsContainer.innerHTML = ''

  // Create dots with enhanced styling
  for (let i = 0; i < slidesCount; i++) {
    const dot = document.createElement('button')
    dot.className =
      'carousel-dot relative w-3 h-3 rounded-full bg-white bg-opacity-50 transition-all duration-300 hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent'
    dot.style.cssText = `
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      ${i === 0 ? 'background-color: #ec4899; transform: scale(1.3);' : ''}
    `
    dot.setAttribute('type', 'button')
    dot.setAttribute('aria-label', `Ir al slide ${i + 1}`)
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false')
    dot.setAttribute('data-slide', i)

    // Add hover effects
    dot.addEventListener('mouseenter', () => {
      if (!dot.classList.contains('active')) {
        dot.style.transform = 'scale(1.2)'
        dot.style.backgroundColor = 'rgba(236, 72, 153, 0.7)'
      }
    })

    dot.addEventListener('mouseleave', () => {
      if (!dot.classList.contains('active')) {
        dot.style.transform = 'scale(1)'
        dot.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
      }
    })

    // Add click handler
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide'), 10)
      if (window.carouselShowSlide) {
        window.carouselShowSlide(slideIndex)
      }
    })

    indicatorsContainer.appendChild(dot)
  }
}

/**
 * Initialize Featured Products Carousel
 */
async function initCarousel() {
  const carouselSlides = document.getElementById('carouselSlides')
  const prevBtn = document.getElementById('carousel-prev')
  const nextBtn = document.getElementById('carousel-next')

  log.info('🎠 [Carousel] Initializing carousel...')
  log.info('🎠 [Carousel] Elements found:', {
    carouselSlides: !!carouselSlides,
    prevBtn: !!prevBtn,
    nextBtn: !!nextBtn
  })

  if (!carouselSlides || !prevBtn || !nextBtn) {
    log.error('🎠 [Carousel] Missing required elements - carousel initialization cancelled')
    return
  }

  // Fetch featured products from API
  let featuredProducts = []
  try {
    // Import API module dynamically
    const { api } = await import('./js/shared/api-client.js')

    const result = await api.getAllCarouselProducts()

    if (result.success && result.data && result.data.length > 0) {
      // Use all featured products - carousel handles placeholders for products without images
      featuredProducts = result.data

      if (featuredProducts.length === 0) {
        log.error('No carousel products found in response')
        throw new Error('No carousel products found')
      }
    } else {
      log.error('No carousel products found in response')
      throw new Error('No carousel products found')
    }
  } catch (error) {
    log.error('Failed to load carousel products:', error)

    // More informative error message
    const errorMsg =
      error.message === 'NetworkError when attempting to fetch resource.'
        ? 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet.'
        : error.message

    carouselSlides.innerHTML = `
      <div class="text-center text-gray-600 p-8">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-lg font-semibold text-gray-700 mb-2">No se pudieron cargar los productos destacados</p>
        <p class="text-sm text-gray-500">${errorMsg}</p>
        <button
          onclick="window.location.reload()"
          class="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    `
    return
  }

  let currentSlide = 0

  // Build slides HTML
  const slidesHTML = featuredProducts
    .map((product, index) => {
      // Use image_url_small (300x300px) or fallback to placeholder
      const imageUrl = product.image_url_small || './images/placeholder-flower.svg'
      const price = product.price_usd || 0
      const description = product.description || 'Hermoso arreglo floral'

      // DEBUG: Log image URL information
      log.debug(`Carousel slide ${index + 1} - Product ${product.id} (${product.name}):`, {
        hasImageUrlSmall: !!product.image_url_small,
        imageUrl: imageUrl,
        isPlaceholder: imageUrl === './images/placeholder-flower.svg'
      })

      return `
    <div class="carousel-slide ${index === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}" data-slide="${index}" data-product-id="${product.id}">
      <div class="h-full flex items-center justify-center p-4 md:p-6">
        <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <!-- Product Image -->
          <div class="flex justify-center p-3">
            <img
              src="${imageUrl}"
              alt="${product.name}"
              class="carousel-product-image w-[280px] h-[280px] object-cover rounded-lg shadow-lg"
              data-fallback="./images/placeholder-flower.svg"
              loading="${index === 0 ? 'eager' : 'lazy'}"
              decoding="async"
              fetchpriority="${index === 0 ? 'high' : 'auto'}"
            />
          </div>
          <!-- Product Info -->
          <div class="text-center md:text-left">
            <h4 class="text-2xl font-bold text-gray-900 mb-3">${product.name}</h4>
            <p class="text-gray-600 mb-4">${description}</p>
            <p class="text-3xl font-bold text-pink-600 mb-6">$${price.toFixed(2)}</p>
            
            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button 
                class="btn btn-primary btn-lg carousel-add-to-cart"
                data-product-id="${product.id}"
                data-product-name="${product.name}"
                data-product-price="${price}"
                data-product-image="${imageUrl}"
              >
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Agregar al Carrito
                </span>
              </button>
              
              <button 
                class="btn btn-secondary btn-lg carousel-quick-buy"
                data-product-id="${product.id}"
                data-product-name="${product.name}"
                data-product-price="${price}"
                data-product-image="${imageUrl}"
              >
                <span class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  Compra Rápida
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
    })
    .join('')

  // Inject HTML
  carouselSlides.innerHTML = slidesHTML

  // Get all slides and create enhanced indicators
  const slides = carouselSlides.querySelectorAll('.carousel-slide')

  // Create enhanced indicators (Modelo 5 - Stanford Research)
  createCarouselIndicators(featuredProducts.length)

  // Function to show specific slide (Enhanced)
  function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
      slide.classList.remove('opacity-100')
      slide.classList.add('opacity-0')
    })

    // Show current slide with enhanced transition
    slides[index].classList.remove('opacity-0')
    slides[index].classList.add('opacity-100')

    currentSlide = index

    // Update progress bar and indicators
    updateProgressBar(index)

    // Enhanced haptic feedback for touch devices
    if ('vibrate' in navigator && 'ontouchstart' in window) {
      navigator.vibrate(50) // Light haptic feedback
    }
  }

  // Expose showSlide function globally for indicator clicks
  window.carouselShowSlide = showSlide

  // Next slide
  function nextSlide() {
    const nextIndex = (currentSlide + 1) % featuredProducts.length
    showSlide(nextIndex)
  }

  // Previous slide
  function prevSlide() {
    const prevIndex = (currentSlide - 1 + featuredProducts.length) % featuredProducts.length
    showSlide(prevIndex)
  }

  // Enhanced Event listeners
  prevBtn.addEventListener('click', () => {
    prevSlide()
    // Enhanced haptic feedback
    if ('vibrate' in navigator && 'ontouchstart' in window) {
      navigator.vibrate([30, 10, 30])
    }
  })

  nextBtn.addEventListener('click', () => {
    nextSlide()
    // Enhanced haptic feedback
    if ('vibrate' in navigator && 'ontouchstart' in window) {
      navigator.vibrate([30, 10, 30])
    }
  })

  // Keyboard navigation (WCAG 2.1 AAA compliance)
  carouselSlides.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        prevSlide()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextSlide()
        break
      case 'Home':
        e.preventDefault()
        showSlide(0)
        break
      case 'End':
        e.preventDefault()
        showSlide(featuredProducts.length - 1)
        break
    }
  })

  // Touch gesture support (Modelo 5 - Stanford Research)
  let touchStartX = 0
  let touchEndX = 0
  let isDragging = false

  carouselSlides.addEventListener(
    'touchstart',
    e => {
      touchStartX = e.changedTouches[0].screenX
      isDragging = true
    },
    { passive: true }
  )

  carouselSlides.addEventListener(
    'touchmove',
    e => {
      if (!isDragging) {
        return
      }
      touchEndX = e.changedTouches[0].screenX
    },
    { passive: true }
  )

  carouselSlides.addEventListener(
    'touchend',
    () => {
      if (!isDragging) {
        return
      }
      isDragging = false

      const swipeDistance = touchStartX - touchEndX
      const minSwipeDistance = 50

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe left - next slide
          nextSlide()
          if ('vibrate' in navigator) {
            navigator.vibrate(40)
          }
        } else {
          // Swipe right - previous slide
          prevSlide()
          if ('vibrate' in navigator) {
            navigator.vibrate(40)
          }
        }
      }
    },
    { passive: true }
  )

  // Make carousel accessible
  carouselSlides.setAttribute('tabindex', '0')
  carouselSlides.setAttribute('role', 'group')
  carouselSlides.setAttribute('aria-roledescription', 'carousel')

  // Initialize progress bar for first slide
  updateProgressBar(0)

  // Image error handling (CSP-compliant)
  const productImages = carouselSlides.querySelectorAll('.carousel-product-image')
  productImages.forEach(img => {
    img.addEventListener('error', function () {
      const fallback = this.getAttribute('data-fallback')
      if (fallback && this.src !== fallback) {
        console.warn('⚠️ Image failed to load:', this.src, '→ Using fallback')
        this.src = fallback
      }
    })
  })

  // Cart functionality - Attach event listeners to carousel buttons
  const addToCartButtons = carouselSlides.querySelectorAll('.carousel-add-to-cart')
  const quickBuyButtons = carouselSlides.querySelectorAll('.carousel-quick-buy')

  addToCartButtons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault()
      e.stopPropagation()

      const productId = parseInt(button.getAttribute('data-product-id'), 10)
      const productName = button.getAttribute('data-product-name')
      const productPrice = parseFloat(button.getAttribute('data-product-price'))
      const productImage = button.getAttribute('data-product-image')

      try {
        // Import cart module dynamically
        const { addToCart } = await import('./js/shared/cart.js')

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price_usd: productPrice,
          image_url_small: productImage,
          quantity: 1
        }

        // Add to cart
        addToCart(product)

        // Show success message
        showCartMessage('✅ ¡Producto agregado al carrito!', 'success')

        // Update button state temporarily
        const originalText = button.innerHTML
        button.innerHTML =
          '<span class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Agregado</span>'
        button.classList.add('bg-green-600', 'hover:bg-green-700')
        button.classList.remove('bg-pink-600', 'hover:bg-pink-700')

        // Reset button after 2 seconds
        setTimeout(() => {
          button.innerHTML = originalText
          button.classList.remove('bg-green-600', 'hover:bg-green-700')
          button.classList.add('bg-pink-600', 'hover:bg-pink-700')
        }, 2000)
      } catch (error) {
        console.error('Error adding to cart:', error)
        showCartMessage('❌ Error al agregar al carrito', 'error')
      }
    })
  })

  quickBuyButtons.forEach(button => {
    button.addEventListener('click', async e => {
      e.preventDefault()
      e.stopPropagation()

      const productId = parseInt(button.getAttribute('data-product-id'), 10)
      const productName = button.getAttribute('data-product-name')
      const productPrice = parseFloat(button.getAttribute('data-product-price'))
      const productImage = button.getAttribute('data-product-image')

      try {
        // Import cart module dynamically
        const { addToCart } = await import('./js/shared/cart.js')

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price_usd: productPrice,
          image_url_small: productImage,
          quantity: 1
        }

        // Add to cart
        addToCart(product)

        // Show success message
        showCartMessage('✅ ¡Producto agregado! Redirigiendo al checkout...', 'success')

        // Redirect to checkout after 1.5 seconds
        setTimeout(() => {
          window.location.href = '/pages/payment.html'
        }, 1500)
      } catch (error) {
        console.error('Error with quick buy:', error)
        showCartMessage('❌ Error al procesar la compra', 'error')
      }
    })
  })

  // Enhanced Auto-advance with user interaction respect
  let autoAdvanceTimer = null
  let isUserInteracting = false
  let lastTime = 0

  const startAutoAdvance = () => {
    if (autoAdvanceTimer) {
      return
    }

    const autoAdvance = timestamp => {
      if (!lastTime) {
        lastTime = timestamp
      }
      const elapsed = timestamp - lastTime

      if (elapsed >= 6000 && !isUserInteracting) {
        // Increased to 6s for better UX
        nextSlide()
        lastTime = timestamp
      }

      if (!isUserInteracting) {
        autoAdvanceTimer = requestAnimationFrame(autoAdvance)
      }
    }

    autoAdvanceTimer = requestAnimationFrame(autoAdvance)
  }

  const stopAutoAdvance = () => {
    if (autoAdvanceTimer) {
      cancelAnimationFrame(autoAdvanceTimer)
      autoAdvanceTimer = null
      lastTime = 0
    }
  }

  // User interaction detection
  const carouselElement = document.getElementById('featuredCarousel')
  if (carouselElement) {
    // Pause auto-advance on hover
    carouselElement.addEventListener('mouseenter', () => {
      isUserInteracting = true
      stopAutoAdvance()
    })

    carouselElement.addEventListener('mouseleave', () => {
      isUserInteracting = false
      startAutoAdvance()
    })

    // Pause auto-advance on touch start
    carouselElement.addEventListener(
      'touchstart',
      () => {
        isUserInteracting = true
        stopAutoAdvance()
      },
      { passive: true }
    )

    carouselElement.addEventListener(
      'touchend',
      () => {
        setTimeout(() => {
          isUserInteracting = false
          startAutoAdvance()
        }, 3000) // Resume after 3 seconds
      },
      { passive: true }
    )

    // Pause when page is not visible (Page Visibility API)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isUserInteracting = true
        stopAutoAdvance()
      } else {
        isUserInteracting = false
        startAutoAdvance()
      }
    })

    // Start auto-advance only when page is visible and carousel is in viewport
    if ('IntersectionObserver' in window) {
      const carouselObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !document.hidden && !isUserInteracting) {
              startAutoAdvance()
            } else {
              stopAutoAdvance()
            }
          })
        },
        { threshold: 0.3 } // Increased threshold for better detection
      )

      carouselObserver.observe(carouselElement)
    } else {
      // Fallback for older browsers
      startAutoAdvance()
    }
  }
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000' // ← Constante para API calls

/**
 * Initialize Featured Products Grid
 */
let currentPage = 1
const PRODUCTS_PER_PAGE = 16 // 4x4 grid
let pullToRefreshInstance = null
let isLoading = false // ← Variable faltante para control de estado de carga

async function initProductsGrid() {
  // Initialize Model 4 filters first (before loading products)
  await initEnhancedFilters()

  // Add a small delay to ensure DOM is fully ready and API server is responsive
  await new Promise(resolve => setTimeout(resolve, 100))

  // Load products with retry logic (without scrolling on initial load)
  window.isInitialPageLoad = true
  await loadProductsWithFilters(currentPage)
  window.isInitialPageLoad = false

  // Initialize pull-to-refresh on the products container
  initPullToRefresh()

  // Search, occasion, and sort functionality - handled in initEnhancedFilters
  // These filters are properly implemented there with global state management
}

/**
 * Initialize pull-to-refresh functionality
 */
async function initPullToRefresh() {
  const productsContainer = document.getElementById('productos')

  if (!productsContainer) {
    console.warn('PullToRefresh: Products container not found')
    return
  }

  try {
    // Import PullToRefresh module dynamically
    const pullToRefreshModule = await import('./js/components/pullToRefresh.js')
    const { PullToRefresh } = pullToRefreshModule

    pullToRefreshInstance = new PullToRefresh({
      container: productsContainer,
      threshold: 80,
      maxPull: 120,
      hapticFeedback: true,
      respectReducedMotion: true,
      onRefresh: async () => {
        console.log('PullToRefresh: Refreshing products...')

        // Reset to first page and reload products
        currentPage = 1
        await loadProducts(currentPage)

        // Show success message
        showToast('Products updated successfully!', 'success')
      }
    })

    console.log('✅ PullToRefresh: Initialized successfully')
  } catch (error) {
    console.error('❌ PullToRefresh: Initialization failed', error)
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
  // Simple toast implementation - can be replaced with a more sophisticated toast system
  const toast = document.createElement('div')
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 transform transition-all duration-300 translate-y-full`

  // Set background color based on type
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10b981'
      break
    case 'error':
      toast.style.backgroundColor = '#ef4444'
      break
    default:
      toast.style.backgroundColor = '#3b82f6'
  }

  toast.textContent = message
  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-full')
    toast.classList.add('translate-y-0')
  }, 10)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-full')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

/**
 * Get emoji for occasion
 */
function getOccasionEmoji(slug) {
  const emojiMap = {
    cumpleanos: '🎂',
    aniversario: '💕',
    'dia-de-la-madre': '👩',
    'san-valentin': '💖',
    boda: '💒',
    graduacion: '🎓',
    felicidades: '🎉',
    'dia-del-padre': '👨',
    navidad: '🎄',
    agradecimiento: '🙏'
  }
  return emojiMap[slug] || '🌸'
}

/**
 * Load occasions from API and populate filter buttons
 */
async function loadOccasionsFilter() {
  console.log('[DEBUG] loadOccasionsFilter() called')
  const quickFilters = document.getElementById('quickFilters')
  const occasionFilter = document.getElementById('occasionFilter')
  if (!quickFilters) {
    console.error('[DEBUG] #quickFilters element not found!')
    return
  }
  console.log('[DEBUG] #quickFilters found:', quickFilters)

  let occasions = []
  let isApiSuccess = false

  try {
    // Try to load from API
    const { api } = await import('./js/shared/api-client.js')
    console.log('[DEBUG] API module imported')
    const result = await api.getAllOccasions()
    console.log('[DEBUG] API result:', result)

    if (result.success && result.data && result.data.length > 0) {
      occasions = result.data
      isApiSuccess = true
      console.log(`✅ [DEBUG] Loaded ${occasions.length} occasions from API`)
    } else {
      console.warn('⚠️ [DEBUG] API returned no valid data, using fallback')
    }
  } catch (error) {
    console.error('❌ [DEBUG] API call failed:', error.message)

    // Mostrar notificación amigable al usuario
    showCartMessage(
      '⚠️ No se pudieron cargar los filtros de ocasiones. Usando opciones básicas.',
      'info'
    )

    // Usar fallback de ocasiones básicas para no romper la funcionalidad
    occasions = [
      { id: 1, name: 'Amor', slug: 'amor', active: true },
      { id: 2, name: 'Cumpleaños', slug: 'cumpleanos', active: true },
      { id: 3, name: 'Aniversario', slug: 'aniversario', active: true },
      { id: 4, name: 'Gracias', slug: 'gracias', active: true }
    ]
    isApiSuccess = true // Consideramos exitoso el fallback
    console.log('🔄 [DEBUG] Using fallback occasions data')
  }

  // Verify we have data
  if (!isApiSuccess || occasions.length === 0) {
    console.error('❌ [CRITICAL] No occasions data available')

    // Mostrar error crítico al usuario
    showCartMessage(
      '❌ Error crítico: No hay filtros disponibles. Por favor recarga la página.',
      'error'
    )

    // Deshabilitar filtros y mostrar mensaje
    quickFilters.innerHTML = `
      <div class="text-center py-4 px-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 font-medium">No se pueden cargar los filtros en este momento.</p>
        <button onclick="location.reload()" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
          Recargar página
        </button>
      </div>
    `
    return
  }

  console.log(`[DEBUG] Processing ${occasions.length} occasions for buttons`)

  // Remove any existing occasion filter buttons (except "Todos")
  const existingButtons = quickFilters.querySelectorAll('.model-4-filter[data-occasion]')
  existingButtons.forEach(btn => btn.remove())
  console.log(`[DEBUG] Removed ${existingButtons.length} existing occasion buttons`)

  // Add dynamic occasion filter buttons after "Todos"
  const todosButton = document.getElementById('filter-all')
  let buttonCount = 0

  occasions.forEach(occasion => {
    // Only show active occasions
    if (!occasion.active) {
      return
    }

    // Filter out test/development data and unauthorized occasions
    const isTestData =
      occasion.slug.includes('test_') ||
      occasion.slug.includes('status-test-occasion-') ||
      occasion.name.includes('Test') ||
      occasion.slug.includes('unauthorized')

    if (isTestData) {
      console.log(`[DEBUG] Skipping test data: ${occasion.name}`)
      return
    }

    const button = document.createElement('button')
    button.className =
      'model-4-filter px-4 py-2.5 bg-white/80 backdrop-blur-sm text-slate-700 text-sm font-semibold rounded-xl whitespace-nowrap transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-pink-100 hover:to-violet-100 hover:shadow-md active:scale-95 border-2 border-pink-200/60 hover:border-pink-300'
    button.setAttribute('data-filter', occasion.slug)
    button.setAttribute('data-occasion', occasion.slug)
    button.textContent = `${getOccasionEmoji(occasion.slug)} ${occasion.name}`
    button.id = `filter-${occasion.slug}`

    // Mejorar accesibilidad con atributos ARIA
    button.setAttribute('role', 'button')
    button.setAttribute('aria-pressed', 'false')
    button.setAttribute('aria-describedby', `filter-${occasion.slug}-desc`)

    // Crear descripción para screen readers
    const descSpan = document.createElement('span')
    descSpan.id = `filter-${occasion.slug}-desc`
    descSpan.className = 'sr-only'
    descSpan.textContent = `Filtrar productos por ocasión: ${occasion.name}`

    // Add keyboard event listener for accessibility
    button.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        console.log(
          `[DEBUG] Occasion button activated via keyboard: ${occasion.name} (${occasion.slug})`
        )
        handleOccasionFilterClick(e, occasion.slug)
      }
    })

    // Add click event listener
    button.addEventListener('click', e => {
      console.log(`[DEBUG] Occasion button clicked: ${occasion.name} (${occasion.slug})`)
      handleOccasionFilterClick(e, occasion.slug)
    })

    // Insert after "Todos" button
    if (todosButton) {
      todosButton.insertAdjacentElement('afterend', button)
      todosButton.insertAdjacentElement('afterend', descSpan)
    } else {
      quickFilters.appendChild(button)
      quickFilters.appendChild(descSpan)
    }
    buttonCount++
    console.log(`[DEBUG] Created button: ${occasion.name} (${occasion.slug})`)
  })

  // Also update the hidden dropdown for backend compatibility
  if (occasionFilter) {
    occasionFilter.innerHTML = '<option value="">Todas las ocasiones</option>'
    occasions.forEach(occasion => {
      if (occasion.active) {
        // Filter out test data
        const isTestData =
          occasion.slug.includes('test_') ||
          occasion.slug.includes('status-test-occasion-') ||
          occasion.name.includes('Test') ||
          occasion.slug.includes('unauthorized')

        if (!isTestData) {
          const option = document.createElement('option')
          option.value = occasion.slug
          option.textContent = occasion.name
          occasionFilter.appendChild(option)
        }
      }
    })
  }

  console.log(`✅ [DEBUG] Created ${buttonCount} occasion filter buttons`)
}

/**
 * Handle occasion filter button click
 */
function handleOccasionFilterClick(event, occasionSlug) {
  console.log(`[DEBUG] handleOccasionFilterClick called with: ${occasionSlug}`)

  // Update active state
  const filterTags = document.querySelectorAll('.model-4-filter')
  console.log(`[DEBUG] Found ${filterTags.length} filter buttons to process`)

  // Remove 'active' from ALL buttons
  filterTags.forEach((tag, _index) => {
    tag.classList.remove('active')
    // Actualizar estado ARIA para todos los botones
    tag.setAttribute('aria-pressed', 'false')
  })

  // DEBUG: Check state immediately after removing 'active'
  const afterRemove = document.querySelectorAll('.model-4-filter.active')
  console.log(`[DEBUG] After remove 'active': ${afterRemove.length} buttons still have 'active'`)
  if (afterRemove.length > 0) {
    afterRemove.forEach(btn => {
      console.log(`[DEBUG] Still active: ${btn.id}`)
    })
  }

  event.currentTarget.classList.add('active')
  // Actualizar estado ARIA para el botón activo
  event.currentTarget.setAttribute('aria-pressed', 'true')

  // Verify only one button is active
  const activeButtons = document.querySelectorAll('.model-4-filter.active')
  console.log(`[DEBUG] After update: ${activeButtons.length} button(s) with 'active' class`)
  if (activeButtons.length > 1) {
    console.warn(`[WARN] Multiple buttons are active! This should not happen.`)
  }

  // Update global filter state
  window.currentFilters.occasion = occasionSlug

  console.log(`[DEBUG] Updated filters:`, window.currentFilters)

  // Reload products with new filter
  currentPage = 1
  loadProductsWithFilters(currentPage)

  // Enhanced haptic feedback
  if ('vibrate' in navigator && 'ontouchstart' in window) {
    navigator.vibrate([20, 10])
  }

  log.debug(`Occasion filter applied: ${occasionSlug}`)
}

async function loadProducts(page = 1) {
  const productsContainer = document.getElementById('productsContainer')
  const paginationContainer = document.getElementById('pagination')

  if (!productsContainer) {
    return
  }

  // Show loading state
  productsContainer.innerHTML = `
    <div class="col-span-full text-center py-12">
      <p class="text-gray-500">Cargando productos...</p>
    </div>
  `

  try {
    console.log('🔍 [DEBUG] Starting products grid fetch...')
    console.log('🔍 [DEBUG] API Base URL:', API_BASE_URL)

    // Build query params
    const offset = (page - 1) * PRODUCTS_PER_PAGE
    const searchInput = document.getElementById('searchInput')
    const occasionFilter = document.getElementById('occasionFilter')
    const sortFilter = document.getElementById('sortFilter')

    const params = {
      limit: PRODUCTS_PER_PAGE,
      offset: offset,
      imageSize: 'small' // Request optimized images
    }

    if (searchInput?.value) {
      params.search = searchInput.value
    }

    if (occasionFilter?.value) {
      params.occasion = occasionFilter.value
    }

    if (sortFilter?.value) {
      params.sortBy = sortFilter.value
    }

    console.log('🔍 [DEBUG] Products API Request params:', params)

    // Import API module dynamically
    const { api } = await import('./js/shared/api-client.js')
    const result = await api.getAllProducts(params)

    console.log('📦 [DEBUG] Products API Response:', {
      success: result.success,
      totalProducts: result.data?.length || 0,
      page: page,
      firstProduct: result.data?.[0],
      fullResponse: result
    })

    if (!result.success || !result.data || result.data.length === 0) {
      console.error('❌ [DEBUG] No products found in response')
      productsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      `
      return
    }

    console.log('✅ [DEBUG] Products grid loaded successfully:', result.data.length)

    // Render products with enhanced hybrid model (1 + 5)
    productsContainer.innerHTML = result.data
      .map(product => {
        const price = product.price_usd || 0
        const description = product.summary || product.description || 'Hermoso arreglo floral'
        const isBestseller = Math.random() > 0.7 // Simulate bestselling for demo
        const hasDiscount = Math.random() > 0.8 // Simulate discount for demo
        const discountPercentage = hasDiscount ? Math.floor(Math.random() * 30 + 10) : 0
        const originalPrice = hasDiscount ? price * (1 + discountPercentage / 100) : null
        const rating = (Math.random() * 1.5 + 3.5).toFixed(1) // 3.5-5.0 rating
        const reviewCount = Math.floor(Math.random() * 500 + 50) // 50-550 reviews

        return `

          <div class="group relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-500 reveal-on-scroll" data-product-id="${product.id}">
            
            <!-- Image Container -->
            <div class="relative aspect-[4/5] overflow-hidden bg-slate-100" data-carousel-container data-product-id="${product.id}">
              <img
                src="${product.image_url_small || './images/placeholder-flower.svg'}"
                alt="${product.name}"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              <!-- Overlay Gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <!-- Badges -->
              <div class="absolute top-4 left-4 flex flex-col gap-2">
                ${isBestseller ? '<span class="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold text-rose-600 rounded-full shadow-sm">Más Vendido</span>' : ''}
                ${hasDiscount ? `<span class="px-3 py-1 bg-rose-500 text-xs font-bold text-white rounded-full shadow-sm">-${discountPercentage}% OFF</span>` : ''}
              </div>

              <!-- Quick Actions (Reveal on Hover) -->
              <div class="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button 
                  class="btn-magnetic flex-1 bg-white text-slate-900 font-bold py-3 rounded-xl shadow-lg hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center gap-2 add-to-cart-btn"
                  data-product-id="${product.id}"
                  data-product-name="${product.name}"
                  data-product-price="${price}"
                  data-product-image="${product.image_url_small}"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <!-- Wishlist Button -->
              <button
                class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-700 hover:text-rose-500 hover:bg-white transition-all duration-300 btn-magnetic"
                aria-label="Agregar a favoritos"
                data-wishlist-product-id="${product.id}">
                <span class="text-lg">🤍</span>
              </button>

              <!-- Carousel will be initialized here -->
            </div>

            <!-- Content Area -->
            <div class="p-6">
              <!-- Title -->
              <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-pink-700 transition-colors duration-200">
                ${product.name}
              </h3>

              <!-- Description -->
              <p class="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                ${description}
              </p>

              <!-- Rating and Trust Signals -->
              <div class="flex items-center gap-2 mb-3">
                <div class="flex items-center gap-1">
                  ${Array(5)
                    .fill(0)
                    .map(
                      (_, i) => `
                    <span class="text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}">★</span>
                  `
                    )
                    .join('')}
                </div>
                <span class="text-xs text-gray-500 font-medium">${rating} (${reviewCount})</span>
              </div>

              <!-- Price Section -->
              <div class="mb-4">
                ${
                  originalPrice
                    ? `
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-2xl font-bold text-pink-600">$${price.toFixed(2)}</span>
                    <span class="text-lg text-gray-400 line-through">$${originalPrice.toFixed(2)}</span>
                  </div>
                `
                    : `
                  <span class="text-2xl font-bold text-pink-600">$${price.toFixed(2)}</span>
                `
                }
              </div>

              <!-- Action Buttons (Enhanced CTA) -->
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <button
                    class="add-to-cart-btn bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-pink-500/30 flex items-center justify-center gap-2"
                    type="button"
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-price="${price}"
                    data-action="add-to-cart"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span>Agregar</span>
                  </button>

                  <button
                    class="buy-now-btn bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-green-500/30 flex items-center justify-center gap-2"
                    type="button"
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-price="${price}"
                    data-action="buy-now"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <span>Comprar</span>
                  </button>
                </div>

                <!-- Quick View Button -->
                <button
                  class="quick-view-btn w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 group"
                  type="button"
                  data-product-id="${product.id}"
                  data-action="quick-view"
                >
                  <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span>Vista Rápida</span>
                </button>
              </div>
            </div>
          </div>
        `
      })
      .join('')

    // Initialize hover-activated carousels for each product card
    const carouselContainers = productsContainer.querySelectorAll('[data-carousel-container]')
    carouselContainers.forEach(async container => {
      const productId = parseInt(container.getAttribute('data-product-id'), 10)
      if (productId) {
        // Import createImageCarousel module dynamically
        const { createImageCarousel } = await import('./js/components/imageCarousel.js')
        await createImageCarousel(container, productId)
      }
    })

    // Icons are now static SVG - no need to reinitialize

    // Add click handlers for quick-view buttons (eye icon)
    addQuickViewHandlers()

    // Add click handlers for cart buttons
    addCartButtonHandlers()

    // Add click handlers for product images (navigate to detail)
    addProductImageHandlers()

    // Add click handlers for buy now buttons
    addBuyNowHandlers()

    // Add click handlers for wishlist buttons
    addWishlistHandlers()

    // Initialize touch feedback for product cards
    initProductCardTouchFeedback()

    // Render pagination
    if (paginationContainer) {
      const hasMore = result.data.length === PRODUCTS_PER_PAGE
      renderPagination(paginationContainer, page, hasMore)
    }
  } catch (error) {
    console.error('❌ Failed to load products:', error)
    productsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-500 text-lg">Error al cargar productos</p>
      </div>
    `
  }
}

function renderPagination(container, currentPage, hasMore) {
  const prevDisabled = currentPage === 1
  const maxPage = Math.ceil(currentPage + (hasMore ? 1 : 0))

  let paginationHTML = `
    <button
      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
        prevDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }"
      type="button"
      ${prevDisabled ? 'disabled' : ''}
      aria-label="Página anterior"
      data-page="${currentPage - 1}"
    >
      <i data-lucide="chevron-left" class="h-4 w-4"></i>
    </button>
  `

  // Show current page and nearby pages
  const startPage = Math.max(1, currentPage - 1)
  const endPage = Math.min(maxPage, currentPage + 1)

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button
        class="px-4 py-2 ${
          i === currentPage ? 'bg-pink-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
        } rounded-lg font-semibold transition-colors"
        type="button"
        aria-label="Página ${i}"
        ${i === currentPage ? 'aria-current="page"' : ''}
        data-page="${i}"
      >
        ${i}
      </button>
    `
  }

  paginationHTML += `
    <button
      class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
        !hasMore ? 'opacity-50 cursor-not-allowed' : ''
      }"
      type="button"
      ${!hasMore ? 'disabled' : ''}
      aria-label="Página siguiente"
      data-page="${currentPage + 1}"
    >
      <i data-lucide="chevron-right" class="h-4 w-4"></i>
    </button>
  `

  container.innerHTML = paginationHTML

  // Add click handlers
  container.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.getAttribute('data-page'))
      if (!isNaN(page) && page > 0) {
        currentPage = page
        loadProducts(currentPage)
        // Scroll to products section
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })

  // Icons are now static SVG - no need to reinitialize
}

/**
 * Add click handlers for quick-view buttons (eye icon)
 */
function addQuickViewHandlers() {
  // Remove existing listeners to prevent duplicates
  const existingQuickViewBtns = document.querySelectorAll(
    '.quick-view-btn[data-action="quick-view"]'
  )
  existingQuickViewBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.quickView.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.quickView.delete(btn)
    }
  })

  // Add new listeners
  const quickViewBtns = document.querySelectorAll('.quick-view-btn[data-action="quick-view"]')

  quickViewBtns.forEach(btn => {
    const handler = e => {
      e.preventDefault()
      const productId = btn.getAttribute('data-product-id')

      if (!productId) {
        console.error('Quick view: missing product ID')
        return
      }

      // Navigate to product detail page
      window.location.href = `/pages/product-detail.html?id=${productId}`
    }

    btn.addEventListener('click', handler)
    eventListenerTracker.quickView.set(btn, handler)
  })
}

/**
 * Add click handlers for cart buttons (shopping cart icon) - Enhanced
 */
function addCartButtonHandlers() {
  // Remove existing listeners to prevent duplicates
  const existingCartBtns = document.querySelectorAll(
    '.add-to-cart-btn[data-action="add-to-cart"], .model-4-cart[data-action="add-to-cart"]'
  )

  existingCartBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.cart.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.cart.delete(btn)
    }
  })

  // Add new listeners
  const cartBtns = document.querySelectorAll(
    '.add-to-cart-btn[data-action="add-to-cart"], .model-4-cart[data-action="add-to-cart"]'
  )

  cartBtns.forEach(btn => {
    const handler = async e => {
      e.preventDefault()
      const productId = parseInt(btn.getAttribute('data-product-id'), 10)

      if (!productId) {
        console.error('Add to cart: missing or invalid product ID')
        return
      }

      try {
        // Get product data from enhanced button attributes
        const productName = btn.getAttribute('data-product-name')
        const productPrice = parseFloat(btn.getAttribute('data-product-price'))

        if (!productName || !productPrice) {
          console.error('Add to cart: missing product data in button attributes')
          return
        }

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price_usd: productPrice,
          image_url_small: '/images/placeholder-flower.svg' // Default placeholder
        }

        // Add to cart
        const { addToCart } = await import('./js/shared/cart.js')
        await addToCart(product, 1)

        // Show success message
        if (typeof showCartMessage === 'function') {
          showCartMessage('✅ ¡Producto agregado al carrito!', 'success')
        }

        // Trigger success feedback on the button
        if (btn._touchFeedback) {
          btn._touchFeedback.triggerFeedback('success')
        }

        // Enhanced visual feedback
        const originalHTML = btn.innerHTML
        btn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Agregado</span>
        `
        btn.classList.add('bg-green-600', 'hover:bg-green-700')
        btn.classList.remove('bg-pink-600', 'hover:bg-pink-700')

        // Reset button after 2 seconds
        setTimeout(() => {
          btn.innerHTML = originalHTML
          btn.classList.remove('bg-green-600', 'hover:bg-green-700')
          btn.classList.add('bg-pink-600', 'hover:bg-pink-700')
        }, 2000)

        // Enhanced haptic feedback
        if ('vibrate' in navigator && 'ontouchstart' in window) {
          navigator.vibrate([40, 20, 40])
        }
      } catch (error) {
        console.error('Failed to add product to cart:', error)
        // Show error message
        if (typeof showCartMessage === 'function') {
          showCartMessage('❌ Error al agregar al carrito', 'error')
        }
      }
    }

    btn.addEventListener('click', handler)
    eventListenerTracker.cart.set(btn, handler)
  })
}

/**
 * Add click handlers for product images (navigate to detail page)
 */
function addProductImageHandlers() {
  const productCards = document.querySelectorAll('.product-card')

  productCards.forEach(card => {
    // Find the carousel container which contains the images
    const carouselContainer = card.querySelector('[data-carousel-container]')
    if (!carouselContainer) {
      return
    }

    const productId = carouselContainer.getAttribute('data-product-id')
    if (!productId) {
      return
    }

    // Remove existing listener to prevent duplicates
    const existingHandler = eventListenerTracker.productImage.get(carouselContainer)
    if (existingHandler) {
      carouselContainer.removeEventListener('click', existingHandler)
      eventListenerTracker.productImage.delete(carouselContainer)
    }

    // Add new click handler
    const handler = e => {
      // Only handle clicks on images, not on other elements
      if (e.target.tagName.toLowerCase() === 'img') {
        e.preventDefault()
        // Navigate to product detail page
        window.location.href = `/pages/product-detail.html?id=${productId}`
      }
    }

    carouselContainer.addEventListener('click', handler)
    eventListenerTracker.productImage.set(carouselContainer, handler)

    // Make images look clickable
    const images = carouselContainer.querySelectorAll('img')
    images.forEach(img => {
      img.style.cursor = 'pointer'
      img.title = 'Ver detalles del producto'
    })
  })
}

/**
 * Add click handlers for buy now buttons (zap icon)
 */
function addBuyNowHandlers() {
  // Remove existing listeners to prevent duplicates
  const existingBuyNowBtns = document.querySelectorAll(
    '.buy-now-btn[data-action="buy-now"], .model-4-buy[data-action="buy-now"]'
  )

  existingBuyNowBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.buyNow.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.buyNow.delete(btn)
    }
  })

  // Add new listeners
  const buyNowBtns = document.querySelectorAll(
    '.buy-now-btn[data-action="buy-now"], .model-4-buy[data-action="buy-now"]'
  )

  buyNowBtns.forEach(btn => {
    const handler = async e => {
      e.preventDefault()
      const productId = parseInt(btn.getAttribute('data-product-id'), 10)

      if (!productId) {
        console.error('Buy now: missing or invalid product ID')
        return
      }

      try {
        // Get product data from the button attributes (enhanced)
        const productName = btn.getAttribute('data-product-name')
        const productPrice = parseFloat(btn.getAttribute('data-product-price'))

        if (!productName || !productPrice) {
          console.error('Buy now: missing product data in button attributes')
          return
        }

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price_usd: productPrice,
          image_url_small: '/images/placeholder-flower.svg' // Default placeholder
        }

        // Add to cart
        const { addToCart } = await import('./js/shared/cart.js')
        await addToCart(product, 1)

        // Trigger success feedback on the button
        if (btn._touchFeedback) {
          btn._touchFeedback.triggerFeedback('success')
        }

        // Visual feedback (fallback)
        btn.style.transform = 'scale(0.95)'
        setTimeout(() => {
          btn.style.transform = 'scale(1)'
        }, 150)

        // Redirect to payment page immediately
        setTimeout(() => {
          window.location.href = '/pages/payment.html'
        }, 200)
      } catch (error) {
        console.error('Failed to buy now:', error)
        // Could show error toast here
      }
    }

    btn.addEventListener('click', handler)
    eventListenerTracker.buyNow.set(btn, handler)
  })
}

/**
 * Add click handlers for wishlist buttons (heart icon)
 */
function addWishlistHandlers() {
  // Remove existing listeners to prevent duplicates
  const existingWishlistBtns = document.querySelectorAll('[data-wishlist-product-id]')

  existingWishlistBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.wishlist.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.wishlist.delete(btn)
    }
  })

  // Add new listeners
  const wishlistBtns = document.querySelectorAll('[data-wishlist-product-id]')

  wishlistBtns.forEach(btn => {
    const handler = e => {
      e.preventDefault()
      e.stopPropagation()

      const productId = parseInt(btn.getAttribute('data-wishlist-product-id'), 10)
      const heartIcon = btn.querySelector('span')
      const isLiked = heartIcon.textContent === '❤️'

      try {
        // Toggle wishlist state (for now, just visual feedback)
        if (isLiked) {
          heartIcon.textContent = '🤍'
          btn.style.color = ''
          console.log(`Removed product ${productId} from wishlist`)
        } else {
          heartIcon.textContent = '❤️'
          btn.style.color = '#ec4899'
          console.log(`Added product ${productId} to wishlist`)

          // Enhanced haptic feedback for wishlist
          if ('vibrate' in navigator && 'ontouchstart' in window) {
            navigator.vibrate([50, 30, 50])
          }
        }

        // Visual feedback animation
        btn.style.transform = 'scale(1.3) rotate(15deg)'
        setTimeout(() => {
          btn.style.transform = 'scale(1) rotate(0deg)'
        }, 300)

        // TODO: Implement actual wishlist API call
        // const { toggleWishlist } = await import('./js/shared/wishlist.js')
        // await toggleWishlist(productId)
      } catch (error) {
        console.error('Failed to toggle wishlist:', error)
        // Revert visual feedback on error
        heartIcon.textContent = isLiked ? '❤️' : '🤍'
      }
    }

    btn.addEventListener('click', handler)
    eventListenerTracker.wishlist.set(btn, handler)
  })
}

/**
 * Initialize touch feedback for product cards and their interactive elements
 */
async function initProductCardTouchFeedback() {
  // Clean up existing touch feedback instances first
  const existingInstances = eventListenerTracker.touchFeedbackInstances
  for (const instance of existingInstances) {
    if (instance.destroy) {
      instance.destroy()
    }
  }
  // Clear the set of tracked instances
  existingInstances.clear()

  // Import TouchFeedback module dynamically
  const { TouchFeedback } = await import('./js/shared/touchFeedback.js')

  // Initialize touch feedback for product cards
  const productCards = document.querySelectorAll('.product-card')
  productCards.forEach(card => {
    // Add scale feedback to entire card
    const cardFeedback = new TouchFeedback({
      type: 'scale',
      haptic: 'light',
      scale: 0.98,
      duration: 150
    })
    cardFeedback.init(card)
    eventListenerTracker.touchFeedbackInstances.add(cardFeedback)

    // Add ripple feedback to quick view buttons
    const quickViewBtn = card.querySelector('.quick-view-btn')
    if (quickViewBtn) {
      const quickViewFeedback = new TouchFeedback({
        type: 'ripple',
        haptic: 'light',
        color: 'rgba(156, 163, 175, 0.3)',
        duration: 300
      })
      quickViewFeedback.init(quickViewBtn)
      eventListenerTracker.touchFeedbackInstances.add(quickViewFeedback)
    }

    // Add ripple feedback to add to cart buttons
    const addToCartBtn = card.querySelector('.add-to-cart-btn')
    if (addToCartBtn) {
      const cartFeedback = new TouchFeedback({
        type: 'ripple',
        haptic: 'medium',
        color: 'rgba(236, 72, 153, 0.3)',
        duration: 300
      })
      cartFeedback.init(addToCartBtn)
      eventListenerTracker.touchFeedbackInstances.add(cartFeedback)
    }

    // Add ripple feedback to buy now buttons
    const buyNowBtn = card.querySelector('.buy-now-btn')
    if (buyNowBtn) {
      const buyNowFeedback = new TouchFeedback({
        type: 'ripple',
        haptic: 'medium',
        color: 'rgba(16, 185, 129, 0.3)',
        duration: 300
      })
      buyNowFeedback.init(buyNowBtn)
      eventListenerTracker.touchFeedbackInstances.add(buyNowFeedback)
    }

    // Add scale feedback to carousel container
    const carouselContainer = card.querySelector('[data-carousel-container]')
    if (carouselContainer) {
      const carouselFeedback = new TouchFeedback({
        type: 'scale',
        haptic: 'light',
        scale: 0.97,
        duration: 150
      })
      carouselFeedback.init(carouselContainer)
      eventListenerTracker.touchFeedbackInstances.add(carouselFeedback)
    }
  })

  // Initialize touch feedback for pagination buttons
  const paginationBtns = document.querySelectorAll('.pagination button')
  paginationBtns.forEach(btn => {
    const feedback = new TouchFeedback({
      type: 'scale',
      haptic: 'light',
      scale: 0.95,
      duration: 150
    })
    feedback.init(btn)
    eventListenerTracker.touchFeedbackInstances.add(feedback)
  })

  // Initialize touch feedback for filter and sort controls
  const searchInput = document.getElementById('searchInput')
  if (searchInput) {
    // Import TouchFeedback module dynamically
    const { TouchFeedback } = await import('./js/shared/touchFeedback.js')
    const feedback = new TouchFeedback({
      type: 'highlight',
      haptic: 'none',
      duration: 200
    })
    feedback.init(searchInput)
    eventListenerTracker.touchFeedbackInstances.add(feedback)
  }

  const occasionFilter = document.getElementById('occasionFilter')
  if (occasionFilter) {
    // Import TouchFeedback module dynamically
    const { TouchFeedback } = await import('./js/shared/touchFeedback.js')
    const feedback = new TouchFeedback({
      type: 'highlight',
      haptic: 'light',
      duration: 200
    })
    feedback.init(occasionFilter)
    eventListenerTracker.touchFeedbackInstances.add(feedback)
  }

  const sortFilter = document.getElementById('sortFilter')
  if (sortFilter) {
    // Import TouchFeedback module dynamically
    const { TouchFeedback } = await import('./js/shared/touchFeedback.js')
    const feedback = new TouchFeedback({
      type: 'highlight',
      haptic: 'light',
      duration: 200
    })
    feedback.init(sortFilter)
    eventListenerTracker.touchFeedbackInstances.add(feedback)
  }

  console.log('✅ Touch feedback initialized for product cards')
}

/**
 * Clean up all event listeners and resources to prevent memory leaks
 */
function cleanupEventListeners() {
  // Remove quick view handlers
  const existingQuickViewBtns = document.querySelectorAll(
    '.quick-view-btn[data-action="quick-view"]'
  )
  existingQuickViewBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.quickView.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.quickView.delete(btn)
    }
  })

  // Remove cart handlers
  const existingCartBtns = document.querySelectorAll(
    '.add-to-cart-btn[data-action="add-to-cart"], .model-4-cart[data-action="add-to-cart"]'
  )
  existingCartBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.cart.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.cart.delete(btn)
    }
  })

  // Remove buy now handlers
  const existingBuyNowBtns = document.querySelectorAll(
    '.buy-now-btn[data-action="buy-now"], .model-4-buy[data-action="buy-now"]'
  )
  existingBuyNowBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.buyNow.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.buyNow.delete(btn)
    }
  })

  // Remove wishlist handlers
  const existingWishlistBtns = document.querySelectorAll('[data-wishlist-product-id]')
  existingWishlistBtns.forEach(btn => {
    const existingHandler = eventListenerTracker.wishlist.get(btn)
    if (existingHandler) {
      btn.removeEventListener('click', existingHandler)
      eventListenerTracker.wishlist.delete(btn)
    }
  })

  // Clean up touch feedback instances
  const existingInstances = eventListenerTracker.touchFeedbackInstances
  for (const instance of existingInstances) {
    if (instance.destroy) {
      instance.destroy()
    }
  }
  existingInstances.clear()

  // Remove product image handlers
  const productCards = document.querySelectorAll('.product-card')
  productCards.forEach(card => {
    const carouselContainer = card.querySelector('[data-carousel-container]')
    if (carouselContainer) {
      const existingHandler = eventListenerTracker.productImage.get(carouselContainer)
      if (existingHandler) {
        carouselContainer.removeEventListener('click', existingHandler)
        eventListenerTracker.productImage.delete(carouselContainer)
      }
    }
  })
}

/**
 * Initialize Enhanced Filters Functionality (Occasion Filters Only)
 */
async function initEnhancedFilters() {
  // Initialize global filter state (occasions only)
  window.currentFilters = {
    sort: 'created_desc',
    priceRange: '',
    search: '',
    occasion: ''
  }

  // Load occasions filter buttons from API
  await loadOccasionsFilter()

  // Sort filter functionality
  const sortFilter = document.getElementById('sortFilter')
  if (sortFilter) {
    sortFilter.addEventListener('change', e => {
      window.currentFilters.sort = e.target.value
      currentPage = 1
      loadProductsWithFilters(currentPage)
      console.log(`📊 [Occasion Filters] Sort applied: ${e.target.value}`)
    })
  }

  // Price range filter functionality
  const priceRange = document.getElementById('priceRange')
  if (priceRange) {
    priceRange.addEventListener('change', e => {
      window.currentFilters.priceRange = e.target.value
      currentPage = 1
      loadProductsWithFilters(currentPage)
      console.log(`💰 [Occasion Filters] Price range filter: ${e.target.value}`)
    })
  }

  // Enhanced search input with debounced search
  const searchInput = document.getElementById('searchInput')
  if (searchInput) {
    let searchTimeout

    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        const query = e.target.value.trim()
        window.currentFilters.search = query

        // Trigger search if query is meaningful or empty
        if (query.length >= 2 || query.length === 0) {
          currentPage = 1
          loadProductsWithFilters(currentPage)
        }
      }, 500) // Debounce for better UX
    })

    // Enhanced visual feedback on focus
    searchInput.addEventListener('focus', () => {
      searchInput.parentElement.classList.add('ring-2', 'ring-pink-500', 'ring-offset-2')
    })

    searchInput.addEventListener('blur', () => {
      searchInput.parentElement.classList.remove('ring-2', 'ring-pink-500', 'ring-offset-2')
    })
  }

  // Reset filters button functionality
  const resetFiltersBtn = document.getElementById('resetFiltersBtn')
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      // Reset all filter values to defaults
      window.currentFilters = {
        sort: 'created_desc',
        priceRange: '',
        search: '',
        occasion: ''
      }

      // Reset UI elements
      if (sortFilter) sortFilter.value = 'created_desc'
      if (priceRange) priceRange.value = ''
      if (searchInput) searchInput.value = ''

      // Reset occasion filter buttons
      const allOccasionBtns = document.querySelectorAll('#quickFilters button')
      allOccasionBtns.forEach(btn => {
        btn.classList.remove(
          'from-pink-500',
          'to-rose-500',
          'border-pink-400',
          'shadow-lg',
          'shadow-pink-300/50'
        )
        btn.classList.add('from-slate-100', 'to-slate-200', 'border-slate-300', 'text-slate-700')
      })

      // Highlight "Todos" button
      const todosBtn = document.querySelector('#quickFilters button[data-filter="all"]')
      if (todosBtn) {
        todosBtn.classList.remove('from-slate-100', 'to-slate-200', 'border-slate-300')
        todosBtn.classList.add(
          'from-pink-500',
          'to-rose-500',
          'border-pink-400',
          'shadow-lg',
          'shadow-pink-300/50',
          'text-white'
        )
      }

      // Reload products
      currentPage = 1
      loadProductsWithFilters(currentPage)

      console.log('🔄 [Filters] All filters reset to defaults')
    })
  }

  console.log('✅ [Occasion Filters] Initialized successfully')
}

/**
 * Initialize product images with enhanced error handling and fetch real images
 */
async function initializeProductImages() {
  console.log('🖼️ [Model 4] Initializing product images...')

  const productImages = document.querySelectorAll('.model-4-image-container img')
  console.log(`🖼️ [Model 4] Found ${productImages.length} product images to initialize`)

  if (productImages.length === 0) {
    console.warn('⚠️ [Model 4] No product images found')
    return
  }

  // Import api-client dynamically
  const { api } = await import('./js/shared/api-client.js')

  // Process each product image
  for (let index = 0; index < productImages.length; index++) {
    const img = productImages[index]
    const productId = img.getAttribute('data-product-id')
    const fallback = img.getAttribute('data-fallback')

    console.log(`🖼️ [Model 4] Processing image ${index + 1} for product ${productId}`)

    // Add load success event
    img.addEventListener('load', () => {
      console.log(`✅ [Model 4] Image ${index + 1} loaded successfully:`, img.src)
    })

    // Enhanced error handling with retry
    img.addEventListener('error', function () {
      console.warn(`⚠️ [Model 4] Image ${index + 1} failed to load:`, this.src)

      if (this.src !== fallback) {
        console.log(`🔄 [Model 4] Retrying with fallback:`, fallback)
        this.src = fallback
      } else {
        console.error(`❌ [Model 4] All attempts failed for image ${index + 1}`)
      }
    })

    try {
      // Fetch product images
      console.log(`🔍 [Model 4] Fetching images for product ${productId}`)
      const imagesResponse = await api.getProductImages(productId, { limit: 1 })

      if (imagesResponse.success && imagesResponse.data.length > 0) {
        // Find the primary image or the first one
        const primaryImage =
          imagesResponse.data.find(img => img.is_primary) || imagesResponse.data[0]
        const imageUrl = primaryImage.url

        console.log(`🖼️ [Model 4] Found image for product ${productId}:`, imageUrl)

        // Stagger the image loading to prevent overwhelming
        setTimeout(
          () => {
            console.log(`🔄 [Model 4] Loading real image ${index + 1}:`, imageUrl)
            img.src = imageUrl
          },
          100 + index * 100
        ) // 100ms stagger between images
      } else {
        console.log(`ℹ️ [Model 4] No images found for product ${productId}, keeping placeholder`)
      }
    } catch (error) {
      console.warn(`⚠️ [Model 4] Failed to fetch images for product ${productId}:`, error.message)
      // Keep placeholder if image fetch fails
    }
  }

  // Add a final verification after all images should have loaded
  setTimeout(() => {
    console.log('🔍 [Model 4] Final image loading verification...')
    const unloadedImages = Array.from(productImages).filter(
      img => !img.complete || img.naturalHeight === 0
    )

    if (unloadedImages.length > 0) {
      console.warn(
        `⚠️ [Model 4] ${unloadedImages.length} images still not loaded, keeping placeholders`
      )
      unloadedImages.forEach((img, index) => {
        console.log(`📌 [Model 4] Keeping placeholder for image ${index + 1}`)
      })
    } else {
      console.log('✅ [Model 4] All images loaded successfully')
    }
  }, 3000) // Give more time for API calls to complete
}

/**
 * Get human-readable description of sort option
 * @param {string} sortOption - Sort option value
 * @returns {string} Human-readable sort description
 */
function getSortDescription(sortOption) {
  const sortDescriptions = {
    created_desc: 'más recientes',
    price_asc: 'precio menor a mayor',
    price_desc: 'precio mayor a menor',
    name_asc: 'nombre A a Z',
    rating_desc: 'mejor valorados'
  }
  return sortDescriptions[sortOption] || 'más recientes'
}

/**
 * Load Products with Enhanced Filters (Occasion Filters)
 */
let currentRequestAbortController = null

async function loadProductsWithFilters(page) {
  const productsContainer = document.getElementById('productsContainer')
  if (!productsContainer || isLoading) {
    return
  }

  // Cancel any previous request to prevent race conditions
  if (currentRequestAbortController) {
    currentRequestAbortController.abort()
  }

  // Create a new AbortController for this request
  currentRequestAbortController = new AbortController()

  isLoading = true

  // Mostrar estado de carga en los filtros
  const filterButtons = document.querySelectorAll('.model-4-filter')
  const searchInput = document.getElementById('searchInput')
  const sortFilter = document.getElementById('sortFilter')
  const priceRange = document.getElementById('priceRange')

  // Deshabilitar filtros durante la carga
  filterButtons.forEach(btn => {
    btn.disabled = true
    btn.classList.add('opacity-50', 'cursor-not-allowed')
  })

  if (searchInput) {
    searchInput.disabled = true
    searchInput.classList.add('opacity-50', 'cursor-not-allowed')
  }

  if (sortFilter) {
    sortFilter.disabled = true
    sortFilter.classList.add('opacity-50', 'cursor-not-allowed')
  }

  if (priceRange) {
    priceRange.disabled = true
    priceRange.classList.add('opacity-50', 'cursor-not-allowed')
  }

  // Create ARIA live region if it doesn't exist
  let loadingAnnouncement = document.getElementById('filter-loading-announcement')
  if (!loadingAnnouncement) {
    loadingAnnouncement = document.createElement('div')
    loadingAnnouncement.id = 'filter-loading-announcement'
    loadingAnnouncement.setAttribute('aria-live', 'polite')
    loadingAnnouncement.setAttribute('aria-atomic', 'true')
    loadingAnnouncement.className = 'sr-only'
    document.body.appendChild(loadingAnnouncement)
  }

  // Announce loading to screen readers
  loadingAnnouncement.textContent = `Filtrando productos por ${window.currentFilters.occasion || 'todos'}, ordenando por ${getSortDescription(window.currentFilters.sort)}, ${window.currentFilters.search ? `buscando "${window.currentFilters.search}"` : ''}${window.currentFilters.priceRange ? `, rango de precio ${window.currentFilters.priceRange}` : ''}`

  productsContainer.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="inline-flex items-center gap-2">
        <div class="w-6 h-6 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500">Filtrando productos...</p>
      </div>
    </div>
  `

  try {
    console.log(
      `🔍 [Modelo 4] Loading filtered products page ${page} with filters:`,
      window.currentFilters
    )

    // Transform priceRange to price_min/price_max for backend compatibility
    let priceParams = {}
    if (window.currentFilters.priceRange) {
      const priceRange = window.currentFilters.priceRange
      if (priceRange === '0-30') {
        priceParams = { price_min: 0, price_max: 30 }
      } else if (priceRange === '30-60') {
        priceParams = { price_min: 30, price_max: 60 }
      } else if (priceRange === '60-100') {
        priceParams = { price_min: 60, price_max: 100 }
      } else if (priceRange === '100+') {
        priceParams = { price_min: 100 }
      }
    }

    // Build query parameters based on filters
    const params = new URLSearchParams({
      page,
      limit: PRODUCTS_PER_PAGE,
      sortBy: window.currentFilters.sort, // Backend expects 'sortBy' not 'sort'
      ...(window.currentFilters.search && { search: window.currentFilters.search }),
      ...priceParams,
      ...(window.currentFilters.occasion && { occasion: window.currentFilters.occasion })
    })

    console.log('📋 [Modelo 4] API Request params:', Object.fromEntries(params))

    // Convert URLSearchParams to object format for api-client
    const apiParams = {
      limit: PRODUCTS_PER_PAGE,
      page: page,
      sortBy: window.currentFilters.sort, // Backend expects 'sortBy' not 'sort'
      ...(window.currentFilters.search && { search: window.currentFilters.search }),
      ...priceParams,
      ...(window.currentFilters.occasion && { occasion: window.currentFilters.occasion })
    }

    // Import API module dynamically and use getAllProducts method
    const { api } = await import('./js/shared/api-client.js')
    const result = await api.getAllProducts(apiParams, {
      signal: currentRequestAbortController.signal
    })

    // Only proceed if this request hasn't been cancelled
    if (currentRequestAbortController.signal.aborted) {
      console.log('Request was cancelled, not updating UI')
      return
    }

    console.log('✅ [Modelo 4] Filtered products loaded:', result.data.length)

    if (!result.success) {
      throw new Error(result.message || 'Failed to load filtered products')
    }

    // Check if any products were returned
    if (!result.data || result.data.length === 0) {
      // Only update UI if this request wasn't cancelled
      if (!currentRequestAbortController.signal.aborted) {
        console.warn('⚠️ [Modelo 4] No products found for current filters')
        productsContainer.innerHTML = `
          <div class="col-span-full text-center py-12">
            <div class="text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 class="text-lg font-medium mb-2">No se encontraron productos</h3>
              <p class="text-sm text-gray-400">Intenta ajustar los filtros para ver más resultados</p>
            </div>
          </div>
        `

        // Announce no results to screen readers
        const loadingAnnouncement = document.getElementById('filter-loading-announcement')
        if (loadingAnnouncement) {
          loadingAnnouncement.textContent = 'No se encontraron productos con los filtros actuales'
        }
      }
      return
    }

    // Only update UI if this request wasn't cancelled
    if (!currentRequestAbortController.signal.aborted) {
      // Render products with Model 4 styling
      productsContainer.innerHTML = result.data
        .map(product => createProductCardModel4(product))
        .join('')

      // Initialize handlers for new products (Modelo 4)
      // Note: initializeProductCarousels no existe - los productos se renderizan directamente
      addQuickViewHandlers()
      addCartButtonHandlers()
      addProductImageHandlers()
      addBuyNowHandlers()
      addWishlistHandlers()
      initProductCardTouchFeedback()

      // Initialize image loading with retry mechanism for first page load
      // Small delay to ensure DOM is fully ready
      setTimeout(() => {
        initializeProductImages()
      }, 50)

      // Render pagination
      const paginationContainer = document.getElementById('pagination')
      if (paginationContainer) {
        const hasMore = result.data.length === PRODUCTS_PER_PAGE
        renderPagination(paginationContainer, page, hasMore)
      }

      // Update URL without page reload for better UX
      updateUrlWithFilters()

      // Announce results to screen readers and move focus for accessibility
      const loadingAnnouncement = document.getElementById('filter-loading-announcement')
      if (loadingAnnouncement) {
        loadingAnnouncement.textContent = `Se han cargado ${result.data.length} productos filtrados correctamente`
      }

      // Move focus to the products container for screen reader users (only if not initial load)
      if (!window.isInitialPageLoad) {
        productsContainer.setAttribute('tabindex', '-1')
        productsContainer.focus()
        // Remove tabindex after focus to prevent it from being focusable in normal tab order
        setTimeout(() => {
          productsContainer.removeAttribute('tabindex')
        }, 100)
      }
    } // Close the if (!currentRequestAbortController.signal.aborted) block
  } catch (error) {
    // Only show error if it's not due to cancellation
    if (error.name !== 'AbortError') {
      console.error('❌ Failed to load filtered products:', error)
      productsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="text-red-500">
            <svg class="w-6 h-6 inline-block mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="font-medium">Error al cargar productos. Por favor intenta de nuevo.</p>
          </div>
        </div>
      `

      // Announce error to screen readers
      const loadingAnnouncement = document.getElementById('filter-loading-announcement')
      if (loadingAnnouncement) {
        loadingAnnouncement.textContent =
          'Error al cargar los productos filtrados. Por favor intenta de nuevo.'
      }
    } else {
      console.log('Request was cancelled (AbortError)')
    }
  } finally {
    isLoading = false

    // Restaurar estado de los filtros
    filterButtons.forEach(btn => {
      btn.disabled = false
      btn.classList.remove('opacity-50', 'cursor-not-allowed')
    })

    if (searchInput) {
      searchInput.disabled = false
      searchInput.classList.remove('opacity-50', 'cursor-not-allowed')
    }

    if (sortFilter) {
      sortFilter.disabled = false
      sortFilter.classList.remove('opacity-50', 'cursor-not-allowed')
    }

    if (priceRange) {
      priceRange.disabled = false
      priceRange.classList.remove('opacity-50', 'cursor-not-allowed')
    }
  }
}

/**
 * Create Product Card HTML (Modelo 4 - Baymard Institute)
 */
function createProductCardModel4(product) {
  const price = product.price_usd || 0

  // Add Model 4 specific logic for categorization
  const categoryClassifyProduct = product => {
    const name = (product.name || '').toLowerCase()
    const description = (product.summary || product.description || '').toLowerCase()

    if (name.includes('ramo') || description.includes('ramo')) {
      return 'ramos'
    }
    if (name.includes('planta') || description.includes('planta')) {
      return 'plantas'
    }
    if (name.includes('arreglo') || description.includes('arreglo')) {
      return 'arreglos'
    }
    if (price > 80) {
      return 'premium'
    }
    return 'all'
  }

  const productCategory = categoryClassifyProduct(product)
  const isBestseller = Math.random() > 0.6
  const hasDiscount = Math.random() > 0.7
  const discountPercentage = hasDiscount ? Math.floor(Math.random() * 20 + 10) : 0
  const originalPrice = hasDiscount ? price * (1 + discountPercentage / 100) : null
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1)
  const reviewCount = Math.floor(Math.random() * 300 + 50)

  return `
    <div class="model-4-card group" data-product-category="${productCategory}" data-product-id="${product.id}">
      <!-- Image Container -->
      <div class="relative aspect-square bg-gray-100 overflow-hidden model-4-image-container" data-carousel-container data-product-id="${product.id}">
        <!-- Product Image -->
        <img
          src="./images/placeholder-flower.svg"
          alt="${product.name}"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 model-4-product-image"
          data-fallback="./images/placeholder-flower.svg"
          data-product-id="${product.id}"
          loading="eager"
          decoding="async"
        />

        <!-- Quick Actions Overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <!-- Quick View Button -->
          <button
            class="quick-view-btn bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full m-1 transition-all duration-200 hover:scale-110 shadow-lg"
            type="button"
            data-product-id="${product.id}"
            data-action="quick-view"
            title="Vista rápida"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
        </div>

        <!-- Bestseller Badge -->
        ${
          isBestseller
            ? `
          <div class="absolute top-2 left-2 z-10 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            ⭐ Bestseller
          </div>
        `
            : ''
        }

        <!-- Discount Badge -->
        ${
          hasDiscount
            ? `
          <div class="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            -${discountPercentage}%
          </div>
        `
            : ''
        }

        <!-- Out of Stock Badge -->
        ${
          !product.stock || product.stock <= 0
            ? `
          <div class="absolute inset-0 bg-gray-900/75 flex items-center justify-center">
            <div class="text-white text-center">
              <div class="text-lg font-bold">Agotado</div>
              <div class="text-sm opacity-75">Próximamente</div>
            </div>
          </div>
        `
            : ''
        }
      </div>

      <!-- Content Area (Model 4 Layout) -->
      <div class="model-4-content">
        <!-- Title -->
        <h3 class="model-4-title">${product.name}</h3>

        <!-- Rating -->
        <div class="flex items-center gap-1 mb-2">
          ${Array(5)
            .fill(0)
            .map(
              (_, i) => `
            <span class="text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}">★</span>
          `
            )
            .join('')}
          <span class="text-xs text-gray-500">(${reviewCount})</span>
        </div>

        <!-- Price Section -->
        <div class="model-4-price">
          ${
            originalPrice
              ? `
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-pink-600">$${price.toFixed(2)}</span>
              <span class="text-lg text-gray-400 line-through">$${originalPrice.toFixed(2)}</span>
            </div>
          `
              : `
            <span class="text-2xl font-bold text-pink-600">$${price.toFixed(2)}</span>
          `
          }
        </div>

        <!-- Actions (Model 4 - Simple & Clear) -->
        <div class="model-4-actions">
          <button
            class="model-4-btn model-4-cart"
            data-product-id="${product.id}"
            data-product-name="${product.name}"
            data-product-price="${price}"
            data-action="add-to-cart"
            type="button"
          >
            🛒 Agregar
          </button>
          <button
            class="model-4-btn model-4-buy"
            data-product-id="${product.id}"
            data-product-name="${product.name}"
            data-product-price="${price}"
            data-action="buy-now"
            type="button"
          >
            ⚡ Comprar
          </button>
        </div>
      </div>
    </div>
  `
}

/**
 * Update browser URL with current filters (Occasion Filters)
 */
function updateUrlWithFilters() {
  const params = new URLSearchParams()

  if (window.currentFilters.occasion) {
    params.set('occasion', window.currentFilters.occasion)
  }
  if (window.currentFilters.sort !== 'created_desc') {
    params.set('sort', window.currentFilters.sort)
  }
  if (window.currentFilters.priceRange) {
    params.set('priceRange', window.currentFilters.priceRange)
  }
  if (window.currentFilters.search) {
    params.set('search', window.currentFilters.search)
  }

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname

  window.history.replaceState({}, '', newUrl)
}

/**
 * Initialize page
 */
async function init() {
  try {
    // Theme Manager is auto-initialized when imported, just expose it globally for debug scripts
    try {
      // Import theme manager module dynamically (it auto-initializes)
      const { themeManager } = await import('./js/themes/themeManager.js')

      // Expose themeManager globally for debug scripts
      window.themeManager = themeManager
      log.success('Theme manager exposed globally')
      log.debug('Theme manager auto-initialized when imported')
    } catch (error) {
      log.error('Theme manager import failed:', error)
      // Continue with default theme
    }

    // Initialize Theme Selector UI with enhanced error handling
    let retryCount = 0
    const maxRetries = 3

    async function initializeThemeSelector() {
      // Wait a bit for theme manager to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 100))
      try {
        // Check if container exists
        let themeSelectorContainer = document.getElementById('theme-selector-container')

        // Create container dynamically if it doesn't exist
        if (!themeSelectorContainer) {
          log.warn('Theme selector container not found, creating dynamically...')

          // Find the nav-actions container to insert the theme selector
          const navActions = document.querySelector('.nav-actions')
          if (navActions) {
            themeSelectorContainer = document.createElement('div')
            themeSelectorContainer.id = 'theme-selector-container'
            themeSelectorContainer.className = 'theme-selector-wrapper'

            // Insert before the cart icon
            const cartIcon = navActions.querySelector('a[href*="cart"]')
            if (cartIcon) {
              navActions.insertBefore(themeSelectorContainer, cartIcon)
            } else {
              // Fallback: append to nav-actions
              navActions.appendChild(themeSelectorContainer)
            }
          } else {
            throw new Error('Could not find nav-actions container to create theme selector')
          }
        }

        // Wait for theme manager to be available and ready
        if (!window.themeManager) {
          throw new Error('Theme manager not available')
        }

        // Import ThemeSelector module dynamically
        const ThemeSelectorModule = await import('./js/components/ThemeSelector.js')
        const ThemeSelectorClass = ThemeSelectorModule.default || ThemeSelectorModule
        const themeSelector = new ThemeSelectorClass('theme-selector-container')
        window.themeSelectorInstance = themeSelector
        log.success('Theme selector initialized successfully')
        return true
      } catch (error) {
        log.error('Theme selector initialization failed:', error)

        // Retry logic
        retryCount++
        if (retryCount < maxRetries) {
          setTimeout(initializeThemeSelector, retryCount * 200)
        } else {
          log.error('Max retries reached for theme selector initialization')

          // Create fallback theme selector
          createFallbackThemeSelector()
        }
        return false
      }
    }

    function createFallbackThemeSelector() {
      try {
        const navActions = document.querySelector('.nav-actions')
        if (navActions) {
          const fallbackContainer = document.createElement('div')
          fallbackContainer.id = 'theme-selector-container-fallback'
          fallbackContainer.className = 'theme-selector-wrapper'
          fallbackContainer.innerHTML = `
            <button
              id="fallback-theme-btn"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
              title="Cambiar tema"
            >
              <span>🎨</span>
              <i data-lucide="chevron-down" class="h-4 w-4 text-gray-600"></i>
            </button>
          `

          // Insert before the cart icon
          const cartIcon = navActions.querySelector('a[href*="cart"]')
          if (cartIcon) {
            navActions.insertBefore(fallbackContainer, cartIcon)
          } else {
            navActions.appendChild(fallbackContainer)
          }

          // Add basic theme switching functionality
          const fallbackBtn = document.getElementById('fallback-theme-btn')
          if (fallbackBtn) {
            fallbackBtn.addEventListener('click', () => {
              // Simple theme toggle between light and dark
              const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
              const newTheme = currentTheme === 'light' ? 'dark' : 'light'
              document.documentElement.setAttribute('data-theme', newTheme)
              localStorage.setItem('floresya-theme-preference', newTheme)
              fallbackBtn.querySelector('span').textContent = newTheme === 'light' ? '☀️' : '🌙'
            })
          }

          // Icons are now static SVG - no need to initialize
        }
      } catch (error) {
        log.error('Failed to create fallback theme selector:', error)
      }
    }

    // Initialize theme selector with retry logic
    initializeThemeSelector()

    // Icons are now static SVG - no need to initialize

    // Initialize cart functionality
    // Import cart module dynamically
    const { initCartBadge, initCartEventListeners, initCartTouchFeedback } = await import(
      './js/shared/cart.js'
    )
    initCartBadge()
    initCartEventListeners()
    initCartTouchFeedback()
    log.success('Cart initialized')

    // Initialize mobile navigation with new components
    initMobileNavigation()
    log.success('Mobile navigation initialized')

    initSmoothScroll()
    log.success('Smooth scroll initialized')

    await initCarousel()
    log.success('Carousel initialized')

    await initProductsGrid()
    log.success('Products grid initialized')

    // Store pullToRefreshInstance globally for potential access
    window.pullToRefreshInstance = pullToRefreshInstance

    // Mark page as loaded
    document.documentElement.classList.add('loaded')

    // Final verification
    log.debug('Final verification:')
    log.debug(
      '- Theme selector container exists:',
      !!document.getElementById('theme-selector-container')
    )
    log.debug('- Theme manager initialized:', !!window.themeManager)
    log.debug('- Theme selector instance:', !!window.themeSelectorInstance)
    log.debug('- Current theme:', document.documentElement.getAttribute('data-theme'))

    // Run debug check if available
    if (window.themeDebug) {
      log.debug('Running theme debug check...')
      window.themeDebug.runDiagnosis()
    }

    log.success('Page fully initialized')
  } catch (error) {
    log.error('Initialization failed:', error)

    // Emit error event for potential error tracking
    window.dispatchEvent(
      new CustomEvent('initializationError', {
        detail: { error: error.message, stack: error.stack }
      })
    )

    // Try to continue with basic functionality
    try {
      document.documentElement.classList.add('loaded')
      log.warn('Continuing with basic functionality')
    } catch (fallbackError) {
      log.error('Even fallback failed:', fallbackError)
    }
  }
}

// Dynamic module loading system is already set up above with DOMContentLoaded

// Clean up resources when page unloads to prevent memory leaks
window.addEventListener('beforeunload', cleanupEventListeners)

// Load final contrast fixes to ensure AAA compliance
try {
  import('./js/themes/finalContrastFixes.js')
    .then(() => {
      log.debug('Final contrast fixes loaded successfully')
    })
    .catch(err => {
      log.warn('Final contrast fixes could not load:', err)
    })
} catch (error) {
  log.warn('Final contrast fixes import failed:', error)
}
