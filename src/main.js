/**
 * FloresYa - Main Application Entry Point
 * Vanilla JavaScript E-commerce Platform
 */

import { ProductService } from './services/product.service.js'
import { CartService } from './services/cart.service.js'
import { Navbar } from './components/navbar.js'
import { Hero } from './components/hero.js'
import { ProductCard } from './components/product-card.js'
import { Cart } from './components/cart.js'
import { Modal } from './components/modal.js'
import { Footer } from './components/footer.js'

class FloresYaApp {
  constructor() {
    this.productService = new ProductService()
    this.cartService = new CartService()
    this.navbar = new Navbar()
    this.hero = new Hero()
    this.footer = new Footer()
    this.cartModal = new Modal('cartModal')

    this.currentPage = 1
    this.itemsPerPage = 8
    this.searchTerm = ''
    this.selectedOccasion = ''

    this.init()
  }

  async init() {
    console.log('🌸 FloresYa App iniciando...')

    try {
      this.renderApp()
      this.bindEvents()
      this.updateCartUI()
      this.initLucideIcons()

      console.log('✅ FloresYa App inicializada correctamente')
    } catch (error) {
      console.error('❌ Error inicializando app:', error)
      throw error
    }
  }

  renderApp() {
    const app = document.getElementById('app')
    if (!app) {
      console.error('Element #app not found')
      return
    }

    app.innerHTML = `
      ${this.navbar.render(this.cartService.getItemCount())}
      ${this.hero.render()}

      <!-- Occasions Filter -->
      <section id="productos" class="py-12 bg-white">
        <div class="container mx-auto px-4">
          <h2 class="text-4xl font-bold text-center text-forest-900 mb-8">
            Flores para Cada Ocasión
          </h2>

          <!-- Occasion Buttons -->
          <div class="flex flex-wrap justify-center gap-3 mb-12">
            <button onclick="window.app.filterByOccasion('')" class="btn-occasion active" data-occasion="">
              Todos
            </button>
            <button onclick="window.app.filterByOccasion('amor')" class="btn-occasion" data-occasion="amor">
              ❤️ Amor
            </button>
            <button onclick="window.app.filterByOccasion('cumpleanos')" class="btn-occasion" data-occasion="cumpleanos">
              🎂 Cumpleaños
            </button>
            <button onclick="window.app.filterByOccasion('madre')" class="btn-occasion" data-occasion="madre">
              👩 Madre
            </button>
            <button onclick="window.app.filterByOccasion('aniversario')" class="btn-occasion" data-occasion="aniversario">
              💍 Aniversario
            </button>
            <button onclick="window.app.filterByOccasion('graduacion')" class="btn-occasion" data-occasion="graduacion">
              🎓 Graduación
            </button>
          </div>

          <!-- Search Bar -->
          <div class="max-w-2xl mx-auto mb-8">
            <div class="relative">
              <input
                type="text"
                id="searchInput"
                placeholder="Buscar flores..."
                class="w-full px-6 py-4 rounded-full border-2 border-blush-200 focus:border-coral-500 focus:outline-none text-lg">
              <i data-lucide="search" class="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-forest-400"></i>
            </div>
          </div>

          <!-- Products Grid -->
          <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <!-- Products will be rendered here -->
          </div>

          <!-- Pagination -->
          <div id="pagination" class="flex justify-center gap-2 mt-12">
            <!-- Pagination buttons will be rendered here -->
          </div>
        </div>
      </section>

      <!-- Featured Section -->
      <section class="py-16 bg-gradient-to-br from-blush-50 to-sunshine-50">
        <div class="container mx-auto px-4">
          <h2 class="text-4xl font-bold text-center text-forest-900 mb-12">
            Nuestros Favoritos ⭐
          </h2>
          <div id="featuredGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Featured products will be rendered here -->
          </div>
        </div>
      </section>

      ${this.footer.render()}

      <!-- Cart Modal -->
      ${this.cartModal.render('🛒 Tu Carrito', '<div id="cartContent">Loading...</div>')}

      <!-- Success Notification -->
      <div id="successNotification" class="fixed top-20 right-4 bg-forest-500 text-white p-4 rounded-xl shadow-lg hidden z-50 animate-slide-in">
        <div class="flex items-center">
          <i data-lucide="check-circle" class="h-6 w-6 mr-3"></i>
          <span id="successMessage">¡Producto agregado al carrito!</span>
        </div>
      </div>
    `

    this.renderProducts()
    this.renderFeaturedProducts()
  }

  async renderProducts() {
    const productsGrid = document.getElementById('productsGrid')
    if (!productsGrid) {
      return
    }

    let products = await this.productService.getAll()

    if (this.searchTerm) {
      products = this.productService.search(this.searchTerm)
    }

    if (this.selectedOccasion) {
      products = this.productService.filterByOccasion(this.selectedOccasion)
    }

    const paginated = this.paginateProducts(products)
    productsGrid.innerHTML = ProductCard.renderGrid(paginated)

    this.renderPagination(products.length)
    this.initLucideIcons()
  }

  async renderFeaturedProducts() {
    const featuredGrid = document.getElementById('featuredGrid')
    if (!featuredGrid) {
      return
    }

    const featured = this.productService.getFeatured().slice(0, 6)
    featuredGrid.innerHTML = ProductCard.renderGrid(featured)
    this.initLucideIcons()
  }

  paginateProducts(products) {
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    return products.slice(start, end)
  }

  renderPagination(totalProducts) {
    const pagination = document.getElementById('pagination')
    if (!pagination) {
      return
    }

    const totalPages = Math.ceil(totalProducts / this.itemsPerPage)
    if (totalPages <= 1) {
      pagination.innerHTML = ''
      return
    }

    let html = ''
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === this.currentPage ? 'bg-coral-500 text-white' : 'bg-white text-forest-700 hover:bg-blush-100'
      html += `
        <button onclick="window.app.goToPage(${i})"
                class="${activeClass} px-4 py-2 rounded-lg font-medium transition-colors">
          ${i}
        </button>
      `
    }

    pagination.innerHTML = html
  }

  bindEvents() {
    this.navbar.bindEvents()
    this.cartModal.bindEvents()

    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value
        this.currentPage = 1
        this.renderProducts()
      })
    }

    const cartBtn = document.getElementById('cartBtn')
    if (cartBtn) {
      cartBtn.addEventListener('click', () => this.openCart())
    }

    const loginBtn = document.getElementById('loginBtn')
    if (loginBtn) {
      loginBtn.addEventListener('click', () => this.showLoginModal())
    }
  }

  filterByOccasion(occasion) {
    this.selectedOccasion = occasion
    this.currentPage = 1
    this.renderProducts()

    document.querySelectorAll('.btn-occasion').forEach(btn => {
      btn.classList.remove('active')
      if (btn.dataset.occasion === occasion) {
        btn.classList.add('active')
      }
    })
  }

  goToPage(page) {
    this.currentPage = page
    this.renderProducts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  addToCart(productId) {
    try {
      const product = this.productService.getById(productId)
      if (!product) {
        throw new Error(`Product ${productId} not found`)
      }

      this.cartService.addToCart(product)
      this.updateCartUI()
      this.showNotification(`${product.name} agregado al carrito`)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      this.showNotification('Error al agregar producto', 'error')
    }
  }

  updateCartQuantity(productId, quantity) {
    try {
      this.cartService.updateQuantity(productId, quantity)
      this.updateCartUI()
      this.renderCartContent()
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  removeFromCart(productId) {
    try {
      this.cartService.removeFromCart(productId)
      this.updateCartUI()
      this.renderCartContent()
      this.showNotification('Producto eliminado del carrito')
    } catch (error) {
      console.error('Failed to remove from cart:', error)
    }
  }

  openCart() {
    this.renderCartContent()
    this.cartModal.open()
    this.initLucideIcons()
  }

  renderCartContent() {
    const cartContent = document.getElementById('cartContent')
    if (!cartContent) {
      return
    }

    const cart = this.cartService.getCart()
    cartContent.innerHTML = Cart.renderContent(cart.items, cart.total)
    this.initLucideIcons()
  }

  updateCartUI() {
    const count = this.cartService.getItemCount()
    this.navbar.updateCartCount(count)
  }

  checkout() {
    const cart = this.cartService.getCart()
    if (cart.items.length === 0) {
      this.showNotification('El carrito está vacío', 'error')
      return
    }

    this.showNotification('Función de pago próximamente...', 'info')
    console.log('Checkout:', cart)
  }

  showNotification(message, _type = 'success') {
    const notification = document.getElementById('successNotification')
    const messageEl = document.getElementById('successMessage')

    if (notification && messageEl) {
      messageEl.textContent = message
      notification.classList.remove('hidden')

      setTimeout(() => {
        notification.classList.add('hidden')
      }, 3000)
    }
  }

  showLoginModal() {
    this.showNotification('Función de login próximamente...', 'info')
  }

  initLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }
}

// Global functions for inline event handlers
window.scrollToProducts = function() {
  document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })
}

window.showSpecialSection = function() {
  console.log('Special section coming soon...')
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FloresYaApp()
  window.cartModal = window.app.cartModal
})

export default FloresYaApp