/**
 * FloresYa - Index Page (ES6 Module)
 * Mobile menu toggle and UI interactions for index.html
 */

import { onDOMReady } from './js/shared/dom-ready.js'
import { createIcons } from './js/lucide-icons.js'
import { createImageCarousel } from './js/components/imageCarousel.js'
import {
  addToCart,
  initCartBadge,
  initCartEventListeners,
  initCartTouchFeedback
} from './js/shared/cart.js'
import { api } from './js/shared/api-client.js'
import { initMobileNav } from './js/components/mobileNav.js'
import { initHamburgerMenu } from './js/components/hamburgerMenu.js'
import { PullToRefresh } from './js/components/pullToRefresh.js'
import { TouchFeedback } from './js/shared/touchFeedback.js'

/**
 * Initialize mobile navigation drawer with hamburger menu
 * Uses the new MobileNav and HamburgerMenu components
 */
function initMobileNavigation() {
  try {
    // Initialize the mobile navigation drawer
    const mobileNav = initMobileNav({
      menuBtnSelector: '#mobile-menu-btn',
      menuSelector: '#mobile-menu',
      drawerId: 'mobile-nav-drawer',
      overlayId: 'mobile-nav-overlay',
      animationDuration: 250
    })

    // Initialize the hamburger menu button
    const hamburgerMenu = initHamburgerMenu({
      containerSelector: '.nav-actions',
      buttonId: 'hamburger-menu-btn',
      animationDuration: 250,
      activeClass: 'hamburger-active',
      onToggle: isOpen => {
        // Sync hamburger menu state with mobile navigation
        if (isOpen) {
          mobileNav.open()
        } else {
          mobileNav.close()
        }
      }
    })

    // Store references for potential later use
    window.mobileNavInstance = mobileNav
    window.hamburgerMenuInstance = hamburgerMenu

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
    console.log('🔍 [DEBUG] API Base URL:', 'http://localhost:3000')

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
      name: error.name
    })
    carouselSlides.innerHTML = `
      <div class="text-center text-red-500 p-8">
        <p class="text-lg">Error al cargar productos destacados</p>
        <p class="text-sm mt-2">${error.message}</p>
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
              loading="lazy"
              decoding="async"
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
function initPullToRefresh() {
  const productsContainer = document.getElementById('productos')

  if (!productsContainer) {
    console.warn('PullToRefresh: Products container not found')
    return
  }

  try {
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
        await createImageCarousel(container, productId)
      }
    })

    // Reinitialize icons for cart buttons
    createIcons()

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

  // Reinitialize icons for pagination buttons
  createIcons()
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
function initProductCardTouchFeedback() {
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
    const feedback = new TouchFeedback({
      type: 'highlight',
      haptic: 'none',
      duration: 200
    })
    feedback.init(searchInput)
  }

  const occasionFilter = document.getElementById('occasionFilter')
  if (occasionFilter) {
    const feedback = new TouchFeedback({
      type: 'highlight',
      haptic: 'light',
      duration: 200
    })
    feedback.init(occasionFilter)
  }

  const sortFilter = document.getElementById('sortFilter')
  if (sortFilter) {
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
function init() {
  try {
    console.log('🚀 [index.js] Starting initialization...')

    // Initialize Lucide icons
    createIcons()
    console.log('✅ [index.js] Icons initialized')

    // Initialize cart functionality
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
    console.log('✅ [index.js] Page fully initialized')
  } catch (error) {
    console.error('❌ [index.js] Initialization failed:', error)
    throw error
  }
}

// Run on DOM ready using the safe utility
onDOMReady(init)
