/**
 * FloresYa - Index Page (ES6 Module)
 * Mobile menu toggle and UI interactions for index.html
 * Implementación con carga dinámica de módulos usando el patrón solicitado
 */

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
 * Initialize Featured Products Carousel
 */
async function initCarousel() {
  const carouselSlides = document.getElementById('carouselSlides')
  const carouselIndicators = document.getElementById('carouselIndicators')
  const prevBtn = document.getElementById('carousel-prev')
  const nextBtn = document.getElementById('carousel-next')

  if (!carouselSlides || !carouselIndicators || !prevBtn || !nextBtn) {
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
    <div class="carousel-slide ${index === 0 ? 'active' : ''} absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}" data-slide="${index}">
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
            <button class="btn btn-primary btn-lg">
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    })
    .join('')

  // Build indicators HTML
  const indicatorsHTML = featuredProducts
    .map(
      (_, index) => `
    <button
      class="carousel-indicator w-3 h-3 rounded-full transition-all duration-300 ${index === 0 ? 'bg-pink-600 w-8' : 'bg-gray-400'}"
      data-slide-to="${index}"
      aria-label="Ir a slide ${index + 1}"
      role="tab"
    ></button>
  `
    )
    .join('')

  // Inject HTML
  carouselSlides.innerHTML = slidesHTML
  carouselIndicators.innerHTML = indicatorsHTML

  // Get all slides and indicators
  const slides = carouselSlides.querySelectorAll('.carousel-slide')
  const indicators = carouselIndicators.querySelectorAll('.carousel-indicator')

  // Function to show specific slide
  function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
      slide.classList.remove('opacity-100')
      slide.classList.add('opacity-0')
    })

    // Reset all indicators
    indicators.forEach(indicator => {
      indicator.classList.remove('bg-pink-600', 'w-8')
      indicator.classList.add('bg-gray-400')
    })

    // Show current slide
    slides[index].classList.remove('opacity-0')
    slides[index].classList.add('opacity-100')

    // Highlight current indicator
    indicators[index].classList.remove('bg-gray-400')
    indicators[index].classList.add('bg-pink-600', 'w-8')

    currentSlide = index
  }

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

  // Event listeners
  prevBtn.addEventListener('click', prevSlide)
  nextBtn.addEventListener('click', nextSlide)

  // Indicator click events
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => showSlide(index))
  })

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

  // Auto-advance carousel every 5 seconds
  // Use requestAnimationFrame for better performance
  let lastTime = 0
  const autoAdvance = timestamp => {
    if (!lastTime) {
      lastTime = timestamp
    }
    const elapsed = timestamp - lastTime

    if (elapsed >= 5000) {
      nextSlide()
      lastTime = timestamp
    }

    requestAnimationFrame(autoAdvance)
  }

  // Start auto-advance only when page is visible
  if ('IntersectionObserver' in window) {
    const carouselObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(autoAdvance)
          } else {
            lastTime = 0 // Pause when not visible
          }
        })
      },
      { threshold: 0.1 }
    )

    const carouselElement = document.getElementById('featuredCarousel')
    if (carouselElement) {
      carouselObserver.observe(carouselElement)
    }
  } else {
    // Fallback for older browsers
    setInterval(nextSlide, 5000)
  }
}

/**
 * Initialize Featured Products Grid
 */
let currentPage = 1
const PRODUCTS_PER_PAGE = 16 // 4x4 grid
let pullToRefreshInstance = null

async function initProductsGrid() {
  // Load occasions first, then products
  await loadOccasionsFilter()
  await loadProducts(currentPage)

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
    console.log('🔍 [DEBUG] API Base URL:', 'http://localhost:3000')

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

    // Render products
    productsContainer.innerHTML = result.data
      .map(product => {
        const price = product.price_usd || 0
        const description = product.summary || product.description || 'Hermoso arreglo floral'

        return `
          <div class="product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div class="relative aspect-square bg-gray-100" data-carousel-container data-product-id="${product.id}">
              <!-- Carousel will be initialized here -->
            </div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-2">${product.name}</h3>
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                ${description}
              </p>
              <div class="mt-4 space-y-3">
                <!-- Price centered -->
                <div class="text-center">
                  <span class="text-2xl font-bold text-pink-600">$${price.toFixed(2)}</span>
                </div>
                <!-- Icons centered below price -->
                <div class="flex items-center justify-center gap-1">
                  <button
                    class="quick-view-btn bg-gray-300 hover:bg-gray-400 text-gray-900 p-2 rounded-full shadow-md transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    type="button"
                    aria-label="Vista rápida"
                    data-product-id="${product.id}"
                    data-action="quick-view"
                    title="Vista rápida"
                  >
                    <i data-lucide="eye" class="h-4 w-4" style="stroke: #111827; stroke-width: 2.5;"></i>
                  </button>
                  <button
                    class="add-to-cart-btn bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-full text-sm font-semibold shadow-md transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    type="button"
                    aria-label="Agregar al carrito"
                    data-product-id="${product.id}"
                    data-action="add-to-cart"
                    title="Agregar al carrito"
                  >
                    <i data-lucide="shopping-cart" class="h-4 w-4" style="stroke: white; stroke-width: 2.5;"></i>
                  </button>
                  <button
                    class="buy-now-btn bg-green-600 hover:bg-green-700 text-white p-2 rounded-full text-sm font-semibold shadow-md transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    type="button"
                    aria-label="Comprar ahora"
                    data-product-id="${product.id}"
                    data-action="buy-now"
                    title="Comprar ahora"
                  >
                    <i data-lucide="zap" class="h-4 w-4" style="stroke: white; stroke-width: 2.5;"></i>
                  </button>
                </div>
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
 * Add click handlers for cart buttons (shopping cart icon)
 */
function addCartButtonHandlers() {
  const cartBtns = document.querySelectorAll('.add-to-cart-btn[data-action="add-to-cart"]')

  cartBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault()
      const productId = parseInt(btn.getAttribute('data-product-id'), 10)

      if (!productId) {
        console.error('Add to cart: missing or invalid product ID')
        return
      }

      try {
        // Get product data from the button's parent card
        const productCard = btn.closest('.product-card')
        if (!productCard) {
          console.error('Add to cart: could not find product card')
          return
        }

        // Extract product data from the card
        const productName = productCard.querySelector('h3')?.textContent?.trim()
        const priceText = productCard.querySelector('.text-pink-600')?.textContent?.trim()
        const priceMatch = priceText?.match(/\$(\d+\.?\d*)/)
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0

        if (!productName || !price) {
          console.error('Add to cart: could not extract product data', { productName, priceText })
          return
        }

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price_usd: price,
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
      } catch (error) {
        console.error('Failed to add product to cart:', error)
        // Could show error toast here
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
  const buyNowBtns = document.querySelectorAll('.buy-now-btn[data-action="buy-now"]')

  buyNowBtns.forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault()
      const productId = parseInt(btn.getAttribute('data-product-id'), 10)

      if (!productId) {
        console.error('Buy now: missing or invalid product ID')
        return
      }

      try {
        // Get product data from the button's parent card
        const productCard = btn.closest('.product-card')
        if (!productCard) {
          console.error('Buy now: could not find product card')
          return
        }

        // Extract product data from the card
        const productName = productCard.querySelector('h3')?.textContent?.trim()
        const priceText = productCard.querySelector('.text-pink-600')?.textContent?.trim()
        const priceMatch = priceText?.match(/\$(\d+\.?\d*)/)
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0

        if (!productName || !price) {
          console.error('Buy now: could not extract product data', { productName, priceText })
          return
        }

        // Create product object
        const product = {
          id: productId,
          name: productName,
          price_usd: price,
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
