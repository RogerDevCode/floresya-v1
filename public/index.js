/**
 * FloresYa - Index Page (ES6 Module)
 * Mobile menu toggle and UI interactions for index.html
 * Implementación con carga dinámica de módulos usando el patrón solicitado
 */

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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 [index.js] Starting dynamic module loading...')

    // Cargar módulos dinámicamente usando el patrón solicitado
    await Promise.all([
      import('./js/shared/dom-ready.js'),
      import('./js/themes/themeManager.js'),
      import('./js/components/ThemeSelector.js'),
      import('./js/components/imageCarousel.js'),
      import('./js/components/mobileNav.js'),
      import('./js/components/pullToRefresh.js'),
      import('./js/shared/cart.js'),
      import('./js/shared/api-client.js'),
      import('./js/shared/touchFeedback.js')
    ])

    // Nota: Los módulos se cargan dinámicamente dentro de cada función que los necesita

    console.log('✅ [index.js] All modules loaded successfully')

    // Ejecutar inicialización con módulos cargados dinámicamente
    await init()

    // Try to load cuco clock module separately (optional)
    console.log('🔍 [CUCO DEBUG] About to import cuco clock module...')
    import('./js/components/cucoClock.js')
      .then(() => {
        console.log('✅ [index.js] Cuco clock module loaded successfully')

        // Set up event listener when DOM is ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupCucoClockButton)
        } else {
          setupCucoClockButton()
        }
      })
      .catch(error => {
        console.warn(
          '⚠️ [index.js] Cuco clock module failed to load, fallback will be used:',
          error.message
        )
      })

    // Function to set up the cuco clock button event listener
    function setupCucoClockButton() {
      const cucoButton = document.getElementById('cuco-clock-toggle')
      if (cucoButton) {
        console.log('🔍 [CUCO DEBUG] Adding click listener to cuco toggle button...')
        cucoButton.addEventListener('click', e => {
          e.preventDefault()
          e.stopPropagation()
          console.log('🔍 [CUCO DEBUG] cuco button clicked!')

          if (window.cucoClock) {
            window.cucoClock.toggleClock()
            console.log('🔍 [CUCO DEBUG] window.cucoClock.toggleClock() called')
          } else {
            console.warn('🔍 [CUCO DEBUG] window.cucoClock not available')
          }
        })
        console.log('✅ Cuco clock toggle event listener added successfully')
      } else {
        console.error('❌ Could not find cuco toggle button in DOM')
      }
    }

    console.log('✅ [index.js] Dynamic module system initialization complete')
  } catch (error) {
    console.error('❌ [index.js] Failed to load modules:', error)
    throw error
  }
})

/**
 * Initialize mobile navigation drawer
 * Uses the existing #mobile-menu-btn button from HTML
 */
async function initMobileNavigation() {
  try {
    // Import mobile navigation module dynamically
    const { initMobileNav } = await import('./js/components/mobileNav.js')

    // Initialize the mobile navigation drawer with existing button
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
    console.error('❌ [index.js] Failed to initialize mobile navigation:', error)
    throw error // Fail-fast: propagate error
  }
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
      dot.classList.toggle('active', i === index)
      dot.setAttribute('aria-current', i === index ? 'true' : 'false')
    })
  }

  console.log(
    '📊 Progress Bar updated:',
    percentage + '% (slide',
    index + 1,
    'of',
    totalSlides + ')'
  )
}

/**
 * Create Enhanced Carousel Indicators (Modelo 5 - Stanford Research)
 */
function createCarouselIndicators(totalSlides) {
  const indicatorsContainer = document.getElementById('carousel-indicators')
  if (!indicatorsContainer || totalSlides <= 1) {
    return
  }

  // Clear existing indicators
  indicatorsContainer.innerHTML = ''

  // Create dots with enhanced styling
  for (let i = 0; i < totalSlides; i++) {
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

  console.log(`✅ Created ${totalSlides} enhanced carousel indicators`)
}

/**
 * Initialize Featured Products Carousel
 */
async function initCarousel() {
  const carouselSlides = document.getElementById('carouselSlides')
  const prevBtn = document.getElementById('carousel-prev')
  const nextBtn = document.getElementById('carousel-next')

  if (!carouselSlides || !prevBtn || !nextBtn) {
    return
  }

  // Fetch featured products from API
  let featuredProducts = []
  try {
    console.log('🔍 [DEBUG] Starting carousel products fetch...')
    console.log('🔍 [DEBUG] Current hostname:', window.location.hostname)

    // Import API module dynamically
    const { api } = await import('./js/shared/api-client.js')
    console.log('🔍 [DEBUG] API instance available:', !!api)

    const result = await api.getAllCarouselProducts()

    console.log('🎠 [DEBUG] Carousel API Response:', {
      success: result.success,
      totalProducts: result.data?.length || 0,
      firstProduct: result.data?.[0],
      fullResponse: result
    })

    if (result.success && result.data && result.data.length > 0) {
      // Filter: Only products WITH images (exclude products without image_url_small)
      featuredProducts = result.data.filter(p => p.image_url_small)

      console.log(
        '🖼️ [DEBUG] Product Images Filter:',
        featuredProducts.map(p => ({
          id: p.id,
          name: p.name,
          image_url_small: p.image_url_small,
          hasImage: !!p.image_url_small
        }))
      )

      if (featuredProducts.length === 0) {
        console.error('❌ [DEBUG] No carousel products with images found')
        throw new Error('No carousel products with images found')
      }

      console.log('✅ [DEBUG] Carousel products loaded successfully:', featuredProducts.length)
    } else {
      console.error('❌ [DEBUG] No carousel products found in response')
      throw new Error('No carousel products found')
    }
  } catch (error) {
    console.error('❌ [DEBUG] Failed to load carousel products:', error)
    console.error('❌ [DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      hostname: window.location.hostname,
      apiAvailable: typeof api !== 'undefined'
    })

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

      return `
    <div class="carousel-slide ${index === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}" data-slide="${index}" data-product-id="${product.id}">
      <div class="h-full flex items-center justify-center p-8">
        <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <!-- Product Image -->
          <div class="flex justify-center p-6">
            <img
              src="${imageUrl}"
              alt="${product.name}"
              class="carousel-product-image w-[300px] h-[300px] object-cover rounded-lg shadow-lg"
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
  initEnhancedFilters()

  // Load occasions first, then products with Model 4 filters
  await loadOccasionsFilter()

  // Add a small delay to ensure DOM is fully ready and API server is responsive
  await new Promise(resolve => setTimeout(resolve, 100))

  // Load products with retry logic
  await loadProductsWithFilters(currentPage)

  // Initialize pull-to-refresh on the products container
  initPullToRefresh()

  // Search functionality
  const searchInput = document.getElementById('searchInput')
  const occasionFilter = document.getElementById('occasionFilter')
  const sortFilter = document.getElementById('sortFilter')

  if (searchInput) {
    let searchTimeout
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        currentPage = 1
        loadProducts(currentPage)
      }, 500)
    })
  }

  if (occasionFilter) {
    occasionFilter.addEventListener('change', () => {
      currentPage = 1
      loadProducts(currentPage)
    })
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      currentPage = 1
      loadProducts(currentPage)
    })
  }
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
 * Load occasions from API and populate filter dropdown
 */
async function loadOccasionsFilter() {
  const occasionFilter = document.getElementById('occasionFilter')
  if (!occasionFilter) {
    return
  }

  try {
    // Import API module dynamically
    const { api } = await import('./js/shared/api-client.js')
    const result = await api.getAllOccasions()

    if (!result.success || !result.data) {
      console.error('Failed to load occasions:', result)
      return
    }

    // Clear existing options except "Todas las ocasiones"
    occasionFilter.innerHTML = '<option value="">Todas las ocasiones</option>'

    // Add dynamic options from API
    result.data.forEach(occasion => {
      const option = document.createElement('option')
      option.value = occasion.slug
      option.textContent = occasion.name
      occasionFilter.appendChild(option)
    })

    console.info(`✓ Loaded ${result.data.length} occasions from API`)
  } catch (error) {
    console.error('❌ Failed to load occasions:', error)
    throw error
  }
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
      offset: offset
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
          <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 border border-gray-100 hover:border-pink-200" data-product-id="${product.id}">
            <!-- Image Container with Badges -->
            <div class="relative aspect-square bg-gray-100 overflow-hidden" data-carousel-container data-product-id="${product.id}">
              <!-- Badges (Trust Signals) -->
              <div class="absolute top-3 left-3 z-10 flex gap-2">
                ${
                  isBestseller
                    ? `
                  <span class="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐ Bestseller
                  </span>
                `
                    : ''
                }
                ${
                  hasDiscount
                    ? `
                  <span class="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    -${discountPercentage}%
                  </span>
                `
                    : ''
                }
              </div>

              <!-- Wishlist Button -->
              <button class="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:rotate-3"
                      type="button"
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
  const quickViewBtns = document.querySelectorAll('.quick-view-btn[data-action="quick-view"]')

  quickViewBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault()
      const productId = btn.getAttribute('data-product-id')

      if (!productId) {
        console.error('Quick view: missing product ID')
        return
      }

      // Navigate to product detail page
      window.location.href = `/pages/product-detail.html?id=${productId}`
    })
  })
}

/**
 * Add click handlers for cart buttons (shopping cart icon) - Enhanced
 */
function addCartButtonHandlers() {
  const cartBtns = document.querySelectorAll(
    '.add-to-cart-btn[data-action="add-to-cart"], .model-4-cart[data-action="add-to-cart"]'
  )

  cartBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
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
    })
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

    // Add click handler to the entire carousel container (which contains the images)
    carouselContainer.addEventListener('click', e => {
      // Only handle clicks on images, not on other elements
      if (e.target.tagName.toLowerCase() === 'img') {
        e.preventDefault()
        // Navigate to product detail page
        window.location.href = `/pages/product-detail.html?id=${productId}`
      }
    })

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
  const buyNowBtns = document.querySelectorAll(
    '.buy-now-btn[data-action="buy-now"], .model-4-buy[data-action="buy-now"]'
  )

  buyNowBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
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
    })
  })
}

/**
 * Add click handlers for wishlist buttons (heart icon)
 */
function addWishlistHandlers() {
  const wishlistBtns = document.querySelectorAll('[data-wishlist-product-id]')

  wishlistBtns.forEach(btn => {
    btn.addEventListener('click', e => {
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
        // Revert visual state on error
        heartIcon.textContent = isLiked ? '❤️' : '🤍'
      }
    })
  })
}

/**
 * Initialize touch feedback for product cards and their interactive elements
 */
async function initProductCardTouchFeedback() {
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
  }

  console.log('✅ Touch feedback initialized for product cards')
}

/**
 * Initialize Enhanced Filters Functionality (Modelo 4 - Integrated Filters)
 */
function initEnhancedFilters() {
  // Initialize global filter state for Model 4
  window.currentFilters = {
    category: 'all', // 'all', 'ramos', 'plantas', 'arreglos', 'premium'
    sort: 'created_desc',
    priceRange: '',
    search: ''
  }

  // Quick filter buttons functionality (Modelo 4)
  const filterTags = document.querySelectorAll('.model-4-filter')

  filterTags.forEach(tag => {
    tag.addEventListener('click', e => {
      const filter = e.currentTarget.getAttribute('data-filter')

      // Update active state
      filterTags.forEach(t => {
        t.classList.remove('active')
      })

      e.currentTarget.classList.add('active')

      // Update global filter state
      window.currentFilters.category = filter

      // Reload products with new filter
      currentPage = 1
      loadProductsWithFilters(currentPage)

      // Enhanced haptic feedback
      if ('vibrate' in navigator && 'ontouchstart' in window) {
        navigator.vibrate([20, 10])
      }

      console.log(`🔍 [Modelo 4] Quick filter applied: ${filter}`)
    })
  })

  // Sort filter functionality
  const sortFilter = document.getElementById('sortFilter')
  if (sortFilter) {
    sortFilter.addEventListener('change', e => {
      window.currentFilters.sort = e.target.value
      currentPage = 1
      loadProductsWithFilters(currentPage)
      console.log(`📊 [Modelo 4] Sort applied: ${e.target.value}`)
    })
  }

  // Price range filter functionality
  const priceRange = document.getElementById('priceRange')
  if (priceRange) {
    priceRange.addEventListener('change', e => {
      window.currentFilters.priceRange = e.target.value
      currentPage = 1
      loadProductsWithFilters(currentPage)
      console.log(`💰 [Modelo 4] Price range filter: ${e.target.value}`)
    })
  }

  // Enhanced search input with debounced search (Modelo 4)
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

  console.log('✅ [Modelo 4] Enhanced filters initialized successfully')
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
 * Load Products with Enhanced Filters (Modelo 4 - Baymard Research)
 */
async function loadProductsWithFilters(page) {
  const productsContainer = document.getElementById('productsContainer')
  if (!productsContainer || isLoading) {
    return
  }

  isLoading = true
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

    // Build query parameters based on filters
    const params = new URLSearchParams({
      page,
      limit: PRODUCTS_PER_PAGE,
      sort: window.currentFilters.sort,
      ...(window.currentFilters.search && { search: window.currentFilters.search }),
      ...(window.currentFilters.priceRange && { priceRange: window.currentFilters.priceRange }),
      ...(window.currentFilters.occasion && { occasion: window.currentFilters.occasion }),
      // Map category filters to meaningful API parameters
      ...(window.currentFilters.category !== 'all' && {
        category: mapCategoryToApiParam(window.currentFilters.category)
      })
    })

    console.log('📋 [Modelo 4] API Request params:', Object.fromEntries(params))

    // Convert URLSearchParams to object format for api-client
    const apiParams = {
      limit: PRODUCTS_PER_PAGE,
      page: page,
      sort: window.currentFilters.sort,
      ...(window.currentFilters.search && { search: window.currentFilters.search }),
      ...(window.currentFilters.priceRange && { priceRange: window.currentFilters.priceRange }),
      ...(window.currentFilters.occasion && { occasion: window.currentFilters.occasion }),
      // Map category filters to meaningful API parameters
      ...(window.currentFilters.category !== 'all' && {
        category: mapCategoryToApiParam(window.currentFilters.category)
      })
    }

    // Import API module dynamically and use getAllProducts method
    const { api } = await import('./js/shared/api-client.js')
    const result = await api.getAllProducts(apiParams)

    console.log('✅ [Modelo 4] Filtered products loaded:', result.data.length)

    if (!result.success) {
      throw new Error(result.message || 'Failed to load filtered products')
    }

    // Check if any products were returned
    if (!result.data || result.data.length === 0) {
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
      return
    }

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
  } catch (error) {
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
  } finally {
    isLoading = false
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
 * Map category filter to API parameter
 */
function mapCategoryToApiParam(category) {
  const categoryMap = {
    ramos: 'bouquet',
    plantas: 'plant',
    arreglos: 'arrangement',
    premium: 'luxury'
  }
  return categoryMap[category] || category
}

/**
 * Update browser URL with current filters (Modelo 4 - Baymard UX)
 */
function updateUrlWithFilters() {
  const params = new URLSearchParams()

  if (window.currentFilters.category !== 'all') {
    params.set('category', window.currentFilters.category)
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
    console.log('🚀 [index.js] Starting initialization...')
    console.log('🔍 [index.js] Checking dependencies...')

    // Initialize Theme Manager (must be first to apply theme before UI loads)
    try {
      // Import theme manager module dynamically
      const { themeManager } = await import('./js/themes/themeManager.js')
      themeManager.init()
      console.log('✅ [index.js] Theme manager initialized')

      // Expose themeManager globally for debug scripts
      window.themeManager = themeManager
      console.log('✅ [index.js] Theme manager exposed to global window object')
    } catch (error) {
      console.error('❌ [index.js] Theme manager initialization failed:', error)
      // Continue with default theme
    }

    // Initialize Theme Selector UI with enhanced error handling
    let retryCount = 0
    const maxRetries = 3

    async function initializeThemeSelector() {
      // Wait a bit for theme manager to be fully initialized
      await new Promise(resolve => setTimeout(resolve, 100))
      try {
        console.log(
          `🎨 [index.js] Attempting to initialize theme selector (attempt ${retryCount + 1}/${maxRetries})`
        )

        // Check if container exists
        let themeSelectorContainer = document.getElementById('theme-selector-container')

        // Create container dynamically if it doesn't exist
        if (!themeSelectorContainer) {
          console.warn('⚠️ [index.js] Theme selector container not found, creating dynamically...')

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

            console.log('✅ [index.js] Theme selector container created dynamically')
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
        console.log('✅ [index.js] Theme selector initialized successfully')
        return true
      } catch (error) {
        console.error('❌ [index.js] Theme selector initialization failed:', error)

        // Retry logic
        retryCount++
        if (retryCount < maxRetries) {
          console.log(
            `🔄 [index.js] Retrying theme selector initialization in ${retryCount * 200}ms...`
          )
          setTimeout(initializeThemeSelector, retryCount * 200)
        } else {
          console.error('❌ [index.js] Max retries reached for theme selector initialization')

          // Create fallback theme selector
          createFallbackThemeSelector()
        }
        return false
      }
    }

    function createFallbackThemeSelector() {
      try {
        console.log('🔄 [index.js] Creating fallback theme selector...')

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

          console.log('✅ [index.js] Fallback theme selector created')
        }
      } catch (error) {
        console.error('❌ [index.js] Failed to create fallback theme selector:', error)
      }
    }

    // Initialize theme selector with retry logic
    initializeThemeSelector()

    // Icons are now static SVG - no need to initialize
    console.log('✅ [index.js] Icons initialized - using static SVG system')
    console.log('🔍 [Icon System Debug] Static SVG icons are embedded in HTML')
    console.log('🔍 [Icon System Debug] No runtime icon initialization required')

    // Initialize cart functionality
    // Import cart module dynamically
    const { initCartBadge, initCartEventListeners, initCartTouchFeedback } = await import(
      './js/shared/cart.js'
    )
    initCartBadge()
    initCartEventListeners()
    initCartTouchFeedback()
    console.log('✅ [index.js] Cart initialized')

    // Initialize mobile navigation with new components
    initMobileNavigation()
    console.log('✅ [index.js] Mobile navigation initialized')

    initSmoothScroll()
    console.log('✅ [index.js] Smooth scroll initialized')

    initCarousel()
    console.log('✅ [index.js] Carousel initializing...')

    initProductsGrid()
    console.log('✅ [index.js] Products grid initializing...')

    // Store pullToRefreshInstance globally for potential access
    window.pullToRefreshInstance = pullToRefreshInstance

    // Mark page as loaded
    document.documentElement.classList.add('loaded')

    // Final verification
    console.log('🔍 [index.js] Final verification:')
    console.log(
      '- Theme selector container exists:',
      !!document.getElementById('theme-selector-container')
    )
    console.log('- Theme manager initialized:', !!window.themeManager)
    console.log('- Theme selector instance:', !!window.themeSelectorInstance)
    console.log('- Current theme:', document.documentElement.getAttribute('data-theme'))

    // Run debug check if available
    if (window.themeDebug) {
      console.log('🔍 [index.js] Running theme debug check...')
      window.themeDebug.runDiagnosis()
    }

    console.log('✅ [index.js] Page fully initialized')
    console.log('🎯 [Icon System Migration] Complete - All createIcons() calls removed')
    console.log('🎯 [Icon System Migration] Using static SVG icons from /public/images/lucide/')
    console.log('🎯 [Icon System Migration] No runtime icon initialization required')
  } catch (error) {
    console.error('❌ [index.js] Initialization failed:', error)

    // Emit error event for potential error tracking
    window.dispatchEvent(
      new CustomEvent('initializationError', {
        detail: { error: error.message, stack: error.stack }
      })
    )

    // Try to continue with basic functionality
    try {
      document.documentElement.classList.add('loaded')
      console.warn('⚠️ [index.js] Continuing with basic functionality')
    } catch (fallbackError) {
      console.error('❌ [index.js] Even fallback failed:', fallbackError)
    }
  }
}

// Dynamic module loading system is already set up above with DOMContentLoaded
