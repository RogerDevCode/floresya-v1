/**
 * FloresYa - Index Page (ES6 Module)
 * Mobile menu toggle and UI interactions for index.html
 */

import { createIcons } from './js/lucide-icons.js'
import { createImageCarousel } from './js/components/imageCarousel.js'
import { addToCart, initCartBadge, initCartEventListeners } from './js/shared/cart.js'

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuBtn || !mobileMenu) {
    return
  }

  menuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden')
    menuBtn.setAttribute('aria-expanded', !isHidden)
  })

  // Close mobile menu on link click
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link')
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden')
      menuBtn.setAttribute('aria-expanded', 'false')
    })
  })
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
    const response = await fetch('/api/products/carousel')
    const result = await response.json()

    console.info('🎠 Carousel API Response:', {
      success: result.success,
      totalProducts: result.data?.length || 0,
      products: result.data
    })

    if (result.success && result.data && result.data.length > 0) {
      // Filter: Only products WITH images (exclude products without image_url_small)
      featuredProducts = result.data.filter(p => p.image_url_small)

      console.info(
        '🖼️ Product Images:',
        featuredProducts.map(p => ({
          id: p.id,
          name: p.name,
          image_url_small: p.image_url_small,
          hasImage: !!p.image_url_small
        }))
      )

      if (featuredProducts.length === 0) {
        throw new Error('No carousel products with images found')
      }
    } else {
      throw new Error('No carousel products found')
    }
  } catch (error) {
    console.error('❌ Failed to load carousel products:', error)
    carouselSlides.innerHTML = `
      <div class="text-center text-red-500 p-8">
        <p class="text-lg">Error al cargar productos destacados</p>
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
  setInterval(nextSlide, 5000)
}

/**
 * Initialize Featured Products Grid
 */
let currentPage = 1
const PRODUCTS_PER_PAGE = 16 // 4x4 grid

async function initProductsGrid() {
  // Load occasions first, then products
  await loadOccasionsFilter()
  await loadProducts(currentPage)

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
 * Load occasions from API and populate filter dropdown
 */
async function loadOccasionsFilter() {
  const occasionFilter = document.getElementById('occasionFilter')
  if (!occasionFilter) {
    return
  }

  try {
    const response = await fetch('/api/occasions')
    const result = await response.json()

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
    // Build query params
    const offset = (page - 1) * PRODUCTS_PER_PAGE
    const searchInput = document.getElementById('searchInput')
    const occasionFilter = document.getElementById('occasionFilter')
    const sortFilter = document.getElementById('sortFilter')

    let url = `/api/products?limit=${PRODUCTS_PER_PAGE}&offset=${offset}`

    if (searchInput?.value) {
      url += `&search=${encodeURIComponent(searchInput.value)}`
    }

    if (occasionFilter?.value) {
      url += `&occasion=${encodeURIComponent(occasionFilter.value)}`
    }

    if (sortFilter?.value) {
      url += `&sortBy=${sortFilter.value}`
    }

    const response = await fetch(url)
    const result = await response.json()

    console.info('📦 Products API Response:', {
      success: result.success,
      totalProducts: result.data?.length || 0,
      page: page
    })

    if (!result.success || !result.data || result.data.length === 0) {
      productsContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-gray-500 text-lg">No se encontraron productos</p>
        </div>
      `
      return
    }

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
              <div class="flex items-center justify-between mt-4">
                <span class="text-2xl font-bold text-pink-600">$${price.toFixed(2)}</span>
                <div class="flex items-center gap-1 pr-1">
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

        // Visual feedback
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

        // Visual feedback
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
 * Initialize page
 */
function init() {
  // Initialize Lucide icons
  createIcons()

  // Initialize cart functionality
  initCartBadge()
  initCartEventListeners()

  // Initialize features
  initMobileMenu()
  initSmoothScroll()
  initCarousel()
  initProductsGrid()

  // Mark page as loaded
  document.documentElement.classList.add('loaded')
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init)
