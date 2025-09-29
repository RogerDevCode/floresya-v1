/**
 * Navbar Component
 * @typedef {import('../types/index.js')} Types
 */

export class Navbar {
  constructor() {
    this.mobileMenuOpen = false
  }

  render(cartCount = 0) {
    return `
      <nav class="navbar-floral fixed w-full top-0 z-50 py-4">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center floating-heart">
                <i data-lucide="flower" class="h-6 w-6 text-white"></i>
              </div>
              <span class="text-2xl font-bold text-forest-800">FloresYa</span>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-6">
              <a href="#productos" class="text-forest-700 hover:text-coral-500 font-medium transition-colors">Productos</a>
              <a href="#servicios" class="text-forest-700 hover:text-coral-500 font-medium transition-colors">Servicios</a>
              <a href="#contacto" class="text-forest-700 hover:text-coral-500 font-medium transition-colors">Contacto</a>

              <!-- Cart Button -->
              <button id="cartBtn" class="relative p-2 text-forest-700 hover:text-coral-500 transition-colors">
                <i data-lucide="shopping-bag" class="h-6 w-6"></i>
                <span id="cartCount" class="absolute -top-1 -right-1 bg-coral-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center pulse-coral">${cartCount}</span>
              </button>

              <!-- Login Button -->
              <button id="loginBtn" class="btn-floral">
                <i data-lucide="user" class="h-4 w-4 mr-2"></i>
                Iniciar Sesión
              </button>
            </div>

            <!-- Mobile Menu Button -->
            <button id="mobileMenuBtn" class="md:hidden p-2 text-forest-700">
              <i data-lucide="menu" class="h-6 w-6"></i>
            </button>
          </div>

          <!-- Mobile Menu -->
          <div id="mobileMenu" class="md:hidden hidden mt-4 pb-4 border-t border-blush-200">
            <div class="flex flex-col space-y-3 pt-4">
              <a href="#productos" class="text-forest-700 hover:text-coral-500 font-medium">Productos</a>
              <a href="#servicios" class="text-forest-700 hover:text-coral-500 font-medium">Servicios</a>
              <a href="#contacto" class="text-forest-700 hover:text-coral-500 font-medium">Contacto</a>
              <button class="btn-floral w-full mt-4">Iniciar Sesión</button>
            </div>
          </div>
        </div>
      </nav>
    `
  }

  bindEvents() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn')
    const mobileMenu = document.getElementById('mobileMenu')

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        this.mobileMenuOpen = !this.mobileMenuOpen
        mobileMenu.classList.toggle('hidden')
      })
    }
  }

  updateCartCount(count) {
    const cartCountEl = document.getElementById('cartCount')
    if (cartCountEl) {
      cartCountEl.textContent = count
    }
  }
}