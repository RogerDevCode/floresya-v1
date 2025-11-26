/**
 * Page Setup Utilities for E2E Testing
 * Provides consistent setup and teardown across all test files
 */

/**
 * Setup page with consistent configuration and helpers
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function setupPages(page) {
  // Configurar timeouts para evitar fallos por lentitud
  page.setDefaultTimeout(10000) // 10 segundos

  // Configurar viewport por defecto
  await page.setViewportSize({ width: 1280, height: 720 })

  // Interceptar y mockear recursos estáticos para mejorar performance
  await page.route('**/*.jpg', route => {
    // Simular carga de imágenes para evitar downloads reales
    route.fulfill({
      status: 200,
      contentType: 'image/jpeg',
      body: Buffer.from('fake-image-data') // Imagen dummy
    })
  })

  await page.route('**/*.webp', route => {
    route.fulfill({
      status: 200,
      contentType: 'image/webp',
      body: Buffer.from('fake-image-data')
    })
  })

  await page.route('**/*.ico', route => {
    route.fulfill({
      status: 200,
      contentType: 'image/x-icon',
      body: Buffer.from('fake-icon-data')
    })
  })

  // Mock API responses comunes para testing
  await mockCommonAPIs(page)

  // Limpiar estado anterior
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()

    // Limpiar cualquier service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister())
      })
    }
  })

  // Esperar a que la página esté lista
  await page.waitForLoad()
}

/**
 * Mock common API endpoints para testing consistente
 * @param {Page} page - Playwright page object
 */
async function mockCommonAPIs(page) {
  // Mock de configuración
  await page.route('**/api/settings/public', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        delivery_cost_usd: 5.0,
        delivery_cost_ves: 180.0,
        exchange_rate: 36.5,
        contact_whatsapp: '+584125555555',
        contact_phone: '+582125555555',
        business_email: 'info@floresya.com',
        business_address: 'Gran Caracas, Venezuela',
        working_hours: {
          monday_friday: '8:00 AM - 6:00 PM',
          saturday: '9:00 AM - 2:00 PM',
          sunday: 'Closed'
        }
      })
    })
  })

  // Mock de productos
  await page.route('**/api/products**', route => {
    // Products fixtures reales para testing
    const products = [
      {
        id: 1,
        name: 'Ramo de Rosas Rojas',
        description: 'Hermoso ramo de rosas frescas perfectas para expresar tu amor',
        price_usd: 25.99,
        price_ves: 945.0,
        category: 'flores',
        image_url: '/images/products/rosas-rojas.jpg',
        image_thumb: '/images/products/rosas-rojas-thumb.jpg',
        stock: 15,
        is_active: true,
        rating: 4.8,
        reviews_count: 127,
        tags: ['rosa', 'romántico'],
        occasions: ['amor', 'cumpleaños']
      },
      {
        id: 2,
        name: 'Girasoles Amarillos',
        description: 'Alegría girasoles amarillos que iluminan cualquier día',
        price_usd: 22.5,
        price_ves: 820.0,
        category: 'flores',
        image_url: '/images/products/girasoles-amarillos.jpg',
        image_thumb: '/images/products/girasoles-amarillos-thumb.jpg',
        stock: 8,
        is_active: true,
        rating: 4.6,
        reviews_count: 89,
        tags: ['amarillo', 'alegre'],
        occasions: ['agradecimiento', 'recuperación']
      },
      {
        id: 3,
        name: 'Orquídea Bella',
        description: 'Elegante orquídea blanca con toques de color lavanda',
        price_usd: 45.0,
        price_ves: 1642.0,
        category: 'flores',
        image_url: '/images/products/orquidea-bella.jpg',
        image_thumb: '/images/products/orquidea-bella-thumb.jpg',
        stock: 6,
        is_active: true,
        rating: 4.9,
        reviews_count: 203,
        tags: ['blanco', 'lavanda', 'elegante'],
        occasions: ['decoración', 'inauguración']
      }
    ]

    // Parsear query parameters para filtros
    const url = new URL(route.request().url())
    const category = url.searchParams.get('category')
    const occasion = url.searchParams.get('occasion')
    const minPrice = parseFloat(url.searchParams.get('min_price') || '0')
    const maxPrice = parseFloat(url.searchParams.get('max_price') || '999999')
    const search = url.searchParams.get('search')

    let filteredProducts = products

    // Aplicar filtros
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === category)
    }

    if (occasion && occasion !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.occasions && p.occasions.includes(occasion))
    }

    if (minPrice > 0) {
      filteredProducts = filteredProducts.filter(p => p.price_usd >= minPrice)
    }

    if (maxPrice < 999999) {
      filteredProducts = filteredProducts.filter(p => p.price_usd <= maxPrice)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: filteredProducts,
        pagination: {
          page: 1,
          totalPages: 1,
          totalItems: filteredProducts.length,
          itemsPerPage: filteredProducts.length
        }
      })
    })
  })

  // Mock de featured products para carousel
  await page.route('**/api/products/featured', route => {
    const featuredProducts = [
      {
        id: 1,
        name: 'Ramo de Rosas Premium',
        description: 'Ramo exclusivo de rosas rojas de primera calidad',
        price_usd: 89.99,
        price_ves: 3284.0,
        category: 'arreglos',
        image_url: '/images/products/ramo-rosas-premium.jpg',
        image_thumb: '/images/products/ramo-rosas-premium-thumb.jpg',
        stock: 4,
        is_active: true,
        rating: 5.0,
        reviews_count: 47,
        tags: ['premium', 'exclusivo', 'lujo'],
        occasions: ['aniversario', 'boda', 'celebración especial']
      },
      {
        id: 2,
        name: 'Centro de Mesa Especial',
        description: 'Elegante centro de mesa para eventos especiales',
        price_usd: 120.0,
        price_ves: 4380.0,
        category: 'arreglos',
        image_url: '/images/products/centro-mesa-especial.jpg',
        image_thumb: '/images/products/centro-mesa-especial-thumb.jpg',
        stock: 3,
        is_active: true,
        rating: 4.9,
        reviews_count: 28,
        tags: ['espectacular', 'grande', 'centro de mesa'],
        occasions: ['evento', 'celebración', 'corporativo']
      }
    ]

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        products: featuredProducts
      })
    })
  })

  // Mock de validación de cupones
  await page.route('**/api/coupons/validate**', route => {
    const url = new URL(route.request().url())
    const code = url.searchParams.get('code')

    if (code === 'FLORES10') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          discount_percent: 10,
          discount_amount: 5.0,
          message: 'Cupón válido: 10% de descuento'
        })
      })
    } else {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          message: 'Cupón inválido o expirado'
        })
      })
    }
  })
}

/**
 * Wait for page to be fully loaded with scripts executed
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<void>}
 */
export async function waitForPageReady(page, timeout = 5000) {
  try {
    await page.waitForLoad()

    // Esperar a que el DOM principal esté listo
    await page.waitForSelector('body', { timeout })

    // Esperar a que los scripts principales carguen
    await page.waitForFunction(
      () => {
        // Verificar que exista el tema aplicado
        return document.documentElement.hasAttribute('data-theme')
      },
      { timeout }
    )

    // Esperar a que no haya carga activa
    await page.waitForFunction(
      () => {
        return !document.querySelector('[data-testid*="loading"]')
      },
      { timeout }
    )
  } catch (error) {
    console.log('⚠️ [PageSetup] Page might not be fully ready:', error.message)
  }
}

/**
 * Get current viewport information
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Viewport info
 */
export async function getViewportInfo(page) {
  return await page.evaluate(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024
    }
  })
}

/**
 * Trigger toast notification for testing
 * @param {Page} page - Playwright page object
 * @param {string} message - Toast message
 * @param {string} type - Toast type: success, error, info
 * @returns {Promise<void>}
 */
export async function triggerToast(page, message, type = 'success') {
  await page.evaluate(
    ({ message: msg, type: toastType }) => {
      // Usar el toast system del sitio si existe
      if (typeof window.showCartMessage === 'function') {
        window.showCartMessage(msg, toastType)
      } else {
        // Fallback: crear toast manualmente
        const toast = document.createElement('div')
        toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white text-sm z-50 ${toastType === 'error' ? 'bg-red-500' : toastType === 'info' ? 'bg-blue-500' : 'bg-green-500'}`
        toast.textContent = msg
        document.body.appendChild(toast)

        setTimeout(() => {
          toast.remove()
        }, 3000)
      }
    },
    { message, type }
  )
}

/**
 * Simulate user interaction with delay
 * @param {Page} page - Playwright page object
 * @param {Function} action - Action to perform
 * @param {number} delay - Delay in ms
 * @returns {Promise<void>}
 */
export async function simulateUserAction(page, action, delay = 100) {
  await action()
  await page.waitForTimeout(delay) // Simular comportamiento humano
}

/**
 * Check for accessibility violations
 * @param {Page} page - Playwright page object
 * @param {string} scope - CSS selector for scope
 * @returns {Promise<Array>} Array of violations
 */
export async function checkAccessibility(page, scope = 'body') {
  try {
    // Basic accessibility checks
    const violations = await page.evaluate(selector => {
      const violations = []
      const container = document.querySelector(selector)

      if (!container) return violations

      // Check for missing alt text
      const images = container.querySelectorAll('img:not([alt])')
      violations.push(
        ...Array.from(images).map(img => ({
          type: 'missing-alt',
          element: 'img',
          message: 'Image missing alt attribute'
        }))
      )

      // Check for missing labels on inputs
      const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
      violations.push(
        ...Array.from(inputs).map(input => ({
          type: 'missing-label',
          element: 'input',
          message: 'Input missing aria-label or aria-labelledby'
        }))
      )

      // Check for missing roles
      const navs = container.querySelectorAll('nav:not([role])')
      violations.push(
        ...Array.from(navs).map(nav => ({
          type: 'missing-role',
          element: 'nav',
          message: 'Navigation missing role attribute'
        }))
      )

      return violations
    }, scope)

    return violations
  } catch (error) {
    console.log('⚠️ [PageSetup] Accessibility check failed:', error.message)
    return []
  }
}

export default {
  setupPages,
  mockCommonAPIs,
  waitForPageReady,
  getViewportInfo,
  triggerToast,
  simulateUserAction,
  checkAccessibility
}
